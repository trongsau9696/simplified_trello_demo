import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import styles from './AuthPage.module.css'

const schema = z
  .object({
    name: z.string().min(2, 'At least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
    password_confirmation: z.string(),
  })
  .refine(d => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
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
      <div className={styles.card}>
        <div className={styles.logo}>🗂️</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start managing your projects</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" {...register('name')} placeholder="Alice Smith" />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register('email')} placeholder="alice@example.com" />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" {...register('password')} />
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="password_confirmation">Confirm Password</label>
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
            {isRegistering ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.link}>
          Have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
