'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Badge } from '@/components/admin/Badge'
import {
  ArrowLeft,
  Edit2,
  Copy,
  Package,
  Star,
  Building2,
  Layers,
  Sparkles,
  CheckCircle2,
  Percent,
  Loader2,
} from 'lucide-react'
import { Product } from '@/types'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          headers: { 'x-test-role': 'ADMIN' },
        })
        const data = await res.json()
        if (data.success && data.data) {
          setProduct(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  const handleDuplicate = async () => {
    if (!product) return
    try {
      const res = await fetch(`/api/admin/products/${product.id}/duplicate`, {
        method: 'POST',
        headers: { 'x-test-role': 'ADMIN' },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback(`Duplicated as ${data.data?.sku}`)
        setTimeout(() => router.push(`/admin/products/${data.data?.id}`), 1000)
      }
    } catch {
      alert('Failed to duplicate product')
    }
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
        <p className="text-sm">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-16 text-center">
        <h2 className="text-lg font-bold text-gray-800">Product Not Found</h2>
        <Link href="/admin/products" className="text-xs font-semibold text-orange-600 hover:underline mt-2 inline-block">
          Return to products list
        </Link>
      </div>
    )
  }

  const images = product.images || []
  const activeImage = images[activeImageIdx] || images[0]

  return (
    <div>
      <AdminHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} | Wholesale Catalog Inspection`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <button
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" /> Duplicate
            </button>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Product
            </Link>
          </div>
        }
      />

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
        {feedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center p-4 relative shadow-xs">
              {activeImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage.url}
                  alt={activeImage.altText || product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-16 h-16 text-gray-300" />
              )}
              {activeImage?.isPrimary && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-600 text-white shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Primary Thumbnail
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-xl border bg-white overflow-hidden p-1 transition-all ${
                      idx === activeImageIdx
                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Specs & Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                      {product.category?.name || 'Category'}
                    </span>
                    {product.subCategoryRel && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">
                        {product.subCategoryRel.name}
                      </span>
                    )}
                    <Badge status={product.status} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">{product.name}</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
                    <span>SKU: <b className="text-gray-700">{product.sku}</b></span>
                    <span>•</span>
                    <span>Brand: <b className="text-gray-700">{product.brand || 'Tuffloom'}</b></span>
                  </div>
                </div>
              </div>

              {/* Price Callout Banner */}
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-orange-900 font-semibold uppercase tracking-wider">Wholesale Base Price</span>
                  <div className="text-2xl font-black text-orange-600 mt-0.5">
                    ₹{product.wholesalePrice}
                    <span className="text-xs font-normal text-gray-500 ml-1">/ unit</span>
                  </div>
                  {product.mrp && <div className="text-xs text-gray-400 line-through">MRP: ₹{product.mrp}</div>}
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">MOQ</div>
                  <div className="text-base font-bold text-gray-900">{product.moq} units</div>
                  <div className="text-xs text-gray-500 mt-1">GST: {product.gstPercent}%</div>
                </div>
              </div>

              {/* Stock info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">Stock Quantity</div>
                  <div className="text-base font-black text-gray-900 mt-0.5">{product.stock} units</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">Dimensions</div>
                  <div className="text-xs font-bold text-gray-800 mt-1">{product.dimensions || 'Standard'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">Weight</div>
                  <div className="text-xs font-bold text-gray-800 mt-1">
                    {product.weight ? `${product.weight} kg` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.shortDescription && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Short Description</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{product.shortDescription}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Full Description</h4>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Assigned Vendor Details (Private to Admin) */}
              {product.vendor && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Vendor Information (Confidential Admin View)</span>
                  </div>
                  <div className="text-xs text-purple-950 font-semibold">{product.vendor.companyName}</div>
                  <div className="text-xs text-purple-700 mt-0.5">
                    Contact: {product.vendor.name} ({product.vendor.phone}) | Location: {product.vendor.city}, {product.vendor.state}
                  </div>
                </div>
              )}
            </div>

            {/* B2B Tiered Quantity Pricing */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Graduated Bulk Pricing Tiers</h3>
                  <p className="text-xs text-gray-500">Volume pricing applied automatically during order calculation</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                  {product.quantityPricing?.length || 0} Tiers Active
                </span>
              </div>

              {!product.quantityPricing || product.quantityPricing.length === 0 ? (
                <div className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-xl">
                  No tiered volume discounts set for this product.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2.5">Tier</th>
                        <th className="px-4 py-2.5">Quantity Range</th>
                        <th className="px-4 py-2.5">Price / Unit</th>
                        <th className="px-4 py-2.5">Bulk Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {product.quantityPricing.map((t, idx) => {
                        const savings = Math.max(0, product.wholesalePrice - t.pricePerUnit)
                        const pct = product.wholesalePrice > 0 ? Math.round((savings / product.wholesalePrice) * 100) : 0
                        return (
                          <tr key={t.id || idx}>
                            <td className="px-4 py-2.5 font-bold text-gray-900">Tier #{idx + 1}</td>
                            <td className="px-4 py-2.5 font-semibold text-gray-800">
                              {t.minQty} {t.maxQty ? `– ${t.maxQty} pcs` : '+ pcs'}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-orange-600">₹{t.pricePerUnit}</td>
                            <td className="px-4 py-2.5">
                              {pct > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                                  <Percent className="w-3 h-3" /> {pct}% off (Save ₹{savings}/pc)
                                </span>
                              ) : (
                                <span className="text-gray-400">Base</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
