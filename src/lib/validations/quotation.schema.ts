import { z } from 'zod'

export const quotationRequestSchema = z.object({
  productId: z.string().optional().nullable(),
  styleCode: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  title: z.string().trim().max(200).optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1 unit'),
  moq: z.coerce.number().int().min(1).optional(),
  targetPrice: z.coerce.number().positive('Target price must be greater than 0').optional().nullable(),
  targetCurrency: z.enum(['USD', 'INR']).default('USD'),
  material: z.string().trim().min(2, 'Please select or specify a material'),
  materialSpecification: z.string().trim().max(500).optional().nullable(),
  gsm: z.string().trim().max(100).optional().nullable(),
  color: z.string().trim().max(100).optional().nullable(),
  designRequirement: z.string().trim().max(2000).optional().nullable(),
  dimensions: z.string().trim().max(200).optional().nullable(),
  sizeRequirements: z.string().trim().max(200).optional().nullable(),
  
  // Branding & Private Label
  customLogoRequired: z.boolean().default(false),
  privateLabelRequired: z.boolean().default(false),
  customLabelRequired: z.boolean().default(false),
  packagingRequired: z.boolean().default(false),
  barcodeRequired: z.boolean().default(false),
  brandName: z.string().trim().max(100).optional().nullable(),
  logoFileUrl: z.string().optional().nullable(),
  packagingInstructions: z.string().trim().max(1000).optional().nullable(),
  labelInstructions: z.string().trim().max(1000).optional().nullable(),
  additionalInstructions: z.string().trim().max(2000).optional().nullable(),
  
  // Delivery & Trade terms
  targetDeliveryDate: z.string().optional().nullable(),
  destinationCountry: z.string().trim().min(2, 'Destination country is required'),
  destinationCity: z.string().trim().min(2, 'Destination city is required'),
  destinationPort: z.string().trim().max(100).optional().nullable(),
  tradeTerm: z.enum(['FOB', 'CIF', 'EX_FACTORY']).default('FOB'),
  originPort: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),

  // Customer contact info (if not pre-authenticated or updating)
  customerName: z.string().trim().min(2, 'Contact name is required').optional(),
  companyName: z.string().trim().min(2, 'Company name is required').optional(),
  customerEmail: z.string().email('Valid business email is required').optional(),
  customerPhone: z.string().trim().min(6, 'Valid phone number is required').optional(),
  businessType: z.string().trim().max(100).optional().nullable(),

  // Attachments (Tech pack, CAD, artwork)
  files: z
    .array(
      z.object({
        fileName: z.string(),
        storagePath: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .default([]),
})

export const adminQuotationUpdateSchema = z.object({
  unitPriceQuoted: z.coerce.number().positive('Unit price must be greater than 0').optional().nullable(),
  setupCostQuoted: z.coerce.number().min(0, 'Setup cost cannot be negative').optional().nullable(),
  sampleCostQuoted: z.coerce.number().min(0, 'Sample cost cannot be negative').optional().nullable(),
  estimatedLeadDaysQuoted: z.coerce.number().int().min(1, 'Lead time must be at least 1 day').optional().nullable(),
  paymentTermsQuoted: z.string().trim().max(500).optional().nullable(),
  validUntil: z.string().optional().nullable(),
  adminNotes: z.string().trim().max(2000).optional().nullable(),
  status: z
    .enum([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'NEED_MORE_INFORMATION',
      'SAMPLE_REQUIRED',
      'QUOTATION_PREPARED',
      'QUOTATION_SENT',
      'CUSTOMER_APPROVAL_PENDING',
      'APPROVED',
      'REJECTED',
      'EXPIRED',
      'CONVERTED_TO_MANUFACTURING',
      'CANCELLED',
    ])
    .optional(),
})

export type QuotationRequestInput = z.infer<typeof quotationRequestSchema>
export type AdminQuotationUpdateInput = z.infer<typeof adminQuotationUpdateSchema>
