import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { Task, TaskFilterParams } from '../lib/api'
import { Plus, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react'

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

  // Fetch tasks helper
  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: TaskFilterParams = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchQuery || undefined,
        sort: sortBy
      }
      const data = await api.getTasks(params)
      setTasks(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  // Reload when filters modify
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks()
    }, searchQuery ? 300 : 0) // Debounce search changes

    return () => clearTimeout(delayDebounce)
  }, [statusFilter, priorityFilter, searchQuery, sortBy])

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
      fetchTasks()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate statistics metrics from tasks list (local sync for UI)
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'DONE').length
  const pendingTasks = tasks.filter(t => t.status !== 'DONE').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority color tags helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  // Status label tags helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
          { label: 'Completion Rate', value: `${completionRate}%` }
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-md">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Task Creation Form Dropdown */}
      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col gap-4 max-w-2xl transition-all">
          <h3 className="font-semibold text-lg">Create New Task</h3>
          {formError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">Title *</label>
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
            <label htmlFor="desc" className="text-xs font-semibold text-muted-foreground">Description</label>
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
            <label htmlFor="priority" className="text-xs font-semibold text-muted-foreground">Priority</label>
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
              ? "No tasks match your current filter parameters. Try expanding your search queries."
              : "Start organizing your flow by adding new task items."}
          </p>
          {!searchQuery && !statusFilter && !priorityFilter && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-xs hover:bg-primary/95 transition-all"
            >
              Get Started
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="group rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
                {/* Badges row */}
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Title */}
                <h4 className="font-semibold text-lg leading-snug tracking-tight mt-1 group-hover:text-primary transition-colors">
                  {task.title}
                </h4>
                
                {/* Description */}
                {task.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Card Footer info */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground/80">
                <span>Created {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>ID: #{task.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
