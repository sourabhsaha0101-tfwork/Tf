import { NextRequest, NextResponse } from 'next/server'
import { requireEmployeeOrAdmin, unauthorizedResponse } from '@/lib/auth-guard'
import { employeeOpsService } from '@/lib/services/employee-ops.service'

export async function GET(request: NextRequest) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date') || undefined
  const employeeId = searchParams.get('employeeId') || undefined

  const effectiveEmployeeId =
    auth.user.role === 'EMPLOYEE' ? auth.user.id : employeeId

  const records = await employeeOpsService.getAttendanceRecords({
    employeeId: effectiveEmployeeId,
    date,
  })

  return NextResponse.json({ success: true, data: records, records })
}

export async function POST(request: NextRequest) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const body = await request.json().catch(() => ({}))
    const employeeId = auth.user.role === 'EMPLOYEE' ? auth.user.id : (body.employeeId || auth.user.id)

    const record = await employeeOpsService.recordAttendance({
      employeeId,
      date: body.date,
      status: body.status,
      notes: body.notes,
    })

    return NextResponse.json({ success: true, data: record, record })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to record attendance'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
