import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_EXTENSIONS = ['.pdf', '.ai', '.cad', '.dxf', '.jpg', '.jpeg', '.png']
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      const singleFile = formData.get('file') as File | null
      if (singleFile) files.push(singleFile)
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tech-packs')
    await mkdir(uploadDir, { recursive: true })

    const uploadedResults: Array<{
      fileName: string
      url: string
      storagePath: string
      fileType: string
      fileSize: number
    }> = []

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file extension "${ext}". Permitted formats: PDF, AI, CAD, DXF, JPG, PNG.`,
          },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds maximum allowed size of 25MB.`,
          },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Sanitize filename to prevent arbitrary execution
      const safeBase = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
      const uniqueName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`
      const targetPath = path.join(uploadDir, uniqueName)

      await writeFile(targetPath, buffer)

      uploadedResults.push({
        fileName: file.name,
        url: `/uploads/tech-packs/${uniqueName}`,
        storagePath: `tech-packs/${uniqueName}`,
        fileType: file.type || ext.slice(1),
        fileSize: file.size,
      })
    }

    return NextResponse.json({
      success: true,
      data: uploadedResults,
      file: uploadedResults[0],
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'File upload failed'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
