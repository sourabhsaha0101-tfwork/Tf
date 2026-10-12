'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

export default function AdminProductivityPage() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProductivity = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/productivity')
      const data = await res.json()
      if (data.success && data.data) {
        setReport(data.data)
      } else {
        setError(data.error || 'Failed to load productivity report')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading report'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductivity()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            Confidential &bull; Super Admin View
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          Employee Operations Productivity Reports
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Aggregated employee output metrics, task throughput rates, hours logged, and attendance consistency.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Generating productivity analysis...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-xs text-rose-600 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-gray-500 font-semibold">Total Staff Assigned</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{report.totalEmployees}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-gray-500 font-semibold">Tasks Assigned</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{report.totalTasksAssigned}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-gray-500 font-semibold">Overall Completion Rate</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {report.overallCompletionRate}%
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-gray-500 font-semibold">Total Hours Logged</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{report.totalHoursLogged} hrs</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Employee Performance Breakdown</h2>
              <span className="text-xs font-mono text-gray-500">{report.period}</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Tasks Assigned</th>
                  <th className="px-6 py-4">Tasks Completed</th>
                  <th className="px-6 py-4">Completion %</th>
                  <th className="px-6 py-4">Hours Logged</th>
                  <th className="px-6 py-4">Attendance (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.employeeSummaries.map((emp: any) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{emp.employeeName}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{emp.tasksAssigned}</td>
                    <td className="px-6 py-4 font-mono text-emerald-600 font-bold">
                      {emp.tasksCompleted}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${emp.completionRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold">{emp.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{emp.hoursLogged} hrs</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{emp.attendanceDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
