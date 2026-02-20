// src/pages/Login.tsx
import { LoginForm } from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 bg-surface border-r border-border">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M11 12a2 2 0 100-4 2 2 0 000 4z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-foreground">Quiz You</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            Ace your next<br />
            <span className="text-primary">technical interview</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            Practice with realistic LLM-driven questions tailored to your topics and difficulty level.
          </p>
          <ul className="space-y-3">
            {[
              'AI-evaluated answers with detailed feedback',
              'Track performance across sessions',
              'Covers algorithms, system design, and more',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                <svg className="mt-0.5 shrink-0 text-success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile-only logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M11 12a2 2 0 100-4 2 2 0 000 4z" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground">Quiz You</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue your practice</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
