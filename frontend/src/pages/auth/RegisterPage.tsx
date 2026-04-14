import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialRole = searchParams.get('role') === 'Vendor' ? 'Vendor' : 'Customer'

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: initialRole as 'Customer' | 'Vendor',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (!strongPasswordPattern.test(form.password)) {
      setError('Password must be 12+ characters and include uppercase, lowercase, number, and symbol.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate(form.role === 'Vendor' ? '/vendor' : '/customer', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: string[] } } }
      setError(e?.response?.data?.message ?? e?.response?.data?.errors?.join(', ') ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-16">
      <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand mb-4">
            <svg className="w-5 h-5 text-text-inverse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create your account</h1>
          <p className="text-sm text-text-muted mt-1.5">Join the Serviqo marketplace</p>
        </div>

        <div className="bg-surface-2 border border-border rounded-xl p-7 shadow-card">
          <div className="flex rounded-lg border border-border overflow-hidden mb-6">
            {(['Customer', 'Vendor'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role }))}
                className={[
                  'flex-1 py-2.5 text-sm font-medium transition-colors',
                  form.role === role ? 'bg-brand text-text-inverse' : 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
                ].join(' ')}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
            <Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="12+ chars, upper, lower, number, symbol"
              hint="Minimum 12 characters with uppercase, lowercase, number, and symbol"
              required
            />

            {error && (
              <motion.p className="text-sm text-status-error bg-red-500/8 border border-red-500/20 rounded-md px-3 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
              Create account as {form.role}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
