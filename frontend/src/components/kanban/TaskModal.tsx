import { useState, useEffect } from 'react'
import { useTask, useUpdateTask, useAddComment, useComments, useDeleteTask } from '@/hooks/useTasks'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { TaskStatus, TaskPriority, User } from '@/types'
import styles from './TaskModal.module.css'

interface TaskModalProps {
  taskId: number
  projectId: number
  onClose: () => void
  members: User[]
  canEdit: boolean
}

export function TaskModal({ taskId, projectId, onClose, members, canEdit }: TaskModalProps) {
  const { t } = useTranslation()
  const { data: task, isLoading } = useTask(taskId)
  const { data: comments } = useComments(taskId)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const addComment = useAddComment(taskId)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [commentText, setCommentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assignee_id ?? null)
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
    }
  }, [task])

  if (isLoading || !task)
    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.loading}>{t('kanban.loading')}</div>
        </div>
      </div>
    )

  const handleSave = () => {
    updateTask.mutate({
      id: taskId,
      data: {
        title,
        description: description || undefined,
        status,
        priority,
        assignee_id: assigneeId,
        due_date: dueDate || undefined,
      },
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTask.mutate(taskId, {
      onSuccess: () => onClose(),
    })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addComment.mutate(commentText, {
      onSuccess: () => setCommentText(''),
    })
  }

  const getPriorityClass = (p: TaskPriority) => {
    if (p === 'high') return styles.highPriority
    if (p === 'medium') return styles.mediumPriority
    return styles.lowPriority
  }

  const statusLabels: Record<TaskStatus, string> = {
    todo: t('kanban.todo'),
    in_progress: t('kanban.inProgress'),
    done: t('kanban.done'),
  }

  const priorityLabels: Record<TaskPriority, string> = {
    low: t('kanban.low'),
    medium: t('kanban.medium'),
    high: t('kanban.high'),
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <header className={styles.header}>
          <div className={styles.headerTop}>
            {isEditing ? (
              <div className={styles.editGroupCol}>
                <input
                  className={styles.titleInput}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('kanban.title')}
                  autoFocus
                />
              </div>
            ) : (
              <h2 className={styles.titleText}>{task.title}</h2>
            )}

            <div className={styles.headerActions}>
              {canEdit && !isEditing && (
                <button className={styles.editBtnMain} onClick={() => setIsEditing(true)}>
                  ✏️ {t('kanban.editTask')}
                </button>
              )}
              {isEditing && (
                <div className={styles.formActionsTop}>
                  <button
                    className={styles.btnSave}
                    onClick={handleSave}
                    disabled={updateTask.isPending}
                  >
                    {updateTask.isPending ? t('kanban.saving') : t('kanban.save')}
                  </button>
                  <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>
                    {t('kanban.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.meta}>
            <span className={`${styles.statusBadge} ${styles[task.status]}`}>
              {statusLabels[task.status]}
            </span>
            <span>Created by {task.project?.owner?.name || 'Unknown'}</span>
            {task.due_date && (
              <span className={task.is_overdue ? styles.highPriority : ''}>
                Due {format(new Date(task.due_date), 'PPP')}
              </span>
            )}
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.mainCol}>
            <section className={styles.section}>
              <h3>{t('kanban.description')}</h3>
              {isEditing ? (
                <textarea
                  className={styles.descInput}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                />
              ) : (
                <div className={styles.descriptionView}>
                  {task.description ? (
                    <p className={styles.descriptionText}>{task.description}</p>
                  ) : (
                    <p className={styles.placeholderLabel}>{t('kanban.noDescription')}</p>
                  )}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <h3>{t('kanban.activity')}</h3>
              <form className={styles.commentForm} onSubmit={handleAddComment}>
                <input
                  className={styles.commentInput}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={t('kanban.writeComment')}
                />
                <button
                  className={styles.btnPrimary}
                  disabled={!commentText.trim() || addComment.isPending}
                >
                  {t('kanban.send')}
                </button>
              </form>

              <div className={styles.commentsList}>
                {comments?.map((comment: any) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <strong>{comment.user?.name}</strong>
                      <small>{format(new Date(comment.created_at), 'MMM d, h:mm a')}</small>
                    </div>
                    <p className={styles.commentBody}>{comment.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.widget}>
              <h4>{t('kanban.assignee')}</h4>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={assigneeId || ''}
                  onChange={e => setAssigneeId(Number(e.target.value) || null)}
                >
                  <option value="">{t('kanban.unassigned')}</option>
                  {(members || []).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={styles.userBadge}>
                  {task.assignee ? (
                    <>
                      <div className={styles.userInitial}>{task.assignee.name[0]}</div>
                      <span className={styles.sideValue}>{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className={styles.placeholderLabel}>{t('kanban.unassigned')}</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.widget}>
              <h4>{t('kanban.priority')}</h4>
              {isEditing ? (
                <select
                  className={styles.select}
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="low">{t('kanban.low')}</option>
                  <option value="medium">{t('kanban.medium')}</option>
                  <option value="high">{t('kanban.high')}</option>
                </select>
              ) : (
                <span
                  className={`${styles.sideValue} ${styles.capitalize} ${getPriorityClass(task.priority)}`}
                >
                  {priorityLabels[task.priority]}
                </span>
              )}
            </div>

            <div className={styles.widget}>
              <h4>{t('kanban.dueDate')}</h4>
              {isEditing ? (
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              ) : (
                <span className={styles.sideValue}>
                  {task.due_date ? format(new Date(task.due_date), 'PPP') : t('project.stats.overdue')}
                </span>
              )}
            </div>

            {canEdit && (
              <div className={styles.dangerZone}>
                <button className={styles.deleteBtn} onClick={() => setIsDeleting(true)}>
                  🗑️ {t('kanban.deleteTask')}
                </button>
              </div>
            )}
          </aside>
        </div>

        {isDeleting && (
          <div className={styles.deleteOverlay}>
            <div className={styles.confirmDeleteBox}>
              <h3>{t('kanban.deleteConfirm')}</h3>
              <p>{t('kanban.deleteWarning')}</p>
              <div className={styles.confirmDeleteActions}>
                <button
                  className={styles.confirmDeleteBtn}
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? t('kanban.deleting') : t('kanban.confirmDelete')}
                </button>
                <button className={styles.cancelDeleteBtn} onClick={() => setIsDeleting(false)}>
                  {t('kanban.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
