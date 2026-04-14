import { Link } from 'react-router-dom'
import { useProjects } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useProjects()
  const { logout } = useAuth()

  const projects = data?.data ?? []

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>🗂️ Trello</div>
        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navItem} aria-current="page">📊 Dashboard</Link>
          <Link to="/projects"  className={styles.navItem}>📁 Projects</Link>
        </nav>
        <div className={styles.userSection}>
          <ThemeToggle />
          <span className={styles.avatar}>{user?.name[0]}</span>
          <div>
            <p className={styles.userName}>{user?.name}</p>
            <button onClick={() => logout()} className={styles.logoutBtn}>Sign out</button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <p className={styles.greeting}>Welcome back, {user?.name} 👋</p>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{projects.length}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>
              {projects.reduce((a, p) => a + (p.tasks_count ?? 0), 0)}
            </span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
        </section>

        <section className={styles.projects}>
          <div className={styles.sectionHeader}>
            <h2>My Projects</h2>
            <Link to="/projects" className={styles.viewAll}>View all →</Link>
          </div>

          {isLoading ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>
              <p>📁 No projects yet.</p>
              <Link to="/projects" className={styles.createBtn}>Create your first project</Link>
            </div>
          ) : (
            <div className={styles.projectGrid}>
              {projects.slice(0, 6).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className={styles.projectCard}>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className={styles.meta}>
                    <span>🏷 {p.my_role}</span>
                    <span>📋 {p.tasks_count} tasks</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
