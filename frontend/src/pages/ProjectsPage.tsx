import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProject } from '@/hooks/useProject'
import { InfiniteProjectList } from '@/components/project/InfiniteProjectList'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import styles from './ProjectsPage.module.css'

const schema = z.object({
  name:        z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const createProject = useCreateProject()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createProject.mutate(data, { onSuccess: () => { reset(); setShowForm(false) } })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link to="/dashboard" className={styles.back}>← Dashboard</Link>
          <h1>Projects</h1>
        </div>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <button className={styles.newBtn} onClick={() => setShowForm(v => !v)} aria-expanded={showForm}>
            {showForm ? '✕ Cancel' : '+ New Project'}
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <input {...register('name')} placeholder="Project name" className={styles.input} />
            {errors.name && <span className={styles.err}>{errors.name.message}</span>}
            <textarea {...register('description')} placeholder="Description (optional)" className={styles.textarea} rows={3} />
            <button type="submit" disabled={createProject.isPending} className={styles.submitBtn}>
              {createProject.isPending ? 'Creating…' : 'Create Project'}
            </button>
          </form>
        )}

        <InfiniteProjectList />
      </div>
    </div>
  )
}
