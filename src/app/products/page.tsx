'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Package,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Product, ProductType } from '@/types'

function ProductsCatalog() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [productType, setProductType] = useState(searchParams.get('productType') || 'ALL')
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (productType && productType !== 'ALL') params.set('productType', productType)
      if (category && category !== 'ALL') params.set('category', category)
      params.set('page', currentPage.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.products) {
        setProducts(data.products)
        setTotalCount(data.totalCount || 0)
        setTotalPages(data.totalPages || 1)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Failed to load products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [productType, category, currentPage])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Tuffloom Certified Wholesale & Manufacturing Catalog
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              B2B Product Catalog
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              Select ready-to-ship stock for immediate dispatch or submit custom manufacturing specifications with private labeling and custom packaging.
            </p>
          </div>

          <Link
            href="/custom-manufacturing"
            className="self-start md:self-auto px-4 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Request Custom Spec Sheet
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title, Style Code (e.g. TL-BAG-0101)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 min-h-[44px] text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            {/* Product Type Toggle Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar touch-pan-x text-xs font-bold">
              {[
                { label: 'All Catalog', value: 'ALL' },
                { label: 'Ready Wholesale', value: 'READY_WHOLESALE' },
                { label: 'Custom Manufacturing', value: 'CUSTOM_MANUFACTURING' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setProductType(tab.value)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-2 min-h-[38px] rounded-lg transition-all whitespace-nowrap flex items-center justify-center ${
                    productType === tab.value
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 overflow-x-auto no-scrollbar touch-pan-x text-xs">
            <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Categories:
            </span>
            {[
              { label: 'All Categories', value: 'ALL' },
              { label: 'Bags & Luggage', value: 'bags' },
              { label: 'Apparel & Clothing', value: 'apparel' },
              { label: 'Footwear', value: 'footwear' },
            ].map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategory(cat.value)
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 min-h-[36px] rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center justify-center ${
                  category === cat.value
                    ? 'bg-orange-100 text-orange-800 font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No products match your filter criteria</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search terms or resetting the product type filter to view all available products.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setProductType('ALL')
                setCategory('ALL')
              }}
              className="px-4 py-2 text-xs font-bold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const isWholesaleOnly = product.productType === 'READY_WHOLESALE'
              const isMfgOnly = product.productType === 'CUSTOM_MANUFACTURING'
              const isBoth = product.productType === 'BOTH'
              const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'

              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Style Code Badge */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Public Style Code Overlay (Tuffloom Controlled) */}
                      {product.styleCode && (
                        <div className="absolute top-2.5 left-2.5 bg-gray-900/85 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md border border-gray-700 shadow-xs">
                          {product.styleCode}
                        </div>
                      )}

                      {/* Product Type Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {isWholesaleOnly && (
                          <span className="bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Ready Stock
                          </span>
                        )}
                        {isMfgOnly && (
                          <span className="bg-orange-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Custom Mfg
                          </span>
                        )}
                        {isBoth && (
                          <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Stock & Custom
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {product.category?.name || 'Contract Product'}
                        </div>
                        <Link href={`/products/${product.slug}`} className="hover:text-orange-600 transition-colors">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mt-0.5">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      {/* MOQ & Specs */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                        <span>MOQ: <strong className="text-gray-900">{product.moq} pcs</strong></span>
                        {product.material && <span className="truncate max-w-[120px]">{product.material}</span>}
                      </div>

                      {/* Pricing Display */}
                      <div className="pt-2">
                        {isMfgOnly ? (
                          <div>
                            <div className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                              Indicative Price Range
                            </div>
                            <div className="text-base font-extrabold text-gray-900">
                              {product.indicativeCurrency === 'INR' ? '₹' : '$'}
                              {product.indicativePriceMin || 5} – {product.indicativeCurrency === 'INR' ? '₹' : '$'}
                              {product.indicativePriceMax || 15}{' '}
                              <span className="text-[11px] font-medium text-gray-500">
                                {product.priceBasis || 'FOB'}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5 italic">
                              Final quote depends on specs & volume
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-gray-400 font-medium">Wholesale Price</div>
                            <div className="text-base font-extrabold text-gray-900">
                              ₹{product.wholesalePrice.toLocaleString('en-IN')}{' '}
                              <span className="text-[10px] font-normal text-gray-500">/ pc + GST</span>
                            </div>
                            {isBoth && (
                              <div className="text-[9px] text-orange-600 font-semibold mt-0.5">
                                • Custom manufacturing also available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <div className="pt-3">
                      {isMfgOnly ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/custom-manufacturing?productId=${product.id}&styleCode=${product.styleCode || ''}`}
                            className="w-full py-2.5 px-2 min-h-[40px] text-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-xs flex items-center justify-center"
                          >
                            Get Quote
                          </Link>
                          <Link
                            href={`/products/${product.slug}`}
                            className="w-full py-2.5 px-2 min-h-[40px] text-center text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center"
                          >
                            Specs & Sample
                          </Link>
                        </div>
                      ) : isBoth ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="w-full py-2.5 px-2 min-h-[40px] text-center text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors shadow-xs flex items-center justify-center"
                          >
                            Order Stock
                          </Link>
                          <Link
                            href={`/custom-manufacturing?productId=${product.id}&styleCode=${product.styleCode || ''}`}
                            className="w-full py-2.5 px-2 min-h-[40px] text-center text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors flex items-center justify-center"
                          >
                            Custom Quote
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={`/products/${product.slug}`}
                          className="w-full py-2.5 min-h-[40px] text-center text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          View Wholesale Tiers <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages} ({totalCount} items)
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-500">Loading catalog...</div>}>
      <ProductsCatalog />
    </Suspense>
  )
}
