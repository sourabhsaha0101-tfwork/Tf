import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tuffloom.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@example.com'
  const customerPassword = process.env.CUSTOMER_PASSWORD || 'Customer@123456'

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  const hashedCustomerPassword = await bcrypt.hash(customerPassword, 10)

  // 1. Seed Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedAdminPassword,
      phone: '9876543210',
      businessName: 'Tuffloom Traders Admin',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // 2. Seed Customer
  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      name: 'Rahul Sharma',
      passwordHash: hashedCustomerPassword,
      phone: '9876543211',
      businessName: 'Sharma Retailers',
      role: 'CUSTOMER',
      isActive: true,
    },
  })

  // 3. Seed Vendors
  const vendorApex = await prisma.vendor.upsert({
    where: { email: 'sales@apexcrafts.com' },
    update: {},
    create: {
      name: 'Apex Craftsmen',
      companyName: 'Apex Leather & Bag Works Pvt Ltd',
      email: 'sales@apexcrafts.com',
      phone: '+91 98200 11223',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      gstin: '09AAACA1234A1Z5',
      status: 'ACTIVE',
    },
  })

  const vendorHeritage = await prisma.vendor.upsert({
    where: { email: 'b2b@heritagetextiles.com' },
    update: {},
    create: {
      name: 'Heritage Textiles',
      companyName: 'Heritage Weavers & Garments Ltd',
      email: 'b2b@heritagetextiles.com',
      phone: '+91 98300 44556',
      city: 'Surat',
      state: 'Gujarat',
      gstin: '24BBBCB5678B2Z8',
      status: 'ACTIVE',
    },
  })

  const vendorStepRight = await prisma.vendor.upsert({
    where: { email: 'wholesale@stepright.in' },
    update: {},
    create: {
      name: 'StepRight Footwear',
      companyName: 'StepRight Shoes Corporation',
      email: 'wholesale@stepright.in',
      phone: '+91 98400 77889',
      city: 'Agra',
      state: 'Uttar Pradesh',
      gstin: '09CCCC9988C3Z1',
      status: 'ACTIVE',
    },
  })

  // 4. Seed Main Categories
  const bags = await prisma.category.upsert({
    where: { slug: 'bags' },
    update: {},
    create: {
      name: 'Bags',
      slug: 'bags',
      description: 'Durable and heavy-duty wholesale bags for retail and corporate distribution.',
      imageUrl: '/uploads/categories/bags.jpg',
      sortOrder: 1,
      isActive: true,
    },
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Premium quality apparel, t-shirts, jeans, and formal wholesale clothing.',
      imageUrl: '/uploads/categories/clothing.jpg',
      sortOrder: 2,
      isActive: true,
    },
  })

  const footwear = await prisma.category.upsert({
    where: { slug: 'footwear' },
    update: {},
    create: {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Wholesale athletic, formal, and casual shoes built for longevity and comfort.',
      imageUrl: '/uploads/categories/footwear.jpg',
      sortOrder: 3,
      isActive: true,
    },
  })

  // 5. Seed Subcategories
  const bagSubcategories = [
    'Backpacks',
    'Laptop Bags',
    'School Bags',
    'Travel Bags',
    'Duffle Bags',
    'Sling Bags',
    'Ladies Bags',
    'Handbags',
    'Other Bags',
  ]
  const subCategoryMap: Record<string, string> = {}
  for (let i = 0; i < bagSubcategories.length; i++) {
    const sub = bagSubcategories[i]
    const created = await prisma.category.upsert({
      where: { slug: sub.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: sub,
        slug: sub.toLowerCase().replace(/ /g, '-'),
        parentId: bags.id,
        sortOrder: i + 1,
        isActive: true,
      },
    })
    subCategoryMap[sub] = created.id
  }

  const clothingSubcategories = [
    'T-Shirts',
    'Shirts',
    'Jeans',
    'Trousers',
    'Jackets',
    'Hoodies',
    'Dresses',
    'Other Clothing',
  ]
  for (let i = 0; i < clothingSubcategories.length; i++) {
    const sub = clothingSubcategories[i]
    await prisma.category.upsert({
      where: { slug: sub.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: sub,
        slug: sub.toLowerCase().replace(/ /g, '-'),
        parentId: clothing.id,
        sortOrder: i + 1,
        isActive: true,
      },
    })
  }

  const footwearSubcategories = [
    'Sneakers',
    'Sports Shoes',
    'Casual Shoes',
    'Sandals',
    'Slippers',
    'Formal Shoes',
    'Other Footwear',
  ]
  for (let i = 0; i < footwearSubcategories.length; i++) {
    const sub = footwearSubcategories[i]
    await prisma.category.upsert({
      where: { slug: sub.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: sub,
        slug: sub.toLowerCase().replace(/ /g, '-'),
        parentId: footwear.id,
        sortOrder: i + 1,
        isActive: true,
      },
    })
  }

  // 6. Seed Initial Products with Images and B2B Pricing Tiers
  const p1 = await prisma.product.upsert({
    where: { slug: 'tuffloom-pro-executive-laptop-backpack' },
    update: {},
    create: {
      name: 'Tuffloom Pro Executive Laptop Backpack',
      slug: 'tuffloom-pro-executive-laptop-backpack',
      sku: 'TL-BP-EX01',
      categoryId: bags.id,
      subcategoryId: subCategoryMap['Laptop Bags'],
      vendorId: vendorApex.id,
      shortDescription: 'Water-resistant 15.6" ballistic nylon executive laptop backpack with USB port.',
      description:
        'Engineered for modern professionals and corporate gifting. Features multi-compartment organizers, padded air-mesh back support, TSA lock compatibility, and reinforced stitching.',
      brand: 'Tuffloom',
      material: '1680D Ballistic Nylon',
      color: 'Charcoal Black',
      size: '32L',
      weight: 1.1,
      dimensions: '48 x 33 x 18 cm',
      mrp: 1499,
      wholesalePrice: 650,
      basePrice: 650,
      gstPercent: 18,
      moq: 20,
      stock: 450,
      status: 'ACTIVE',
      featured: true,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
            storagePath: 'products/backpack-front.jpg',
            altText: 'Tuffloom Pro Laptop Backpack - Front View',
            sortOrder: 0,
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
            storagePath: 'products/backpack-side.jpg',
            altText: 'Tuffloom Pro Laptop Backpack - Side & Interior',
            sortOrder: 1,
            isPrimary: false,
          },
        ],
      },
      quantityPricing: {
        create: [
          { minQty: 20, maxQty: 49, pricePerUnit: 599 },
          { minQty: 50, maxQty: 99, pricePerUnit: 565 },
          { minQty: 100, maxQty: 499, pricePerUnit: 525 },
          { minQty: 500, maxQty: null, pricePerUnit: 495 },
        ],
      },
    },
  })

  console.log(`Seeding completed successfully! Admin: ${adminEmail}, Sample Product: ${p1.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
