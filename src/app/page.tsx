import Link from 'next/link'
import {
  Package,
  FolderTree,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  ClipboardList,
  Compass,
  FileCheck,
  Truck,
  FileSpreadsheet,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 w-full space-y-16 py-12">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Dual B2B Engine: Ready Wholesale & Custom Contract Manufacturing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 max-w-4xl mx-auto leading-[1.1]">
            Scale Your Brand with Tuffloom Traders
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Order ready-to-ship bulk wholesale inventory or commission custom private-label manufacturing with 11-stage tracking and certified AQL 2.5 quality control.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/products?productType=READY_WHOLESALE"
              className="px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4 text-orange-400" />
              Explore Ready Stock
            </Link>

            <Link
              href="/custom-manufacturing"
              className="px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get Custom Quotation
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/account"
              className="px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-gray-500" />
              Track Production
            </Link>
          </div>
        </section>

        {/* Parallel Business Models Breakdown */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600">Dual Business Models</h2>
            <p className="text-2xl font-black text-gray-900 mt-1">Two Streamlined Ways to Procure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Model 1: Ready Wholesale */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  MODEL 1 • READY WHOLESALE
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Immediate Stock with Volume Tiers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Purchase ready-to-ship inventory in bulk with graduated tier pricing, instant checkout, and verified GST invoices.
                </p>

                <div className="pt-3 space-y-2 text-xs font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Graduated volume discount pricing tiers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Immediate dispatch within 24–48 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Razorpay & direct bank transfer options</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">Instant Order Checkout</span>
                <Link
                  href="/products?productType=READY_WHOLESALE"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Browse Wholesale Stock <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Model 2: Custom Manufacturing */}
            <div className="bg-white border-2 border-orange-500/20 bg-gradient-to-b from-orange-50/20 to-transparent rounded-3xl p-8 shadow-xs flex flex-col justify-between hover:border-orange-500/40 transition-all">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
                  MODEL 2 • CUSTOM MANUFACTURING
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Custom Contract & Private Label</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Manufacture your designs with custom GSM, fabrics, embossed branding, prototype sampling, and 11-step production monitoring.
                </p>

                <div className="pt-3 space-y-2 text-xs font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Tech Pack / Spec Sheet upload & custom quotations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Physical Prototype Sample ordering before mass production</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>ANSI/ASQ Z1.4 — AQL 2.5 certified inspection report</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">Tuffloom Controlled Style Codes</span>
                <Link
                  href="/custom-manufacturing"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  Request Custom Quote <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 11-Stage Production Tracking Highlight */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                Real-Time Transparency
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                11-Stage Manufacturing Tracking
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Track your bulk production order step-by-step with verified stage logs, time-stamped milestone photos, and authorized downloadable inspection certificates.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center text-xs">
              {[
                '1. Order Confirmed',
                '2. Raw Material Sourced',
                '3. Cutting Done',
                '4. In Progress',
                '5. 30% In-Line QC',
                '6. Final AQL 2.5',
                '7. Packed',
                '8. Ready for Dispatch',
                '9. Dispatched',
                '10. In Transit',
                '11. Delivered',
              ].map((stage, i) => (
                <div
                  key={stage}
                  className="bg-gray-800/80 border border-gray-700 rounded-xl p-2.5 text-gray-300 font-medium text-[11px]"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 mx-auto mb-1.5" />
                  {stage}
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-gray-800">
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-green-400" />
                Inspection Standard: ANSI/ASQ Z1.4 — AQL 2.5
              </div>
              <Link
                href="/account"
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                View Live Customer Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Main Product Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600">Explore Verticals</h2>
              <p className="text-2xl font-black text-gray-900 mt-0.5">Manufacturing & Wholesale Categories</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              View Full Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bags */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-orange-500 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Bags & Luggage</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    Primary Vertical
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Style Codes: TL-BAG-0101, TL-BAG-0102...</div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Canvas Totes, Full-Grain Cow Leather Bags, Ergonomic School Backpacks, Duffel Bags, and Water-Resistant Laptop Sleeves.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/products?category=bags"
                  className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/custom-manufacturing?category=bags"
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Custom Quote
                </Link>
              </div>
            </div>

            {/* Clothing */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-blue-500 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Apparel & Textiles</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    8 Subcategories
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Style Codes: TL-APP-0301...</div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                180–240 GSM Combed Cotton T-Shirts, Heavyweight French Terry Hoodies, Pique Polos, Denim Jackets, and Corporate Uniforms.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/products?category=clothing"
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/custom-manufacturing?category=clothing"
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Custom Quote
                </Link>
              </div>
            </div>

            {/* Footwear */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 hover:border-purple-500 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FolderTree className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Footwear</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    7 Subcategories
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Style Codes: TL-SHOE-0205...</div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Full-Grain Leather Dress Shoes, Vulcanized Casual Sneakers, Lightweight EVA Sandals, and Slip-Resistant Work Boots.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/products?category=footwear"
                  className="px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Browse Catalog
                </Link>
                <Link
                  href="/custom-manufacturing?category=footwear"
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
