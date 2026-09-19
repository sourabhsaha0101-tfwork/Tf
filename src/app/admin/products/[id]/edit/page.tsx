'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { PriceTierEditor } from '@/components/admin/PriceTierEditor'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'
import { Category, Vendor, ProductImage, QuantityPrice, ProductStatus } from '@/types'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  // Form states
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [brand, setBrand] = useState('')
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
  const [moq, setMoq] = useState('1')
  const [stock, setStock] = useState('0')
  const [status, setStatus] = useState<ProductStatus>('DRAFT')
  const [featured, setFeatured] = useState(false)

  const [images, setImages] = useState<ProductImage[]>([])
  const [quantityPricing, setQuantityPricing] = useState<QuantityPrice[]>([])

  // Category & Vendor data
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])

  // UI status
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [prodRes, catRes, venRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`, { headers: { 'x-test-role': 'ADMIN' } }),
          fetch('/api/admin/categories', { headers: { 'x-test-role': 'ADMIN' } }),
          fetch('/api/admin/vendors', { headers: { 'x-test-role': 'ADMIN' } }),
        ])

        const prodData = await prodRes.json()
        const catData = await catRes.json()
        const venData = await venRes.json()

        if (catData.success) setCategories(catData.data || [])
        if (venData.success) setVendors(venData.data || [])

        if (prodData.success && prodData.data) {
          const p = prodData.data
          setName(p.name || '')
          setSku(p.sku || '')
          setSlug(p.slug || '')
          setCategoryId(p.categoryId || '')
          setSubcategoryId(p.subcategoryId || '')
          setVendorId(p.vendorId || '')
          setBrand(p.brand || 'Tuffloom')
          setShortDescription(p.shortDescription || '')
          setDescription(p.description || '')
          setMaterial(p.material || '')
          setColor(p.color || '')
          setSize(p.size || '')
          setWeight(p.weight !== null && p.weight !== undefined ? String(p.weight) : '')
          setDimensions(p.dimensions || '')
          setMrp(p.mrp !== null && p.mrp !== undefined ? String(p.mrp) : '')
          setWholesalePrice(String(p.wholesalePrice || ''))
          setGstPercent(String(p.gstPercent || '18'))
          setMoq(String(p.moq || '1'))
          setStock(String(p.stock || '0'))
          setStatus(p.status || 'DRAFT')
          setFeatured(Boolean(p.featured))
          setImages(p.images || [])
          setQuantityPricing(p.quantityPricing || [])

          // Set subcategories for selected category
          if (catData.data) {
            const foundCat = catData.data.find((c: any) => c.id === p.categoryId)
            setSubcategories(foundCat?.children || [])
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [id])

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId)
    const found = categories.find((c) => c.id === newCatId)
    const subs = found?.children || []
    setSubcategories(subs)
    setSubcategoryId(subs.length > 0 ? subs[0].id : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      sku: sku.trim().toUpperCase(),
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
      status,
      featured,
      images,
      quantityPricing: quantityPricing.map((t) => ({
        minQuantity: Number(t.minQty),
        maxQuantity: t.maxQty ? Number(t.maxQty) : null,
        pricePerUnit: Number(t.pricePerUnit),
      })),
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update product')
      }

      router.push('/admin/products')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating product')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
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

  return (
    <div>
      <AdminHeader
        title={`Edit: ${name || 'Product'}`}
        subtitle={`SKU: ${sku} | Manage product details, images, and B2B pricing tiers`}
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Update Error</div>
              <div className="mt-1">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* 1. Basic Information */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Basic Information</h3>
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
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-800 focus:outline-none focus:border-orange-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
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
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Assigned Vendor
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
            </div>
          </div>
        </section>

        {/* 2. Description */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Description</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Description *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </section>

        {/* 3. Details */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Physical Details</h3>
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
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
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
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </section>

        {/* 4. Pricing & Inventory */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Pricing & Inventory</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Wholesale Base (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                GST %
              </label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                MOQ (Units) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
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
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Product Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </section>

        {/* 5. Pricing Tiers */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <PriceTierEditor
            tiers={quantityPricing}
            basePrice={parseFloat(wholesalePrice) || 0}
            moq={parseInt(moq, 10) || 1}
            onChange={(updated) => setQuantityPricing(updated)}
          />
        </section>

        {/* 6. Images */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900">Product Images</h3>
          </div>
          <ImageUploader images={images} onChange={(updated) => setImages(updated)} />
        </section>

        {/* 7. Settings */}
        <section className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded-md border-gray-300 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-gray-800">Featured Product</span>
          </label>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
