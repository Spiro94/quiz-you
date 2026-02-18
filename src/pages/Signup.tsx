// src/pages/Signup.tsx
import { SignupForm } from '../components/auth/SignupForm'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your Quiz You account</h1>
          <p className="text-gray-600">Start preparing for your next interview today</p>
        </div>
        <SignupForm />
      </div>
    </main>
  )
}
