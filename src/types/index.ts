export type UserRole = 'CUSTOMER' | 'ADMIN'

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  imageUrl?: string | null
  parentId?: string | null
  children?: Category[]
  parent?: Category | null
  sortOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  _count?: {
    products?: number
    children?: number
  }
}

export interface ProductImage {
  id: string
  productId?: string
  url: string
  storagePath?: string | null
  altText?: string | null
  sortOrder: number
  isPrimary: boolean
  createdAt?: string
}

export interface QuantityPrice {
  id?: string
  productId?: string
  minQty: number
  maxQty?: number | null
  pricePerUnit: number
  createdAt?: string
  updatedAt?: string
}

export interface Vendor {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  city: string
  state: string
  gstin?: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  categoryId: string
  subcategoryId?: string | null
  subcategory?: string | null
  vendorId?: string | null
  vendor?: Vendor | null
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
  status: ProductStatus
  featured: boolean
  isArchived: boolean
  images: ProductImage[]
  quantityPricing: QuantityPrice[]
  category?: Category | null
  subCategoryRel?: Category | null
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
}

export interface Address {
  id: string
  type: 'BILLING' | 'SHIPPING' | 'BOTH'
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export type OrderStatus = 'ORDER_PLACED' | 'PAYMENT_CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
  id: string
  productName: string
  productSku: string
  unitPrice: number
  gstPercent: number
  quantity: number
  totalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  gstAmount: number
  shippingAmount: number
  grandTotal: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
}

// Placeholder product type for home page display
export interface PlaceholderProduct {
  id: string
  name: string
  sku: string
  price: number
  moq: number
  image: string
  category: string
}
