import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { productService } from '@/lib/services/product.service'
import { productSchema } from '@/lib/validations/product.schema'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const subcategoryId = searchParams.get('subcategoryId') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const sort = searchParams.get('sort') || 'updatedAt_desc'

    const data = await productService.getAdminProducts({
      search,
      categoryId,
      subcategoryId,
      status,
      page,
      limit,
      sort,
    })

    return NextResponse.json({ success: true, ...data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch products'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    const validated = productSchema.parse(body)

    const product = await productService.createProduct(validated)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
