import bcrypt from 'bcryptjs'

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
  role: 'ADMIN' | 'CUSTOMER'
  isActive: boolean
}

class DbFallbackStore {
  users: FallbackUser[] = []
  categories: FallbackCategory[] = []
  products: FallbackProduct[] = []
  images: FallbackProductImage[] = []
  priceTiers: FallbackPriceTier[] = []
  vendors: FallbackVendor[] = []

  constructor() {
    this.seedDefaults()
  }

  private seedDefaults() {
    // Hash password for Admin@123456 and Customer@123456
    const adminHash = bcrypt.hashSync('Admin@123456', 10)
    const customerHash = bcrypt.hashSync('Customer@123456', 10)

    this.users = [
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
        id: 'usr-customer-001',
        email: 'customer@example.com',
        passwordHash: customerHash,
        name: 'Rahul Sharma',
        phone: '9876543211',
        businessName: 'Sharma Retailers',
        role: 'CUSTOMER',
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

    // Seed Sample Initial Products in Bags
    const p1Id = 'prd-001'
    const p1: FallbackProduct = {
      id: p1Id,
      name: 'Tuffloom Pro Executive Laptop Backpack',
      slug: 'tuffloom-pro-executive-laptop-backpack',
      sku: 'TL-BP-EX01',
      categoryId: catBags.id,
      subcategoryId: 'sub-bags-2', // Laptop Bags
      subcategory: 'Laptop Bags',
      vendorId: vApex.id,
      shortDescription: 'Water-resistant 15.6" ballistic nylon executive laptop backpack with USB port.',
      description:
        'Engineered for modern professionals and corporate gifting. Features multi-compartment organizers, padded air-mesh back support, TSA lock compatibility, and reinforced stitching.',
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

    const p2Id = 'prd-002'
    const p2: FallbackProduct = {
      id: p2Id,
      name: 'Heavy Duty Waterproof Canvas Duffle Bag',
      slug: 'heavy-duty-waterproof-canvas-duffle-bag',
      sku: 'TL-DF-HD02',
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

    const p3Id = 'prd-003'
    const p3: FallbackProduct = {
      id: p3Id,
      name: 'Ergonomic Waterproof Kids School Bag',
      slug: 'ergonomic-waterproof-kids-school-bag',
      sku: 'TL-SB-KD03',
      categoryId: catBags.id,
      subcategoryId: 'sub-bags-3', // School Bags
      subcategory: 'School Bags',
      vendorId: vApex.id,
      shortDescription: 'Lightweight spine-protecting school backpack with high-visibility reflective strips.',
      description:
        'Designed specifically for growing students. S-curve ergonomic shoulder straps, waterproof polyester fabric, and multiple stationery dividers.',
      brand: 'Tuffloom',
      material: 'Waterproof Polyester',
      color: 'Navy Blue & Teal',
      size: '24L',
      weight: 0.75,
      dimensions: '42 x 30 x 16 cm',
      mrp: 999,
      wholesalePrice: 380,
      basePrice: 380,
      gstPercent: 18,
      moq: 50,
      stock: 800,
      status: 'ACTIVE',
      featured: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const p3Images: FallbackProductImage[] = [
      {
        id: 'img-004',
        productId: p3Id,
        url: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&auto=format&fit=crop&q=80',
        storagePath: 'products/schoolbag-front.jpg',
        altText: 'Ergonomic School Backpack',
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ]

    const p3Tiers: FallbackPriceTier[] = [
      {
        id: 'tier-007',
        productId: p3Id,
        minQty: 50,
        maxQty: 99,
        pricePerUnit: 360,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tier-008',
        productId: p3Id,
        minQty: 100,
        maxQty: null,
        pricePerUnit: 330,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    this.products.push(p1, p2, p3)
    this.images.push(...p1Images, ...p2Images, ...p3Images)
    this.priceTiers.push(...p1Tiers, ...p2Tiers, ...p3Tiers)
  }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }
}

export const dbFallback = new DbFallbackStore()
