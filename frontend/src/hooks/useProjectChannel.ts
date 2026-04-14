import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { echo } from '@/lib/echo'
import type { KanbanBoard, Task } from '@/types'
import toast from 'react-hot-toast'

/**
 * Subscribe to real-time events on project.{projectId} channel.
 * Updates React Query cache optimistically on incoming events.
 */
export function useProjectChannel(projectId: number): void {
  const qc = useQueryClient()

  useEffect(() => {
    if (!projectId) return

    const channel = echo.channel(`project.${projectId}`)

    // ─── task.status.updated ──────────────────────────────
    channel.listen('.task.status.updated', (event: Pick<Task, 'id' | 'status' | 'position'>) => {
      qc.setQueryData<KanbanBoard>(['projects', projectId, 'kanban'], old => {
        if (!old) return old

        const allTasks = [...old.todo, ...old.in_progress, ...old.done]
        const task = allTasks.find(t => t.id === event.id)
        if (!task) return old

        const updatedTask = { ...task, status: event.status }
        const removeFrom = (arr: Task[]) => arr.filter(t => t.id !== event.id)

        return {
          todo:        event.status === 'todo'        ? [...removeFrom(old.todo),        updatedTask] : removeFrom(old.todo),
          in_progress: event.status === 'in_progress' ? [...removeFrom(old.in_progress), updatedTask] : removeFrom(old.in_progress),
          done:        event.status === 'done'        ? [...removeFrom(old.done),        updatedTask] : removeFrom(old.done),
        }
      })
    })

    // ─── task.created ─────────────────────────────────────
    channel.listen('.task.created', (event: Partial<Task>) => {
      qc.invalidateQueries({ queryKey: ['projects', projectId, 'kanban'] })
      toast.success(`New task: "${event.title}"`, { icon: '📋' })
    })

    // ─── task.deleted ─────────────────────────────────────
    channel.listen('.task.deleted', (event: { id: number }) => {
      qc.setQueryData<KanbanBoard>(['projects', projectId, 'kanban'], old => {
        if (!old) return old
        const removeFrom = (arr: Task[]) => arr.filter(t => t.id !== event.id)
        return {
          todo:        removeFrom(old.todo),
          in_progress: removeFrom(old.in_progress),
          done:        removeFrom(old.done),
        }
      })
      toast('Task was deleted by another user')
    })

    return () => {
      echo.leaveChannel(`project.${projectId}`)
    }
  }, [projectId, qc])
}
