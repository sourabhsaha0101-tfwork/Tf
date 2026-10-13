'use client'

import React, { useState, useEffect } from 'react'
import {
  FileCheck,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react'

export default function AdminInspectionsPage() {
  const [mfgOrders, setMfgOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Inspection form
  const [inspectionType, setInspectionType] = useState('FINAL_AQL_2_5')
  const [standard, setStandard] = useState('ANSI/ASQ Z1.4 — AQL 2.5')
  const [sampleSize, setSampleSize] = useState(80)
  const [criticalDefects, setCriticalDefects] = useState(0)
  const [majorDefects, setMajorDefects] = useState(1)
  const [minorDefects, setMinorDefects] = useState(3)
  const [status, setStatus] = useState<'PASSED' | 'FAILED' | 'PENDING_REVIEW'>('PASSED')
  const [reportUrl, setReportUrl] = useState('')
  const [notes, setNotes] = useState('Passed ANSI/ASQ Z1.4 Level II General Inspection. Zero critical defects.')
  const [saving, setSaving] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/manufacturing-orders')
      const data = await res.json()
      if (data.success && data.manufacturingOrders) {
        setMfgOrders(data.manufacturingOrders)
        if (data.manufacturingOrders.length > 0 && !selectedOrder) {
          setSelectedOrder(data.manufacturingOrders[0])
        }
      }
    } catch (err) {
      console.error('Failed to load manufacturing orders for inspection', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/manufacturing-orders/${selectedOrder.id}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionType,
          standard,
          sampleSize,
          criticalDefects,
          majorDefects,
          minorDefects,
          status,
          reportUrl: reportUrl || undefined,
          notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Quality Inspection Report logged and published to customer account!')
        await fetchOrders()
      } else {
        alert(data.error || 'Failed to submit inspection')
      }
    } catch {
      alert('Error submitting inspection report')
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
            <Award className="w-6 h-6 text-green-600" />
            Quality Control & ANSI/ASQ Z1.4 (AQL 2.5) Audits
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Log pre-shipment quality audit metrics, record critical/major/minor defects, and upload authorized PDF certificates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading production runs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Orders list */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Manufacturing Orders ({mfgOrders.length})
            </div>
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {mfgOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedOrder?.id === o.id
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{o.manufacturingOrderNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {o.currentStage}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">{o.productName}</div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Style: {o.styleCode}</span>
                    <strong className="text-gray-900">{o.quantity} units</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Inspection Audit Entry Form */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-gray-900">
                    {selectedOrder.manufacturingOrderNumber}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Standard: ANSI/ASQ Z1.4 — AQL 2.5
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mt-1">
                  {selectedOrder.productName} ({selectedOrder.styleCode})
                </h2>
                <div className="text-xs text-gray-500">
                  Total Lot Size: <strong className="text-gray-900">{selectedOrder.quantity} units</strong> • Destination: {selectedOrder.destinationCity}, {selectedOrder.destinationCountry}
                </div>
              </div>

              {/* Existing Inspections */}
              {selectedOrder.inspections && selectedOrder.inspections.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-700">Logged Inspections on File</div>
                  {selectedOrder.inspections.map((qc: any) => (
                    <div
                      key={qc.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span>{qc.inspectionNumber} ({qc.standard})</span>
                        <span className={qc.status === 'PASSED' ? 'text-green-700' : 'text-red-700'}>
                          {qc.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Sample Size: {qc.sampleSize} | Critical: {qc.criticalDefects} | Major: {qc.majorDefects} | Minor: {qc.minorDefects}
                      </div>
                      {qc.reportUrl && (
                        <a
                          href={qc.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> View Report PDF
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Form to submit new inspection */}
              <form onSubmit={handleSubmitInspection} className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 text-xs">
                <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-green-600" />
                  <span>Log New Inspection Audit Certificate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Inspection Type</label>
                    <select
                      value={inspectionType}
                      onChange={(e) => setInspectionType(e.target.value)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="FINAL_AQL_2_5">Final Pre-Shipment (AQL 2.5)</option>
                      <option value="IN_LINE_30">30% In-Line Production QC</option>
                      <option value="FIRST_ARTICLE">First Article / Golden Seal Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Audit Result</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="PASSED">PASSED (Compliant with ANSI/ASQ Z1.4)</option>
                      <option value="FAILED">FAILED (Exceeds Acceptable Defect Limit)</option>
                      <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Sample Size (pcs)</label>
                    <input
                      type="number"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Critical (Max 0)</label>
                    <input
                      type="number"
                      value={criticalDefects}
                      onChange={(e) => setCriticalDefects(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Major Defects</label>
                    <input
                      type="number"
                      value={majorDefects}
                      onChange={(e) => setMajorDefects(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Minor Defects</label>
                    <input
                      type="number"
                      value={minorDefects}
                      onChange={(e) => setMinorDefects(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Authorized PDF Report Document URL</label>
                  <input
                    type="text"
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                    placeholder="https://.../aql-inspection-report.pdf"
                    className="w-full px-3.5 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Auditor Technical Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs flex items-center justify-center"
                  >
                    {saving ? 'Publishing Certificate...' : 'Publish AQL 2.5 Inspection Certificate'}
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
