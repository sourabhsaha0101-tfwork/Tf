'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Lock,
  Download,
  Layers,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedQuote, setSelectedQuote] = useState<any>(null)

  // Edit / Proposal state
  const [quotedPrice, setQuotedPrice] = useState<number>(0)
  const [quotedCurrency, setQuotedCurrency] = useState<'USD' | 'INR'>('USD')
  const [leadDays, setLeadDays] = useState<number>(30)
  const [paymentTerms, setPaymentTerms] = useState('30% Advance Wire / 70% Before Dispatch')
  const [adminNotes, setAdminNotes] = useState('')
  const [statusToUpdate, setStatusToUpdate] = useState('')
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)

  const fetchQuotations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/quotations?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.quotations) {
        setQuotations(data.quotations)
        if (data.quotations.length > 0 && !selectedQuote) {
          selectQuotation(data.quotations[0])
        }
      } else {
        setQuotations([])
      }
    } catch (err) {
      console.error('Error fetching admin quotations', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter])

  const selectQuotation = (q: any) => {
    setSelectedQuote(q)
    setQuotedPrice(q.quotedPrice || q.targetPrice || 0)
    setQuotedCurrency(q.quotedCurrency || q.targetCurrency || 'USD')
    setLeadDays(q.leadDays || 30)
    setPaymentTerms(q.paymentTerms || '30% Advance Wire / 70% Before Dispatch')
    setAdminNotes(q.adminNotes || '')
    setStatusToUpdate(q.status)
  }

  const handleSaveProposal = async (sendToCustomer: boolean = false) => {
    if (!selectedQuote) return
    setSaving(true)
    try {
      const payload: any = {
        quotedPrice,
        quotedCurrency,
        leadDays,
        paymentTerms,
        adminNotes,
        status: sendToCustomer ? 'QUOTATION_SENT' : statusToUpdate,
      }

      const res = await fetch(`/api/admin/quotations/${selectedQuote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        alert(sendToCustomer ? 'Quotation proposal sent to customer!' : 'Quotation updated.')
        await fetchQuotations()
        setSelectedQuote(data.data)
      } else {
        alert(data.error || 'Failed to update quotation')
      }
    } catch {
      alert('Error updating quotation')
    } finally {
      setSaving(false)
    }
  }

  const handleConvertToMfgOrder = async () => {
    if (!selectedQuote) return
    if (!confirm('Convert this approved quotation into an active Manufacturing Order?')) return
    setConverting(true)
    try {
      const res = await fetch(`/api/admin/quotations/${selectedQuote.id}/convert`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        alert(`Manufacturing Order ${data.data.manufacturingOrderNumber} created successfully!`)
        await fetchQuotations()
      } else {
        alert(data.error || 'Conversion failed')
      }
    } catch {
      alert('Error converting quotation')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-orange-600" />
            Custom Quotations (RFQ Management)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review customer tech packs, prepare formal factory costings, and convert approved quotes to manufacturing orders.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar touch-pan-x text-xs font-bold">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTATION_SENT', 'APPROVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 min-h-[36px] rounded-lg transition-all whitespace-nowrap flex items-center justify-center ${
                statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading quotations...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No custom manufacturing quotations match your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Quotations List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              RFQs ({quotations.length})
            </div>
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {quotations.map((q) => (
                <div
                  key={q.id}
                  onClick={() => selectQuotation(q)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedQuote?.id === q.id
                      ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900">{q.quotationNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : q.status === 'QUOTATION_SENT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {q.productName || q.product?.name}
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Buyer: {q.customer?.companyName || q.customer?.name}</span>
                    <strong className="text-gray-900">{q.quantity} pcs</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quotation Review & Proposal Desk */}
          {selectedQuote && (
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-gray-900">
                      {selectedQuote.quotationNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {selectedQuote.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mt-1">
                    {selectedQuote.productName || selectedQuote.product?.name}
                  </h2>
                  <div className="text-xs text-gray-500">
                    Style Code: <strong className="text-gray-900">{selectedQuote.styleCodeSnapshot}</strong> • Submitted: {new Date(selectedQuote.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Conversion Button if Approved */}
                {selectedQuote.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handleConvertToMfgOrder}
                    disabled={converting}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    {converting ? 'Converting...' : 'Launch Manufacturing Order'}
                  </button>
                )}
              </div>

              {/* Customer & Company Details */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-gray-900">Buyer Information</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600">
                  <div>Company: <strong className="text-gray-900 block">{selectedQuote.customer?.companyName || 'Verma Retail'}</strong></div>
                  <div>Contact: <strong className="text-gray-900 block">{selectedQuote.customer?.name}</strong></div>
                  <div>Email: <strong className="text-gray-900 block">{selectedQuote.customer?.email}</strong></div>
                  <div>Phone: <strong className="text-gray-900 block">{selectedQuote.customer?.phone || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Technical Specifications Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Quantity</span>
                  <strong className="text-gray-900">{selectedQuote.quantity} pcs</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Material</span>
                  <strong className="text-gray-900 truncate block">{selectedQuote.material}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Color / Spec</span>
                  <strong className="text-gray-900 truncate block">{selectedQuote.color}</strong>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Target Price</span>
                  <strong className="text-gray-900">{selectedQuote.targetCurrency} {selectedQuote.targetPrice}</strong>
                </div>
              </div>

              {/* Destination & Branding Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-900 block">Shipping & Trade</span>
                  <p className="text-gray-600 text-[11px]">
                    Terms: <strong>{selectedQuote.tradeTerm}</strong> • Destination: <strong>{selectedQuote.destinationCity}, {selectedQuote.destinationCountry}</strong> ({selectedQuote.destinationPort})
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-gray-900 block">Private Label & Packaging</span>
                  <div className="text-gray-600 text-[11px] flex flex-wrap gap-2">
                    {selectedQuote.privateLabelRequired && <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Private Label</span>}
                    {selectedQuote.customLogoRequired && <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Custom Logo</span>}
                    {selectedQuote.packagingRequired && <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Packaging</span>}
                    {selectedQuote.barcodeRequired && <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Barcode</span>}
                  </div>
                </div>
              </div>

              {/* Uploaded Tech Pack Documents */}
              {selectedQuote.files && selectedQuote.files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-700">Buyer Tech Pack & CAD Files</div>
                  <div className="space-y-1.5">
                    {selectedQuote.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-orange-600 shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{file.fileName}</span>
                        </div>
                        <a
                          href={file.storagePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Quotation Proposal Formulation Form */}
              <div className="p-5 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-4 text-xs">
                <div className="font-bold text-orange-950 uppercase tracking-wider text-[11px]">
                  Tuffloom Quotation Proposal & Factory Costing
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Quoted Unit Price</label>
                    <div className="flex gap-2">
                      <select
                        value={quotedCurrency}
                        onChange={(e) => setQuotedCurrency(e.target.value as 'USD' | 'INR')}
                        className="px-2 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      value={leadDays}
                      onChange={(e) => setLeadDays(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Quotation Status</label>
                    <select
                      value={statusToUpdate}
                      onChange={(e) => setStatusToUpdate(e.target.value)}
                      className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl font-bold"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="NEED_MORE_INFORMATION">NEED_MORE_INFORMATION</option>
                      <option value="SAMPLE_REQUIRED">SAMPLE_REQUIRED</option>
                      <option value="QUOTATION_PREPARED">QUOTATION_PREPARED</option>
                      <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 min-h-[44px] bg-white border border-gray-300 rounded-xl"
                  />
                </div>

                {/* Section 28: Private Internal Notes (NEVER visible to customers!) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private Internal Notes (STRICTLY PRIVATE — Hidden from Customer)</span>
                  </div>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Factory costing: $14.20 / Target margin: 28% / Internal supplier notes..."
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveProposal(false)}
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl flex items-center justify-center"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProposal(true)}
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Proposal to Customer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
