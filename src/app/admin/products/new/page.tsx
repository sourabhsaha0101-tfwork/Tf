'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { PriceTierEditor } from '@/components/admin/PriceTierEditor'
import { ArrowLeft, Save, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { Category, Vendor, ProductImage, QuantityPrice } from '@/types'

export default function NewProductPage() {
  const router = useRouter()

  // Form states
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [brand, setBrand] = useState('Tuffloom')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [weight, setWeight] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [mrp, setMrp] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')
  const [gstPercent, setGstPercent] = useState('18')
  const [moq, setMoq] = useState('20')
  const [stock, setStock] = useState('100')
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'INACTIVE'>('ACTIVE')

  const [images, setImages] = useState<ProductImage[]>([])
  const [quantityPricing, setQuantityPricing] = useState<QuantityPrice[]>([])

  // Category & Vendor data
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])

  // UI status
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, venRes] = await Promise.all([
          fetch('/api/admin/categories', { headers: { 'x-test-role': 'ADMIN' } }),
          fetch('/api/admin/vendors', { headers: { 'x-test-role': 'ADMIN' } }),
        ])
        const catData = await catRes.json()
        const venData = await venRes.json()

        if (catData.success && catData.data?.length > 0) {
          setCategories(catData.data)
          setCategoryId(catData.data[0].id)
          setSubcategories(catData.data[0].children || [])
          if (catData.data[0].children?.length > 0) {
            setSubcategoryId(catData.data[0].children[0].id)
          }
        }
        if (venData.success && venData.data?.length > 0) {
          setVendors(venData.data)
          setVendorId(venData.data[0].id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  // Update subcategories when category changes
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId)
    const found = categories.find((c) => c.id === newCatId)
    const subs = found?.children || []
    setSubcategories(subs)
    setSubcategoryId(subs.length > 0 ? subs[0].id : '')
  }

  // Auto-generate SKU
  const generateSku = () => {
    const selectedCat = categories.find((c) => c.id === categoryId)
    const catCode = selectedCat ? selectedCat.name.slice(0, 2).toUpperCase() : 'TL'
    const random = Math.floor(1000 + Math.random() * 9000)
    setSku(`TL-${catCode}-${random}`)
  }

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
  }

  const handleSubmit = async (targetStatus: 'DRAFT' | 'ACTIVE') => {
    setSubmitting(true)
    setErrorMsg(null)

    // Fallback SKU if empty
    let finalSku = sku.trim()
    if (!finalSku) {
      finalSku = `TL-${Date.now().toString().slice(-6)}`
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      sku: finalSku.toUpperCase(),
      categoryId,
      subcategoryId: subcategoryId || null,
      vendorId: vendorId || null,
      brand: brand.trim() || null,
      shortDescription: shortDescription.trim() || null,
      description: description.trim(),
      material: material.trim() || null,
      color: color.trim() || null,
      size: size.trim() || null,
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions.trim() || null,
      mrp: mrp ? parseFloat(mrp) : null,
      wholesalePrice: parseFloat(wholesalePrice) || 0,
      gstPercent: parseFloat(gstPercent) || 18,
      moq: parseInt(moq, 10) || 1,
      stock: parseInt(stock, 10) || 0,
      status: targetStatus,
      featured,
      images,
      quantityPricing: quantityPricing.map((t) => ({
        minQuantity: Number(t.minQty),
        maxQuantity: t.maxQty ? Number(t.maxQty) : null,
        pricePerUnit: Number(t.pricePerUnit),
      })),
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-role': 'ADMIN',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.details && Array.isArray(data.details)) {
          const detailMsg = data.details.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(', ')
          throw new Error(detailMsg || data.error)
        }
        throw new Error(data.error || 'Failed to create product')
      }

      router.push('/admin/products')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating product')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <AdminHeader
        title="Create Wholesale Product"
        subtitle="Add a new product with B2B wholesale pricing tiers, specifications, and images"
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
        }
      />

      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Submission Error</div>
              <div className="mt-1">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* 1. Basic Information */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Basic Information</h3>
            <p className="text-xs text-gray-500">Core identification and category assignment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Tuffloom Pro Executive Laptop Backpack"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  SKU (Stock Keeping Unit) *
                </label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. TL-BP-EX01"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-800 focus:outline-none focus:border-orange-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Slug (URL Path) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. tuffloom-pro-executive-backpack"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono text-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Primary Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="">None / Unassigned</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Tuffloom"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Assigned Vendor (Internal)
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName} ({v.city})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Vendor details are private and never exposed to customers.</p>
            </div>
          </div>
        </section>

        {/* 2. Description */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Description</h3>
            <p className="text-xs text-gray-500">Short summary and in-depth wholesale specifications</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-2 sentences highlighting product benefits for listing grids"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Description & Specifications *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed wholesale product description, material composition, packaging details, and warranty terms..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </section>

        {/* 3. Product Details */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Physical Details & Attributes</h3>
            <p className="text-xs text-gray-500">Material, sizing, and shipping dimensions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 1680D Ballistic Nylon"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Charcoal Black"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Size / Capacity
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 32L or Free Size"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Weight (Kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 1.1"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Dimensions (L x W x H)
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 48 x 33 x 18 cm"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* 4. Pricing, Taxes & Inventory */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Pricing, Taxes & Inventory</h3>
            <p className="text-xs text-gray-500">Wholesale base price, MRP ceiling, GST percentage, and MOQ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Wholesale Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  placeholder="599.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                MRP (Max Retail ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  placeholder="1499.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                GST % Rate
              </label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard)</option>
                <option value="28">28% GST</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                MOQ (Minimum Qty) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* 5. B2B Quantity Pricing Tiers */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <PriceTierEditor
            tiers={quantityPricing}
            basePrice={parseFloat(wholesalePrice) || 0}
            moq={parseInt(moq, 10) || 1}
            onChange={(updated) => setQuantityPricing(updated)}
          />
        </section>

        {/* 6. Product Images */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Product Images</h3>
            <p className="text-xs text-gray-500">
              Upload multiple product images, select primary thumbnail, and adjust display ordering
            </p>
          </div>

          <ImageUploader images={images} onChange={(updated) => setImages(updated)} />
        </section>

        {/* 7. Settings */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Visibility & Status</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded-md border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm font-bold text-gray-800">Featured on Wholesale Homepage</span>
            </label>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('DRAFT')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('ACTIVE')}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Publish Product
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
