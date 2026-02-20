// src/pages/Login.tsx
import { LoginForm } from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Log in to Quiz You</h1>
          <p className="text-muted-foreground">Practice technical interviews, one question at a time</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
