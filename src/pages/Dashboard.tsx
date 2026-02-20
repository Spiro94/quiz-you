// src/pages/Dashboard.tsx
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { FilterBar, type FilterState } from '../components/dashboard/FilterBar'
import { SessionHistoryList } from '../components/dashboard/SessionHistoryList'
import { PerTopicAccuracy } from '../components/dashboard/PerTopicAccuracy'
import { PerformanceTrends } from '../components/dashboard/PerformanceTrends'
import { NextQuizRecommendation } from '../components/dashboard/NextQuizRecommendation'
import { useSessions } from '../hooks/useSessions'

const PAGE_SIZE = 10

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') ?? '0', 10)

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

  function handleFilterChange(newFilters: FilterState) {
    setFilters(newFilters)
    // Reset to page 0 when filters change
    setSearchParams({ page: '0' })
  }

  function handleNextPage() {
    setSearchParams({ page: String(page + 1) })
  }

  function handlePrevPage() {
    if (page > 0) setSearchParams({ page: String(page - 1) })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Your Sessions</h1>
          <Link
            to="/quiz/setup"
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            New Quiz
          </Link>
        </div>

        <FilterBar onFilterChange={handleFilterChange} />

        <SessionHistoryList
          sessions={sessions}
          isLoading={isLoading}
          page={page}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          pageSize={PAGE_SIZE}
        />

        {/* Analytics section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-bold text-foreground">Analytics</h2>
          <NextQuizRecommendation />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerTopicAccuracy />
            <PerformanceTrends />
          </div>
        </div>
      </main>
    </div>
  )
}
