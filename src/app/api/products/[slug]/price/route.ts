import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'
import { tierPricingService } from '@/lib/services/tier-pricing.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const quantityStr = searchParams.get('quantity')

    if (!quantityStr) {
      return NextResponse.json({ success: false, error: 'Query parameter "quantity" is required' }, { status: 400 })
    }

    const quantity = parseInt(quantityStr, 10)
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 })
    }

    const product = await productService.getProductBySlug(slug, { isCustomer: true })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const calculation = tierPricingService.calculateB2BPrice(product, quantity)
    return NextResponse.json({ success: true, data: calculation })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Pricing calculation failed'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
