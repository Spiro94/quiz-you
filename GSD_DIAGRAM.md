# GSD Workflow Diagram

## Full Project Lifecycle

```mermaid
flowchart TD
    Start(["Start"])

    subgraph INIT ["1 · Initialize"]
        A["/gsd:new-project\nCreate PROJECT.md + ROADMAP.md"]
        B["/gsd:map-codebase\nAnalyze existing code\n(brownfield only)"]
    end

    subgraph PLAN ["2 · Plan Phase"]
        C["/gsd:discuss-phase N\nArticulate vision"]
        D["/gsd:research-phase N\nEcosystem and library research"]
        E["/gsd:plan-phase N\nWrite PLAN.md"]
        F{"Plan\nvalid?"}
    end

    subgraph EXECUTE ["3 · Execute"]
        G["/gsd:execute-phase N\nRun tasks · atomic commits"]
        H["/gsd:quick 'task'\nLightweight one-off task"]
    end

    subgraph VERIFY ["4 · Verify"]
        I["/gsd:verify-work\nGoal-backward check\nWrite VERIFICATION.md"]
        J{"Phase\ngoal met?"}
    end

    subgraph MILESTONE ["5 · Milestone"]
        K["/gsd:audit-milestone\nVerify all phases complete"]
        L["/gsd:complete-milestone\nArchive + tag release"]
        M["/gsd:new-milestone\nStart next cycle"]
    end

    Start --> A
    A -->|existing project| B
    B --> C
    A -->|new project| C
    C --> D
    D --> E
    E --> F
    F -->|revise| E
    F -->|approved| G
    G --> I
    H --> I
    I --> J
    J -->|gaps found| E
    J -->|done| NextPhase{More phases?}
    NextPhase -->|yes| C
    NextPhase -->|no| K
    K --> L
    L --> M
    M --> C
```

---

## Phase Planning Detail

```mermaid
flowchart LR
    PH["/gsd:plan-phase N"]

    subgraph AGENTS ["Agents spawned in sequence"]
        R1["Researcher\nDocs · libraries · patterns"]
        R2["Planner\nWrites PLAN.md\natom tasks"]
        R3["Checker\nGoal-backward\nvalidation"]
    end

    PH --> R1 --> R2 --> R3
    R3 -->|fail| R2
    R3 -->|pass| OUT["PLAN.md\nready for execution"]
```

---

## Context & State Files

```mermaid
flowchart TD
    Root[".planning/"]

    Root --> PM["PROJECT.md\nBrief · milestone overview"]
    Root --> RM["ROADMAP.md\nPhase list + status"]
    Root --> RES["research/\nResearcher agent output"]
    Root --> CB["codebase/\nMapper agent output"]
    Root --> PH["phase-N/"]

    PH --> PL["PLAN.md\nTask list"]
    PH --> SM["SUMMARY.md\nPost-execution notes"]
    PH --> VR["VERIFICATION.md\nVerification report"]
```

---

## Quick Command Cheatsheet

```
Init         /gsd:new-project  →  /gsd:map-codebase (brownfield)
Plan         /gsd:discuss-phase N  →  /gsd:plan-phase N
Execute      /gsd:execute-phase N  (or /gsd:quick "task")
Verify       /gsd:verify-work
Navigate     /gsd:progress  ·  /gsd:resume-work  ·  /gsd:pause-work
Roadmap      /gsd:add-phase  ·  /gsd:insert-phase  ·  /gsd:remove-phase
Milestone    /gsd:audit-milestone  →  /gsd:complete-milestone  →  /gsd:new-milestone
```
