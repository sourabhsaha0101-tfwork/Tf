import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { quotationService } from '@/lib/services/quotation.service'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const list = await quotationService.getAdminQuotations({ status, search })
    return NextResponse.json({ success: true, data: list })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch quotations'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
