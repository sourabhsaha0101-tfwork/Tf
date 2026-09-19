import React from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const metadata = {
  title: 'Tuffloom Admin — B2B Wholesale Portal',
  description: 'Manage products, categories, wholesale pricing tiers, and vendors.',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
