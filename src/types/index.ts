export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'CUSTOMER'

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'
export type ProductType = 'READY_WHOLESALE' | 'CUSTOM_MANUFACTURING' | 'BOTH'
export type Currency = 'USD' | 'INR'
export type TradeTerm = 'FOB' | 'CIF' | 'EX_FACTORY'

export type QuotationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEED_MORE_INFORMATION'
  | 'SAMPLE_REQUIRED'
  | 'QUOTATION_PREPARED'
  | 'QUOTATION_SENT'
  | 'CUSTOMER_APPROVAL_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED_TO_MANUFACTURING'
  | 'CANCELLED'

export type SampleStatus =
  | 'SAMPLE_REQUESTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'SAMPLE_DEVELOPMENT'
  | 'SAMPLE_READY'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

export type ProductionStage =
  | 'ORDER_CONFIRMED'
  | 'MATERIAL_SOURCED'
  | 'CUTTING_DONE'
  | 'PRODUCTION_IN_PROGRESS'
  | 'IN_LINE_INSPECTION_30'
  | 'FINAL_INSPECTION_AQL25'
  | 'PACKED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'SHIPMENT_IN_TRANSIT'
  | 'DELIVERED'

export type ManufacturingOrderStatus =
  | 'PENDING_ADVANCE'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'INSPECTION'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'

export type InspectionStatus = 'PENDING' | 'PASSED' | 'REWORK_REQUIRED' | 'FAILED'
export type CertificationStatus = 'VERIFIED' | 'EXPIRED' | 'PENDING_REVIEW'

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
  productType: ProductType
  styleCode?: string | null
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

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

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
  billingAddressSnapshot?: Record<string, unknown>
  shippingAddressSnapshot?: Record<string, unknown>
}

export interface PlaceholderProduct {
  id: string
  name: string
  sku: string
  price: number
  moq: number
  image: string
  category: string
}

// ----------------------------------------------------
// PHASE 3: CUSTOM MANUFACTURING INTERFACES
// ----------------------------------------------------

export interface QuotationFile {
  id: string
  quotationId: string
  fileName: string
  storagePath: string
  fileType: string
  fileSize: number
  uploadedBy: string
  isPublic?: boolean
  createdAt?: string
}

export interface QuotationMessage {
  id: string
  quotationId: string
  senderId: string
  senderType: 'CUSTOMER' | 'ADMIN'
  message: string
  createdAt?: string
}

export interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customer?: {
    id: string
    name: string
    email: string
    businessName?: string
    phone?: string
  } | null
  productId?: string | null
  product?: Product | null
  categoryId?: string | null
  category?: Category | null
  styleCodeSnapshot?: string | null
  quantity: number
  targetPrice?: number | null
  targetCurrency: Currency
  material?: string | null
  materialSpecification?: string | null
  gsm?: string | null
  color?: string | null
  designRequirement?: string | null
  dimensions?: string | null
  sizeRequirements?: string | null
  customLogoRequired: boolean
  privateLabelRequired: boolean
  customLabelRequired: boolean
  packagingRequired: boolean
  barcodeRequired: boolean
  brandName?: string | null
  logoFileUrl?: string | null
  packagingInstructions?: string | null
  labelInstructions?: string | null
  additionalInstructions?: string | null
  targetDeliveryDate?: string | null
  destinationCountry?: string | null
  destinationCity?: string | null
  destinationPort?: string | null
  tradeTerm: TradeTerm
  originPort?: string | null
  notes?: string | null
  adminNotes?: string | null // Strictly ADMIN ONLY
  unitPriceQuoted?: number | null
  setupCostQuoted?: number | null
  sampleCostQuoted?: number | null
  estimatedLeadDaysQuoted?: number | null
  paymentTermsQuoted?: string | null
  validUntil?: string | null
  status: QuotationStatus
  approvedAt?: string | null
  files?: QuotationFile[]
  messages?: QuotationMessage[]
  createdAt?: string
  updatedAt?: string
}

export interface SampleOrder {
  id: string
  sampleNumber: string
  quotationId?: string | null
  customerId: string
  customer?: {
    id: string
    name: string
    email: string
    businessName?: string
  } | null
  productId?: string | null
  product?: Product | null
  styleCode: string
  quantity: number
  samplePrice: number
  currency: Currency
  shippingDestination: string
  shippingCharge: number
  total: number
  paymentStatus: PaymentStatus
  sampleStatus: SampleStatus
  trackingNumber?: string | null
  courier?: string | null
  customerFeedback?: string | null
  photos?: string[] | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductionStageLog {
  id: string
  manufacturingOrderId: string
  stage: ProductionStage
  title: string
  description?: string | null
  photos?: string[] | null
  documents?: string[] | null
  updatedBy: string
  isCompleted: boolean
  timestamp: string
}

export interface QualityInspection {
  id: string
  inspectionNumber: string
  manufacturingOrderId: string
  inspectorName: string
  inspectionDate: string
  aqlStandard: string
  totalChecked: number
  totalPassed: number
  totalDefective: number
  defectDetails?: Record<string, unknown> | null
  status: InspectionStatus
  reportFileUrl?: string | null
  photos?: string[] | null
  createdAt?: string
  updatedAt?: string
}

export interface ManufacturingOrder {
  id: string
  manufacturingOrderNumber: string
  quotationId: string
  quotation?: Quotation | null
  customerId: string
  customer?: {
    id: string
    name: string
    email: string
    businessName?: string
    phone?: string
  } | null
  productId?: string | null
  product?: Product | null
  vendorId?: string | null // Strictly ADMIN ONLY
  vendor?: Vendor | null // Strictly ADMIN ONLY
  styleCode: string
  quantity: number
  material?: string | null
  materialSpecification?: string | null
  gsm?: string | null
  color?: string | null
  designRequirement?: string | null
  customLogo: boolean
  privateLabel: boolean
  packaging: boolean
  barcode: boolean
  destinationCountry?: string | null
  destinationPort?: string | null
  tradeTerm: TradeTerm
  paymentTerms?: string | null
  targetDeliveryDate?: string | null
  unitPrice?: number | null
  totalAmount?: number | null
  advancePaid?: number | null
  balanceDue?: number | null
  status: ManufacturingOrderStatus
  currentStage: ProductionStage
  progressPercent: number
  dispatchDate?: string | null
  freightProvider?: string | null
  trackingNumber?: string | null
  billOfLadingUrl?: string | null
  dispatchDocuments?: Array<{ name: string; url: string; date?: string }> | null
  stageLogs?: ProductionStageLog[]
  inspections?: QualityInspection[]
  createdAt?: string
  updatedAt?: string
}

export interface Certification {
  id: string
  certificationName: string
  vendorId?: string | null
  status: CertificationStatus
  verificationDate?: string | null
  expiryDate?: string | null
  documentUrl?: string | null
  publicDisplay: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CustomerDashboardMetrics {
  totalOrders: number
  totalPurchase: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  manufacturingOrders: number
  pendingPayments: number
  recentOrders: Order[]
  recentQuotations: Quotation[]
  recentManufacturingOrders: ManufacturingOrder[]
}

export interface CustomerPaymentRecord {
  id: string
  referenceType: 'READY_WHOLESALE' | 'SAMPLE' | 'MANUFACTURING'
  referenceNumber: string
  amount: number
  currency: Currency
  method: string
  status: PaymentStatus
  paidAt?: string | null
  createdAt: string
}

export interface CustomerInvoiceRecord {
  id: string
  invoiceNumber: string
  referenceType: 'READY_WHOLESALE' | 'MANUFACTURING'
  referenceNumber: string
  grandTotal: number
  subtotal: number
  gstAmount: number
  status: string
  invoiceDate: string
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>
}

// ----------------------------------------------------
// PHASE 3: EMPLOYEE OPERATIONS & RBAC INTERFACES
// ----------------------------------------------------

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface EmployeeTask {
  id: string
  title: string
  description?: string | null
  assignedToId: string
  assignedToName?: string | null
  createdById: string
  createdByName?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  relatedEntityType?: 'MANUFACTURING_ORDER' | 'QUOTATION' | 'INSPECTION' | 'PRODUCT' | 'GENERAL'
  relatedEntityId?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE'

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName?: string | null
  date: string // YYYY-MM-DD
  checkInTime?: string | null
  checkOutTime?: string | null
  status: AttendanceStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface DailyProgressSummary {
  id: string
  employeeId: string
  employeeName?: string | null
  date: string // YYYY-MM-DD
  summaryText: string
  tasksCompletedCount: number
  ordersWorkedOn?: string[] | null
  hoursLogged: number
  blockers?: string | null
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  actorId: string
  actorName?: string | null
  actorRole: UserRole
  action: string
  entityType: string
  entityId: string
  details?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  timestamp: string
}

export interface ProductivityReport {
  period: string
  totalEmployees: number
  totalTasksAssigned: number
  totalTasksCompleted: number
  overallCompletionRate: number
  totalHoursLogged: number
  employeeSummaries: Array<{
    employeeId: string
    employeeName: string
    tasksAssigned: number
    tasksCompleted: number
    completionRate: number
    hoursLogged: number
    attendanceDays: number
  }>
}

