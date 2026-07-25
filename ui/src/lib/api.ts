const API_BASE_URL = '/api'

export interface Task {
  id: number
  title: string
  description: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

export interface TaskFilterParams {
  status?: string
  priority?: string
  search?: string
  sort?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  const token = localStorage.getItem('taskflow_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options?.headers) {
    const customHeaders = new Headers(options.headers)
    customHeaders.forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return null as T
  }

  // Handle unauthorized (session expired or invalid token)
  if (response.status === 401) {
    const isAuthRoute = path.startsWith('/auth/') && path !== '/auth/logout'
    if (!isAuthRoute) {
      localStorage.removeItem('taskflow_token')
      localStorage.removeItem('taskflow_user')
      // Avoid redirect loops if we are already on login, register, or recover pages
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/recover') {
        window.location.href = '/login'
      }
      throw new Error('Authentication expired. Please log in again.')
    }
  }

  const result: ApiResponse<T> = await response.json()
  if (!result.success || response.status >= 400) {
    throw new Error(result.error || 'Request failed')
  }

  return result.data as T
}

export const api = {
  login: (data: any) =>
    request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => ({
      accessToken: res.access_token,
      tokenType: res.token_type,
      user: {
        id: res.user.id,
        username: res.user.username,
        createdAt: res.user.created_at,
      } as User,
    })),

  register: (data: any) =>
    request<{ recovery_key: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => ({
      recoveryKey: res.recovery_key,
    })),

  recoverPassword: (data: any) =>
    request<{ recovery_key: string }>('/auth/recover', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => ({
      recoveryKey: res.recovery_key,
    })),

  logout: () =>
    request<void>('/auth/logout', {
      method: 'POST',
    }),

  getTasks: (params?: TaskFilterParams) => {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val)
      })
    }
    const queryString = query.toString()
    return request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`)
  },

  getTaskById: (id: number) => request<Task>(`/tasks/${id}`),

  createTask: (data: {
    title: string
    description?: string
    priority?: string
    dueDate?: string | null
  }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (
    id: number,
    data: {
      title?: string
      description?: string
      priority?: string
      status?: string
      dueDate?: string | null
    }
  ) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  getStatistics: () =>
    request<{ total: number; completed: number; pending: number; completionRate: number }>(
      '/statistics'
    ),

  getHealth: () =>
    request<{ status: string; version: string; allowRegistration: boolean }>('/health'),

  getVersion: () => request<{ version: string; allowRegistration: boolean }>('/version'),
}
