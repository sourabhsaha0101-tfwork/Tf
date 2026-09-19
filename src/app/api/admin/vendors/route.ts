import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { vendorService } from '@/lib/services/vendor.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const vendors = await vendorService.getVendors()
    return NextResponse.json({ success: true, data: vendors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch vendors'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
