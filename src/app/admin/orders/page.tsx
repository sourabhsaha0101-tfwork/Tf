'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Eye,
  FileText,
} from 'lucide-react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (data.success && data.orders) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to load admin orders', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-600" />
            Wholesale Ready-Stock Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Model 1 wholesale stock fulfillment, volume price tier invoicing, and immediate warehouse dispatches.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto text-xs font-bold">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading wholesale orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No wholesale orders placed yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Mobile Cards (Visible on screens < md) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {orders
              .filter((o) => (statusFilter === 'ALL' ? true : o.status === statusFilter))
              .map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {order.customer?.companyName || order.customer?.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{order.customer?.email}</div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Amount</span>
                      <strong className="text-sm font-black text-gray-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Quantity</span>
                      <span className="text-gray-700 font-bold">{order.items?.length || 1} line item(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                        Pay: {order.paymentStatus}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                        Status: {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop Table (Hidden on screens < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders
                  .filter((o) => (statusFilter === 'ALL' ? true : o.status === statusFilter))
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{order.customer?.companyName || order.customer?.name}</div>
                        <div className="text-[11px] text-gray-500">{order.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.items?.length || 1} line item(s)
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

