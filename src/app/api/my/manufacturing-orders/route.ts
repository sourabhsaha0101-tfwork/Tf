import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { manufacturingService } from '@/lib/services/manufacturing.service'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const list = await manufacturingService.getCustomerManufacturingOrders(auth.user.id)
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch manufacturing orders'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
