// src/pages/Login.tsx
import { LoginForm } from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Log in to Quiz You</h1>
          <p className="text-gray-600">Practice technical interviews, one question at a time</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
