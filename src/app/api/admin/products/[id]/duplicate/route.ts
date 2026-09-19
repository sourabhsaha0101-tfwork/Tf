import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { productService } from '@/lib/services/product.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const duplicated = await productService.duplicateProduct(id)
    return NextResponse.json({ success: true, data: duplicated, message: 'Product duplicated successfully' }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to duplicate product'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
