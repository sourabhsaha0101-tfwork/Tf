import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { categoryService } from '@/lib/services/category.service'
import { categorySchema } from '@/lib/validations/category.schema'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const categories = await categoryService.getCategories({ includeInactive: true })
    return NextResponse.json({ success: true, data: categories })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch categories'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    const validated = categorySchema.parse(body)

    const category = await categoryService.createCategory(validated)
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
