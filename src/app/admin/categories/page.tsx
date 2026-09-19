'use client'

import React, { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Badge } from '@/components/admin/Badge'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  FolderPlus,
} from 'lucide-react'
import { Category } from '@/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [modalType, setModalType] = useState<'category' | 'subcategory'>('category')
  const [editId, setEditId] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)

  // Feedback states
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/categories', {
        headers: { 'x-test-role': 'ADMIN' },
      })
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
        if (!selectedMainId && data.data?.length > 0) {
          setSelectedMainId(data.data[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      )
    }
  }

  const openAddCategory = () => {
    setIsEditing(false)
    setEditId(null)
    setModalType('category')
    setName('')
    setSlug('')
    setDescription('')
    setImageUrl('')
    setParentId(null)
    setSortOrder(categories.length + 1)
    setIsActive(true)
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const openAddSubcategory = (mainCatId: string) => {
    setIsEditing(false)
    setEditId(null)
    setModalType('subcategory')
    setName('')
    setSlug('')
    setDescription('')
    setImageUrl('')
    setParentId(mainCatId)
    setSortOrder(1)
    setIsActive(true)
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setIsEditing(true)
    setEditId(cat.id)
    setModalType(cat.parentId ? 'subcategory' : 'category')
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setImageUrl(cat.imageUrl || cat.image || '')
    setParentId(cat.parentId || null)
    setSortOrder(cat.sortOrder)
    setIsActive(cat.isActive)
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      isActive,
    }

    try {
      const url = isEditing && editId ? `/api/admin/categories/${editId}` : '/api/admin/categories'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-test-role': 'ADMIN',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category')
      }

      setSuccessMsg(isEditing ? 'Category updated successfully!' : 'Category created successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      setIsModalOpen(false)
      loadCategories()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-test-role': 'ADMIN',
        },
        body: JSON.stringify({ isActive: !cat.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        loadCategories()
      } else {
        alert(data.error || 'Failed to toggle status')
      }
    } catch {
      alert('Error updating status')
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete "${cat.name}"? This operation cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: { 'x-test-role': 'ADMIN' },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(`Deletion Rejected: ${data.error}`)
        return
      }

      setSuccessMsg(data.message || 'Deleted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      loadCategories()
    } catch {
      alert('Failed to delete category')
    }
  }

  const selectedMain = categories.find((c) => c.id === selectedMainId) || categories[0]

  return (
    <div>
      <AdminHeader
        title="Category & Subcategory Management"
        subtitle="Manage primary wholesale categories (Bags, Clothing, Footwear) and their subcategories"
        actions={
          <button
            onClick={openAddCategory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Main Category
          </button>
        }
      />

      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Success / Error notification */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Categories Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedMainId
            const subCount = cat.children?.length || 0
            const prodCount = cat._count?.products || 0

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedMainId(cat.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white relative ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 font-mono">#{cat.sortOrder}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStatus(cat)
                      }}
                      className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(cat)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(cat)
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-gray-900">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description || 'No description added'}</p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>{subCount} Subcategories</span>
                  <span>{prodCount} Products</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Category's Subcategories Detail Table */}
        {selectedMain && (
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  Subcategories of &quot;{selectedMain.name}&quot;
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slug: <code className="font-mono text-gray-700 font-bold">{selectedMain.slug}</code> | Products map to these specific catalog sections
                </p>
              </div>

              <button
                onClick={() => openAddSubcategory(selectedMain.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-orange-600" /> Add Subcategory
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Subcategory Name</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Parent Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {!selectedMain.children || selectedMain.children.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No subcategories defined for {selectedMain.name}. Click &quot;Add Subcategory&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    selectedMain.children.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-gray-400">#{sub.sortOrder || idx + 1}</td>
                        <td className="px-6 py-3.5 font-bold text-gray-900">{sub.name}</td>
                        <td className="px-6 py-3.5 font-mono text-gray-500">{sub.slug}</td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                            {selectedMain.name}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              sub.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Click to toggle"
                          >
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openEdit(sub)}
                            className="p-1.5 text-gray-500 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {isEditing ? `Edit ${name}` : modalType === 'category' ? 'Create Main Category' : 'Create Subcategory'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {modalType === 'subcategory' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Parent Category
                  </label>
                  <select
                    value={parentId || ''}
                    onChange={(e) => setParentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Laptop Bags"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Slug (Unique URL identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. laptop-bags"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for wholesale catalog"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
