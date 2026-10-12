import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { storageService } from '@/lib/storage'
import path from 'path'

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

    const uploadedResults: Array<{
      fileName: string
      url: string
      storagePath: string
      fileType: string
      fileSize: number
      isPrivate: boolean
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

      // Store in private storage — not exposed statically under Next.js public/
      const result = await storageService.upload(buffer, file.name, {
        isPrivate: true,
        category: 'tech-packs',
        mimeType: file.type || ext.slice(1),
      })

      uploadedResults.push({
        fileName: result.fileName,
        url: result.url,
        storagePath: result.storagePath,
        fileType: result.fileType,
        fileSize: result.fileSize,
        isPrivate: result.isPrivate,
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
