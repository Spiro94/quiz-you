// src/pages/Dashboard.tsx
import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FilterBar, type FilterState } from '../components/dashboard/FilterBar'
import { PerTopicAccuracy } from '../components/dashboard/PerTopicAccuracy'
import { PerformanceTrends } from '../components/dashboard/PerformanceTrends'
import { NextQuizRecommendation } from '../components/dashboard/NextQuizRecommendation'
import { useSessions } from '../hooks/useSessions'
import { usePerformanceTrends } from '../hooks/usePerformanceTrends'
import { useTopicAccuracy } from '../hooks/useTopicAccuracy'
import { useAuth } from '../context/AuthContext'
import { getScoreColor } from '../lib/dashboard/recommendations'
import { format } from 'date-fns'

const PAGE_SIZE = 10

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  normal: 'Intermediate',
  advanced: 'Advanced'
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const [loggingOut, setLoggingOut] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    selectedTopics: [],
    dateStart: '',
    dateEnd: ''
  })

  const { data: sessions = [], isLoading } = useSessions({
    page,
    pageSize: PAGE_SIZE,
    topics: filters.selectedTopics.length > 0 ? filters.selectedTopics : undefined,
    dateRange:
      filters.dateStart || filters.dateEnd
        ? { start: filters.dateStart || undefined, end: filters.dateEnd || undefined }
        : undefined
  })

  // Stats for the stat cards — computed from the unfiltered first page
  const { data: allSessions = [] } = useSessions({ page: 0, pageSize: 50 })
  const { data: trends = [] } = usePerformanceTrends()
  const { data: topics = [] } = useTopicAccuracy()

  const totalSessions = allSessions.length
  const avgScore = allSessions.length > 0
    ? Math.round(allSessions.reduce((sum, s) => sum + s.final_score, 0) / allSessions.length)
    : 0
  const totalAnswered = allSessions.reduce((sum, s) => sum + s.num_completed, 0)

  function handleFilterChange(newFilters: FilterState) {
    setFilters(newFilters)
    setSearchParams({ page: '0' })
  }

  function handleNextPage() {
    setSearchParams({ page: String(page + 1) })
  }

  function handlePrevPage() {
    if (page > 0) setSearchParams({ page: String(page - 1) })
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch {
      setLoggingOut(false)
    }
  }

  // Derive user initials from email
  const userEmail = user?.email ?? ''
  const userInitial = userEmail.charAt(0).toUpperCase()
  const userName = userEmail.split('@')[0]

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Top: Logo + Nav */}
        <div className="flex-1 flex flex-col gap-2 px-5 pt-6 pb-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 h-10 px-1 mb-1">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-foreground font-bold text-[17px]">QuizYou</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5 pt-2">
            {/* Dashboard — active */}
            <div className="flex items-center gap-3 h-10 px-3 bg-primary-muted rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span className="text-primary font-semibold text-sm">Dashboard</span>
            </div>
            {/* New Quiz */}
            <Link to="/quiz/setup" className="flex items-center gap-3 h-10 px-3 rounded-lg hover:bg-subtle transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span className="text-muted-foreground group-hover:text-foreground font-medium text-sm">New Quiz</span>
            </Link>
            {/* History */}
            <div className="flex items-center gap-3 h-10 px-3 rounded-lg hover:bg-subtle transition-colors group cursor-default">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground flex-shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
              </svg>
              <span className="text-muted-foreground group-hover:text-foreground font-medium text-sm">History</span>
            </div>
          </nav>
        </div>

        {/* Bottom: User section */}
        <div className="flex flex-col gap-2 px-5 pb-5">
          <div className="h-px bg-border" />
          <div className="flex items-center gap-2.5 py-2">
            <div className="w-8 h-8 bg-primary-muted rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-[13px] font-bold">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-[13px] font-semibold truncate">{userName}</p>
              <p className="text-muted-foreground text-[11px] truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Log out"
              className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-7 px-10 py-9">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
            </div>
            <Link
              to="/quiz/setup"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 h-10 flex items-center rounded-lg transition-colors"
            >
              Start New Quiz
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-[36px] font-bold text-foreground tracking-tighter leading-none">{totalSessions}</p>
              <p className="text-xs text-muted-foreground">quizzes taken</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className={`text-[36px] font-bold tracking-tighter leading-none ${totalSessions > 0 ? getScoreColor(avgScore) : 'text-foreground'}`}>{totalSessions > 0 ? `${avgScore}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">across all sessions</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Questions Answered</p>
              <p className="text-[36px] font-bold text-foreground tracking-tighter leading-none">{totalAnswered}</p>
              <p className="text-xs text-muted-foreground">total answered</p>
            </div>
          </div>

          {/* Filter bar (collapsible section) */}
          <FilterBar onFilterChange={handleFilterChange} />

          {/* Sessions table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Recent Sessions</h2>
              <span className="text-sm text-primary font-medium flex items-center gap-1">
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            {/* Column headers */}
            <div className="flex items-center bg-subtle border-b border-border px-6 py-3">
              <div className="w-64 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Topics</div>
              <div className="w-32 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Difficulty</div>
              <div className="w-28 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Score</div>
              <div className="flex-1 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Date</div>
              <div className="w-20" />
            </div>

            {/* Rows */}
            {isLoading ? (
              <div className="px-6 py-8 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-subtle rounded animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 && page === 0 ? (
              <div className="px-6 py-16 flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-sm">No sessions yet. Start a quiz to see your history here.</p>
                <Link to="/quiz/setup" className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Start a Quiz
                </Link>
              </div>
            ) : (
              <>
                {sessions.map(row => (
                  <div key={row.session_id} className="flex items-center px-6 py-3.5 border-b border-border last:border-0 hover:bg-subtle transition-colors">
                    {/* Topics */}
                    <div className="w-64 flex items-center gap-1.5 flex-wrap">
                      {row.topics.slice(0, 2).map(topic => (
                        <span key={topic} className="bg-elevated border border-border text-muted-foreground text-[13px] font-medium px-3 py-1 rounded-lg">
                          {topic}
                        </span>
                      ))}
                      {row.topics.length > 2 && (
                        <span className="text-muted-foreground text-xs">+{row.topics.length - 2}</span>
                      )}
                    </div>
                    {/* Difficulty */}
                    <div className="w-32">
                      <span className="bg-elevated border border-border text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-lg">
                        {DIFFICULTY_LABELS[row.difficulty]}
                      </span>
                    </div>
                    {/* Score */}
                    <div className="w-28">
                      <span className={`text-sm font-semibold ${getScoreColor(row.final_score)}`}>
                        {row.final_score}%
                      </span>
                    </div>
                    {/* Date */}
                    <div className="flex-1 text-sm text-muted-foreground">
                      {format(new Date(row.created_at), 'MMM d, yyyy')}
                    </div>
                    {/* Actions */}
                    <div className="w-20 flex justify-end">
                      <Link
                        to={`/session/${row.session_id}/summary`}
                        className="text-muted-foreground hover:text-foreground hover:bg-elevated border border-border text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    &larr; Previous
                  </button>
                  <span className="text-xs text-muted-foreground">Page {page + 1}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={sessions.length < PAGE_SIZE}
                    className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next &rarr;
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Analytics section */}
          {(trends.length > 0 || topics.length > 0) && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Analytics</h2>
              </div>
              <NextQuizRecommendation />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PerTopicAccuracy />
                <PerformanceTrends />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
