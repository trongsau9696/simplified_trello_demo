import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { t } = useTranslation()
  
  const schema = z.object({
    email: z.string().email(t('auth.errors.invalidEmail')),
    password: z.string().min(8, t('auth.errors.minPassword')),
  })

  type FormData = z.infer<typeof schema>

  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    login(data, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <LanguageSwitcher />
      </div>
      <div className={styles.card}>
        <div className={styles.logo}>🗂️</div>
        <h1 className={styles.title}>{t('auth.welcome')}</h1>
        <p className={styles.subtitle}>{t('auth.signInSubtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" {...register('email')} placeholder="alice@example.com" />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>

          <button type="submit" className={styles.btn} disabled={isLoggingIn}>
            {isLoggingIn ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p className={styles.link}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  )
}
