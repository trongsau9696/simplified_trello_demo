import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useKanban } from '@/hooks/useProject'
import { useUpdateTaskStatus } from '@/hooks/useTasks'
import { useProjectChannel } from '@/hooks/useProjectChannel'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Task, TaskStatus, User } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { CreateTaskModal } from './CreateTaskModal'
import styles from './KanbanBoard.module.css'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#6366f1' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#10b981' },
]

interface Props {
  projectId: number
  canEdit: boolean
  members: User[]
}

export function KanbanBoard({ projectId, canEdit, members }: Props) {
  const user = useAuthStore(s => s.user)
  const { data: board, isLoading } = useKanban(projectId)
  const updateStatus = useUpdateTaskStatus(projectId)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
  const [taskCreationStatus, setTaskCreationStatus] = useState<TaskStatus | null>(null)

  useProjectChannel(projectId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const taskId = Number(active.id)

    if (!board) return
    const allTasks = Object.values(board).flat()
    const task = allTasks.find(t => t.id === taskId)

    if (task) {
      const canMove = canEdit || task.assignee_id === user?.id
      if (canMove) {
        setActiveTask(task)
      } else {
        toast.error('You can only move tasks assigned to you.')
      }
    }
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over || !board) return

    const taskId = Number(active.id)
    const allTasks = Object.values(board).flat()
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return

    const canMove = canEdit || task.assignee_id === user?.id
    if (!canMove) return

    let newStatus = over.id as string

    if (!['todo', 'in_progress', 'done'].includes(newStatus)) {
      const targetTaskId = Number(over.id)
      const foundStatus = Object.entries(board).find(([, tasks]) =>
        tasks.some(t => t.id === targetTaskId)
      )?.[0] as string | undefined

      if (foundStatus) {
        newStatus = foundStatus
      } else {
        return
      }
    }

    const currentStatus = Object.entries(board).find(([, tasks]) =>
      tasks.some(t => t.id === Number(active.id))
    )?.[0] as TaskStatus | undefined

    if (newStatus !== currentStatus) {
      updateStatus.mutate({ id: taskId, status: newStatus as TaskStatus })
    }
  }

  if (isLoading) return <div className={styles.loading}>Loading...</div>

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className={styles.board} role="main" aria-label="Kanban board">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={board?.[col.id] ?? []}
              canEdit={canEdit}
              onOpenTask={setActiveTaskId}
              onAddTask={() => setTaskCreationStatus(col.id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div style={{ cursor: 'grabbing' }}>
              <TaskCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {activeTaskId && (
        <TaskModal
          taskId={activeTaskId}
          projectId={projectId}
          canEdit={canEdit}
          onClose={() => setActiveTaskId(null)}
          members={members}
        />
      )}

      {taskCreationStatus && (
        <CreateTaskModal
          projectId={projectId}
          initialStatus={taskCreationStatus}
          onClose={() => setTaskCreationStatus(null)}
        />
      )}
    </>
  )
}
