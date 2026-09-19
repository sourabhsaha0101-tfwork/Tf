import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { productService } from '@/lib/services/product.service'
import { productSchema } from '@/lib/validations/product.schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const product = await productService.getProductById(id)
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error fetching product'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json()
    const validated = productSchema.partial().parse(body)

    const updated = await productService.updateProduct(id, validated)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const body = await request.json()

    if (body.action === 'archive') {
      const archived = await productService.archiveProduct(id)
      return NextResponse.json({ success: true, data: archived, message: 'Product archived' })
    }

    if (body.status) {
      const updated = await productService.toggleProductStatus(id, body.status)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: 'Invalid patch payload' }, { status: 400 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product status'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const { id } = await params
    const result = await productService.deleteProduct(id)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
