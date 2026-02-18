// src/pages/Dashboard.tsx
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { EmptyState } from '../components/dashboard/EmptyState'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      <main className="flex-1">
        <EmptyState />
      </main>
    </div>
  )
}
