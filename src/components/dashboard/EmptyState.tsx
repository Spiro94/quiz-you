// src/components/dashboard/EmptyState.tsx
import { Link } from 'react-router-dom'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          No sessions yet
        </h2>
        <p className="text-muted-foreground mb-8">
          Start a quiz session to practice interview questions. Your sessions,
          scores, and progress will appear here after you complete your first quiz.
        </p>
        <Link
          to="/quiz/setup"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
        >
          Start a quiz session
        </Link>
      </div>
    </div>
  )
}
