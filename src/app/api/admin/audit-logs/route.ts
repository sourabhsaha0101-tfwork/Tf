import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { employeeOpsService } from '@/lib/services/employee-ops.service'

export async function GET(request: NextRequest) {
  // Strictly restricted to SUPER_ADMIN / ADMIN
  const auth = await requireSuperAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const searchParams = request.nextUrl.searchParams
  const actorId = searchParams.get('actorId') || undefined
  const entityType = searchParams.get('entityType') || undefined
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  const logs = await employeeOpsService.getAuditLogs({
    actorId,
    entityType,
    limit,
  })

  return NextResponse.json({ success: true, data: logs, logs })
}
