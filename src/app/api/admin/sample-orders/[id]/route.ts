import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { sampleService } from '@/lib/services/sample.service'
import { adminSampleUpdateSchema } from '@/lib/validations/sample.schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const sample = await sampleService.getSampleOrderById(id, auth.user!.id, 'ADMIN')

    if (!sample) {
      return NextResponse.json({ success: false, error: 'Sample order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sample })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching sample order'
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
    const validated = adminSampleUpdateSchema.parse(body)

    const updated = await sampleService.updateSampleOrderAdmin(id, validated)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to update sample order'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
