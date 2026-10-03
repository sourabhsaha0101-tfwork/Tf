import { z } from 'zod'

export const sampleOrderSchema = z.object({
  productId: z.string().optional().nullable(),
  quotationId: z.string().optional().nullable(),
  styleCode: z.string().trim().min(3, 'Tuffloom Style Code is required'),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  samplePrice: z.coerce.number().positive('Sample price must be greater than 0'),
  currency: z.enum(['USD', 'INR']).default('USD'),
  shippingDestination: z.string().trim().min(5, 'Complete shipping address is required'),
  shippingCharge: z.coerce.number().min(0).default(0),
})

export const adminSampleUpdateSchema = z.object({
  sampleStatus: z.enum([
    'SAMPLE_REQUESTED',
    'PAYMENT_PENDING',
    'PAYMENT_CONFIRMED',
    'SAMPLE_DEVELOPMENT',
    'SAMPLE_READY',
    'DISPATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ]),
  trackingNumber: z.string().trim().max(100).optional().nullable(),
  courier: z.string().trim().max(100).optional().nullable(),
  photos: z.array(z.string()).optional(),
  customerFeedback: z.string().trim().max(1000).optional().nullable(),
})

export type SampleOrderInput = z.infer<typeof sampleOrderSchema>
export type AdminSampleUpdateInput = z.infer<typeof adminSampleUpdateSchema>
