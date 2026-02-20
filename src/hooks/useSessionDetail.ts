// src/hooks/useSessionDetail.ts
// React Query hook for single session detail: session + questions + answers.
import { useQuery } from '@tanstack/react-query'
import { getSessionWithAnswers } from '../lib/dashboard/sessionDetail'

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => getSessionWithAnswers(sessionId!),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000  // 10 minutes — detail views rarely change after session completes
  })
}
