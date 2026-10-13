'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Package,
  Layers,
  HelpCircle,
  ArrowRight,
  Clock,
  FileCheck,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Product } from '@/types'

function QuotationFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const preselectedProductId = searchParams.get('productId') || ''
  const preselectedStyleCode = searchParams.get('styleCode') || ''

  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Customer Information (prepopulated if logged in or default session)
  const [customerName, setCustomerName] = useState('Rahul Verma')
  const [companyName, setCompanyName] = useState('Verma Retail Enterprises')
  const [businessEmail, setBusinessEmail] = useState('rahul@vermaenterprises.in')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [country, setCountry] = useState('India')
  const [city, setCity] = useState('Mumbai')
  const [businessType, setBusinessType] = useState('Brand / Private Label')

  // Product Requirements
  const [productId, setProductId] = useState(preselectedProductId)
  const [quantity, setQuantity] = useState(500)
  const [color, setColor] = useState('Matte Black / Tan Brown')
  const [numberOfColors, setNumberOfColors] = useState('2')
  const [designRequirement, setDesignRequirement] = useState('Reinforced double-stitch with antique brass hardware')
  const [dimensions, setDimensions] = useState('16 x 12 x 4 inches')
  const [sizeRequirements, setSizeRequirements] = useState('Standard 15.6 inch laptop fit')

  // Raw Material
  const [categoryVertical, setCategoryVertical] = useState('BAGS')
  const [rawMaterial, setRawMaterial] = useState('Full-Grain Cow Leather')
  const [customMaterial, setCustomMaterial] = useState('')
  const [gsm, setGsm] = useState('')
  const [materialSpecification, setMaterialSpecification] = useState('1.4mm vegetable-tanned bovine leather')

  // Target Price
  const [targetPrice, setTargetPrice] = useState(25)
  const [targetCurrency, setTargetCurrency] = useState<'USD' | 'INR'>('USD')

  // Delivery & Trade Terms
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-12-15')
  const [destinationCountry, setDestinationCountry] = useState('United States')
  const [destinationCity, setDestinationCity] = useState('New York')
  const [destinationPort, setDestinationPort] = useState('Port of New York & New Jersey')
  const [tradeTerm, setTradeTerm] = useState<'FOB' | 'CIF' | 'EX_FACTORY'>('FOB')
  const [originPort, setOriginPort] = useState('FOB Mumbai (Nhava Sheva)')
  const [notes, setNotes] = useState('Export packaging with individual silica gel packs and dust bags.')

  // Branding & Private Label
  const [customLogoRequired, setCustomLogoRequired] = useState(true)
  const [privateLabelRequired, setPrivateLabelRequired] = useState(true)
  const [customNeckLabelRequired, setCustomNeckLabelRequired] = useState(false)
  const [customHangTagRequired, setCustomHangTagRequired] = useState(true)
  const [packagingRequired, setPackagingRequired] = useState(true)
  const [customPackagingBoxRequired, setCustomPackagingBoxRequired] = useState(true)
  const [barcodeRequired, setBarcodeRequired] = useState(true)
  const [customProductLabelRequired, setCustomProductLabelRequired] = useState(true)

  const [brandName, setBrandName] = useState('Aura Leather Co.')
  const [packagingInstructions, setPackagingInstructions] = useState('Embossed matte black rigid box with magnetic closure.')
  const [labelInstructions, setLabelInstructions] = useState('Woven high-density inner label with care instructions.')

  // Tech Pack File Upload
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ fileName: string; storagePath: string; fileType: string; fileSize: number }>
  >([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Load available manufacturing products
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetch('/api/products?productType=CUSTOM_MANUFACTURING&limit=50')
        const data = await res.json()
        if (data.success && data.products) {
          setAvailableProducts(data.products)
          if (preselectedProductId) {
            const found = data.products.find((p: Product) => p.id === preselectedProductId)
            if (found) {
              setSelectedProduct(found)
              setProductId(found.id)
              setQuantity(found.moq || 200)
            }
          } else if (data.products.length > 0) {
            setSelectedProduct(data.products[0])
            setProductId(data.products[0].id)
            setQuantity(data.products[0].moq || 200)
          }
        }
      } catch (err) {
        console.error('Failed to load catalog products', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchCatalog()
  }, [preselectedProductId])

  const handleProductChange = (id: string) => {
    setProductId(id)
    const found = availableProducts.find((p) => p.id === id)
    if (found) {
      setSelectedProduct(found)
      if (found.moq && quantity < found.moq) {
        setQuantity(found.moq)
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload/tech-pack', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setUploadedFiles([
          ...uploadedFiles,
          {
            fileName: data.file.fileName,
            storagePath: data.file.storagePath,
            fileType: data.file.fileType,
            fileSize: data.file.fileSize,
          },
        ])
      } else {
        setUploadError(data.error || 'Failed to upload tech pack')
      }
    } catch {
      setUploadError('Network error uploading spec sheet')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    // Server-side MOQ check safety
    if (selectedProduct && quantity < selectedProduct.moq) {
      setFormError(`Minimum order quantity for this product is ${selectedProduct.moq} units.`)
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        productId,
        quantity,
        targetPrice,
        targetCurrency,
        material: customMaterial.trim() || rawMaterial,
        materialSpecification,
        gsm: gsm.trim() || undefined,
        color,
        designRequirement,
        dimensions,
        customLogoRequired,
        privateLabelRequired,
        customLabelRequired: customNeckLabelRequired || customProductLabelRequired,
        packagingRequired,
        barcodeRequired,
        targetDeliveryDate,
        destinationCountry,
        destinationCity,
        destinationPort,
        tradeTerm,
        originPort,
        notes: `${notes}\nBrand: ${brandName}\nPackaging Notes: ${packagingInstructions}\nLabel Notes: ${labelInstructions}`,
        files: uploadedFiles,
      }

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setSubmissionSuccess(`Quotation ${data.data.quotationNumber} submitted successfully!`)
        setTimeout(() => {
          router.push('/account?tab=quotations')
        }, 1800)
      } else {
        setFormError(data.error || 'Failed to submit quotation')
      }
    } catch {
      setFormError('Network error during quotation submission')
    } finally {
      setSubmitting(false)
    }
  }

  const apparelMaterials = [
    '100% Combed Cotton',
    '180 GSM Cotton',
    '200 GSM Cotton',
    '240 GSM French Terry',
    'Cotton Blend (80/20)',
    'Heavyweight Fleece (350 GSM)',
    'Other / Custom Material',
  ]

  const bagMaterials = [
    'Full-Grain Cow Leather',
    'Genuine Top Leather',
    '16 oz Heavy Duty Canvas',
    'PU Synthetic Leather',
    'High-Density Cordura Nylon',
    'Waterproof Polyester 600D',
    'Other / Custom Material',
  ]

  const footwearMaterials = [
    'Full-Grain Leather',
    'Suede Leather',
    'PU Synthetic',
    'Vulcanized Canvas',
    'Rubber Outsole with EVA Midsole',
    'Other / Custom Material',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Contract Manufacturing Spec Sheet & RFQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Request Custom Quotation
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Provide your exact manufacturing requirements, target pricing, branding instructions, and CAD / Tech Pack files. Our engineering team reviews and issues formal quotations within 24–48 business hours.
          </p>
        </div>

        {submissionSuccess ? (
          <div className="bg-white border-2 border-green-500 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">{submissionSuccess}</h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Our sourcing team has received your tech pack and specs. You can review the quotation breakdown, communicate via messaging, and approve prototype samples directly in your customer account.
            </p>
            <div className="pt-2 text-xs font-bold text-orange-600">Redirecting to My Account...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Customer & Business Details */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  1. Buyer & Business Information
                </h3>
                <span className="text-[11px] text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Customer Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Brand / Private Label">Brand / Private Label</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retail Chain">Retail Chain</option>
                    <option value="E-commerce Store">E-commerce Store</option>
                    <option value="Corporate Merchandising">Corporate Merchandising</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Product Selection & Requirements */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  2. Product & Quantity Requirements
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Select Tuffloom Manufacturing Base Product</label>
                  {loadingProducts ? (
                    <div className="text-xs text-gray-400 py-2">Loading products...</div>
                  ) : (
                    <select
                      value={productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium"
                    >
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.styleCode ? `[${p.styleCode}] ` : ''}{p.name} — MOQ: {p.moq} pcs
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedProduct && (
                  <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-orange-950">Active Style Code: </span>
                      <strong className="text-orange-600">{selectedProduct.styleCode || 'TL-CUSTOM'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-600">Enforced Minimum Order Quantity: </span>
                      <strong className="text-gray-900">{selectedProduct.moq} pcs</strong>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Production Quantity (MOQ: {selectedProduct?.moq || 200})
                    </label>
                    <input
                      type="number"
                      required
                      min={selectedProduct?.moq || 100}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || (selectedProduct?.moq || 200))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Color / Pantone Reference</label>
                    <input
                      type="text"
                      required
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. Jet Black / Pantone 19-4007 TPX"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Number of Colors in Run</label>
                    <input
                      type="text"
                      value={numberOfColors}
                      onChange={(e) => setNumberOfColors(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. 2 colorways (300 black / 200 brown)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Product Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. 40cm x 30cm x 12cm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Size Breakdown / Requirements</label>
                    <input
                      type="text"
                      value={sizeRequirements}
                      onChange={(e) => setSizeRequirements(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. S:100, M:200, L:200 or One Size"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Design & Construction Requirements</label>
                  <textarea
                    rows={2}
                    value={designRequirement}
                    onChange={(e) => setDesignRequirement(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Specific construction guidelines, stitch gauge, lining type, or reinforcement points"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Raw Material Selection */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  3. Raw Material & Composition
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Category Vertical selector */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Vertical:</span>
                  {['BAGS', 'APPAREL', 'FOOTWEAR'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setCategoryVertical(v)
                        if (v === 'BAGS') setRawMaterial('Full-Grain Cow Leather')
                        if (v === 'APPAREL') setRawMaterial('240 GSM French Terry')
                        if (v === 'FOOTWEAR') setRawMaterial('Full-Grain Leather')
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        categoryVertical === v
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Configured Raw Material Option</label>
                    <select
                      value={rawMaterial}
                      onChange={(e) => setRawMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-medium"
                    >
                      {(categoryVertical === 'APPAREL'
                        ? apparelMaterials
                        : categoryVertical === 'FOOTWEAR'
                        ? footwearMaterials
                        : bagMaterials
                      ).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Custom Material (if not in predefined options)
                    </label>
                    <input
                      type="text"
                      value={customMaterial}
                      onChange={(e) => setCustomMaterial(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. Organic Recycled Corduroy 320 GSM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">GSM / Thickness Specification</label>
                    <input
                      type="text"
                      value={gsm}
                      onChange={(e) => setGsm(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. 240 GSM or 1.4–1.6mm thickness"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Material Composition Breakdown</label>
                    <input
                      type="text"
                      value={materialSpecification}
                      onChange={(e) => setMaterialSpecification(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. 100% bovine leather with twill cotton lining"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Target Price & Delivery / Trade Terms */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  4. Target Price, Delivery & Trade Terms
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Target Price */}
                <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="font-bold text-gray-900 block mb-1">Target Price Per Unit</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={targetCurrency}
                          onChange={(e) => setTargetCurrency(e.target.value as 'USD' | 'INR')}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-xl font-bold text-base"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
                      <strong>Important Notice:</strong> Target price represents your expected budget. Final Tuffloom quotation will be issued by our pricing desk based on exact raw material indexes and volume.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={targetDeliveryDate}
                      onChange={(e) => setTargetDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Destination Country</label>
                    <input
                      type="text"
                      required
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Destination City</label>
                    <input
                      type="text"
                      required
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Destination Port</label>
                    <input
                      type="text"
                      required
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. Port of Los Angeles"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Incoterms / Trade Term</label>
                    <select
                      value={tradeTerm}
                      onChange={(e) => setTradeTerm(e.target.value as 'FOB' | 'CIF' | 'EX_FACTORY')}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 font-bold"
                    >
                      <option value="FOB">FOB — Free On Board (Customer arranges ocean/air freight)</option>
                      <option value="CIF">CIF — Cost, Insurance & Freight (Tuffloom arranges freight to port)</option>
                      <option value="EX_FACTORY">Ex-Factory — Buyer collects from factory warehouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Origin Port / Loading Hub</label>
                    <input
                      type="text"
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. FOB Mumbai (Nhava Sheva) or FOB Chennai"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Branding & Private Label */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  5. Branding, Private Label & Packaging
                </h3>
                <span className="text-[11px] text-gray-500">Zero Brand Information Leakage</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Checkboxes grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={customLogoRequired}
                      onChange={(e) => setCustomLogoRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Custom Logo</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={privateLabelRequired}
                      onChange={(e) => setPrivateLabelRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Private Label</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={customNeckLabelRequired}
                      onChange={(e) => setCustomNeckLabelRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Neck / Inner Label</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={customHangTagRequired}
                      onChange={(e) => setCustomHangTagRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Custom Hang Tag</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={packagingRequired}
                      onChange={(e) => setPackagingRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Custom Packaging</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={customPackagingBoxRequired}
                      onChange={(e) => setCustomPackagingBoxRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Custom Packaging Box</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={barcodeRequired}
                      onChange={(e) => setBarcodeRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Custom Barcode / UPC</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 active:bg-gray-200 min-h-[48px] select-none transition-colors">
                    <input
                      type="checkbox"
                      checked={customProductLabelRequired}
                      onChange={(e) => setCustomProductLabelRequired(e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 shrink-0"
                    />
                    <span className="font-semibold text-gray-800">Product Care Label</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Registered Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. Aura Leather"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Packaging Instructions</label>
                    <input
                      type="text"
                      value={packagingInstructions}
                      onChange={(e) => setPackagingInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                      placeholder="e.g. Individual polybag with warning text & master cartons of 20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Label & Barcode Instructions</label>
                  <textarea
                    rows={2}
                    value={labelInstructions}
                    onChange={(e) => setLabelInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Specific placement for inner woven label, hang tag strings, or Amazon FNSKU barcode stickers"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Tech Pack / Spec Sheet File Upload */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  6. Tech Pack / CAD / Specification Upload
                </h3>
                <span className="text-[11px] text-gray-500">PDF, AI, CAD, DXF, JPG, PNG (Max 25MB)</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-2xl p-6 text-center space-y-2 transition-colors bg-gray-50">
                  <Upload className="w-8 h-8 text-orange-600 mx-auto" />
                  <div className="font-bold text-gray-800">
                    Upload Technical Pack, CAD Pattern, or Vector Artwork
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Files are encrypted and accessible only by authorized engineering leads.
                  </p>
                  <div className="pt-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 active:bg-gray-200 rounded-xl font-bold text-gray-700 shadow-xs min-h-[44px] transition-colors select-none">
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>Browse Tech Pack / CAD Files</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.ai,.cad,.dxf,.jpg,.jpeg,.png,.svg,.zip"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {uploading && (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading and validating file security attributes...</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-bold text-gray-700">Uploaded Spec Documents ({uploadedFiles.length})</div>
                    <div className="space-y-1.5">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                            <span className="font-medium text-gray-900 truncate">{file.fileName}</span>
                            <span className="text-[10px] text-gray-400">
                              ({(file.fileSize / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>By submitting, you initiate an engineering review. No payment is required until quote approval.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] text-xs sm:text-sm font-black text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing RFQ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Manufacturing Requirements</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function CustomManufacturingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-500">Loading custom quotation form...</div>}>
      <QuotationFormContent />
    </Suspense>
  )
}
