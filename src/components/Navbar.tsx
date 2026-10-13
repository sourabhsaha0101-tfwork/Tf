'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { label: 'All Products', href: '/products' },
    { label: 'Ready Wholesale', href: '/products?productType=READY_WHOLESALE' },
    { label: 'Custom Manufacturing', href: '/custom-manufacturing' },
    { label: 'My Account & Orders', href: '/account' },
  ]

  const isActive = (href: string) => {
    if (href === '/products' && pathname === '/products') return true
    if (href.includes('?') && pathname + (typeof window !== 'undefined' ? window.location.search : '') === href) return true
    return pathname.startsWith(href.split('?')[0]) && href !== '/products'
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-600/30 group-hover:scale-105 transition-transform">
              T
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                TUFFLOOM<span className="text-orange-600">.</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">
                Wholesale & Custom Manufacturing
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                isActive(link.href)
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/custom-manufacturing"
            className="px-3.5 py-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Get Custom Quote
          </Link>
          <Link
            href="/account"
            className="px-3 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" /> My Account
          </Link>
          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-1.5">
          <Link
            href="/account"
            className="w-11 h-11 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-xl transition-colors"
            title="My Account"
            aria-label="My Account"
          >
            <User className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 md:hidden border-b border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    isActive(link.href)
                      ? 'text-orange-600 bg-orange-50 font-bold'
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <Link
                href="/custom-manufacturing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Get Custom Quotation
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Account
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
