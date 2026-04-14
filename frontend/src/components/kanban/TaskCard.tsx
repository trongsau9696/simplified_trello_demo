import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types'
import styles from './TaskCard.module.css'

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' } as const

interface Props {
  task: Task
  canEdit: boolean
}

export function TaskCard({ task, canEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
      role="article"
      aria-label={`Task: ${task.title}`}
      tabIndex={0}
    >
      <div className={styles.priority} style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
      <h4 className={styles.title}>{task.title}</h4>

      {task.assignee && (
        <div className={styles.assignee}>
          <span className={styles.avatar}>{task.assignee.name[0]}</span>
          <span className={styles.name}>{task.assignee.name}</span>
        </div>
      )}

      <div className={styles.footer}>
        {task.due_date && (
          <span className={`${styles.due} ${task.is_overdue ? styles.overdue : ''}`}>
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {task.comments_count !== undefined && task.comments_count > 0 && (
          <span className={styles.comments}>💬 {task.comments_count}</span>
        )}
      </div>
    </div>
  )
}
