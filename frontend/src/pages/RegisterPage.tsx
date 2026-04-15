import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { t } = useTranslation()

  const schema = z
    .object({
      name: z.string().min(2, t('auth.errors.required')),
      email: z.string().email(t('auth.errors.invalidEmail')),
      password: z.string().min(8, t('auth.errors.minPassword')),
      password_confirmation: z.string(),
    })
    .refine(d => d.password === d.password_confirmation, {
      message: t('auth.passwordMismatch'),
      path: ['password_confirmation'],
    })

  type FormData = z.infer<typeof schema>

  const { register: registerUser, isRegistering } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    registerUser(data, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <div className={styles.container}>
      <div className={styles.topActions}>
        <LanguageSwitcher />
      </div>
      <div className={styles.card}>
        <div className={styles.logo}>🗂️</div>
        <h1 className={styles.title}>{t('auth.registerTitle')}</h1>
        <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">{t('auth.name')}</label>
            <input id="name" type="text" {...register('name')} placeholder="Alice Smith" />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" {...register('email')} placeholder="alice@example.com" />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" type="password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password_confirmation">{t('auth.confirmPassword')}</label>
            <input
              id="password_confirmation"
              type="password"
              {...register('password_confirmation')}
            />
            {errors.password_confirmation && (
              <span className={styles.error}>{errors.password_confirmation.message}</span>
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={isRegistering}>
            {isRegistering ? t('auth.creating') : t('auth.register')}
          </button>
        </form>

        <p className={styles.link}>
          {t('auth.hasAccount')} <Link to="/login">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  )
}
