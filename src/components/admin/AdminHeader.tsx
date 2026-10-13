'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, Plus, ExternalLink, ShieldCheck } from 'lucide-react'
import { useAdminSidebar } from './AdminLayout'

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
  const { toggleSidebar } = useAdminSidebar()
  const handleToggle = onToggleSidebar || toggleSidebar

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleToggle}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 shrink-0"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>


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
