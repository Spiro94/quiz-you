-- Migration: 001_users_table
-- Creates the public.users profile table linked to Supabase Auth users.
-- auth.users is managed by Supabase Auth; this table stores app-level profile data.
-- RLS is MANDATORY on all tables per project security policy.

-- Create users profile table
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security — REQUIRED. Without this every row is publicly readable.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can only see their own profile row
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Policy: authenticated users can insert only their own profile row
-- WITH CHECK ensures user_id matches auth.uid() — prevents spoofing other users
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy: authenticated users can update only their own profile row
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Index on id for RLS policy lookups — REQUIRED to prevent full table scans.
-- Without this, every query does O(n) scan: 10k rows = ~50ms, 1M rows = timeout.
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Function: auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: invoke handle_updated_at before any UPDATE on public.users
DROP TRIGGER IF EXISTS on_users_updated ON public.users;
CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function: auto-create profile row in public.users when new auth user signs up
-- Called by trigger on auth.users INSERT — eliminates need for client-side profile creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: invoke handle_new_auth_user after new auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
