import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  id: TaskStatus
  label: string
  color: string
  tasks: Task[]
  canEdit: boolean
  onOpenTask: (id: number) => void
  onAddTask: () => void
}

export function KanbanColumn({ id, label, color, tasks, canEdit, onOpenTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <div className={styles.header} style={{ borderTopColor: color }}>
        <h3 className={styles.title}>
          {label} <span className={styles.count}>{tasks.length}</span>
        </h3>
        {canEdit && id === 'todo' && (
          <button className={styles.addBtn} onClick={onAddTask} title="Add new task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </button>
        )}
      </div>

      <div ref={setNodeRef} className={styles.tasks}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task.id)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && <div className={styles.empty}>No tasks here</div>}
      </div>
    </div>
  )
}
