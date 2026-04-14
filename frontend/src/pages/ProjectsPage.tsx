import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProject, useDeleteProject, useProjects } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import styles from './ProjectsPage.module.css'

const schema = z.object({
  name:        z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useProjects()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createProject.mutate(data, { onSuccess: () => { reset(); setShowForm(false) } })
  }

  const projects = data?.data ?? []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link to="/dashboard" className={styles.back}>← Dashboard</Link>
          <h1>Projects</h1>
        </div>
        <button className={styles.newBtn} onClick={() => setShowForm(v => !v)} aria-expanded={showForm}>
          {showForm ? '✕ Cancel' : '+ New Project'}
        </button>
      </header>

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

      {isLoading ? (
        <><SkeletonCard /><SkeletonCard /></>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <div key={p.id} className={styles.card}>
              <Link to={`/projects/${p.id}`} className={styles.cardLink}>
                <h3>{p.name}</h3>
                <p>{p.description || 'No description'}</p>
                <div className={styles.meta}>
                  <span className={styles.role}>{p.my_role}</span>
                  <span>📋 {p.tasks_count ?? 0} tasks</span>
                  <span>👥 {p.members?.length ?? 1}</span>
                </div>
              </Link>
              {p.my_role === 'owner' && (
                <button
                  className={styles.deleteBtn}
                  onClick={() => confirm('Delete project?') && deleteProject.mutate(p.id)}
                  aria-label={`Delete ${p.name}`}
                >
                  🗑
                </button>
              )}
            </div>
          ))}
          {projects.length === 0 && (
            <div className={styles.empty}>No projects yet. Create one above! 🚀</div>
          )}
        </div>
      )}
    </div>
  )
}
