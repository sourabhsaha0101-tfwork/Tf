import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'
import { adminQuotationUpdateSchema } from '@/lib/validations/quotation.schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const quotation = await quotationService.getQuotationById(id, auth.user!.id, 'ADMIN')

    if (!quotation) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: quotation })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching quotation'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json()
    const validated = adminQuotationUpdateSchema.parse(body)

    const updated = await quotationService.updateQuotationAdmin(id, validated)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to update quotation'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
