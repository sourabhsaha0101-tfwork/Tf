'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  Send,
  CreditCard,
  FileCheck,
  FolderOpen,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  AlertCircle,
  MessageSquare,
  Check,
  Eye,
  Camera,
  Award,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

function AccountPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') || 'dashboard'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)

  // Data states
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [wholesaleOrders, setWholesaleOrders] = useState<any[]>([])
  const [mfgOrders, setMfgOrders] = useState<any[]>([])
  const [quotations, setQuotations] = useState<any[]>([])
  const [sampleOrders, setSampleOrders] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  // Modal / Detail views
  const [selectedMfgOrder, setSelectedMfgOrder] = useState<any>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [approvingQuotation, setApprovingQuotation] = useState(false)
  const [payingSampleId, setPayingSampleId] = useState<string | null>(null)

  const loadAccountData = async () => {
    setLoading(true)
    try {
      const [
        dashRes,
        ordersRes,
        mfgRes,
        quotesRes,
        samplesRes,
        invRes,
        payRes,
        docsRes,
      ] = await Promise.all([
        fetch('/api/my/dashboard').then((r) => r.json()),
        fetch('/api/my/orders').then((r) => r.json()),
        fetch('/api/my/manufacturing-orders').then((r) => r.json()),
        fetch('/api/my/quotations').then((r) => r.json()),
        fetch('/api/my/sample-orders').then((r) => r.json()),
        fetch('/api/my/invoices').then((r) => r.json()),
        fetch('/api/my/payments').then((r) => r.json()),
        fetch('/api/my/documents').then((r) => r.json()),
      ])

      if (dashRes.success) setDashboardMetrics(dashRes.metrics)
      if (ordersRes.success) setWholesaleOrders(ordersRes.orders || [])
      if (mfgRes.success) {
        setMfgOrders(mfgRes.manufacturingOrders || [])
        if (mfgRes.manufacturingOrders?.length > 0 && !selectedMfgOrder) {
          setSelectedMfgOrder(mfgRes.manufacturingOrders[0])
        }
      }
      if (quotesRes.success) {
        setQuotations(quotesRes.quotations || [])
        if (quotesRes.quotations?.length > 0 && !selectedQuotation) {
          setSelectedQuotation(quotesRes.quotations[0])
        }
      }
      if (samplesRes.success) setSampleOrders(samplesRes.sampleOrders || [])
      if (invRes.success) setInvoices(invRes.invoices || [])
      if (payRes.success) setPayments(payRes.payments || [])
      if (docsRes.success) setDocuments(docsRes.documents || [])
    } catch (err) {
      console.error('Failed to load customer account data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccountData()
  }, [])

  // Approve quotation and convert to manufacturing order
  const handleApproveQuotation = async (quotationId: string) => {
    if (!confirm('Are you sure you want to approve this quotation and proceed to manufacturing?')) return
    setApprovingQuotation(true)
    try {
      const res = await fetch(`/api/my/quotations/${quotationId}/approve`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        alert('Quotation approved! Production file created.')
        await loadAccountData()
      } else {
        alert(data.error || 'Failed to approve quotation')
      }
    } catch {
      alert('Error approving quotation')
    } finally {
      setApprovingQuotation(false)
    }
  }

  // Send message on quotation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedQuotation || !newMessage.trim()) return
    setSendingMessage(true)
    try {
      const res = await fetch(`/api/my/quotations/${selectedQuotation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setNewMessage('')
        // Refresh quotation
        const qRes = await fetch(`/api/my/quotations/${selectedQuotation.id}`).then((r) => r.json())
        if (qRes.success) setSelectedQuotation(qRes.data)
      }
    } catch {
      alert('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Pay sample order
  const handlePaySample = async (id: string) => {
    setPayingSampleId(id)
    try {
      const res = await fetch(`/api/my/sample-orders/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'RAZORPAY', paymentReference: `TXN-SMP-${Date.now()}` }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Sample order payment confirmed!')
        await loadAccountData()
      } else {
        alert(data.error || 'Payment failed')
      }
    } catch {
      alert('Payment processing error')
    } finally {
      setPayingSampleId(null)
    }
  }

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manufacturing', label: 'Manufacturing Orders', icon: Layers, badge: mfgOrders.length },
    { id: 'quotations', label: 'My Quotations', icon: Sparkles, badge: quotations.length },
    { id: 'samples', label: 'Sample Orders', icon: Send, badge: sampleOrders.length },
    { id: 'orders', label: 'Wholesale Orders', icon: Package, badge: wholesaleOrders.length },
    { id: 'invoices', label: 'Invoices', icon: FileText, badge: invoices.length },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'documents', label: 'Documents & Certificates', icon: FolderOpen },
  ]

  const elevenStages = [
    'ORDER_CONFIRMED',
    'RAW_MATERIAL_SOURCED',
    'CUTTING_DONE',
    'PRODUCTION_IN_PROGRESS',
    'IN_LINE_INSPECTION_30',
    'FINAL_INSPECTION_AQL',
    'PACKED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'SHIPMENT_IN_TRANSIT',
    'DELIVERED',
  ]

  const stageTitles: Record<string, string> = {
    ORDER_CONFIRMED: '1. Order Confirmed',
    RAW_MATERIAL_SOURCED: '2. Raw Material Sourced',
    CUTTING_DONE: '3. Cutting Done',
    PRODUCTION_IN_PROGRESS: '4. Production In Progress',
    IN_LINE_INSPECTION_30: '5. 30% In-Line Inspection',
    FINAL_INSPECTION_AQL: '6. Final AQL 2.5 Inspection',
    PACKED: '7. Packed',
    READY_FOR_DISPATCH: '8. Ready for Dispatch',
    DISPATCHED: '9. Dispatched',
    SHIPMENT_IN_TRANSIT: '10. Shipment In Transit',
    DELIVERED: '11. Delivered',
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* User Account Banner */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-xl flex items-center justify-center shadow-sm shadow-orange-600/30">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Rahul Verma</h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  GST Verified Buyer
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Verma Retail Enterprises • Mumbai, India • ID: <span className="font-mono">CUST-DEMO-001</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/custom-manufacturing"
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              New Custom RFQ
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  router.replace(`/account?tab=${tab.id}`, { scroll: false })
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-orange-700 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Purchase</span>
                <div className="text-xl font-black text-gray-900 mt-1">
                  ₹{(dashboardMetrics?.totalPurchase || 845000).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">Wholesale & Manufacturing</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Ready Stock Orders</span>
                <div className="text-xl font-black text-blue-600 mt-1">
                  {dashboardMetrics?.totalOrders || wholesaleOrders.length || 24}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">Model 1 Wholesale</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Custom Mfg Orders</span>
                <div className="text-xl font-black text-orange-600 mt-1">
                  {dashboardMetrics?.manufacturingOrders || mfgOrders.length || 2}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">11-Stage Production</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Active Quotations</span>
                <div className="text-xl font-black text-purple-600 mt-1">
                  {quotations.length || 3}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">Engineering RFQs</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400">Pending Payments</span>
                <div className="text-xl font-black text-amber-600 mt-1">
                  ₹{(dashboardMetrics?.pendingPayments || 150000).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">Milestone wire balance</span>
              </div>
            </div>

            {/* Quick Status Grids: Recent Mfg and Quotations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Manufacturing Order Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" />
                    Active Manufacturing Order
                  </h3>
                  <button
                    onClick={() => setActiveTab('manufacturing')}
                    className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {mfgOrders.length > 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {mfgOrders[0].manufacturingOrderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {stageTitles[mfgOrders[0].currentStage] || mfgOrders[0].currentStage}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {mfgOrders[0].productName} ({mfgOrders[0].styleCode})
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <div>Quantity: <strong>{mfgOrders[0].quantity} pcs</strong></div>
                      <div>Destination: <strong>{mfgOrders[0].destinationCity}, {mfgOrders[0].destinationCountry}</strong></div>
                      <div>Trade Term: <strong>{mfgOrders[0].tradeTerm}</strong></div>
                      <div>Progress: <strong>{mfgOrders[0].progressPercent}%</strong></div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-600 h-full rounded-full transition-all"
                        style={{ width: `${mfgOrders[0].progressPercent || 40}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No active contract manufacturing orders.</p>
                )}
              </div>

              {/* Recent Quotation RFQ Preview */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Recent Quotation Proposals
                  </h3>
                  <button
                    onClick={() => setActiveTab('quotations')}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    View All Quotes <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {quotations.length > 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-900">
                        {quotations[0].quotationNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {quotations[0].status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {quotations[0].productName} ({quotations[0].styleCodeSnapshot})
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <div>Quantity: <strong>{quotations[0].quantity} pcs</strong></div>
                      <div>Target Price: <strong>{quotations[0].targetCurrency} {quotations[0].targetPrice}</strong></div>
                      <div>Quoted Price: <strong className="text-green-700">{quotations[0].quotedPrice ? `${quotations[0].quotedCurrency} ${quotations[0].quotedPrice}` : 'In Review'}</strong></div>
                      <div>Est. Lead: <strong>{quotations[0].leadDays ? `${quotations[0].leadDays} days` : 'Pending'}</strong></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No recent quotation requests.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUFACTURING ORDERS & 11-STAGE TRACKING */}
        {activeTab === 'manufacturing' && (
          <div className="space-y-6">
            {mfgOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
                <Layers className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Custom Manufacturing Orders Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Submit a custom quotation request with your specifications and tech pack to launch bulk production.
                </p>
                <Link
                  href="/custom-manufacturing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-xl"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Request Custom Quote
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Manufacturing Orders List */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Production Orders ({mfgOrders.length})
                  </h3>
                  {mfgOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedMfgOrder(order)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        selectedMfgOrder?.id === order.id
                          ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {order.manufacturingOrderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {order.progressPercent}%
                        </span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 truncate">{order.productName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Style: {order.styleCode}</span>
                        <span>{order.quantity} pcs</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Detailed 11-Stage Production Dashboard */}
                {selectedMfgOrder && (
                  <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-gray-900">
                            {selectedMfgOrder.manufacturingOrderNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                            {stageTitles[selectedMfgOrder.currentStage] || selectedMfgOrder.currentStage}
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mt-1">
                          {selectedMfgOrder.productName}
                        </h2>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Tuffloom Style: <strong className="text-gray-900">{selectedMfgOrder.styleCode}</strong> • Quantity: <strong className="text-gray-900">{selectedMfgOrder.quantity} pcs</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Trade & Destination</div>
                        <div className="text-xs font-bold text-gray-900">{selectedMfgOrder.tradeTerm} • {selectedMfgOrder.destinationCity}</div>
                        <div className="text-[11px] text-gray-500">{selectedMfgOrder.destinationCountry}</div>
                      </div>
                    </div>

                    {/* Section 23: 11-Stage Interactive Timeline */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          11-Stage Production Progress ({selectedMfgOrder.progressPercent}%)
                        </h3>
                        <span className="text-[11px] text-orange-600 font-bold">Real-Time Factory Audit</span>
                      </div>

                      {/* 11 Steps Grid / Chain */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                        {elevenStages.map((stageKey, idx) => {
                          const currentStageIdx = elevenStages.indexOf(selectedMfgOrder.currentStage)
                          const thisIdx = idx
                          const isDone = thisIdx < currentStageIdx
                          const isCurrent = thisIdx === currentStageIdx
                          const isPending = thisIdx > currentStageIdx

                          return (
                            <div
                              key={stageKey}
                              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                                isCurrent
                                  ? 'bg-orange-50 border-orange-500 text-orange-900 font-bold shadow-xs'
                                  : isDone
                                  ? 'bg-green-50/70 border-green-200 text-green-900 font-semibold'
                                  : 'bg-gray-50 border-gray-100 text-gray-400 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold">Step {idx + 1}</span>
                                {isDone ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : isCurrent ? (
                                  <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
                                ) : null}
                              </div>
                              <div className="text-[11px] mt-1 line-clamp-1">{stageTitles[stageKey]}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Section 18: Milestone Photos & Logs */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-orange-600" />
                        Milestone Production Logs & Verified Photos
                      </h3>

                      {selectedMfgOrder.stageLogs && selectedMfgOrder.stageLogs.length > 0 ? (
                        <div className="space-y-3">
                          {selectedMfgOrder.stageLogs.map((log: any) => (
                            <div
                              key={log.id}
                              className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">
                                  {stageTitles[log.stage] || log.stage}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {log.notes && <p className="text-gray-600">{log.notes}</p>}

                              {/* Authorized Photos */}
                              {log.photos && log.photos.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                  {log.photos.map((photo: string, pIdx: number) => (
                                    <div key={pIdx} className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                                      <img src={photo} alt="Production audit" className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No milestone photos logged yet.</p>
                      )}
                    </div>

                    {/* Section 19: ANSI/ASQ Z1.4 — AQL 2.5 Inspection Certificate */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-green-600" />
                        Quality Inspection Audit: ANSI/ASQ Z1.4 — AQL 2.5
                      </h3>

                      {selectedMfgOrder.inspections && selectedMfgOrder.inspections.length > 0 ? (
                        <div className="space-y-3">
                          {selectedMfgOrder.inspections.map((qc: any) => (
                            <div
                              key={qc.id}
                              className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-emerald-950">
                                  {qc.inspectionNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                    qc.status === 'PASSED'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-red-600 text-white'
                                  }`}
                                >
                                  STATUS: {qc.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>Sample Size: <strong>{qc.sampleSize} units</strong></div>
                                <div>Critical: <strong>{qc.criticalDefects}</strong></div>
                                <div>Major: <strong>{qc.majorDefects}</strong></div>
                                <div>Minor: <strong>{qc.minorDefects}</strong></div>
                              </div>
                              <p className="text-emerald-800 text-[11px]">{qc.notes}</p>
                              {qc.reportUrl && (
                                <a
                                  href={qc.reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download Authorized AQL 2.5 PDF Certificate
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500">
                          AQL 2.5 Final Pre-Shipment Inspection scheduled following in-line QC.
                        </div>
                      )}
                    </div>

                    {/* Section 22: Dispatch & Bill of Lading */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        Dispatch, Courier & Bill of Lading
                      </h3>

                      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>Carrier: <strong>{selectedMfgOrder.freightCarrier || 'Maersk Line / DHL Global'}</strong></div>
                          <div>Tracking: <strong className="font-mono">{selectedMfgOrder.trackingNumber || 'TL-TRK-981244'}</strong></div>
                          <div>Dispatch Date: <strong>{selectedMfgOrder.dispatchDate || 'Estimated on Packing'}</strong></div>
                          <div>Shipment Status: <strong className="text-blue-800">{selectedMfgOrder.shipmentStatus || 'PREPARING'}</strong></div>
                        </div>
                        {selectedMfgOrder.billOfLadingUrl && (
                          <div className="pt-1">
                            <a
                              href={selectedMfgOrder.billOfLadingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" /> View Authorized Ocean Bill of Lading
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY QUOTATIONS (RFQ Engine) */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            {quotations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Active Quotation Requests</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Submit spec sheets and CAD files for custom apparel, bags, or footwear.
                </p>
                <Link
                  href="/custom-manufacturing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-xl"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Request Custom Quote
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Quotations List */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    RFQs & Quotations ({quotations.length})
                  </h3>
                  {quotations.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuotation(q)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        selectedQuotation?.id === q.id
                          ? 'bg-purple-50/70 border-purple-500 shadow-xs'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {q.quotationNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {q.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 truncate">{q.productName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Style: {q.styleCodeSnapshot}</span>
                        <span>{q.quantity} pcs</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Detailed Quotation Review & Messaging */}
                {selectedQuotation && (
                  <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-gray-900">
                            {selectedQuotation.quotationNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {selectedQuotation.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mt-1">
                          {selectedQuotation.productName}
                        </h2>
                      </div>

                      {/* Customer Approval Button */}
                      {(selectedQuotation.status === 'QUOTATION_SENT' ||
                        selectedQuotation.status === 'UNDER_REVIEW') && (
                        <button
                          type="button"
                          onClick={() => handleApproveQuotation(selectedQuotation.id)}
                          disabled={approvingQuotation}
                          className="px-4 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          {approvingQuotation ? 'Approving...' : 'Approve & Create Manufacturing Order'}
                        </button>
                      )}
                    </div>

                    {/* Requirements Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Quantity</span>
                        <strong className="text-gray-900">{selectedQuotation.quantity} pcs</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Material</span>
                        <strong className="text-gray-900 truncate block">{selectedQuotation.material}</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Target Budget</span>
                        <strong className="text-gray-900">{selectedQuotation.targetCurrency} {selectedQuotation.targetPrice}</strong>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Trade Term</span>
                        <strong className="text-gray-900">{selectedQuotation.tradeTerm} • {selectedQuotation.destinationPort}</strong>
                      </div>
                    </div>

                    {/* Tuffloom Official Proposal */}
                    <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        Tuffloom Official Engineering Proposal
                      </div>
                      {selectedQuotation.quotedPrice ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                          <div>
                            <span className="text-gray-500 block text-[10px]">Offered Unit Price</span>
                            <span className="text-base font-black text-gray-900">
                              {selectedQuotation.quotedCurrency} {selectedQuotation.quotedPrice}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">Lead Time</span>
                            <span className="text-base font-black text-gray-900">
                              {selectedQuotation.leadDays} Days
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">Payment Terms</span>
                            <span className="text-xs font-bold text-gray-900">
                              {selectedQuotation.paymentTerms || '30% Advance Wire / 70% Before Dispatch'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 italic">
                          Our pricing desk is reviewing your CAD tech pack and raw material specifications. A formalized quote will be posted shortly.
                        </div>
                      )}
                    </div>

                    {/* Message Thread */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                        Engineering Clarification Thread
                      </h3>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {selectedQuotation.messages && selectedQuotation.messages.length > 0 ? (
                          selectedQuotation.messages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-2xl text-xs max-w-md ${
                                msg.senderType === 'CUSTOMER'
                                  ? 'ml-auto bg-orange-600 text-white rounded-br-xs'
                                  : 'mr-auto bg-gray-100 text-gray-800 rounded-bl-xs'
                              }`}
                            >
                              <div className="text-[10px] font-bold opacity-75 mb-0.5">
                                {msg.senderType === 'CUSTOMER' ? 'You' : 'Tuffloom Engineering'}
                              </div>
                              <div>{msg.message}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">No messages exchanged yet.</p>
                        )}
                      </div>

                      {/* Send message form */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type engineering question or specification update..."
                          className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !newMessage.trim()}
                          className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAMPLE ORDERS */}
        {activeTab === 'samples' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Prototype Sample Orders</h2>
                <p className="text-xs text-gray-500">
                  Track golden-seal sample development, courier tracking, and confirm online sample payments.
                </p>
              </div>
            </div>

            {sampleOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No prototype sample orders on record.</p>
            ) : (
              <div className="space-y-4">
                {sampleOrders.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{s.sampleOrderNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {s.sampleStatus}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">
                        {s.product?.name || 'Custom Bag/Apparel Prototype'} ({s.styleCode})
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Shipping to: <strong>{s.shippingDestination}</strong> • Courier: <strong>{s.courier || 'FedEx International'}</strong> {s.trackingNumber && `(${s.trackingNumber})`}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Invoice</span>
                        <strong className="text-sm font-black text-gray-900">
                          {s.currency === 'INR' ? '₹' : '$'}{s.total}
                        </strong>
                      </div>

                      {s.paymentStatus === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handlePaySample(s.id)}
                          disabled={payingSampleId === s.id}
                          className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs"
                        >
                          {payingSampleId === s.id ? 'Verifying...' : 'Pay Online Now'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WHOLESALE ORDERS (Phase 2 Model 1) */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Wholesale Ready-Stock Orders</h2>
                <p className="text-xs text-gray-500">
                  Historical and processing Model 1 ready wholesale stock orders.
                </p>
              </div>
            </div>

            {wholesaleOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No ready-stock wholesale orders placed yet.</p>
            ) : (
              <div className="space-y-4">
                {wholesaleOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{o.orderNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {o.status}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          {o.paymentStatus}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[11px]">
                        Placed on {new Date(o.createdAt).toLocaleDateString()} • Items: {o.items?.length || 1}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Amount</span>
                      <strong className="text-base font-black text-gray-900">
                        ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: INVOICES (Unified Model 1 & 2) */}
        {activeTab === 'invoices' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Tax Invoices</h2>
              <p className="text-xs text-gray-500">
                GST compliant tax invoices for ready wholesale and contract manufacturing milestones.
              </p>
            </div>

            {invoices.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No invoices generated yet.</p>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-gray-900">{inv.invoiceNumber}</span>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Issued: {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()} • Status: <strong className="text-green-700">{inv.status}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-gray-900 text-sm">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => alert(`Invoice ${inv.invoiceNumber} PDF download initiated.`)}
                        className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-white border border-gray-200 hover:bg-orange-50 rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PAYMENTS (Unified Architecture) */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Payment Transactions</h2>
              <p className="text-xs text-gray-500">
                Audit trail for wholesale orders, prototype samples, and manufacturing advance/balance payments.
              </p>
            </div>

            {payments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No payment transactions found.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{p.transactionId || p.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Method: <strong>{p.method}</strong> • Ref: {p.transactionReference || 'N/A'}
                      </div>
                    </div>
                    <span className="font-black text-gray-900 text-sm">
                      {p.currency === 'USD' ? '$' : '₹'}{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: DOCUMENTS & CERTIFICATES */}
        {activeTab === 'documents' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Authorized Technical Documents & Factory Certifications</h2>
              <p className="text-xs text-gray-500">
                Uploaded CAD tech packs, AQL 2.5 reports, bills of lading, and verified compliance certifications.
              </p>
            </div>

            {/* Certifications preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-green-700">Verified Compliance</span>
                <div className="font-black text-gray-900 text-sm">SEDEX SMETA 4-Pillar</div>
                <div className="text-[11px] text-gray-500">Social Audit • Valid thru Dec 2027</div>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-green-700">Verified Compliance</span>
                <div className="font-black text-gray-900 text-sm">OEKO-TEX Standard 100</div>
                <div className="text-[11px] text-gray-500">Harmful Substance Free • Class I</div>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-green-700">Verified Compliance</span>
                <div className="font-black text-gray-900 text-sm">BSCI Social Compliance</div>
                <div className="text-[11px] text-gray-500">Grade A Audited Facility</div>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-green-700">Verified Compliance</span>
                <div className="font-black text-gray-900 text-sm">LWG Gold Tannery</div>
                <div className="text-[11px] text-gray-500">Leather Working Group Certified</div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Your Confidential Files</h3>
              {documents.length === 0 ? (
                <p className="text-xs text-gray-400">No custom documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc: any, dIdx: number) => (
                    <div
                      key={dIdx}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                        <div>
                          <span className="font-bold text-gray-900">{doc.name || doc.title}</span>
                          <span className="text-[10px] text-gray-400 ml-2 font-mono">{doc.type || 'TECH_PACK'}</span>
                        </div>
                      </div>
                      <a
                        href={doc.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs font-bold text-orange-600 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-500">Loading customer account...</div>}>
      <AccountPageContent />
    </Suspense>
  )
}
