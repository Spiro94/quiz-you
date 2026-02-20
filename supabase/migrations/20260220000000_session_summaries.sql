-- Migration: 20260220000000_session_summaries.sql
-- Phase 4 Plan 01: Denormalized session_summaries table for fast dashboard reads.
-- Populated by completeQuizSession() (explicit insert, not trigger) per Phase 4 research recommendation.
-- Avoids JOIN overhead on dashboard queries — stores aggregated session outcome at completion time.

CREATE TABLE IF NOT EXISTS public.session_summaries (
  session_id        UUID PRIMARY KEY REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topics            TEXT[] NOT NULL DEFAULT '{}',
  difficulty        TEXT NOT NULL,
  question_count    INT NOT NULL,
  final_score       INT NOT NULL,
  num_completed     INT NOT NULL,
  num_skipped       INT NOT NULL,
  duration_seconds  INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only see their own summaries
ALTER TABLE public.session_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session summaries"
  ON public.session_summaries FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own session summaries"
  ON public.session_summaries FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes for fast dashboard filtering
CREATE INDEX idx_session_summaries_user_id ON public.session_summaries(user_id);
CREATE INDEX idx_session_summaries_user_created ON public.session_summaries(user_id, created_at DESC);
