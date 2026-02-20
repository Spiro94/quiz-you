---
phase: 05-ui-redesign-with-quiz-you-pen
plan: 01
subsystem: ui
tags: [tailwind-v4, css-variables, design-tokens, dark-mode, auth, quiz-you-pen]

# Dependency graph
requires:
  - phase: 01-auth-and-foundation
    provides: Login, Signup, DashboardHeader, LoginForm, SignupForm, LogoutButton components

provides:
  - Tailwind v4 @theme block with 21 color tokens + 2 font tokens from quiz-you.pen variables section
  - Dark mode auth flow — Login page (two-column), Signup page (two-column), LoginForm, SignupForm, LogoutButton, DashboardHeader
  - Token utility classes available app-wide (bg-primary, text-foreground, border-border, bg-surface, etc.)
  - "a { color: inherit }" base reset ensuring Tailwind utility classes override browser default link colors
  - Left panel branding pattern (680px bg-surface, logo+headline+features) for reuse in auth screens

affects:
  - 05-02 (quiz screens — consumes same token set from src/index.css)
  - 05-03 (dashboard screens — consumes same token set from src/index.css)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 @theme block in src/index.css — the only token registration method in v4; no tailwind.config.ts"
    - "Google Fonts @import URL placed BEFORE @import tailwindcss so @layer base body styles resolve the custom font"
    - "a { color: inherit } in @layer base — browser default <a> color competes at equal specificity; inherit lets Tailwind utilities win"
    - "Auth card pattern: bg-surface border border-border borderRadius 16px padding 40px gap 24px (from quiz-you.pen authCard)"
    - "Input pattern: h-44 bg-elevated border border-border borderRadius 8px padding [0, 14px] — from quiz-you.pen emailInput/passInput"
    - "Feature icon box pattern: 32x32 bg-primary-muted borderRadius 8px icon 16x16 text-primary — from quiz-you.pen feat1Icon/feat2Icon/feat3Icon"
    - "All inline style= used for precise pixel values from .pen spec; Tailwind classes used for token colors and layout"

key-files:
  created: []
  modified:
    - src/index.css
    - src/pages/Login.tsx
    - src/pages/Signup.tsx
    - src/components/auth/LoginForm.tsx
    - src/components/auth/SignupForm.tsx
    - src/components/auth/LogoutButton.tsx
    - src/components/dashboard/DashboardHeader.tsx

key-decisions:
  - "Tailwind v4 @theme in CSS vs tailwind.config.ts — v4 uses @theme blocks in CSS only; tailwind.config.ts is v3 syntax and does not exist in this project"
  - "Google Fonts import before @import tailwindcss — if placed after, the custom font is unavailable when Tailwind processes @layer base"
  - "a { color: inherit } base reset — browser default <a> blue (#0000EE) has equal specificity to Tailwind utilities, causing text-primary/text-accent to lose"
  - "quiz-you.pen has no Screen/Signup — Signup page mirrors Screen/Login left panel exactly; auth card adapts for signup context"
  - "Auth card heading/subtitle live inside LoginForm/SignupForm (not in page wrapper) — matches quiz-you.pen authCard layout where title is part of the card"
  - "Footer link 'Create one' uses text-primary (purple) not text-accent (cyan) — quiz-you.pen authFooterLink uses $--primary"
  - "Left panel width is fixed 680px (lg:w-[680px]), not flex-1 — matches quiz-you.pen loginLeft explicit width: 680"
  - "style= used for exact pixel values (fontSize 44, padding 64px 72px, gap 32px) — Tailwind v4 lacks direct equivalents for these .pen-spec values"

patterns-established:
  - "Token-first: always use token utility classes (bg-primary, text-foreground) never hardcode hex values in components"
  - "Auth card: bg-surface border border-border style={borderRadius:16, padding:40, gap:24} layout vertical"
  - "Input field: h-44 bg-elevated border border-border borderRadius 8px padding [0,14px] with placeholder:text-placeholder"
  - "Primary button: h-40 bg-primary text-foreground font-semibold hover:bg-primary-hover disabled:opacity-50"
  - "Error state: bg-error-muted text-error border border-error rounded-lg"
  - "Ghost button: text-muted-foreground hover:text-foreground hover:bg-subtle"

requirements-completed: [UI-REDESIGN-AUTH]

# Metrics
duration: 45min
completed: 2026-02-20
---

# Phase 5 Plan 01: Token Extraction and Auth Flow Redesign Summary

**21 quiz-you.pen color tokens + 2 font tokens registered in Tailwind v4 @theme; all auth screens (Login two-column, Signup two-column, LoginForm, SignupForm, LogoutButton, DashboardHeader) rebuilt to match quiz-you.pen Screen/Login design exactly — checkpoint APPROVED**

## Performance

- **Duration:** ~45 min (including checkpoint iterations)
- **Started:** 2026-02-20T18:40:33Z
- **Completed:** 2026-02-20 (checkpoint approved)
- **Tasks:** 2/2 auto tasks + 1 human-verify checkpoint APPROVED
- **Files modified:** 7
- **Commits:** 8

## Accomplishments

- `src/index.css` has Tailwind v4 `@theme` block with all 21 `--color-*` variables and `--font-sans`/`--font-mono` from quiz-you.pen, available app-wide as token utility classes
- Login page rebuilt as two-column layout matching quiz-you.pen `Screen/Login` exactly: 680px `bg-surface` left panel with logo, 44px headline, subtext, 3 feature rows; right panel with auth card
- Signup page mirrors the Login left panel exactly (quiz-you.pen has no Screen/Signup); auth card adapted for signup context
- LoginForm rebuilt to match quiz-you.pen `authCard` spec: 16px radius, 40px padding, 24px gap, "Welcome back" title 26px 700, "Sign in to your Quiz You account" subtitle, "Forgot password?" inline with password label, "Sign In" button, "Create one" footer link
- SignupForm follows same authCard spec with signup content: "Create your account", "Create account" button, "Sign in" footer link
- LogoutButton: `text-muted-foreground hover:text-foreground hover:bg-subtle` ghost pattern
- DashboardHeader: `bg-surface border-border text-foreground text-muted-foreground`
- `a { color: inherit }` base reset added to fix browser default link color overriding Tailwind token utilities
- `npm run build` passes cleanly on final state (TypeScript + Vite)

## Task Commits

| # | Commit | Type | Description |
|---|--------|------|-------------|
| 1 | `bd6b7b5` | chore | Inject quiz-you.pen design tokens into Tailwind v4 CSS config |
| 2 | `3c2bd39` | feat | Restyle auth flow components to dark design system (initial pass) |
| 3 | `e4c7433` | fix | Add `a { color: inherit }` base reset — browser link color specificity fix |
| 4 | `46aec1f` | feat | Add two-column layout to Login page (initial version) |
| 5 | `0f28f04` | feat | Match Login page and LoginForm exactly to quiz-you.pen Screen/Login design |
| 6 | `395c1c6` | feat | Match Signup page and SignupForm to quiz-you.pen design system |

Note: Commits `b96a27a` (interim SUMMARY) and the final docs commit are planning metadata, not feature work.

## Files Created/Modified

- `src/index.css` — `@import url(Google Fonts)` → `@import "tailwindcss"` → `@theme { 21 color tokens + 2 font tokens }` → `@layer base { body, a resets }`
- `src/pages/Login.tsx` — Two-column layout: 680px `bg-surface` left panel (logo, 44px headline, subtext, 3 feature rows) + right panel with `<LoginForm />`
- `src/pages/Signup.tsx` — Identical two-column layout to Login.tsx (mirrors quiz-you.pen Screen/Login left panel); right panel with `<SignupForm />`
- `src/components/auth/LoginForm.tsx` — auth card matching quiz-you.pen authCard: "Welcome back" h1, "Sign in to your Quiz You account", inputs h-44, "Sign In" button, "Create one" link text-primary
- `src/components/auth/SignupForm.tsx` — same authCard spec: "Create your account" h1, "Create account" button, "Sign in" link text-primary
- `src/components/auth/LogoutButton.tsx` — ghost button: `text-muted-foreground hover:text-foreground hover:bg-subtle`
- `src/components/dashboard/DashboardHeader.tsx` — `bg-surface border-border`, `text-foreground` app name, `text-muted-foreground` email

## Token Inventory — All 21 Color Tokens + 2 Font Tokens (quiz-you.pen variables section)

| Token (CSS var) | Tailwind utility | Hex value | Role |
|---|---|---|---|
| `--color-primary` | `bg-primary` / `text-primary` | `#7C3AED` | Purple CTA buttons, active states |
| `--color-primary-hover` | `bg-primary-hover` | `#6D28D9` | Button hover (darker purple) |
| `--color-primary-muted` | `bg-primary-muted` | `#3B1F6A` | Icon boxes, subtle purple fills |
| `--color-accent` | `text-accent` | `#06B6D4` | Cyan — reserved for future use |
| `--color-background` | `bg-background` | `#0A0A0F` | Near-black page background |
| `--color-surface` | `bg-surface` | `#13131A` | Cards, panels, sidebar |
| `--color-elevated` | `bg-elevated` | `#1C1C27` | Inputs, slightly elevated elements |
| `--color-subtle` | `bg-subtle` | `#22222F` | Hover/focus background tint |
| `--color-foreground` | `text-foreground` | `#F4F4F6` | Primary text (near-white) |
| `--color-muted-foreground` | `text-muted-foreground` | `#A1A1B5` | Secondary/label text |
| `--color-placeholder` | `text-placeholder` | `#6B6B80` | Input placeholder text |
| `--color-border` | `border-border` | `#2E2E3F` | Standard border |
| `--color-border-strong` | `border-border-strong` | `#3D3D52` | Emphasized border |
| `--color-code-bg` | `bg-code-bg` | `#111118` | Code block background |
| `--color-code-border` | `border-code-border` | `#252535` | Code block border |
| `--color-success` | `text-success` | `#10B981` | Green success state |
| `--color-success-muted` | `bg-success-muted` | `#064E3B` | Green success background |
| `--color-warning` | `text-warning` | `#F59E0B` | Amber warning state |
| `--color-warning-muted` | `bg-warning-muted` | `#451A03` | Amber warning background |
| `--color-error` | `text-error` | `#EF4444` | Red error state |
| `--color-error-muted` | `bg-error-muted` | `#450A0A` | Red error background |
| `--font-sans` | `font-sans` | Inter, system stack | Body font (Google Fonts) |
| `--font-mono` | `font-mono` | JetBrains Mono, monospace | Code font (Google Fonts) |

## Left Panel Design (quiz-you.pen Screen/Login `loginLeft`)

The quiz-you.pen `Screen/Login` frame defines the left panel as:

**Container:** `loginLeft` — width 680px, height fill_container, `fill: $--surface`, layout vertical, `gap: 32`, `padding: [64, 72]`, `justifyContent: center`

**Logo row (`loginLeftLogo`):**
- `loginLogoMark`: 32×32, `fill: $--primary` (#7C3AED), `cornerRadius: 8`, centered, contains Lucide `zap` icon 18×18, `fill: $--foreground`
- `loginLogoText`: "QuizYou" (no space), Inter fontWeight 700, fontSize 20, `fill: $--foreground`

**Headline (`loginHeadline`):**
- Content: "Ace Your Next\nTechnical Interview" (two lines, capital A/Y/N/T/I)
- fontSize 44, fontWeight 800, `fill: $--foreground`, letterSpacing -1, lineHeight 1.15

**Subtext (`loginSubtext`):**
- Content: "Practice with AI-generated questions tailored to your tech stack and skill level. Get instant feedback and improve your scores."
- fontSize 16, fontWeight normal, `fill: $--muted-foreground`, lineHeight 1.6

**Features (`loginFeatures`):** layout vertical, gap 16. Three rows, each gap 12, alignItems center:
1. Icon `zap` (32×32 `bg-primary-muted`) — "Realistic LLM-generated questions for any stack"
2. Icon `target` (32×32 `bg-primary-muted`) — "Instant answer evaluation with detailed feedback"
3. Icon `trending-up` (32×32 `bg-primary-muted`) — "Track progress and improve difficulty over time"

Each icon box: 32×32, `fill: $--primary-muted` (#3B1F6A), `cornerRadius: 8`, icon 16×16 `fill: $--primary`
Feature text: fontSize 14, fontWeight normal, `fill: $--muted-foreground`

**Note on Signup:** quiz-you.pen has no `Screen/Signup`. The file defines 7 screens: Login, Dashboard, Quiz-Setup-1, Quiz-Setup-2, Question, Feedback, Summary. Signup mirrors the Login left panel identically.

## Auth Card Design (quiz-you.pen `authCard` in `loginRight`)

**Container:** `authCard` — width 440, `fill: $--surface`, `cornerRadius: 16`, border `$--border`, layout vertical, `gap: 24`, `padding: 40`

**Header (`authCardHeader`):** layout vertical, gap 6
- `authTitle`: "Welcome back", Inter 700, fontSize 26, letterSpacing -0.5, `fill: $--foreground`
- `authSubtitle`: "Sign in to your Quiz You account", Inter normal, fontSize 14, `fill: $--muted-foreground`

**Fields (`authFields`):** layout vertical, gap 16
- Email group: label "Email" 12px 500, input h-44 `bg-elevated` `border-border` cornerRadius 8 padding [0, 14]
- Password group: `passHeader` row with "Password" label left + "Forgot password?" (`fill: $--primary`) right; input same spec

**Button (`signInBtn`):** ref to Primary button component — h-40, `fill: $--primary`, label "Sign In", fontSize 14, fontWeight 600, `fill: $--foreground` (not white)

**Footer (`authFooter`):** gap 4, justifyContent center
- `authFooterText`: "Don't have an account?", fontSize 14, normal, `fill: $--muted-foreground`
- `authFooterLink`: "Create one", fontSize 14, fontWeight 600, `fill: $--primary` (purple — NOT cyan)

## Decisions Made

**Why `@theme` in CSS, not `tailwind.config.ts`:**
Tailwind v4 dropped the JavaScript config file approach entirely. In v4, all design token customization happens via `@theme` blocks in CSS. The `tailwind.config.ts` approach is v3 syntax and will be silently ignored in a v4 project. This project uses `@tailwindcss/vite` 4.2.0 — no config file exists or is needed.

**Why `a { color: inherit }` in `@layer base`:**
Browser default `<a>` elements have a user-agent stylesheet color (`#0000EE` in Chrome, `#551A8B` for visited). This rule has specificity [0,0,1] — the same as Tailwind's utility classes like `text-primary` or `text-accent`. When both target the same element, the cascade resolves to whichever appears last in the stylesheet. By adding `a { color: inherit }` in `@layer base` (lowest layer), the Tailwind utility class always wins when applied directly to an `<a>` or React `<Link>`.

**Why `style=` for precise pixel values alongside Tailwind classes:**
quiz-you.pen specifies exact pixel values (fontSize 44, padding 64px 72px, gap 32px, letterSpacing -1px). Tailwind v4's scale doesn't have direct equivalents for all of these (e.g., `text-[44px]` works but `gap-[32px]` and `letter-spacing-[-1px]` are less readable). Using `style=` for the .pen-spec pixel values keeps the intent explicit and traceable back to the design file, while Tailwind classes handle all token colors and standard layout.

**Why no Screen/Signup adaptation was needed:**
The Signup page shares the same emotional context as Login (entry point to the product). Reusing the exact same left panel branding is consistent with common product design patterns (one product pitch, two auth paths).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added `a { color: inherit }` base reset**
- **Found during:** Checkpoint human-verify (link color wrong)
- **Issue:** Browser default `<a>` color (#0000EE) had equal CSS specificity to Tailwind utility classes, preventing `text-primary` and `text-accent` from applying to `<Link>` components
- **Fix:** Added `a { color: inherit; text-decoration: none; }` to `@layer base` in `src/index.css`
- **Files modified:** `src/index.css`
- **Committed in:** `e4c7433`

**2. [Rule 2 - Missing] Added two-column Login layout**
- **Found during:** Checkpoint human-verify (left panel missing)
- **Issue:** Plan 05-01 specified single-column centered layout; quiz-you.pen `Screen/Login` defines a two-column layout with 680px branding left panel
- **Fix:** Rebuilt `src/pages/Login.tsx` as two-column with left panel matching `loginLeft` spec exactly
- **Files modified:** `src/pages/Login.tsx`
- **Committed in:** `46aec1f`, then refined in `0f28f04`

**3. [Rule 2 - Missing] Iterative refinement of Login left panel to exactly match quiz-you.pen**
- **Found during:** Second checkpoint review (text content and styles wrong)
- **Issue:** First two-column version used generic marketing copy and wrong icon/spacing values; needed exact .pen spec values
- **Fix:** Read `Screen/Login` frame in quiz-you.pen, extracted exact content strings, font sizes, weights, spacings; applied to Login.tsx and LoginForm.tsx
- **Files modified:** `src/pages/Login.tsx`, `src/components/auth/LoginForm.tsx`
- **Committed in:** `0f28f04`

**4. [Rule 2 - Missing] Updated Signup to match Login two-column pattern**
- **Found during:** Third checkpoint review (Signup page not updated)
- **Issue:** Signup page still used single-column centered layout; no Screen/Signup in quiz-you.pen requires mirror of Login layout
- **Fix:** Rebuilt `src/pages/Signup.tsx` and `src/components/auth/SignupForm.tsx` mirroring Login's structure with signup-specific content
- **Files modified:** `src/pages/Signup.tsx`, `src/components/auth/SignupForm.tsx`
- **Committed in:** `395c1c6`

---

**Total deviations:** 4 auto-fixed (all were missing functionality discovered during checkpoint verification)
**Impact:** All fixes necessary to match quiz-you.pen design intent. No scope creep — all changes are within the auth flow defined in this plan.

## Verification Results

- `npm run build` passes cleanly on all intermediate and final states
- Checkpoint human-verify: **APPROVED** — auth flow dark mode matches quiz-you.pen design
- Left panel verified: two-column layout, correct headline/subtext/features
- Auth card verified: correct title, subtitle, input labels, button, footer link
- Login and logout functionality verified working end-to-end

## Next Phase Readiness

- Token system (`src/index.css` @theme) is complete and tested — Plans 05-02 and 05-03 can consume all 23 tokens immediately
- Auth card pattern established — quiz screens (05-02) and dashboard screens (05-03) can reference `authCard` sizing and spacing patterns
- Left panel branding pattern documented — can be referenced if other auth-adjacent screens need branding panels
- No blockers for 05-02

---
*Phase: 05-ui-redesign-with-quiz-you-pen*
*Completed: 2026-02-20*
