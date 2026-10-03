import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'
import { manufacturingService } from '@/lib/services/manufacturing.service'
import { dbFallback } from '@/lib/db-fallback'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const userId = auth.user.id

  try {
    const docs: any[] = []

    // 1. Tech pack files from customer's quotations
    const quotations = await quotationService.getCustomerQuotations(userId)
    quotations.forEach((q) => {
      (q.files || []).forEach((f) => {
        docs.push({
          id: f.id,
          title: f.fileName,
          type: 'TECH_PACK',
          referenceNumber: q.quotationNumber,
          url: `/uploads/${f.storagePath}`,
          fileType: f.fileType,
          fileSize: f.fileSize,
          date: f.createdAt || q.createdAt,
        })
      })
    })

    // 2. Inspection reports and dispatch documents from manufacturing orders
    const mfgs = await manufacturingService.getCustomerManufacturingOrders(userId)
    mfgs.forEach((m) => {
      (m.inspections || []).forEach((insp) => {
        if (insp.reportFileUrl) {
          docs.push({
            id: insp.id,
            title: `ANSI/ASQ Z1.4 — AQL 2.5 Inspection Certificate (${insp.inspectionNumber})`,
            type: 'INSPECTION_REPORT',
            referenceNumber: m.manufacturingOrderNumber,
            url: insp.reportFileUrl,
            fileType: 'application/pdf',
            date: insp.inspectionDate,
          })
        }
      })

      if (m.billOfLadingUrl) {
        docs.push({
          id: `bol-${m.id}`,
          title: `Ocean / Air Bill of Lading (Consignment ${m.manufacturingOrderNumber})`,
          type: 'BILL_OF_LADING',
          referenceNumber: m.manufacturingOrderNumber,
          url: m.billOfLadingUrl,
          fileType: 'application/pdf',
          date: m.dispatchDate,
        })
      }
    })

    // 3. Publicly verified certifications
    const verifiedCerts = dbFallback.certifications.filter((c) => c.publicDisplay && c.status === 'VERIFIED')
    verifiedCerts.forEach((c) => {
      if (c.documentUrl) {
        docs.push({
          id: c.id,
          title: `${c.certificationName} (Verified Factory Standard)`,
          type: 'CERTIFICATION',
          referenceNumber: 'TUFFLOOM-COMPLIANCE',
          url: c.documentUrl,
          fileType: 'application/pdf',
          date: c.verificationDate,
        })
      }
    })

    return NextResponse.json({ success: true, data: docs })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch customer documents'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
