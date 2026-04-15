import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useInviteMember } from '@/hooks/useProject'
import styles from './EditProjectModal.module.css' // Reuse modal styles

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['editor', 'viewer']),
})

type FormData = z.infer<typeof schema>

interface Props {
  projectId: number
  onClose: () => void
}

export function InviteMemberModal({ projectId, onClose }: Props) {
  const inviteMember = useInviteMember(projectId)

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
          <h2>Invite Member</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label>User Email</label>
            <input
              {...register('email')}
              placeholder="e.g. collegue@example.com"
              className={errors.email ? styles.errorInput : ''}
              autoFocus
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label>Role</label>
            <select {...register('role')} className={styles.select}>
              <option value="editor">Editor (Can manage tasks)</option>
              <option value="viewer">Viewer (Can only view)</option>
            </select>
            {errors.role && <span className={styles.error}>{errors.role.message}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={inviteMember.isPending} className={styles.saveBtn}>
              {inviteMember.isPending ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
