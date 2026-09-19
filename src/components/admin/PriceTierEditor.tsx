'use client'

import React from 'react'
import { Plus, Trash2, AlertCircle, Percent } from 'lucide-react'
import { QuantityPrice } from '@/types'

interface PriceTierEditorProps {
  tiers: QuantityPrice[]
  basePrice: number
  moq: number
  onChange: (tiers: QuantityPrice[]) => void
}

export const PriceTierEditor: React.FC<PriceTierEditorProps> = ({
  tiers = [],
  basePrice = 0,
  moq = 1,
  onChange,
}) => {
  const addTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const nextMin = lastTier && lastTier.maxQty ? lastTier.maxQty + 1 : Math.max(moq, 20)
    const newTier: QuantityPrice = {
      id: `tier-${Date.now()}`,
      minQty: nextMin,
      maxQty: nextMin + 29,
      pricePerUnit: Math.max(1, Math.round(basePrice * 0.95)),
    }
    onChange([...tiers, newTier])
  }

  const updateTier = (index: number, field: keyof QuantityPrice, value: any) => {
    const updated = [...tiers]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    onChange(updated)
  }

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">B2B Quantity-Based Pricing Tiers</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Offer graduated discounts for bulk orders. Wholesale base price: <span className="font-semibold text-gray-800">₹{basePrice || 0}</span> (MOQ: {moq} units)
          </p>
        </div>
        <button
          type="button"
          onClick={addTier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tier
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
          <p className="text-sm text-gray-500">No volume tiers configured yet. Standard wholesale base price applies for all order quantities.</p>
          <button
            type="button"
            onClick={addTier}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600" /> Create First Volume Tier
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tier Range</th>
                <th className="px-4 py-3">Min Qty</th>
                <th className="px-4 py-3">Max Qty (Empty for +)</th>
                <th className="px-4 py-3">Tier Price (₹/unit)</th>
                <th className="px-4 py-3">Savings</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {tiers.map((tier, index) => {
                const discount = basePrice > 0 ? Math.round(((basePrice - tier.pricePerUnit) / basePrice) * 100) : 0
                const isPriceExceeded = basePrice > 0 && tier.pricePerUnit > basePrice
                const isUnderMoq = tier.minQty < moq

                return (
                  <tr key={tier.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      Tier #{index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={moq}
                        value={tier.minQty}
                        onChange={(e) => updateTier(index, 'minQty', parseInt(e.target.value, 10) || 1)}
                        className={`w-24 px-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 ${
                          isUnderMoq
                            ? 'border-rose-300 bg-rose-50/30 text-rose-700 focus:ring-rose-500'
                            : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        placeholder="No limit (+)"
                        value={tier.maxQty !== null && tier.maxQty !== undefined ? tier.maxQty : ''}
                        onChange={(e) => {
                          const val = e.target.value.trim() === '' ? null : parseInt(e.target.value, 10)
                          updateTier(index, 'maxQty', val)
                        }}
                        className="w-28 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-gray-400 font-medium">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={tier.pricePerUnit}
                          onChange={(e) => updateTier(index, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-6 pr-2.5 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 ${
                            isPriceExceeded
                              ? 'border-rose-300 bg-rose-50/30 text-rose-700 focus:ring-rose-500'
                              : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isPriceExceeded ? (
                        <span className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Exceeds Base
                        </span>
                      ) : discount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <Percent className="w-3 h-3" /> {discount}% off
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">0% off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
