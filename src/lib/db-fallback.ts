import bcrypt from 'bcryptjs'
import {
  ProductType,
  Currency,
  TradeTerm,
  QuotationStatus,
  SampleStatus,
  ProductionStage,
  ManufacturingOrderStatus,
  InspectionStatus,
  CertificationStatus,
  Quotation,
  QuotationFile,
  QuotationMessage,
  SampleOrder,
  ManufacturingOrder,
  ProductionStageLog,
  QualityInspection,
  Certification,
  Order,
  OrderItem,
  PaymentStatus,
  OrderStatus,
  UserRole,
  EmployeeTask,
  AttendanceRecord,
  DailyProgressSummary,
  AuditLog,
} from '@/types'

export interface FallbackCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  imageUrl?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FallbackPriceTier {
  id: string
  productId: string
  minQty: number
  maxQty?: number | null
  pricePerUnit: number
  createdAt: string
  updatedAt: string
}

export interface FallbackProductImage {
  id: string
  productId: string
  url: string
  storagePath?: string | null
  altText?: string | null
  sortOrder: number
  isPrimary: boolean
  createdAt: string
}

export interface FallbackVendor {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  city: string
  state: string
  gstin?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  createdAt: string
  updatedAt: string
}

export interface FallbackProduct {
  id: string
  name: string
  slug: string
  sku: string
  productType: ProductType
  styleCode?: string | null
  categoryId: string
  subcategoryId?: string | null
  subcategory?: string | null
  vendorId?: string | null
  shortDescription?: string | null
  description: string
  specifications?: Record<string, unknown> | null
  brand?: string | null
  color?: string | null
  size?: string | null
  material?: string | null
  moq: number
  wholesalePrice: number
  basePrice?: number
  mrp?: number | null
  gstPercent: number
  stock: number
  weight?: number | null
  dimensions?: string | null
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'
  featured: boolean
  isArchived: boolean
  indicativePriceMin?: number | null
  indicativePriceMax?: number | null
  indicativeCurrency?: Currency
  priceBasis?: string | null
  sampleAvailable?: boolean
  samplePrice?: number | null
  customLogoAvailable?: boolean
  privateLabelAvailable?: boolean
  customPackagingAvailable?: boolean
  customBarcodeAvailable?: boolean
  customizationOptions?: Record<string, unknown> | null
  qualityStandard?: string | null
  createdAt: string
  updatedAt: string
}

export interface FallbackUser {
  id: string
  email: string
  passwordHash: string
  name: string
  phone: string
  businessName: string
  role: UserRole
  isActive: boolean
}

class DbFallbackStore {
  users: FallbackUser[] = []
  categories: FallbackCategory[] = []
  products: FallbackProduct[] = []
  images: FallbackProductImage[] = []
  priceTiers: FallbackPriceTier[] = []
  vendors: FallbackVendor[] = []

  // Phase 3 Collections
  quotations: Quotation[] = []
  quotationFiles: QuotationFile[] = []
  quotationMessages: QuotationMessage[] = []
  sampleOrders: SampleOrder[] = []
  manufacturingOrders: ManufacturingOrder[] = []
  stageLogs: ProductionStageLog[] = []
  inspections: QualityInspection[] = []
  certifications: Certification[] = []

  // Customer Orders, Payments & Invoices
  orders: Order[] = []

  // Employee Operations Collections
  tasks: EmployeeTask[] = []
  attendance: AttendanceRecord[] = []
  progressSummaries: DailyProgressSummary[] = []
  auditLogs: AuditLog[] = []

  constructor() {
    this.seedDefaults()
  }

  private seedDefaults() {
    // Hash password for Admin@123456 and Customer@123456
    const adminHash = bcrypt.hashSync('Admin@123456', 10)
    const customerHash = bcrypt.hashSync('Customer@123456', 10)

    this.users = [
      {
        id: 'usr-superadmin-001',
        email: 'superadmin@tuffloom.com',
        passwordHash: adminHash,
        name: 'Super Admin Officer',
        phone: '9876543200',
        businessName: 'Tuffloom Traders Headquarters',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      {
        id: 'usr-admin-001',
        email: 'admin@tuffloom.com',
        passwordHash: adminHash,
        name: 'Admin User',
        phone: '9876543210',
        businessName: 'Tuffloom Traders Admin',
        role: 'ADMIN',
        isActive: true,
      },
      {
        id: 'usr-employee-001',
        email: 'employee@tuffloom.com',
        passwordHash: adminHash,
        name: 'Vikram Seth',
        phone: '9876543215',
        businessName: 'Tuffloom Floor Operations',
        role: 'EMPLOYEE',
        isActive: true,
      },
      {
        id: 'usr-customer-001',
        email: 'customer@example.com',
        passwordHash: customerHash,
        name: 'Rahul Sharma',
        phone: '9876543211',
        businessName: 'Sharma Retailers',
        role: 'CLIENT',
        isActive: true,
      },
    ]

    // Vendors
    const vApex: FallbackVendor = {
      id: 'ven-001',
      name: 'Apex Craftsmen',
      companyName: 'Apex Leather & Bag Works Pvt Ltd',
      email: 'sales@apexcrafts.com',
      phone: '+91 98200 11223',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      gstin: '09AAACA1234A1Z5',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const vHeritage: FallbackVendor = {
      id: 'ven-002',
      name: 'Heritage Textiles',
      companyName: 'Heritage Weavers & Garments Ltd',
      email: 'b2b@heritagetextiles.com',
      phone: '+91 98300 44556',
      city: 'Surat',
      state: 'Gujarat',
      gstin: '24BBBCB5678B2Z8',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const vStepRight: FallbackVendor = {
      id: 'ven-003',
      name: 'StepRight Footwear',
      companyName: 'StepRight Shoes Corporation',
      email: 'wholesale@stepright.in',
      phone: '+91 98400 77889',
      city: 'Agra',
      state: 'Uttar Pradesh',
      gstin: '09CCCC9988C3Z1',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.vendors = [vApex, vHeritage, vStepRight]

    // Partner Factory Certifications (Admin / Verified display)
    this.certifications = [
      {
        id: 'cert-001',
        certificationName: 'SEDEX SMETA 4-Pillar Ethical Trade Audit',
        vendorId: vApex.id,
        status: 'VERIFIED',
        verificationDate: '2025-06-15',
        expiryDate: '2027-06-14',
        documentUrl: '/uploads/certificates/sedex-apex.pdf',
        publicDisplay: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-002',
        certificationName: 'OEKO-TEX Standard 100 Eco-Passport',
        vendorId: vHeritage.id,
        status: 'VERIFIED',
        verificationDate: '2025-08-10',
        expiryDate: '2026-08-09',
        documentUrl: '/uploads/certificates/oekotex-heritage.pdf',
        publicDisplay: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-003',
        certificationName: 'Leather Working Group (LWG) Gold Rated Facility',
        vendorId: vApex.id,
        status: 'VERIFIED',
        verificationDate: '2025-04-20',
        expiryDate: '2027-04-19',
        documentUrl: '/uploads/certificates/lwg-gold-apex.pdf',
        publicDisplay: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cert-004',
        certificationName: 'BSCI Social Accountability Code of Conduct',
        vendorId: vStepRight.id,
        status: 'VERIFIED',
        verificationDate: '2025-09-01',
        expiryDate: '2027-08-31',
        documentUrl: '/uploads/certificates/bsci-stepright.pdf',
        publicDisplay: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // Main Categories
    const catBags: FallbackCategory = {
      id: 'cat-bags-001',
      name: 'Bags',
      slug: 'bags',
      description: 'Durable and heavy-duty wholesale bags for retail and corporate distribution.',
      imageUrl: '/uploads/categories/bags.jpg',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const catClothing: FallbackCategory = {
      id: 'cat-clothing-002',
      name: 'Clothing',
      slug: 'clothing',
      description: 'Premium quality apparel, t-shirts, jeans, and formal wholesale clothing.',
      imageUrl: '/uploads/categories/clothing.jpg',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const catFootwear: FallbackCategory = {
      id: 'cat-footwear-003',
      name: 'Footwear',
      slug: 'footwear',
      description: 'Wholesale athletic, formal, and casual shoes built for longevity and comfort.',
      imageUrl: '/uploads/categories/footwear.jpg',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.categories.push(catBags, catClothing, catFootwear)

    // Bags Subcategories
    const bagSubs = [
      'Backpacks',
      'Laptop Bags',
      'School Bags',
      'Travel Bags',
      'Duffle Bags',
      'Sling Bags',
      'Ladies Bags',
      'Handbags',
      'Other Bags',
    ]
    bagSubs.forEach((name, idx) => {
      this.categories.push({
        id: `sub-bags-${idx + 1}`,
        name,
        slug: name.toLowerCase().replace(/ /g, '-'),
        description: `Wholesale ${name} catalog`,
        parentId: catBags.id,
        sortOrder: idx + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })

    // Clothing Subcategories
    const clothingSubs = [
      'T-Shirts',
      'Shirts',
      'Jeans',
      'Trousers',
      'Jackets',
      'Hoodies',
      'Dresses',
      'Other Clothing',
    ]
    clothingSubs.forEach((name, idx) => {
      this.categories.push({
        id: `sub-clothing-${idx + 1}`,
        name,
        slug: name.toLowerCase().replace(/ /g, '-'),
        description: `Wholesale ${name} catalog`,
        parentId: catClothing.id,
        sortOrder: idx + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })

    // Footwear Subcategories
    const footwearSubs = [
      'Sneakers',
      'Sports Shoes',
      'Casual Shoes',
      'Sandals',
      'Slippers',
      'Formal Shoes',
      'Other Footwear',
    ]
    footwearSubs.forEach((name, idx) => {
      this.categories.push({
        id: `sub-footwear-${idx + 1}`,
        name,
        slug: name.toLowerCase().replace(/ /g, '-'),
        description: `Wholesale ${name} catalog`,
        parentId: catFootwear.id,
        sortOrder: idx + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })

    // -------------------------------------------------------------------------
    // Products (Both Ready Wholesale & Custom Manufacturing)
    // -------------------------------------------------------------------------

    // P1: Both Ready & Custom Manufacturing
    const p1Id = 'prd-001'
    const p1: FallbackProduct = {
      id: p1Id,
      name: 'Tuffloom Pro Executive Laptop Backpack',
      slug: 'tuffloom-pro-executive-laptop-backpack',
      sku: 'TL-BP-EX01',
      productType: 'BOTH',
      styleCode: 'TL-BAG-0101',
      categoryId: catBags.id,
      subcategoryId: 'sub-bags-2', // Laptop Bags
      subcategory: 'Laptop Bags',
      vendorId: vApex.id,
      shortDescription: 'Water-resistant 15.6" ballistic nylon executive laptop backpack with USB port.',
      description:
        'Engineered for modern professionals and corporate gifting. Features multi-compartment organizers, padded air-mesh back support, TSA lock compatibility, and reinforced stitching. Available for immediate wholesale bulk orders or customized OEM/Private Label manufacturing.',
      brand: 'Tuffloom',
      material: '1680D Ballistic Nylon',
      color: 'Charcoal Black',
      size: '32L',
      weight: 1.1,
      dimensions: '48 x 33 x 18 cm',
      mrp: 1499,
      wholesalePrice: 650,
      basePrice: 650,
      gstPercent: 18,
      moq: 20,
      stock: 450,
      status: 'ACTIVE',
      featured: true,
      isArchived: false,
      indicativePriceMin: 8,
      indicativePriceMax: 12,
      indicativeCurrency: 'USD',
      priceBasis: 'FOB Mumbai',
      sampleAvailable: true,
      samplePrice: 45,
      customLogoAvailable: true,
      privateLabelAvailable: true,
      customPackagingAvailable: true,
      customBarcodeAvailable: true,
      qualityStandard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p1Images: FallbackProductImage[] = [
      {
        id: 'img-001',
        productId: p1Id,
        url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/backpack-front.jpg',
        altText: 'Tuffloom Pro Laptop Backpack - Front View',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'img-002',
        productId: p1Id,
        url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/backpack-side.jpg',
        altText: 'Tuffloom Pro Laptop Backpack - Side & Interior',
        sortOrder: 1,
        isPrimary: false,
        createdAt: new Date().toISOString(),
      },
    ]

    const p1Tiers: FallbackPriceTier[] = [
      {
        id: 'tier-001',
        productId: p1Id,
        minQty: 20,
        maxQty: 49,
        pricePerUnit: 599,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-002',
        productId: p1Id,
        minQty: 50,
        maxQty: 99,
        pricePerUnit: 565,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-003',
        productId: p1Id,
        minQty: 100,
        maxQty: 499,
        pricePerUnit: 525,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-004',
        productId: p1Id,
        minQty: 500,
        maxQty: null,
        pricePerUnit: 495,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // P2: Ready Wholesale Only
    const p2Id = 'prd-002'
    const p2: FallbackProduct = {
      id: p2Id,
      name: 'Heavy Duty Waterproof Canvas Duffle Bag',
      slug: 'heavy-duty-waterproof-canvas-duffle-bag',
      sku: 'TL-DF-HD02',
      productType: 'READY_WHOLESALE',
      styleCode: 'TL-BAG-0102',
      categoryId: catBags.id,
      subcategoryId: 'sub-bags-5', // Duffle Bags
      subcategory: 'Duffle Bags',
      vendorId: vApex.id,
      shortDescription: 'Rugged 55L travel duffle with dedicated shoe compartment.',
      description:
        'Built for rigorous travel and sports teams. Heavy-duty metal zippers, detachable padded shoulder strap, and waterproof bottom lining.',
      brand: 'Tuffloom',
      material: 'Military Canvas + PU Leather',
      color: 'Army Olive',
      size: '55L',
      weight: 1.4,
      dimensions: '56 x 30 x 28 cm',
      mrp: 1899,
      wholesalePrice: 780,
      basePrice: 780,
      gstPercent: 18,
      moq: 15,
      stock: 320,
      status: 'ACTIVE',
      featured: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p2Images: FallbackProductImage[] = [
      {
        id: 'img-003',
        productId: p2Id,
        url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/duffle-front.jpg',
        altText: 'Heavy Duty Duffle Bag',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]

    const p2Tiers: FallbackPriceTier[] = [
      {
        id: 'tier-005',
        productId: p2Id,
        minQty: 15,
        maxQty: 49,
        pricePerUnit: 740,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-006',
        productId: p2Id,
        minQty: 50,
        maxQty: null,
        pricePerUnit: 690,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // P3: Custom Manufacturing Only: Full-Grain Leather Briefcase
    const p3Id = 'prd-003'
    const p3: FallbackProduct = {
      id: p3Id,
      name: 'Custom Handcrafted Leather Executive Briefcase',
      slug: 'custom-handcrafted-leather-executive-briefcase',
      sku: 'TL-LT-BF03',
      productType: 'CUSTOM_MANUFACTURING',
      styleCode: 'TL-BAG-0201',
      categoryId: catBags.id,
      subcategoryId: 'sub-bags-2', // Laptop Bags
      subcategory: 'Laptop Bags',
      vendorId: vApex.id,
      shortDescription: 'Bespoke full-grain vegetable-tanned leather briefcase tailored for luxury private labels.',
      description:
        'Manufactured to client exact specifications. Options include vegetable tanned full-grain cow leather, solid brass hardware, personalized debossed logos, custom jacquard inner lining, and bespoke retail luxury packaging boxes.',
      brand: 'Tuffloom Private Label',
      material: 'Full-Grain Cow Leather',
      color: 'Cognac Brown / Saddle Tan / Black',
      size: '16" Laptop Capacity',
      weight: 1.6,
      dimensions: '42 x 31 x 10 cm',
      mrp: null,
      wholesalePrice: 0,
      basePrice: 0,
      gstPercent: 18,
      moq: 100,
      stock: 0,
      status: 'ACTIVE',
      featured: true,
      isArchived: false,
      indicativePriceMin: 24,
      indicativePriceMax: 38,
      indicativeCurrency: 'USD',
      priceBasis: 'FOB Mumbai',
      sampleAvailable: true,
      samplePrice: 75,
      customLogoAvailable: true,
      privateLabelAvailable: true,
      customPackagingAvailable: true,
      customBarcodeAvailable: true,
      qualityStandard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p3Images: FallbackProductImage[] = [
      {
        id: 'img-004',
        productId: p3Id,
        url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/leather-briefcase.jpg',
        altText: 'Custom Handcrafted Leather Briefcase',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]

    // P4: Custom Manufacturing: French Terry Heavyweight Hoodie
    const p4Id = 'prd-004'
    const p4: FallbackProduct = {
      id: p4Id,
      name: 'Custom 400 GSM French Terry Heavyweight Hoodie',
      slug: 'custom-400-gsm-french-terry-heavyweight-hoodie',
      sku: 'TL-HD-FT04',
      productType: 'CUSTOM_MANUFACTURING',
      styleCode: 'TL-APP-0301',
      categoryId: catClothing.id,
      subcategoryId: 'sub-clothing-6', // Hoodies
      subcategory: 'Hoodies',
      vendorId: vHeritage.id,
      shortDescription: 'Luxury streetwear heavyweight custom hoodie with custom dye, puff print & embroidery.',
      description:
        'Crafted with 100% combed organic cotton 400 GSM French Terry. Supports custom Pantone dip-dye, high-density screen printing, 3D puff embroidery, woven neck labels, and custom hangtags.',
      brand: 'Tuffloom Manufacturing',
      material: '400 GSM 100% Combed Cotton French Terry',
      color: 'Custom Pantone Matching',
      size: 'XS - 4XL Custom Size Spec',
      weight: 0.85,
      dimensions: 'Custom Tech Pack Spec',
      mrp: null,
      wholesalePrice: 0,
      basePrice: 0,
      gstPercent: 12,
      moq: 200,
      stock: 0,
      status: 'ACTIVE',
      featured: true,
      isArchived: false,
      indicativePriceMin: 11,
      indicativePriceMax: 17,
      indicativeCurrency: 'USD',
      priceBasis: 'FOB Tirupur',
      sampleAvailable: true,
      samplePrice: 35,
      customLogoAvailable: true,
      privateLabelAvailable: true,
      customPackagingAvailable: true,
      customBarcodeAvailable: true,
      qualityStandard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p4Images: FallbackProductImage[] = [
      {
        id: 'img-005',
        productId: p4Id,
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/hoodie-front.jpg',
        altText: 'Custom Heavyweight Hoodie',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]

    // P5: Both: Goodyear Welted Leather Dress Shoes
    const p5Id = 'prd-005'
    const p5: FallbackProduct = {
      id: p5Id,
      name: 'Handcrafted Goodyear-Welted Leather Oxford Shoes',
      slug: 'handcrafted-goodyear-welted-leather-oxford-shoes',
      sku: 'TL-SH-OX05',
      productType: 'BOTH',
      styleCode: 'TL-SHOE-0205',
      categoryId: catFootwear.id,
      subcategoryId: 'sub-footwear-6', // Formal Shoes
      subcategory: 'Formal Shoes',
      vendorId: vStepRight.id,
      shortDescription: 'Classic cap-toe oxford dress shoe with Italian calfskin and Goodyear welt construction.',
      description:
        'Benchmark quality for formal footwear brands. Full calf leather lining, Argentine leather sole, cork filler bed, and hand-finished burnishing. Available in ready stock for fast wholesale distribution and custom private label manufacturing with embossed brand logos.',
      brand: 'Tuffloom',
      material: 'Imported Full-Grain Calfskin Leather',
      color: 'Burnished Tan / Midnight Black',
      size: 'UK 6 - 12',
      weight: 1.2,
      dimensions: '32 x 20 x 12 cm',
      mrp: 4999,
      wholesalePrice: 1850,
      basePrice: 1850,
      gstPercent: 18,
      moq: 25,
      stock: 120,
      status: 'ACTIVE',
      featured: true,
      isArchived: false,
      indicativePriceMin: 28,
      indicativePriceMax: 42,
      indicativeCurrency: 'USD',
      priceBasis: 'FOB Agra',
      sampleAvailable: true,
      samplePrice: 85,
      customLogoAvailable: true,
      privateLabelAvailable: true,
      customPackagingAvailable: true,
      customBarcodeAvailable: true,
      qualityStandard: 'ANSI/ASQ Z1.4 — AQL 2.5',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p5Images: FallbackProductImage[] = [
      {
        id: 'img-006',
        productId: p5Id,
        url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/oxford-shoes.jpg',
        altText: 'Goodyear Welted Oxford Shoes',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]

    const p5Tiers: FallbackPriceTier[] = [
      {
        id: 'tier-007',
        productId: p5Id,
        minQty: 25,
        maxQty: 49,
        pricePerUnit: 1750,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-008',
        productId: p5Id,
        minQty: 50,
        maxQty: null,
        pricePerUnit: 1620,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    this.products.push(p1, p2, p3, p4, p5)
    this.images.push(...p1Images, ...p2Images, ...p3Images, ...p4Images, ...p5Images)
    this.priceTiers.push(...p1Tiers, ...p2Tiers, ...p5Tiers)

    // -------------------------------------------------------------------------
    // Phase 3 Seed Records: Quotations, Samples, Manufacturing Orders
    // -------------------------------------------------------------------------

    // Sample Quotation for Rahul Sharma
    const q1: Quotation = {
      id: 'qt-001',
      quotationNumber: 'QT-2026-0041',
      customerId: 'usr-customer-001',
      customer: {
        id: 'usr-customer-001',
        name: 'Rahul Sharma',
        email: 'customer@example.com',
        businessName: 'Sharma Retailers',
        phone: '9876543211',
      },
      productId: p1Id,
      product: {
        ...p1,
        images: p1Images,
        quantityPricing: p1Tiers,
      },
      categoryId: catBags.id,
      styleCodeSnapshot: 'TL-BAG-0101',
      quantity: 1000,
      targetPrice: 9.0,
      targetCurrency: 'USD',
      material: '1680D Ballistic Nylon',
      materialSpecification: 'PU water-repellent coating, heavy YKK #8 zippers',
      gsm: '320 GSM',
      color: 'Matte Charcoal & Silver Accent',
      designRequirement: 'Custom debossed leather logo patch on front pocket and branded rubber zipper pullers.',
      dimensions: '48 x 33 x 18 cm',
      sizeRequirements: '32 Liter standard volume with padded 15.6" laptop sleeve',
      customLogoRequired: true,
      privateLabelRequired: true,
      customLabelRequired: true,
      packagingRequired: true,
      barcodeRequired: true,
      brandName: 'Apex Nomad',
      logoFileUrl: '/uploads/tech-packs/apex-nomad-logo.png',
      packagingInstructions: 'Individual recyclable polybag with printed SKU barcode sticker; 20 units per 5-ply export carton.',
      labelInstructions: 'Custom woven damask neck label stitched inside main compartment.',
      additionalInstructions: 'Reinforced bar-tack stitching on shoulder strap anchor points.',
      targetDeliveryDate: new Date(Date.now() + 3600000 * 24 * 45).toISOString(),
      destinationCountry: 'United States',
      destinationCity: 'New York',
      destinationPort: 'Port of New York / Newark',
      tradeTerm: 'FOB',
      originPort: 'Nhava Sheva, Mumbai',
      notes: 'Urgent autumn corporate gift release. Sample needed first.',
      adminNotes: 'Supplier Apex Leather confirmed $6.80 factory cost. Tuffloom margin $1.70. High reliability partner.',
      unitPriceQuoted: 8.5,
      setupCostQuoted: 120,
      sampleCostQuoted: 45,
      estimatedLeadDaysQuoted: 35,
      paymentTermsQuoted: '30% Advance Deposit on PO Confirmation, 70% Balance against Bill of Lading & Inspection Pass Certificate',
      validUntil: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
      status: 'QUOTATION_SENT',
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      files: [
        {
          id: 'qf-001',
          quotationId: 'qt-001',
          fileName: 'Apex-Nomad-TechPack-v2.pdf',
          storagePath: 'tech-packs/Apex-Nomad-TechPack-v2.pdf',
          fileType: 'application/pdf',
          fileSize: 4250000,
          uploadedBy: 'Rahul Sharma',
          isPublic: false,
          createdAt: new Date().toISOString(),
        },
      ],
      messages: [
        {
          id: 'qm-001',
          quotationId: 'qt-001',
          senderId: 'usr-customer-001',
          senderType: 'CUSTOMER',
          message: 'Can we expedite prototype sampling within 7 business days?',
          createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        },
        {
          id: 'qm-002',
          quotationId: 'qt-001',
          senderId: 'usr-admin-001',
          senderType: 'ADMIN',
          message: 'Yes Rahul! We have pre-sourced the 1680D nylon. Sample can dispatch in 5 days once confirmed.',
          createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        },
      ],
    }

    // Seed Prototype Sample Order for Rahul Sharma
    const smp1: SampleOrder = {
      id: 'smp-001',
      sampleNumber: 'SMP-2026-0012',
      quotationId: 'qt-001',
      customerId: 'usr-customer-001',
      customer: {
        id: 'usr-customer-001',
        name: 'Rahul Sharma',
        email: 'customer@example.com',
        businessName: 'Sharma Retailers',
      },
      productId: p1Id,
      styleCode: 'TL-BAG-0101',
      quantity: 1,
      samplePrice: 45,
      currency: 'USD',
      shippingDestination: 'Suite 400, 350 5th Ave, New York, NY 10118, USA',
      shippingCharge: 25,
      total: 70,
      paymentStatus: 'PAID',
      sampleStatus: 'DISPATCHED',
      trackingNumber: 'DHL-9921448201',
      courier: 'DHL Express International Priority',
      customerFeedback: 'Awaiting arrival to review stitch tension and debossed logo depth.',
      photos: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800',
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    }

    // Seed Manufacturing Order for Rahul Sharma (In Active Production)
    const mfg1Id = 'mfg-001'
    const mfg1: ManufacturingOrder = {
      id: mfg1Id,
      manufacturingOrderNumber: 'TL-MFG-00031',
      quotationId: 'qt-001',
      customerId: 'usr-customer-001',
      customer: {
        id: 'usr-customer-001',
        name: 'Rahul Sharma',
        email: 'customer@example.com',
        businessName: 'Sharma Retailers',
        phone: '9876543211',
      },
      productId: p1Id,
      vendorId: vApex.id, // Strictly internal
      vendor: vApex, // Filtered out before sending to customer
      styleCode: 'TL-BAG-0101',
      quantity: 1000,
      material: '1680D Ballistic Nylon',
      materialSpecification: 'PU water-repellent coating, heavy YKK #8 zippers',
      gsm: '320 GSM',
      color: 'Charcoal Black & Silver Accent',
      designRequirement: 'Debossed leather logo patch on front pocket and custom rubber pullers.',
      customLogo: true,
      privateLabel: true,
      packaging: true,
      barcode: true,
      destinationCountry: 'United States',
      destinationPort: 'Port of New York / Newark',
      tradeTerm: 'FOB',
      paymentTerms: '30% Advance ($2,550), 70% Pre-Dispatch ($5,950)',
      targetDeliveryDate: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
      unitPrice: 8.5,
      totalAmount: 8500,
      advancePaid: 2550,
      balanceDue: 5950,
      status: 'IN_PRODUCTION',
      currentStage: 'PRODUCTION_IN_PROGRESS',
      progressPercent: 55,
      createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      stageLogs: [
        {
          id: 'log-001',
          manufacturingOrderId: mfg1Id,
          stage: 'ORDER_CONFIRMED',
          title: 'Order Confirmed & Advance Cleared',
          description: '30% advance deposit verified. Production slot locked with manufacturing facility.',
          isCompleted: true,
          updatedBy: 'Admin',
          timestamp: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
        },
        {
          id: 'log-002',
          manufacturingOrderId: mfg1Id,
          stage: 'MATERIAL_SOURCED',
          title: '1680D Ballistic Nylon & Hardware Sourced',
          description: 'Fabric batch passed tensile and hydrostatic water-resistance lab testing.',
          isCompleted: true,
          photos: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
          updatedBy: 'Production Team',
          timestamp: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
        },
        {
          id: 'log-003',
          manufacturingOrderId: mfg1Id,
          stage: 'CUTTING_DONE',
          title: 'Precision Die Cutting Completed',
          description: 'All 1,000 unit pattern sets, strap liners, and internal organizer panels cut.',
          isCompleted: true,
          photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'],
          updatedBy: 'Production Team',
          timestamp: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        },
        {
          id: 'log-004',
          manufacturingOrderId: mfg1Id,
          stage: 'PRODUCTION_IN_PROGRESS',
          title: 'Assembly & Bar-Tack Stitching in Progress',
          description: 'Main body assembly running across 3 lines. Custom brand patches being stitched.',
          isCompleted: false,
          photos: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800'],
          updatedBy: 'QC Lead',
          timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
        {
          id: 'log-005',
          manufacturingOrderId: mfg1Id,
          stage: 'IN_LINE_INSPECTION_30',
          title: '30% In-Line Quality Audit Scheduled',
          description: 'Scheduled for inspection on assembly line.',
          isCompleted: false,
          updatedBy: 'QC Lead',
          timestamp: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
        },
      ],
      inspections: [
        {
          id: 'insp-001',
          inspectionNumber: 'QC-AQL-2026-081',
          manufacturingOrderId: mfg1Id,
          inspectorName: 'Anil Verma (Senior Quality Assurance Lead)',
          inspectionDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          aqlStandard: 'ANSI/ASQ Z1.4 — AQL 2.5 Normal Single Sampling',
          totalChecked: 125,
          totalPassed: 123,
          totalDefective: 2,
          defectDetails: {
            minor: 2,
            major: 0,
            critical: 0,
            notes: 'Minor thread ends trimmed immediately on line. Zero structural defects.',
          },
          status: 'PASSED',
          reportFileUrl: '/uploads/inspections/AQL25-Report-TL-MFG-00031.pdf',
          photos: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }

    this.quotations.push(q1)
    this.sampleOrders.push(smp1)
    this.manufacturingOrders.push(mfg1)

    // Ready Wholesale Order for Rahul Sharma (to test unified My Account)
    const o1: Order = {
      id: 'ord-001',
      orderNumber: 'ORD-2026-1001',
      items: [
        {
          id: 'item-001',
          productName: 'Heavy Duty Waterproof Canvas Duffle Bag',
          productSku: 'TL-DF-HD02',
          unitPrice: 740,
          gstPercent: 18,
          quantity: 20,
          totalPrice: 14800,
        },
      ],
      subtotal: 14800,
      gstAmount: 2664,
      shippingAmount: 450,
      grandTotal: 17914,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
      billingAddressSnapshot: {
        name: 'Rahul Sharma',
        company: 'Sharma Retailers',
        line1: 'Shop 14, Commercial Plaza',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
      },
      shippingAddressSnapshot: {
        name: 'Rahul Sharma',
        line1: 'Shop 14, Commercial Plaza',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
      },
    }
    this.orders.push(o1)

    // Seed Sample Employee Operations Data
    this.tasks = [
      {
        id: 'tsk-001',
        title: 'Conduct In-Line QC Check for TL-MFG-00031',
        description: 'Verify seam stitch tension on first batch of 200 bags on line 3.',
        assignedToId: 'usr-employee-001',
        assignedToName: 'Vikram Seth',
        createdById: 'usr-admin-001',
        createdByName: 'Admin User',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        relatedEntityType: 'MANUFACTURING_ORDER',
        relatedEntityId: 'mfg-001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tsk-002',
        title: 'Review Tech Pack BOM for RFQ QT-2026-0045',
        description: 'Cross-check fabric GSM specification against laboratory sample swatches.',
        assignedToId: 'usr-employee-001',
        assignedToName: 'Vikram Seth',
        createdById: 'usr-admin-001',
        createdByName: 'Admin User',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        relatedEntityType: 'QUOTATION',
        relatedEntityId: 'qt-001',
        completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ]

    const todayDate = new Date().toISOString().split('T')[0]
    this.attendance = [
      {
        id: 'att-001',
        employeeId: 'usr-employee-001',
        employeeName: 'Vikram Seth',
        date: todayDate,
        checkInTime: new Date(Date.now() - 3600000 * 7).toISOString(),
        status: 'PRESENT',
        notes: 'Shift A on-site attendance',
        createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      },
    ]

    this.progressSummaries = [
      {
        id: 'prog-001',
        employeeId: 'usr-employee-001',
        employeeName: 'Vikram Seth',
        date: todayDate,
        summaryText: 'Completed stitch verification for 120 pattern sets. Line 3 running at full capacity.',
        tasksCompletedCount: 1,
        ordersWorkedOn: ['TL-MFG-00031'],
        hoursLogged: 7.5,
        blockers: 'None. Material supply is adequate.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    this.auditLogs = [
      {
        id: 'aud-001',
        actorId: 'usr-superadmin-001',
        actorName: 'Super Admin Officer',
        actorRole: 'SUPER_ADMIN',
        action: 'ORDER_PRICE_UPDATE',
        entityType: 'PRODUCT',
        entityId: 'prod-001',
        details: { field: 'wholesalePrice', oldValue: 500, newValue: 550 },
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'aud-002',
        actorId: 'usr-admin-001',
        actorName: 'Admin User',
        actorRole: 'ADMIN',
        action: 'QUOTATION_PROPOSAL_SENT',
        entityType: 'QUOTATION',
        entityId: 'qt-001',
        details: { quotedPrice: 21.5, leadDays: 35 },
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'aud-003',
        actorId: 'usr-employee-001',
        actorName: 'Vikram Seth',
        actorRole: 'EMPLOYEE',
        action: 'TASK_STATUS_UPDATE',
        entityType: 'TASK',
        entityId: 'tsk-002',
        details: { previousStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' },
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ]
  }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }
}

export const dbFallback = new DbFallbackStore()
