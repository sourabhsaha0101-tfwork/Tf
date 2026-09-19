import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categorySlug = searchParams.get('category') || ''
    const subcategorySlug = searchParams.get('subcategory') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const sort = searchParams.get('sort') || 'newest'

    const data = await productService.getCustomerProducts({
      search,
      categorySlug,
      subcategorySlug,
      page,
      limit,
      sort,
    })

    return NextResponse.json({ success: true, ...data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch catalog products'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
