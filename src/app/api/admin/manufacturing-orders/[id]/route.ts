import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { manufacturingService } from '@/lib/services/manufacturing.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const mfg = await manufacturingService.getManufacturingOrderById(id, auth.user!.id, 'ADMIN')

    if (!mfg) {
      return NextResponse.json({ success: false, error: 'Manufacturing order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mfg })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching manufacturing order'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
