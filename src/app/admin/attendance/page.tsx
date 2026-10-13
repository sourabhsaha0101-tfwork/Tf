'use client'

import React, { useState, useEffect } from 'react'
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  LogIn,
  LogOut,
} from 'lucide-react'

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [punching, setPunching] = useState(false)

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/attendance')
      const data = await res.json()
      if (data.success && data.data) {
        setRecords(data.data)
      }
    } catch (err) {
      console.error('Failed to load attendance records', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [])

  const handlePunch = async () => {
    setPunching(true)
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Self punch from dashboard' }),
      })
      const data = await res.json()
      if (data.success) {
        await loadAttendance()
      } else {
        alert(data.error || 'Failed to record punch')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPunching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-orange-600" />
            Attendance & Punch Clock
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time shift clock-in/out verification, on-site floor records, and working hours tracking.
          </p>
        </div>

        <button
          onClick={handlePunch}
          disabled={punching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Clock className="w-4 h-4" />
          {punching ? 'Recording...' : 'Punch In / Out Now'}
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading attendance records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No attendance records found.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Mobile Cards (Visible on screens < md) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {records.map((r) => (
              <div key={r.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span>{r.employeeName || 'Staff Member'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl text-xs text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Date</span>
                    <span className="font-mono text-gray-700 font-bold">{r.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Check In</span>
                    <span className="font-mono text-gray-900 font-bold">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Check Out</span>
                    <span className="font-mono text-gray-900 font-bold">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </span>
                  </div>
                </div>

                {r.notes && (
                  <div className="text-[11px] text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                    {r.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on screens < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{r.employeeName || 'Staff Member'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{r.date}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : 'Active Shift'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{r.notes || '—'}</td>
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

