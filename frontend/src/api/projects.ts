import api from '@/api/axios'
import type { KanbanBoard, PaginatedResponse, Project, ProjectStats, Task } from '@/types'

export const projectApi = {
  list: async (cursor?: string) => {
    const res = await api.get<PaginatedResponse<Project>>('/projects', {
      params: cursor ? { cursor } : undefined,
    })
    return res.data
  },

  get: async (id: number) => {
    const res = await api.get<{ data: Project }>(`/projects/${id}`)
    return res.data.data
  },

  create: async (data: { name: string; description?: string }) => {
    const res = await api.post<{ data: Project }>('/projects', data)
    return res.data.data
  },

  update: async (id: number, data: { name?: string; description?: string }) => {
    const res = await api.put<{ data: Project }>(`/projects/${id}`, data)
    return res.data.data
  },

  delete: async (id: number) => {
    await api.delete(`/projects/${id}`)
  },

  invite: async (id: number, data: { email: string; role: string }) => {
    const res = await api.post(`/projects/${id}/invite`, data)
    return res.data
  },

  removeMember: async (id: number, userId: number) => {
    await api.delete(`/projects/${id}/members/${userId}`)
  },

  stats: async (id: number) => {
    const res = await api.get<{ data: ProjectStats }>(`/projects/${id}/stats`)
    return res.data.data
  },

  kanban: async (id: number, params?: Record<string, any>) => {
    const res = await api.get<{ data: KanbanBoard }>(`/projects/${id}/tasks/kanban`, { params })
    return res.data.data
  },
}

export const taskApi = {
  list: async (projectId: number, params?: Record<string, string>) => {
    const res = await api.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, { params })
    return res.data
  },

  get: async (id: number) => {
    const res = await api.get<{ data: Task }>(`/tasks/${id}`)
    return res.data.data
  },

  create: async (projectId: number, data: Partial<Task>) => {
    const res = await api.post<{ data: Task }>(`/projects/${projectId}/tasks`, data)
    return res.data.data
  },

  update: async (id: number, data: Partial<Task>) => {
    const res = await api.put<{ data: Task }>(`/tasks/${id}`, data)
    return res.data.data
  },

  updateStatus: async (id: number, status: string) => {
    const res = await api.patch<{ data: Task }>(`/tasks/${id}/status`, { status })
    return res.data.data
  },

  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`)
  },
  reorder: async (projectId: number, tasks: { id: number; position: number }[]) => {
    const res = await api.put(`/projects/${projectId}/tasks/reorder`, { tasks })
    return res.data
  },
}

export const commentApi = {
  list: async (taskId: number) => {
    const res = await api.get(`/tasks/${taskId}/comments`)
    return res.data
  },

  create: async (taskId: number, body: string) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { body })
    return res.data
  },

  delete: async (id: number) => {
    await api.delete(`/comments/${id}`)
  },
}
