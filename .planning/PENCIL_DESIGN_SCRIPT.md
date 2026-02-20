# Quiz You — Claude Pencil Design Script

This script instructs Claude Pencil to create a complete design system and all key screens for **Quiz You**, a developer-focused technical interview practice web app.

---

## STEP 1 — Get Style Guide

Call `get_style_guide_tags` first, then request a style guide using tags that match this product:
- `dark`, `developer`, `saas`, `dashboard`, `minimal`, `modern`, `webapp`, `tech`, `professional`, `focus`

---

## STEP 2 — Design System

Create a **Design System frame** on the canvas containing the following tokens and components.

### 2.1 Color Variables

Define these as global variables using `set_variables`:

```
colors:
  brand-primary:       #7C3AED   (violet-600 — main CTA, active states)
  brand-primary-hover: #6D28D9   (violet-700 — hover)
  brand-primary-light: #EDE9FE   (violet-100 — light backgrounds)
  brand-accent:        #06B6D4   (cyan-500 — secondary highlights, code)

  bg-base:     #0A0A0F   (near-black — page background)
  bg-surface:  #13131A   (dark card/panel background)
  bg-elevated: #1C1C27   (elevated surface, modals, dropdowns)
  bg-subtle:   #22222F   (hover states, subtle fills)

  border-default: #2E2E3F   (default border)
  border-strong:  #3D3D52   (focus rings, active)

  text-primary:   #F4F4F6   (headings, primary text)
  text-secondary: #A1A1B5   (muted labels, descriptions)
  text-placeholder: #6B6B80 (input placeholders)
  text-inverse:   #0A0A0F   (text on brand-colored buttons)

  success: #10B981   (correct answers, positive feedback)
  warning: #F59E0B   (partial credit, cautionary)
  error:   #EF4444   (wrong answers, errors)
  info:    #3B82F6   (informational feedback)

  code-bg:     #111118   (code block background)
  code-border: #252535   (code block border)
```

### 2.2 Typography Variables

```
typography:
  font-sans: "Inter", system-ui, sans-serif
  font-mono: "JetBrains Mono", "Fira Code", monospace

  size-xs:   11px
  size-sm:   13px
  size-base: 15px
  size-md:   17px
  size-lg:   20px
  size-xl:   24px
  size-2xl:  30px
  size-3xl:  38px

  weight-regular: 400
  weight-medium:  500
  weight-semibold: 600
  weight-bold:    700
```

### 2.3 Spacing & Radius

```
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px

radius:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
```

### 2.4 Reusable Components to Create

Build these as **reusable components** (set `reusable: true`):

---

#### A. Button — Primary
- Frame: `height=40`, `padding-x=16`, `radius=md`, `fill=brand-primary`
- Text: `font-sans`, `size-sm`, `weight-semibold`, `color=text-inverse`
- Hover fill: `brand-primary-hover`
- Variants: Primary / Secondary (outlined, border=brand-primary, fill=transparent, text=brand-primary) / Ghost (no border, fill=transparent, text=text-secondary)
- Size variants: sm (`height=32`), md (`height=40`), lg (`height=48`)

#### B. Input Field
- Frame: `width=fill_container`, `height=42`, `border=1px solid border-default`, `radius=md`, `fill=bg-elevated`
- Text: `size-sm`, `color=text-primary`
- Placeholder text: `color=text-placeholder`
- Focus state: `border-color=brand-primary`, ring glow (2px violet shadow)
- Error state: `border-color=error`, subtle red bg tint
- Label above: `size-xs`, `weight-medium`, `color=text-secondary`, margin-bottom=6px

#### C. Badge / Tag
- Frame: `height=24`, `padding-x=10`, `radius=full`, `fill=bg-subtle`
- Text: `size-xs`, `weight-medium`, `color=text-secondary`
- Variants:
  - Default: gray
  - Violet: `fill=brand-primary/20`, `text-color=#C4B5FD`
  - Cyan: `fill=brand-accent/20`, `text-color=#67E8F9`
  - Success: `fill=success/20`, `text-color=#6EE7B7`
  - Warning: `fill=warning/20`, `text-color=#FCD34D`
  - Error: `fill=error/20`, `text-color=#FCA5A5`

#### D. Card
- Frame: `width=fill_container`, `padding=24`, `radius=lg`, `fill=bg-surface`, `border=1px solid border-default`
- Hover state: `border-color=border-strong`, subtle glow

#### E. Select Chip (topic/technology selector)
- Frame: `height=36`, `padding-x=14`, `radius=md`, `fill=bg-elevated`, `border=1px solid border-default`
- Text: `size-sm`, `color=text-secondary`
- Selected state: `fill=brand-primary`, `border-color=brand-primary`, `text-color=white`
- Icon slot on left (optional)

#### F. Progress Bar
- Container: `height=4`, `radius=full`, `fill=bg-subtle`, `width=fill_container`
- Track: `height=4`, `radius=full`, `fill=brand-primary`

#### G. Difficulty Selector
- Three options: Beginner / Normal / Advanced
- Styled as segmented control: grouped `height=40`, `border=1px solid border-default`, `radius=md`
- Active segment: `fill=brand-primary`, `text-color=white`
- Colors: Beginner=success, Normal=warning, Advanced=error (when active)

#### H. Score Ring
- Circle (donut chart style): `size=80x80`
- Outer ring: stroke `bg-subtle`, `stroke-width=8`
- Score ring: stroke `brand-primary`, animated sweep
- Center text: large score %, `weight-bold`

#### I. Toast / Alert Banner
- Frame: `width=fill_container`, `padding=12 16`, `radius=md`, `border-left=4px`
- Variants: success (green), warning (amber), error (red), info (blue)
- Icon + title + optional body text

#### J. Code Block
- Frame: `width=fill_container`, `padding=16`, `radius=md`, `fill=code-bg`, `border=1px solid code-border`
- Top bar: language label (badge) + copy icon button
- Content: monospace font, `size-sm`, line-height=1.7

#### K. Textarea (for answers)
- Frame: `width=fill_container`, `min-height=160`, `padding=14`, `radius=md`, `fill=bg-elevated`, `border=1px solid border-default`
- Monospace for code answers; sans-serif for theoretical
- Character/word count bottom-right

#### L. Navigation Sidebar (Dashboard)
- Frame: `width=240`, `height=fill_container`, `fill=bg-surface`, `border-right=1px solid border-default`
- Logo area top: `height=64`, `padding-x=20`
- Nav items: icon + label, `height=40`, `padding-x=16`, `radius=md` — active state: `fill=brand-primary/15`, `text-color=brand-primary`, left accent bar

#### M. Top App Bar
- Frame: `width=fill_container`, `height=56`, `fill=bg-surface`, `border-bottom=1px solid border-default`, `padding-x=24`
- Logo left, nav center (optional), user avatar + menu right

---

## STEP 3 — Screens to Design

Create each of the following screens at **1440×900** (desktop) in a separate frame.

---

### Screen 1 — Login Page

**Layout**: Centered auth card on dark background with subtle gradient radial glow from center.

**Left panel (hidden on mobile, ~50% width on desktop)**:
- Brand logo top-left
- Large headline: "Ace Your Next Interview" (`size-3xl`, `weight-bold`, `text-primary`)
- Subtext: "Practice with AI-powered questions tailored to your stack and level." (`size-md`, `text-secondary`)
- Three feature callouts with icons:
  - ⚡ "Realistic LLM-generated questions"
  - 🎯 "Instant answer evaluation & scoring"
  - 📈 "Track your progress over time"
- Technology chip row: JavaScript, TypeScript, Python, React, Flutter…

**Right panel (~50% width, centered vertically)**:
- Card (`bg-surface`, `radius=xl`, `padding=40`, `border=border-default`)
- Title: "Sign in to Quiz You" (`size-xl`, `weight-bold`)
- Subtitle: "Enter your credentials to continue" (`size-sm`, `text-secondary`)
- Email input + Password input (with show/hide toggle)
- "Forgot password?" link (right-aligned, `size-xs`, violet)
- Primary button: "Sign In" (full width, lg)
- Divider: "—— or ——"
- Secondary link: "Don't have an account? **Create one**"
- Error alert slot (red banner, hidden by default)

**Background**: `bg-base` with subtle radial gradient `brand-primary/8` glow at center.

---

### Screen 2 — Signup Page

Same split layout as Login.

**Right panel**:
- Title: "Create your account"
- Full Name input + Email input + Password input (with strength meter bar below)
- Password requirements: small checklist (8+ chars, one number, one special char)
- Primary button: "Create Account" (full width, lg)
- "Already have an account? **Sign in**"

---

### Screen 3 — Dashboard

**Layout**: Sidebar nav + main content area.

**Sidebar (240px)**:
- Logo: "QuizYou" wordmark with violet dot
- Nav items: Dashboard (active), New Quiz, History, Settings
- User avatar + name + email at bottom, with logout button

**Main Content Area**:
- Header: "Dashboard" title + "Start New Quiz" primary button (top-right)
- Stats row (3 cards side by side):
  - Total Sessions: large number + "quizzes taken"
  - Avg Score: percentage + progress ring
  - Best Streak: number + "correct in a row"
- Recent Sessions section:
  - Section heading: "Recent Sessions" + "View All" link
  - Table/list: each row = topic tags | difficulty badge | score % | date | "Review" button
  - Show 5 most recent rows
  - Empty state (if no sessions): centered illustration placeholder + "No sessions yet" + "Start your first quiz" CTA button

---

### Screen 4 — New Quiz Setup (Step 1 of 3: Topics)

**Layout**: Centered wizard card on dark background. Wizard header with step progress.

**Wizard Header**:
- Steps: "1. Topics" → "2. Options" → "3. Review" — connected dots/steps with active step highlighted violet

**Card content**:
- Heading: "What do you want to practice?" (`size-xl`, `weight-bold`)
- Subtext: "Select one or more technologies"
- Search input: "Search technologies…" (with search icon)
- Technology grid (4 columns of Select Chips):
  - JavaScript, TypeScript, Python, Go, Rust, Java, C#, C++
  - React, Vue, Angular, Next.js, Node.js, Express
  - Flutter, Dart, Swift, Kotlin
  - PostgreSQL, MongoDB, Redis
  - Docker, Kubernetes, AWS, GraphQL
- Selected count indicator: "3 selected" badge
- "Continue →" primary button (bottom-right, disabled until ≥1 selected)
- "Cancel" ghost button (bottom-left)

---

### Screen 5 — New Quiz Setup (Step 2 of 3: Options)

**Card content**:
- Heading: "Configure your session"

- **Difficulty Level** section:
  - Label: "Difficulty Level"
  - Segmented control: Beginner | Normal | Advanced (colored)
  - Description text below: adapts to selected level

- **Question Types** section:
  - Label: "Question Types" (select all that apply)
  - Two toggle chips: "📝 Theoretical" | "💻 Coding Problems"

- **Number of Questions** section:
  - Label: "Questions per session"
  - Stepper: − [10] + (min 5, max 30)

- **Difficulty Progression** section:
  - Toggle switch: "Enable adaptive difficulty"
  - Description: "Questions get progressively harder as you answer correctly"

- "← Back" ghost button + "Continue →" primary button

---

### Screen 6 — New Quiz Setup (Step 3 of 3: Review & Start)

**Card content**:
- Heading: "Ready to start?"
- Summary card:
  - Topics: chip list of selected technologies
  - Difficulty: badge
  - Question types: list
  - Questions: number
  - Adaptive: on/off
- "🚀 Start Quiz" primary button (large, full width, violet with slight glow)
- "← Edit" ghost button

---

### Screen 7 — Quiz Question View

**Layout**: Full page, focused mode. Minimal header, large content area.

**Top Bar**:
- Left: "QuizYou" micro logo
- Center: Question progress: "Question 3 / 10" + progress bar
- Right: Score so far: "72%" + timer placeholder (if added later) + "Skip" ghost button

**Question Panel** (left 55%):
- Topic badge + Difficulty badge (top of panel)
- Question text: large, clear — `size-lg`, `weight-semibold`, `text-primary`, line-height=1.6
- For coding questions: code block showing the problem context / starter code (syntax highlighted style)

**Answer Panel** (right 45%):
- Heading: "Your Answer"
- Tab toggle: "Text Explanation" | "Code" (switches between regular textarea and code textarea)
- Textarea or code editor area (tall, monospace for code tab)
- Bottom row: word count + "Submit Answer" primary button + "Skip Question" ghost button (→ skip marks 0%)

---

### Screen 8 — Answer Feedback View

**Layout**: Same split layout as Question View, but showing feedback.

**Left: Question recap**:
- Question text (same as before, slightly dimmer)
- User's submitted answer (shown in a distinct bordered box)

**Right: AI Feedback Panel**:
- Score badge: large score ring (0–100%) with color (green/yellow/red)
- Feedback heading: "Feedback" with success/warning/error icon
- Feedback text: detailed paragraph (`text-secondary`, `size-sm`, good line-height)
- Model Answer section:
  - Heading: "Model Answer"
  - Collapsible card with model answer text or code block
- Bottom row: "Next Question →" primary button + "← Review" ghost

---

### Screen 9 — Quiz Summary / Results

**Layout**: Centered content with large score display at top.

**Hero section**:
- Large score ring (120px) with overall % in center
- Grade label below ring: "Great Job!" / "Keep Practicing" / "Excellent!" based on score range
- Subtext: session metadata (topics, difficulty, date)

**Score Breakdown** (horizontal cards row):
- Correct: green badge count
- Partial: yellow badge count
- Skipped: gray badge count
- Wrong: red badge count

**Question-by-Question Review**:
- Expandable list: each item = question number + short question preview + score chip
- Click to expand: shows question, user answer, feedback summary

**Next Steps section**:
- "Based on your score, we suggest: **Advanced** difficulty next time" (if score > 80%)
- Buttons: "Start New Quiz" (primary) | "Go to Dashboard" (secondary)

---

### Screen 10 — Empty Dashboard State

**Layout**: Same dashboard layout (sidebar + main).

**Main content — empty state**:
- Centered illustration (abstract geometric brain/network icon in violet tones, ~200px)
- Heading: "Ready to level up?" (`size-2xl`, `weight-bold`)
- Subtext: "Start your first quiz session and begin tracking your progress." (`text-secondary`)
- "🚀 Start Your First Quiz" large primary button
- Three small feature highlights below:
  - "LLM-generated questions"
  - "Instant scoring & feedback"
  - "Session history & trends"

---

## STEP 4 — Design Validation

After creating all screens, call `get_screenshot` on each screen and verify:

- [ ] Color contrast is accessible (text on dark backgrounds is clearly readable)
- [ ] Consistent spacing and alignment across all screens
- [ ] Brand violet (`#7C3AED`) is applied consistently as the primary action color
- [ ] Dark mode is cohesive — no jarring light areas
- [ ] Typography hierarchy is clear (headings > body > labels)
- [ ] Interactive elements (buttons, inputs, chips) are visually distinct and recognizable
- [ ] Empty states feel polished and guide the user toward action
- [ ] Code blocks / textareas look appropriate for developer users
- [ ] The quiz flow (Screens 4 → 5 → 6 → 7 → 8 → 9) feels like a coherent journey

---

## Notes for Implementation

- All components should map 1:1 to Tailwind CSS classes for the React codebase
- The dark color palette aligns with: `bg-zinc-950`, `bg-zinc-900`, `bg-zinc-800`; accent = Tailwind `violet-600`
- Font: use Inter (available via Google Fonts / Fontsource) + JetBrains Mono for code
- The Select Chips on Screen 4 will be implemented as toggleable buttons with `useState`
- The wizard step indicator can use React Router's location state
- The code editor textarea can use CodeMirror or Monaco Editor for v1.1; v1 uses styled `<textarea>`
