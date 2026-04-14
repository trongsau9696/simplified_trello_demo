import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import { useCreateTask } from '@/hooks/useTasks'
import styles from './KanbanColumn.module.css'

interface Props {
  id: TaskStatus
  label: string
  color: string
  tasks: Task[]
  canEdit: boolean
  projectId: number
}

export function KanbanColumn({ id, label, color, tasks, canEdit, projectId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const createTask = useCreateTask(projectId)

  function handleAddTask() {
    const title = prompt('Task title:')
    if (title?.trim()) {
      createTask.mutate({ title: title.trim(), status: id })
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.over : ''}`}
      aria-label={`${label} column`}
    >
      <div className={styles.header} style={{ borderTopColor: color }}>
        <h3 className={styles.title}>{label}</h3>
        <span className={styles.count}>{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.tasks}>
          {tasks.length === 0 ? (
            <p className={styles.empty} aria-label="No tasks">Drop tasks here</p>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} canEdit={canEdit} />
            ))
          )}
        </div>
      </SortableContext>

      {canEdit && (
        <button
          className={styles.addBtn}
          onClick={handleAddTask}
          aria-label={`Add task to ${label}`}
        >
          + Add Task
        </button>
      )}
    </div>
  )
}
