# Quiz You

## What This Is

Quiz You is a web app that helps developers practice technical interviews with realistic, LLM-driven questions. Users select topics (programming languages/tech stacks like JavaScript, Dart, Flutter), difficulty levels (beginner, normal, advanced), and question types (coding problems, theoretical questions, or both), then work through a customized quiz session. The LLM generates questions, evaluates answers with detailed feedback and model solutions, and scores performance. Developers use it to prepare for job interviews or internal company assessments, and companies use it for skill development when team members are between client projects.

## Core Value

Developers can practice interviews in their spare time with realistic LLM-driven questions so they can be ready for any job interview or internal assessments at the company they're currently working at.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User authentication with email and password
- [ ] User can start a new interview session
- [ ] User can select one or more programming languages/technologies
- [ ] User can select difficulty level (beginner, normal, advanced)
- [ ] User can select one or more question types (coding problems, theoretical)
- [ ] User can toggle optional difficulty progression (questions get harder as they answer correctly)
- [ ] LLM generates interview questions based on user selections
- [ ] User can view one question at a time
- [ ] User can submit answers (text or code)
- [ ] User can skip questions (marked as 0% score)
- [ ] LLM evaluates answer and provides detailed feedback
- [ ] LLM provides model answer for reference
- [ ] User receives a score based on answer evaluation
- [ ] User sees quiz summary after completion
- [ ] User can view dashboard with recent session history (list format)
- [ ] System suggests harder difficulty level based on performance in subsequent sessions
- [ ] User data persists across sessions
- [ ] LLM provider is switchable (Claude, OpenAI, etc.)

### Out of Scope

- Time limits per question — deferred to v1.1
- Hints during quiz — deferred to v1.1
- OAuth authentication — email/password sufficient for v1
- Social features (leaderboards, comparing with others) — deferred to v2
- Mobile app — web-first for v1

## Context

Quiz You is being built with existing code already in place (Vite config, ESLint setup). The app targets all developers — from juniors preparing for their first interviews to senior engineers preparing for specialized roles. Beyond individual use, companies can deploy this internally for skill development during bench time, making it valuable as both a personal practice tool and an enterprise capability.

The LLM is central to the product: it must generate realistic, varied questions and provide thoughtful, helpful evaluations. The "structured" aspect comes from the base prompt that ensures consistency in question quality and evaluation depth.

## Constraints

- **Tech Stack (Locked)**: React, Vite, Tailwind CSS, Supabase (authentication + database)
- **Authentication**: Supabase email/password only for v1
- **Database**: Supabase for user profiles, session history, and scores
- **LLM**: Must support multiple providers (switchable)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| LLM provider switchable | Different orgs/users may have preferences or existing agreements | — Pending |
| Difficulty progression optional | Some users want adaptive difficulty, others prefer control | — Pending |
| Skip questions with 0% | Allows users to move past stuck questions without abandoning session | — Pending |
| No OAuth for v1 | Email/password simpler to implement, OAuth can be added later | — Pending |
| Supabase for both auth and DB | Integrated solution reduces complexity, good for MVP | — Pending |

---
*Last updated: 2025-02-17 after initialization*
