'use client'

import React, { useState, useEffect } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react'

export default function AdminDailyProgressPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summaryText, setSummaryText] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState(1)
  const [hoursLogged, setHoursLogged] = useState(8)
  const [blockers, setBlockers] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/daily-progress')
      const data = await res.json()
      if (data.success && data.data) {
        setReports(data.data)
      }
    } catch (err) {
      console.error('Failed to load progress reports', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summaryText.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/daily-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryText,
          tasksCompletedCount: tasksCompleted,
          hoursLogged,
          blockers: blockers.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSummaryText('')
        setBlockers('')
        await loadReports()
      } else {
        alert(data.error || 'Failed to submit progress')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-orange-600" />
          Daily Progress Summaries & Floor Work Logs
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daily milestones completed, working hours logged, order batches processed, and operational blockers.
        </p>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-orange-600" />
          Submit Daily Work Summary
        </h2>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Summary of Work Done Today *
          </label>
          <textarea
            required
            rows={3}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="e.g. Completed pattern cutting for 500 sets on table 2; inspected stitching on line 1."
            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tasks Completed Count
            </label>
            <input
              type="number"
              min={0}
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(parseInt(e.target.value) || 0)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Hours Logged
            </label>
            <input
              type="number"
              step="0.5"
              min={1}
              max={24}
              value={hoursLogged}
              onChange={(e) => setHoursLogged(parseFloat(e.target.value) || 8)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Blockers / Impediments (Optional)
            </label>
            <input
              type="text"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="e.g. Awaiting zipper batch clearance"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Progress Log'}
          </button>
        </div>
      </form>

      {/* Reports Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-900">Recent Employee Progress Reports</h2>
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading progress reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl">
            No progress reports submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {r.employeeName || 'Staff Member'}
                  </span>
                  <span className="font-mono text-gray-500">{r.date}</span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {r.summaryText}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                  <span>{r.tasksCompletedCount} tasks finished</span>
                  <span className="font-mono font-bold text-gray-900">{r.hoursLogged} hrs logged</span>
                </div>

                {r.blockers && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Blocker: {r.blockers}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
