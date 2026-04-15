import { useState } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { useProject } from '@/hooks/useProject'
import { useTranslation } from 'react-i18next'
import type { TaskStatus, TaskPriority } from '@/types'
import styles from './TaskModal.module.css' // Reusing the same beautiful modal CSS

interface Props {
  projectId: number
  initialStatus: TaskStatus
  onClose: () => void
}

export function CreateTaskModal({ projectId, initialStatus, onClose }: Props) {
  const { t } = useTranslation()
  const createTask = useCreateTask(projectId)
  const { data: project } = useProject(projectId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState<number | ''>('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        status: initialStatus,
        priority,
        assignee_id: assigneeId === '' ? undefined : Number(assigneeId),
        due_date: dueDate || undefined,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const members = project?.members || []

  const statusLabels: Record<TaskStatus, string> = {
    todo: t('kanban.todo'),
    in_progress: t('kanban.inProgress'),
    done: t('kanban.done'),
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          ×
        </button>

        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <div className={styles.editGroupCol}>
              <label
                htmlFor="task-title"
                style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}
              >
                {t('kanban.title')} *
              </label>
              <input
                id="task-title"
                className={styles.titleInput}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('kanban.searchPlaceholder')}
                autoFocus
                required
              />
            </div>
            <div className={styles.meta}>
              <span className={styles.statusBadge}>
                {t('kanban.creatingIn')} {statusLabels[initialStatus]}
              </span>
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.mainCol}>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>{t('kanban.description')}</h3>
                </div>
                <textarea
                  className={styles.descInput}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                />
              </div>

              <div className={styles.section}>
                <div
                  className={styles.editActions}
                  style={{ justifyContent: 'flex-start', marginTop: '2rem' }}
                >
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={!title.trim() || createTask.isPending}
                  >
                    {createTask.isPending ? t('kanban.saving') : t('kanban.addTask')}
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={onClose}>
                    {t('kanban.cancel')}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.widget}>
                <h4>{t('kanban.assignee')}</h4>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value === '' ? '' : Number(e.target.value))}
                  className={styles.select}
                >
                  <option value="">{t('kanban.unassigned')}</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.widget}>
                <h4>{t('kanban.priority')}</h4>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className={styles.select}
                >
                  <option value="low">{t('kanban.low')}</option>
                  <option value="medium">{t('kanban.medium')}</option>
                  <option value="high">{t('kanban.high')}</option>
                </select>
              </div>

              <div className={styles.widget}>
                <h4>{t('kanban.dueDate')}</h4>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
