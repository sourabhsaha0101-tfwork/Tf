'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Building2,
  CreditCard,
  Truck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, status: 'ready' },
    { label: 'Products', href: '/admin/products', icon: Package, status: 'ready' },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree, status: 'ready' },
    { label: 'Orders', href: '#', icon: ShoppingBag, status: 'coming_soon' },
    { label: 'Customers', href: '#', icon: Users, status: 'coming_soon' },
    { label: 'Vendors', href: '#', icon: Building2, status: 'coming_soon' },
    { label: 'Payments', href: '#', icon: CreditCard, status: 'coming_soon' },
    { label: 'Shipments', href: '#', icon: Truck, status: 'coming_soon' },
    { label: 'Invoices', href: '#', icon: FileText, status: 'coming_soon' },
    { label: 'Reports', href: '#', icon: BarChart3, status: 'coming_soon' },
    { label: 'Settings', href: '#', icon: Settings, status: 'coming_soon' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href) && href !== '#'
  }

  const handleLogout = async () => {
    window.location.href = '/admin/login'
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-600/30">
              T
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                TUFFLOOM<span className="text-orange-600">.</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">
                B2B Admin Portal
              </div>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Catalog & Ops
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            if (item.status === 'coming_soon') {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed group opacity-75 select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    Soon
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <span className="w-1.5 h-4 rounded-full bg-orange-600"></span>}
              </Link>
            )
          })}
        </div>

        {/* Footer User Profile & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-600/10 text-orange-600 font-bold text-xs flex items-center justify-center border border-orange-200">
                AD
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">Admin User</div>
                <div className="text-[10px] text-gray-500 truncate">admin@tuffloom.com</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
