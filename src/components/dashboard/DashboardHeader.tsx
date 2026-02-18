// src/components/dashboard/DashboardHeader.tsx
import { LogoutButton } from '../auth/LogoutButton'
import { useAuth } from '../../context/AuthContext'

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <span className="text-xl font-semibold text-gray-900">Quiz You</span>
      <div className="flex items-center gap-4">
        {user?.email && (
          <span className="text-sm text-gray-500">{user.email}</span>
        )}
        <LogoutButton />
      </div>
    </header>
  )
}
