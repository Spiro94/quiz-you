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
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0 && page === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">No sessions yet.</p>
        <p className="text-gray-400 text-sm mt-1">
          Complete a quiz to see your history here.
        </p>
        <Link
          to="/quiz/setup"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
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
          className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <Link to={`/session/${row.session_id}/summary`} className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {row.topics.join(', ')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
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
                className="text-xs text-blue-600 hover:underline"
              >
                Details
              </Link>
              <div className="text-right">
                <span className={`text-2xl font-bold ${getScoreColor(row.final_score)}`}>
                  {row.final_score}
                </span>
                <p className="text-xs text-gray-400">
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
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &larr; Previous
        </button>
        <span className="text-xs text-gray-400">Page {page + 1}</span>
        <button
          onClick={onNextPage}
          disabled={sessions.length < pageSize}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  )
}
