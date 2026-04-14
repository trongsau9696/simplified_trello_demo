import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useKanban } from '@/hooks/useProject'
import { useUpdateTaskStatus } from '@/hooks/useTasks'
import type { TaskStatus } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import styles from './KanbanBoard.module.css'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: '#6366f1' },
  { id: 'in_progress', label: 'In Progress',  color: '#f59e0b' },
  { id: 'done',        label: 'Done',         color: '#10b981' },
]

interface Props {
  projectId: number
  canEdit: boolean
}

export function KanbanBoard({ projectId, canEdit }: Props) {
  const { data: board, isLoading } = useKanban(projectId)
  const updateStatus = useUpdateTaskStatus(projectId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || !canEdit) return

    const taskId = Number(active.id)
    const newStatus = over.id as TaskStatus

    const currentStatus = Object.entries(board ?? {}).find(([, tasks]) =>
      tasks.some((t: { id: number }) => t.id === taskId)
    )?.[0] as TaskStatus | undefined

    if (newStatus !== currentStatus) {
      updateStatus.mutate({ id: taskId, status: newStatus })
    }
  }

  if (isLoading) return <div className={styles.loading} aria-label="Loading kanban board">Loading...</div>

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.board} role="main" aria-label="Kanban board">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            tasks={board?.[col.id] ?? []}
            canEdit={canEdit}
            projectId={projectId}
          />
        ))}
      </div>
    </DndContext>
  )
}
