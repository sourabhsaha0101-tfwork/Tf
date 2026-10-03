import { z } from 'zod'

export const updateProductionStageSchema = z.object({
  stage: z.enum([
    'ORDER_CONFIRMED',
    'MATERIAL_SOURCED',
    'CUTTING_DONE',
    'PRODUCTION_IN_PROGRESS',
    'IN_LINE_INSPECTION_30',
    'FINAL_INSPECTION_AQL25',
    'PACKED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'SHIPMENT_IN_TRANSIT',
    'DELIVERED',
  ]),
  title: z.string().trim().min(3, 'Stage title is required'),
  description: z.string().trim().max(1000).optional().nullable(),
  progressPercent: z.coerce.number().int().min(0).max(100),
  photos: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
})

export const createInspectionReportSchema = z.object({
  inspectorName: z.string().trim().min(2, 'Inspector name is required'),
  inspectionDate: z.string().optional(),
  aqlStandard: z.string().trim().default('ANSI/ASQ Z1.4 — AQL 2.5'),
  totalChecked: z.coerce.number().int().positive('Total checked must be greater than 0'),
  totalPassed: z.coerce.number().int().min(0),
  totalDefective: z.coerce.number().int().min(0),
  defectDetails: z.record(z.string(), z.unknown()).optional().nullable(),
  status: z.enum(['PENDING', 'PASSED', 'REWORK_REQUIRED', 'FAILED']).default('PASSED'),
  reportFileUrl: z.string().optional().nullable(),
  photos: z.array(z.string()).default([]),
})

export const updateDispatchSchema = z.object({
  dispatchDate: z.string().optional(),
  freightProvider: z.string().trim().min(2, 'Freight provider or courier name is required'),
  trackingNumber: z.string().trim().min(3, 'Tracking number or AWB is required'),
  billOfLadingUrl: z.string().optional().nullable(),
  dispatchDocuments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        date: z.string().optional(),
      })
    )
    .optional(),
})

export type UpdateProductionStageInput = z.infer<typeof updateProductionStageSchema>
export type CreateInspectionReportInput = z.infer<typeof createInspectionReportSchema>
export type UpdateDispatchInput = z.infer<typeof updateDispatchSchema>
