// src/components/dashboard/DashboardHeader.tsx
import { LogoutButton } from '../auth/LogoutButton'
import { useAuth } from '../../context/AuthContext'

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
      <span className="text-xl font-semibold text-foreground">Quiz You</span>
      <div className="flex items-center gap-4">
        {user?.email && (
          <span className="text-sm text-muted-foreground">{user.email}</span>
        )}
        <LogoutButton />
      </div>
    </header>
  )
}
