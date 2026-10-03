import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { manufacturingService } from '@/lib/services/manufacturing.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const vendorId = body.vendorId || null

    const mfg = await manufacturingService.createFromQuotation(id, vendorId)
    return NextResponse.json({
      success: true,
      data: mfg,
      message: `Quotation successfully converted to Manufacturing Order ${mfg.manufacturingOrderNumber}`,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to convert quotation to manufacturing order'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
