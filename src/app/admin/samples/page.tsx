'use client'

import React, { useState, useEffect } from 'react'
import {
  Send,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Eye,
  Check,
  Package,
} from 'lucide-react'

export default function AdminSamplesPage() {
  const [samples, setSamples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSample, setSelectedSample] = useState<any>(null)

  // Status updates
  const [sampleStatus, setSampleStatus] = useState('SAMPLE_DEVELOPMENT')
  const [paymentStatus, setPaymentStatus] = useState('PAID')
  const [courier, setCourier] = useState('DHL Express')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchSamples = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sample-orders')
      const data = await res.json()
      if (data.success && data.sampleOrders) {
        setSamples(data.sampleOrders)
        if (data.sampleOrders.length > 0 && !selectedSample) {
          selectSample(data.sampleOrders[0])
        }
      } else {
        setSamples([])
      }
    } catch (err) {
      console.error('Failed to load sample orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSamples()
  }, [])

  const selectSample = (s: any) => {
    setSelectedSample(s)
    setSampleStatus(s.sampleStatus)
    setPaymentStatus(s.paymentStatus)
    setCourier(s.courier || 'DHL Express')
    setTrackingNumber(s.trackingNumber || '')
  }

  const handleUpdateSample = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSample) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/sample-orders/${selectedSample.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleStatus,
          paymentStatus,
          courier,
          trackingNumber,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Sample order updated successfully!')
        await fetchSamples()
        setSelectedSample(data.data)
      } else {
        alert(data.error || 'Failed to update sample order')
      }
    } catch {
      alert('Error updating sample order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Send className="w-6 h-6 text-orange-600" />
            Prototype Sample Orders Desk
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage physical sample requests, golden-seal sample development, and international courier tracking.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading sample requests...</p>
        </div>
      ) : samples.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No prototype sample orders placed yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Samples list */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Sample Orders ({samples.length})
            </div>
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {samples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectSample(s)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedSample?.id === s.id
                      ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{s.sampleOrderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {s.sampleStatus}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {s.product?.name || 'Custom Bag/Apparel Prototype'}
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Buyer: {s.customer?.companyName || s.customer?.name}</span>
                    <strong className="text-gray-900">
                      {s.currency === 'INR' ? '₹' : '$'}{s.total}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sample Management Desk */}
          {selectedSample && (
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-gray-900">
                    {selectedSample.sampleOrderNumber}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedSample.sampleStatus}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mt-1">
                  {selectedSample.product?.name || 'Prototype Sample Spec'}
                </h2>
                <div className="text-xs text-gray-500">
                  Style Code: <strong className="text-gray-900">{selectedSample.styleCode}</strong>
                </div>
              </div>

              {/* Shipping & Buyer Details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-gray-900">Buyer & Shipping Destination</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div>Buyer: <strong className="text-gray-900 block">{selectedSample.customer?.companyName || selectedSample.customer?.name}</strong></div>
                  <div>Email: <strong className="text-gray-900 block">{selectedSample.customer?.email}</strong></div>
                  <div className="sm:col-span-2">
                    Address: <strong className="text-gray-900 block">{selectedSample.shippingDestination}</strong>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-xs text-center">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Unit Sample</span>
                  <strong className="text-gray-900">{selectedSample.currency} {selectedSample.samplePrice}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Express Courier</span>
                  <strong className="text-gray-900">{selectedSample.currency} {selectedSample.shippingCharge}</strong>
                </div>
                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200">
                  <span className="text-[10px] uppercase font-bold text-orange-600 block">Total Due</span>
                  <strong className="text-orange-950 font-black">{selectedSample.currency} {selectedSample.total}</strong>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdateSample} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 text-xs">
                <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Update Prototype Status & Courier Tracking
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Sample Status</label>
                    <select
                      value={sampleStatus}
                      onChange={(e) => setSampleStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="SAMPLE_REQUESTED">SAMPLE_REQUESTED</option>
                      <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                      <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                      <option value="SAMPLE_DEVELOPMENT">SAMPLE_DEVELOPMENT</option>
                      <option value="SAMPLE_READY">SAMPLE_READY</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Courier Service</label>
                    <input
                      type="text"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                      placeholder="e.g. DHL Express / FedEx"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Courier Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono"
                      placeholder="e.g. DHL-981244091"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
                  >
                    {saving ? 'Updating...' : 'Save Sample Order Updates'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
