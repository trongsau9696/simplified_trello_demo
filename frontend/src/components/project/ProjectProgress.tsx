import styles from './ProjectProgress.module.css'

interface Props {
  total: number
  done: number
  color?: string
}

export function ProjectProgress({ total, done, color = 'var(--accent)' }: Props) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.percentage}>{percentage}%</span>
        <span className={styles.label}>Progress</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.bar}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}44`,
          }}
        />
      </div>
    </div>
  )
}
