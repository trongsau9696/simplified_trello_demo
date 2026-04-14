import { useThemeStore } from '@/store/themeStore'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <button
      className={styles.btn}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
