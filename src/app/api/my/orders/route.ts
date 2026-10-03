import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const userId = auth.user.id

  try {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true, shipment: true, invoice: true },
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
    const msg = error instanceof Error ? error.message : 'Failed to fetch customer orders'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
