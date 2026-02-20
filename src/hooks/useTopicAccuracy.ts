// src/hooks/useTopicAccuracy.ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getTopicAccuracy } from '../lib/dashboard/aggregations'

export function useTopicAccuracy() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['topic-accuracy', user?.id],
    queryFn: () => getTopicAccuracy(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000  // 10 minutes
  })
}
