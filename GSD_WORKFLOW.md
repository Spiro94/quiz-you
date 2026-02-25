# GSD Workflow — Quick Reference

GSD ("Get Shit Done") is a spec-driven, meta-prompting system for Claude Code that fights context rot by enforcing structured planning before any code is written. It spawns fresh subagent contexts for every task, keeping each Claude instance focused and uncontaminated by prior conversation drift.

---

## Core Idea

> Plan first. Execute once. Verify immediately.

Instead of iterating in a single long session that degrades over time, GSD breaks work into **phases**, each with its own research → plan → execute → verify cycle. Every phase runs in a fresh 200k-token context window.

---

## Project Structure

GSD writes all planning artifacts into a `.planning/` directory at the project root:

```
.planning/
  PROJECT.md          # Project brief and milestone overview
  ROADMAP.md          # Phase breakdown with goals and status
  research/           # Output from research agents
  codebase/           # Output from codebase mapper agents
  phase-N/
    PLAN.md           # Task list for the phase
    SUMMARY.md        # Post-execution summary
    VERIFICATION.md   # Verification report
```

---

## Typical Workflow

### 1. Initialize a New Project

```
/gsd:new-project
```

Claude interviews you about your goals, generates `PROJECT.md` and `ROADMAP.md`, and sets up the phase structure. Run once at project start.

For existing codebases first run:

```
/gsd:map-codebase
```

This spawns parallel agents to analyze architecture, tech stack, quality, and concerns — writing structured documents into `.planning/codebase/`.

---

### 2. Plan a Phase

Before touching any code, plan the phase:

```
/gsd:plan-phase <number>
```

This orchestrates three agents in sequence:

1. **Researcher** — gathers ecosystem context, library docs, and relevant patterns
2. **Planner** — writes `PLAN.md` with atomic, sequenced tasks
3. **Checker** — validates the plan against the phase goal (goal-backward analysis)

Optional warm-up steps:

```
/gsd:discuss-phase <number>     # Articulate vision before planning
/gsd:research-phase <number>    # Run research in isolation
```

---

### 3. Execute the Phase

```
/gsd:execute-phase <number>
```

Runs all plans in the phase using wave-based parallelization. Each plan gets a fresh executor agent. Commits are atomic. Deviations are tracked.

For a single lightweight task, skip the heavy planning cycle:

```
/gsd:quick "Add dark mode toggle"
```

---

### 4. Verify the Work

```
/gsd:verify-work
```

A verifier agent checks that the phase goal was actually achieved (not just that tasks were ticked off), then writes `VERIFICATION.md`.

---

### 5. Progress & Navigation

| Command | Purpose |
|---|---|
| `/gsd:progress` | Show current phase status and route to next action |
| `/gsd:resume-work` | Restore context after a break or context reset |
| `/gsd:pause-work` | Save a handoff document before stopping mid-phase |
| `/gsd:check-todos` | List pending todos and select one to work on |

---

### 6. Roadmap Management

| Command | Purpose |
|---|---|
| `/gsd:add-phase <description>` | Append a new phase to the current milestone |
| `/gsd:insert-phase <after> <description>` | Insert an urgent phase as a decimal (e.g., 3.1) between existing ones |
| `/gsd:remove-phase <number>` | Remove a future phase and renumber the rest |

---

### 7. Milestone Lifecycle

```
/gsd:audit-milestone       # Verify milestone completion against original intent
/gsd:complete-milestone    # Archive and prepare for next version
/gsd:new-milestone         # Start the next milestone cycle
```

---

## Modes

| Mode | Behavior |
|---|---|
| **Interactive** (default) | Confirms decisions at key checkpoints |
| **YOLO** | Auto-approves most choices, moves faster |

Switch settings:

```
/gsd:settings
/gsd:set-profile <quality|balanced|budget>
```

---

## Key Principles

- **Fresh contexts** — each agent gets a clean window, no context rot
- **Atomic commits** — every plan step is a separate, reversible commit
- **Goal-backward planning** — plans are validated against phase goals, not just task lists
- **Spec before code** — planning artifacts live in the repo alongside the code

---

## Useful Utility Commands

```
/gsd:help              # Show all available commands
/gsd:health            # Diagnose .planning/ directory issues
/gsd:cleanup           # Archive completed phase directories
/gsd:debug             # Systematic debugging with persistent state
/gsd:add-todo          # Capture an idea as a todo from current context
```

---

## Sources

- [GSD GitHub — gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
- [A GSD System for Claude Code — estebantorr.es](https://estebantorr.es/blog/2026/2026-02-03-a-gsd-system-for-claude-code/)
- [Claude Plugin Hub — GSD Help](https://www.claudepluginhub.com/commands/itsjwill-get-shit-done/commands/gsd/help)
- [Beating Context Rot with GSD — The New Stack](https://thenewstack.io/beating-the-rot-and-getting-stuff-done/)
