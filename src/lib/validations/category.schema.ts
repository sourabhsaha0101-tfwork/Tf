import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(120, 'Slug must be under 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must only contain lowercase alphanumeric characters and single hyphens'),
  description: z.string().trim().max(1000, 'Description too long').optional().nullable(),
  imageUrl: z.string().trim().url('Invalid image URL').optional().nullable().or(z.literal('')),
  parentId: z.string().uuid('Invalid parent category ID').optional().nullable().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0, 'Sort order cannot be negative').default(0),
  isActive: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>
