import { categoryService } from '../src/lib/services/category.service'
import { productService } from '../src/lib/services/product.service'
import { tierPricingService } from '../src/lib/services/tier-pricing.service'
import { productSchema } from '../src/lib/validations/product.schema'
import { categorySchema } from '../src/lib/validations/category.schema'
import { requireAdmin } from '../src/lib/auth-guard'
import { NextRequest } from 'next/server'

interface TestResult {
  id: number
  description: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function runTest(id: number, description: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ id, description, passed: true })
    console.log(`  ✓ Case ${id}: ${description}`)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    results.push({ id, description, passed: false, error: errorMsg })
    console.log(`  ✗ Case ${id}: ${description} -> FAILED: ${errorMsg}`)
  }
}

async function main() {
  console.log('======================================================================')
  console.log('TUFFLOOM TRADERS — PHASE 2 AUTOMATED TEST SUITE')
  console.log('Testing: Category Management, Product DB, Images, Pricing Tiers, Security')
  console.log('======================================================================\n')

  let testCatId = ''
  let testSubcatId = ''
  let testProductId = ''
  const uniqueSuffix = Date.now().toString().slice(-4)

  // 1. Admin creates category
  await runTest(1, 'Admin creates category', async () => {
    const cat = await categoryService.createCategory({
      name: `Test Travel Gear ${uniqueSuffix}`,
      slug: `test-travel-gear-${uniqueSuffix}`,
      description: 'Durable travel equipment category',
      imageUrl: '/uploads/categories/travel.jpg',
      sortOrder: 10,
      isActive: true,
    })
    if (!cat || !cat.id) throw new Error('Category was not returned with ID')
    testCatId = cat.id
  })

  // 2. Admin creates subcategory
  await runTest(2, 'Admin creates subcategory', async () => {
    const sub = await categoryService.createCategory({
      name: `Test Duffle Bags ${uniqueSuffix}`,
      slug: `test-duffle-bags-${uniqueSuffix}`,
      description: 'Rugged duffles',
      parentId: testCatId,
      sortOrder: 1,
      isActive: true,
    })
    if (!sub || !sub.id || sub.parentId !== testCatId) {
      throw new Error('Subcategory creation failed or parentId did not match')
    }
    testSubcatId = sub.id
  })

  // 3. Admin creates product
  const testSku = `TL-TEST-${uniqueSuffix}`
  const testSlug = `test-waterproof-backpack-${uniqueSuffix}`

  await runTest(3, 'Admin creates product', async () => {
    const prod = await productService.createProduct({
      name: `Tuffloom Test Backpack ${uniqueSuffix}`,
      slug: testSlug,
      sku: testSku,
      categoryId: testCatId,
      subcategoryId: testSubcatId,
      shortDescription: 'Heavy duty waterproof test backpack.',
      description: 'Comprehensive wholesale backpack built with military canvas and reinforced seams.',
      brand: 'Tuffloom',
      material: 'Nylon 1000D',
      color: 'Matte Black',
      size: '35L',
      weight: 1.2,
      dimensions: '45 x 30 x 18 cm',
      mrp: 1299,
      wholesalePrice: 550,
      gstPercent: 18,
      moq: 20,
      stock: 300,
      status: 'ACTIVE',
      featured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          storagePath: 'products/test-front.jpg',
          altText: 'Front View',
          sortOrder: 0,
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
          storagePath: 'products/test-side.jpg',
          altText: 'Side View',
          sortOrder: 1,
          isPrimary: false,
        },
      ],
      quantityPricing: [
        { minQuantity: 20, maxQuantity: 49, pricePerUnit: 520 },
        { minQuantity: 50, maxQuantity: 99, pricePerUnit: 490 },
        { minQuantity: 100, maxQuantity: null, pricePerUnit: 450 },
      ],
    })

    if (!prod || !prod.id) throw new Error('Product creation failed to return valid product')
    testProductId = prod.id
  })

  // 4. Product image uploads successfully
  await runTest(4, 'Product image uploads successfully', async () => {
    const prod = await productService.getProductById(testProductId)
    if (!prod || !prod.images || prod.images.length !== 2) {
      throw new Error(`Expected 2 product images, got ${prod?.images?.length}`)
    }
    if (!prod.images[0].url || !prod.images[0].storagePath) {
      throw new Error('Image URL or storagePath is missing')
    }
  })

  // 5. Primary image works
  await runTest(5, 'Primary image works', async () => {
    const prod = await productService.getProductById(testProductId)
    const primaries = prod?.images?.filter((img) => img.isPrimary) || []
    if (primaries.length !== 1) {
      throw new Error(`Expected exactly 1 primary image, found ${primaries.length}`)
    }
  })

  // 6. Product appears in database
  await runTest(6, 'Product appears in database', async () => {
    const prod = await productService.getProductById(testProductId)
    if (!prod || prod.sku !== testSku) {
      throw new Error('Product not found by ID or SKU mismatch')
    }
    const bySlug = await productService.getProductBySlug(testSlug)
    if (!bySlug || bySlug.id !== testProductId) {
      throw new Error('Product not retrievable by unique slug')
    }
  })

  // 7. Product can be edited
  await runTest(7, 'Product can be edited', async () => {
    const updated = await productService.updateProduct(testProductId, {
      wholesalePrice: 530,
      stock: 450,
      shortDescription: 'Updated short description for test.',
    })
    if (updated.wholesalePrice !== 530 || updated.stock !== 450) {
      throw new Error(`Product update failed. Price: ${updated.wholesalePrice}, Stock: ${updated.stock}`)
    }
  })

  // 8. Product can be deactivated
  await runTest(8, 'Product can be deactivated', async () => {
    const deactivated = await productService.toggleProductStatus(testProductId, 'INACTIVE')
    if (deactivated.status !== 'INACTIVE') {
      throw new Error(`Expected status INACTIVE, got ${deactivated.status}`)
    }
    // Restore to ACTIVE for subsequent tests
    await productService.toggleProductStatus(testProductId, 'ACTIVE')
  })

  // 9. Customer cannot access admin product creation
  await runTest(9, 'Customer cannot access admin product creation', async () => {
    // Simulated customer request with customer role header
    const mockCustomerReq = new NextRequest('http://localhost:3000/api/admin/products', {
      headers: { 'x-test-role': 'CUSTOMER' },
    })
    const authCust = await requireAdmin(mockCustomerReq)
    if (authCust.authorized) {
      throw new Error('Customer was incorrectly authorized for Admin operation!')
    }
    if (authCust.status !== 403) {
      throw new Error(`Expected status 403 for Customer, got ${authCust.status}`)
    }

    // Simulated unauthenticated request
    const mockAnonReq = new NextRequest('http://localhost:3000/api/admin/products')
    const authAnon = await requireAdmin(mockAnonReq)
    if (authAnon.authorized) {
      throw new Error('Unauthenticated user was incorrectly authorized for Admin operation!')
    }
  })

  // 10. Duplicate SKU is rejected
  await runTest(10, 'Duplicate SKU is rejected', async () => {
    let threw = false
    try {
      await productService.createProduct({
        name: `Duplicate SKU Product ${uniqueSuffix}`,
        slug: `dup-sku-test-${uniqueSuffix}`,
        sku: testSku, // Same SKU!
        categoryId: testCatId,
        description: 'Testing duplicate SKU rejection.',
        wholesalePrice: 500,
        gstPercent: 18,
        moq: 10,
        stock: 50,
        status: 'DRAFT',
        featured: false,
        images: [],
        quantityPricing: [],
      })
    } catch (err: unknown) {
      threw = true
      const msg = err instanceof Error ? err.message : ''
      if (!msg.toLowerCase().includes('sku')) {
        throw new Error(`Expected SKU error message, got: ${msg}`)
      }
    }
    if (!threw) throw new Error('Duplicate SKU was not rejected!')
  })

  // 11. Duplicate slug is rejected
  await runTest(11, 'Duplicate slug is rejected', async () => {
    let threw = false
    try {
      await productService.createProduct({
        name: `Duplicate Slug Product ${uniqueSuffix}`,
        slug: testSlug, // Same Slug!
        sku: `TL-NEW-SKU-${uniqueSuffix}`,
        categoryId: testCatId,
        description: 'Testing duplicate slug rejection.',
        wholesalePrice: 500,
        gstPercent: 18,
        moq: 10,
        stock: 50,
        status: 'DRAFT',
        featured: false,
        images: [],
        quantityPricing: [],
      })
    } catch (err: unknown) {
      threw = true
      const msg = err instanceof Error ? err.message : ''
      if (!msg.toLowerCase().includes('slug')) {
        throw new Error(`Expected slug error message, got: ${msg}`)
      }
    }
    if (!threw) throw new Error('Duplicate slug was not rejected!')
  })

  // 12. Negative price is rejected
  await runTest(12, 'Negative price is rejected', async () => {
    let rejected = false
    try {
      productSchema.parse({
        name: 'Invalid Negative Price Item',
        slug: 'invalid-neg-price',
        sku: 'TL-NEG-01',
        categoryId: testCatId,
        description: 'Negative price validation test',
        wholesalePrice: -150, // Invalid!
        moq: 10,
        stock: 50,
      })
    } catch {
      rejected = true
    }
    if (!rejected) throw new Error('Negative price passed validation!')
  })

  // 13. Negative stock is rejected
  await runTest(13, 'Negative stock is rejected', async () => {
    let rejected = false
    try {
      productSchema.parse({
        name: 'Invalid Negative Stock Item',
        slug: 'invalid-neg-stock',
        sku: 'TL-NEG-STK',
        categoryId: testCatId,
        description: 'Negative stock validation test',
        wholesalePrice: 500,
        moq: 10,
        stock: -20, // Invalid!
      })
    } catch {
      rejected = true
    }
    if (!rejected) throw new Error('Negative stock passed validation!')
  })

  // 14. Invalid MOQ is rejected
  await runTest(14, 'Invalid MOQ is rejected', async () => {
    let rejected = false
    try {
      productSchema.parse({
        name: 'Invalid MOQ Item',
        slug: 'invalid-moq-test',
        sku: 'TL-MOQ-00',
        categoryId: testCatId,
        description: 'MOQ validation test',
        wholesalePrice: 500,
        moq: 0, // Invalid! Must be >= 1
        stock: 50,
      })
    } catch {
      rejected = true
    }
    if (!rejected) throw new Error('MOQ of 0 or negative passed validation!')
  })

  // 15. Price tier validation works
  await runTest(15, 'Price tier validation works', async () => {
    // 15a: Tier price cannot exceed wholesale price
    const invalidTierTest = tierPricingService.validatePriceTiers(500, 20, [
      { minQty: 20, maxQty: 49, pricePerUnit: 600 }, // Exceeds wholesale price of 500!
    ])
    if (invalidTierTest.valid) {
      throw new Error('Price tier with pricePerUnit > wholesalePrice was incorrectly accepted')
    }

    // 15b: Tier minQty cannot be less than MOQ
    const underMoqTest = tierPricingService.validatePriceTiers(500, 50, [
      { minQty: 20, maxQty: 49, pricePerUnit: 450 }, // Less than MOQ of 50!
    ])
    if (underMoqTest.valid) {
      throw new Error('Price tier with minQty < MOQ was incorrectly accepted')
    }

    // 15c: Calculation verification
    const calc = tierPricingService.calculateB2BPrice(
      {
        wholesalePrice: 550,
        gstPercent: 18,
        moq: 20,
        quantityPricing: [
          { minQty: 20, maxQty: 49, pricePerUnit: 520 },
          { minQty: 50, maxQty: 99, pricePerUnit: 490 },
          { minQty: 100, maxQty: null, pricePerUnit: 450 },
        ],
      },
      60 // 60 falls in the 50-99 tier -> ₹490
    )

    if (calc.appliedUnitPrice !== 490) {
      throw new Error(`Expected applied tier price 490, got ${calc.appliedUnitPrice}`)
    }
    if (calc.savingsPerUnit !== 60) {
      throw new Error(`Expected savings per unit 60, got ${calc.savingsPerUnit}`)
    }
    if (calc.subtotal !== 490 * 60) {
      throw new Error(`Expected subtotal ${490 * 60}, got ${calc.subtotal}`)
    }
  })

  // 16. Archived products are not shown to customers
  await runTest(16, 'Archived products are not shown to customers', async () => {
    // Archive the test product
    await productService.archiveProduct(testProductId)

    // Customer catalog search should not include it
    const catalog = await productService.getCustomerProducts({ search: testSku })
    const foundInCatalog = catalog.products.some((p) => p.id === testProductId)
    if (foundInCatalog) {
      throw new Error('Archived product was returned in public customer catalog!')
    }

    // Direct customer fetch by slug should return null
    const directFetch = await productService.getProductBySlug(testSlug, { isCustomer: true })
    if (directFetch !== null) {
      throw new Error('Archived product was retrievable via public customer endpoint!')
    }

    // Admin should still see it
    const adminFetch = await productService.getProductById(testProductId)
    if (!adminFetch || !adminFetch.isArchived) {
      throw new Error('Archived product should remain accessible to Admin')
    }
  })

  console.log('\n======================================================================')
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length
  console.log(`TEST SUMMARY: ${passedCount}/16 PASSED, ${failedCount} FAILED`)
  console.log('======================================================================')

  if (failedCount > 0) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Test runner encountered unexpected fatal error:', e)
  process.exit(1)
})
