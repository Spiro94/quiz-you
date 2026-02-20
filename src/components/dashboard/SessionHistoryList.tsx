// src/components/dashboard/SessionHistoryList.tsx
// Paginated session history list. Reads session_summaries rows.
// DASH-01: shows recent sessions | DASH-02: date/topics/score/duration | DASH-07: filtered via FilterBar
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { getScoreColor } from '../../lib/dashboard/recommendations'
import type { SessionSummaryRow } from '../../types/database'

interface SessionHistoryListProps {
  sessions: SessionSummaryRow[]
  isLoading: boolean
  page: number
  onNextPage: () => void
  onPrevPage: () => void
  pageSize?: number
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

export function SessionHistoryList({
  sessions,
  isLoading,
  page,
  onNextPage,
  onPrevPage,
  pageSize = 10
}: SessionHistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-subtle rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0 && page === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg border border-border">
        <p className="text-muted-foreground text-lg">No sessions yet.</p>
        <p className="text-muted-foreground text-sm mt-1">
          Complete a quiz to see your history here.
        </p>
        <Link
          to="/quiz/setup"
          className="mt-4 inline-block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Start a Quiz
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map(row => (
        <div
          key={row.session_id}
          className="block bg-surface rounded-lg border border-border px-4 py-3 hover:border-border-strong hover:bg-subtle transition-all"
        >
          <div className="flex items-center justify-between">
            <Link to={`/session/${row.session_id}/summary`} className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {row.topics.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(row.created_at), 'MMM d, yyyy · h:mm a')}
                {' · '}
                {row.difficulty.charAt(0).toUpperCase() + row.difficulty.slice(1)}
                {' · '}
                {formatDuration(row.duration_seconds)}
              </p>
            </Link>
            <div className="ml-4 flex-shrink-0 flex items-center gap-3">
              <Link
                to={`/session/${row.session_id}/detail`}
                className="text-xs text-accent hover:underline"
              >
                Details
              </Link>
              <div className="text-right">
                <span className={`text-2xl font-bold ${getScoreColor(row.final_score)}`}>
                  {row.final_score}
                </span>
                <p className="text-xs text-muted-foreground">
                  {row.num_completed}&#10003; {row.num_skipped}&#8631;
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onPrevPage}
          disabled={page === 0}
          className="px-3 py-1.5 text-sm border border-border rounded bg-surface hover:bg-subtle text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          &larr; Previous
        </button>
        <span className="text-xs text-muted-foreground">Page {page + 1}</span>
        <button
          onClick={onNextPage}
          disabled={sessions.length < pageSize}
          className="px-3 py-1.5 text-sm border border-border rounded bg-surface hover:bg-subtle text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  )
}
