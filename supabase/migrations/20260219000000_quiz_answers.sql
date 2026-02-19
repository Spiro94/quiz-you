-- Migration: quiz_answers
-- Stores user answers and LLM evaluation results.
-- Atomic pattern: insert with status='pending_evaluation' first, then update with score/feedback.
-- If evaluation fails, row stays 'pending_evaluation' — visible in Phase 4 history as incomplete.

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE SET NULL,
  question_index INT NOT NULL,        -- denormalized for fast Phase 4 history queries
  user_answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_evaluation'
    CHECK (status IN ('pending_evaluation', 'completed', 'skipped', 'evaluation_failed')),
  score INT CHECK (score >= 0 AND score <= 100),
  reasoning TEXT,                     -- G-Eval chain-of-thought (for debugging)
  feedback TEXT,
  model_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_index) -- one answer per question per session
);

-- RLS: Users can only access answers in their own sessions
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_answers_select_own"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

CREATE POLICY "quiz_answers_insert_own"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

CREATE POLICY "quiz_answers_update_own"
  ON public.quiz_answers FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

-- Indexes for Phase 4 dashboard queries
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON public.quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_status ON public.quiz_answers(status);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.handle_quiz_answer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_quiz_answer_updated ON public.quiz_answers;
CREATE TRIGGER on_quiz_answer_updated
  BEFORE UPDATE ON public.quiz_answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_answer_updated_at();
