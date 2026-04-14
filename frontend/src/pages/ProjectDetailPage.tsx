import { useParams, Link } from 'react-router-dom'
import { useProject, useProjectStats } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { SkeletonPage } from '@/components/ui/SkeletonLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import styles from './ProjectDetailPage.module.css'

function ExportPdfButton({ projectId }: { projectId: number }) {
  const token = useAuthStore(s => s.token)

  const handleExport = async () => {
    const res = await fetch(`/api/projects/${projectId}/report/pdf`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-${projectId}-report.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className={styles.exportBtn} onClick={handleExport} aria-label="Export project report as PDF">
      📄 Export PDF
    </button>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const user = useAuthStore(s => s.user)

  const { data: project, isLoading } = useProject(projectId)
  const { data: stats } = useProjectStats(projectId)

  if (isLoading) return <SkeletonPage />
  if (!project) return <div>Project not found</div>

  const canEdit = project.my_role === 'owner' || project.my_role === 'editor'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link to="/dashboard" className={styles.back}>← Back</Link>
          <h1 className={styles.title}>{project.name}</h1>
          {project.description && <p className={styles.desc}>{project.description}</p>}
        </div>
        <div className={styles.badges}>
          <ThemeToggle />
          <span className={styles.role}>{project.my_role}</span>
          {stats && (
            <span className={styles.completion}>{stats.completion_rate}% complete</span>
          )}
          <ExportPdfButton projectId={projectId} />
        </div>
      </header>

      {stats && (
        <div className={styles.statsRow}>
          {[
            { label: 'Total',       value: stats.total,       color: '#94a3b8' },
            { label: 'Todo',        value: stats.todo,        color: '#6366f1' },
            { label: 'In Progress', value: stats.in_progress, color: '#f59e0b' },
            { label: 'Done',        value: stats.done,        color: '#10b981' },
            { label: 'Overdue',     value: stats.overdue,     color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className={styles.statPill} style={{ borderColor: s.color }}>
              <span className={styles.statVal} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <KanbanBoard projectId={projectId} canEdit={canEdit} />
    </div>
  )
}
