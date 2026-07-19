const API_BASE_URL = '/api';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface TaskFilterParams {
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const result: ApiResponse<T> = await response.json();
  if (!result.success || response.status >= 400) {
    throw new Error(result.error || 'Request failed');
  }

  return result.data as T;
}

export const api = {
  getTasks: (params?: TaskFilterParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const queryString = query.toString();
    return request<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  
  getTaskById: (id: number) => request<Task>(`/tasks/${id}`),
  
  createTask: (data: { title: string; description?: string; priority?: string }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateTask: (id: number, data: { title?: string; description?: string; priority?: string; status?: string }) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteTask: (id: number) =>
    request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
