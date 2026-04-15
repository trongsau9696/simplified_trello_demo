import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types'
import { format } from 'date-fns'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  onClick?: () => void
}

const getPriorityColor = (p: Task['priority']) => {
  switch (p) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#10b981'
    default: return '#94a3b8'
  }
}

export function TaskCard({ task, isOverlay, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const color = getPriorityColor(task.priority)

  const content = (
    <>
      <div className={styles.priority} style={{ background: color }} />
      <div className={styles.header}>
        <div className={styles.due}>
          {task.due_date ? format(new Date(task.due_date), 'MMM d') : ''}
        </div>
      </div>
      <h4 className={styles.title}>{task.title}</h4>
      <div className={styles.footer}>
        {task.assignee ? (
          <div className={styles.assignee} title={`Assigned to ${task.assignee.name}`}>
            <div className={styles.avatar}>{task.assignee.name[0]}</div>
            <span className={styles.name}>{task.assignee.name}</span>
          </div>
        ) : (
          <div className={`${styles.assignee} ${styles.unassigned}`}>
            <div className={styles.avatar}>?</div>
            <span className={styles.name}>Unassigned</span>
          </div>
        )}
      </div>
    </>
  )

  if (isOverlay) {
    return (
      <div className={`${styles.card} ${styles.overlay}`}>
        {content}
      </div>
    )
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={styles.card} 
      onClick={() => onClick?.()}
      {...attributes} 
      {...listeners}
    >
      {content}
    </div>
  )
}
