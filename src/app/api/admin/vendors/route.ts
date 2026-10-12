import { NextRequest, NextResponse } from 'next/server'
import { requireEmployeeOrAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { vendorService } from '@/lib/services/vendor.service'

export async function GET(request: NextRequest) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const vendors = await vendorService.getVendors(auth.user.role)
    return NextResponse.json({ success: true, data: vendors, vendors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch vendors'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
