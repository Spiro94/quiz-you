---
phase: 01-authentication-foundation
plan: "01"
subsystem: database
tags: [supabase, postgres, rls, typescript, react-router-dom, zod]

# Dependency graph
requires: []
provides:
  - Supabase project with live credentials in .env.local
  - public.users table with RLS (SELECT/INSERT/UPDATE policies via auth.uid() = id)
  - idx_users_id index for O(1) RLS lookups
  - Trigger auto-creating public.users profile row on auth.users INSERT
  - TypeScript Database interface (Database, UserRow, UserInsert, UserUpdate)
affects:
  - 01-02-auth-client
  - 01-03-protected-routes
  - all Phase 2 plans (quiz data stored in Supabase)

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js@2.96.0"
    - "react-router-dom@7.13.0"
    - "zod@4.3.6"
  patterns:
    - "RLS-first: every table must have RLS enabled before any data is written"
    - "Trigger-based profile creation: auth.users INSERT triggers public.users INSERT (no client-side profile creation)"
    - "TypeScript-typed Supabase client: createClient<Database>(url, key) pattern established"

key-files:
  created:
    - supabase/migrations/001_users_table.sql
    - src/types/database.ts
    - .env.example
    - .gitignore
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Trigger-based profile creation chosen over client-side: eliminates race condition where signup succeeds but profile INSERT fails, ensuring 100% profile coverage"
  - "RLS policies use (SELECT auth.uid()) subquery syntax (not auth.uid() directly) for performance — Supabase recommendation for avoiding function re-evaluation per row"
  - "idx_users_id index explicitly created despite id being PRIMARY KEY — belt-and-suspenders for RLS lookup performance documentation"
  - "Supabase anon key stored only in .env.local (gitignored); .env.example committed with placeholders"

patterns-established:
  - "Migration naming: NNN_description.sql for ordered, idempotent migrations"
  - "TypeScript schema types: Database interface with Tables/Row/Insert/Update shape — extend for each new table"
  - "Security policy: RLS enabled on every table, policies restricted to auth.uid() = id"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
  - DATA-02

# Metrics
duration: 27min
completed: 2026-02-17
---

# Phase 1 Plan 01: Supabase Backend Setup Summary

**Supabase project wired up with public.users table (RLS + trigger-based profile creation), typed via TypeScript Database interface, and three core npm packages installed**

## Performance

- **Duration:** 27 min
- **Started:** 2026-02-17T19:00:33Z
- **Completed:** 2026-02-17T19:27:45Z
- **Tasks:** 3 (Task 1: human-action checkpoint; Tasks 2-3: automated)
- **Files modified:** 6

## Accomplishments

- Supabase project live at `https://deupebhcvkwihywemmpx.supabase.co` with credentials in `.env.local`
- `public.users` table created with RLS enabled and three policies (SELECT/INSERT/UPDATE) all restricted to `auth.uid() = id`
- Trigger-based auto-profile creation: every `auth.users` INSERT automatically creates the corresponding `public.users` row (no client-side profile creation needed in Plans 02/03)
- `src/types/database.ts` provides full TypeScript typing for Supabase client — `createClient<Database>(url, key)` pattern ready
- `npm run build` passes cleanly with all three packages installed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Supabase project** - human-action checkpoint (no commit — human action)
2. **Task 2: Install dependencies and environment files** - `7d9098c` (chore)
3. **Task 3: Users table migration and TypeScript types** - `f33ef0b` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `supabase/migrations/001_users_table.sql` - Creates public.users table, enables RLS, adds three policies, idx_users_id index, updated_at trigger, and auto-profile-creation trigger
- `src/types/database.ts` - Database interface with Tables/Row/Insert/Update shape + UserRow/UserInsert/UserUpdate aliases
- `.env.example` - Placeholder env vars committed to git (safe, no secrets)
- `.env.local` - Real Supabase credentials (gitignored, not committed)
- `.gitignore` - Created from scratch (project had none); ignores node_modules, dist, .env.local, .DS_Store, logs
- `package.json` / `package-lock.json` - Added @supabase/supabase-js@2.96.0, react-router-dom@7.13.0, zod@4.3.6

## Decisions Made

**Trigger-based profile creation vs client-side INSERT:**
Chose trigger on `auth.users` INSERT calling `handle_new_auth_user()`. This eliminates the race condition in client-side profile creation where the Supabase Auth signup can succeed but the subsequent `public.users` INSERT can fail (network error, RLS misconfiguration, race). With a trigger, the profile row is created atomically inside the same database transaction as the auth user — guaranteed 100% coverage.

**RLS policy syntax `(SELECT auth.uid())` vs `auth.uid()`:**
Used the subquery form per Supabase documentation. The subquery is evaluated once per query rather than once per row, which prevents O(n) function calls on table scans and ensures the planner can use the index.

**Explicit `idx_users_id` index despite `id` being PRIMARY KEY:**
The PRIMARY KEY constraint implicitly creates a unique index on `id`. The explicit `CREATE INDEX IF NOT EXISTS idx_users_id` is redundant from a correctness standpoint but serves as a documented, named index that communicates intent: "this index exists to support RLS lookups." Belt-and-suspenders documentation pattern.

**`react-router-dom` and `zod` installed now (not in a later plan):**
Both are listed as plan dependencies. Installing them now avoids a blocking deviation in Plan 02 (auth client) or Plan 03 (protected routes) and gives TypeScript the full dependency graph for `npm run build` verification from this point forward.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Created .gitignore from scratch**
- **Found during:** Task 2 (environment file setup)
- **Issue:** Project had no `.gitignore` at all. Without it, `.env.local` (containing real Supabase credentials) would be staged and committed on next `git add .`
- **Fix:** Created comprehensive `.gitignore` covering node_modules, dist, `.env.local`/`.env*.local`, editor artifacts, OS files, logs
- **Files modified:** `.gitignore` (new file)
- **Verification:** `git status` does not show `.env.local` as untracked
- **Committed in:** `7d9098c` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — security)
**Impact on plan:** Auto-fix essential to prevent credential exposure. No scope creep.

## Issues Encountered

**npm audit warnings (10 moderate vulnerabilities):** All relate to the vite beta version (`^8.0.0-beta.13`) already pinned in package.json before this plan started. Out of scope per deviation rules — pre-existing, not caused by this plan's changes. Logged to deferred items.

## User Setup Required

**Migration must be applied manually in Supabase Dashboard.**

The SQL migration file is at `supabase/migrations/001_users_table.sql`. To apply it:

1. Go to https://supabase.com/dashboard → your project → SQL Editor → New query
2. Paste the contents of `supabase/migrations/001_users_table.sql`
3. Click Run
4. Verify: "Success. No rows returned" (no errors)

After running, verify in Supabase Dashboard:
- **Table Editor:** `public.users` appears with 5 columns (id, email, display_name, created_at, updated_at)
- **Authentication → Policies:** 3 policies on `public.users` (users_select_own, users_insert_own, users_update_own)
- **Database → Indexes:** `idx_users_id` exists on `public.users`

Also run this SQL to confirm RLS is enabled:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';
```
Expected: `rowsecurity = true`

## Next Phase Readiness

- Supabase project live, credentials available in `.env.local`
- `public.users` table ready (after migration is applied)
- TypeScript types ready for `createClient<Database>()` in Plan 02
- `react-router-dom` and `zod` installed, ready for Plans 02 and 03
- Plan 02 (auth client setup) can proceed immediately after migration is applied

---
*Phase: 01-authentication-foundation*
*Completed: 2026-02-17*
