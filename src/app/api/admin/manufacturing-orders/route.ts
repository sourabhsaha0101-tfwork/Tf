import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { manufacturingService } from '@/lib/services/manufacturing.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const list = await manufacturingService.getAdminManufacturingOrders()
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch manufacturing orders'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
