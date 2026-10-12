import { NextRequest, NextResponse } from 'next/server'
import { requireEmployeeOrAdmin, requireAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { employeeOpsService } from '@/lib/services/employee-ops.service'

export async function GET(request: NextRequest) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const searchParams = request.nextUrl.searchParams
  const assignedToId = searchParams.get('assignedToId') || undefined
  const status = (searchParams.get('status') as any) || undefined

  // If role is EMPLOYEE, restrict view to their own assigned tasks unless explicitly specified
  const effectiveAssignedToId =
    auth.user.role === 'EMPLOYEE' ? auth.user.id : assignedToId

  const tasks = await employeeOpsService.getTasks({
    assignedToId: effectiveAssignedToId,
    status,
  })

  return NextResponse.json({ success: true, data: tasks, tasks })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    if (!body.title || !body.assignedToId) {
      return NextResponse.json(
        { success: false, error: 'Title and assignedToId are required' },
        { status: 400 }
      )
    }

    const task = await employeeOpsService.createTask({
      title: body.title,
      description: body.description,
      assignedToId: body.assignedToId,
      createdById: auth.user.id,
      priority: body.priority,
      dueDate: body.dueDate,
      relatedEntityType: body.relatedEntityType,
      relatedEntityId: body.relatedEntityId,
    })

    return NextResponse.json({ success: true, data: task, task }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create task'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
