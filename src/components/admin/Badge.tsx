import React from 'react'

export type BadgeVariant = 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' | 'default'

interface BadgeProps {
  status: BadgeVariant | string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase()

  let styles = 'bg-gray-100 text-gray-800 border-gray-200'
  let label = status

  switch (normalized) {
    case 'ACTIVE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200'
      label = 'Active'
      break
    case 'DRAFT':
      styles = 'bg-slate-100 text-slate-700 border-slate-200'
      label = 'Draft'
      break
    case 'INACTIVE':
      styles = 'bg-rose-50 text-rose-700 border-rose-200'
      label = 'Inactive'
      break
    case 'OUT_OF_STOCK':
      styles = 'bg-amber-50 text-amber-700 border-amber-200'
      label = 'Out of Stock'
      break
    case 'ARCHIVED':
      styles = 'bg-purple-50 text-purple-700 border-purple-200'
      label = 'Archived'
      break
    default:
      styles = 'bg-gray-50 text-gray-700 border-gray-200'
      break
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {label}
    </span>
  )
}
