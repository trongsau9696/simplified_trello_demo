import styles from './SkeletonLoader.module.css'

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.line} ${styles.title}`} />
      <div className={`${styles.line} ${styles.text}`} />
      <div className={`${styles.line} ${styles.textShort}`} />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className={styles.page}>
      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
    </div>
  )
}
