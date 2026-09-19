'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, Plus, ExternalLink, ShieldCheck } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  onToggleSidebar?: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  actions,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="h-16 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Active</span>
          </div>

          {actions}
        </div>
      </div>
    </header>
  )
}
