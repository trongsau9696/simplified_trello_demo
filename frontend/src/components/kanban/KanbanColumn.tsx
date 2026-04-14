import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@/types'
import { TaskCard } from './TaskCard'
import styles from './KanbanColumn.module.css'

interface Props {
  id: TaskStatus
  label: string
  color: string
  tasks: Task[]
  canEdit: boolean
  projectId: number
  onOpenTask?: (id: number) => void
  onAddTask?: () => void
}

export function KanbanColumn({ id, label, color, tasks, canEdit, projectId, onOpenTask, onAddTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

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

      {canEdit && id === 'todo' && (
        <button
          className={styles.addBtn}
          onClick={onAddTask}
          aria-label={`Add task to ${label}`}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create new task
        </button>
      )}

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.tasks}>
          {tasks.length === 0 ? (
            <p className={styles.empty} aria-label="No tasks">Drop tasks here</p>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} canEdit={canEdit} onOpenTask={onOpenTask} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
