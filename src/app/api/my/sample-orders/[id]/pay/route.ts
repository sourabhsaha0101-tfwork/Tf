import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { sampleService } from '@/lib/services/sample.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const method = body.method || 'RAZORPAY'
    const transactionId = body.transactionId || `PAY-SMP-${Date.now()}`

    const updated = await sampleService.processSamplePayment(id, auth.user.id, method, transactionId)
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Sample payment verified and confirmed successfully',
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Sample payment processing failed'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
