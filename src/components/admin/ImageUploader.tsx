'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Star, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react'
import { ProductImage } from '@/types'

interface ImageUploaderProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images = [], onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-test-role': 'ADMIN', // Fallback header for testing
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload images')
      }

      const newUploaded = (data.data || []).map((item: any, idx: number) => ({
        id: `img-${Date.now()}-${idx}`,
        url: item.url,
        storagePath: item.storagePath,
        altText: '',
        sortOrder: images.length + idx,
        isPrimary: images.length === 0 && idx === 0,
      }))

      const combined = [...images, ...newUploaded]
      if (!combined.some((img) => img.isPrimary) && combined.length > 0) {
        combined[0].isPrimary = true
      }
      onChange(combined)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Error uploading images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    onChange(updated)
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true
    }
    // Re-index sort order
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })))
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= images.length) return

    const clone = [...images]
    const temp = clone[index]
    clone[index] = clone[newIdx]
    clone[newIdx] = temp

    onChange(clone.map((img, i) => ({ ...img, sortOrder: i })))
  }

  const updateAltText = (index: number, altText: string) => {
    const updated = [...images]
    updated[index] = { ...updated[index], altText }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop / Select Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 hover:bg-orange-50/20 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {uploading ? 'Uploading images...' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP up to 5MB each. First image becomes Primary.</p>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Image Gallery Cards */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.map((img, index) => (
            <div
              key={img.id || index}
              className={`relative bg-white border rounded-xl overflow-hidden shadow-sm transition-all group ${
                img.isPrimary ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200'
              }`}
            >
              {/* Image Preview Container */}
              <div className="aspect-video w-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.altText || 'Product thumbnail'} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}

                {/* Primary Tag */}
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-600 text-white shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Primary
                  </span>
                )}

                {/* Top Action Controls */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(index, 'up')
                    }}
                    disabled={index === 0}
                    className="p-1 text-white hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(index, 'down')
                    }}
                    disabled={index === images.length - 1}
                    className="p-1 text-white hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="p-1 text-rose-300 hover:text-rose-400"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">Image #{index + 1}</span>
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(index)}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" /> Set Primary
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Alt text / image caption"
                  value={img.altText || ''}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
