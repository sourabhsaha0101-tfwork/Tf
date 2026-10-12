import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json()
    if (!body.message || !body.message.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty' }, { status: 400 })
    }

    // Verify ownership
    const quotation = await quotationService.getQuotationById(id, auth.user.id, auth.user.role)
    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found or access denied' }, { status: 404 })
    }

    const senderType: 'CUSTOMER' | 'ADMIN' =
      auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN' || auth.user.role === 'EMPLOYEE'
        ? 'ADMIN'
        : 'CUSTOMER'

    const msg = await quotationService.addQuotationMessage(
      id,
      auth.user.id,
      senderType,
      body.message.trim()
    )

    return NextResponse.json({ success: true, data: msg }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
