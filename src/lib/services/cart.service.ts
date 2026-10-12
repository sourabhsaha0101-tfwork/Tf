import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { productService } from './product.service'
import { tierPricingService, B2BPriceCalculation } from './tier-pricing.service'
import { randomUUID } from 'crypto'

export interface CartItemDetailed {
  id: string
  productId: string
  productName: string
  productSku: string
  imageUrl?: string | null
  quantity: number
  moq: number
  baseWholesalePrice: number
  pricing: B2BPriceCalculation
}

export interface CartDetailed {
  userId: string
  items: CartItemDetailed[]
  itemCount: number
  totalQuantity: number
  subtotal: number
  totalSavings: number
  gstAmount: number
  shippingEstimate: number
  grandTotal: number
}

// In-memory fallback cart storage for resilient testing & development
const fallbackCartStore = new Map<string, Array<{ id: string; productId: string; quantity: number }>>()

export const cartService = {
  async getCart(userId: string): Promise<CartDetailed> {
    let rawItems: Array<{ id: string; productId: string; quantity: number }> = []

    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      })
      if (cart && cart.items) {
        rawItems = cart.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          quantity: it.quantity,
        }))
      } else {
        rawItems = fallbackCartStore.get(userId) || []
      }
    } catch {
      rawItems = fallbackCartStore.get(userId) || []
    }

    const detailedItems: CartItemDetailed[] = []
    let subtotal = 0
    let totalSavings = 0
    let gstAmount = 0
    let totalQuantity = 0

    for (const item of rawItems) {
      const prod = await productService.getProductById(item.productId)
      if (!prod) continue

      const pricing = tierPricingService.calculateB2BPrice(
        {
          wholesalePrice: prod.wholesalePrice,
          gstPercent: prod.gstPercent,
          moq: prod.moq,
          quantityPricing: prod.quantityPricing || [],
        },
        item.quantity
      )

      detailedItems.push({
        id: item.id,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        imageUrl: prod.images?.[0]?.url || null,
        quantity: item.quantity,
        moq: prod.moq,
        baseWholesalePrice: prod.wholesalePrice,
        pricing,
      })

      subtotal += pricing.subtotal
      totalSavings += pricing.totalSavings
      gstAmount += pricing.totalGstAmount
      totalQuantity += item.quantity
    }

    // Standard B2B shipping rule: ₹450 flat base shipping for bulk orders
    const shippingEstimate = detailedItems.length > 0 ? 450 : 0
    const grandTotal = Math.round(subtotal + gstAmount + shippingEstimate)

    return {
      userId,
      items: detailedItems,
      itemCount: detailedItems.length,
      totalQuantity,
      subtotal: Math.round(subtotal * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      shippingEstimate,
      grandTotal,
    }
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<CartDetailed> {
    const prod = await productService.getProductById(productId)
    if (!prod) throw new Error(`Product "${productId}" not found`)
    if (quantity < prod.moq) {
      throw new Error(`Quantity ${quantity} is below product MOQ of ${prod.moq}`)
    }

    try {
      await prisma.$transaction(async (tx) => {
        let cart = await tx.cart.findUnique({ where: { userId } })
        if (!cart) {
          cart = await tx.cart.create({ data: { id: `cart-${randomUUID()}`, userId } })
        }

        const existingItem = await tx.cartItem.findUnique({
          where: { cartId_productId: { cartId: cart.id, productId } },
        })

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
          })
        } else {
          await tx.cartItem.create({
            data: {
              id: `ci-${randomUUID()}`,
              cartId: cart.id,
              productId,
              quantity,
            },
          })
        }
      })
    } catch {
      // Resilient fallback store
      const items = fallbackCartStore.get(userId) || []
      const existing = items.find((i) => i.productId === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.push({ id: `ci-${randomUUID()}`, productId, quantity })
      }
      fallbackCartStore.set(userId, items)
    }

    return this.getCart(userId)
  },

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartDetailed> {
    const prod = await productService.getProductById(productId)
    if (!prod) throw new Error(`Product "${productId}" not found`)
    if (quantity < prod.moq) {
      throw new Error(`Quantity ${quantity} cannot be less than MOQ of ${prod.moq}`)
    }

    try {
      const cart = await prisma.cart.findUnique({ where: { userId } })
      if (cart) {
        await prisma.cartItem.updateMany({
          where: { cartId: cart.id, productId },
          data: { quantity },
        })
      }
    } catch {
      const items = fallbackCartStore.get(userId) || []
      const item = items.find((i) => i.productId === productId)
      if (item) item.quantity = quantity
      fallbackCartStore.set(userId, items)
    }

    return this.getCart(userId)
  },

  async removeItem(userId: string, productId: string): Promise<CartDetailed> {
    try {
      const cart = await prisma.cart.findUnique({ where: { userId } })
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId },
        })
      }
    } catch {
      const items = fallbackCartStore.get(userId) || []
      const filtered = items.filter((i) => i.productId !== productId)
      fallbackCartStore.set(userId, filtered)
    }

    return this.getCart(userId)
  },

  async clearCart(userId: string): Promise<void> {
    try {
      const cart = await prisma.cart.findUnique({ where: { userId } })
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    } catch {
      fallbackCartStore.delete(userId)
    }
  },
}
