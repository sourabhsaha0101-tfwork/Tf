'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Badge } from '@/components/admin/Badge'
import {
  Package,
  FolderTree,
  AlertTriangle,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  Layers,
  ExternalLink,
} from 'lucide-react'
import { Product, Category } from '@/types'

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/admin/products?limit=5', { headers: { 'x-test-role': 'ADMIN' } }),
          fetch('/api/admin/categories', { headers: { 'x-test-role': 'ADMIN' } }),
        ])
        const prodData = await prodRes.json()
        const catData = await catRes.json()

        if (prodData.success) setProducts(prodData.products || [])
        if (catData.success) setCategories(catData.data || [])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalProducts = products.length
  const totalCategories = categories.length
  const lowStockCount = products.filter((p) => p.stock < 50).length

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Real-time summary of Tuffloom product catalog and wholesale operations"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderTree className="w-3.5 h-3.5" /> Manage Categories
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </Link>
          </div>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{loading ? '...' : totalProducts}</h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Catalog Active
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Categories</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{loading ? '...' : totalCategories}</h3>
              <p className="text-xs text-gray-500 mt-1">Bags, Clothing, Footwear</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderTree className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{loading ? '...' : lowStockCount}</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Under 50 Units MOQ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Vendors</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">3</h3>
              <p className="text-xs text-gray-500 mt-1">Apex, Heritage, StepRight</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Launchpad Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/20 uppercase tracking-wider">
              Phase 2 Active
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Product & Category Management Live</h2>
            <p className="text-white/80 text-xs max-w-xl">
              Create and manage wholesale products with tiered quantity pricing, multi-image management, dynamic categories, and server-side authorization.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
            >
              Browse All Products
            </Link>
          </div>
        </div>

        {/* Recent Products Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Recent Catalog Products</h3>
              <p className="text-xs text-gray-500">Recently updated wholesale products</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Wholesale Base</th>
                  <th className="px-6 py-3">MOQ</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                      {loading ? 'Loading products...' : 'No products found. Click "Add Product" to get started.'}
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const primaryImg = p.images?.find((img) => img.isPrimary) || p.images?.[0]
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={primaryImg.url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">{p.brand || 'Tuffloom'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-gray-600 font-semibold">{p.sku}</td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                            {p.category?.name || 'Bags'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-gray-900">₹{p.wholesalePrice}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-600">{p.moq} pcs</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`font-semibold ${
                              p.stock < 50 ? 'text-amber-600 font-bold' : 'text-gray-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge status={p.status} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
