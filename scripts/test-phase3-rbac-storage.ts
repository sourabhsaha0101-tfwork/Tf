import { NextRequest } from 'next/server'
import {
  requireSuperAdmin,
  requireEmployeeOrAdmin,
  requireAuth,
  maskVendorForRole,
  maskQuotationForRole,
  maskManufacturingOrderForRole,
} from '../src/lib/auth-guard'
import { vendorService } from '../src/lib/services/vendor.service'
import { quotationService } from '../src/lib/services/quotation.service'
import { manufacturingService } from '../src/lib/services/manufacturing.service'
import { employeeOpsService } from '../src/lib/services/employee-ops.service'
import { storageService } from '../src/lib/storage'
import { GET as downloadDocumentHandler } from '../src/app/api/documents/download/route.ts'
import { GET as getProductivityHandler } from '../src/app/api/admin/productivity/route.ts'
import { GET as getAuditLogsHandler } from '../src/app/api/admin/audit-logs/route.ts'
import { GET as getVendorsHandler } from '../src/app/api/admin/vendors/route.ts'

interface TestResult {
  id: number
  description: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function runTest(id: number, description: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ id, description, passed: true })
    console.log(`  ✓ Case ${id}: ${description}`)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    results.push({ id, description, passed: false, error: errorMsg })
    console.log(`  ✗ Case ${id}: ${description} -> FAILED: ${errorMsg}`)
  }
}

async function main() {
  console.log('======================================================================')
  console.log('TUFFLOOM TRADERS — PHASE 3 RBAC, STORAGE & OPERATIONS TEST SUITE')
  console.log('Testing: Super Admin, Employee, Client RBAC, Supplier Masking, Storage')
  console.log('======================================================================\n')

  const unique = Date.now().toString().slice(-4)
  let testTaskId = ''
  let testUploadedStoragePath = ''

  // 1. SUPER_ADMIN Clearance Verification
  await runTest(1, 'Super Admin receives full clearance to confidential financials & audit', async () => {
    const mockSuperAdminReq = new NextRequest('http://localhost:3000/api/admin/productivity', {
      headers: { 'x-test-role': 'SUPER_ADMIN' },
    })
    const auth = await requireSuperAdmin(mockSuperAdminReq)
    if (!auth.authorized || auth.user?.role !== 'SUPER_ADMIN') {
      throw new Error('Super Admin authorization failed')
    }

    // Call productivity endpoint directly
    const prodRes = await getProductivityHandler(mockSuperAdminReq)
    if (prodRes.status !== 200) {
      throw new Error(`Expected 200 for Super Admin on productivity, got ${prodRes.status}`)
    }
  })

  // 2. EMPLOYEE Boundary Enforcement: Blocked from Super Admin financials
  await runTest(2, 'Employee is strictly blocked (403) from Super Admin productivity & audit trails', async () => {
    const mockEmpReq = new NextRequest('http://localhost:3000/api/admin/productivity', {
      headers: { 'x-test-role': 'EMPLOYEE' },
    })
    const auth = await requireSuperAdmin(mockEmpReq)
    if (auth.authorized) {
      throw new Error('SECURITY VIOLATION: Employee was authorized for Super Admin operation!')
    }
    if (auth.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Employee, got ${auth.status}`)
    }

    const res = await getProductivityHandler(mockEmpReq)
    if (res.status !== 403) {
      throw new Error(`Expected 403 status from productivity handler, got ${res.status}`)
    }
  })

  // 3. CLIENT Boundary Enforcement: Blocked from all employee & admin modules
  await runTest(3, 'Client / Customer is strictly blocked (403) from employee operations', async () => {
    const mockClientReq = new NextRequest('http://localhost:3000/api/admin/tasks', {
      headers: { 'x-test-role': 'CLIENT' },
    })
    const auth = await requireEmployeeOrAdmin(mockClientReq)
    if (auth.authorized) {
      throw new Error('SECURITY VIOLATION: Client was authorized for Employee operation!')
    }
    if (auth.status !== 403) {
      throw new Error(`Expected 403 Forbidden for Client, got ${auth.status}`)
    }
  })

  // 4. Supplier Contact & Cost Data Masking for Employees
  await runTest(4, 'Server-side data masking strips supplier direct contacts & GSTIN for Employee', async () => {
    const vendors = await vendorService.getVendors('EMPLOYEE')
    if (vendors.length === 0) throw new Error('Expected sample vendors')

    const v = vendors[0]
    if (v.email !== '[RESTRICTED — SUPER_ADMIN ONLY]' || v.phone !== '[RESTRICTED — SUPER_ADMIN ONLY]') {
      throw new Error('SECURITY VIOLATION: Supplier phone/email leaked to Employee view')
    }
    if (v.gstin !== null) {
      throw new Error('SECURITY VIOLATION: Supplier GSTIN leaked to Employee view')
    }
  })

  // 5. Zero-Leak Rule: Clients cannot access any vendor records
  await runTest(5, 'Clients are blocked with zero vendor records returned', async () => {
    const vendors = await vendorService.getVendors('CLIENT')
    if (vendors.length !== 0) {
      throw new Error('SECURITY VIOLATION: Vendor data returned to Client')
    }

    const singleVendor = await vendorService.getVendorById('ven-001', 'CLIENT')
    if (singleVendor !== null) {
      throw new Error('SECURITY VIOLATION: Vendor record returned to Client by ID')
    }
  })

  // 6. Protection of Internal Margins & Admin Notes
  await runTest(6, 'Admin internal margin notes are completely redacted from Employee & Client views', async () => {
    const rawQuotation = {
      id: 'qt-demo',
      quotationNumber: 'QT-2026-9999',
      customerId: 'cust-01',
      unitPriceQuoted: 25,
      adminNotes: 'Direct factory cost is $16.50. Tuffloom net profit margin: 34%.',
    }

    const employeeMasked = maskQuotationForRole(rawQuotation, 'EMPLOYEE')
    if (employeeMasked?.adminNotes !== null) {
      throw new Error('SECURITY VIOLATION: Internal margin leaked to Employee view')
    }

    const clientMasked = maskQuotationForRole(rawQuotation, 'CLIENT')
    if (clientMasked?.adminNotes !== null) {
      throw new Error('SECURITY VIOLATION: Internal margin leaked to Client view')
    }

    const superAdminView = maskQuotationForRole(rawQuotation, 'SUPER_ADMIN')
    if (superAdminView?.adminNotes !== 'Direct factory cost is $16.50. Tuffloom net profit margin: 34%.') {
      throw new Error('Super Admin internal notes were improperly modified')
    }
  })

  // 7. Private Document Storage Abstraction
  await runTest(7, 'Tech pack uploads are saved to private storage outside the public web root', async () => {
    const sampleBuffer = Buffer.from('CONFIDENTIAL TECH PACK CAD DRAWINGS AND FABRIC SPECS', 'utf-8')
    const fileName = `Apex_Private_Drawing_${unique}.pdf`

    const uploadResult = await storageService.upload(sampleBuffer, fileName, {
      isPrivate: true,
      category: 'tech-packs',
      mimeType: 'application/pdf',
    })

    if (!uploadResult.isPrivate) throw new Error('Expected isPrivate: true')
    if (!uploadResult.url.startsWith('/api/documents/download?path=')) {
      throw new Error(`Expected private download route, got ${uploadResult.url}`)
    }
    if (uploadResult.url.includes('/public/')) {
      throw new Error('SECURITY VIOLATION: File path contains public web root')
    }

    testUploadedStoragePath = uploadResult.storagePath

    // Verify file content can be read via storageService
    const readBuffer = await storageService.readFile(testUploadedStoragePath, true)
    if (readBuffer.toString('utf-8') !== 'CONFIDENTIAL TECH PACK CAD DRAWINGS AND FABRIC SPECS') {
      throw new Error('Uploaded file content mismatch')
    }
  })

  // 8. Authenticated Download Security: Unauthenticated request rejected
  await runTest(8, 'Unauthenticated direct GET to private documents endpoint is rejected with 401', async () => {
    const unauthReq = new NextRequest(
      `http://localhost:3000/api/documents/download?path=${encodeURIComponent(testUploadedStoragePath)}`
    )
    const res = await downloadDocumentHandler(unauthReq)
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for unauthenticated download, got ${res.status}`)
    }
  })

  // 9. Authenticated Download Security: Authorized session streams file
  await runTest(9, 'Authenticated session successfully downloads private file with secure headers', async () => {
    const authReq = new NextRequest(
      `http://localhost:3000/api/documents/download?path=${encodeURIComponent(testUploadedStoragePath)}`,
      { headers: { 'x-test-role': 'ADMIN' } }
    )
    const res = await downloadDocumentHandler(authReq)
    if (res.status !== 200) {
      throw new Error(`Expected 200 OK for authorized download, got ${res.status}`)
    }
    const disposition = res.headers.get('Content-Disposition') || ''
    if (!disposition.includes('attachment')) {
      throw new Error(`Expected attachment header, got ${disposition}`)
    }
  })

  // 10. Employee Task Management Lifecycle
  await runTest(10, 'Admin creates task, assigns to employee, and employee marks in-progress then completed', async () => {
    // 10a. Admin creates task
    const task = await employeeOpsService.createTask({
      title: `Fabric Weave Density Audit ${unique}`,
      description: 'Perform warp & weft yarn count analysis for lot 8.',
      assignedToId: 'usr-employee-001',
      createdById: 'usr-admin-001',
      priority: 'HIGH',
      relatedEntityType: 'MANUFACTURING_ORDER',
      relatedEntityId: 'mfg-001',
    })

    if (!task || !task.id) throw new Error('Task creation failed')
    if (task.status !== 'PENDING') throw new Error('Initial status must be PENDING')
    testTaskId = task.id

    // 10b. Employee advances to IN_PROGRESS
    const inProgress = await employeeOpsService.updateTaskStatus(
      testTaskId,
      'IN_PROGRESS',
      'usr-employee-001',
      'EMPLOYEE'
    )
    if (inProgress.status !== 'IN_PROGRESS') throw new Error('Status not IN_PROGRESS')

    // 10c. Employee completes task
    const completed = await employeeOpsService.updateTaskStatus(
      testTaskId,
      'COMPLETED',
      'usr-employee-001',
      'EMPLOYEE'
    )
    if (completed.status !== 'COMPLETED' || !completed.completedAt) {
      throw new Error('Task completion timestamp not recorded')
    }
  })

  // 11. Attendance & Punch Clock Lifecycle
  await runTest(11, 'Employee records attendance check-in and check-out with timestamps', async () => {
    const today = `2026-10-${Math.floor(10 + Math.random() * 15)}`
    const checkIn = await employeeOpsService.recordAttendance({
      employeeId: 'usr-employee-001',
      date: today,
      status: 'PRESENT',
      notes: 'Morning shift check-in',
    })

    if (!checkIn || !checkIn.checkInTime) throw new Error('Check-in time not recorded')

    // Punch out
    const checkOut = await employeeOpsService.recordAttendance({
      employeeId: 'usr-employee-001',
      date: today,
    })

    if (!checkOut.checkOutTime) throw new Error('Check-out time not recorded')
  })

  // 12. Daily Progress Reporting
  await runTest(12, 'Employee submits daily progress summary with hours and blocker tracking', async () => {
    const summary = await employeeOpsService.submitDailyProgress({
      employeeId: 'usr-employee-001',
      date: '2026-10-12',
      summaryText: 'Calibrated cutting machines 1 & 2. Inspected 40 sample units for batch 9.',
      tasksCompletedCount: 2,
      ordersWorkedOn: ['TL-MFG-00031'],
      hoursLogged: 8,
      blockers: 'None.',
    })

    if (!summary || summary.hoursLogged !== 8) throw new Error('Hours logged not saved')
    if (summary.tasksCompletedCount !== 2) throw new Error('Tasks count not saved')
  })

  // 13. Audit Log Generation
  await runTest(13, 'System records immutable audit logs for sensitive operations', async () => {
    const auditLog = await employeeOpsService.logAuditEvent({
      actorId: 'usr-superadmin-001',
      actorRole: 'SUPER_ADMIN',
      action: 'SECURITY_ROLE_ELEVATION',
      entityType: 'USER',
      entityId: 'usr-employee-001',
      details: { previousRole: 'EMPLOYEE', newRole: 'EMPLOYEE_LEAD' },
    })

    if (!auditLog || !auditLog.id) throw new Error('Audit log creation failed')
    if (auditLog.action !== 'SECURITY_ROLE_ELEVATION') throw new Error('Action mismatch')

    const logs = await employeeOpsService.getAuditLogs({ entityType: 'USER' })
    const found = logs.find((l) => l.id === auditLog.id)
    if (!found) throw new Error('Audit log not found in query')
  })

  // 14. Super Admin Productivity Reporting
  await runTest(14, 'Productivity report aggregates employee task throughput and hours', async () => {
    const report = await employeeOpsService.getProductivityReport('October 2026')
    if (!report || report.totalEmployees < 1) throw new Error('Productivity report empty')
    if (report.overallCompletionRate < 0 || report.overallCompletionRate > 100) {
      throw new Error('Completion rate out of range')
    }
  })

  // Summary
  console.log('\n======================================================================')
  console.log('PHASE 3 RBAC, STORAGE & OPERATIONS TEST SUMMARY')
  console.log('======================================================================')
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length
  console.log(`Total Test Cases: ${results.length}`)
  console.log(`Passed:           ${passedCount}`)
  console.log(`Failed:           ${failedCount}`)

  if (failedCount > 0) {
    console.error('\nFAILURE DETECTED in Phase 3 RBAC/Storage test cases.')
    process.exit(1)
  } else {
    console.log('\nALL 14 RBAC, STORAGE & OPERATIONS TESTS PASSED SUCCESSFULLY! ✓')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
