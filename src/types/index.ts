export type UserRole = 'CUSTOMER' | 'ADMIN'

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  sortOrder: number
  isActive: boolean
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  sortOrder: number
  isPrimary: boolean
}

export interface QuantityPrice {
  minQty: number
  maxQty?: number
  pricePerUnit: number
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  categoryId: string
  subcategory?: string
  description: string
  brand?: string
  color?: string
  size?: string
  material?: string
  moq: number
  basePrice: number
  mrp?: number
  gstPercent: number
  stock: number
  images: ProductImage[]
  quantityPricing: QuantityPrice[]
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'
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
