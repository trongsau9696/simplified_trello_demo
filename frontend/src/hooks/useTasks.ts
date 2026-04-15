import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { taskApi, commentApi } from '@/api/projects'
import type { KanbanBoard, Task, TaskStatus, ApiError } from '@/types'
import { AxiosError } from 'axios'
import toast from 'react-hot-toast'

export function useUpdateTaskStatus(projectId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),

    // ─── Optimistic update ────────────────────────────────
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['projects', projectId, 'kanban'] })
      const previous = qc.getQueryData<KanbanBoard>(['projects', projectId, 'kanban'])

      qc.setQueryData<KanbanBoard>(['projects', projectId, 'kanban'], old => {
        if (!old) return old
        const allTasks = [...old.todo, ...old.in_progress, ...old.done]
        const task = allTasks.find(t => t.id === id)
        if (!task) return old

        const updatedTask = { ...task, status }
        const removeFrom = (arr: Task[]) => arr.filter(t => t.id !== id)

        return {
          todo: status === 'todo' ? [...removeFrom(old.todo), updatedTask] : removeFrom(old.todo),
          in_progress:
            status === 'in_progress'
              ? [...removeFrom(old.in_progress), updatedTask]
              : removeFrom(old.in_progress),
          done: status === 'done' ? [...removeFrom(old.done), updatedTask] : removeFrom(old.done),
        }
      })

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['projects', projectId, 'kanban'], context.previous)
      }
      toast.error('Failed to update task status')
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'kanban'] })
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] })
    },
  })
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Task>) => taskApi.create(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'kanban'] })
      toast.success('Task created!')
    },
  })
}

export function useDeleteTask(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'kanban'] })
      toast.success('Task deleted')
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<ApiError>
      const msg = axiosError.response?.data?.message || 'Failed to delete task'
      toast.error(msg)
    },
  })
}

// ─── Modal Specific Hooks ──────────────────────────────────

export function useTask(taskId: number | null) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskApi.get(taskId!),
    enabled: !!taskId,
  })
}

export function useUpdateTask(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => taskApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', variables.id] })
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'kanban'] })
      toast.success('Task updated!')
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<ApiError>
      const message =
        axiosError.response?.data?.message ||
        Object.values(axiosError.response?.data?.errors ?? {})
          .flat()
          .join(', ') ||
        'Failed to update task'
      toast.error(message)
    },
  })
}

export function useComments(taskId: number | null) {
  return useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: async () => {
      const res = await commentApi.list(taskId!)
      return res.data
    },
    enabled: !!taskId,
  })
}

export function useAddComment(taskId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => commentApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] })
      toast.success('Comment added')
    },
  })
}
