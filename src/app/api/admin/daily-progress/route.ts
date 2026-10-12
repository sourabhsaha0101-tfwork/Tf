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

  const reports = await employeeOpsService.getDailyProgressReports({
    employeeId: effectiveEmployeeId,
    date,
  })

  return NextResponse.json({ success: true, data: reports, reports })
}

export async function POST(request: NextRequest) {
  const auth = await requireEmployeeOrAdmin(request)
  if (!auth.authorized || !auth.user) return unauthorizedResponse(auth)

  try {
    const body = await request.json()
    if (!body.summaryText) {
      return NextResponse.json({ success: false, error: 'Summary text is required' }, { status: 400 })
    }

    const employeeId = auth.user.role === 'EMPLOYEE' ? auth.user.id : (body.employeeId || auth.user.id)

    const summary = await employeeOpsService.submitDailyProgress({
      employeeId,
      date: body.date,
      summaryText: body.summaryText,
      tasksCompletedCount: body.tasksCompletedCount,
      ordersWorkedOn: body.ordersWorkedOn,
      hoursLogged: body.hoursLogged,
      blockers: body.blockers,
    })

    return NextResponse.json({ success: true, data: summary, summary }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit daily progress'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
