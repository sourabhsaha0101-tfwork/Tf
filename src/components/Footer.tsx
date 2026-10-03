import React from 'react'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, Award, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-base shadow-sm shadow-orange-600/30">
                T
              </div>
              <div className="font-extrabold text-base tracking-tight text-white leading-none">
                TUFFLOOM<span className="text-orange-500">.</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              India&apos;s leading B2B commerce platform for Ready Wholesale Stocks and Custom Contract Manufacturing across Bags, Footwear, and Apparel.
            </p>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              Verified Factory Network & Zero IP Leakage
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Wholesale Catalog</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/products?category=bags" className="hover:text-white transition-colors">
                  Bags & Backpacks
                </Link>
              </li>
              <li>
                <Link href="/products?category=apparel" className="hover:text-white transition-colors">
                  Apparel & Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?category=footwear" className="hover:text-white transition-colors">
                  Footwear & Sneakers
                </Link>
              </li>
              <li>
                <Link href="/products?productType=READY_WHOLESALE" className="hover:text-white transition-colors">
                  Ready-Stock Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Custom Manufacturing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Custom Manufacturing</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/custom-manufacturing" className="hover:text-white transition-colors">
                  Request Custom RFQ
                </Link>
              </li>
              <li>
                <Link href="/products?productType=CUSTOM_MANUFACTURING" className="hover:text-white transition-colors">
                  Manufacturing Capabilities
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Production Tracking (11 Stages)
                </Link>
              </li>
              <li>
                <span className="text-gray-500">ANSI/ASQ Z1.4 — AQL 2.5 Inspection</span>
              </li>
            </ul>
          </div>

          {/* Standards & Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Standards & Assurances</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span>SEDEX, BSCI & OEKO-TEX audited</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Leather Working Group (LWG) Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>FOB, CIF & Ex-Factory Global Logistics</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 underline"
              >
                Employee & Admin Sign In →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
          <div>
            © 2026 Tuffloom Traders Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>GST Registered B2B Entity</span>
            <span>•</span>
            <span>Security Compliant & Non-Disclosure Protected</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
