import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { ProductInput } from '@/lib/validations/product.schema'
import { Product, ProductStatus, ProductType, Currency } from '@/types'
import { tierPricingService } from './tier-pricing.service'
import { randomUUID } from 'crypto'

export interface ProductQueryParams {
  search?: string
  categoryId?: string
  subcategoryId?: string
  categorySlug?: string
  subcategorySlug?: string
  productType?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}

export interface PaginatedProducts {
  products: Product[]
  totalCount: number
  totalPages: number
  currentPage: number
  limit: number
}

function formatPrismaProduct(p: any, isCustomer: boolean = false): Product {
  const images = (p.images || []).map((img: any) => ({
    id: img.id,
    productId: img.productId,
    url: img.url,
    storagePath: img.storagePath,
    altText: img.altText,
    sortOrder: img.sortOrder,
    isPrimary: img.isPrimary,
    createdAt: img.createdAt ? new Date(img.createdAt).toISOString() : undefined,
  }))

  const quantityPricing = (p.quantityPricing || []).map((qp: any) => ({
    id: qp.id,
    productId: qp.productId,
    minQty: qp.minQty,
    maxQty: qp.maxQty,
    pricePerUnit: Number(qp.pricePerUnit),
    createdAt: qp.createdAt ? new Date(qp.createdAt).toISOString() : undefined,
    updatedAt: qp.updatedAt ? new Date(qp.updatedAt).toISOString() : undefined,
  }))

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    productType: (p.productType as ProductType) || 'READY_WHOLESALE',
    styleCode: p.styleCode || null,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    subcategory: p.subcategory || p.subCategoryRel?.name,
    // CRITICAL SECURITY RULE: Strip vendor/factory details completely for customer requests
    vendorId: isCustomer ? null : p.vendorId,
    vendor: isCustomer
      ? null
      : p.vendor
      ? {
          id: p.vendor.id,
          name: p.vendor.name,
          companyName: p.vendor.companyName,
          email: p.vendor.email,
          phone: p.vendor.phone,
          city: p.vendor.city,
          state: p.vendor.state,
          gstin: p.vendor.gstin,
          status: p.vendor.status,
        }
      : null,
    shortDescription: p.shortDescription,
    description: p.description,
    specifications: p.specifications as Record<string, unknown> | null,
    brand: p.brand,
    color: p.color,
    size: p.size,
    material: p.material,
    moq: p.moq,
    wholesalePrice: Number(p.wholesalePrice || p.basePrice || 0),
    basePrice: Number(p.basePrice || p.wholesalePrice || 0),
    mrp: p.mrp !== null && p.mrp !== undefined ? Number(p.mrp) : null,
    gstPercent: Number(p.gstPercent || 18),
    stock: p.stock,
    weight: p.weight !== null && p.weight !== undefined ? Number(p.weight) : null,
    dimensions: p.dimensions,
    status: p.status as ProductStatus,
    featured: Boolean(p.featured),
    isArchived: Boolean(p.isArchived),
    indicativePriceMin: p.indicativePriceMin !== null && p.indicativePriceMin !== undefined ? Number(p.indicativePriceMin) : null,
    indicativePriceMax: p.indicativePriceMax !== null && p.indicativePriceMax !== undefined ? Number(p.indicativePriceMax) : null,
    indicativeCurrency: (p.indicativeCurrency as Currency) || 'USD',
    priceBasis: p.priceBasis || 'FOB',
    sampleAvailable: p.sampleAvailable !== undefined ? Boolean(p.sampleAvailable) : true,
    samplePrice: p.samplePrice !== null && p.samplePrice !== undefined ? Number(p.samplePrice) : null,
    customLogoAvailable: p.customLogoAvailable !== undefined ? Boolean(p.customLogoAvailable) : true,
    privateLabelAvailable: p.privateLabelAvailable !== undefined ? Boolean(p.privateLabelAvailable) : true,
    customPackagingAvailable: p.customPackagingAvailable !== undefined ? Boolean(p.customPackagingAvailable) : true,
    customBarcodeAvailable: p.customBarcodeAvailable !== undefined ? Boolean(p.customBarcodeAvailable) : true,
    customizationOptions: (p.customizationOptions as Record<string, unknown>) || null,
    qualityStandard: p.qualityStandard || 'ANSI/ASQ Z1.4 — AQL 2.5',
    images,
    quantityPricing,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          sortOrder: p.category.sortOrder,
          isActive: p.category.isActive,
        }
      : null,
    subCategoryRel: p.subCategoryRel
      ? {
          id: p.subCategoryRel.id,
          name: p.subCategoryRel.name,
          slug: p.subCategoryRel.slug,
          sortOrder: p.subCategoryRel.sortOrder,
          isActive: p.subCategoryRel.isActive,
        }
      : null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  }
}

export const productService = {
  /**
   * Admin product query with server-side pagination, search, category, productType, and status filtering
   */
  async getAdminProducts(params: ProductQueryParams = {}): Promise<PaginatedProducts> {
    const {
      search = '',
      categoryId = '',
      subcategoryId = '',
      productType = '',
      status = '',
      page = 1,
      limit = 10,
      sort = 'updatedAt_desc',
    } = params

    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 10))
    const skip = (currentPage - 1) * pageSize

    try {
      const where: any = {}

      if (search.trim()) {
        const q = search.trim()
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { styleCode: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }

      if (categoryId && categoryId !== 'all') {
        where.categoryId = categoryId
      }

      if (subcategoryId && subcategoryId !== 'all') {
        where.subcategoryId = subcategoryId
      }

      if (productType && productType !== 'all') {
        where.productType = productType
      }

      if (status && status !== 'all') {
        where.status = status
      }

      let orderBy: any = { updatedAt: 'desc' }
      if (sort === 'updatedAt_asc') orderBy = { updatedAt: 'asc' }
      if (sort === 'price_asc') orderBy = { wholesalePrice: 'asc' }
      if (sort === 'price_desc') orderBy = { wholesalePrice: 'desc' }
      if (sort === 'name_asc') orderBy = { name: 'asc' }
      if (sort === 'stock_asc') orderBy = { stock: 'asc' }

      const [totalCount, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            quantityPricing: { orderBy: { minQty: 'asc' } },
            category: true,
            subCategoryRel: true,
            vendor: true,
          },
          orderBy,
          skip,
          take: pageSize,
        }),
      ])

      if (items && items.length > 0) {
        return {
          products: items.map((p) => formatPrismaProduct(p, false)),
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage,
          limit: pageSize,
        }
      }
    } catch {
      // Fallback
    }

    // Fallback store logic
    let filtered = [...dbFallback.products]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.styleCode && p.styleCode.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === categoryId)
    }

    if (subcategoryId && subcategoryId !== 'all') {
      filtered = filtered.filter((p) => p.subcategoryId === subcategoryId)
    }

    if (productType && productType !== 'all') {
      filtered = filtered.filter((p) => p.productType === productType)
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status)
    }

    // Sort
    if (sort === 'price_asc') filtered.sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    else if (sort === 'price_desc') filtered.sort((a, b) => b.wholesalePrice - a.wholesalePrice)
    else if (sort === 'name_asc') filtered.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'stock_asc') filtered.sort((a, b) => a.stock - b.stock)
    else filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const totalCount = filtered.length
    const paginated = filtered.slice(skip, skip + pageSize)

    const products: Product[] = paginated.map((p) => {
      const cat = dbFallback.categories.find((c) => c.id === p.categoryId)
      const sub = p.subcategoryId ? dbFallback.categories.find((c) => c.id === p.subcategoryId) : null
      const v = p.vendorId ? dbFallback.vendors.find((ven) => ven.id === p.vendorId) : null
      const pImages = dbFallback.images.filter((img) => img.productId === p.id).sort((a, b) => a.sortOrder - b.sortOrder)
      const pTiers = dbFallback.priceTiers.filter((t) => t.productId === p.id).sort((a, b) => a.minQty - b.minQty)

      return {
        ...p,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive } : null,
        subCategoryRel: sub ? { id: sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, isActive: sub.isActive } : null,
        vendor: v || null,
        images: pImages,
        quantityPricing: pTiers,
      }
    })

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      limit: pageSize,
    }
  },

  /**
   * Public customer catalog query: strictly active, non-archived products, vendor info stripped
   */
  async getCustomerProducts(params: ProductQueryParams = {}): Promise<PaginatedProducts> {
    const {
      search = '',
      categorySlug = '',
      subcategorySlug = '',
      productType = '',
      page = 1,
      limit = 12,
      sort = 'newest',
    } = params

    const currentPage = Math.max(1, Number(page) || 1)
    const pageSize = Math.max(1, Math.min(50, Number(limit) || 12))
    const skip = (currentPage - 1) * pageSize

    try {
      const where: any = {
        status: 'ACTIVE',
        isArchived: false,
      }

      if (search.trim()) {
        const q = search.trim()
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { styleCode: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }

      if (categorySlug) {
        where.category = { slug: categorySlug }
      }

      if (subcategorySlug) {
        where.subCategoryRel = { slug: subcategorySlug }
      }

      if (productType === 'READY_WHOLESALE') {
        where.productType = { in: ['READY_WHOLESALE', 'BOTH'] }
      } else if (productType === 'CUSTOM_MANUFACTURING') {
        where.productType = { in: ['CUSTOM_MANUFACTURING', 'BOTH'] }
      } else if (productType && productType !== 'all') {
        where.productType = productType
      }

      let orderBy: any = { createdAt: 'desc' }
      if (sort === 'price_asc') orderBy = { wholesalePrice: 'asc' }
      if (sort === 'price_desc') orderBy = { wholesalePrice: 'desc' }
      if (sort === 'popular') orderBy = { featured: 'desc' }

      const [totalCount, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            quantityPricing: { orderBy: { minQty: 'asc' } },
            category: true,
            subCategoryRel: true,
          },
          orderBy,
          skip,
          take: pageSize,
        }),
      ])

      if (items && items.length > 0) {
        return {
          products: items.map((p) => formatPrismaProduct(p, true)),
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage,
          limit: pageSize,
        }
      }
    } catch {
      // Fallback
    }

    // Fallback store
    let filtered = dbFallback.products.filter((p) => p.status === 'ACTIVE' && !p.isArchived)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.styleCode && p.styleCode.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      )
    }

    if (categorySlug) {
      const cat = dbFallback.categories.find((c) => c.slug === categorySlug)
      if (cat) filtered = filtered.filter((p) => p.categoryId === cat.id)
      else filtered = []
    }

    if (subcategorySlug) {
      const sub = dbFallback.categories.find((c) => c.slug === subcategorySlug)
      if (sub) filtered = filtered.filter((p) => p.subcategoryId === sub.id)
      else filtered = []
    }

    if (productType === 'READY_WHOLESALE') {
      filtered = filtered.filter((p) => p.productType === 'READY_WHOLESALE' || p.productType === 'BOTH')
    } else if (productType === 'CUSTOM_MANUFACTURING') {
      filtered = filtered.filter((p) => p.productType === 'CUSTOM_MANUFACTURING' || p.productType === 'BOTH')
    } else if (productType && productType !== 'all') {
      filtered = filtered.filter((p) => p.productType === productType)
    }

    if (sort === 'price_asc') filtered.sort((a, b) => a.wholesalePrice - b.wholesalePrice)
    else if (sort === 'price_desc') filtered.sort((a, b) => b.wholesalePrice - a.wholesalePrice)
    else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const totalCount = filtered.length
    const paginated = filtered.slice(skip, skip + pageSize)

    const products: Product[] = paginated.map((p) => {
      const cat = dbFallback.categories.find((c) => c.id === p.categoryId)
      const sub = p.subcategoryId ? dbFallback.categories.find((c) => c.id === p.subcategoryId) : null
      const pImages = dbFallback.images.filter((img) => img.productId === p.id).sort((a, b) => a.sortOrder - b.sortOrder)
      const pTiers = dbFallback.priceTiers.filter((t) => t.productId === p.id).sort((a, b) => a.minQty - b.minQty)

      return {
        ...p,
        vendorId: null,
        vendor: null,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive } : null,
        subCategoryRel: sub ? { id: sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, isActive: sub.isActive } : null,
        images: pImages,
        quantityPricing: pTiers,
      }
    })

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage,
      limit: pageSize,
    }
  },

  async getProductBySlug(slug: string, options: { isCustomer?: boolean } = {}): Promise<Product | null> {
    const { isCustomer = false } = options
    const normalized = slug.toLowerCase().trim()

    try {
      const where: any = { slug: normalized }
      if (isCustomer) {
        where.status = 'ACTIVE'
        where.isArchived = false
      }

      const p = await prisma.product.findFirst({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          quantityPricing: { orderBy: { minQty: 'asc' } },
          category: true,
          subCategoryRel: true,
          vendor: true,
        },
      })

      if (p) {
        return formatPrismaProduct(p, isCustomer)
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.products.find((p) => p.slug.toLowerCase() === normalized)
    if (!found) return null

    if (isCustomer && (found.status !== 'ACTIVE' || found.isArchived)) {
      return null
    }

    const cat = dbFallback.categories.find((c) => c.id === found.categoryId)
    const sub = found.subcategoryId ? dbFallback.categories.find((c) => c.id === found.subcategoryId) : null
    const v = isCustomer ? null : found.vendorId ? dbFallback.vendors.find((ven) => ven.id === found.vendorId) : null
    const pImages = dbFallback.images.filter((img) => img.productId === found.id).sort((a, b) => a.sortOrder - b.sortOrder)
    const pTiers = dbFallback.priceTiers.filter((t) => t.productId === found.id).sort((a, b) => a.minQty - b.minQty)

    return {
      ...found,
      vendorId: isCustomer ? null : found.vendorId,
      vendor: v || null,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive } : null,
      subCategoryRel: sub ? { id: sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, isActive: sub.isActive } : null,
      images: pImages,
      quantityPricing: pTiers,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const p = await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          quantityPricing: { orderBy: { minQty: 'asc' } },
          category: true,
          subCategoryRel: true,
          vendor: true,
        },
      })

      if (p) {
        return formatPrismaProduct(p, false)
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.products.find((p) => p.id === id)
    if (!found) return null

    const cat = dbFallback.categories.find((c) => c.id === found.categoryId)
    const sub = found.subcategoryId ? dbFallback.categories.find((c) => c.id === found.subcategoryId) : null
    const v = found.vendorId ? dbFallback.vendors.find((ven) => ven.id === found.vendorId) : null
    const pImages = dbFallback.images.filter((img) => img.productId === found.id).sort((a, b) => a.sortOrder - b.sortOrder)
    const pTiers = dbFallback.priceTiers.filter((t) => t.productId === found.id).sort((a, b) => a.minQty - b.minQty)

    return {
      ...found,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive } : null,
      subCategoryRel: sub ? { id: sub.id, name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder, isActive: sub.isActive } : null,
      vendor: v || null,
      images: pImages,
      quantityPricing: pTiers,
    }
  },

  async getProductBySku(sku: string): Promise<Product | null> {
    const normalized = sku.toUpperCase().trim()
    try {
      const p = await prisma.product.findUnique({
        where: { sku: normalized },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          quantityPricing: { orderBy: { minQty: 'asc' } },
          category: true,
          subCategoryRel: true,
          vendor: true,
        },
      })
      if (p) return formatPrismaProduct(p, false)
    } catch {
      // Fallback
    }

    const found = dbFallback.products.find((p) => p.sku.toUpperCase() === normalized)
    if (!found) return null
    return this.getProductById(found.id)
  },

  async getProductByStyleCode(styleCode: string): Promise<Product | null> {
    const normalized = styleCode.trim()
    try {
      const p = await prisma.product.findFirst({
        where: { styleCode: normalized },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          quantityPricing: { orderBy: { minQty: 'asc' } },
          category: true,
          subCategoryRel: true,
          vendor: true,
        },
      })
      if (p) return formatPrismaProduct(p, false)
    } catch {
      // Fallback
    }

    const found = dbFallback.products.find((p) => p.styleCode === normalized)
    if (!found) return null
    return this.getProductById(found.id)
  },

  /**
   * Helper to generate a unique Tuffloom Style Code
   */
  async generateStyleCode(categoryId: string): Promise<string> {
    const cat = dbFallback.categories.find((c) => c.id === categoryId)
    let prefix = 'TL-GEN'
    if (cat) {
      const name = cat.name.toLowerCase()
      if (name.includes('bag')) prefix = 'TL-BAG'
      else if (name.includes('cloth') || name.includes('apparel')) prefix = 'TL-APP'
      else if (name.includes('foot') || name.includes('shoe')) prefix = 'TL-SHOE'
    }
    const rand = Math.floor(100 + Math.random() * 900)
    return `${prefix}-${rand}`
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const sku = input.sku.toUpperCase().trim()
    const slug = input.slug.toLowerCase().trim()

    // 1. Verify unique SKU
    const existingSku = await this.getProductBySku(sku)
    if (existingSku) {
      throw new Error(`A product with SKU "${sku}" already exists.`)
    }

    // 2. Verify unique slug
    const existingSlug = await this.getProductBySlug(slug)
    if (existingSlug) {
      throw new Error(`A product with slug "${slug}" already exists.`)
    }

    // 3. Validate price tiers against wholesale price and MOQ (for wholesale products)
    if (input.wholesalePrice > 0 && input.quantityPricing && input.quantityPricing.length > 0) {
      const tierValidation = tierPricingService.validatePriceTiers(input.wholesalePrice, input.moq, input.quantityPricing as any)
      if (!tierValidation.valid) {
        throw new Error(tierValidation.errors.join(' '))
      }
    }

    // Determine or generate Style Code
    let styleCode = input.styleCode?.trim() || null
    if (!styleCode && input.productType !== 'READY_WHOLESALE') {
      styleCode = await this.generateStyleCode(input.categoryId)
    }

    // Ensure at least one primary image if images provided
    let images = [...(input.images || [])]
    if (images.length > 0 && !images.some((img) => img.isPrimary)) {
      images[0].isPrimary = true
    }

    const newId = `prd-${randomUUID()}`

    try {
      const created = await prisma.product.create({
        data: {
          id: newId,
          name: input.name,
          slug,
          sku,
          productType: input.productType,
          styleCode,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId || null,
          vendorId: input.vendorId || null,
          shortDescription: input.shortDescription || null,
          description: input.description,
          brand: input.brand || null,
          material: input.material || null,
          color: input.color || null,
          size: input.size || null,
          weight: input.weight !== undefined && input.weight !== null ? input.weight : null,
          dimensions: input.dimensions || null,
          mrp: input.mrp !== undefined && input.mrp !== null ? input.mrp : null,
          wholesalePrice: input.wholesalePrice,
          basePrice: input.wholesalePrice,
          gstPercent: input.gstPercent,
          moq: input.moq,
          stock: input.stock,
          status: input.status,
          featured: input.featured,
          isArchived: false,
          indicativePriceMin: input.indicativePriceMin !== undefined ? input.indicativePriceMin : null,
          indicativePriceMax: input.indicativePriceMax !== undefined ? input.indicativePriceMax : null,
          indicativeCurrency: input.indicativeCurrency,
          priceBasis: input.priceBasis || 'FOB',
          sampleAvailable: input.sampleAvailable,
          samplePrice: input.samplePrice !== undefined ? input.samplePrice : null,
          customLogoAvailable: input.customLogoAvailable,
          privateLabelAvailable: input.privateLabelAvailable,
          customPackagingAvailable: input.customPackagingAvailable,
          customBarcodeAvailable: input.customBarcodeAvailable,
          customizationOptions: input.customizationOptions as any,
          qualityStandard: input.qualityStandard || 'ANSI/ASQ Z1.4 — AQL 2.5',
          images: {
            create: images.map((img, idx) => ({
              url: img.url,
              storagePath: img.storagePath || null,
              altText: img.altText || null,
              sortOrder: img.sortOrder ?? idx,
              isPrimary: img.isPrimary ?? idx === 0,
            })),
          },
          quantityPricing: {
            create: (input.quantityPricing || []).map((t) => ({
              minQty: t.minQuantity,
              maxQty: t.maxQuantity || null,
              pricePerUnit: t.pricePerUnit,
            })),
          },
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          quantityPricing: { orderBy: { minQty: 'asc' } },
          category: true,
          subCategoryRel: true,
          vendor: true,
        },
      })

      return formatPrismaProduct(created, false)
    } catch {
      // Fallback store create
    }

    const fallbackProduct: any = {
      id: newId,
      name: input.name,
      slug,
      sku,
      productType: input.productType,
      styleCode,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId || null,
      subcategory: null,
      vendorId: input.vendorId || null,
      shortDescription: input.shortDescription || null,
      description: input.description,
      brand: input.brand || null,
      material: input.material || null,
      color: input.color || null,
      size: input.size || null,
      weight: input.weight !== undefined && input.weight !== null ? input.weight : null,
      dimensions: input.dimensions || null,
      mrp: input.mrp !== undefined && input.mrp !== null ? input.mrp : null,
      wholesalePrice: input.wholesalePrice,
      basePrice: input.wholesalePrice,
      gstPercent: input.gstPercent,
      moq: input.moq,
      stock: input.stock,
      status: input.status,
      featured: input.featured,
      isArchived: false,
      indicativePriceMin: input.indicativePriceMin !== undefined ? input.indicativePriceMin : null,
      indicativePriceMax: input.indicativePriceMax !== undefined ? input.indicativePriceMax : null,
      indicativeCurrency: input.indicativeCurrency,
      priceBasis: input.priceBasis || 'FOB',
      sampleAvailable: input.sampleAvailable,
      samplePrice: input.samplePrice !== undefined ? input.samplePrice : null,
      customLogoAvailable: input.customLogoAvailable,
      privateLabelAvailable: input.privateLabelAvailable,
      customPackagingAvailable: input.customPackagingAvailable,
      customBarcodeAvailable: input.customBarcodeAvailable,
      customizationOptions: input.customizationOptions,
      qualityStandard: input.qualityStandard || 'ANSI/ASQ Z1.4 — AQL 2.5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dbFallback.products.push(fallbackProduct)

    images.forEach((img, idx) => {
      dbFallback.images.push({
        id: `img-${randomUUID()}`,
        productId: newId,
        url: img.url,
        storagePath: img.storagePath || null,
        altText: img.altText || null,
        sortOrder: img.sortOrder ?? idx,
        isPrimary: img.isPrimary ?? idx === 0,
        createdAt: new Date().toISOString(),
      })
    })

    if (input.quantityPricing) {
      input.quantityPricing.forEach((t) => {
        dbFallback.priceTiers.push({
          id: `tier-${randomUUID()}`,
          productId: newId,
          minQty: t.minQuantity,
          maxQty: t.maxQuantity || null,
          pricePerUnit: t.pricePerUnit,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      })
    }

    const full = await this.getProductById(newId)
    return full!
  },

  async updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
    const existing = await this.getProductById(id)
    if (!existing) {
      throw new Error(`Product with ID "${id}" not found.`)
    }

    if (input.sku && input.sku.toUpperCase() !== existing.sku) {
      const collision = await this.getProductBySku(input.sku.toUpperCase())
      if (collision && collision.id !== id) {
        throw new Error(`SKU "${input.sku.toUpperCase()}" is already in use by another product.`)
      }
    }

    if (input.slug && input.slug.toLowerCase() !== existing.slug) {
      const collision = await this.getProductBySlug(input.slug.toLowerCase())
      if (collision && collision.id !== id) {
        throw new Error(`Slug "${input.slug.toLowerCase()}" is already in use by another product.`)
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        if (input.images !== undefined) {
          await tx.productImage.deleteMany({ where: { productId: id } })
          if (input.images && input.images.length > 0) {
            await tx.productImage.createMany({
              data: input.images.map((img, idx) => ({
                id: `img-${randomUUID()}`,
                productId: id,
                url: img.url,
                storagePath: img.storagePath || null,
                altText: img.altText || null,
                sortOrder: img.sortOrder ?? idx,
                isPrimary: img.isPrimary ?? idx === 0,
              })),
            })
          }
        }

        if (input.quantityPricing !== undefined) {
          await tx.quantityPricing.deleteMany({ where: { productId: id } })
          if (input.quantityPricing && input.quantityPricing.length > 0) {
            await tx.quantityPricing.createMany({
              data: input.quantityPricing.map((t) => ({
                id: `tier-${randomUUID()}`,
                productId: id,
                minQty: t.minQuantity,
                maxQty: t.maxQuantity || null,
                pricePerUnit: t.pricePerUnit,
              })),
            })
          }
        }

        await tx.product.update({
          where: { id },
          data: {
            name: input.name,
            slug: input.slug?.toLowerCase(),
            sku: input.sku?.toUpperCase(),
            productType: input.productType,
            styleCode: input.styleCode,
            categoryId: input.categoryId,
            subcategoryId: input.subcategoryId !== undefined ? input.subcategoryId || null : undefined,
            vendorId: input.vendorId !== undefined ? input.vendorId || null : undefined,
            shortDescription: input.shortDescription !== undefined ? input.shortDescription : undefined,
            description: input.description,
            brand: input.brand !== undefined ? input.brand : undefined,
            material: input.material !== undefined ? input.material : undefined,
            color: input.color !== undefined ? input.color : undefined,
            size: input.size !== undefined ? input.size : undefined,
            weight: input.weight !== undefined ? input.weight : undefined,
            dimensions: input.dimensions !== undefined ? input.dimensions : undefined,
            mrp: input.mrp !== undefined ? input.mrp : undefined,
            wholesalePrice: input.wholesalePrice,
            basePrice: input.wholesalePrice,
            gstPercent: input.gstPercent,
            moq: input.moq,
            stock: input.stock,
            status: input.status,
            featured: input.featured,
            indicativePriceMin: input.indicativePriceMin,
            indicativePriceMax: input.indicativePriceMax,
            indicativeCurrency: input.indicativeCurrency,
            priceBasis: input.priceBasis,
            sampleAvailable: input.sampleAvailable,
            samplePrice: input.samplePrice,
            customLogoAvailable: input.customLogoAvailable,
            privateLabelAvailable: input.privateLabelAvailable,
            customPackagingAvailable: input.customPackagingAvailable,
            customBarcodeAvailable: input.customBarcodeAvailable,
            customizationOptions: input.customizationOptions as any,
            qualityStandard: input.qualityStandard,
          },
        })
      })

      const updated = await this.getProductById(id)
      return updated!
    } catch {
      // Fallback store update
    }

    const idx = dbFallback.products.findIndex((p) => p.id === id)
    if (idx !== -1) {
      const cur = dbFallback.products[idx]
      dbFallback.products[idx] = {
        ...cur,
        name: input.name ?? cur.name,
        slug: input.slug ? input.slug.toLowerCase() : cur.slug,
        sku: input.sku ? input.sku.toUpperCase() : cur.sku,
        productType: input.productType ?? cur.productType,
        styleCode: input.styleCode !== undefined ? input.styleCode : cur.styleCode,
        categoryId: input.categoryId ?? cur.categoryId,
        subcategoryId: input.subcategoryId !== undefined ? input.subcategoryId || null : cur.subcategoryId,
        vendorId: input.vendorId !== undefined ? input.vendorId || null : cur.vendorId,
        shortDescription: input.shortDescription !== undefined ? input.shortDescription : cur.shortDescription,
        description: input.description ?? cur.description,
        brand: input.brand !== undefined ? input.brand : cur.brand,
        material: input.material !== undefined ? input.material : cur.material,
        color: input.color !== undefined ? input.color : cur.color,
        size: input.size !== undefined ? input.size : cur.size,
        weight: input.weight !== undefined ? input.weight : cur.weight,
        dimensions: input.dimensions !== undefined ? input.dimensions : cur.dimensions,
        mrp: input.mrp !== undefined ? input.mrp : cur.mrp,
        wholesalePrice: input.wholesalePrice ?? cur.wholesalePrice,
        basePrice: input.wholesalePrice ?? cur.basePrice,
        gstPercent: input.gstPercent ?? cur.gstPercent,
        moq: input.moq ?? cur.moq,
        stock: input.stock ?? cur.stock,
        status: input.status ?? cur.status,
        featured: input.featured ?? cur.featured,
        indicativePriceMin: input.indicativePriceMin !== undefined ? input.indicativePriceMin : cur.indicativePriceMin,
        indicativePriceMax: input.indicativePriceMax !== undefined ? input.indicativePriceMax : cur.indicativePriceMax,
        indicativeCurrency: input.indicativeCurrency ?? cur.indicativeCurrency,
        priceBasis: input.priceBasis ?? cur.priceBasis,
        sampleAvailable: input.sampleAvailable ?? cur.sampleAvailable,
        samplePrice: input.samplePrice !== undefined ? input.samplePrice : cur.samplePrice,
        customLogoAvailable: input.customLogoAvailable ?? cur.customLogoAvailable,
        privateLabelAvailable: input.privateLabelAvailable ?? cur.privateLabelAvailable,
        customPackagingAvailable: input.customPackagingAvailable ?? cur.customPackagingAvailable,
        customBarcodeAvailable: input.customBarcodeAvailable ?? cur.customBarcodeAvailable,
        customizationOptions: input.customizationOptions ?? cur.customizationOptions,
        qualityStandard: input.qualityStandard ?? cur.qualityStandard,
        updatedAt: new Date().toISOString(),
      }

      if (input.images) {
        dbFallback.images = dbFallback.images.filter((img) => img.productId !== id)
        input.images.forEach((img, i) => {
          dbFallback.images.push({
            id: `img-${randomUUID()}`,
            productId: id,
            url: img.url,
            storagePath: img.storagePath || null,
            altText: img.altText || null,
            sortOrder: img.sortOrder ?? i,
            isPrimary: img.isPrimary ?? i === 0,
            createdAt: new Date().toISOString(),
          })
        })
      }

      if (input.quantityPricing) {
        dbFallback.priceTiers = dbFallback.priceTiers.filter((t) => t.productId !== id)
        input.quantityPricing.forEach((t) => {
          dbFallback.priceTiers.push({
            id: `tier-${randomUUID()}`,
            productId: id,
            minQty: t.minQuantity,
            maxQty: t.maxQuantity || null,
            pricePerUnit: t.pricePerUnit,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        })
      }

      const full = await this.getProductById(id)
      return full!
    }

    throw new Error('Product not found')
  },

  async toggleProductStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.updateProduct(id, { status })
  },

  async archiveProduct(id: string): Promise<Product> {
    try {
      await prisma.product.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          isArchived: true,
        },
      })
      const full = await this.getProductById(id)
      return full!
    } catch {
      // Fallback
    }

    const idx = dbFallback.products.findIndex((p) => p.id === id)
    if (idx !== -1) {
      dbFallback.products[idx].status = 'ARCHIVED'
      dbFallback.products[idx].isArchived = true
      dbFallback.products[idx].updatedAt = new Date().toISOString()
      const full = await this.getProductById(id)
      return full!
    }

    throw new Error('Product not found')
  },

  async duplicateProduct(id: string): Promise<Product> {
    const original = await this.getProductById(id)
    if (!original) {
      throw new Error(`Original product not found`)
    }

    let copyNum = 1
    let newSku = `${original.sku}-CP${copyNum}`
    let newSlug = `${original.slug}-copy-${copyNum}`

    while ((await this.getProductBySku(newSku)) || (await this.getProductBySlug(newSlug))) {
      copyNum++
      newSku = `${original.sku}-CP${copyNum}`
      newSlug = `${original.slug}-copy-${copyNum}`
    }

    const duplicated = await this.createProduct({
      name: `${original.name} (Copy)`,
      slug: newSlug,
      sku: newSku,
      productType: original.productType,
      styleCode: original.styleCode ? `${original.styleCode}-CP${copyNum}` : null,
      categoryId: original.categoryId,
      subcategoryId: original.subcategoryId,
      vendorId: original.vendorId,
      shortDescription: original.shortDescription,
      description: original.description,
      brand: original.brand,
      material: original.material,
      color: original.color,
      size: original.size,
      weight: original.weight,
      dimensions: original.dimensions,
      mrp: original.mrp,
      wholesalePrice: original.wholesalePrice,
      gstPercent: original.gstPercent,
      moq: original.moq,
      stock: original.stock,
      status: 'DRAFT',
      featured: false,
      indicativePriceMin: original.indicativePriceMin,
      indicativePriceMax: original.indicativePriceMax,
      indicativeCurrency: (original.indicativeCurrency as 'USD' | 'INR') || 'USD',
      priceBasis: original.priceBasis,
      sampleAvailable: original.sampleAvailable ?? true,
      samplePrice: original.samplePrice,
      customLogoAvailable: original.customLogoAvailable ?? true,
      privateLabelAvailable: original.privateLabelAvailable ?? true,
      customPackagingAvailable: original.customPackagingAvailable ?? true,
      customBarcodeAvailable: original.customBarcodeAvailable ?? true,
      customizationOptions: original.customizationOptions,
      qualityStandard: original.qualityStandard,
      images: original.images.map((img) => ({
        url: img.url,
        storagePath: img.storagePath,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
      quantityPricing: original.quantityPricing.map((t) => ({
        minQuantity: t.minQty,
        maxQuantity: t.maxQty,
        pricePerUnit: t.pricePerUnit,
      })),
    })

    return duplicated
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const orderCount = await prisma.orderItem.count({
        where: { productId: id },
      })

      if (orderCount > 0) {
        await this.archiveProduct(id)
        return {
          success: true,
          message: `Product is referenced in ${orderCount} order(s). It has been safely archived instead of permanently deleted to preserve invoice and audit history.`,
        }
      }

      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.quantityPricing.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ])

      return { success: true, message: 'Product permanently deleted successfully.' }
    } catch {
      // Fallback
    }

    const idx = dbFallback.products.findIndex((p) => p.id === id)
    if (idx !== -1) {
      dbFallback.products.splice(idx, 1)
      dbFallback.images = dbFallback.images.filter((img) => img.productId !== id)
      dbFallback.priceTiers = dbFallback.priceTiers.filter((t) => t.productId !== id)
      return { success: true, message: 'Product deleted successfully.' }
    }

    return { success: true, message: 'Deleted' }
  },
}
