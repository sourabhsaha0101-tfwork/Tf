import { NextResponse } from 'next/server'
import { categoryService } from '@/lib/services/category.service'

export async function GET() {
  try {
    const categories = await categoryService.getCategories({ includeInactive: false })
    return NextResponse.json({ success: true, data: categories })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch categories'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
