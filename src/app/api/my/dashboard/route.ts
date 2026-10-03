import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { manufacturingService } from '@/lib/services/manufacturing.service'
import { quotationService } from '@/lib/services/quotation.service'
import { sampleService } from '@/lib/services/sample.service'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const userId = auth.user.id

  try {
    let orders: any[] = []
    try {
      orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      // Fallback store
      orders = dbFallback.orders
    }

    const [manufacturingOrders, quotations, sampleOrders] = await Promise.all([
      manufacturingService.getCustomerManufacturingOrders(userId),
      quotationService.getCustomerQuotations(userId),
      sampleService.getCustomerSampleOrders(userId),
    ])

    const wholesalePurchase = orders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0)
    const mfgAdvancePurchase = manufacturingOrders.reduce((sum, m) => sum + Number(m.advancePaid || 0), 0)
    const samplePurchase = sampleOrders
      .filter((s) => s.paymentStatus === 'PAID')
      .reduce((sum, s) => sum + Number(s.total || 0), 0)

    const totalOrders = orders.length + manufacturingOrders.length + sampleOrders.length
    const totalPurchase = Math.round(wholesalePurchase + mfgAdvancePurchase + samplePurchase)
    const pendingOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
    const processingOrders = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'PACKED').length
    const shippedOrders = orders.filter((o) => o.status === 'SHIPPED' || o.status === 'IN_TRANSIT').length
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length
    const pendingPayments = Math.round(manufacturingOrders.reduce((sum, m) => sum + Number(m.balanceDue || 0), 0))

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalPurchase,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        manufacturingOrders: manufacturingOrders.length,
        pendingPayments,
        recentOrders: orders.slice(0, 5),
        recentQuotations: quotations.slice(0, 5),
        recentManufacturingOrders: manufacturingOrders.slice(0, 5),
        recentSampleOrders: sampleOrders.slice(0, 5),
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch customer dashboard metrics'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
