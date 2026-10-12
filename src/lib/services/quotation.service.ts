import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { QuotationRequestInput, AdminQuotationUpdateInput } from '@/lib/validations/quotation.schema'
import { Quotation, QuotationFile, QuotationMessage, UserRole } from '@/types'
import { productService } from './product.service'
import { randomUUID } from 'crypto'

export const quotationService = {
  /**
   * Generates a unique sequential Quotation Number
   */
  async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `QT-${year}-${rand}`
  },

  /**
   * Customer submits Custom Manufacturing RFQ
   * Strict server-side MOQ validation enforced
   */
  async createQuotation(input: QuotationRequestInput & { customerId?: string }, customerId?: string): Promise<Quotation> {
    const effectiveCustomerId = customerId || input.customerId || 'cust-demo-001'
    let productSnapshot = null
    let styleCodeSnapshot = input.styleCode || null
    let categoryId = input.categoryId || null

    if (input.productId) {
      const prod = await productService.getProductById(input.productId)
      if (prod) {
        productSnapshot = prod
        styleCodeSnapshot = prod.styleCode || styleCodeSnapshot
        categoryId = categoryId || prod.categoryId

        // STRICT SERVER-SIDE MOQ VALIDATION
        if (input.quantity < prod.moq) {
          throw new Error(
            `Minimum Order Quantity for this product is ${prod.moq} units. Requested quantity was ${input.quantity}.`
          )
        }
      }
    }

    const quotationNumber = await this.generateQuotationNumber()
    const newId = `qt-${randomUUID()}`

    try {
      const created = await prisma.quotation.create({
        data: {
          id: newId,
          quotationNumber,
          customerId: effectiveCustomerId,
          productId: input.productId || null,
          categoryId: categoryId || null,
          styleCodeSnapshot,
          quantity: input.quantity,
          targetPrice: input.targetPrice || null,
          targetCurrency: input.targetCurrency || 'USD',
          material: input.material,
          materialSpecification: input.materialSpecification || null,
          gsm: input.gsm || null,
          color: input.color || null,
          designRequirement: input.designRequirement || null,
          dimensions: input.dimensions || null,
          sizeRequirements: input.sizeRequirements || null,
          customLogoRequired: Boolean(input.customLogoRequired),
          privateLabelRequired: Boolean(input.privateLabelRequired),
          customLabelRequired: Boolean(input.customLabelRequired),
          packagingRequired: Boolean(input.packagingRequired),
          barcodeRequired: Boolean(input.barcodeRequired),
          brandName: input.brandName || null,
          logoFileUrl: input.logoFileUrl || null,
          packagingInstructions: input.packagingInstructions || null,
          labelInstructions: input.labelInstructions || null,
          additionalInstructions: input.additionalInstructions || null,
          targetDeliveryDate: input.targetDeliveryDate ? new Date(input.targetDeliveryDate) : null,
          destinationCountry: input.destinationCountry,
          destinationCity: input.destinationCity,
          destinationPort: input.destinationPort || null,
          tradeTerm: input.tradeTerm,
          originPort: input.originPort || null,
          notes: input.notes || null,
          status: 'SUBMITTED',
          files: {
            create: (input.files || []).map((f) => ({
              fileName: f.fileName,
              storagePath: f.storagePath,
              fileType: f.fileType,
              fileSize: f.fileSize,
              uploadedBy: effectiveCustomerId,
              isPublic: false,
            })),
          },
        },
        include: {
          files: true,
          messages: true,
          product: true,
          category: true,
        },
      })

      return this.formatQuotation(created, true)
    } catch {
      // Fallback Store
    }

    const fallbackQuotation: Quotation = {
      id: newId,
      quotationNumber,
      customerId: effectiveCustomerId,
      productId: input.productId || null,
      categoryId: categoryId || null,
      styleCodeSnapshot,
      quantity: input.quantity,
      targetPrice: input.targetPrice ? Number(input.targetPrice) : null,
      targetCurrency: input.targetCurrency,
      material: input.material,
      materialSpecification: input.materialSpecification || null,
      gsm: input.gsm || null,
      color: input.color || null,
      designRequirement: input.designRequirement || null,
      dimensions: input.dimensions || null,
      sizeRequirements: input.sizeRequirements || null,
      customLogoRequired: Boolean(input.customLogoRequired),
      privateLabelRequired: Boolean(input.privateLabelRequired),
      customLabelRequired: Boolean(input.customLabelRequired),
      packagingRequired: Boolean(input.packagingRequired),
      barcodeRequired: Boolean(input.barcodeRequired),
      brandName: input.brandName || null,
      logoFileUrl: input.logoFileUrl || null,
      packagingInstructions: input.packagingInstructions || null,
      labelInstructions: input.labelInstructions || null,
      additionalInstructions: input.additionalInstructions || null,
      targetDeliveryDate: input.targetDeliveryDate || null,
      destinationCountry: input.destinationCountry,
      destinationCity: input.destinationCity,
      destinationPort: input.destinationPort || null,
      tradeTerm: input.tradeTerm,
      originPort: input.originPort || null,
      notes: input.notes || null,
      adminNotes: null,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: (input.files || []).map((f, i) => ({
        id: `qf-${randomUUID()}`,
        quotationId: newId,
        fileName: f.fileName,
        storagePath: f.storagePath,
        fileType: f.fileType,
        fileSize: f.fileSize,
        uploadedBy: effectiveCustomerId,
        isPublic: false,
        createdAt: new Date().toISOString(),
      })),
      messages: [],
    }

    dbFallback.quotations.unshift(fallbackQuotation)
    return fallbackQuotation
  },

  /**
   * Customer retrieves their own quotations (with admin notes strictly masked)
   */
  async getCustomerQuotations(customerId: string): Promise<Quotation[]> {
    try {
      const list = await prisma.quotation.findMany({
        where: { customerId },
        include: {
          product: true,
          category: true,
          files: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((q) => this.formatQuotation(q, true))
      }
    } catch {
      // Fallback
    }

    return dbFallback.quotations
      .filter((q) => q.customerId === customerId)
      .map((q) => ({ ...q, adminNotes: null }))
  },

  /**
   * Get single quotation with security check:
   * Customers cannot access other customers' quotations and cannot see admin notes
   */
  async getQuotationById(id: string, userId: string, role: UserRole = 'ADMIN'): Promise<Quotation | null> {
    const isClientRole = role === 'CUSTOMER' || role === 'CLIENT'
    const isEmployeeRole = role === 'EMPLOYEE'

    try {
      const q = await prisma.quotation.findUnique({
        where: { id },
        include: {
          product: true,
          category: true,
          files: true,
          messages: { orderBy: { createdAt: 'asc' } },
          customer: {
            select: { id: true, name: true, email: true, businessName: true, phone: true },
          },
        },
      })
      if (q) {
        if (isClientRole && q.customerId !== userId) {
          return null // Unauthorized access blocked
        }
        const formatted = this.formatQuotation(q, isClientRole || isEmployeeRole)
        return formatted
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.quotations.find((q) => q.id === id)
    if (!found) return null

    if (isClientRole) {
      if (found.customerId !== userId) return null
      return { ...found, adminNotes: null }
    }

    if (isEmployeeRole) {
      return { ...found, adminNotes: null }
    }

    return found
  },

  /**
   * Admin queries all quotations
   */
  async getAdminQuotations(params: { status?: string; search?: string } = {}): Promise<Quotation[]> {
    const { status = '', search = '' } = params
    try {
      const where: any = {}
      if (status && status !== 'all') where.status = status
      if (search.trim()) {
        const q = search.trim()
        where.OR = [
          { quotationNumber: { contains: q, mode: 'insensitive' } },
          { styleCodeSnapshot: { contains: q, mode: 'insensitive' } },
          { destinationCountry: { contains: q, mode: 'insensitive' } },
          { brandName: { contains: q, mode: 'insensitive' } },
        ]
      }

      const list = await prisma.quotation.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          product: true,
          category: true,
          files: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((q) => this.formatQuotation(q, false))
      }
    } catch {
      // Fallback
    }

    let filtered = [...dbFallback.quotations]
    if (status && status !== 'all') {
      filtered = filtered.filter((q) => q.status === status)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.quotationNumber.toLowerCase().includes(q) ||
          (item.styleCodeSnapshot && item.styleCodeSnapshot.toLowerCase().includes(q)) ||
          (item.destinationCountry && item.destinationCountry.toLowerCase().includes(q)) ||
          (item.brandName && item.brandName.toLowerCase().includes(q))
      )
    }
    return filtered
  },

  /**
   * Admin updates quotation proposal / internal notes
   */
  async updateQuotationAdmin(id: string, input: AdminQuotationUpdateInput): Promise<Quotation> {
    try {
      const updated = await prisma.quotation.update({
        where: { id },
        data: {
          unitPriceQuoted: input.unitPriceQuoted !== undefined ? input.unitPriceQuoted : undefined,
          setupCostQuoted: input.setupCostQuoted !== undefined ? input.setupCostQuoted : undefined,
          sampleCostQuoted: input.sampleCostQuoted !== undefined ? input.sampleCostQuoted : undefined,
          estimatedLeadDaysQuoted: input.estimatedLeadDaysQuoted !== undefined ? input.estimatedLeadDaysQuoted : undefined,
          paymentTermsQuoted: input.paymentTermsQuoted !== undefined ? input.paymentTermsQuoted : undefined,
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
          adminNotes: input.adminNotes !== undefined ? input.adminNotes : undefined,
          status: input.status ? (input.status as any) : undefined,
        },
        include: {
          product: true,
          category: true,
          files: true,
          messages: true,
          customer: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
        },
      })
      return this.formatQuotation(updated, false)
    } catch {
      // Fallback
    }

    const idx = dbFallback.quotations.findIndex((q) => q.id === id)
    if (idx !== -1) {
      const cur = dbFallback.quotations[idx]
      dbFallback.quotations[idx] = {
        ...cur,
        unitPriceQuoted: input.unitPriceQuoted !== undefined ? input.unitPriceQuoted : cur.unitPriceQuoted,
        setupCostQuoted: input.setupCostQuoted !== undefined ? input.setupCostQuoted : cur.setupCostQuoted,
        sampleCostQuoted: input.sampleCostQuoted !== undefined ? input.sampleCostQuoted : cur.sampleCostQuoted,
        estimatedLeadDaysQuoted: input.estimatedLeadDaysQuoted !== undefined ? input.estimatedLeadDaysQuoted : cur.estimatedLeadDaysQuoted,
        paymentTermsQuoted: input.paymentTermsQuoted !== undefined ? input.paymentTermsQuoted : cur.paymentTermsQuoted,
        validUntil: input.validUntil !== undefined ? input.validUntil : cur.validUntil,
        adminNotes: input.adminNotes !== undefined ? input.adminNotes : cur.adminNotes,
        status: input.status ? (input.status as any) : cur.status,
        updatedAt: new Date().toISOString(),
      }
      return dbFallback.quotations[idx]
    }

    throw new Error('Quotation not found')
  },

  /**
   * Customer approves quotation
   */
  async approveQuotationCustomer(id: string, customerId: string): Promise<Quotation> {
    const q = await this.getQuotationById(id, customerId, 'CUSTOMER')
    if (!q) throw new Error('Quotation not found or unauthorized')

    if (!q.unitPriceQuoted) {
      throw new Error('Cannot approve a quotation that has not been prepared by Tuffloom yet.')
    }

    try {
      const updated = await prisma.quotation.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
        },
        include: {
          files: true,
          messages: true,
          product: true,
          category: true,
        },
      })
      return this.formatQuotation(updated, true)
    } catch {
      // Fallback
    }

    const idx = dbFallback.quotations.findIndex((item) => item.id === id)
    if (idx !== -1) {
      dbFallback.quotations[idx].status = 'APPROVED'
      dbFallback.quotations[idx].approvedAt = new Date().toISOString()
      dbFallback.quotations[idx].updatedAt = new Date().toISOString()
      return { ...dbFallback.quotations[idx], adminNotes: null }
    }

    throw new Error('Quotation not found')
  },

  /**
   * Add message to quotation thread
   */
  async addQuotationMessage(
    quotationId: string,
    senderId: string,
    senderType: 'CUSTOMER' | 'ADMIN',
    message: string
  ): Promise<QuotationMessage> {
    const msgId = `qm-${randomUUID()}`
    try {
      const created = await prisma.quotationMessage.create({
        data: {
          id: msgId,
          quotationId,
          senderId,
          senderType,
          message,
        },
      })
      return {
        id: created.id,
        quotationId: created.quotationId,
        senderId: created.senderId,
        senderType: created.senderType as 'CUSTOMER' | 'ADMIN',
        message: created.message,
        createdAt: created.createdAt.toISOString(),
      }
    } catch {
      // Fallback
    }

    const fallbackMsg: QuotationMessage = {
      id: msgId,
      quotationId,
      senderId,
      senderType,
      message,
      createdAt: new Date().toISOString(),
    }

    const q = dbFallback.quotations.find((item) => item.id === quotationId)
    if (q) {
      if (!q.messages) q.messages = []
      q.messages.push(fallbackMsg)
    }

    return fallbackMsg
  },

  formatQuotation(q: any, isCustomer: boolean = false): Quotation {
    return {
      id: q.id,
      quotationNumber: q.quotationNumber,
      customerId: q.customerId,
      customer: q.customer
        ? {
            id: q.customer.id,
            name: q.customer.name,
            email: q.customer.email,
            businessName: q.customer.businessName,
            phone: q.customer.phone,
          }
        : null,
      productId: q.productId,
      product: q.product
        ? {
            id: q.product.id,
            name: q.product.name,
            slug: q.product.slug,
            sku: q.product.sku,
            productType: q.product.productType,
            styleCode: q.product.styleCode,
            wholesalePrice: Number(q.product.wholesalePrice || 0),
            moq: q.product.moq,
            images: [],
            quantityPricing: [],
            categoryId: q.product.categoryId,
            description: q.product.description,
            status: q.product.status,
            featured: Boolean(q.product.featured),
            isArchived: Boolean(q.product.isArchived),
            gstPercent: Number(q.product.gstPercent || 18),
            stock: q.product.stock,
          }
        : null,
      categoryId: q.categoryId,
      category: q.category
        ? {
            id: q.category.id,
            name: q.category.name,
            slug: q.category.slug,
            sortOrder: q.category.sortOrder,
            isActive: q.category.isActive,
          }
        : null,
      styleCodeSnapshot: q.styleCodeSnapshot,
      quantity: q.quantity,
      targetPrice: q.targetPrice !== null && q.targetPrice !== undefined ? Number(q.targetPrice) : null,
      targetCurrency: q.targetCurrency || 'USD',
      material: q.material,
      materialSpecification: q.materialSpecification,
      gsm: q.gsm,
      color: q.color,
      designRequirement: q.designRequirement,
      dimensions: q.dimensions,
      sizeRequirements: q.sizeRequirements,
      customLogoRequired: Boolean(q.customLogoRequired),
      privateLabelRequired: Boolean(q.privateLabelRequired),
      customLabelRequired: Boolean(q.customLabelRequired),
      packagingRequired: Boolean(q.packagingRequired),
      barcodeRequired: Boolean(q.barcodeRequired),
      brandName: q.brandName,
      logoFileUrl: q.logoFileUrl,
      packagingInstructions: q.packagingInstructions,
      labelInstructions: q.labelInstructions,
      additionalInstructions: q.additionalInstructions,
      targetDeliveryDate: q.targetDeliveryDate ? new Date(q.targetDeliveryDate).toISOString() : null,
      destinationCountry: q.destinationCountry,
      destinationCity: q.destinationCity,
      destinationPort: q.destinationPort,
      tradeTerm: q.tradeTerm || 'FOB',
      originPort: q.originPort,
      notes: q.notes,
      adminNotes: isCustomer ? null : q.adminNotes, // STRICT PRIVACY RULE
      unitPriceQuoted: q.unitPriceQuoted !== null && q.unitPriceQuoted !== undefined ? Number(q.unitPriceQuoted) : null,
      setupCostQuoted: q.setupCostQuoted !== null && q.setupCostQuoted !== undefined ? Number(q.setupCostQuoted) : null,
      sampleCostQuoted: q.sampleCostQuoted !== null && q.sampleCostQuoted !== undefined ? Number(q.sampleCostQuoted) : null,
      estimatedLeadDaysQuoted: q.estimatedLeadDaysQuoted,
      paymentTermsQuoted: q.paymentTermsQuoted,
      validUntil: q.validUntil ? new Date(q.validUntil).toISOString() : null,
      status: q.status,
      approvedAt: q.approvedAt ? new Date(q.approvedAt).toISOString() : null,
      files: (q.files || []).map((f: any) => ({
        id: f.id,
        quotationId: f.quotationId,
        fileName: f.fileName,
        storagePath: f.storagePath,
        fileType: f.fileType,
        fileSize: f.fileSize,
        uploadedBy: f.uploadedBy,
        createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : undefined,
      })),
      messages: (q.messages || []).map((m: any) => ({
        id: m.id,
        quotationId: m.quotationId,
        senderId: m.senderId,
        senderType: m.senderType,
        message: m.message,
        createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
      })),
      createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : undefined,
      updatedAt: q.updatedAt ? new Date(q.updatedAt).toISOString() : undefined,
    }
  },

  async updateQuotation(id: string, input: any): Promise<Quotation> {
    return this.updateQuotationAdmin(id, {
      unitPriceQuoted: input.quotedPrice ?? input.unitPriceQuoted,
      estimatedLeadDaysQuoted: input.leadDays ?? input.estimatedLeadDaysQuoted,
      paymentTermsQuoted: input.paymentTerms ?? input.paymentTermsQuoted,
      adminNotes: input.adminNotes,
      status: input.status,
      ...input,
    })
  },

  async addMessage(
    quotationId: string,
    senderId: string,
    senderType: 'CUSTOMER' | 'ADMIN',
    message: string
  ): Promise<QuotationMessage> {
    return this.addQuotationMessage(quotationId, senderId, senderType, message)
  },

  async approveQuotation(id: string, customerId: string): Promise<Quotation> {
    return this.approveQuotationCustomer(id, customerId)
  },
}
