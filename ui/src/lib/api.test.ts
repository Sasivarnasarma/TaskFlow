import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

describe('API Client Functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('api.getTasks calls /api/tasks with query params and returns data', async () => {
    const mockData = [{ id: 1, title: 'Task 1', status: 'TODO', priority: 'HIGH' }]
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData, error: null }),
    } as Response)

    const result = await api.getTasks({
      search: 'Task',
      status: 'TODO',
      priority: 'HIGH',
      sort: 'newest',
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/tasks?search=Task&status=TODO&priority=HIGH&sort=newest',
      expect.any(Object)
    )
    expect(result).toEqual(mockData)
  })

  it('api.getTaskById calls /api/tasks/:id', async () => {
    const mockTask = { id: 3, title: 'Task 3', status: 'TODO', priority: 'LOW' }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockTask, error: null }),
    } as Response)

    const result = await api.getTaskById(3)

    expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/3', expect.any(Object))
    expect(result).toEqual(mockTask)
  })

  it('api.createTask posts task data to /api/tasks', async () => {
    const newTask = { title: 'New Task', description: 'Desc', priority: 'HIGH' }
    const responseTask = { id: 2, ...newTask, status: 'TODO' }

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: responseTask, error: null }),
    } as Response)

    const result = await api.createTask(newTask)

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify(newTask),
      })
    )
    expect(result).toEqual(responseTask)
  })

  it('api.updateTask puts updated data to /api/tasks/:id', async () => {
    const updates = { title: 'Updated Title', status: 'DONE' }
    const responseTask = { id: 5, ...updates }

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: responseTask, error: null }),
    } as Response)

    const result = await api.updateTask(5, updates)

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/tasks/5',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.any(Object),
        body: JSON.stringify(updates),
      })
    )
    expect(result).toEqual(responseTask)
  })

  it('api.deleteTask issues DELETE request to /api/tasks/:id and handles 204', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response)

    await api.deleteTask(10)

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/tasks/10',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('api.getStatistics fetches /api/statistics and returns stats payload', async () => {
    const statsData = { total: 5, completed: 2, pending: 3, completionRate: 40 }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: statsData, error: null }),
    } as Response)

    const result = await api.getStatistics()

    expect(fetchSpy).toHaveBeenCalledWith('/api/statistics', expect.any(Object))
    expect(result).toEqual(statsData)
  })

  it('api.getHealth fetches health status and returns response', async () => {
    const healthData = { status: 'ok', version: '1.0.0' }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: healthData, error: null }),
    } as Response)

    const result = await api.getHealth()

    expect(fetchSpy).toHaveBeenCalledWith('/api/health', expect.any(Object))
    expect(result).toEqual(healthData)
  })

  it('api.getVersion fetches API version and returns response', async () => {
    const versionData = { version: '1.0.0' }
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: versionData, error: null }),
    } as Response)

    const result = await api.getVersion()

    expect(fetchSpy).toHaveBeenCalledWith('/api/version', expect.any(Object))
    expect(result).toEqual(versionData)
  })

  it('throws Error when API response success is false', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, data: null, error: 'Custom API Error' }),
    } as Response)

    await expect(api.getTasks()).rejects.toThrow('Custom API Error')
  })
})
