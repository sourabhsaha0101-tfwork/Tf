import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { Vendor, UserRole } from '@/types'
import { maskVendorForRole, isClient } from '@/lib/auth-guard'

export const vendorService = {
  async getVendors(requestingRole: UserRole = 'ADMIN'): Promise<Vendor[]> {
    // Clients/Customers have zero clearance to view factory vendors
    if (isClient(requestingRole)) {
      return []
    }

    let vendors: Vendor[] = []

    try {
      const dbVendors = await prisma.vendor.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { companyName: 'asc' },
      })
      if (dbVendors && dbVendors.length > 0) {
        vendors = dbVendors.map((v: any) => ({
          ...v,
          status: v.status as 'ACTIVE' | 'INACTIVE' | 'PENDING',
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }))
      }
    } catch {
      // Fallback
      vendors = dbFallback.vendors.filter((v) => v.status === 'ACTIVE')
    }

    if (vendors.length === 0) {
      vendors = dbFallback.vendors.filter((v) => v.status === 'ACTIVE')
    }

    return vendors.map((v) => maskVendorForRole(v, requestingRole)!).filter(Boolean)
  },

  async getVendorById(id: string, requestingRole: UserRole = 'ADMIN'): Promise<Vendor | null> {
    if (isClient(requestingRole)) {
      return null
    }

    let vendor: Vendor | null = null

    try {
      const v = await prisma.vendor.findUnique({
        where: { id },
      })
      if (v) {
        vendor = {
          ...v,
          status: v.status as 'ACTIVE' | 'INACTIVE' | 'PENDING',
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }
      }
    } catch {
      // Fallback
      vendor = dbFallback.vendors.find((v) => v.id === id) || null
    }

    if (!vendor) {
      vendor = dbFallback.vendors.find((v) => v.id === id) || null
    }

    return maskVendorForRole(vendor, requestingRole)
  },
}
