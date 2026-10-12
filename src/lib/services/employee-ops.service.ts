import { dbFallback } from '@/lib/db-fallback'
import {
  EmployeeTask,
  TaskStatus,
  TaskPriority,
  AttendanceRecord,
  AttendanceStatus,
  DailyProgressSummary,
  AuditLog,
  ProductivityReport,
  UserRole,
} from '@/types'
import { randomUUID } from 'crypto'

export interface CreateTaskInput {
  title: string
  description?: string | null
  assignedToId: string
  createdById: string
  priority?: TaskPriority
  dueDate?: string | null
  relatedEntityType?: 'MANUFACTURING_ORDER' | 'QUOTATION' | 'INSPECTION' | 'PRODUCT' | 'GENERAL'
  relatedEntityId?: string | null
}

export interface AttendanceInput {
  employeeId: string
  date?: string
  status?: AttendanceStatus
  notes?: string | null
}

export interface DailyProgressInput {
  employeeId: string
  date?: string
  summaryText: string
  tasksCompletedCount?: number
  ordersWorkedOn?: string[]
  hoursLogged?: number
  blockers?: string | null
}

export const employeeOpsService = {
  // ----------------------------------------------------
  // EMPLOYEE TASKS
  // ----------------------------------------------------
  async createTask(input: CreateTaskInput): Promise<EmployeeTask> {
    const assignedUser = dbFallback.users.find((u) => u.id === input.assignedToId)
    const creatorUser = dbFallback.users.find((u) => u.id === input.createdById)

    const newTask: EmployeeTask = {
      id: `tsk-${randomUUID()}`,
      title: input.title,
      description: input.description || null,
      assignedToId: input.assignedToId,
      assignedToName: assignedUser?.name || 'Assigned Employee',
      createdById: input.createdById,
      createdByName: creatorUser?.name || 'Administrator',
      status: 'PENDING',
      priority: input.priority || 'MEDIUM',
      dueDate: input.dueDate || null,
      relatedEntityType: input.relatedEntityType || 'GENERAL',
      relatedEntityId: input.relatedEntityId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dbFallback.tasks.unshift(newTask)

    await this.logAuditEvent({
      actorId: input.createdById,
      actorRole: 'ADMIN',
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: newTask.id,
      details: { title: newTask.title, assignedToId: newTask.assignedToId },
    })

    return newTask
  },

  async getTasks(filter?: { assignedToId?: string; status?: TaskStatus }): Promise<EmployeeTask[]> {
    let list = [...dbFallback.tasks]
    if (filter?.assignedToId) {
      list = list.filter((t) => t.assignedToId === filter.assignedToId)
    }
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status)
    }
    return list
  },

  async updateTaskStatus(taskId: string, status: TaskStatus, actorId: string, actorRole: UserRole): Promise<EmployeeTask> {
    const task = dbFallback.tasks.find((t) => t.id === taskId)
    if (!task) throw new Error(`Task "${taskId}" not found`)

    // Employees can only update status of tasks assigned to them unless they are an admin
    if (actorRole === 'EMPLOYEE' && task.assignedToId !== actorId) {
      throw new Error('Access denied: You can only update tasks assigned to your employee account.')
    }

    const prevStatus = task.status
    task.status = status
    task.updatedAt = new Date().toISOString()
    if (status === 'COMPLETED') {
      task.completedAt = new Date().toISOString()
    }

    await this.logAuditEvent({
      actorId,
      actorRole,
      action: 'TASK_STATUS_UPDATED',
      entityType: 'TASK',
      entityId: task.id,
      details: { prevStatus, newStatus: status },
    })

    return task
  },

  // ----------------------------------------------------
  // ATTENDANCE & PUNCH CLOCK
  // ----------------------------------------------------
  async recordAttendance(input: AttendanceInput): Promise<AttendanceRecord> {
    const date = input.date || new Date().toISOString().split('T')[0]
    const employee = dbFallback.users.find((u) => u.id === input.employeeId)

    const existing = dbFallback.attendance.find((a) => a.employeeId === input.employeeId && a.date === date)
    const nowIso = new Date().toISOString()

    if (existing) {
      // If already checked in, clock out
      if (!existing.checkOutTime) {
        existing.checkOutTime = nowIso
      }
      if (input.status) existing.status = input.status
      if (input.notes) existing.notes = input.notes
      existing.updatedAt = nowIso
      return existing
    }

    const newRecord: AttendanceRecord = {
      id: `att-${randomUUID()}`,
      employeeId: input.employeeId,
      employeeName: employee?.name || 'Employee',
      date,
      checkInTime: nowIso,
      status: input.status || 'PRESENT',
      notes: input.notes || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    dbFallback.attendance.unshift(newRecord)

    await this.logAuditEvent({
      actorId: input.employeeId,
      actorRole: 'EMPLOYEE',
      action: 'ATTENDANCE_CHECK_IN',
      entityType: 'ATTENDANCE',
      entityId: newRecord.id,
      details: { date, status: newRecord.status },
    })

    return newRecord
  },

  async getAttendanceRecords(filter?: { employeeId?: string; date?: string }): Promise<AttendanceRecord[]> {
    let list = [...dbFallback.attendance]
    if (filter?.employeeId) {
      list = list.filter((a) => a.employeeId === filter.employeeId)
    }
    if (filter?.date) {
      list = list.filter((a) => a.date === filter.date)
    }
    return list
  },

  // ----------------------------------------------------
  // DAILY PROGRESS REPORTING
  // ----------------------------------------------------
  async submitDailyProgress(input: DailyProgressInput): Promise<DailyProgressSummary> {
    const date = input.date || new Date().toISOString().split('T')[0]
    const employee = dbFallback.users.find((u) => u.id === input.employeeId)

    const nowIso = new Date().toISOString()
    const summary: DailyProgressSummary = {
      id: `prog-${randomUUID()}`,
      employeeId: input.employeeId,
      employeeName: employee?.name || 'Employee',
      date,
      summaryText: input.summaryText,
      tasksCompletedCount: input.tasksCompletedCount || 0,
      ordersWorkedOn: input.ordersWorkedOn || [],
      hoursLogged: input.hoursLogged ?? 8,
      blockers: input.blockers || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    dbFallback.progressSummaries.unshift(summary)

    await this.logAuditEvent({
      actorId: input.employeeId,
      actorRole: 'EMPLOYEE',
      action: 'DAILY_PROGRESS_SUBMITTED',
      entityType: 'PROGRESS_SUMMARY',
      entityId: summary.id,
      details: { date, hoursLogged: summary.hoursLogged, tasksCompleted: summary.tasksCompletedCount },
    })

    return summary
  },

  async getDailyProgressReports(filter?: { employeeId?: string; date?: string }): Promise<DailyProgressSummary[]> {
    let list = [...dbFallback.progressSummaries]
    if (filter?.employeeId) {
      list = list.filter((p) => p.employeeId === filter.employeeId)
    }
    if (filter?.date) {
      list = list.filter((p) => p.date === filter.date)
    }
    return list
  },

  // ----------------------------------------------------
  // AUDIT LOGGING
  // ----------------------------------------------------
  async logAuditEvent(params: {
    actorId: string
    actorRole: UserRole
    action: string
    entityType: string
    entityId: string
    details?: Record<string, unknown> | null
    ipAddress?: string | null
    userAgent?: string | null
  }): Promise<AuditLog> {
    const actor = dbFallback.users.find((u) => u.id === params.actorId)

    const log: AuditLog = {
      id: `aud-${randomUUID()}`,
      actorId: params.actorId,
      actorName: actor?.name || 'System User',
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      timestamp: new Date().toISOString(),
    }

    dbFallback.auditLogs.unshift(log)
    return log
  },

  async getAuditLogs(filter?: { actorId?: string; entityType?: string; limit?: number }): Promise<AuditLog[]> {
    let list = [...dbFallback.auditLogs]
    if (filter?.actorId) {
      list = list.filter((l) => l.actorId === filter.actorId)
    }
    if (filter?.entityType) {
      list = list.filter((l) => l.entityType === filter.entityType)
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit)
    }
    return list
  },

  // ----------------------------------------------------
  // PRODUCTIVITY REPORT GENERATION (SUPER_ADMIN ONLY)
  // ----------------------------------------------------
  async getProductivityReport(period: string = 'Current Month'): Promise<ProductivityReport> {
    const employees = dbFallback.users.filter((u) => u.role === 'EMPLOYEE')

    const employeeSummaries = employees.map((emp) => {
      const assigned = dbFallback.tasks.filter((t) => t.assignedToId === emp.id)
      const completed = assigned.filter((t) => t.status === 'COMPLETED')
      const progressLogs = dbFallback.progressSummaries.filter((p) => p.employeeId === emp.id)
      const totalHours = progressLogs.reduce((sum, p) => sum + p.hoursLogged, 0)
      const attendanceDays = dbFallback.attendance.filter(
        (a) => a.employeeId === emp.id && a.status === 'PRESENT'
      ).length

      const completionRate =
        assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 100

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        tasksAssigned: assigned.length,
        tasksCompleted: completed.length,
        completionRate,
        hoursLogged: totalHours,
        attendanceDays,
      }
    })

    const totalTasksAssigned = employeeSummaries.reduce((sum, e) => sum + e.tasksAssigned, 0)
    const totalTasksCompleted = employeeSummaries.reduce((sum, e) => sum + e.tasksCompleted, 0)
    const overallCompletionRate =
      totalTasksAssigned > 0 ? Math.round((totalTasksCompleted / totalTasksAssigned) * 100) : 100
    const totalHoursLogged = employeeSummaries.reduce((sum, e) => sum + e.hoursLogged, 0)

    return {
      period,
      totalEmployees: employees.length,
      totalTasksAssigned,
      totalTasksCompleted,
      overallCompletionRate,
      totalHoursLogged,
      employeeSummaries,
    }
  },
}
