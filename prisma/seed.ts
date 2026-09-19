import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tuffloom.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash: hashedPassword,
      phone: '1234567890',
      businessName: 'Tuffloom Admin',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const bags = await prisma.category.upsert({
    where: { slug: 'bags' },
    update: {},
    create: {
      name: 'Bags',
      slug: 'bags',
      sortOrder: 1,
    }
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      sortOrder: 2,
    }
  })

  const footwear = await prisma.category.upsert({
    where: { slug: 'footwear' },
    update: {},
    create: {
      name: 'Footwear',
      slug: 'footwear',
      sortOrder: 3,
    }
  })

  const bagSubcategories = ['Backpacks', 'Laptop Bags', 'School Bags', 'Travel Bags', 'Duffle Bags', 'Sling Bags', 'Ladies Bags', 'Handbags', 'Other Bags']
  for (let i = 0; i < bagSubcategories.length; i++) {
    const sub = bagSubcategories[i]
    await prisma.category.upsert({
      where: { slug: sub.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: {
        name: sub,
        slug: sub.toLowerCase().replace(/ /g, '-'),
        parentId: bags.id,
        sortOrder: i + 1,
      }
    })
  }

  const clothingSubcategories = ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Dresses', 'Other Clothing']
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
      }
    })
  }

  const footwearSubcategories = ['Sneakers', 'Sports Shoes', 'Casual Shoes', 'Sandals', 'Slippers', 'Formal Shoes', 'Other Footwear']
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
      }
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
