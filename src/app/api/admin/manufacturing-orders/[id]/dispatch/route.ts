import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { manufacturingService } from '@/lib/services/manufacturing.service'
import { updateDispatchSchema } from '@/lib/validations/manufacturing.schema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateDispatchSchema.parse(body)

    const updated = await manufacturingService.updateDispatch(id, validated)
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Dispatch and shipping waybill details updated successfully',
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to update dispatch details'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
