// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-surface rounded-lg border border-border p-8">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-elevated text-foreground placeholder:text-placeholder focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-elevated text-foreground placeholder:text-placeholder focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p role="alert" className="px-4 py-3 rounded-lg bg-error-muted text-error text-sm border border-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Logging in...' : 'Log in'}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-accent hover:text-accent font-medium underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
