'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAuditLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/audit-logs')
      const data = await res.json()
      if (data.success && data.data) {
        setLogs(data.data)
      } else {
        setError(data.error || 'Failed to load audit trail')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading audit logs'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditLogs()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            Immutable Audit Trail &bull; Super Admin View
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-orange-600" />
          System Security & Operational Audit Logs
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed immutable trail of pricing changes, task lifecycle events, quotation proposals, and status transitions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading audit trail...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-xs text-rose-600 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-500">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Mobile Cards (Visible on screens < md) */}
          <div className="block md:hidden divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                    {log.actorRole}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm text-gray-900">{log.actorName}</div>
                  <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                    {log.action}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="text-gray-600 font-mono text-[11px]">
                    <strong>Target:</strong> {log.entityType} ({log.entityId?.slice(0, 10)})
                  </div>
                  {log.details && (
                    <div className="text-[11px] font-mono text-gray-500 truncate">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on screens < md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{log.actorName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-orange-600">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {log.entityType} ({log.entityId.slice(0, 10)})
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
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

