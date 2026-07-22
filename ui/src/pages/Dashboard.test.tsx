import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from './Dashboard'
import { api } from '../lib/api'

// Mock the API layer
vi.mock('../lib/api', () => ({
  api: {
    getTasks: vi.fn(),
    getStatistics: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}))

describe('Dashboard Component', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'First Test Task',
      description: 'First description',
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    },
    {
      id: 2,
      title: 'Second Test Task',
      description: 'Second description',
      priority: 'LOW' as const,
      status: 'DONE' as const,
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    },
  ]

  const mockStats = {
    total: 2,
    completed: 1,
    pending: 1,
    completionRate: 50,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getTasks).mockResolvedValue(mockTasks)
    vi.mocked(api.getStatistics).mockResolvedValue(mockStats)
  })

  it('renders loading skeleton and then loads tasks and statistics', async () => {
    render(<Dashboard />)

    expect(screen.getByText(/Loading tasks.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument()
      expect(screen.getByText('Second Test Task')).toBeInTheDocument()
    })

    expect(screen.getAllByText('50%')[0]).toBeInTheDocument()
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
  })

  it('renders empty state when no tasks are returned', async () => {
    vi.mocked(api.getTasks).mockResolvedValueOnce([])
    vi.mocked(api.getStatistics).mockResolvedValueOnce({
      total: 0,
      completed: 0,
      pending: 0,
      completionRate: 0,
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/No tasks found/i)).toBeInTheDocument()
      expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
    })
  })

  it('opens create task form and submits new task', async () => {
    vi.mocked(api.createTask).mockResolvedValueOnce({
      id: 3,
      title: 'New Created Task',
      description: 'New Description',
      priority: 'HIGH',
      status: 'TODO',
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument()
    })

    // Click "Add Task" button
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }))

    expect(screen.getByText('Create New Task')).toBeInTheDocument()

    // Fill in form
    fireEvent.change(screen.getByLabelText(/Title \*/i), { target: { value: 'New Created Task' } })
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'New Description' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }))

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        title: 'New Created Task',
        description: 'New Description',
        priority: 'LOW',
      })
      expect(screen.getByText(/Task #3 created successfully/i)).toBeInTheDocument()
    })
  })

  it('toggles task completion status cycle on button click', async () => {
    vi.mocked(api.updateTask).mockResolvedValueOnce({
      ...mockTasks[0],
      status: 'IN_PROGRESS',
    })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument()
    })

    // Click cycle status button for First Test Task
    const toggleButton = screen.getByTitle('Move to In Progress')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(1, { status: 'IN_PROGRESS' })
      expect(screen.getByText(/Task #1 moved to In Progress/i)).toBeInTheDocument()
    })
  })

  it('opens delete confirmation modal and deletes task', async () => {
    vi.mocked(api.deleteTask).mockResolvedValueOnce(undefined)

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument()
    })

    // Click delete button on first task
    const deleteButton = screen.getAllByTitle('Delete task')[0]
    fireEvent.click(deleteButton)

    expect(screen.getByText(/Delete Task\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete the task/i)).toBeInTheDocument()

    // Start fake timers just before confirmation action
    vi.useFakeTimers()

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete Task' })
    fireEvent.click(confirmDeleteBtn)

    // Verify the optimistic bottom bar shows up immediately
    expect(screen.getByText(/Deleting "First Test Task".../i)).toBeInTheDocument()

    // Fast-forward fake timers by 5 seconds
    vi.advanceTimersByTime(5000)

    // Restore real timers so waitFor can run normally
    vi.useRealTimers()

    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith(1)
      expect(screen.getByText(/Task #1 deleted successfully/i)).toBeInTheDocument()
    })
  })

  it('opens create modal with prefilled details on task duplicate button click', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('First Test Task')).toBeInTheDocument()
    })

    // Click duplicate button on first task
    const duplicateButton = screen.getAllByTitle('Duplicate task')[0]
    fireEvent.click(duplicateButton)

    // Form modal should open
    expect(screen.getByText('Create New Task')).toBeInTheDocument()

    // Title and description inputs should be prefilled
    const titleInput = screen.getByLabelText(/Title \*/i) as HTMLInputElement
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement

    expect(titleInput.value).toBe('First Test Task (Copy)')
    expect(descInput.value).toBe('First description')
  })
})
