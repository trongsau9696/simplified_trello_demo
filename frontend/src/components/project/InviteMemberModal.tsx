import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useInviteMember } from '@/hooks/useProject'
import { useTranslation } from 'react-i18next'
import styles from './EditProjectModal.module.css' // Reuse modal styles

interface Props {
  projectId: number
  onClose: () => void
}

export function InviteMemberModal({ projectId, onClose }: Props) {
  const { t } = useTranslation()
  const inviteMember = useInviteMember(projectId)

  const schema = z.object({
    email: z.string().email(t('auth.errors.invalidEmail')),
    role: z.enum(['editor', 'viewer']),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'editor',
    },
  })

  const onSubmit = (data: FormData) => {
    inviteMember.mutate(data, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t('modals.inviteTitle')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label>{t('modals.userEmail')}</label>
            <input
              {...register('email')}
              placeholder="e.g. collegue@example.com"
              className={errors.email ? styles.errorInput : ''}
              autoFocus
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label>{t('modals.role')}</label>
            <select {...register('role')} className={styles.select}>
              <option value="editor">
                {t('modals.editor')} ({t('modals.editorDesc')})
              </option>
              <option value="viewer">
                {t('modals.viewer')} ({t('modals.viewerDesc')})
              </option>
            </select>
            {errors.role && <span className={styles.error}>{errors.role.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              {t('kanban.cancel')}
            </button>
            <button type="submit" disabled={inviteMember.isPending} className={styles.saveBtn}>
              {inviteMember.isPending ? t('modals.sending') : t('modals.sendInvite')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
