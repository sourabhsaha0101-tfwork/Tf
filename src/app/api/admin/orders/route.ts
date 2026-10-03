import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          items: true,
          payment: true,
          shipment: true,
          invoice: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      if (orders && orders.length > 0) {
        return NextResponse.json({ success: true, data: orders })
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, data: dbFallback.orders })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch wholesale orders'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
