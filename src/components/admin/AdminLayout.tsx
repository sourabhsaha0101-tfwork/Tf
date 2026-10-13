'use client'

import React, { useState, createContext, useContext } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { Menu } from 'lucide-react'

interface AdminSidebarContextType {
  isOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

export const AdminSidebarContext = createContext<AdminSidebarContextType>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
})

export const useAdminSidebar = () => useContext(AdminSidebarContext)

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <AdminSidebarContext.Provider
      value={{
        isOpen: sidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Mobile Top Bar for all admin screens */}
          <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-xs">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                T
              </div>
              <div className="font-extrabold text-sm tracking-tight text-gray-900">
                TUFFLOOM<span className="text-orange-600">.</span> <span className="text-xs text-gray-500 font-semibold">Admin</span>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200/60"
            >
              Store ↗
            </a>
          </div>

          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminSidebarContext.Provider>
  )
}

