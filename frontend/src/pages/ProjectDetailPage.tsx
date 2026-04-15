import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProject, useProjectStats, useRemoveMember } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { SkeletonPage } from '@/components/ui/SkeletonLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { EditProjectModal } from '@/components/project/EditProjectModal'
import { InviteMemberModal } from '@/components/project/InviteMemberModal'
import type { User } from '@/types'
import styles from './ProjectDetailPage.module.css'

function MemberList({
  members,
  isOwner,
  onRemove,
}: {
  members: User[]
  isOwner: boolean
  onRemove: (id: number) => void
}) {
  const handleRemove = (member: User) => {
    if (!isOwner) return
    if (confirm(`Remove ${member.name} from project?`)) {
      onRemove(member.id)
    }
  }

  return (
    <div className={styles.memberList}>
      {members.slice(0, 5).map(m => (
        <span
          key={m.id}
          className={`${styles.memberAvatar} ${isOwner ? styles.clickable : ''}`}
          title={isOwner ? `Remove ${m.name}` : m.name}
          onClick={() => handleRemove(m)}
        >
          {m.name[0]}
        </span>
      ))}
      {members.length > 5 && <span className={styles.memberAvatarMore}>+{members.length - 5}</span>}
    </div>
  )
}

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
    <button
      className={styles.exportBtn}
      onClick={handleExport}
      aria-label="Export project report as PDF"
    >
      📄 Export PDF
    </button>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [isInvitingMember, setIsInvitingMember] = useState(false)

  const { data: project, isLoading } = useProject(projectId)
  const { data: stats } = useProjectStats(projectId)
  const removeMember = useRemoveMember(projectId)

  if (isLoading) return <SkeletonPage />
  if (!project) return <div>Project not found</div>

  const canEdit = project.my_role === 'owner' || project.my_role === 'editor'
  const isOwner = project.my_role === 'owner'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <Link to="/dashboard" className={styles.back}>
            ← Back
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{project.name}</h1>
            {canEdit && (
              <button
                className={styles.editIconBtn}
                onClick={() => setIsEditingProject(true)}
                title="Edit Project Details"
              >
                ✏️
              </button>
            )}
            <div className={styles.titleDivider} />
            <MemberList
              members={project.members || []}
              isOwner={isOwner}
              onRemove={uid => removeMember.mutate(uid)}
            />
            {isOwner && (
              <button className={styles.inviteBtn} onClick={() => setIsInvitingMember(true)}>
                + Invite
              </button>
            )}
          </div>
          {project.description && <p className={styles.desc}>{project.description}</p>}
        </div>
        <div className={styles.badges}>
          <ThemeToggle />
          <span className={styles.role}>{project.my_role}</span>
          {stats && <span className={styles.completion}>{stats.completion_rate}% complete</span>}
          <ExportPdfButton projectId={projectId} />
        </div>
      </header>

      {isEditingProject && (
        <EditProjectModal project={project} onClose={() => setIsEditingProject(false)} />
      )}

      {isInvitingMember && (
        <InviteMemberModal projectId={projectId} onClose={() => setIsInvitingMember(false)} />
      )}

      {stats && (
        <div className={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: '#94a3b8' },
            { label: 'Todo', value: stats.todo, color: '#6366f1' },
            { label: 'In Progress', value: stats.in_progress, color: '#f59e0b' },
            { label: 'Done', value: stats.done, color: '#10b981' },
            { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className={styles.statPill} style={{ borderColor: s.color }}>
              <span className={styles.statVal} style={{ color: s.color }}>
                {s.value}
              </span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <KanbanBoard projectId={projectId} canEdit={canEdit} members={project.members || []} />
    </div>
  )
}
