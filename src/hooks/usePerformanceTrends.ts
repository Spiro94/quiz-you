// src/hooks/usePerformanceTrends.ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getPerformanceTrends } from '../lib/dashboard/aggregations'

export function usePerformanceTrends() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['performance-trends', user?.id],
    queryFn: () => getPerformanceTrends(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000  // 10 minutes
  })
}
