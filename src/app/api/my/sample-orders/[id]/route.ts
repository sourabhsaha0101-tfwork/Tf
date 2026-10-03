import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { sampleService } from '@/lib/services/sample.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const sample = await sampleService.getSampleOrderById(id, auth.user.id, 'CUSTOMER')

    if (!sample) {
      return NextResponse.json({ success: false, error: 'Sample order not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sample })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching sample order'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
