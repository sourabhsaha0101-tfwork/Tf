'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Badge } from '@/components/admin/Badge'
import { Pagination } from '@/components/admin/Pagination'
import {
  Search,
  Plus,
  Edit2,
  Copy,
  Archive,
  Eye,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Power,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react'
import { Product, Category } from '@/types'

export default function AdminProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter params
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('updatedAt_desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: search.trim(),
        categoryId: selectedCategory,
        status: selectedStatus,
        sort: sortBy,
      })

      const res = await fetch(`/api/admin/products?${query.toString()}`, {
        headers: { 'x-test-role': 'ADMIN' },
      })
      const data = await res.json()
      if (data.success) {
        setProducts(data.products || [])
        setTotalCount(data.totalCount || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, selectedCategory, selectedStatus, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories', {
          headers: { 'x-test-role': 'ADMIN' },
        })
        const data = await res.json()
        if (data.success) setCategories(data.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadCategories()
  }, [])

  const handleToggleStatus = async (p: Product) => {
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-test-role': 'ADMIN',
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: `Product status updated to ${nextStatus}` })
        setTimeout(() => setFeedback(null), 3000)
        fetchProducts()
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update product status' })
    }
  }

  const handleDuplicate = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}/duplicate`, {
        method: 'POST',
        headers: { 'x-test-role': 'ADMIN' },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: `Duplicated product: ${data.data?.sku}` })
        setTimeout(() => setFeedback(null), 3000)
        fetchProducts()
      } else {
        alert(data.error || 'Failed to duplicate product')
      }
    } catch {
      alert('Error duplicating product')
    }
  }

  const handleArchive = async (p: Product) => {
    if (!confirm(`Are you sure you want to archive "${p.name}"? Archived products are hidden from customers while preserving order history.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-test-role': 'ADMIN',
        },
        body: JSON.stringify({ action: 'archive' }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: 'Product archived successfully' })
        setTimeout(() => setFeedback(null), 3000)
        fetchProducts()
      }
    } catch {
      alert('Failed to archive product')
    }
  }

  return (
    <div>
      <AdminHeader
        title="Wholesale Products"
        subtitle="Manage wholesale products, inventory, MOQ, and quantity tier pricing"
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, SKU, brand..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="updatedAt_desc">Recently Updated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Product Info</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Wholesale / MRP</th>
                  <th className="px-6 py-3">MOQ</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-600 mb-2" />
                      Loading catalog products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                      No products match your criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const primaryImg = p.images?.find((i) => i.isPrimary) || p.images?.[0]
                    const updatedStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Image + Title */}
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={primaryImg.url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-bold text-gray-900 hover:text-orange-600 transition-colors truncate block"
                            >
                              {p.name}
                            </Link>
                            <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                              <span>{p.brand || 'Tuffloom'}</span>
                              {p.featured && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold text-[9px] border border-amber-200">
                                  FEATURED
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-3.5 font-mono text-gray-700 font-bold">{p.sku}</td>

                        {/* Category & Subcategory */}
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-gray-900">{p.category?.name || 'Bags'}</div>
                          {p.subCategoryRel && (
                            <div className="text-[11px] text-gray-400 mt-0.5">{p.subCategoryRel.name}</div>
                          )}
                        </td>

                        {/* Price & MRP */}
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-gray-900 text-sm">₹{p.wholesalePrice}</div>
                          {p.mrp && <div className="text-[11px] text-gray-400 line-through">MRP: ₹{p.mrp}</div>}
                        </td>

                        {/* MOQ */}
                        <td className="px-6 py-3.5 font-semibold text-gray-700">{p.moq} pcs</td>

                        {/* Stock */}
                        <td className="px-6 py-3.5">
                          <span
                            className={`font-semibold ${
                              p.stock === 0
                                ? 'text-rose-600 font-bold'
                                : p.stock < 50
                                ? 'text-amber-600 font-bold'
                                : 'text-gray-900'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3.5">
                          <Badge status={p.status} />
                        </td>

                        {/* Updated Date */}
                        <td className="px-6 py-3.5 text-gray-400 font-mono text-[11px]">{updatedStr}</td>

                        {/* Action Buttons */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                              title="View Product"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDuplicate(p)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Duplicate Product"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(p)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                p.status === 'ACTIVE'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'
                              }`}
                              title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {p.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleArchive(p)}
                                className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                                title="Archive Product"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={10}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>
    </div>
  )
}
