import { Link } from 'react-router-dom'
import { useProjects } from '@/hooks/useProject'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ProjectProgress } from '@/components/project/ProjectProgress'
import { TaskStatusChart } from '@/components/dashboard/TaskStatusChart'
import { useTranslation } from 'react-i18next'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useProjects()
  const { logout } = useAuth()

  const projects = data?.data ?? []

  // Aggregate stats for chart
  const stats = projects.reduce(
    (acc, p) => ({
      todo: acc.todo + (p.todo_tasks_count || 0),
      in_progress: acc.in_progress + (p.in_progress_tasks_count || 0),
      done: acc.done + (p.done_tasks_count || 0),
    }),
    { todo: 0, in_progress: 0, done: 0 }
  )

  const totalTasks = stats.todo + stats.in_progress + stats.done

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>T</div>
          <span>Simplified Trello</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <label>{t('nav.menu')}</label>
            <Link to="/dashboard" className={styles.navItem} aria-current="page">
              <span className={styles.navIcon}>📊</span> {t('nav.dashboard')}
            </Link>
            <Link to="/projects" className={styles.navItem}>
              <span className={styles.navIcon}>📁</span> {t('nav.projects')}
            </Link>
          </div>

          <div className={styles.navGroup}>
            <label>{t('nav.settings')}</label>
            <div className={styles.navItemInner}>
              <div className={styles.navItemLabelGroup}>
                <span className={styles.navIcon}>🌐</span>{' '}
                {t('kanban.allStatuses').split(' ')[1] === 'Statuses' ? 'Language' : 'Ngôn ngữ'}
              </div>
              <LanguageSwitcher />
            </div>
            <div className={styles.navItemInner}>
              <div className={styles.navItemLabelGroup}>
                <span className={styles.navIcon}>🌓</span> {t('nav.appearance')}
              </div>
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
            <span>🚪</span> {t('nav.signOut')}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>{t('dashboard.welcome', { name: (user?.name || 'User').split(' ')[0] })} 👏</h1>
            <p>{t('dashboard.summary', { projects: projects.length, tasks: totalTasks })}</p>
            <div className={styles.heroActions}>
              <Link to="/projects" className={styles.primaryBtn}>
                {t('dashboard.manageProjects')}
              </Link>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.miniStat}>
              <span className={styles.miniVal}>{projects.length}</span>
              <span className={styles.miniLbl}>{t('dashboard.stats.projects')}</span>
            </div>
            <div className={styles.miniStatDivider} />
            <div className={styles.miniStat}>
              <span className={styles.miniVal}>{totalTasks}</span>
              <span className={styles.miniLbl}>{t('dashboard.stats.tasks')}</span>
            </div>
          </div>
        </header>

        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <h2>{t('dashboard.activeProjects')}</h2>
              <p>{t('dashboard.recentActivity')}</p>
            </div>
            <Link to="/projects" className={styles.viewAll}>
              {t('dashboard.viewAll')}
            </Link>
          </div>

          <div className={styles.dashboardGrid}>
            <TaskStatusChart data={stats} />

            <div className={styles.welcomeStats}>
              <h3>{t('dashboard.summaryWidget.title')}</h3>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: '#6366f1' }} />
                <span>
                  {t('dashboard.summaryWidget.todo')}: {stats.todo}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: '#f59e0b' }} />
                <span>
                  {t('dashboard.summaryWidget.inProgress')}: {stats.in_progress}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: '#10b981' }} />
                <span>
                  {t('dashboard.summaryWidget.done')}: {stats.done}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.projectGrid}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📂</div>
              <h3>No projects yet</h3>
              <p>Start your journey by creating your first workspace.</p>
              <Link to="/projects" className={styles.createBtn}>
                Create Project
              </Link>
            </div>
          ) : (
            <div className={styles.projectGrid}>
              {projects.slice(0, 6).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className={styles.projectCard}>
                  <div className={styles.cardHeader}>
                    <span className={`${styles.roleBadge} ${styles[p.my_role || 'viewer']}`}>
                      {p.my_role || 'viewer'}
                    </span>
                    <span className={styles.taskCount}>{p.tasks_count} tasks</span>
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
                          <span key={m.id} style={{ zIndex: 10 - idx }} title={m.name}>
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
