import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteProjects } from '@/hooks/useProject'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import styles from './InfiniteProjectList.module.css'

export function InfiniteProjectList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteProjects()

  // ─── Intersection Observer sentinel ──────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten pages → flat array of projects
  const projects = data?.pages.flatMap(p => p.data) ?? []

  if (isLoading)
    return (
      <>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </>
    )

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {projects.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.name}>{p.name}</h3>
              <span className={styles.role}>{p.my_role}</span>
            </div>
            <p className={styles.desc}>{p.description || 'No description'}</p>
            <div className={styles.meta}>
              <span>📋 {p.tasks_count ?? 0} tasks</span>
              <span>👥 {p.members?.length ?? 1} members</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Sentinel element for infinite scroll ─────── */}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {isFetchingNextPage && (
        <div className={styles.loading}>
          <span className={styles.spinner} />
          Loading more…
        </div>
      )}

      {!hasNextPage && projects.length > 0 && (
        <p className={styles.end}>✅ All projects loaded ({projects.length} total)</p>
      )}
    </div>
  )
}
