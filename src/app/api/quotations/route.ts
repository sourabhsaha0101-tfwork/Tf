import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'
import { quotationRequestSchema } from '@/lib/validations/quotation.schema'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    const validated = quotationRequestSchema.parse(body)

    const quotation = await quotationService.createQuotation(validated, auth.user.id)
    return NextResponse.json({ success: true, data: quotation }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to submit quotation request'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
