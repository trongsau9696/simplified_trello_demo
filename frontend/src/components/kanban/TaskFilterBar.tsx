import { User } from '@/types'
import { useTranslation } from 'react-i18next'
import styles from './TaskFilterBar.module.css'

interface Props {
  search: string
  onSearchChange: (val: string) => void
  priority: string
  onPriorityChange: (val: string) => void
  assigneeId: string
  onAssigneeChange: (val: string) => void
  status: string
  onStatusChange: (val: string) => void
  dueDate: string
  onDueDateChange: (val: string) => void
  members: User[]
}

export function TaskFilterBar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  status,
  onStatusChange,
  dueDate,
  onDueDateChange,
  members,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder={t('kanban.searchPlaceholder')}
          className={styles.searchInput}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={status}
          onChange={e => onStatusChange(e.target.value)}
        >
          <option value="">{t('kanban.allStatuses')}</option>
          <option value="todo">{t('kanban.todo')}</option>
          <option value="in_progress">{t('kanban.inProgress')}</option>
          <option value="done">{t('kanban.done')}</option>
        </select>

        <select
          className={styles.select}
          value={priority}
          onChange={e => onPriorityChange(e.target.value)}
        >
          <option value="">{t('kanban.allPriorities')}</option>
          <option value="low">{t('kanban.low')}</option>
          <option value="medium">{t('kanban.medium')}</option>
          <option value="high">{t('kanban.high')}</option>
        </select>

        <select
          className={styles.select}
          value={assigneeId}
          onChange={e => onAssigneeChange(e.target.value)}
        >
          <option value="">{t('kanban.allMembers')}</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className={styles.dateWrapper}>
          <input
            type="date"
            className={styles.dateInput}
            value={dueDate}
            onChange={e => onDueDateChange(e.target.value)}
            title={t('kanban.dueDate')}
          />
        </div>

        {(search || priority || assigneeId || status || dueDate) && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              onSearchChange('')
              onPriorityChange('')
              onAssigneeChange('')
              onStatusChange('')
              onDueDateChange('')
            }}
          >
            {t('kanban.clearFilters')}
          </button>
        )}
      </div>
    </div>
  )
}
