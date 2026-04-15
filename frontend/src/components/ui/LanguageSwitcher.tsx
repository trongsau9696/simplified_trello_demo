import { useTranslation } from 'react-i18next'
import styles from './LanguageSwitcher.module.css'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('i18nextLng', newLang)
  }

  return (
    <button className={styles.btn} onClick={toggleLanguage} aria-label="Toggle language">
      <span className={styles.icon}>🌐</span>
      <span className={styles.label}>{i18n.language === 'en' ? 'EN' : 'VI'}</span>
    </button>
  )
}
