import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const product = await productService.getProductBySlug(slug, { isCustomer: true })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching product'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
