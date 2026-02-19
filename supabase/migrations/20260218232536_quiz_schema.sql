-- Migration: 002_quiz_schema
-- Creates quiz_sessions, quiz_questions, and topics tables.
-- All tables have RLS enabled per project security policy.
-- RLS policies use (SELECT auth.uid()) subquery form for O(1) evaluation (established in 001).

-- Available topics/technologies for quiz configuration
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('language', 'framework', 'tool', 'concept')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed topics: minimum viable list for launch
INSERT INTO public.topics (name, category) VALUES
  ('JavaScript', 'language'),
  ('TypeScript', 'language'),
  ('Python', 'language'),
  ('Dart', 'language'),
  ('Go', 'language'),
  ('Rust', 'language'),
  ('Java', 'language'),
  ('SQL', 'language'),
  ('React', 'framework'),
  ('Flutter', 'framework'),
  ('Node.js', 'framework'),
  ('Next.js', 'framework'),
  ('System Design', 'concept'),
  ('Data Structures', 'concept'),
  ('Algorithms', 'concept')
ON CONFLICT (name) DO NOTHING;

-- NOTE: topics is public read — no RLS needed (it's reference data, not user data)

-- Quiz session configuration and tracking
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topics TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'normal', 'advanced')),
  question_types TEXT[] NOT NULL,
  question_count INT NOT NULL CHECK (question_count IN (5, 10, 20)),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Users can only access their own sessions
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions_select_own"
  ON public.quiz_sessions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "quiz_sessions_insert_own"
  ON public.quiz_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "quiz_sessions_update_own"
  ON public.quiz_sessions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Index for fast session lookups by user
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON public.quiz_sessions(status);

-- LLM-generated questions for a session (immutable after creation)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coding', 'theoretical')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'normal', 'advanced')),
  topic TEXT NOT NULL,
  expected_format TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_index)
);

-- RLS: Users can only access questions in their own sessions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions_select_own"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

CREATE POLICY "quiz_questions_insert_own"
  ON public.quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quiz_sessions
    WHERE id = session_id
    AND user_id = (SELECT auth.uid())
  ));

-- Index for fast question retrieval by session
CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON public.quiz_questions(session_id);

-- Auto-update updated_at trigger for quiz_sessions
CREATE OR REPLACE FUNCTION public.handle_quiz_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_quiz_session_updated ON public.quiz_sessions;
CREATE TRIGGER on_quiz_session_updated
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_session_updated_at();
