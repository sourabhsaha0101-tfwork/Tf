import { z } from 'zod'

export const priceTierSchema = z.object({
  id: z.string().optional(),
  minQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1'),
  maxQuantity: z.coerce.number().int().min(1, 'Maximum quantity must be at least 1').optional().nullable(),
  pricePerUnit: z.coerce.number().positive('Price per unit must be greater than 0'),
})

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().trim().min(1, 'Image URL is required'),
  storagePath: z.string().optional().nullable(),
  altText: z.string().trim().max(200).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
})

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(200, 'Name must be under 200 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(220, 'Slug must be under 220 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with single hyphens'),
  sku: z
    .string()
    .trim()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be under 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain alphanumeric characters, hyphens and underscores')
    .transform((val) => val.toUpperCase()),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional().nullable().or(z.literal('')),
  vendorId: z.string().optional().nullable().or(z.literal('')),
  shortDescription: z.string().trim().max(500, 'Short description must be under 500 characters').optional().nullable(),
  description: z.string().trim().min(10, 'Full description must be at least 10 characters'),
  brand: z.string().trim().max(100).optional().nullable(),
  material: z.string().trim().max(100).optional().nullable(),
  color: z.string().trim().max(50).optional().nullable(),
  size: z.string().trim().max(50).optional().nullable(),
  weight: z.coerce.number().min(0, 'Weight cannot be negative').optional().nullable(),
  dimensions: z.string().trim().max(100).optional().nullable(),
  mrp: z.coerce.number().min(0, 'MRP cannot be negative').optional().nullable(),
  wholesalePrice: z.coerce.number().positive('Wholesale price must be greater than 0'),
  gstPercent: z.coerce.number().min(0, 'GST % cannot be negative').max(28, 'GST % cannot exceed 28%').default(18),
  moq: z.coerce.number().int().min(1, 'MOQ must be at least 1').default(1),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().default(false),
  images: z.array(productImageSchema).default([]),
  quantityPricing: z.array(priceTierSchema).default([]),
}).refine(
  (data) => {
    if (data.mrp !== null && data.mrp !== undefined) {
      return data.wholesalePrice <= data.mrp
    }
    return true
  },
  {
    message: 'Wholesale price cannot exceed MRP',
    path: ['wholesalePrice'],
  }
).refine(
  (data) => {
    // Validate price tiers:
    for (const tier of data.quantityPricing) {
      if (tier.minQuantity < data.moq) {
        return false
      }
      if (tier.maxQuantity !== null && tier.maxQuantity !== undefined && tier.maxQuantity < tier.minQuantity) {
        return false
      }
      if (tier.pricePerUnit > data.wholesalePrice) {
        return false
      }
    }
    return true
  },
  {
    message: 'Price tiers must have minQuantity >= MOQ, maxQuantity >= minQuantity, and price <= wholesale base price',
    path: ['quantityPricing'],
  }
)

export type ProductInput = z.infer<typeof productSchema>
