// src/lib/dashboard/sessions.ts
// Data access for session history. Queries the denormalized session_summaries table.
// Uses server-side pagination (Supabase .range()) and filter clauses.
import { supabase } from '../supabase'
import type { SessionSummaryRow } from '../../types/database'

export interface FilterOptions {
  page?: number
  pageSize?: number
  dateRange?: { start?: string; end?: string }  // ISO date strings (YYYY-MM-DD)
  topics?: string[]
}

export async function getSessionList(
  userId: string,
  options: FilterOptions = {}
): Promise<SessionSummaryRow[]> {
  const { page = 0, pageSize = 10, dateRange, topics } = options

  let query = supabase
    .from('session_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (dateRange?.start) {
    query = query.gte('created_at', dateRange.start)
  }
  if (dateRange?.end) {
    // Include the entire end date: append T23:59:59 to make the filter inclusive of the day
    query = query.lte('created_at', `${dateRange.end}T23:59:59`)
  }
  if (topics && topics.length > 0) {
    // Supabase PostgREST: overlaps() checks if topics[] intersects with filter topics
    query = query.overlaps('topics', topics)
  }

  const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`)
  return (data ?? []) as SessionSummaryRow[]
}
