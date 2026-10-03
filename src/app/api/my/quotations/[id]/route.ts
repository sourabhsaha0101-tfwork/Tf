import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const quotation = await quotationService.getQuotationById(id, auth.user.id, 'CUSTOMER')

    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quotation })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching quotation'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
