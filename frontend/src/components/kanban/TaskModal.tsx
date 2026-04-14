import { useState, useEffect } from 'react'
import { useTask, useUpdateTask, useComments, useAddComment, useDeleteTask } from '@/hooks/useTasks'
import { useProject } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import styles from './TaskModal.module.css'
import toast from 'react-hot-toast'

interface Props {
  taskId: number
  projectId: number
  canEdit: boolean // Initial prop from board (role-based)
  onClose: () => void
}

export function TaskModal({ taskId, projectId, canEdit: initialCanEdit, onClose }: Props) {
  const user = useAuthStore(s => s.user)
  const { data: task, isLoading } = useTask(taskId)
  const { data: project } = useProject(projectId)
  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const { data: commentsRes } = useComments(taskId)
  const addComment = useAddComment(taskId)

  const [commentBody, setCommentBody] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isDeletingScope, setIsDeletingScope] = useState(false)
  
  // Draft state for the whole form
  const [draft, setDraft] = useState<Partial<Task>>({})

  useEffect(() => {
    if (task && isEditing) {
      setDraft({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        // Fallback to task.assignee.id for robustness
        assignee_id: task.assignee_id ?? (task.assignee as any)?.id,
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      })
    }
  }, [task, isEditing])

  if (isLoading || !task) return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal}>
        <div className={styles.loading}>Loading task...</div>
      </div>
    </div>
  )

  const canEdit = initialCanEdit || task.assignee_id === user?.id
  const canDelete = initialCanEdit

  const handleSave = () => {
    if (!draft.title?.trim()) {
      toast.error('Title is required')
      return
    }

    updateTask.mutate({ 
      id: taskId, 
      data: draft 
    }, {
      onSuccess: () => {
        setIsEditing(false)
        toast.success('Task updated successfully')
      }
    })
  }

  const handleDeleteConfirm = () => {
    deleteTask.mutate(taskId, {
      onSuccess: () => onClose()
    })
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    addComment.mutate(commentBody, {
      onSuccess: () => setCommentBody('')
    })
  }

  const comments = commentsRes?.data || []
  const members = project?.members || []

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        {isDeletingScope && (
          <div className={styles.deleteOverlay}>
            <div className={styles.confirmDeleteBox}>
              <h3>Are you sure you want to delete?</h3>
              <p>This action cannot be undone and will permanently remove this task.</p>
              <div className={styles.confirmDeleteActions}>
                <button 
                  className={styles.confirmDeleteBtn}
                  onClick={handleDeleteConfirm}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button 
                  className={styles.cancelDeleteBtn}
                  onClick={() => setIsDeletingScope(false)}
                  disabled={deleteTask.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.headerTop}>
            {isEditing ? (
              <input 
                className={styles.titleInput} 
                value={draft.title || ''}
                onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task Title"
                autoFocus
              />
            ) : (
              <h2 className={styles.titleText}>{task.title}</h2>
            )}

            <div className={styles.headerActions}>
              {canEdit && !isEditing && (
                <button className={styles.editBtnMain} onClick={() => setIsEditing(true)}>
                  ✏️ Edit Task
                </button>
              )}
              {isEditing && (
                <div className={styles.formActionsTop}>
                  <button className={styles.btnSave} onClick={handleSave} disabled={updateTask.isPending}>
                    {updateTask.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btnCancel} onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.meta}>
            <span className={`${styles.statusBadge} ${styles[task.status]}`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
            <span>Created by: {task.project?.owner?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.mainCol}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Description</h3>
              </div>
              
              {isEditing ? (
                <textarea 
                  className={styles.descInput}
                  value={draft.description || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a more detailed description..."
                />
              ) : (
                <div className={styles.descriptionView}>
                  {task.description ? (
                    <p className={styles.descriptionText}>{task.description}</p>
                  ) : (
                    <p className={styles.placeholderLabel}>No description provided.</p>
                  )}
                </div>
              )}
            </div>

            {!isEditing && (
              <div className={styles.section}>
                <h3>Comments</h3>
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                  <input 
                    type="text" 
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    placeholder="Write a comment..." 
                    className={styles.commentInput}
                  />
                  <button type="submit" disabled={!commentBody.trim() || addComment.isPending} className={styles.btnPrimary}>
                    Post
                  </button>
                </form>

                <div className={styles.commentsList}>
                  {comments.map((comment: any) => (
                    <div key={comment.id} className={styles.comment}>
                      <div className={styles.commentHeader}>
                        <strong>{comment.user.name}</strong>
                        <small>{new Date(comment.created_at).toLocaleString()}</small>
                      </div>
                      <div className={styles.commentBody}>{comment.body}</div>
                    </div>
                  ))}
                  {comments.length === 0 && <p className={styles.noComments}>No comments yet.</p>}
                </div>
              </div>
            )}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.widget}>
              <h4>Assignee</h4>
              {isEditing ? (
                <select 
                  value={draft.assignee_id || ''} 
                  onChange={(e) => setDraft(prev => ({ ...prev, assignee_id: e.target.value === '' ? null : Number(e.target.value) }))}
                  className={styles.select}
                >
                  <option value="">Unassigned</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              ) : (
                <div className={styles.sideValue}>
                  {task.assignee ? (
                    <div className={styles.userBadge}>
                      <span className={styles.userInitial}>{task.assignee.name[0]}</span>
                      <span>{task.assignee.name}</span>
                    </div>
                  ) : 'Unassigned'}
                </div>
              )}
            </div>

            <div className={styles.widget}>
              <h4>Priority</h4>
              {isEditing ? (
                <select 
                  value={draft.priority} 
                  onChange={(e) => setDraft(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className={styles.select}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <div className={`${styles.sideValue} ${styles.capitalize} ${styles[task.priority + 'Priority']}`}>
                  {task.priority}
                </div>
              )}
            </div>

            <div className={styles.widget}>
              <h4>Due Date</h4>
              {isEditing ? (
                <input 
                  type="date" 
                  value={draft.due_date || ''}
                  onChange={(e) => setDraft(prev => ({ ...prev, due_date: e.target.value }))}
                  className={styles.dateInput}
                />
              ) : (
                <div className={styles.sideValue}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                </div>
              )}
            </div>

            <div className={styles.widget}>
              <h4>Status</h4>
              {isEditing ? (
                <select 
                  value={draft.status} 
                  onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className={styles.select}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <div className={styles.sideValue}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </div>
              )}
            </div>

            {canDelete && !isEditing && (
              <div className={styles.dangerZone}>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => setIsDeletingScope(true)}
                >
                  🗑 Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
