import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { SampleOrderInput, AdminSampleUpdateInput } from '@/lib/validations/sample.schema'
import { SampleOrder } from '@/types'
import { randomUUID } from 'crypto'

export const sampleService = {
  async generateSampleNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `SMP-${year}-${rand}`
  },

  async createSampleOrder(input: SampleOrderInput, customerId: string): Promise<SampleOrder> {
    const sampleNumber = await this.generateSampleNumber()
    const newId = `smp-${randomUUID()}`
    const total = Number(input.samplePrice) * Number(input.quantity) + Number(input.shippingCharge || 0)

    try {
      const created = await prisma.sampleOrder.create({
        data: {
          id: newId,
          sampleNumber,
          quotationId: input.quotationId || null,
          customerId,
          productId: input.productId || null,
          styleCode: input.styleCode,
          quantity: input.quantity,
          samplePrice: input.samplePrice,
          currency: input.currency,
          shippingDestination: input.shippingDestination,
          shippingCharge: input.shippingCharge,
          total,
          paymentStatus: 'PENDING',
          sampleStatus: 'SAMPLE_REQUESTED',
        },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true, businessName: true } },
        },
      })
      return this.formatSample(created)
    } catch {
      // Fallback
    }

    const fallbackSample: SampleOrder = {
      id: newId,
      sampleNumber,
      quotationId: input.quotationId || null,
      customerId,
      customer: {
        id: customerId,
        name: 'Valued Customer',
        email: 'customer@example.com',
      },
      productId: input.productId || null,
      styleCode: input.styleCode,
      quantity: input.quantity,
      samplePrice: input.samplePrice,
      currency: input.currency,
      shippingDestination: input.shippingDestination,
      shippingCharge: input.shippingCharge,
      total,
      paymentStatus: 'PENDING',
      sampleStatus: 'SAMPLE_REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dbFallback.sampleOrders.unshift(fallbackSample)
    return fallbackSample
  },

  async processSamplePayment(
    sampleOrderId: string,
    customerId: string,
    method: 'RAZORPAY' | 'BANK_TRANSFER' | 'UPI' = 'RAZORPAY',
    transactionId?: string
  ): Promise<SampleOrder> {
    const ref = transactionId || `TXN-${Date.now()}`

    try {
      const sample = await prisma.sampleOrder.findUnique({
        where: { id: sampleOrderId },
      })
      if (!sample || sample.customerId !== customerId) {
        throw new Error('Sample order not found or unauthorized')
      }

      await prisma.$transaction([
        prisma.sampleOrder.update({
          where: { id: sampleOrderId },
          data: {
            paymentStatus: 'PAID',
            sampleStatus: 'PAYMENT_CONFIRMED',
          },
        }),
        prisma.payment.create({
          data: {
            id: `pay-${randomUUID()}`,
            sampleOrderId,
            method,
            transactionId: ref,
            amount: sample.total,
            currency: sample.currency,
            status: 'PAID',
            paidAt: new Date(),
          },
        }),
      ])

      const updated = await prisma.sampleOrder.findUnique({
        where: { id: sampleOrderId },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true, businessName: true } },
        },
      })
      return this.formatSample(updated)
    } catch {
      // Fallback
    }

    const idx = dbFallback.sampleOrders.findIndex((s) => s.id === sampleOrderId)
    if (idx !== -1) {
      if (dbFallback.sampleOrders[idx].customerId !== customerId) {
        throw new Error('Unauthorized')
      }
      dbFallback.sampleOrders[idx].paymentStatus = 'PAID'
      dbFallback.sampleOrders[idx].sampleStatus = 'PAYMENT_CONFIRMED'
      dbFallback.sampleOrders[idx].updatedAt = new Date().toISOString()
      return dbFallback.sampleOrders[idx]
    }

    throw new Error('Sample order not found')
  },

  async getCustomerSampleOrders(customerId: string): Promise<SampleOrder[]> {
    try {
      const list = await prisma.sampleOrder.findMany({
        where: { customerId },
        include: {
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((s) => this.formatSample(s))
      }
    } catch {
      // Fallback
    }

    return dbFallback.sampleOrders.filter((s) => s.customerId === customerId)
  },

  async getSampleOrderById(id: string, userId?: string, role: 'CUSTOMER' | 'ADMIN' = 'ADMIN'): Promise<SampleOrder | null> {
    try {
      const sample = await prisma.sampleOrder.findUnique({
        where: { id },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true, businessName: true } },
        },
      })
      if (sample) {
        if (role === 'CUSTOMER' && userId && sample.customerId !== userId) return null
        return this.formatSample(sample)
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.sampleOrders.find((s) => s.id === id)
    if (!found) return null
    if (role === 'CUSTOMER' && userId && found.customerId !== userId) return null
    return found
  },

  async getAdminSampleOrders(): Promise<SampleOrder[]> {
    try {
      const list = await prisma.sampleOrder.findMany({
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true, businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((s) => this.formatSample(s))
      }
    } catch {
      // Fallback
    }

    return dbFallback.sampleOrders
  },

  async updateSampleOrderAdmin(id: string, input: AdminSampleUpdateInput): Promise<SampleOrder> {
    try {
      const updated = await prisma.sampleOrder.update({
        where: { id },
        data: {
          sampleStatus: input.sampleStatus,
          trackingNumber: input.trackingNumber !== undefined ? input.trackingNumber : undefined,
          courier: input.courier !== undefined ? input.courier : undefined,
          photos: input.photos !== undefined ? (input.photos as any) : undefined,
          customerFeedback: input.customerFeedback !== undefined ? input.customerFeedback : undefined,
        },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true, businessName: true } },
        },
      })
      return this.formatSample(updated)
    } catch {
      // Fallback
    }

    const idx = dbFallback.sampleOrders.findIndex((s) => s.id === id)
    if (idx !== -1) {
      dbFallback.sampleOrders[idx] = {
        ...dbFallback.sampleOrders[idx],
        sampleStatus: input.sampleStatus,
        trackingNumber: input.trackingNumber !== undefined ? input.trackingNumber : dbFallback.sampleOrders[idx].trackingNumber,
        courier: input.courier !== undefined ? input.courier : dbFallback.sampleOrders[idx].courier,
        photos: input.photos !== undefined ? input.photos : dbFallback.sampleOrders[idx].photos,
        customerFeedback: input.customerFeedback !== undefined ? input.customerFeedback : dbFallback.sampleOrders[idx].customerFeedback,
        updatedAt: new Date().toISOString(),
      }
      return dbFallback.sampleOrders[idx]
    }

    throw new Error('Sample order not found')
  },

  formatSample(s: any): SampleOrder {
    return {
      id: s.id,
      sampleNumber: s.sampleNumber,
      quotationId: s.quotationId,
      customerId: s.customerId,
      customer: s.customer
        ? {
            id: s.customer.id,
            name: s.customer.name,
            email: s.customer.email,
            businessName: s.customer.businessName,
          }
        : null,
      productId: s.productId,
      product: s.product
        ? {
            id: s.product.id,
            name: s.product.name,
            slug: s.product.slug,
            sku: s.product.sku,
            productType: s.product.productType,
            styleCode: s.product.styleCode,
            wholesalePrice: Number(s.product.wholesalePrice || 0),
            moq: s.product.moq,
            images: [],
            quantityPricing: [],
            categoryId: s.product.categoryId,
            description: s.product.description,
            status: s.product.status,
            featured: Boolean(s.product.featured),
            isArchived: Boolean(s.product.isArchived),
            gstPercent: Number(s.product.gstPercent || 18),
            stock: s.product.stock,
          }
        : null,
      styleCode: s.styleCode,
      quantity: s.quantity,
      samplePrice: Number(s.samplePrice),
      currency: s.currency || 'USD',
      shippingDestination: s.shippingDestination,
      shippingCharge: Number(s.shippingCharge || 0),
      total: Number(s.total),
      paymentStatus: s.paymentStatus,
      sampleStatus: s.sampleStatus,
      trackingNumber: s.trackingNumber,
      courier: s.courier,
      customerFeedback: s.customerFeedback,
      photos: (s.photos as string[]) || null,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
    }
  },

  async confirmPayment(
    id: string,
    method: 'RAZORPAY' | 'BANK_TRANSFER' | 'UPI' = 'RAZORPAY',
    transactionId?: string
  ): Promise<SampleOrder> {
    const sample = await this.getSampleOrderById(id)
    const customerId = sample?.customerId || 'cust-demo-001'
    return this.processSamplePayment(id, customerId, method, transactionId)
  },

  async updateSampleOrder(id: string, input: any): Promise<SampleOrder> {
    return this.updateSampleOrderAdmin(id, input)
  },
}
