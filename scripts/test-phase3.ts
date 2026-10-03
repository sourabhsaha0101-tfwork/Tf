import { productService } from '../src/lib/services/product.service'
import { quotationService } from '../src/lib/services/quotation.service'
import { sampleService } from '../src/lib/services/sample.service'
import { manufacturingService } from '../src/lib/services/manufacturing.service'
import { ProductType, Currency, TradeTerm, ProductionStage } from '../src/types'

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
  console.log('TUFFLOOM TRADERS — PHASE 3 CUSTOM MANUFACTURING TEST SUITE')
  console.log('Testing: Dual Engine, Style Codes, RFQ, Tech Packs, 11-Stage QC, AQL 2.5')
  console.log('======================================================================\n')

  let testMfgProductId = ''
  let testQuotationId = ''
  let testMfgOrderId = ''
  let testSampleOrderId = ''
  const unique = Date.now().toString().slice(-4)

  // 1. Create a CUSTOM_MANUFACTURING product with Tuffloom Style Code & Indicative Pricing
  await runTest(1, 'Admin creates Custom Manufacturing product with Style Code', async () => {
    const p = await productService.createProduct({
      name: `Custom Rugged Expedition Pack ${unique}`,
      slug: `custom-rugged-pack-${unique}`,
      sku: `TL-SKU-CUSTOM-${unique}`,
      productType: 'CUSTOM_MANUFACTURING',
      styleCode: `TL-BAG-TEST${unique}`,
      categoryId: 'cat-bags-001',
      brand: 'Tuffloom Pro',
      shortDescription: 'Contract manufactured modular expedition backpack',
      description: 'Engineered for extreme durability with high-density ballistic nylon and reinforced webbing.',
      material: '1000D Ballistic Cordura Nylon',
      color: 'Tactical OD Green / Matte Black',
      dimensions: '55 x 35 x 25 cm',
      moq: 300,
      wholesalePrice: 0,
      indicativePriceMin: 18,
      indicativePriceMax: 26,
      indicativeCurrency: 'USD',
      priceBasis: 'FOB',
      sampleAvailable: true,
      samplePrice: 85,
      customLogoAvailable: true,
      privateLabelAvailable: true,
      customPackagingAvailable: true,
      customBarcodeAvailable: true,
      qualityStandard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      status: 'ACTIVE',
      stock: 0,
    })

    if (!p || !p.id) throw new Error('Product creation failed')
    if (p.productType !== 'CUSTOM_MANUFACTURING') throw new Error('Incorrect productType')
    if (p.styleCode !== `TL-BAG-TEST${unique}`) throw new Error('Style code mismatch')
    testMfgProductId = p.id
  })

  // 2. Customer product query masks factory & vendor details
  await runTest(2, 'Customer API query strictly masks factory and vendor metadata', async () => {
    const fetched = await productService.getProductById(testMfgProductId, { isCustomer: true })
    if (!fetched) throw new Error('Product not found')
    if (fetched.vendorId !== null || fetched.vendor !== null) {
      throw new Error('SECURITY VIOLATION: Vendor/Factory data exposed to customer API')
    }
  })

  // 3. MOQ Validation: Customer cannot bypass server-side MOQ validation
  await runTest(3, 'RFQ engine rejects order quantity below product MOQ', async () => {
    try {
      await quotationService.createQuotation({
        customerId: 'cust-demo-001',
        productId: testMfgProductId,
        quantity: 50, // Product MOQ is 300
        material: '1000D Cordura',
        color: 'OD Green',
        destinationCountry: 'USA',
        destinationCity: 'Los Angeles',
        destinationPort: 'Port of LA',
        tradeTerm: 'FOB',
      })
      throw new Error('Should have failed MOQ check')
    } catch (err: any) {
      if (!err.message.toLowerCase().includes('minimum order quantity')) {
        throw err
      }
    }
  })

  // 4. Submit valid Custom Quotation (RFQ) with Tech Pack & Branding requirements
  await runTest(4, 'Buyer submits comprehensive Custom Quotation with Tech Pack & Branding', async () => {
    const q = await quotationService.createQuotation({
      customerId: 'cust-demo-001',
      productId: testMfgProductId,
      quantity: 500,
      targetPrice: 20,
      targetCurrency: 'USD',
      material: '1000D Cordura with 1.4mm leather accents',
      materialSpecification: 'Mil-spec PU coated water-repellent finish',
      gsm: '350 GSM',
      color: 'OD Green',
      designRequirement: 'Double stitch Bartack reinforcement at stress points',
      dimensions: '55 x 35 x 25 cm',
      customLogoRequired: true,
      privateLabelRequired: true,
      customLabelRequired: true,
      packagingRequired: true,
      barcodeRequired: true,
      targetDeliveryDate: '2026-11-30',
      destinationCountry: 'United States',
      destinationCity: 'New York',
      destinationPort: 'Port of NY/NJ',
      tradeTerm: 'FOB',
      originPort: 'FOB Mumbai (Nhava Sheva)',
      notes: 'Customer brand: Apex Overland Co. Custom woven label & gift packaging box required.',
      files: [
        {
          fileName: 'Apex_TechPack_v2.pdf',
          storagePath: '/uploads/tech-packs/apex-techpack.pdf',
          fileType: 'application/pdf',
          fileSize: 1048576,
        },
      ],
    })

    if (!q || !q.id) throw new Error('Quotation creation failed')
    if (!q.quotationNumber.startsWith('QT-')) throw new Error('Invalid quotation number prefix')
    if (q.quantity !== 500) throw new Error('Quotation quantity mismatch')
    if (q.files?.length !== 1) throw new Error('Tech pack file attachment failed')
    testQuotationId = q.id
  })

  // 5. Admin reviews RFQ, adds private internal notes, and sends formal quotation
  await runTest(5, 'Admin prepares quotation proposal and adds private internal notes', async () => {
    const updated = await quotationService.updateQuotation(testQuotationId, {
      quotedPrice: 21.5,
      quotedCurrency: 'USD',
      leadDays: 35,
      paymentTerms: '30% Advance Wire / 70% Against Bill of Lading',
      adminNotes: 'CONFIDENTIAL: Direct factory costing is $15.20 FOB. Internal margin 29.3%.',
      status: 'QUOTATION_SENT',
    })

    if (updated.status !== 'QUOTATION_SENT') throw new Error('Quotation status did not update to QUOTATION_SENT')
    if (updated.unitPriceQuoted !== 21.5) throw new Error('Quoted price mismatch')
    if (updated.adminNotes !== 'CONFIDENTIAL: Direct factory costing is $15.20 FOB. Internal margin 29.3%.') {
      throw new Error('Admin notes did not persist')
    }
  })

  // 6. Security verification: Customer quotation view never exposes adminNotes
  await runTest(6, 'Customer quotation view strictly redacts admin internal notes and factory cost', async () => {
    const customerView = await quotationService.getQuotationById(testQuotationId, 'cust-demo-001', 'CUSTOMER')
    if (!customerView) throw new Error('Quotation not found')
    if (customerView.adminNotes !== null && customerView.adminNotes !== undefined) {
      throw new Error('SECURITY VIOLATION: Confidential admin notes leaked to customer view')
    }
  })

  // 7. Quotation messaging thread
  await runTest(7, 'Customer and Engineering exchange technical clarification messages', async () => {
    const msg = await quotationService.addMessage(
      testQuotationId,
      'cust-demo-001',
      'CUSTOMER',
      'Can we upgrade the main zipper to YKK #10 water-resistant reverse coil?'
    )
    if (!msg || !msg.id) throw new Error('Failed to post quotation message')
    if (msg.senderType !== 'CUSTOMER') throw new Error('Sender type mismatch')
  })

  // 8. Customer approves quotation
  await runTest(8, 'Customer approves quotation proposal', async () => {
    const approved = await quotationService.approveQuotation(testQuotationId, 'cust-demo-001')
    if (approved.status !== 'APPROVED') throw new Error('Quotation status not APPROVED')
  })

  // 9. Convert approved quotation into Manufacturing Order
  await runTest(9, 'Admin converts approved Quotation into Manufacturing Order', async () => {
    const mfg = await manufacturingService.convertQuotationToOrder(testQuotationId, 'admin-user-001')
    if (!mfg || !mfg.id) throw new Error('Manufacturing order creation failed')
    if (!mfg.manufacturingOrderNumber.startsWith('TL-MFG-')) throw new Error('Invalid MFG order number')
    if (mfg.quantity !== 500) throw new Error('MFG order quantity mismatch')
    if (mfg.currentStage !== 'ORDER_CONFIRMED') throw new Error('Initial stage must be ORDER_CONFIRMED')
    testMfgOrderId = mfg.id
  })

  // 10. Advance through 11 Production Stages with milestone notes and photos
  await runTest(10, 'Advance production stages: Raw Material Sourced -> Cutting -> In Progress', async () => {
    await manufacturingService.updateStage(
      testMfgOrderId,
      'RAW_MATERIAL_SOURCED',
      'Ballistic nylon rolls received and passed tensile strength lab inspection.',
      ['https://images.unsplash.com/photo-1584917865442-de89df76afd3'],
      'Factory QC Lead'
    )

    await manufacturingService.updateStage(
      testMfgOrderId,
      'CUTTING_DONE',
      'Laser cutting completed for 500 sets of pattern panels.',
      [],
      'Production Floor Supervisor'
    )

    const inProgress = await manufacturingService.updateStage(
      testMfgOrderId,
      'PRODUCTION_IN_PROGRESS',
      'Assembly on primary stitch line. Bartack stitching in progress.',
      ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62'],
      'Factory QC Lead'
    )

    if (inProgress.currentStage !== 'PRODUCTION_IN_PROGRESS') {
      throw new Error('Stage did not update to PRODUCTION_IN_PROGRESS')
    }
    if (!inProgress.stageLogs || inProgress.stageLogs.length < 3) {
      throw new Error('Stage logs history was not maintained')
    }
  })

  // 11. Log ANSI/ASQ Z1.4 — AQL 2.5 Inspection Report
  await runTest(11, 'Log ANSI/ASQ Z1.4 — AQL 2.5 Quality Inspection Report', async () => {
    const inspection = await manufacturingService.submitInspection(testMfgOrderId, {
      inspectionType: 'FINAL_AQL_2_5',
      standard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      sampleSize: 80,
      criticalDefects: 0,
      majorDefects: 1,
      minorDefects: 2,
      status: 'PASSED',
      reportUrl: '/uploads/inspections/aql-2-5-pass-cert.pdf',
      notes: 'General Inspection Level II passed. All critical and major defect thresholds strictly honored.',
      inspector: 'Tuffloom Global QA Auditor',
    })

    if (!inspection || inspection.status !== 'PASSED') {
      throw new Error('AQL 2.5 inspection submission failed')
    }
    if (inspection.aqlStandard !== 'ANSI/ASQ Z1.4 — AQL 2.5') {
      throw new Error('Inspection standard mismatch')
    }
  })

  // 12. Record Dispatch, Freight Carrier, Tracking & Bill of Lading
  await runTest(12, 'Log ocean freight dispatch, tracking, and Bill of Lading', async () => {
    const dispatched = await manufacturingService.updateDispatch(testMfgOrderId, {
      freightProvider: 'Maersk Line / Ocean Freight',
      trackingNumber: 'MSKU-NYC-998822',
      dispatchDate: '2026-10-15',
      billOfLadingUrl: '/uploads/shipping/ocean-bol-998822.pdf',
    })

    if (dispatched.freightProvider !== 'Maersk Line / Ocean Freight') {
      throw new Error('Carrier not saved')
    }
    if (dispatched.trackingNumber !== 'MSKU-NYC-998822') {
      throw new Error('Tracking number not saved')
    }
    if (dispatched.currentStage !== 'DISPATCHED') {
      throw new Error('Order stage did not advance to DISPATCHED')
    }
  })

  // 13. Prototype Sample Order & Payment confirmation
  await runTest(13, 'Create and pay for prototype sample order with tracking', async () => {
    const sample = await sampleService.createSampleOrder(
      {
        productId: testMfgProductId,
        styleCode: `TL-BAG-TEST${unique}`,
        quantity: 1,
        samplePrice: 85,
        currency: 'USD',
        shippingDestination: 'Verma HQ, Nariman Point, Mumbai 400021',
        shippingCharge: 25,
      },
      'cust-demo-001'
    )

    if (!sample || !sample.sampleNumber.startsWith('SMP-')) {
      throw new Error('Sample order creation failed')
    }
    testSampleOrderId = sample.id

    // Confirm sample payment
    const paid = await sampleService.confirmPayment(sample.id, 'RAZORPAY', 'TXN-SMP-TEST-009')
    if (paid.paymentStatus !== 'PAID') throw new Error('Sample payment confirmation failed')
    if (paid.sampleStatus !== 'PAYMENT_CONFIRMED') throw new Error('Sample status did not update to PAYMENT_CONFIRMED')

    // Admin updates courier
    const dispatchedSample = await sampleService.updateSampleOrder(sample.id, {
      sampleStatus: 'DISPATCHED',
      courier: 'DHL Express',
      trackingNumber: 'DHL-EXP-440011',
    })
    if (dispatchedSample.trackingNumber !== 'DHL-EXP-440011') {
      throw new Error('Sample tracking number failed to update')
    }
  })

  // 14. Unified Customer Account Dashboard metrics
  await runTest(14, 'Customer Dashboard returns consolidated metrics across both models', async () => {
    const mfgList = await manufacturingService.getCustomerManufacturingOrders('cust-demo-001')
    if (mfgList.length === 0) throw new Error('Customer manufacturing orders missing')

    const qList = await quotationService.getCustomerQuotations('cust-demo-001')
    if (qList.length === 0) throw new Error('Customer quotations missing')

    const sList = await sampleService.getCustomerSampleOrders('cust-demo-001')
    if (sList.length === 0) throw new Error('Customer sample orders missing')
  })

  // 15. Customer isolation: Cross-customer access is denied
  await runTest(15, 'Strict customer data isolation prevents cross-tenant data leakage', async () => {
    const alienOrder = await manufacturingService.getManufacturingOrderById(
      testMfgOrderId,
      'cust-alien-999', // Different customer ID
      'CUSTOMER'
    )
    if (alienOrder !== null) {
      throw new Error('SECURITY VIOLATION: Customer can view another customer manufacturing order')
    }
  })

  // Summary
  console.log('\n======================================================================')
  console.log('PHASE 3 TEST EXECUTION SUMMARY')
  console.log('======================================================================')
  const passedCount = results.filter((r) => r.passed).length
  const failedCount = results.filter((r) => !r.passed).length
  console.log(`Total Test Cases: ${results.length}`)
  console.log(`Passed:           ${passedCount}`)
  console.log(`Failed:           ${failedCount}`)

  if (failedCount > 0) {
    console.error('\nFAILURE DETECTED in Phase 3 test cases. Please inspect above logs.')
    process.exit(1)
  } else {
    console.log('\nALL 15 PHASE 3 AUTOMATED TESTS PASSED SUCCESSFULLY! ✓')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
