import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export interface UploadOptions {
  isPrivate: boolean
  category: 'tech-packs' | 'inspections' | 'shipping' | 'logos' | 'products' | 'categories' | 'general'
  mimeType?: string
  originalFileName?: string
}

export interface UploadResult {
  fileName: string
  storagePath: string
  url: string // For private files, this is the authenticated download API route
  isPrivate: boolean
  fileSize: number
  fileType: string
}

export interface StorageDriver {
  upload(buffer: Buffer, originalName: string, options: UploadOptions): Promise<UploadResult>
  readFile(storagePath: string, isPrivate: boolean): Promise<Buffer>
  deleteFile(storagePath: string, isPrivate: boolean): Promise<void>
  getDownloadUrl(storagePath: string, isPrivate: boolean): string
}

/**
 * Local Storage Driver:
 * - Public files: stored in <cwd>/public/uploads/{category}/ (served statically by Next.js)
 * - Private files: stored in <cwd>/storage/private/{category}/ (strictly outside public/, served via authenticated download API)
 */
class LocalStorageDriver implements StorageDriver {
  private publicRootDir = path.join(process.cwd(), 'public', 'uploads')
  private privateRootDir = path.join(process.cwd(), 'storage', 'private')

  async upload(buffer: Buffer, originalName: string, options: UploadOptions): Promise<UploadResult> {
    const ext = path.extname(originalName).toLowerCase()
    const safeBase = originalName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
    const uniqueFileName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`

    const baseDir = options.isPrivate ? this.privateRootDir : this.publicRootDir
    const targetDir = path.join(baseDir, options.category)
    await mkdir(targetDir, { recursive: true })

    const absolutePath = path.join(targetDir, uniqueFileName)
    await writeFile(absolutePath, buffer)

    const relativeStoragePath = path.join(options.category, uniqueFileName).replace(/\\/g, '/')

    // Private files use the authenticated download API route. Public files use /uploads/...
    const downloadUrl = options.isPrivate
      ? `/api/documents/download?path=${encodeURIComponent(relativeStoragePath)}`
      : `/uploads/${options.category}/${uniqueFileName}`

    return {
      fileName: originalName,
      storagePath: relativeStoragePath,
      url: downloadUrl,
      isPrivate: options.isPrivate,
      fileSize: buffer.length,
      fileType: options.mimeType || ext.replace('.', '') || 'bin',
    }
  }

  async readFile(storagePath: string, isPrivate: boolean): Promise<Buffer> {
    const baseDir = isPrivate ? this.privateRootDir : this.publicRootDir
    // Prevent directory traversal attacks
    const safePath = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, '')
    const absolutePath = path.join(baseDir, safePath)
    return readFile(absolutePath)
  }

  async deleteFile(storagePath: string, isPrivate: boolean): Promise<void> {
    const baseDir = isPrivate ? this.privateRootDir : this.publicRootDir
    const safePath = path.normalize(storagePath).replace(/^(\.\.[\/\\])+/, '')
    const absolutePath = path.join(baseDir, safePath)
    try {
      await unlink(absolutePath)
    } catch {
      // Ignore if file doesn't exist
    }
  }

  getDownloadUrl(storagePath: string, isPrivate: boolean): string {
    const normalized = storagePath.replace(/\\/g, '/')
    if (isPrivate) {
      return `/api/documents/download?path=${encodeURIComponent(normalized)}`
    }
    return `/uploads/${normalized}`
  }
}

/**
 * Cloud Storage Drivers Configuration Preparation (S3 / GCS / Supabase Storage)
 * Scaffolding prepared for zero-code-change cloud enablement when credentials are provided.
 */
export interface CloudStorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'supabase'
  s3?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
  gcs?: {
    bucket: string
    projectId: string
    clientEmail: string
    privateKey: string
  }
  supabase?: {
    bucket: string
    url: string
    serviceKey: string
  }
}

// Active singleton instance (defaults to LocalStorageDriver for 100% backward compatibility & offline dev)
export const storageService = new LocalStorageDriver()
