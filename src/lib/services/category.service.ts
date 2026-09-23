import { prisma } from '@/lib/prisma'
import { dbFallback } from '@/lib/db-fallback'
import { CategoryInput } from '@/lib/validations/category.schema'
import { Category } from '@/types'
import { randomUUID } from 'crypto'

export const categoryService = {
  async getCategories(options: { includeInactive?: boolean; onlyMain?: boolean } = {}): Promise<Category[]> {
    const { includeInactive = true, onlyMain = false } = options

    try {
      const whereClause: Record<string, unknown> = {}
      if (!includeInactive) {
        whereClause.isActive = true
      }
      if (onlyMain) {
        whereClause.parentId = null
      }

      const categories = await prisma.category.findMany({
        where: whereClause,
        include: {
          children: {
            where: includeInactive ? undefined : { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })

      if (categories && categories.length > 0) {
        return categories.map((c: { createdAt: { toISOString: () => any }; updatedAt: { toISOString: () => any }; children: { createdAt: { toISOString: () => any }; updatedAt: { toISOString: () => any } }[] }) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          children: c.children.map((ch: { createdAt: { toISOString: () => any }; updatedAt: { toISOString: () => any } }) => ({
            ...ch,
            createdAt: ch.createdAt.toISOString(),
            updatedAt: ch.updatedAt.toISOString(),
          })),
        }))
      }
    } catch {
      // Fallback
    }

    // Fallback store
    let list = dbFallback.categories
    if (!includeInactive) {
      list = list.filter((c) => c.isActive)
    }

    const mainCats = list.filter((c) => !c.parentId)
    const subCats = list.filter((c) => !!c.parentId)

    if (onlyMain) {
      return mainCats.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    return mainCats
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((main) => {
        const children = subCats
          .filter((sub) => sub.parentId === main.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)

        const prodCount = dbFallback.products.filter(
          (p) => p.categoryId === main.id || p.subcategoryId === main.id
        ).length

        return {
          ...main,
          children,
          _count: {
            products: prodCount,
            children: children.length,
          },
        }
      })
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const cat = await prisma.category.findUnique({
        where: { slug },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          parent: true,
          _count: {
            select: { products: true },
          },
        },
      })
      if (cat) {
        return {
          ...cat,
          createdAt: cat.createdAt.toISOString(),
          updatedAt: cat.updatedAt.toISOString(),
          parent: cat.parent
            ? {
                ...cat.parent,
                createdAt: cat.parent.createdAt.toISOString(),
                updatedAt: cat.parent.updatedAt.toISOString(),
              }
            : null,
          children: cat.children.map((ch: { createdAt: { toISOString: () => any }; updatedAt: { toISOString: () => any } }) => ({
            ...ch,
            createdAt: ch.createdAt.toISOString(),
            updatedAt: ch.updatedAt.toISOString(),
          })),
        }
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase())
    if (!found) return null

    const children = dbFallback.categories.filter((c) => c.parentId === found.id && c.isActive)
    const parent = found.parentId ? dbFallback.categories.find((c) => c.id === found.parentId) : null

    return {
      ...found,
      children,
      parent: parent || null,
      _count: {
        products: dbFallback.products.filter(
          (p) => p.categoryId === found.id || p.subcategoryId === found.id
        ).length,
      },
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const cat = await prisma.category.findUnique({
        where: { id },
        include: {
          children: true,
          parent: true,
          _count: {
            select: { products: true, children: true },
          },
        },
      })
      if (cat) {
        return {
          ...cat,
          createdAt: cat.createdAt.toISOString(),
          updatedAt: cat.updatedAt.toISOString(),
          parent: cat.parent
            ? {
                ...cat.parent,
                createdAt: cat.parent.createdAt.toISOString(),
                updatedAt: cat.parent.updatedAt.toISOString(),
              }
            : null,
          children: cat.children.map((ch: { createdAt: { toISOString: () => any }; updatedAt: { toISOString: () => any } }) => ({
            ...ch,
            createdAt: ch.createdAt.toISOString(),
            updatedAt: ch.updatedAt.toISOString(),
          })),
        }
      }
    } catch {
      // Fallback
    }

    const found = dbFallback.categories.find((c) => c.id === id)
    if (!found) return null

    const children = dbFallback.categories.filter((c) => c.parentId === found.id)
    const parent = found.parentId ? dbFallback.categories.find((c) => c.id === found.parentId) : null

    return {
      ...found,
      children,
      parent: parent || null,
      _count: {
        products: dbFallback.products.filter(
          (p) => p.categoryId === found.id || p.subcategoryId === found.id
        ).length,
        children: children.length,
      },
    }
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const slug = input.slug.toLowerCase().trim()

    // 1. Check duplicate slug
    const existingBySlug = await this.getCategoryBySlug(slug)
    if (existingBySlug) {
      throw new Error(`A category with slug "${slug}" already exists.`)
    }

    // 2. If parentId provided, verify parent
    if (input.parentId) {
      const parent = await this.getCategoryById(input.parentId)
      if (!parent) {
        throw new Error(`Parent category not found.`)
      }
    }

    try {
      const created = await prisma.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description || null,
          imageUrl: input.imageUrl || null,
          image: input.imageUrl || null,
          parentId: input.parentId || null,
          sortOrder: input.sortOrder || 0,
          isActive: input.isActive ?? true,
        },
      })

      return {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      }
    } catch (err: unknown) {
      // If prisma error is duplicate slug or other DB error, rethrow or fallback
      if (err instanceof Error && err.message.includes('slug')) {
        throw err
      }
    }

    // Fallback store create
    const newCat = {
      id: `cat-${randomUUID()}`,
      name: input.name,
      slug,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      image: input.imageUrl || null,
      parentId: input.parentId || null,
      sortOrder: input.sortOrder || 0,
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dbFallback.categories.push(newCat)
    return newCat
  },

  async updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const existing = await this.getCategoryById(id)
    if (!existing) {
      throw new Error(`Category with ID "${id}" not found.`)
    }

    if (input.slug && input.slug.toLowerCase() !== existing.slug.toLowerCase()) {
      const dup = await this.getCategoryBySlug(input.slug.toLowerCase())
      if (dup && dup.id !== id) {
        throw new Error(`Slug "${input.slug}" is already taken by another category.`)
      }
    }

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug?.toLowerCase(),
          description: input.description !== undefined ? input.description : undefined,
          imageUrl: input.imageUrl !== undefined ? input.imageUrl : undefined,
          image: input.imageUrl !== undefined ? input.imageUrl : undefined,
          parentId: input.parentId !== undefined ? input.parentId || null : undefined,
          sortOrder: input.sortOrder !== undefined ? input.sortOrder : undefined,
          isActive: input.isActive !== undefined ? input.isActive : undefined,
        },
      })

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    } catch {
      // Fallback update
    }

    const idx = dbFallback.categories.findIndex((c) => c.id === id)
    if (idx !== -1) {
      const current = dbFallback.categories[idx]
      const updated = {
        ...current,
        name: input.name ?? current.name,
        slug: input.slug ? input.slug.toLowerCase() : current.slug,
        description: input.description !== undefined ? input.description : current.description,
        imageUrl: input.imageUrl !== undefined ? input.imageUrl : current.imageUrl,
        image: input.imageUrl !== undefined ? input.imageUrl : current.image,
        parentId: input.parentId !== undefined ? input.parentId || null : current.parentId,
        sortOrder: input.sortOrder ?? current.sortOrder,
        isActive: input.isActive ?? current.isActive,
        updatedAt: new Date().toISOString(),
      }
      dbFallback.categories[idx] = updated
      return updated
    }

    throw new Error('Failed to update category')
  },

  async toggleCategoryStatus(id: string, isActive: boolean): Promise<Category> {
    return this.updateCategory(id, { isActive })
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getCategoryById(id)
    if (!existing) {
      throw new Error(`Category not found.`)
    }

    // Safety checks:
    // 1. Check if category has subcategories
    if (existing.children && existing.children.length > 0) {
      throw new Error(
        `Cannot delete category "${existing.name}". It has ${existing.children.length} active subcategories. Please reassign or delete subcategories first.`
      )
    }

    // 2. Check if category has products
    const productCount = existing._count?.products || 0
    if (productCount > 0) {
      throw new Error(
        `Cannot delete category "${existing.name}". It is currently referenced by ${productCount} products. Please reassign products first.`
      )
    }

    try {
      await prisma.category.delete({
        where: { id },
      })
      return { success: true, message: `Category "${existing.name}" deleted successfully.` }
    } catch {
      // Fallback store
    }

    const idx = dbFallback.categories.findIndex((c) => c.id === id)
    if (idx !== -1) {
      dbFallback.categories.splice(idx, 1)
      return { success: true, message: `Category "${existing.name}" deleted successfully.` }
    }

    return { success: true, message: 'Deleted' }
  },
}
