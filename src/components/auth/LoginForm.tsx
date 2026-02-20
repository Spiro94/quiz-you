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
    // quiz-you.pen authCard: bg-surface, cornerRadius 16, border border, padding 40, gap 24, layout vertical
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border flex flex-col"
      style={{ borderRadius: '16px', padding: '40px', gap: '24px' }}
    >
      {/* authCardHeader: layout vertical, gap 6 */}
      <div className="flex flex-col" style={{ gap: '6px' }}>
        {/* authTitle: "Welcome back", Inter 700, fontSize 26, letterSpacing -0.5, fill foreground */}
        <h1
          className="text-foreground"
          style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px' }}
        >
          Welcome back
        </h1>
        {/* authSubtitle: "Sign in to your Quiz You account", fontSize 14, fontWeight normal, fill muted-foreground */}
        <p className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 400 }}>
          Sign in to your Quiz You account
        </p>
      </div>

      {/* authFields: layout vertical, gap 16 */}
      <div className="flex flex-col" style={{ gap: '16px' }}>
        {/* emailFieldGroup: layout vertical, gap 6 */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          {/* emailLabel: "Email", fontSize 12, fontWeight 500, fill muted-foreground */}
          <label htmlFor="email" className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 500 }}>
            Email
          </label>
          {/* emailInput: h-44, bg-elevated, border border, cornerRadius 8, padding [0, 14], fontSize 14 */}
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-border bg-elevated text-foreground placeholder:text-placeholder focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            style={{ height: '44px', borderRadius: '8px', padding: '0 14px', fontSize: '14px' }}
            placeholder="you@example.com"
          />
        </div>

        {/* passFieldGroup: layout vertical, gap 6 */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          {/* passHeader: passLabel left + forgotLink right */}
          <div className="flex items-center justify-between">
            {/* passLabel: "Password", fontSize 12, fontWeight 500, fill muted-foreground */}
            <label htmlFor="password" className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 500 }}>
              Password
            </label>
            {/* forgotLink: "Forgot password?", fontSize 12, fontWeight normal, fill primary */}
            <span className="text-primary" style={{ fontSize: '12px', fontWeight: 400 }}>
              Forgot password?
            </span>
          </div>
          {/* passInput: h-44, bg-elevated, border border, cornerRadius 8, padding [0, 14], fontSize 14 */}
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-border bg-elevated text-foreground placeholder:text-placeholder focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            style={{ height: '44px', borderRadius: '8px', padding: '0 14px', fontSize: '14px' }}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="px-4 py-3 rounded-lg bg-error-muted text-error text-sm border border-error">
          {error}
        </p>
      )}

      {/* signInBtn: Primary button ref (ymtQv), fill primary, h-40, label "Sign In", fontSize 14, fontWeight 600 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-foreground font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
        style={{ height: '40px', fontSize: '14px', borderRadius: '8px' }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* authFooter: gap 4, justifyContent center, alignItems center */}
      {/* authFooterText: "Don't have an account?", fontSize 14, fontWeight normal, fill muted-foreground */}
      {/* authFooterLink: "Create one", fontSize 14, fontWeight 600, fill primary */}
      <div className="flex items-center justify-center" style={{ gap: '4px' }}>
        <span className="text-muted-foreground" style={{ fontSize: '14px', fontWeight: 400 }}>
          Don&apos;t have an account?
        </span>
        <Link to="/signup" className="text-primary font-semibold" style={{ fontSize: '14px' }}>
          Create one
        </Link>
      </div>
    </form>
  )
}
