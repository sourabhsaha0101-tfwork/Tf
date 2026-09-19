import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    // Support single file named 'file' as well
    if (files.length === 0) {
      const singleFile = formData.get('file') as File | null
      if (singleFile) files.push(singleFile)
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const uploadedResults: Array<{
      url: string
      storagePath: string
      filename: string
      size: number
      mimeType: string
    }> = []

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type "${file.type}". Only JPEG, PNG, and WebP images are permitted.`,
          },
          { status: 400 }
        )
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the 5MB size limit.`,
          },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
      const targetPath = path.join(uploadDir, uniqueName)

      await writeFile(targetPath, buffer)

      const publicUrl = `/uploads/products/${uniqueName}`
      const storagePath = `products/${uniqueName}`

      uploadedResults.push({
        url: publicUrl,
        storagePath,
        filename: uniqueName,
        size: file.size,
        mimeType: file.type,
      })
    }

    return NextResponse.json({
      success: true,
      data: uploadedResults,
      // For convenience when uploading a single image:
      url: uploadedResults[0]?.url,
      storagePath: uploadedResults[0]?.storagePath,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Image upload failed'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
