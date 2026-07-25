import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import type { Task, TaskFilterParams } from '../lib/api'
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  Trash2,
  Pencil,
  Copy,
  X,
  CheckCircle2,
  Circle,
  CircleDot,
  Calendar,
} from 'lucide-react'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastState {
  message: string
  type: 'success' | 'error'
  action?: ToastAction
}

interface TaskStatistics {
  total: number
  completed: number
  pending: number
  completionRate: number
}

function AnimatedNumber({ value }: { value: number | string }) {
  return (
    <span className="inline-block relative overflow-hidden h-[1.25em] align-bottom">
      <span
        key={String(value)}
        className="inline-block font-bold tracking-tight"
        style={{ animation: 'number-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        {value}
      </span>
    </span>
  )
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Task Creation Form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState('LOW')
  const [newDueDate, setNewDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Edit Task Form state
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
  const [editDueDate, setEditDueDate] = useState('')
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete Task Modal and Pending Undo state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ task: Task } | null>(null)

  // Quick toggling loading states (stores task ids currently transitioning)
  const [transitioningIds, setTransitioningIds] = useState<number[]>([])

  // Toast state and refs
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDeleteTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Statistics state fetched from backend API
  const [stats, setStats] = useState<TaskStatistics>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  })

  // Trigger Toast Notification
  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
    action?: ToastAction,
    duration: number = 3000
  ) => {
    setToast({ message, type, action })
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, duration)
  }

  // Clear toast on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current)
    }
  }, [])

  // Handle task deletion with 5s Undo timer
  const handleDeleteTask = () => {
    if (!taskToDelete) return
    const targetTask = taskToDelete
    setTaskToDelete(null)

    // Optimistically remove task from UI state immediately
    setTasks((prev) => prev.filter((t) => t.id !== targetTask.id))
    setPendingDelete({ task: targetTask })

    if (pendingDeleteTimerRef.current) {
      clearTimeout(pendingDeleteTimerRef.current)
    }

    // Schedule actual API deletion after 5 seconds
    const timer = setTimeout(async () => {
      setPendingDelete(null)
      pendingDeleteTimerRef.current = null
      try {
        await api.deleteTask(targetTask.id)
        showToast(`Task #${targetTask.id} deleted successfully`)
        fetchStatistics()
      } catch (err: any) {
        // If API delete fails, restore task and inform user
        setTasks((prev) => [...prev, targetTask])
        showToast(err.message || 'Failed to delete task', 'error')
      }
    }, 5000)

    pendingDeleteTimerRef.current = timer
  }

  // Undo pending task deletion
  const handleUndoDelete = () => {
    if (!pendingDelete) return
    const restoredTask = pendingDelete.task
    if (pendingDeleteTimerRef.current) {
      clearTimeout(pendingDeleteTimerRef.current)
      pendingDeleteTimerRef.current = null
    }
    setPendingDelete(null)
    setTasks((prev) => [...prev, restoredTask])
    showToast(`Task #${restoredTask.id} restored`)
  }

  // Fetch tasks and statistics helper
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: TaskFilterParams = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchQuery || undefined,
        sort: sortBy,
      }
      const [tasksData, statsData] = await Promise.all([api.getTasks(params), api.getStatistics()])
      setTasks(tasksData || [])
      if (statsData) {
        setStats(statsData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter, searchQuery, sortBy])

  // Reload when filters modify
  useEffect(() => {
    const delayDebounce = setTimeout(
      () => {
        fetchTasks()
      },
      searchQuery ? 300 : 0
    ) // Debounce search changes

    return () => clearTimeout(delayDebounce)
  }, [fetchTasks, searchQuery])

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K or N to open Create Task modal; Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement

      if (e.key === 'Escape') {
        setShowCreateForm(false)
        setTaskToEdit(null)
        setTaskToDelete(null)
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCreateForm((prev) => !prev)
      } else if (!isInputFocused && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setShowCreateForm(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle task creation submit
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      setFormError('Title is required')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const created = await api.createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        priority: newPriority,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
      })
      setNewTitle('')
      setNewDescription('')
      setNewPriority('LOW')
      setNewDueDate('')
      setShowCreateForm(false)
      showToast(`Task #${created.id} created successfully`)
      fetchTasks()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  // Open Edit Modal and prefill data
  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditPriority(task.priority)
    setEditStatus(task.status)
    setEditDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '')
    setEditError(null)
  }

  // Fetch statistics helper
  const fetchStatistics = useCallback(async () => {
    try {
      const statsData = await api.getStatistics()
      if (statsData) setStats(statsData)
    } catch {
      // silent failure for stats refresh
    }
  }, [])

  // Handle task editing submit
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskToEdit) return
    if (!editTitle.trim()) {
      setEditError('Title is required')
      return
    }
    setUpdating(true)
    setEditError(null)
    try {
      const updated = await api.updateTask(taskToEdit.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      })
      const statusChanged = taskToEdit.status !== editStatus
      setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? updated : t)))
      setTaskToEdit(null)
      showToast(`Task #${updated.id} updated successfully`)
      if (statusChanged) {
        fetchStatistics()
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update task')
    } finally {
      setUpdating(false)
    }
  }

  // Quick cycle status: TODO -> IN_PROGRESS -> DONE -> TODO
  const handleToggleComplete = async (task: Task) => {
    let newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'
    if (task.status === 'TODO') {
      newStatus = 'IN_PROGRESS'
    } else if (task.status === 'IN_PROGRESS') {
      newStatus = 'DONE'
    } else {
      newStatus = 'TODO'
    }

    // Add to transitioning list
    setTransitioningIds((prev) => [...prev, task.id])

    try {
      const updated = await api.updateTask(task.id, { status: newStatus })

      let toastMessage = `Task #${task.id} moved to In Progress`
      if (newStatus === 'DONE') {
        toastMessage = `Task #${task.id} completed`
      } else if (newStatus === 'TODO') {
        toastMessage = `Task #${task.id} reopened`
      }
      showToast(toastMessage)

      // Update local state directly with updated task
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      fetchStatistics()
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setTransitioningIds((prev) => prev.filter((id) => id !== task.id))
    }
  }

  // Handle task duplication by prefilling Create Task modal
  const handleDuplicateTask = (task: Task) => {
    setNewTitle(`${task.title} (Copy)`)
    setNewDescription(task.description || '')
    setNewPriority(task.priority)
    setNewDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '')
    setFormError(null)
    setShowCreateForm(true)
  }

  // Map variables to state fetched from backend API
  const {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    completionRate,
  } = stats

  // Priority color tags helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  }

  // Status label tags helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  // Format due date helper
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <style>{`
        @keyframes countdown-ring {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 56.54; }
        }
        @keyframes number-slide-up {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        @keyframes glow-overdue {
          0%, 100% {
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.35);
          }
          50% {
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.35);
            border-color: rgba(239, 68, 68, 0.65);
          }
        }
        @keyframes glow-due-soon {
          0%, 100% {
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.35);
          }
          50% {
            box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
            border-color: rgba(245, 158, 11, 0.65);
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all ${
              toast.type === 'error'
                ? 'bg-red-950/90 text-red-100 border-red-800/60 shadow-red-950/20'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-800/60 shadow-emerald-950/20'
            }`}
          >
            <div
              className={`p-1 rounded-full shrink-0 ${
                toast.type === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
            <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick()
                }}
                className="ml-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => setToast(null)}
              className="ml-1 p-0.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Pending Undo Deletion Bar (Bottom Center) */}
      {pendingDelete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-red-500/30 bg-card/95 backdrop-blur-md text-foreground">
            {/* SVG Countdown Ring */}
            <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  className="stroke-red-500/20"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  className="stroke-red-500"
                  strokeWidth="2.5"
                  strokeDasharray="56.54"
                  strokeDashoffset="0"
                  fill="none"
                  style={{ animation: 'countdown-ring 5s linear forwards' }}
                />
              </svg>
              <Trash2 className="h-3 w-3 text-red-500 absolute" />
            </div>

            <span className="text-sm font-semibold tracking-tight">
              Deleting "{pendingDelete.task.title}"...
            </span>

            <button
              onClick={handleUndoDelete}
              className="ml-2 px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">Delete Task?</h3>
              <button
                onClick={() => setTaskToDelete(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete the task{' '}
              <strong className="text-foreground font-medium">"{taskToDelete.title}"</strong>? This
              action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleUpdateTask}
            className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">Edit Task</h3>
              <button
                type="button"
                onClick={() => setTaskToEdit(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                disabled={updating}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-title" className="text-xs font-semibold text-muted-foreground">
                Title *
              </label>
              <input
                type="text"
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Design Landing Page"
                className="px-3.5 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={updating}
                maxLength={150}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-desc" className="text-xs font-semibold text-muted-foreground">
                Description
              </label>
              <textarea
                id="edit-desc"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add optional task details..."
                className="px-3.5 py-2 border border-border rounded-lg bg-transparent text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={updating}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-priority"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={updating}
                >
                  <option value="LOW" className="bg-popover text-popover-foreground">
                    Low
                  </option>
                  <option value="MEDIUM" className="bg-popover text-popover-foreground">
                    Medium
                  </option>
                  <option value="HIGH" className="bg-popover text-popover-foreground">
                    High
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-status"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  disabled={updating}
                >
                  <option value="TODO" className="bg-popover text-popover-foreground">
                    To Do
                  </option>
                  <option value="IN_PROGRESS" className="bg-popover text-popover-foreground">
                    In Progress
                  </option>
                  <option value="DONE" className="bg-popover text-popover-foreground">
                    Done
                  </option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-3">
              <label
                htmlFor="edit-due-date"
                className="text-xs font-semibold text-muted-foreground"
              >
                Due Date
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  id="edit-due-date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={updating}
                />
                {editDueDate && (
                  <button
                    type="button"
                    onClick={() => setEditDueDate('')}
                    className="px-3 py-2 text-xs border border-border hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => setTaskToEdit(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors cursor-pointer"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">Manage your tasks and track metrics in real time.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 self-start bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-xs hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-primary-foreground/20 text-primary-foreground rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Tasks', value: totalTasks },
          { label: 'Completed', value: completedTasks },
          { label: 'Pending', value: pendingTasks },
          { label: 'Completion Rate', value: `${completionRate}%` },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md"
          >
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2 tracking-tight">
              <AnimatedNumber value={stat.value} />
            </p>
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider">Overall Progress</span>
          <span className="text-foreground font-bold">
            <AnimatedNumber value={`${completionRate}%`} /> Completed
          </span>
        </div>
        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Create New Task
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormError(null)
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Design Landing Page"
                className="px-3.5 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={submitting}
                maxLength={150}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="desc" className="text-xs font-semibold text-muted-foreground">
                Description
              </label>
              <textarea
                id="desc"
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add optional task details..."
                className="px-3.5 py-2 border border-border rounded-lg bg-transparent text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={submitting}
                maxLength={1000}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-xs font-semibold text-muted-foreground">
                Priority
              </label>
              <select
                id="priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                disabled={submitting}
              >
                <option value="LOW" className="bg-popover text-popover-foreground">
                  Low
                </option>
                <option value="MEDIUM" className="bg-popover text-popover-foreground">
                  Medium
                </option>
                <option value="HIGH" className="bg-popover text-popover-foreground">
                  High
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label
                htmlFor="create-due-date"
                className="text-xs font-semibold text-muted-foreground"
              >
                Due Date
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  id="create-due-date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  disabled={submitting}
                />
                {newDueDate && (
                  <button
                    type="button"
                    onClick={() => setNewDueDate('')}
                    className="px-3 py-2 text-xs border border-border hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormError(null)
                }}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors cursor-pointer"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 bg-card focus-within:ring-1 focus-within:ring-primary">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 border-0 bg-transparent text-sm text-foreground focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-popover text-popover-foreground">
                All Statuses ({tasks.length})
              </option>
              <option value="TODO" className="bg-popover text-popover-foreground">
                To Do ({tasks.filter((t) => t.status === 'TODO').length})
              </option>
              <option value="IN_PROGRESS" className="bg-popover text-popover-foreground">
                In Progress ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
              </option>
              <option value="DONE" className="bg-popover text-popover-foreground">
                Done ({tasks.filter((t) => t.status === 'DONE').length})
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 bg-card focus-within:ring-1 focus-within:ring-primary">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 border-0 bg-transparent text-sm text-foreground focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-popover text-popover-foreground">
                All Priorities ({tasks.length})
              </option>
              <option value="LOW" className="bg-popover text-popover-foreground">
                Low Priority ({tasks.filter((t) => t.priority === 'LOW').length})
              </option>
              <option value="MEDIUM" className="bg-popover text-popover-foreground">
                Medium Priority ({tasks.filter((t) => t.priority === 'MEDIUM').length})
              </option>
              <option value="HIGH" className="bg-popover text-popover-foreground">
                High Priority ({tasks.filter((t) => t.priority === 'HIGH').length})
              </option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="newest" className="bg-popover text-popover-foreground">
              Newest First
            </option>
            <option value="oldest" className="bg-popover text-popover-foreground">
              Oldest First
            </option>
            <option value="title_asc" className="bg-popover text-popover-foreground">
              Title A-Z
            </option>
            <option value="title_desc" className="bg-popover text-popover-foreground">
              Title Z-A
            </option>
            <option value="priority" className="bg-popover text-popover-foreground">
              Priority Rank
            </option>
            <option value="due_date_asc" className="bg-popover text-popover-foreground">
              Due Date: Soonest
            </option>
            <option value="due_date_desc" className="bg-popover text-popover-foreground">
              Due Date: Latest
            </option>
          </select>

          <button
            onClick={fetchTasks}
            className="p-2 border border-border rounded-lg bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
            title="Refresh tasks"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(searchQuery || statusFilter || priorityFilter) && (
        <div className="flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-200">
          <span className="text-muted-foreground font-medium">Active Filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-2.5 py-1 rounded-full font-medium border border-border">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-primary p-0.5 rounded-full hover:bg-accent transition-colors cursor-pointer"
                title="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-2.5 py-1 rounded-full font-medium border border-border">
              <span>Status: {statusFilter.replace('_', ' ')}</span>
              <button
                onClick={() => setStatusFilter('')}
                className="hover:text-primary p-0.5 rounded-full hover:bg-accent transition-colors cursor-pointer"
                title="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {priorityFilter && (
            <span className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-2.5 py-1 rounded-full font-medium border border-border">
              <span>Priority: {priorityFilter}</span>
              <button
                onClick={() => setPriorityFilter('')}
                className="hover:text-primary p-0.5 rounded-full hover:bg-accent transition-colors cursor-pointer"
                title="Remove priority filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('')
              setPriorityFilter('')
            }}
            className="text-primary hover:underline font-semibold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Tasks List Area */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-xl self-center flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="font-semibold text-red-600">Failed to load tasks</p>
          <p className="text-sm text-red-600/80">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-3 bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground mt-3">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground mb-4">
            <Filter className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground font-semibold text-lg">No tasks found</p>
          <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">
            {searchQuery || statusFilter || priorityFilter
              ? 'No tasks match your current filter parameters. Try expanding your search queries.'
              : 'Start organizing your flow by adding new task items.'}
          </p>
          {!searchQuery && !statusFilter && !priorityFilter && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
            >
              Get Started
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const isTransitioning = transitioningIds.includes(task.id)
            const isDone = task.status === 'DONE'
            const isInProgress = task.status === 'IN_PROGRESS'

            const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date()
            const isDueSoon =
              !isDone &&
              !isOverdue &&
              task.dueDate &&
              (() => {
                const diff = new Date(task.dueDate).getTime() - new Date().getTime()
                return diff > 0 && diff <= 24 * 60 * 60 * 1000
              })()

            return (
              <div
                key={task.id}
                className={`group rounded-xl border p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
                  isDone
                    ? 'bg-card/50 border-border/60'
                    : isOverdue
                      ? 'bg-card border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.12)] animate-[glow-overdue_2s_infinite]'
                      : isDueSoon
                        ? 'bg-card border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)] animate-[glow-due-soon_2s_infinite]'
                        : 'bg-card border-border'
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Badges row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {isOverdue && (
                      <span className="text-[10px] font-bold border border-red-500/30 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                        ⚠️ Overdue
                      </span>
                    )}
                    {isDueSoon && (
                      <span className="text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                        ⏱️ Due Soon
                      </span>
                    )}
                  </div>

                  {/* Title & Actions row */}
                  <div className="flex justify-between items-start gap-2 mt-1">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(task)}
                        disabled={isTransitioning}
                        className={`mt-1 hover:opacity-150 transition-colors shrink-0 cursor-pointer ${
                          isDone
                            ? 'text-emerald-500'
                            : isInProgress
                              ? 'text-blue-500'
                              : 'text-muted-foreground/60'
                        }`}
                        title={
                          isDone
                            ? 'Reopen task'
                            : isInProgress
                              ? 'Complete task'
                              : 'Move to In Progress'
                        }
                      >
                        {isTransitioning ? (
                          <div className="animate-spin rounded-full h-4.5 w-4.5 border border-primary border-t-transparent"></div>
                        ) : isDone ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : isInProgress ? (
                          <CircleDot className="h-4.5 w-4.5" />
                        ) : (
                          <Circle className="h-4.5 w-4.5" />
                        )}
                      </button>

                      <h4
                        className={`font-semibold text-lg leading-snug tracking-tight mt-0.5 break-words transition-all duration-200 ${
                          isDone ? 'line-through text-muted-foreground/75' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={() => handleDuplicateTask(task)}
                        className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-accent transition-colors cursor-pointer"
                        title="Duplicate task"
                        disabled={isTransitioning}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-accent transition-colors cursor-pointer"
                        title="Edit task"
                        disabled={isTransitioning}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="text-muted-foreground hover:text-red-500 p-1 rounded hover:bg-accent transition-colors cursor-pointer"
                        title="Delete task"
                        disabled={isTransitioning}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p
                      className={`text-sm leading-relaxed line-clamp-3 mt-1 transition-all ${
                        isDone ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Due Date Indicator */}
                  {task.dueDate && (
                    <div
                      className={`flex items-center gap-1.5 text-xs mt-3.5 ${
                        isDone
                          ? 'text-muted-foreground/40 line-through'
                          : isOverdue
                            ? 'text-red-500 font-semibold'
                            : isDueSoon
                              ? 'text-amber-500 font-semibold'
                              : 'text-muted-foreground/80'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Due: {formatDueDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer info */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground/80">
                  <span>
                    Created{' '}
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span>ID: #{task.id}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
