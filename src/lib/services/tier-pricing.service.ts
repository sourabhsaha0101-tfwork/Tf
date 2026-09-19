import { QuantityPrice } from '@/types'

export interface B2BPriceCalculation {
  quantity: number
  moq: number
  baseWholesalePrice: number
  appliedUnitPrice: number
  tierApplied: QuantityPrice | null
  savingsPerUnit: number
  totalSavings: number
  gstPercent: number
  unitGstAmount: number
  unitTotalPrice: number
  subtotal: number
  totalGstAmount: number
  grandTotal: number
}

export const tierPricingService = {
  /**
   * Validates pricing tiers against MOQ and base wholesale price
   */
  validatePriceTiers(wholesalePrice: number, moq: number, tiers: QuantityPrice[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!tiers || tiers.length === 0) {
      return { valid: true, errors: [] }
    }

    // Normalize minQty/minQuantity and maxQty/maxQuantity
    const normalized = tiers.map((t: any) => ({
      minQty: t.minQty !== undefined ? Number(t.minQty) : Number(t.minQuantity),
      maxQty: t.maxQty !== undefined && t.maxQty !== null
        ? Number(t.maxQty)
        : t.maxQuantity !== undefined && t.maxQuantity !== null
        ? Number(t.maxQuantity)
        : null,
      pricePerUnit: Number(t.pricePerUnit),
    }))

    // Sort by minQty
    const sorted = [...normalized].sort((a, b) => a.minQty - b.minQty)

    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i]

      if (tier.minQty < moq) {
        errors.push(`Tier ${i + 1}: Minimum quantity (${tier.minQty}) cannot be less than product MOQ (${moq}).`)
      }

      if (tier.pricePerUnit <= 0) {
        errors.push(`Tier ${i + 1}: Price per unit must be greater than 0.`)
      }

      if (tier.pricePerUnit > wholesalePrice) {
        errors.push(
          `Tier ${i + 1}: Tier price (₹${tier.pricePerUnit}) cannot be higher than base wholesale price (₹${wholesalePrice}).`
        )
      }

      if (tier.maxQty !== null && tier.maxQty !== undefined) {
        if (tier.maxQty < tier.minQty) {
          errors.push(`Tier ${i + 1}: Maximum quantity (${tier.maxQty}) cannot be less than minimum quantity (${tier.minQty}).`)
        }
      }

      // Check overlap with next tier
      if (i < sorted.length - 1) {
        const next = sorted[i + 1]
        if (tier.maxQty === null || tier.maxQty === undefined) {
          errors.push(`Tier ${i + 1}: Only the last tier can have an unbounded maximum quantity (maxQty = null).`)
        } else if (tier.maxQty >= next.minQty) {
          errors.push(`Tier ${i + 1} and Tier ${i + 2} overlap in quantity ranges.`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  /**
   * Computes the applicable wholesale price and full tax breakdown for an order quantity
   */
  calculateB2BPrice(
    product: {
      wholesalePrice: number
      gstPercent: number
      moq: number
      quantityPricing?: QuantityPrice[]
    },
    quantity: number
  ): B2BPriceCalculation {
    const moq = Math.max(1, product.moq || 1)
    const orderQty = Math.max(1, Math.floor(quantity))
    const basePrice = Number(product.wholesalePrice)
    const gstPercent = Number(product.gstPercent) || 0

    if (orderQty < moq) {
      throw new Error(`Minimum order quantity for this product is ${moq} units. Requested: ${orderQty}.`)
    }

    let appliedUnitPrice = basePrice
    let tierApplied: QuantityPrice | null = null

    const tiers = product.quantityPricing || []
    if (tiers.length > 0) {
      // Find tier where minQty <= orderQty and (maxQty is null or maxQty >= orderQty)
      // Pick highest matching minQty
      const matchingTiers = tiers
        .filter((t) => orderQty >= t.minQty && (t.maxQty === null || t.maxQty === undefined || orderQty <= t.maxQty))
        .sort((a, b) => b.minQty - a.minQty)

      if (matchingTiers.length > 0) {
        tierApplied = matchingTiers[0]
        appliedUnitPrice = Number(tierApplied.pricePerUnit)
      }
    }

    const savingsPerUnit = Math.max(0, basePrice - appliedUnitPrice)
    const totalSavings = savingsPerUnit * orderQty

    const unitGstAmount = Number(((appliedUnitPrice * gstPercent) / 100).toFixed(2))
    const unitTotalPrice = Number((appliedUnitPrice + unitGstAmount).toFixed(2))

    const subtotal = Number((appliedUnitPrice * orderQty).toFixed(2))
    const totalGstAmount = Number(((subtotal * gstPercent) / 100).toFixed(2))
    const grandTotal = Number((subtotal + totalGstAmount).toFixed(2))

    return {
      quantity: orderQty,
      moq,
      baseWholesalePrice: basePrice,
      appliedUnitPrice,
      tierApplied,
      savingsPerUnit,
      totalSavings,
      gstPercent,
      unitGstAmount,
      unitTotalPrice,
      subtotal,
      totalGstAmount,
      grandTotal,
    }
  },
}
