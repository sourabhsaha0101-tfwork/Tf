import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, unauthorizedResponse } from '@/lib/auth-guard'
import { storageService } from '@/lib/storage'
import path from 'path'

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.ai': 'application/illustrator',
  '.cad': 'application/acad',
  '.dxf': 'application/dxf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.authorized) return unauthorizedResponse(auth)

  const searchParams = request.nextUrl.searchParams
  const relativePath = searchParams.get('path')

  if (!relativePath) {
    return NextResponse.json({ success: false, error: 'Document path is required' }, { status: 400 })
  }

  // Prevent directory traversal
  const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '')

  try {
    const fileBuffer = await storageService.readFile(cleanPath, true)
    const ext = path.extname(cleanPath).toLowerCase()
    const contentType = MIME_MAP[ext] || 'application/octet-stream'
    const fileName = path.basename(cleanPath)

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Document not found or access denied' }, { status: 404 })
  }
}
