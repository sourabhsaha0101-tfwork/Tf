import { NextRequest, NextResponse } from 'next/server'
import { requireEmployeeOrAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { employeeOpsService } from '@/lib/services/employee-ops.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const { id } = await params

  try {
    const body = await request.json()
    if (!body.status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })
    }

    const task = await employeeOpsService.updateTaskStatus(
      id,
      body.status,
      auth.user.id,
      auth.user.role
    )

    return NextResponse.json({ success: true, data: task, task })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update task'
    const status = msg.includes('Access denied') ? 403 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
