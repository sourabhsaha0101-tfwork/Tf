'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ArrowRight,
  FileText,
  AlertCircle,
  Award,
  ChevronRight,
  ShoppingCart,
  Send,
  Check,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Product } from '@/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Prototype sample modal state
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [sampleSubmitting, setSampleSubmitting] = useState(false)
  const [sampleSuccessMsg, setSampleSuccessMsg] = useState<string | null>(null)
  const [sampleFormData, setSampleFormData] = useState({
    shippingDestination: 'New Delhi, India',
    notes: 'Please dispatch golden seal prototype for leather feel & stitch inspection.',
  })

  // Phase 2 Wholesale Add to Cart state
  const [cartQuantity, setCartQuantity] = useState(100)
  const [cartSuccess, setCartSuccess] = useState(false)

  useEffect(() => {
    if (!slug) return
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${slug}`)
        const data = await res.json()
        if (data.success && data.data) {
          setProduct(data.data)
          const primary =
            data.data.images?.find((img: any) => img.isPrimary)?.url ||
            data.data.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
          setSelectedImage(primary)
          if (data.data.moq) {
            setCartQuantity(data.data.moq)
          }
        } else {
          setError(data.error || 'Product not found')
        }
      } catch (err) {
        setError('Failed to load product specifications')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleOrderSample = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setSampleSubmitting(true)
    try {
      const res = await fetch('/api/sample-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          shippingDestination: sampleFormData.shippingDestination,
          notes: sampleFormData.notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSampleSuccessMsg(`Sample order ${data.data.sampleOrderNumber} created successfully! You can track and pay for it in My Account.`)
        setTimeout(() => {
          router.push('/account?tab=samples')
        }, 1800)
      } else {
        alert(data.error || 'Failed to submit sample order')
      }
    } catch {
      alert('Error connecting to sample order service')
    } finally {
      setSampleSubmitting(false)
    }
  }

  const handleAddToCart = () => {
    setCartSuccess(true)
    setTimeout(() => setCartSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading product specifications...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-xs text-gray-500">{error || 'The requested product could not be located.'}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-xl"
          >
            Return to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const isWholesaleOnly = product.productType === 'READY_WHOLESALE'
  const isMfgOnly = product.productType === 'CUSTOM_MANUFACTURING'
  const isBoth = product.productType === 'BOTH'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/products" className="hover:text-gray-900">Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          {product.category?.name && (
            <>
              <span>{product.category.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </>
          )}
          <span className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Showcase Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={selectedImage || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Tuffloom Public Style Code Tag */}
              {product.styleCode && (
                <div className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur-md text-white text-xs font-black tracking-wider px-3 py-1 rounded-lg border border-gray-700 shadow-md">
                  TUFFLOOM STYLE: {product.styleCode}
                </div>
              )}

              {/* Product Type Indicator */}
              <div className="absolute top-3 right-3">
                {isMfgOnly && (
                  <span className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    Custom Manufacturing
                  </span>
                )}
                {isWholesaleOnly && (
                  <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    Ready Wholesale Stock
                  </span>
                )}
                {isBoth && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    Stock & Custom
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.url
                        ? 'border-orange-500 scale-105'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Standard Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <Award className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-gray-900">Standard: {product.qualityStandard || 'ANSI/ASQ Z1.4 — AQL 2.5'}</div>
                <div className="text-gray-500 text-[11px]">Comprehensive pre-shipment quality audit on every batch</div>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>TUFFLOOM</span>
                <span>•</span>
                <span className="text-orange-600 font-extrabold">{product.styleCode || 'TL-CATALOG'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
              {isMfgOnly ? (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Indicative Price Range
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">
                    {product.indicativeCurrency === 'INR' ? '₹' : '$'}
                    {product.indicativePriceMin || 6} – {product.indicativeCurrency === 'INR' ? '₹' : '$'}
                    {product.indicativePriceMax || 9}{' '}
                    <span className="text-sm font-semibold text-gray-500">
                      {product.priceBasis || 'FOB'}
                    </span>
                  </div>

                  {/* MANDATORY SECTION 4 NOTE */}
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200/80 leading-relaxed">
                    <span className="font-bold text-gray-900">Notice:</span> Final pricing depends on quantity, material,
                    customization, packaging, destination and trade terms.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Wholesale Bulk Price
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900">
                    ₹{product.wholesalePrice.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-medium text-gray-500">/ piece (+ {product.gstPercent}% GST)</span>
                  </div>
                  {isBoth && (
                    <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2 font-medium">
                      Custom manufacturing & private labeling also available for orders exceeding MOQ.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Core Specifications Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">MOQ</span>
                <span className="font-extrabold text-gray-900 text-sm">{product.moq} pcs</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Material</span>
                <span className="font-bold text-gray-900 truncate block">{product.material || 'Custom Specification'}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Color Options</span>
                <span className="font-bold text-gray-900 truncate block">{product.color || 'Custom Pantone'}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Dimensions</span>
                <span className="font-bold text-gray-900 truncate block">{product.dimensions || 'Standard / Custom'}</span>
              </div>
            </div>

            {/* Customization Options Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Customization Capabilities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  {product.privateLabelAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-gray-700">Private Label</span>
                </div>

                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  {product.customLogoAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-gray-700">Custom Logo</span>
                </div>

                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  {product.customPackagingAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-gray-700">Custom Packaging</span>
                </div>

                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200">
                  {product.customBarcodeAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-[11px] font-medium text-gray-700">Custom Barcode</span>
                </div>
              </div>
            </div>

            {/* Volume Pricing Table for Wholesale (Model 1 & Both) */}
            {(isWholesaleOnly || isBoth) && product.quantityPricing && product.quantityPricing.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Wholesale Volume Tiers</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {product.quantityPricing.map((tier) => (
                    <div key={tier.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <div className="text-[10px] text-gray-500 font-semibold">
                        {tier.minQty} {tier.maxQty ? `– ${tier.maxQty}` : '+'} pcs
                      </div>
                      <div className="text-sm font-black text-gray-900 mt-0.5">
                        ₹{Number(tier.pricePerUnit).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs Section: Strictly adhering to Section 4 Rules */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {/* If CUSTOM_MANUFACTURING: ONLY show GET CUSTOM QUOTATION and ORDER PROTOTYPE SAMPLE (DO NOT show Add to Cart!) */}
              {isMfgOnly && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href={`/custom-manufacturing?productId=${product.id}&styleCode=${product.styleCode || ''}`}
                      className="min-h-[48px] py-3 px-4 text-center text-xs font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      GET CUSTOM QUOTATION
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowSampleModal(true)}
                      className="min-h-[48px] py-3 px-4 text-center text-xs font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-orange-600" />
                      ORDER PROTOTYPE SAMPLE
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Prototype Sample: $50–$150 / ₹3,500 including international courier & golden seal approval</span>
                  </div>
                </div>
              )}

              {/* If READY_WHOLESALE: Show ADD TO CART */}
              {isWholesaleOnly && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Quantity (MOQ {product.moq})</label>
                      <input
                        type="number"
                        min={product.moq}
                        value={cartQuantity}
                        onChange={(e) => setCartQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                        className="w-full px-3 py-2.5 min-h-[44px] text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 min-h-[44px] py-3 px-6 text-xs font-black text-white bg-gray-900 hover:bg-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {cartSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Added {cartQuantity} units to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 text-orange-400" />
                          ADD TO CART (₹{(product.wholesalePrice * cartQuantity).toLocaleString('en-IN')})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* If BOTH: Show BOTH ADD TO CART AND GET CUSTOM QUOTATION */}
              {isBoth && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-blue-900">Wholesale Ready Stock</div>
                      <div className="text-[11px] text-blue-700">Immediate dispatch for ready inventory in warehouse</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {cartSuccess ? 'Added to Cart' : `Add ${product.moq} pcs to Cart`}
                    </button>
                  </div>

                  <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-orange-900">Contract Manufacturing</div>
                      <div className="text-[11px] text-orange-700">Custom colors, materials, private label & branding</div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/custom-manufacturing?productId=${product.id}&styleCode=${product.styleCode || ''}`}
                        className="min-h-[44px] px-4 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Get Custom Quotation
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowSampleModal(true)}
                        className="min-h-[44px] px-4 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl flex items-center justify-center shrink-0"
                      >
                        Sample
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Product Description & Manufacturing Specifications */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Manufacturing Capabilities & Technical Details</h3>
          <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed">
            <p>{product.description || 'Custom technical specifications, CAD patterns, and tolerance guidelines are engineered to exact international trade standards.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <span className="font-bold text-gray-900 block">Strict Factory Privacy</span>
              <p className="text-gray-500">Tuffloom enforces zero OEM leak. Public identity remains strictly Tuffloom controlled.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <span className="font-bold text-gray-900 block">ANSI/ASQ Z1.4 Inspection</span>
              <p className="text-gray-500">Milestone 30% in-line QC and final AQL 2.5 defect audits uploaded to your account.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <span className="font-bold text-gray-900 block">Global Trade Terms</span>
              <p className="text-gray-500">FOB Mumbai, FOB Chennai, CIF New York, and Ex-Factory shipping options.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Prototype Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div>
              <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Prototype Sample Request
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                Order Physical Sample ({product.styleCode || product.name})
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Prototype sample: {product.indicativeCurrency === 'INR' ? '₹' : '$'}
                {product.samplePrice || 75} including international courier and lab test report.
              </p>
            </div>

            {sampleSuccessMsg ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <div className="text-xs font-bold text-green-900">{sampleSuccessMsg}</div>
                <div className="text-[11px] text-green-700">Redirecting to My Account...</div>
              </div>
            ) : (
              <form onSubmit={handleOrderSample} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Shipping Destination Address</label>
                  <input
                    type="text"
                    required
                    value={sampleFormData.shippingDestination}
                    onChange={(e) => setSampleFormData({ ...sampleFormData, shippingDestination: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Complete office/warehouse address for sample delivery"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sample Notes / Custom Requirements</label>
                  <textarea
                    rows={3}
                    value={sampleFormData.notes}
                    onChange={(e) => setSampleFormData({ ...sampleFormData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Specific color, zipper brand, or stitching requirements for the prototype sample"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Sample Development & Unit Price:</span>
                    <strong className="text-gray-900">{product.indicativeCurrency === 'INR' ? '₹' : '$'}{product.samplePrice || 75}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Express International Courier:</span>
                    <strong className="text-gray-900">{product.indicativeCurrency === 'INR' ? '₹' : '$'}25</strong>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-gray-900">
                    <span>Total Sample Invoice:</span>
                    <span>{product.indicativeCurrency === 'INR' ? '₹' : '$'}{(product.samplePrice || 75) + 25}</span>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSampleModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sampleSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {sampleSubmitting ? 'Submitting...' : 'Confirm Sample Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
