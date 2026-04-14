import { Link } from 'react-router-dom'
import { useProjects } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ProjectProgress } from '@/components/project/ProjectProgress'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useProjects()
  const { logout } = useAuth()

  const projects = data?.data ?? []
  const totalTasks = projects.reduce((a, p) => a + (p.tasks_count ?? 0), 0)

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>T</div>
          <span>Simplified Trello</span>
        </div>
        
        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <label>Menu</label>
            <Link to="/dashboard" className={styles.navItem} aria-current="page">
              <span className={styles.navIcon}>📊</span> Dashboard
            </Link>
            <Link to="/projects"  className={styles.navItem}>
              <span className={styles.navIcon}>📁</span> Projects
            </Link>
          </div>

          <div className={styles.navGroup}>
            <label>Settings</label>
            <div className={styles.navItemInner}>
              <span className={styles.navIcon}>🌓</span> Appearance
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userMain}>
            <span className={styles.avatar}>{user?.name[0]}</span>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button onClick={() => logout()} className={styles.logoutBtn}>
            <span>🚪</span> Sign out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Welcome back, {(user?.name || 'User').split(' ')[0]}! 👋</h1>
            <p>You have {projects.length} active projects and {totalTasks} tasks to manage today.</p>
            <div className={styles.heroActions}>
              <Link to="/projects" className={styles.primaryBtn}>Manage Projects</Link>
            </div>
          </div>
          <div className={styles.heroStats}>
             <div className={styles.miniStat}>
                <span className={styles.miniVal}>{projects.length}</span>
                <span className={styles.miniLbl}>Projects</span>
             </div>
             <div className={styles.miniStatDivider} />
             <div className={styles.miniStat}>
                <span className={styles.miniVal}>{totalTasks}</span>
                <span className={styles.miniLbl}>Tasks</span>
             </div>
          </div>
        </header>

        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <h2>Active Projects</h2>
              <p>Your most recent workspace activity</p>
            </div>
            <Link to="/projects" className={styles.viewAll}>View all projects →</Link>
          </div>

          {isLoading ? (
            <div className={styles.projectGrid}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📂</div>
              <h3>No projects yet</h3>
              <p>Start your journey by creating your first workspace.</p>
              <Link to="/projects" className={styles.createBtn}>Create Project</Link>
            </div>
          ) : (
            <div className={styles.projectGrid}>
              {projects.slice(0, 6).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className={styles.projectCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.roleBadge} ${styles[p.my_role]}`}>
                      {p.my_role}
                    </span>
                    <span className={styles.taskCount}>
                      {p.tasks_count} tasks
                    </span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.description || 'No description provided.'}</p>
                  
                  <ProjectProgress 
                    total={p.tasks_count || 0} 
                    done={p.done_tasks_count || 0} 
                    color={p.my_role === 'owner' ? '#6366f1' : '#10b981'}
                  />

                  <div className={styles.cardFooter}>
                    <div className={styles.members}>
                       <div className={styles.memberDots}>
                          {p.members?.slice(0, 3).map((m, idx) => (
                            <span 
                              key={m.id} 
                              style={{ zIndex: 10 - idx }} 
                              title={m.name}
                            >
                              {m.name[0]}
                            </span>
                          ))}
                          {p.members && p.members.length > 3 && (
                            <span className={styles.moreMembers} style={{ zIndex: 0 }}>
                              +{p.members.length - 3}
                            </span>
                          )}
                       </div>
                    </div>
                    <span className={styles.enterBtn}>Open →</span>
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
