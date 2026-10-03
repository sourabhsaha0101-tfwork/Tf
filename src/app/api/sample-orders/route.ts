import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { sampleService } from '@/lib/services/sample.service'
import { sampleOrderSchema } from '@/lib/validations/sample.schema'

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    const validated = sampleOrderSchema.parse(body)

    const sample = await sampleService.createSampleOrder(validated, auth.user.id)
    return NextResponse.json({ success: true, data: sample }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to create sample order'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
