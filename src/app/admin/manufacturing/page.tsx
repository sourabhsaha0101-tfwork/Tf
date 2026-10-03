'use client'

import React, { useState, useEffect } from 'react'
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Camera,
  Truck,
  FileCheck,
  Award,
  Upload,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Plus,
} from 'lucide-react'

export default function AdminManufacturingPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Stage update modal/form state
  const [newStage, setNewStage] = useState('PRODUCTION_IN_PROGRESS')
  const [stageNotes, setStageNotes] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string>('')
  const [updatingStage, setUpdatingStage] = useState(false)

  // Dispatch update state
  const [freightCarrier, setFreightCarrier] = useState('Maersk Ocean Logistics')
  const [trackingNumber, setTrackingNumber] = useState('MSKU-982144-NYC')
  const [billOfLadingUrl, setBillOfLadingUrl] = useState('')
  const [updatingDispatch, setUpdatingDispatch] = useState(false)

  const elevenStages = [
    { value: 'ORDER_CONFIRMED', label: '1. Order Confirmed' },
    { value: 'RAW_MATERIAL_SOURCED', label: '2. Fabric / Raw Material Sourced' },
    { value: 'CUTTING_DONE', label: '3. Cutting Done' },
    { value: 'PRODUCTION_IN_PROGRESS', label: '4. Production In Progress' },
    { value: 'IN_LINE_INSPECTION_30', label: '5. 30% In-Line Inspection' },
    { value: 'FINAL_INSPECTION_AQL', label: '6. Final AQL 2.5 Inspection' },
    { value: 'PACKED', label: '7. Packed' },
    { value: 'READY_FOR_DISPATCH', label: '8. Ready for Dispatch' },
    { value: 'DISPATCHED', label: '9. Dispatched' },
    { value: 'SHIPMENT_IN_TRANSIT', label: '10. Shipment In Transit' },
    { value: 'DELIVERED', label: '11. Delivered' },
  ]

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/manufacturing-orders')
      const data = await res.json()
      if (data.success && data.manufacturingOrders) {
        setOrders(data.manufacturingOrders)
        if (data.manufacturingOrders.length > 0 && !selectedOrder) {
          selectOrder(data.manufacturingOrders[0])
        }
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to load manufacturing orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const selectOrder = (o: any) => {
    setSelectedOrder(o)
    setNewStage(o.currentStage)
    setFreightCarrier(o.freightCarrier || 'Maersk Ocean Logistics')
    setTrackingNumber(o.trackingNumber || '')
    setBillOfLadingUrl(o.billOfLadingUrl || '')
  }

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setUpdatingStage(true)
    try {
      const photos = photoUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)

      const res = await fetch(`/api/admin/manufacturing-orders/${selectedOrder.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          notes: stageNotes,
          photos,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Stage updated to ${newStage}!`)
        setStageNotes('')
        setPhotoUrls('')
        await fetchOrders()
        setSelectedOrder(data.data)
      } else {
        alert(data.error || 'Failed to update stage')
      }
    } catch {
      alert('Error updating stage')
    } finally {
      setUpdatingStage(false)
    }
  }

  const handleUpdateDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setUpdatingDispatch(true)
    try {
      const res = await fetch(`/api/admin/manufacturing-orders/${selectedOrder.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freightCarrier,
          trackingNumber,
          billOfLadingUrl,
          dispatchDate: new Date().toISOString().split('T')[0],
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Dispatch and shipping details saved!')
        await fetchOrders()
        setSelectedOrder(data.data)
      } else {
        alert(data.error || 'Failed to save dispatch')
      }
    } catch {
      alert('Error updating dispatch')
    } finally {
      setUpdatingDispatch(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-orange-600" />
            Custom Manufacturing Orders & Production Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Update real-time 11-step factory milestone logs, upload verified production photos, and record ocean/air dispatch data.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading manufacturing orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No manufacturing orders currently in production.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Orders list */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Production Runs ({orders.length})
            </div>
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => selectOrder(o)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedOrder?.id === o.id
                      ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {o.manufacturingOrderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {o.progressPercent}%
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">{o.productName}</div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Buyer: {o.customer?.companyName || o.customer?.name}</span>
                    <strong className="text-gray-900">{o.quantity} pcs</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed 11-Stage Production Desk */}
          {selectedOrder && (
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-gray-900">
                      {selectedOrder.manufacturingOrderNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      Stage: {selectedOrder.currentStage}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mt-1">
                    {selectedOrder.productName}
                  </h2>
                  <div className="text-xs text-gray-500">
                    Style Code: <strong className="text-gray-900">{selectedOrder.styleCode}</strong> • Quantity: <strong className="text-gray-900">{selectedOrder.quantity} pcs</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Destination Port</div>
                  <div className="text-xs font-bold text-gray-900">{selectedOrder.destinationCity}, {selectedOrder.destinationCountry}</div>
                  <div className="text-[11px] text-gray-500">Terms: {selectedOrder.tradeTerm}</div>
                </div>
              </div>

              {/* Stage Progression Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700">Production Progress</span>
                  <span className="font-mono font-bold text-orange-600">{selectedOrder.progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full rounded-full transition-all"
                    style={{ width: `${selectedOrder.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Form 1: Stage Update Desk */}
              <form onSubmit={handleUpdateStage} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 text-xs">
                <div className="font-bold uppercase tracking-wider text-gray-900 text-[11px] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Update Production Stage & Upload Milestone Audit Photos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Select Next Target Stage</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      {elevenStages.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Milestone Production Photos (One URL per line)
                    </label>
                    <textarea
                      rows={2}
                      value={photoUrls}
                      onChange={(e) => setPhotoUrls(e.target.value)}
                      placeholder="https://images.unsplash.com/... (authorized production photos)"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stage Progress Notes (Visible to Customer)</label>
                  <textarea
                    rows={2}
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="e.g. 1,000 units cut and moving to stitch line. Seam tolerance tested at 1.2mm."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStage}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
                  >
                    {updatingStage ? 'Saving Stage...' : 'Log Milestone & Update Stage'}
                  </button>
                </div>
              </form>

              {/* Form 2: Shipping & Dispatch Desk */}
              <form onSubmit={handleUpdateDispatch} className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-4 text-xs">
                <div className="font-bold uppercase tracking-wider text-blue-950 text-[11px] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Dispatch, Carrier & Bill of Lading Entry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Freight Carrier / Logistics</label>
                    <input
                      type="text"
                      value={freightCarrier}
                      onChange={(e) => setFreightCarrier(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                      placeholder="e.g. Maersk / DHL Global"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Tracking Number / Container</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-mono"
                      placeholder="e.g. MSKU-982144"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Bill of Lading Document URL</label>
                    <input
                      type="text"
                      value={billOfLadingUrl}
                      onChange={(e) => setBillOfLadingUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                      placeholder="https://.../bol.pdf"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingDispatch}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    {updatingDispatch ? 'Saving Dispatch...' : 'Save Dispatch & Tracking'}
                  </button>
                </div>
              </form>

              {/* Stage Logs History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Audit Trail of Updates</h3>
                {selectedOrder.stageLogs && selectedOrder.stageLogs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.stageLogs.map((log: any) => (
                      <div key={log.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>{log.stage}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {new Date(log.createdAt).toLocaleString()} by {log.updatedBy}
                          </span>
                        </div>
                        {log.notes && <p className="text-gray-600">{log.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No stage updates logged yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
