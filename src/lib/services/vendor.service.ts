import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { Vendor } from '@/types'

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    try {
      const vendors = await prisma.vendor.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { companyName: 'asc' },
      })
      if (vendors && vendors.length > 0) {
        return vendors.map((v) => ({
          ...v,
          status: v.status as 'ACTIVE' | 'INACTIVE' | 'PENDING',
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }))
      }
    } catch {
      // Fallback
    }

    return dbFallback.vendors.filter((v) => v.status === 'ACTIVE')
  },

  async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const v = await prisma.vendor.findUnique({
        where: { id },
      })
      if (v) {
        return {
          ...v,
          status: v.status as 'ACTIVE' | 'INACTIVE' | 'PENDING',
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }
      }
    } catch {
      // Fallback
    }

    return dbFallback.vendors.find((v) => v.id === id) || null
  },
}
