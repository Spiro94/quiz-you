// src/hooks/useSessions.ts
// React Query hook for paginated, filtered session history from session_summaries.
// Query key includes all filter params — React Query auto-refetches on filter change.
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getSessionList, type FilterOptions } from '../lib/dashboard/sessions'

export function useSessions(options: FilterOptions = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['sessions', user?.id, options.page, options.pageSize, options.dateRange, options.topics],
    queryFn: () => getSessionList(user!.id, options),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
