import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { cartService } from './cart.service'
import { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types'
import { randomUUID } from 'crypto'

export interface CreateOrderInput {
  userId: string
  billingAddress: {
    name: string
    company?: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone?: string
  }
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone?: string
  }
  paymentMethod?: 'RAZORPAY' | 'BANK_TRANSFER' | 'UPI' | 'COD'
}

export interface ShipmentDetails {
  id: string
  orderId: string
  carrier: string
  trackingNumber: string
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  estimatedDelivery?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
}

export interface InvoiceDetails {
  id: string
  invoiceNumber: string
  orderId: string
  invoiceDate: string
  subtotal: number
  gstAmount: number
  shippingAmount: number
  grandTotal: number
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'
  items: Array<{
    name: string
    sku: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export const orderService = {
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `ORD-${year}-${rand}`
  },

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `INV-${year}-${rand}`
  },

  /**
   * Creates a Ready Wholesale Order from customer's cart
   */
  async createOrderFromCart(input: CreateOrderInput): Promise<Order> {
    const cart = await cartService.getCart(input.userId)
    if (cart.items.length === 0) {
      throw new Error('Cannot create an order from an empty cart')
    }

    const orderNumber = await this.generateOrderNumber()
    const orderId = `ord-${randomUUID()}`

    const orderItems: OrderItem[] = cart.items.map((it) => ({
      id: `oi-${randomUUID()}`,
      productName: it.productName,
      productSku: it.productSku,
      unitPrice: it.pricing.appliedUnitPrice,
      gstPercent: it.pricing.gstPercent,
      quantity: it.quantity,
      totalPrice: it.pricing.subtotal,
    }))

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      items: orderItems,
      subtotal: cart.subtotal,
      gstAmount: cart.gstAmount,
      shippingAmount: cart.shippingEstimate,
      grandTotal: cart.grandTotal,
      status: 'ORDER_PLACED',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      billingAddressSnapshot: input.billingAddress,
      shippingAddressSnapshot: input.shippingAddress,
    }

    try {
      await prisma.$transaction(async (tx) => {
        const o = await tx.order.create({
          data: {
            id: orderId,
            orderNumber,
            userId: input.userId,
            subtotal: cart.subtotal,
            gstAmount: cart.gstAmount,
            shippingAmount: cart.shippingEstimate,
            grandTotal: cart.grandTotal,
            status: 'ORDER_PLACED',
            billingAddressSnapshot: input.billingAddress as any,
            shippingAddressSnapshot: input.shippingAddress as any,
            items: {
              create: orderItems.map((oi) => ({
                id: oi.id,
                productId: cart.items.find((c) => c.productSku === oi.productSku)?.productId || '',
                productName: oi.productName,
                productSku: oi.productSku,
                unitPrice: oi.unitPrice,
                gstPercent: oi.gstPercent,
                quantity: oi.quantity,
                totalPrice: oi.totalPrice,
              })),
            },
            payment: {
              create: {
                id: `pay-${randomUUID()}`,
                method: input.paymentMethod || 'RAZORPAY',
                amount: cart.grandTotal,
                status: 'PENDING',
              },
            },
          },
        })
      })
    } catch {
      // Fallback in-memory persistence
      dbFallback.orders.unshift(newOrder)
    }

    // Clear cart after checkout
    await cartService.clearCart(input.userId)

    return newOrder
  },

  /**
   * Confirms payment for an order (supports mock payment simulation without real gateway charges)
   */
  async confirmPayment(
    orderId: string,
    method: 'RAZORPAY' | 'BANK_TRANSFER' | 'UPI',
    transactionId: string
  ): Promise<Order> {
    const paidAt = new Date().toISOString()

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'PAYMENT_CONFIRMED',
          },
        })

        await tx.payment.upsert({
          where: { orderId },
          create: {
            id: `pay-${randomUUID()}`,
            orderId,
            method,
            transactionId,
            amount: 0,
            status: 'PAID',
            paidAt: new Date(paidAt),
          },
          update: {
            method,
            transactionId,
            status: 'PAID',
            paidAt: new Date(paidAt),
          },
        })
      })
    } catch {
      // Fallback
      const ord = dbFallback.orders.find((o) => o.id === orderId || o.orderNumber === orderId)
      if (ord) {
        ord.status = 'PAYMENT_CONFIRMED'
        ord.paymentStatus = 'PAID'
      }
    }

    const updated = await this.getOrderById(orderId)
    if (!updated) throw new Error(`Order ${orderId} not found`)
    return updated
  },

  /**
   * Updates shipment status and tracking details
   */
  async updateShipment(
    orderId: string,
    details: {
      carrier: string
      trackingNumber: string
      status: 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    }
  ): Promise<Order> {
    const mappedOrderStatus: OrderStatus =
      details.status === 'DELIVERED'
        ? 'DELIVERED'
        : details.status === 'OUT_FOR_DELIVERY'
        ? 'OUT_FOR_DELIVERY'
        : details.status === 'IN_TRANSIT'
        ? 'IN_TRANSIT'
        : 'SHIPPED'

    try {
      await prisma.$transaction(async (tx) => {
        await tx.shipment.upsert({
          where: { orderId },
          create: {
            id: `shp-${randomUUID()}`,
            orderId,
            carrier: details.carrier,
            trackingNumber: details.trackingNumber,
            status: details.status,
            shippedAt: new Date(),
          },
          update: {
            carrier: details.carrier,
            trackingNumber: details.trackingNumber,
            status: details.status,
          },
        })

        await tx.order.update({
          where: { id: orderId },
          data: { status: mappedOrderStatus },
        })
      })
    } catch {
      const ord = dbFallback.orders.find((o) => o.id === orderId || o.orderNumber === orderId)
      if (ord) {
        ord.status = mappedOrderStatus
      }
    }

    const updated = await this.getOrderById(orderId)
    if (!updated) throw new Error(`Order ${orderId} not found`)
    return updated
  },

  /**
   * Generates or retrieves formal Invoice for a Wholesale Order
   */
  async generateInvoice(orderId: string): Promise<InvoiceDetails> {
    const order = await this.getOrderById(orderId)
    if (!order) throw new Error(`Order ${orderId} not found`)

    const invoiceNumber = await this.generateInvoiceNumber()
    const invoiceId = `inv-${randomUUID()}`

    const invoice: InvoiceDetails = {
      id: invoiceId,
      invoiceNumber,
      orderId: order.id,
      invoiceDate: new Date().toISOString(),
      subtotal: order.subtotal,
      gstAmount: order.gstAmount,
      shippingAmount: order.shippingAmount,
      grandTotal: order.grandTotal,
      status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
      items: order.items.map((it) => ({
        name: it.productName,
        sku: it.productSku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.totalPrice,
      })),
    }

    try {
      await prisma.invoice.create({
        data: {
          id: invoiceId,
          invoiceNumber,
          orderId: order.id,
          tuffloomDetails: {
            name: 'Tuffloom Traders B2B',
            gstin: '08ABCDE1234F1Z5',
            address: 'Industrial Area, Phase 2, Jaipur, Rajasthan 302013',
          },
          customerDetails: (order.billingAddressSnapshot || {}) as any,
          itemsSnapshot: (order.items || []) as any,
          subtotal: order.subtotal,
          gstAmount: order.gstAmount,
          shippingAmount: order.shippingAmount,
          grandTotal: order.grandTotal,
          status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
        },
      })
    } catch {
      // In-memory invoice record
    }

    return invoice
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const o = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
        include: { items: true, payment: true, shipment: true, invoice: true },
      })
      if (o) {
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          items: o.items.map((it) => ({
            id: it.id,
            productName: it.productName,
            productSku: it.productSku,
            unitPrice: Number(it.unitPrice),
            gstPercent: Number(it.gstPercent),
            quantity: it.quantity,
            totalPrice: Number(it.totalPrice),
          })),
          subtotal: Number(o.subtotal),
          gstAmount: Number(o.gstAmount),
          shippingAmount: Number(o.shippingAmount),
          grandTotal: Number(o.grandTotal),
          status: o.status,
          paymentStatus: (o.payment?.status as any) || 'PENDING',
          createdAt: o.createdAt.toISOString(),
          billingAddressSnapshot: o.billingAddressSnapshot as any,
          shippingAddressSnapshot: o.shippingAddressSnapshot as any,
        }
      }
    } catch {
      // Fallback
    }

    return dbFallback.orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null
  },

  async getCustomerOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        orderBy: { createdAt: 'desc' },
      })
      if (orders && orders.length > 0) {
        return orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          items: o.items.map((it) => ({
            id: it.id,
            productName: it.productName,
            productSku: it.productSku,
            unitPrice: Number(it.unitPrice),
            gstPercent: Number(it.gstPercent),
            quantity: it.quantity,
            totalPrice: Number(it.totalPrice),
          })),
          subtotal: Number(o.subtotal),
          gstAmount: Number(o.gstAmount),
          shippingAmount: Number(o.shippingAmount),
          grandTotal: Number(o.grandTotal),
          status: o.status,
          paymentStatus: (o.payment?.status as any) || 'PENDING',
          createdAt: o.createdAt.toISOString(),
          billingAddressSnapshot: o.billingAddressSnapshot as any,
          shippingAddressSnapshot: o.shippingAddressSnapshot as any,
        }))
      }
    } catch {
      // Fallback
    }

    return dbFallback.orders
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        include: { items: true, payment: true },
        orderBy: { createdAt: 'desc' },
      })
      if (orders && orders.length > 0) {
        return orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          items: o.items.map((it) => ({
            id: it.id,
            productName: it.productName,
            productSku: it.productSku,
            unitPrice: Number(it.unitPrice),
            gstPercent: Number(it.gstPercent),
            quantity: it.quantity,
            totalPrice: Number(it.totalPrice),
          })),
          subtotal: Number(o.subtotal),
          gstAmount: Number(o.gstAmount),
          shippingAmount: Number(o.shippingAmount),
          grandTotal: Number(o.grandTotal),
          status: o.status,
          paymentStatus: (o.payment?.status as any) || 'PENDING',
          createdAt: o.createdAt.toISOString(),
          billingAddressSnapshot: o.billingAddressSnapshot as any,
          shippingAddressSnapshot: o.shippingAddressSnapshot as any,
        }))
      }
    } catch {
      // Fallback
    }

    return dbFallback.orders
  },
}
