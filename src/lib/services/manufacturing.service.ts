import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import {
  UpdateProductionStageInput,
  CreateInspectionReportInput,
  UpdateDispatchInput,
} from '@/lib/validations/manufacturing.schema'
import {
  ManufacturingOrder,
  ProductionStageLog,
  QualityInspection,
  ProductionStage,
} from '@/types'
import { quotationService } from './quotation.service'
import { randomUUID } from 'crypto'

export const manufacturingService = {
  async generateOrderNumber(): Promise<string> {
    const rand = Math.floor(10000 + Math.random() * 90000)
    return `TL-MFG-${rand}`
  },

  async generateInspectionNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const rand = Math.floor(100 + Math.random() * 900)
    return `QC-AQL-${year}-${rand}`
  },

  /**
   * Converts an Approved Quotation into a formal Manufacturing Order
   */
  async createFromQuotation(quotationId: string, vendorId?: string | null): Promise<ManufacturingOrder> {
    const quotation = await quotationService.getQuotationById(quotationId, 'admin', 'ADMIN')
    if (!quotation) throw new Error('Quotation not found')

    if (quotation.status !== 'APPROVED') {
      throw new Error(`Quotation must be in APPROVED status to convert to a Manufacturing Order. Current status: ${quotation.status}`)
    }

    const mfgOrderNumber = await this.generateOrderNumber()
    const newId = `mfg-${randomUUID()}`

    const unitPrice = quotation.unitPriceQuoted || 0
    const totalAmount = unitPrice * quotation.quantity + (quotation.setupCostQuoted || 0)

    try {
      const created = await prisma.$transaction(async (tx) => {
        // 1. Create Manufacturing Order
        const mfg = await tx.manufacturingOrder.create({
          data: {
            id: newId,
            manufacturingOrderNumber: mfgOrderNumber,
            quotationId,
            customerId: quotation.customerId,
            productId: quotation.productId || null,
            vendorId: vendorId || null, // Strictly ADMIN-ONLY factory assignment
            styleCode: quotation.styleCodeSnapshot || 'TL-CUSTOM',
            quantity: quotation.quantity,
            material: quotation.material || null,
            materialSpecification: quotation.materialSpecification || null,
            gsm: quotation.gsm || null,
            color: quotation.color || null,
            designRequirement: quotation.designRequirement || null,
            customLogo: quotation.customLogoRequired,
            privateLabel: quotation.privateLabelRequired,
            packaging: quotation.packagingRequired,
            barcode: quotation.barcodeRequired,
            destinationCountry: quotation.destinationCountry || null,
            destinationPort: quotation.destinationPort || null,
            tradeTerm: quotation.tradeTerm,
            paymentTerms: quotation.paymentTermsQuoted || 'Configurable B2B Terms',
            targetDeliveryDate: quotation.targetDeliveryDate ? new Date(quotation.targetDeliveryDate) : null,
            unitPrice,
            totalAmount,
            advancePaid: 0,
            balanceDue: totalAmount,
            status: 'CONFIRMED',
            currentStage: 'ORDER_CONFIRMED',
            progressPercent: 10,
          },
        })

        // 2. Create initial production stage log
        await tx.productionStageLog.create({
          data: {
            id: `log-${randomUUID()}`,
            manufacturingOrderId: newId,
            stage: 'ORDER_CONFIRMED',
            title: 'Order Confirmed & Production Slot Reserved',
            description: 'Manufacturing order generated from approved customer quotation specifications.',
            isCompleted: true,
            updatedBy: 'System Admin',
          },
        })

        // 3. Update Quotation Status
        await tx.quotation.update({
          where: { id: quotationId },
          data: { status: 'CONVERTED_TO_MANUFACTURING' },
        })

        return mfg
      })

      const full = await this.getManufacturingOrderById(created.id, 'admin', 'ADMIN')
      return full!
    } catch {
      // Fallback
    }

    const fallbackMfg: ManufacturingOrder = {
      id: newId,
      manufacturingOrderNumber: mfgOrderNumber,
      quotationId,
      customerId: quotation.customerId,
      customer: quotation.customer,
      productId: quotation.productId || null,
      product: quotation.product,
      vendorId: vendorId || null,
      vendor: null,
      styleCode: quotation.styleCodeSnapshot || 'TL-CUSTOM',
      quantity: quotation.quantity,
      material: quotation.material || null,
      materialSpecification: quotation.materialSpecification || null,
      gsm: quotation.gsm || null,
      color: quotation.color || null,
      designRequirement: quotation.designRequirement || null,
      customLogo: quotation.customLogoRequired,
      privateLabel: quotation.privateLabelRequired,
      packaging: quotation.packagingRequired,
      barcode: quotation.barcodeRequired,
      destinationCountry: quotation.destinationCountry || null,
      destinationPort: quotation.destinationPort || null,
      tradeTerm: quotation.tradeTerm,
      paymentTerms: quotation.paymentTermsQuoted || 'Configurable B2B Terms',
      targetDeliveryDate: quotation.targetDeliveryDate || null,
      unitPrice,
      totalAmount,
      advancePaid: 0,
      balanceDue: totalAmount,
      status: 'CONFIRMED',
      currentStage: 'ORDER_CONFIRMED',
      progressPercent: 10,
      stageLogs: [
        {
          id: `log-${randomUUID()}`,
          manufacturingOrderId: newId,
          stage: 'ORDER_CONFIRMED',
          title: 'Order Confirmed & Production Slot Reserved',
          description: 'Manufacturing order generated from approved customer quotation specifications.',
          isCompleted: true,
          updatedBy: 'System Admin',
          timestamp: new Date().toISOString(),
        },
      ],
      inspections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dbFallback.manufacturingOrders.unshift(fallbackMfg)
    return fallbackMfg
  },

  /**
   * Customer view: strictly strips vendor details
   */
  async getCustomerManufacturingOrders(customerId: string): Promise<ManufacturingOrder[]> {
    try {
      const list = await prisma.manufacturingOrder.findMany({
        where: { customerId },
        include: {
          product: true,
          stageLogs: { orderBy: { timestamp: 'asc' } },
          inspections: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((m) => this.formatMfgOrder(m, true))
      }
    } catch {
      // Fallback
    }

    return dbFallback.manufacturingOrders
      .filter((m) => m.customerId === customerId)
      .map((m) => ({ ...m, vendorId: null, vendor: null }))
  },

  async getManufacturingOrderById(
    id: string,
    userId: string,
    role: 'CUSTOMER' | 'ADMIN'
  ): Promise<ManufacturingOrder | null> {
    try {
      const mfg = await prisma.manufacturingOrder.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          product: true,
          vendor: true,
          stageLogs: { orderBy: { timestamp: 'asc' } },
          inspections: { orderBy: { createdAt: 'desc' } },
        },
      })
      if (mfg) {
        if (role === 'CUSTOMER' && mfg.customerId !== userId) return null
        return this.formatMfgOrder(mfg, role === 'CUSTOMER')
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.manufacturingOrders.find((m) => m.id === id)
    if (!found) return null
    if (role === 'CUSTOMER') {
      if (found.customerId !== userId) return null
      return { ...found, vendorId: null, vendor: null }
    }
    return found
  },

  async getAdminManufacturingOrders(): Promise<ManufacturingOrder[]> {
    try {
      const list = await prisma.manufacturingOrder.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          product: true,
          vendor: true,
          stageLogs: { orderBy: { timestamp: 'asc' } },
          inspections: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      })
      if (list && list.length > 0) {
        return list.map((m) => this.formatMfgOrder(m, false))
      }
    } catch {
      // Fallback
    }

    return dbFallback.manufacturingOrders
  },

  /**
   * Admin updates 11-step production stage and uploads progress photos
   */
  async updateProductionStage(
    id: string,
    input: UpdateProductionStageInput,
    updatedBy: string = 'Production Lead'
  ): Promise<ManufacturingOrder> {
    const newLogId = `log-${randomUUID()}`

    try {
      await prisma.$transaction([
        prisma.manufacturingOrder.update({
          where: { id },
          data: {
            currentStage: input.stage as any,
            progressPercent: input.progressPercent,
          },
        }),
        prisma.productionStageLog.create({
          data: {
            id: newLogId,
            manufacturingOrderId: id,
            stage: input.stage as any,
            title: input.title,
            description: input.description || null,
            photos: input.photos,
            documents: input.documents,
            updatedBy,
            isCompleted: true,
          },
        }),
      ])

      const full = await this.getManufacturingOrderById(id, 'admin', 'ADMIN')
      return full!
    } catch {
      // Fallback
    }

    const idx = dbFallback.manufacturingOrders.findIndex((m) => m.id === id)
    if (idx !== -1) {
      dbFallback.manufacturingOrders[idx].currentStage = input.stage as ProductionStage
      dbFallback.manufacturingOrders[idx].progressPercent = input.progressPercent
      dbFallback.manufacturingOrders[idx].updatedAt = new Date().toISOString()

      if (!dbFallback.manufacturingOrders[idx].stageLogs) {
        dbFallback.manufacturingOrders[idx].stageLogs = []
      }
      dbFallback.manufacturingOrders[idx].stageLogs!.push({
        id: newLogId,
        manufacturingOrderId: id,
        stage: input.stage as ProductionStage,
        title: input.title,
        description: input.description || null,
        photos: input.photos,
        documents: input.documents,
        updatedBy,
        isCompleted: true,
        timestamp: new Date().toISOString(),
      })
      return dbFallback.manufacturingOrders[idx]
    }

    throw new Error('Manufacturing order not found')
  },

  /**
   * Admin submits ANSI/ASQ Z1.4 — AQL 2.5 Quality Inspection Report
   */
  async submitInspectionReport(
    id: string,
    input: CreateInspectionReportInput
  ): Promise<QualityInspection> {
    const inspectionNumber = await this.generateInspectionNumber()
    const newInspId = `insp-${randomUUID()}`

    try {
      const created = await prisma.qualityInspection.create({
        data: {
          id: newInspId,
          inspectionNumber,
          manufacturingOrderId: id,
          inspectorName: input.inspectorName,
          inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : new Date(),
          aqlStandard: input.aqlStandard,
          totalChecked: input.totalChecked,
          totalPassed: input.totalPassed,
          totalDefective: input.totalDefective,
          defectDetails: input.defectDetails as any,
          status: input.status as any,
          reportFileUrl: input.reportFileUrl || null,
          photos: input.photos,
        },
      })

      // If inspection passed, update stage to FINAL_INSPECTION_AQL25
      if (input.status === 'PASSED') {
        await this.updateProductionStage(
          id,
          {
            stage: 'FINAL_INSPECTION_AQL25',
            title: 'Final ANSI/ASQ Z1.4 — AQL 2.5 Inspection Passed',
            description: `Official QC pass certificate issued by ${input.inspectorName}. Checked: ${input.totalChecked}, Passed: ${input.totalPassed}, Defective: ${input.totalDefective}.`,
            progressPercent: 75,
            photos: input.photos,
            documents: input.reportFileUrl ? [input.reportFileUrl] : [],
          },
          input.inspectorName
        )
      }

      return {
        id: created.id,
        inspectionNumber: created.inspectionNumber,
        manufacturingOrderId: created.manufacturingOrderId,
        inspectorName: created.inspectorName,
        inspectionDate: created.inspectionDate.toISOString(),
        aqlStandard: created.aqlStandard,
        totalChecked: created.totalChecked,
        totalPassed: created.totalPassed,
        totalDefective: created.totalDefective,
        defectDetails: created.defectDetails as any,
        status: created.status as any,
        reportFileUrl: created.reportFileUrl,
        photos: created.photos as any,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      }
    } catch {
      // Fallback
    }

    const fallbackInsp: QualityInspection = {
      id: newInspId,
      inspectionNumber,
      manufacturingOrderId: id,
      inspectorName: input.inspectorName,
      inspectionDate: input.inspectionDate || new Date().toISOString(),
      aqlStandard: input.aqlStandard,
      totalChecked: input.totalChecked,
      totalPassed: input.totalPassed,
      totalDefective: input.totalDefective,
      defectDetails: input.defectDetails,
      status: input.status,
      reportFileUrl: input.reportFileUrl || null,
      photos: input.photos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mfg = dbFallback.manufacturingOrders.find((m) => m.id === id)
    if (mfg) {
      if (!mfg.inspections) mfg.inspections = []
      mfg.inspections.unshift(fallbackInsp)

      if (input.status === 'PASSED') {
        await this.updateProductionStage(
          id,
          {
            stage: 'FINAL_INSPECTION_AQL25',
            title: 'Final ANSI/ASQ Z1.4 — AQL 2.5 Inspection Passed',
            description: `Official QC pass certificate issued by ${input.inspectorName}. Checked: ${input.totalChecked}, Passed: ${input.totalPassed}, Defective: ${input.totalDefective}.`,
            progressPercent: 75,
            photos: input.photos,
            documents: input.reportFileUrl ? [input.reportFileUrl] : [],
          },
          input.inspectorName
        )
      }
    }

    return fallbackInsp
  },

  /**
   * Admin updates final dispatch & shipping details
   */
  async updateDispatch(id: string, input: UpdateDispatchInput): Promise<ManufacturingOrder> {
    try {
      await prisma.manufacturingOrder.update({
        where: { id },
        data: {
          dispatchDate: input.dispatchDate ? new Date(input.dispatchDate) : new Date(),
          freightProvider: input.freightProvider,
          trackingNumber: input.trackingNumber,
          billOfLadingUrl: input.billOfLadingUrl || null,
          dispatchDocuments: input.dispatchDocuments as any,
          currentStage: 'DISPATCHED',
          progressPercent: 90,
          status: 'DISPATCHED',
        },
      })

      await this.updateProductionStage(
        id,
        {
          stage: 'DISPATCHED',
          title: `Consignment Dispatched via ${input.freightProvider}`,
          description: `Tracking / Waybill: ${input.trackingNumber}. Export documentation and Bill of Lading attached.`,
          progressPercent: 90,
          photos: [],
          documents: input.billOfLadingUrl ? [input.billOfLadingUrl] : [],
        },
        'Export Logistics Lead'
      )

      const full = await this.getManufacturingOrderById(id, 'admin', 'ADMIN')
      return full!
    } catch {
      // Fallback
    }

    const idx = dbFallback.manufacturingOrders.findIndex((m) => m.id === id)
    if (idx !== -1) {
      dbFallback.manufacturingOrders[idx].dispatchDate = input.dispatchDate || new Date().toISOString()
      dbFallback.manufacturingOrders[idx].freightProvider = input.freightProvider
      dbFallback.manufacturingOrders[idx].trackingNumber = input.trackingNumber
      dbFallback.manufacturingOrders[idx].billOfLadingUrl = input.billOfLadingUrl || null
      dbFallback.manufacturingOrders[idx].dispatchDocuments = input.dispatchDocuments as any
      dbFallback.manufacturingOrders[idx].currentStage = 'DISPATCHED'
      dbFallback.manufacturingOrders[idx].progressPercent = 90
      dbFallback.manufacturingOrders[idx].status = 'DISPATCHED'

      await this.updateProductionStage(
        id,
        {
          stage: 'DISPATCHED',
          title: `Consignment Dispatched via ${input.freightProvider}`,
          description: `Tracking / Waybill: ${input.trackingNumber}. Export documentation and Bill of Lading attached.`,
          progressPercent: 90,
          photos: [],
          documents: input.billOfLadingUrl ? [input.billOfLadingUrl] : [],
        },
        'Export Logistics Lead'
      )

      return dbFallback.manufacturingOrders[idx]
    }

    throw new Error('Manufacturing order not found')
  },

  formatMfgOrder(m: any, isCustomer: boolean = false): ManufacturingOrder {
    return {
      id: m.id,
      manufacturingOrderNumber: m.manufacturingOrderNumber,
      quotationId: m.quotationId,
      customerId: m.customerId,
      customer: m.customer
        ? {
            id: m.customer.id,
            name: m.customer.name,
            email: m.customer.email,
            businessName: m.customer.businessName,
            phone: m.customer.phone,
          }
        : null,
      productId: m.productId,
      product: m.product
        ? {
            id: m.product.id,
            name: m.product.name,
            slug: m.product.slug,
            sku: m.product.sku,
            productType: m.product.productType,
            styleCode: m.product.styleCode,
            wholesalePrice: Number(m.product.wholesalePrice || 0),
            moq: m.product.moq,
            images: [],
            quantityPricing: [],
            categoryId: m.product.categoryId,
            description: m.product.description,
            status: m.product.status,
            featured: Boolean(m.product.featured),
            isArchived: Boolean(m.product.isArchived),
            gstPercent: Number(m.product.gstPercent || 18),
            stock: m.product.stock,
          }
        : null,
      // CRITICAL ZERO-LEAK RULE: Vendor / factory details strictly masked for customers
      vendorId: isCustomer ? null : m.vendorId,
      vendor: isCustomer ? null : m.vendor,
      styleCode: m.styleCode,
      quantity: m.quantity,
      material: m.material,
      materialSpecification: m.materialSpecification,
      gsm: m.gsm,
      color: m.color,
      designRequirement: m.designRequirement,
      customLogo: Boolean(m.customLogo),
      privateLabel: Boolean(m.privateLabel),
      packaging: Boolean(m.packaging),
      barcode: Boolean(m.barcode),
      destinationCountry: m.destinationCountry,
      destinationPort: m.destinationPort,
      tradeTerm: m.tradeTerm || 'FOB',
      paymentTerms: m.paymentTerms,
      targetDeliveryDate: m.targetDeliveryDate ? new Date(m.targetDeliveryDate).toISOString() : null,
      unitPrice: m.unitPrice !== null && m.unitPrice !== undefined ? Number(m.unitPrice) : null,
      totalAmount: m.totalAmount !== null && m.totalAmount !== undefined ? Number(m.totalAmount) : null,
      advancePaid: m.advancePaid !== null && m.advancePaid !== undefined ? Number(m.advancePaid) : 0,
      balanceDue: m.balanceDue !== null && m.balanceDue !== undefined ? Number(m.balanceDue) : 0,
      status: m.status,
      currentStage: m.currentStage,
      progressPercent: m.progressPercent || 10,
      dispatchDate: m.dispatchDate ? new Date(m.dispatchDate).toISOString() : null,
      freightProvider: m.freightProvider,
      trackingNumber: m.trackingNumber,
      billOfLadingUrl: m.billOfLadingUrl,
      dispatchDocuments: m.dispatchDocuments,
      stageLogs: (m.stageLogs || []).map((l: any) => ({
        id: l.id,
        manufacturingOrderId: l.manufacturingOrderId,
        stage: l.stage,
        title: l.title,
        description: l.description,
        photos: l.photos,
        documents: l.documents,
        updatedBy: l.updatedBy,
        isCompleted: Boolean(l.isCompleted),
        timestamp: l.timestamp ? new Date(l.timestamp).toISOString() : new Date().toISOString(),
      })),
      inspections: (m.inspections || []).map((insp: any) => ({
        id: insp.id,
        inspectionNumber: insp.inspectionNumber,
        manufacturingOrderId: insp.manufacturingOrderId,
        inspectorName: insp.inspectorName,
        inspectionDate: insp.inspectionDate ? new Date(insp.inspectionDate).toISOString() : new Date().toISOString(),
        aqlStandard: insp.aqlStandard,
        totalChecked: insp.totalChecked,
        totalPassed: insp.totalPassed,
        totalDefective: insp.totalDefective,
        defectDetails: insp.defectDetails,
        status: insp.status,
        reportFileUrl: insp.reportFileUrl,
        photos: insp.photos,
        createdAt: insp.createdAt ? new Date(insp.createdAt).toISOString() : undefined,
        updatedAt: insp.updatedAt ? new Date(insp.updatedAt).toISOString() : undefined,
      })),
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
      updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : undefined,
    }
  },

  async convertQuotationToOrder(quotationId: string, vendorId?: string | null): Promise<ManufacturingOrder> {
    return this.createFromQuotation(quotationId, vendorId)
  },

  async updateStage(
    id: string,
    stage: string,
    notes?: string,
    photos?: string[],
    updatedBy?: string
  ): Promise<ManufacturingOrder> {
    const stageWeights: Record<string, number> = {
      ORDER_CONFIRMED: 10,
      RAW_MATERIAL_SOURCED: 20,
      CUTTING_DONE: 35,
      PRODUCTION_IN_PROGRESS: 50,
      IN_LINE_INSPECTION_30: 65,
      FINAL_INSPECTION_AQL: 75,
      FINAL_INSPECTION_AQL25: 75,
      PACKED: 85,
      READY_FOR_DISPATCH: 90,
      DISPATCHED: 95,
      SHIPMENT_IN_TRANSIT: 98,
      DELIVERED: 100,
    }
    return this.updateProductionStage(
      id,
      {
        stage: stage as any,
        title: `Milestone: ${stage}`,
        description: notes,
        progressPercent: stageWeights[stage] || 50,
        photos: photos || [],
        documents: [],
      },
      updatedBy || 'QC Lead'
    )
  },

  async submitInspection(id: string, input: any): Promise<QualityInspection> {
    const sampleSize = input.sampleSize || 80
    const critical = input.criticalDefects || 0
    const major = input.majorDefects || 0
    const minor = input.minorDefects || 0
    return this.submitInspectionReport(id, {
      inspectorName: input.inspector || 'Tuffloom QA Auditor',
      aqlStandard: input.standard || 'ANSI/ASQ Z1.4 — AQL 2.5',
      totalChecked: sampleSize,
      totalPassed: sampleSize - critical - major,
      totalDefective: critical + major,
      defectDetails: { critical, major, minor },
      status: input.status || 'PASSED',
      reportFileUrl: input.reportUrl,
      photos: input.photos || [],
    })
  },
}
