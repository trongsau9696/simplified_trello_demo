import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUpdateProject } from '@/hooks/useProject'
import type { Project } from '@/types'
import styles from './EditProjectModal.module.css'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(500).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  project: Project
  onClose: () => void
}

export function EditProjectModal({ project, onClose }: Props) {
  const updateProject = useUpdateProject(project.id)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  })

  const onSubmit = (data: FormData) => {
    updateProject.mutate(data, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Edit Project Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label>Project Name</label>
            <input
              {...register('name')}
              placeholder="Enter project name"
              className={errors.name ? styles.errorInput : ''}
              autoFocus
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label>Description (Optional)</label>
            <textarea
              {...register('description')}
              placeholder="What is this project about?"
              rows={4}
            />
            {errors.description && (
              <span className={styles.error}>{errors.description.message}</span>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProject.isPending}
              className={styles.saveBtn}
            >
              {updateProject.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
