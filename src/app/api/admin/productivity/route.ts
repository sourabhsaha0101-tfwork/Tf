import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { employeeOpsService } from '@/lib/services/employee-ops.service'

export async function GET(request: NextRequest) {
  // Strictly restricted to SUPER_ADMIN / ADMIN
  const auth = await requireSuperAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || 'Current Month'

  const report = await employeeOpsService.getProductivityReport(period)

  return NextResponse.json({ success: true, data: report, report })
}
