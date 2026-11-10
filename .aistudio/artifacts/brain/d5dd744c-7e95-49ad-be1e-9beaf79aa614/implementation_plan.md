# ApexFlow — Minimalist High-Density Project Management Tool

A modern, high-precision web-based project management workspace inspired by Linear's speed and aesthetic restraint, delivering Kanban boards, structured list tables, interactive Gantt roadmaps, and calendar scheduling with complete sprint/cycle execution and issue triage.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 clarification and govern the implementation:

- **Confirmed Aesthetic & UX Direction**: Linear-style high-density design with seamless Dark & Light theme modes, subtle hairline borders, zero static pill tags, and rapid keyboard-friendly navigation.
- **Confirmed Visualization Views**: Four core view modes across all projects and cycles: **Kanban Board** (with drag-and-drop column transitions), **Structured List Table** (high-density inline edit, group-by & multi-sort), **Gantt Timeline Roadmap** (milestones, dependency spans, drag-to-resize duration), and **Calendar View** (monthly and weekly deadline grids).
- **Confirmed Core Workflows**: Sprint & Cycle management (active, planned, completed cycles with automated burndown metrics), Issue Tracker (status, priority, estimate points, assignees, subtasks, activity audit log), Quick Filters & Search, and Team Workload view.
- **Data Persistence**: Instant local persistence with `localStorage`, pre-populated with realistic multi-team engineering & product data, plus one-click JSON export/import and workspace reset.

---

### 1. Overview & Core Concept

- **What It Does**: ApexFlow provides a lightning-fast, distraction-free workspace for teams to plan sprints, track issues, balance workloads, and visualize roadmaps. Every element is interactive with instant feedback—no dead clicks or mock placeholders.
- **Target Audience / Persona**: Engineering leads, product managers, designers, and fast-paced agile teams who demand speed, dense information display, and keyboard-efficient project controls.
- **Key Value**: Replaces bloated, sluggish traditional project tools with an ultra-clean, minimalist interface that feels like a native desktop app with zero layout clutter.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Workspace Navigation & Project Selection**: Switch between workspaces ("Core Platform", "Mobile App v2", "Design System") or create new projects from the collapsible 240px sidebar.
2. **Multi-View Exploration**: Instantly toggle between Kanban, List, Gantt Timeline, and Calendar views for the current project or cycle with zero layout shifts.
3. **Issue Creation & Fast Triage**: Quick issue composer (`C` shortcut or primary button) with title, markdown description, priority level (Urgent, High, Medium, Low, None), status (Backlog, Todo, In Progress, In Review, Done, Canceled), story points, assignee, and tags.
4. **Sprint & Cycle Workflow**: Plan upcoming cycles, activate sprint intervals with start/end dates, track real-time velocity and progress percentage, and roll uncompleted issues into future cycles.
5. **Detail Drawer & Subtasks**: Clicking any task opens a sleek side-inspector drawer with nested checklist subtasks, time estimation, activity audit trail, and quick actions.

#### Visual Identity & Theme
- **Aesthetic Direction**: Linear-inspired precision, utilitarian elegance, crisp typography, and disciplined density. Zero bubbly pills or garish candy badges.
- **Color Palette & Distribution (60-30-10 Rule)**:
  - **60% Neutral Canvas**: Pure dark slate (`#0B0F17`) in dark mode / Crisp cool off-white (`#F8FAFC`) in light mode.
  - **30% Structural Surfaces**: Clean elevated panels (`#111827` dark / `#FFFFFF` light) framed by 1px hairline dividers (`rgba(255,255,255,0.08)` dark / `rgba(0,0,0,0.08)` light).
  - **10% Accent Budget**: High-intent electric indigo (`#6366F1`) and crisp status accents:
    - *In Progress / Nominal*: Electric Blue (`#3B82F6`)
    - *Urgent / Overdue*: Amber/Crimson (`#EF4444` / `#F59E0B`)
    - *Done / Verified*: Emerald (`#10B981`)
- **Typography & Scale**:
  - Primary UI & Display: `Plus Jakarta Sans` for clean, modern legibility.
  - Telemetry & Metrics: Monospace tabular numerals (`JetBrains Mono` / `tabular-nums`) for story points, cycle dates, and issue IDs (`ENG-104`).
  - Strict type scale: Hero titles 22px, section headings 15px, data text 13px, metadata 11px.
- **Zero-Pill Metadata**: Metadata labels (status, assignee, points, dates) rendered as unboxed text with subtle typographic dot separators (`·`).

---

### 3. Key Product Decisions & Trade-Offs

- **Local State Architecture with `localStorage`**:
  - *Chosen Approach*: Reactive in-memory state engine synchronized to `localStorage` with initial seed data representing active sprint cycles and realistic product issues.
  - *Why*: Delivers sub-millisecond response times, zero server cold starts, and full offline persistence.
  - *Alternatives Considered*: Server database (adds latency and setup barriers for standalone preview without adding immediate client value).
- **Four Integrated Native Views**:
  - *Chosen Approach*: Hand-crafted SVG/Canvas-free React components for Kanban, Table, Gantt, and Calendar with shared data binding.
  - *Why*: Eliminates heavy external calendar/gantt library bloat, ensuring 100% theme consistency, accessibility, and smooth drag-and-drop transitions.
- **Dual-Theme Support via Tailwind v4 `@custom-variant dark`**:
  - *Chosen Approach*: First-class dark and light mode toggle with complete semantic pairing on every surface, text, and border.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ApexFlow Applet Layout                          │
│                                                                        │
│  ┌───────────────┐  ┌────────────────────────────────────────────────┐ │
│  │   Sidebar     │  │                  Top Header                    │ │
│  │ (240px wide)  │  │  Breadcrumbs · Search · Quick Filter · Theme   │ │
│  │               │  └────────────────────────────────────────────────┘ │
│  │ · Workspaces  │  ┌────────────────────────────────────────────────┐ │
│  │ · Projects    │  │               View Switcher Bar                │ │
│  │ · Sprints     │  │  [Kanban]   [List Table]   [Gantt]   [Calendar]│ │
│  │ · Workloads   │  └────────────────────────────────────────────────┘ │
│  │ · Team stats  │  ┌────────────────────────────────────────────────┐ │
│  │               │  │              Active View Canvas                │ │
│  │               │  │                                                │ │
│  │               │  │  - Kanban Board (drag-to-status columns)       │ │
│  │               │  │  - List Table (inline edit, sort, bulk actions)│ │
│  │               │  │  - Gantt Roadmap (timeline bars & milestones)  │ │
│  │               │  │  - Calendar Grid (monthly & weekly scheduler)  │ │
│  │               │  └────────────────────────────────────────────────┘ │
│  └───────────────┘  └────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           Issue Detail Inspector & Activity Drawer               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities & Schema
- **Issue**: `id` (`ENG-101`), `title`, `description`, `status` (`backlog`, `todo`, `in_progress`, `in_review`, `done`, `canceled`), `priority` (`urgent`, `high`, `medium`, `low`, `none`), `points` (1, 2, 3, 5, 8), `assigneeId`, `projectId`, `cycleId`, `startDate`, `dueDate`, `subtasks: { id, title, completed }[]`, `tags: string[]`, `createdAt`, `updatedAt`.
- **Project**: `id`, `name`, `key`, `icon`, `description`, `leadMemberId`, `color`.
- **Cycle (Sprint)**: `id`, `number`, `name`, `startDate`, `endDate`, `status` (`planned`, `active`, `completed`), `targetPoints`, `completedPoints`.
- **Member**: `id`, `name`, `avatar`, `role`, `department`, `capacityPoints`.
- **Activity**: `id`, `issueId`, `memberId`, `action`, `details`, `timestamp`.

#### State Operations & Event Handlers
- **Drag-and-Drop Kanban**: Re-order and transition issue status with optimistic local state update.
- **Table Inline Edits**: Instant click-to-edit for priority, assignee, status, and estimation.
- **Gantt Duration Slider**: Interactive drag handles to adjust start and due dates.
- **Calendar Event Relocation**: Click any date cell to add or reschedule tasks.
- **Search & Quick Filters**: Instant fuzzy filtering by title, priority, assignee, project, and cycle.
