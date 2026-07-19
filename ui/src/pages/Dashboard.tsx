import { useState, useEffect, useCallback } from 'react'
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
  X,
  CheckCircle2,
  Circle,
  CircleDot,
} from 'lucide-react'

interface ToastState {
  message: string
  type: 'success' | 'error'
}

interface TaskStatistics {
  total: number
  completed: number
  pending: number
  completionRate: number
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
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Edit Task Form state
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO')
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Deletion state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Quick toggling loading states (stores task ids currently transitioning)
  const [transitioningIds, setTransitioningIds] = useState<number[]>([])

  // Statistics state fetched from backend API
  const [stats, setStats] = useState<TaskStatistics>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  })

  // Toast state
  const [toast, setToast] = useState<ToastState | null>(null)

  // Trigger Toast Notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  // Clear toast after timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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
      await api.createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        priority: newPriority,
      })
      setNewTitle('')
      setNewDescription('')
      setNewPriority('LOW')
      setShowCreateForm(false)
      showToast('Task created successfully')
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
    setEditError(null)
  }

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
      await api.updateTask(taskToEdit.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        status: editStatus,
      })
      setTaskToEdit(null)
      showToast('Task updated successfully')
      fetchTasks()
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
      await api.updateTask(task.id, { status: newStatus })

      let toastMessage = 'Task moved to In Progress'
      if (newStatus === 'DONE') {
        toastMessage = 'Task completed'
      } else if (newStatus === 'TODO') {
        toastMessage = 'Task reopened'
      }
      showToast(toastMessage)

      // Update local state directly to be fast and responsive, then load in background
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setTransitioningIds((prev) => prev.filter((id) => id !== task.id))
      // Background reload to sync all metrics
      fetchTasks()
    }
  }

  // Handle task deletion execution
  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    setDeleting(true)
    try {
      await api.deleteTask(taskToDelete.id)
      setTaskToDelete(null)
      showToast('Task deleted successfully')
      fetchTasks()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error')
    } finally {
      setDeleting(false)
    }
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
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
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

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-bottom duration-300 ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-4.5 w-4.5" /> : null}
          <span className="text-sm font-medium">{toast.message}</span>
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
                disabled={deleting}
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
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Task'}
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
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
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
                  className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={updating}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your tasks and track metrics in real time.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 self-start bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-xs hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Task
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
            <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Task Creation Form Dropdown */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col gap-4 max-w-2xl transition-all"
        >
          <h3 className="font-semibold text-lg">Create New Task</h3>
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
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <label htmlFor="priority" className="text-xs font-semibold text-muted-foreground">
              Priority
            </label>
            <select
              id="priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={submitting}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end mt-2">
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
          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 bg-card">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 bg-card">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="priority">Priority Rank</option>
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

            return (
              <div
                key={task.id}
                className={`group rounded-xl border p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
                  isDone ? 'bg-card/50 border-border/60' : 'bg-card border-border'
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Badges row */}
                  <div className="flex justify-between items-center">
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

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
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
