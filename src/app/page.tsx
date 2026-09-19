import Link from 'next/link'
import { Package, FolderTree, ShieldCheck, ArrowRight, CheckCircle2, Layers } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-orange-600/30">
              T
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                TUFFLOOM<span className="text-orange-600">.</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mt-0.5">
                Wholesale B2B Platform
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Admin Sign In
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm shadow-orange-600/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" /> Phase 2 Complete: Product & Category Management
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
            Premium B2B Wholesale Commerce Platform
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Tuffloom Traders connects manufacturers with wholesale buyers across India. Featuring graduated quantity pricing tiers, multi-image product management, dynamic categories, and robust backend authorization.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admin/products"
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/30 transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Manage Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/categories"
              className="px-6 py-3 rounded-xl text-sm font-bold text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition-all flex items-center gap-2"
            >
              <FolderTree className="w-4 h-4 text-orange-600" /> Manage Categories
            </Link>
          </div>
        </div>

        {/* 3 Main Categories Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-orange-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Bags (Primary)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">9 Subcategories</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Backpacks, Laptop Bags, School Bags, Travel Bags, Duffle Bags, Sling Bags, Ladies Bags, Handbags, Other Bags.
            </p>
            <div className="pt-2">
              <Link href="/admin/products?categoryId=cat-bags-001" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                View Bag Catalog <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-blue-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Clothing</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">8 Subcategories</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              T-Shirts, Shirts, Jeans, Trousers, Jackets, Hoodies, Dresses, Other Clothing.
            </p>
            <div className="pt-2">
              <Link href="/admin/categories" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                Explore Subcategories <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-purple-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FolderTree className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Footwear</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">7 Subcategories</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sneakers, Sports Shoes, Casual Shoes, Sandals, Slippers, Formal Shoes, Other Footwear.
            </p>
            <div className="pt-2">
              <Link href="/admin/categories" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                Explore Subcategories <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Phase 2 Architecture Features Highlights */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Phase 2 Architecture & Security Standards Implemented</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <div className="font-bold text-gray-900">Server-Side Authorization</div>
              <div className="text-gray-500">All admin CRUD, price, stock, and upload operations require verified admin role.</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <div className="font-bold text-gray-900">B2B Quantity Price Tiers</div>
              <div className="text-gray-500">Graduated bulk discounts validated and calculated server-side with tax breakdowns.</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <div className="font-bold text-gray-900">Audit & Historical Safety</div>
              <div className="text-gray-500">Products referenced by orders are archived, protecting historical invoices and snapshots.</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <div className="font-bold text-gray-900">Multi-Image Optimization</div>
              <div className="text-gray-500">Secure MIME & size checks, primary thumbnail selection, and custom sort ordering.</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div>© 2026 Tuffloom Traders Pvt Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Bags • Clothing • Footwear</span>
            <Link href="/admin/login" className="font-semibold text-orange-600 hover:underline">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
