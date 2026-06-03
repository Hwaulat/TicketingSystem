# SYSTEM PROMPT — INTERNAL TICKETING MANAGEMENT SYSTEM
> Web application for internal company use to manage **Project Requests, Bug Reports, Change Requests (CR), and Discussions** between business teams and IT teams. Multi-role workflow from request submission through development, testing, and final validation.

---

## ROLE & OBJECTIVE

You are a senior full-stack developer + product designer + workflow architect.

Build a **Ticketing Management System** for internal company collaboration between business and IT teams. The system must support:

1. **Structured ticket submission** — type-specific forms (Project Request, Bug, CR, Discussion)
2. **Multi-role workflow handoffs** — Requestor → BA → Developer → QA → BA (final validation) → Completed
3. **Cross-team collaboration** — comments, mentions, file sharing, discussion threads
4. **Full traceability** — every state change, every action logged
5. **Reporting & visibility** — leadership can see ticket flow, SLA, team workload

Design priorities (in order):
1. **Clarity per role** — each user sees only what they need to act on
2. **Frictionless submission** — Requestor flow is simple, fast, guided
3. **Workflow enforcement** — server-side guards on every status transition
4. **Audit-ready** — every action timestamped, attributed, reversible-traceable

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI Components | shadcn/ui — https://ui.shadcn.com/ |
| Icons | lucide-react — https://lucide.dev/ |
| Styling | Tailwind CSS + CSS variables |
| State | Zustand + React Query |
| Auth | NextAuth.js (email + password, JWT httpOnly) |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| File Upload | UploadThing or AWS S3 (PNG, JPG, PDF, DOCX, MP4, ZIP) |
| Real-time | Socket.io (live status updates, comments, mentions) |
| Charts | Recharts |
| Notifications | Sonner toast + in-app bell + email (Resend) |
| Reports | jsPDF + xlsx |
| Rich Text | Tiptap (comments, descriptions) |

**Design tokens:**
- Primary accent: `indigo-600` (#4F46E5)
- Status semantic colors (non-negotiable):
  - Open / New: `slate-500`
  - BA Review: `amber-500`
  - BA Approved: `teal-500`
  - Assigned: `blue-500`
  - In Progress: `cyan-500`
  - Ready for QA: `violet-500`
  - QA Testing: `purple-500`
  - QA Passed: `emerald-500`
  - QA Failed: `red-500`
  - Rework: `orange-500`
  - Hold: `yellow-500`
  - Cancelled: `slate-400`
  - Completed: `green-700`

---

## USER ROLES

| Role | Primary responsibility |
|---|---|
| **Requestor** (Customer) | Submit tickets, monitor own ticket status, respond to BA requests for info |
| **Business Analyst (BA)** | Review submitted tickets, approve/reject, assign to Developer + QA, final validation before completion |
| **Developer** | Accept assigned tickets, develop solution, mark ready for QA, fix QA failures |
| **QA Tester** | Test developer's work, pass or fail with detailed feedback |
| **Project Manager (PM)** | Monitor all tickets, generate reports, manage SLA, assign workload |
| **Admin** | Manage users, roles, master data, system settings |

---

## TICKET WORKFLOW — THE SPINE OF THE SYSTEM

### Workflow varies by ticket type

**A. Project Request workflow (lightweight):**
```
Requestor submits
     ↓
Status: Open
     ↓
BA Review → Approve / Reject / Hold / Request Info
     ↓
Status: Approved (no dev/QA work required — just business approval)
     ↓
Status: Completed
```

**B. Bug Report & Change Request workflow (full development cycle):**
```
Requestor submits
     ↓
Status: Open
     ↓
BA Review → Approve / Reject / Hold / Request Info
     ↓
Status: BA Approved
     ↓
BA assigns Developer + QA
     ↓
Status: Assigned
     ↓
Developer accepts → If reject, back to BA
     ↓
Status: In Progress
     ↓
Developer updates progress (multiple events with %)
     ↓
Developer marks Ready for QA
     ↓
Status: Ready for QA
     ↓
QA picks up & tests
     ↓
Status: QA Testing
     ↓
QA decision → Pass / Fail
   ├── Fail → Status: Rework → back to Developer
   └── Pass → Status: QA Passed
     ↓
BA final validation
     ↓
Status: Completed → notify Requestor
```

**C. Discussion workflow (collaborative, no formal closure required):**
```
Requestor or any user opens discussion
     ↓
Status: Active
     ↓
Threaded conversation, file sharing, @mentions
     ↓
Status: Resolved (when initiator or PM marks complete)
or Archived (auto-archive after N days inactivity)
```

### Role permissions per stage

| Stage | Who can act | Allowed actions |
|---|---|---|
| Open | BA, PM, Admin | Review, Approve, Reject, Hold, Request Info |
| BA Approved | BA, PM | Assign Dev + QA (Bug / CR only) |
| Assigned | Developer | Accept, Reject (with reason) |
| In Progress | Developer | Update progress, Mark Ready for QA, Request help |
| Ready for QA | QA | Pick up for testing |
| QA Testing | QA | Pass, Fail (with reason) |
| Rework | Developer | Resume work, mark Ready for QA again |
| QA Passed | BA, PM | Final validate → Completed, Hold, Return to QA |
| Completed | BA, PM, Admin | Reopen (with reason), Archive |
| Cancelled | BA, PM, Admin | Reopen |

---

## TICKET TYPES — FORM SPECIFICATIONS

When user clicks "Create Ticket", first show **type selector** (4 cards):

| Card | Icon | Description |
|---|---|---|
| Project Request | `lucide FolderPlus` | Propose a new project or initiative |
| Bug Report | `lucide Bug` | Report a defect in an existing system |
| Change Request | `lucide GitPullRequest` | Request modification to an existing feature |
| Discussion | `lucide MessageCircle` | Open a topic for cross-team discussion |

After selection, render the type-specific form.

---

### Form 1 — Project Request

| Field | Type | Required | Notes |
|---|---|---|---|
| Created Date | DatePicker | Auto (today, locked) | – |
| Requestor | Auto-fill | From session | Name + email + department |
| Project Name | Input | ✓ | Proposed title |
| Project Category | Select | ✓ | New Feature / Integration / Migration / Infrastructure / Other |
| Business Unit | Select | ✓ | From master_business_units |
| Business Objective | Textarea | ✓ | Why this project matters, business value |
| Scope Summary | Textarea (rich text) | ✓ | High-level scope description |
| Target Users | Input | ✓ | Who will use this |
| Estimated Timeline | Select | ✓ | < 1 month / 1–3 months / 3–6 months / > 6 months |
| Estimated Budget | Select | – | < 50jt / 50–200jt / 200–500jt / > 500jt / TBD |
| Priority | Select | ✓ | Low / Medium / High / Critical |
| Stakeholders | Multi-select / tags | – | List of involved parties |
| Success Criteria | Textarea | ✓ | Measurable outcomes |
| Risks / Constraints | Textarea | – | Known limitations |
| Reference Documents | Multi-file upload | – | PDF, DOCX, XLSX, PNG — max 10 files, 20MB each |
| Reference Links | Repeater | – | URL + description |
| Note | Textarea | – | Additional context |

**Auto-generated:** Ticket number `PR-YYYYMM-XXXX`

---

### Form 2 — Bug Report

| Field | Type | Required | Notes |
|---|---|---|---|
| Created Date | DatePicker | Auto (today, locked) | – |
| Requestor | Auto-fill | From session | – |
| Bug Title | Input | ✓ | Brief summary |
| Application / System | Select | ✓ | From master_applications |
| Module / Feature | Select | ✓ | Filtered by application |
| Environment | Select | ✓ | Production / Staging / UAT / Development |
| Severity | Select | ✓ | Critical / High / Medium / Low |
| Bug Type | Select | ✓ | UI / Functional / Performance / Security / Data / Integration |
| Reproducibility | Select | ✓ | Always / Sometimes / Once / Cannot Reproduce |
| Browser / Device | Input | – | e.g., "Chrome 120 on Windows 11" |
| Steps to Reproduce | Textarea (rich text) | ✓ | Numbered list, min 30 chars |
| Expected Behavior | Textarea | ✓ | What should happen |
| Actual Behavior | Textarea | ✓ | What actually happens |
| Frequency Impact | Select | – | How many users affected |
| Attachments | Multi-file dropzone | ✓ | PNG, JPG, PDF, MP4, ZIP — max 5 files, 10MB each |
| Workaround | Textarea | – | Temporary fix if any |
| Note | Textarea | – | – |

**Auto-generated:**
- Ticket number: `BUG-YYYYMM-XXXX`
- Priority score: derived from Severity × Reproducibility × Frequency Impact

---

### Form 3 — Change Request

| Field | Type | Required | Notes |
|---|---|---|---|
| Created Date | DatePicker | Auto (today, locked) | – |
| Requestor | Auto-fill | From session | – |
| Change Title | Input | ✓ | Brief summary |
| Application / System | Select | ✓ | From master_applications |
| Module / Feature | Select | ✓ | Filtered by application |
| Item / Component | Input | ✓ | Specific element to change |
| Category | Select | ✓ | Minor / Medium / Major |
| Change Type | Select | ✓ | UI Change / Functional Change / Workflow / Configuration / Other |
| Description | Textarea (rich text) | ✓ | Detailed change description |
| Reason / Justification | Textarea | ✓ | Why the change is needed |
| Expected Outcome | Textarea | ✓ | What success looks like |
| Impact Analysis | Textarea | – | What else might be affected |
| Target Implementation Date | DatePicker | – | When customer needs it |
| Attachments | Multi-file dropzone | – | PNG, PDF, DOCX — max 5 files, 10MB each |
| Note | Textarea | – | Internal notes |

**Auto-generated:**
- Ticket number: `CR-YYYYMM-XXXX`
- Estimated effort hint (display only):
  - Minor: < 8 hours
  - Medium: 8–40 hours
  - Major: > 40 hours

---

### Form 4 — Discussion

| Field | Type | Required | Notes |
|---|---|---|---|
| Created Date | DatePicker | Auto (today, locked) | – |
| Initiator | Auto-fill | From session | – |
| Discussion Topic | Input | ✓ | Clear topic title |
| Category | Select | ✓ | General / Technical / Process / Decision / Brainstorm |
| Related Application | Select | – | From master_applications |
| Related Module | Select | – | Filtered by application |
| Description | Textarea (rich text) | ✓ | Topic context, what needs to be discussed |
| Participants | Multi-select | ✓ | Tag users to involve them |
| Expected Outcome | Select | – | Decision needed / Information sharing / Feedback request / Brainstorm |
| Deadline (optional) | DatePicker | – | When discussion needs to be concluded |
| Attachments | Multi-file dropzone | – | PNG, PDF, DOCX, MP4 — max 5 files, 10MB each |
| Priority | Select | – | Low / Medium / High |

**Auto-generated:** Ticket number `DISC-YYYYMM-XXXX`

---

### Shared form behavior (all 4 types)

- **Stepper UI** for long forms (Project Request especially): split into 3-4 steps
- **Auto-save draft** every 30 seconds to localStorage
- **Draft recovery banner** on page load
- **Validation**: Zod schema, inline errors below fields
- **File upload UX**: drag-and-drop, preview thumbnails, remove individual files, progress bar per file
- **Submit confirmation**: AlertDialog showing summary before final submission
- **Post-submit**: redirect to ticket detail with success toast + ticket number

---

## SECTION 1 — DASHBOARD (`/dashboard`)

### Layout
1. Filter bar (sticky top)
2. KPI summary (6 cards)
3. Workload by team panel
4. Main chart: Ticket trend by type
5. Secondary panels: Status distribution donut, SLA performance, Top requestors, Recent activity feed

### KPI Cards

| # | Metric | Icon | Color |
|---|---|---|---|
| 1 | Total Open Tickets | `lucide Inbox` | indigo |
| 2 | Awaiting Action (mine) | `lucide Hourglass` | amber |
| 3 | In Progress | `lucide Loader` | cyan |
| 4 | Completed This Month | `lucide CircleCheckBig` | green |
| 5 | Avg Resolution Time | `lucide Timer` | teal |
| 6 | SLA Compliance % | `lucide ShieldCheck` | green/red |

Each card:
- Top: muted label
- Middle: large number
- Bottom: comparison vs last period

### Workload by Team panel

Horizontal bar chart showing per-team:
- Active tickets
- Capacity utilization (% of team's max concurrent tickets)
- Color: green (< 70%), amber (70-90%), red (> 90%)

Teams shown: BA, Developer, QA — broken down by individual member when hovered.

### Main chart — Ticket trend by type

- Library: Recharts `ComposedChart`
- X-axis: time (last 30 days / 12 weeks / 12 months — togglable)
- Stacked bars: Project Request / Bug / CR / Discussion (color-coded)
- Line overlay: average resolution time per period (secondary Y-axis)
- Tooltip: breakdown per type + total

### Secondary panels

**Status distribution donut:**
- Segments: Open, BA Review, Approved, Assigned, In Progress, Ready for QA, QA Testing, Rework, Completed, Cancelled
- Click segment → filter ticket list

**SLA performance gauge:**
- % tickets resolved within SLA target
- Color zones: green ≥ 90%, amber 80-90%, red < 80%

**Top requestors / Top departments:**
- Horizontal bar chart
- Top 5 requestors or departments by ticket volume
- Click to drill into their tickets

**Recent activity feed:**
- Real-time stream via Socket.io
- Each entry: avatar + action + ticket link + timestamp
- Examples:
  - "Andi opened BUG-202605-0042"
  - "Sarah (BA) approved CR-202605-0019 and assigned to Budi & Rina"
  - "Budi marked BUG-202605-0040 as Ready for QA"
  - "QA Rina passed CR-202605-0018"
- Limit: 20 most recent
- Filter: All / My Activity / By Type
- Click → navigate to ticket

### Dashboard filter bar
- Date range picker
- Ticket type (ToggleGroup: All / PR / Bug / CR / Discussion)
- Application (Select multi)
- Status (Select multi)
- Department (Select multi)
- Priority (Select multi)
- "Reset filters" button

All charts react to filter changes.

---

## SECTION 2 — CREATE TICKET (`/tickets/create`)

### Step 1 — Type Selector
4 large cards (Project Request, Bug, CR, Discussion). User clicks one to proceed.

### Step 2 — Type-specific form
Render matching form. For longer forms (Project Request), use stepper:
- Step 1: Basics (title, category, business unit)
- Step 2: Details (objective, scope, target users)
- Step 3: Planning (timeline, budget, stakeholders, success criteria)
- Step 4: Attachments & references

### Step 3 — Review & Submit
Summary view with all data + edit links per section. Bottom: "Submit Ticket" + "Save as Draft".

### Post-submission
- Success page with ticket number prominently displayed
- "Track Your Ticket" → ticket detail
- "Create Another" → new ticket form
- Auto-email confirmation to Requestor with ticket number + tracking link + summary

---

## SECTION 3 — MY TICKETS (`/my-tickets`)

For Requestor (or any user) to track tickets they've created.

### Layout
- Top filter bar
- Tab navigation: All | In Progress | Awaiting My Action | Completed | Cancelled
- Card or table view (toggleable)

### Ticket cards (card view)
Each card shows:
- Ticket number + type badge
- Title
- Current status badge (color-coded)
- Created date (relative)
- Last activity (relative)
- Assignee chain avatars (BA → Dev → QA)
- Progress bar (% complete for Bug/CR)
- Priority indicator
- Quick actions:
  - View detail
  - Add comment
  - Withdraw (only if status = Open)

### "Awaiting My Action" tab
Shows tickets where Requestor needs to:
- Respond to BA's "Request Info"
- Confirm completion
- Provide additional documentation

### Filters
- Type (PR / Bug / CR / Discussion)
- Status (multi)
- Date range
- Search by ticket number / title

---

## SECTION 4 — MY ASSIGNMENTS (`/my-assignments`)

**Role-aware** — behavior changes based on logged-in user's role.

### For Business Analysts (BA)

**Title:** "BA Review Queue"

**Tabs:**
- New Tickets (status = Open, awaiting BA review)
- Assigned by Me (tickets I've assigned to dev/QA, monitoring progress)
- Final Validation (status = QA Passed, awaiting my final approval)
- Hold (tickets I've put on hold)
- Completed (recent closures by me)

**Each ticket row shows:**
- Ticket number + type badge
- Title + requestor
- Priority + severity
- Time since submission
- Status

**Action buttons per status:**
- **New Tickets (Open):**
  - Open ticket detail → make decision (Approve / Reject / Hold / Request Info)
- **Approved (Bug/CR only):**
  - "Assign Dev + QA" — opens dialog
- **Final Validation (QA Passed):**
  - Mark Complete / Hold / Return to QA

**Assign Dev + QA Dialog:**
- Developer Select (with current workload indicator)
- QA Tester Select (with current workload indicator)
- Estimated effort (hours)
- Target completion date
- Note to team
- Submit → status becomes "Assigned"

---

### For Developers

**Title:** "My Development Queue"

**Tabs:**
- New Assignments (status = Assigned, awaiting accept/reject)
- In Progress (currently working)
- Sent for QA (waiting on QA)
- Rework (failed QA, back to me)
- Recently Completed

**Each ticket card shows:**
- Ticket number + type
- Title
- Severity / Category
- Assigned date + target date with progress bar (days remaining)
- Current progress %
- QA Tester assigned

**Quick actions per status:**
- **New Assignment:**
  - [Accept] [Reject with reason]
- **In Progress:**
  - [Update Progress] [Mark Ready for QA] [Request Help]
- **Rework:**
  - [Resume Work] (auto-set status to In Progress)
  - View QA failure reasons

**Update Progress Dialog:**
- Progress percentage slider (0–100)
- Status notes (Textarea, rich text)
- File upload (commit screenshots, demo videos)
- Estimated time remaining
- Submit → adds entry to ticket history

**Mark Ready for QA Dialog:**
- Required: testing notes (what was changed, how to test)
- Required: test scenarios / acceptance criteria
- File upload (test instructions, demo video)
- Submit → status changes to "Ready for QA", auto-notifies assigned QA

---

### For QA Testers

**Title:** "My Testing Queue"

**Tabs:**
- New (status = Ready for QA, not yet picked up)
- In Testing (I'm currently testing)
- Recently Tested (last 30 days)

**Pick up ticket** → status changes to "QA Testing", only this QA can decide outcome.

**Each ticket shows:**
- Ticket number + type
- Title
- Developer assigned
- Ready for QA date
- Testing notes from developer
- Test scenarios

**Action buttons:**
- [Pass] — forwards to BA for final validation
- [Fail] — returns to Developer as Rework

**Pass Dialog:**
- Test summary (Textarea)
- Test environment used
- Test scenarios completed (checklist)
- Optional file: test report PDF
- Submit → status becomes "QA Passed", notifies BA

**Fail Dialog:**
- Failure reason (Textarea, required)
- Failure category (Select: Functional bug / UI issue / Performance / Data / Other)
- Severity of issue found (Critical / Major / Minor)
- Reproduction steps
- Optional files (screenshots, screen recording)
- Submit → status becomes "Rework", auto-notifies Developer

---

### For Project Managers

**Title:** "Project Manager Overview"

**Sections:**
- All Tickets — full view across teams
- SLA Breach Watch — tickets approaching or past SLA
- Workload Balancer — drag-drop reassignment view
- Team Performance — quick metrics per team member

---

## SECTION 5 — TICKET DETAIL PAGE (`/tickets/[id]`)

Accessible based on role + ticket relationship.

### Layout — 3 columns

**Left column (250px) — Ticket meta:**
- Ticket number badge (large, color-coded by type)
- Type icon + label
- Current status badge
- Priority indicator
- SLA countdown timer (red if breaching)
- Created date / Last updated
- Application / Module
- Severity / Category
- Requestor (avatar + name + email + department)
- Assignee chain (avatars: BA → Developer → QA)
- Tags / Labels
- Watchers (with add/remove buttons)

**Center column — Main content + Activity timeline:**
- Title (editable by Requestor within edit window / BA always)
- Description (rendered rich text)
- Type-specific fields (e.g., Steps to Reproduce for bugs)
- Attachments gallery with previews + download
- Activity timeline (chronological):
  - System events (status changes, assignments)
  - Comments (threaded, with @mentions)
  - File uploads
  - QA results (pass/fail with detailed feedback)
  - Each entry: avatar, name, action, timestamp, content
- Comment box at bottom:
  - Rich text editor (Tiptap)
  - File attachment
  - @mention support (autocomplete users)
  - "Internal only" toggle (visible only to non-Requestor roles)
  - "Add comment" button

**Right column (300px) — Quick actions + side panels:**
- Action buttons (role-aware, contextual to current status)
- Subscribers / Watchers
- Related tickets (auto-detected by application/module)
- SLA info (response time used, resolution time used, target)
- Estimated effort vs actual
- Custom fields (per ticket type)

### Action button behavior (role + status aware)

| Role | Status | Available actions |
|---|---|---|
| BA | Open | Approve, Reject, Hold, Request Info |
| BA | Approved (Bug/CR) | Assign Dev + QA, Reassign |
| BA | QA Passed | Mark Complete, Hold, Return to QA |
| Developer | Assigned | Accept Assignment, Reject Assignment |
| Developer | In Progress | Update Progress, Mark Ready for QA, Request Help |
| Developer | Rework | Resume Work, View Failure Details |
| QA | Ready for QA | Pick Up for Testing |
| QA | QA Testing | Pass, Fail |
| Requestor | Open | Edit Ticket (within 1 hour), Withdraw, Add Info |
| Requestor | Completed | Reopen (with reason, within 7 days), Acknowledge |
| PM | Any | Reassign, Change Priority, Override |

### Discussion ticket detail (different layout)
For Discussion tickets, render as a forum-style thread:
- Main post at top (description)
- Reply box at bottom (always visible)
- Threaded replies with nested replies (1 level)
- Reactions (👍 ✅ ❓ ❤️) on individual posts
- "Mark as Resolved" button (initiator + PM)
- Participants sidebar
- File sharing inline

### Edit history tab
Separate tab "History" shows complete audit log with all field changes (before → after, by whom, when).

---

## SECTION 6 — REPORTS (`/reports`)

### Report types

| Type | Description |
|---|---|
| Ticket Summary | All tickets in period, grouped by type/status |
| SLA Compliance | Tickets meeting/breaching SLA targets |
| Workload Report | Tickets per role/individual |
| Department Report | Tickets per requesting department |
| Application Report | Tickets per application/system |
| Bug Trend Analysis | Bug volume + severity over time |
| QA Quality Report | Pass/fail rates per developer, defect escape rate |
| Resolution Time Report | Average/median resolution time by type |
| Requestor Activity | Per-requestor ticket history & patterns |
| Discussion Activity | Active discussions, resolution rates |

### Report builder UI

**Step 1 — Choose report type** (card grid)

**Step 2 — Configure parameters:**
- Date range
- Filters (type, status, application, department, assignee — multi-select)
- Group by (Date / Application / Department / Assignee / Type)
- Include charts? (toggle)
- Include details table? (toggle)

**Step 3 — Preview** rendered in browser with all selected sections.

**Step 4 — Export or Schedule:**
- PDF (formatted with company logo, charts, tables)
- Excel (raw data + pivot summary)
- CSV (flat data)
- Schedule recurring delivery (email) — daily/weekly/monthly

### Report template structure (PDF)
1. Cover page (title, period, generated by, generated at, logo)
2. Executive summary (key numbers, trends, auto-generated insights)
3. Charts section (status distribution, type distribution, trend lines)
4. Detail tables (sortable)
5. Flagged items (SLA breaches, escalations, anomalies)
6. Appendix (full data)

---

## SECTION 7 — MASTER DATA (`/master/*`)

Accessible only to Admin (and PM for limited masters).

### Sub-menus

- Master Application (`lucide AppWindow`)
- Master Module / Feature (`lucide Layers`)
- Master Business Unit / Department (`lucide Building2`)
- Master Category (`lucide Tag`)
- Master Severity (`lucide AlertTriangle`)
- Master Priority (`lucide Flag`)
- Master Status (`lucide CircleDot`)
- Master Ticket Type (`lucide Ticket`) — locked to 4 default
- Master SLA (`lucide Timer`)
- Master Team (`lucide UsersRound`)

### Shared layout per master page
- Header: title + "Add" button (`lucide Plus`)
- Search input
- Table: # | Name | extras | Status | Actions
- Pagination
- Add/Edit via shadcn `Sheet` (slides from right)

### Field details per master

**Master Application:**
- Name (required)
- Code
- Description
- Owning team / department
- Active status (Switch)

**Master Module / Feature:**
- Name (required)
- Application (Select)
- Description
- Active status

**Master Business Unit / Department:**
- Name (required)
- Code
- Head of department (Select user)
- Description
- Active status

**Master Category:**
- Name (Minor / Medium / Major or custom)
- Color (color picker)
- Sort order
- Applicable to (Project Request / Bug / CR / Discussion)
- Active status

**Master Severity:**
- Name (Critical / High / Medium / Low)
- Color
- Default SLA hours
- Sort order
- Active status

**Master Priority:**
- Name (Low / Medium / High / Critical)
- Color
- Sort order
- Active status

**Master Status:**
- Name
- Color
- Workflow stage (Initial / Review / Active / Validation / Final)
- Applicable to ticket types
- Sort order
- Active status

**Master SLA:**
- Name (e.g., "Critical Bug SLA")
- Ticket type
- Severity / Priority
- Response time (hours)
- Resolution time (hours)
- Active status

**Master Team:**
- Team name (e.g., "Mobile Dev", "Backend Dev", "QA Web")
- Members (multi-select users)
- Lead (Select user)
- Capacity (max concurrent tickets)
- Active status

### Soft delete protection
Records with associated tickets cannot be hard-deleted. Use deactivation instead, with confirmation:
> "This [item] is referenced by N tickets. Deactivating will hide it from new tickets but preserve history. Continue?"

---

## SECTION 8 — USER MANAGEMENT (`/admin/users`)

Accessible only to Admin. Sidebar icon: `lucide Users2`.

### Tab 1 — User Account

**Table columns:** Avatar | Name | Email | Role | Team | Active Tickets | Status | Last Login | Actions

- Role badges:
  - Admin (purple)
  - PM (indigo)
  - BA (teal)
  - Developer (blue)
  - QA Tester (violet)
  - Requestor (slate)
- Active Tickets count: clickable, opens filtered list
- Status: Active (green) / Inactive (red)
- Actions: Edit / Reset Password / Deactivate / Delete

**Top bar:**
- Search by name/email
- Filter by Role / Team / Status / Department
- "Add User" button (indigo primary)

**Add/Edit User → Sheet:**
- Profile photo
- Full name (required)
- Email (required, unique)
- Role (Select)
- Department (Select)
- Team (Select, multi)
- Phone (optional)
- Active (Switch)
- For Dev/QA roles:
  - Skill tags (multi-select)
  - Default working hours
  - Capacity (max concurrent tickets)
- On create:
  - Auto-generate password from email
  - Checkbox: "Send credentials via email"

**Bulk actions:** Deactivate, Export CSV, Delete (with confirm)

---

### Tab 2 — Role & Permissions

Default 6 roles:
- Admin (purple) — full access
- PM (indigo) — manage all tickets, reports, reassign
- BA (teal) — review, approve, assign, validate
- Developer (blue) — accept/reject, work, update progress
- QA Tester (violet) — test, pass/fail
- Requestor (slate) — create tickets, view own

Each role card: name + color + description + member count + "Edit Permissions"

**Permission Matrix Dialog:**
Rows = permission items | Columns = View | Create | Edit | Delete | Approve

| Category | Items |
|---|---|
| Tickets | Project Request, Bug, CR, Discussion |
| Workflow | BA Review, Assign, Update Progress, Test/Validate, Final Decision |
| Master Data | Application, Module, Category, Severity, Status, SLA, Team |
| User Management | Manage Accounts, Manage Roles |
| Reports | Generate, Schedule, Distribute |
| Dashboard | View All / View Own Only |
| Admin | System Settings, Audit Log |

Each cell: shadcn `Checkbox`

"Create Custom Role" button — define new role with permissions.

---

## SECTION 9 — NOTIFICATIONS

### Toast notifications (Sonner)

| Event | Type | Recipient |
|---|---|---|
| Ticket created | success | Requestor + BAs |
| BA approved | info | Requestor + assigned team |
| Ticket assigned to me | info | Developer / QA |
| Developer accepted | info | BA + Requestor |
| Progress update | info | BA, watchers, Requestor |
| Ready for QA | info | QA Tester |
| QA pass | success | BA, Developer |
| QA fail | warning | Developer |
| BA final validation | success | Requestor + team |
| Ticket completed | success | Requestor + all participants |
| @mention | info | Mentioned user |
| SLA breach warning | warning | Assignee + PM |
| SLA breached | error | Assignee + PM + Admin |
| Comment added | info | Watchers, participants |
| Discussion update | info | Participants |
| Help requested | warning | PM, team lead |

Position: top-right. Duration: 4000ms. Critical events persist until acknowledged.

### In-app bell
- Icon: `lucide Bell` with red badge for unread
- Click opens shadcn `Popover` with grouped notifications
- Groups: My Tickets / Assigned to Me / Mentions / System
- Each item: avatar + action + ticket reference + timestamp
- Click → navigate to ticket
- "Mark all read" / "Settings" links at bottom

### Email notifications
- Daily digest (configurable per user)
- Real-time email for: new assignment, QA fail, SLA breach, mention, ticket completion
- Templates use Resend with react-email components

### Notification settings page (`/settings/notifications`)
Per-user toggles for:
- Email notifications (per event type)
- In-app notifications (per event type)
- Daily digest enable/disable + delivery time
- @mention always notify (cannot be disabled)
- Quiet hours (no notifications during specified time)

---

## SECTION 10 — DATABASE SCHEMA (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL,        -- admin | pm | ba | developer | qa | requestor
  department_id UUID,
  phone         TEXT,
  avatar_url    TEXT,
  capacity      INT DEFAULT 5,
  skills        TEXT[],
  is_active     BOOLEAN DEFAULT true,
  first_login   BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Departments / Business Units
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE,
  name        TEXT NOT NULL,
  head_id     UUID REFERENCES users(id),
  description TEXT,
  is_active   BOOLEAN DEFAULT true
);

-- Teams
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  lead_id     UUID REFERENCES users(id),
  capacity    INT DEFAULT 20,
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE team_members (
  team_id   UUID REFERENCES teams(id),
  user_id   UUID REFERENCES users(id),
  PRIMARY KEY (team_id, user_id)
);

-- Applications
CREATE TABLE applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  owner_team_id UUID REFERENCES teams(id),
  is_active   BOOLEAN DEFAULT true
);

-- Modules / Features
CREATE TABLE modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID REFERENCES applications(id),
  name            TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true
);

-- Categories
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  color           TEXT,
  applicable_to   TEXT[],            -- ['project_request', 'bug', 'cr', 'discussion']
  sort_order      INT,
  is_active       BOOLEAN DEFAULT true
);

-- Severities
CREATE TABLE severities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  color           TEXT,
  default_sla_hrs INT,
  sort_order      INT,
  is_active       BOOLEAN DEFAULT true
);

-- Priorities
CREATE TABLE priorities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT,
  sort_order  INT,
  is_active   BOOLEAN DEFAULT true
);

-- Statuses
CREATE TABLE statuses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  color           TEXT,
  workflow_stage  TEXT,
  applicable_to   TEXT[],            -- ['project_request', 'bug', 'cr', 'discussion']
  sort_order      INT,
  is_active       BOOLEAN DEFAULT true
);

-- SLA Definitions
CREATE TABLE slas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  ticket_type      TEXT,
  severity_id      UUID REFERENCES severities(id),
  priority_id      UUID REFERENCES priorities(id),
  response_hours   INT,
  resolution_hours INT,
  is_active        BOOLEAN DEFAULT true
);

-- Tickets (core entity)
CREATE TABLE tickets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number        TEXT UNIQUE NOT NULL,    -- PR-/BUG-/CR-/DISC-YYYYMM-XXXX
  ticket_type          TEXT NOT NULL,           -- project_request | bug | cr | discussion
  title                TEXT NOT NULL,
  application_id       UUID REFERENCES applications(id),
  module_id            UUID REFERENCES modules(id),
  department_id        UUID REFERENCES departments(id),
  category_id          UUID REFERENCES categories(id),
  severity_id          UUID REFERENCES severities(id),
  priority_id          UUID REFERENCES priorities(id),
  status_id            UUID REFERENCES statuses(id),
  current_status       TEXT,                    -- denormalized for fast filtering

  -- Common fields
  description          TEXT,
  note                 TEXT,
  reason               TEXT,
  expected_outcome     TEXT,

  -- Bug-specific
  environment          TEXT,
  bug_type             TEXT,
  reproducibility      TEXT,
  browser_device       TEXT,
  steps_to_reproduce   TEXT,
  expected_behavior    TEXT,
  actual_behavior      TEXT,
  workaround           TEXT,

  -- CR-specific
  item_component       TEXT,
  change_type          TEXT,
  impact_analysis      TEXT,
  target_impl_date     DATE,

  -- Project Request-specific
  project_category     TEXT,
  business_objective   TEXT,
  scope_summary        TEXT,
  target_users         TEXT,
  estimated_timeline   TEXT,
  estimated_budget     TEXT,
  success_criteria     TEXT,
  constraints          TEXT,

  -- Discussion-specific
  discussion_outcome   TEXT,
  deadline             DATE,

  -- Workflow
  requestor_id         UUID REFERENCES users(id),
  ba_id                UUID REFERENCES users(id),
  developer_id         UUID REFERENCES users(id),
  qa_id                UUID REFERENCES users(id),

  -- Timing
  target_completion    DATE,
  estimated_hours      NUMERIC,
  actual_hours         NUMERIC,
  progress_percent     INT DEFAULT 0,

  -- Meta
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX idx_tickets_status ON tickets(current_status);
CREATE INDEX idx_tickets_type ON tickets(ticket_type);
CREATE INDEX idx_tickets_requestor ON tickets(requestor_id);
CREATE INDEX idx_tickets_assignees ON tickets(developer_id, qa_id);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);

-- Attachments
CREATE TABLE ticket_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_name   TEXT,
  file_size   BIGINT,
  mime_type   TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Stakeholders (project requests)
CREATE TABLE ticket_stakeholders (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id),
  name      TEXT,
  role      TEXT,
  email     TEXT
);

-- Reference Links
CREATE TABLE ticket_references (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  description TEXT
);

-- Discussion Participants
CREATE TABLE ticket_participants (
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (ticket_id, user_id)
);

-- Comments
CREATE TABLE ticket_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES ticket_comments(id),  -- for threaded discussions
  author_id       UUID REFERENCES users(id),
  content         TEXT NOT NULL,
  mentions        UUID[],
  is_internal     BOOLEAN DEFAULT false,  -- hidden from Requestor if true
  reactions       JSONB,                  -- {"👍": [user_id, ...], "✅": [...]}
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

-- Activity log (audit trail)
CREATE TABLE ticket_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES users(id),
  action      TEXT,           -- created | status_changed | assigned | commented | uploaded | etc.
  field_name  TEXT,
  old_value   TEXT,
  new_value   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Watchers / Subscribers
CREATE TABLE ticket_watchers (
  ticket_id  UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id),
  added_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (ticket_id, user_id)
);

-- QA Test Results
CREATE TABLE qa_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE,
  qa_id           UUID REFERENCES users(id),
  result          TEXT NOT NULL,         -- 'passed' | 'failed'
  failure_category TEXT,
  failure_severity TEXT,
  test_summary    TEXT,
  test_environment TEXT,
  reproduction_steps TEXT,
  attempt_number  INT DEFAULT 1,         -- 1st test, 2nd test (after rework), etc.
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  ticket_id   UUID REFERENCES tickets(id),
  type        TEXT,
  message     TEXT,
  link        TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Roles & Permissions
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT false
);

CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id     UUID REFERENCES roles(id),
  category    TEXT,
  resource    TEXT,
  can_view    BOOLEAN DEFAULT false,
  can_create  BOOLEAN DEFAULT false,
  can_edit    BOOLEAN DEFAULT false,
  can_delete  BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false
);
```

---

## SECTION 11 — SECURITY & WORKFLOW ENFORCEMENT

### Authentication & authorization
- Email + password login, JWT in httpOnly Secure SameSite=Strict cookie
- bcrypt password hashing (saltRounds: 12)
- Role-based middleware on every API route
- Workflow guards: server-side validation that user has permission to perform action at current ticket state

### Workflow guard example
```typescript
function canTransition(ticket: Ticket, action: string, user: User): boolean {
  switch (action) {
    case 'BA_APPROVE':
      return user.role in ['ba', 'pm', 'admin']
        && ticket.current_status === 'Open';
    case 'BA_ASSIGN':
      return user.role in ['ba', 'pm']
        && ticket.current_status === 'BA Approved'
        && ticket.ticket_type in ['bug', 'cr'];
    case 'DEV_ACCEPT':
      return user.id === ticket.developer_id
        && ticket.current_status === 'Assigned';
    case 'DEV_READY_QA':
      return user.id === ticket.developer_id
        && ticket.current_status === 'In Progress';
    case 'QA_PICK_UP':
      return user.id === ticket.qa_id
        && ticket.current_status === 'Ready for QA';
    case 'QA_PASS':
    case 'QA_FAIL':
      return user.id === ticket.qa_id
        && ticket.current_status === 'QA Testing';
    case 'BA_FINAL_VALIDATE':
      return user.role in ['ba', 'pm']
        && ticket.current_status === 'QA Passed';
    case 'REQUESTOR_REOPEN':
      return user.id === ticket.requestor_id
        && ticket.current_status === 'Completed'
        && (now - ticket.completed_at).days <= 7;
    // ...etc
  }
}
```

Every state transition must pass through this guard. Failure → 403 + audit log entry.

### Audit logging
Every state change, comment, file upload writes to `ticket_activities` with:
- Actor user ID
- Action type
- Old → new values
- Timestamp
- IP address, user agent (in metadata)

### File upload security
- Whitelist mime types per ticket type
- Max file size enforced server-side
- Files served via signed URLs with expiry
- Filenames sanitized
- Virus scanning on upload

### Rate limiting
- Login: 5 requests/minute per IP
- Ticket creation: 10/hour per user
- Comment posting: 30/hour per user
- File uploads: 50/hour per user

---

## SECTION 12 — UI SHELL & NAVIGATION

### Sidebar (240px → collapses to 56px icon-only)

**MAIN**
- Dashboard (`lucide LayoutDashboard`) — all roles
- Create Ticket (`lucide TicketPlus`) — all roles
- My Tickets (`lucide Ticket`) — all roles (tickets I created)

**WORKFLOW**
- My Assignments (`lucide ListTodo`) — BA, Dev, QA, PM
- All Tickets (`lucide Tickets`) — BA, PM, Admin

**INSIGHTS**
- Reports (`lucide FileBarChart`) — BA, PM, Admin

**ADMIN**
- Master Data [collapsible group] — Admin (limited PM)
  - Application, Module, Department, Category, Severity, Priority, Status, SLA, Team
- User Management (`lucide Users2`) — Admin

**Bottom of sidebar:**
- User avatar + name + role badge
- Dropdown: Profile / Notification Settings / Logout

### Top navbar
- Hamburger (mobile)
- Breadcrumb: Home / Section / Page
- Global search (Cmd+K) — search tickets by number, title, requestor, application
- Theme toggle (Sun/Moon)
- Notification bell + unread count
- User avatar dropdown

### Color theming
- Primary: indigo-600 (buttons, active nav, primary badges)
- Background adapts to dark/light via next-themes
- Status colors are semantic and non-negotiable
- Type colors:
  - Project Request: green-tinted
  - Bug Report: red-tinted
  - Change Request: blue-tinted
  - Discussion: purple-tinted

### Responsive
| Breakpoint | Behavior |
|---|---|
| < 768px (mobile) | Bottom tab nav (5 most-used), drawer for full sidebar, simplified cards |
| 768–1024px (tablet) | Sidebar drawer, single-column layouts |
| > 1024px (desktop) | Full sidebar, multi-column layouts including 3-column ticket detail |
| ≥ 1440px (large) | Wider content area, optional 4th column for ticket meta |

### Accessibility
- All interactive elements keyboard-navigable
- Tab order follows visual hierarchy
- Focus rings visible (`ring-2 ring-indigo-500 ring-offset-2`)
- ARIA labels on all icon-only buttons
- Color is never the only indicator (icons + text labels accompany status)
- WCAG AA contrast minimum

---

## DELIVERABLE CHECKLIST

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/dashboard` | Dashboard with KPIs and charts | All authenticated |
| `/tickets/create` | Create ticket (type selector + form) | All authenticated |
| `/tickets/[id]` | Ticket detail page | Role + ticket-relationship based |
| `/tickets` | All tickets list (filterable) | BA, PM, Admin |
| `/my-tickets` | My submitted tickets | All authenticated |
| `/my-assignments` | My assignments (role-aware) | BA, Dev, QA, PM |
| `/reports` | Report builder | BA, PM, Admin |
| `/master/application` | Application master | Admin |
| `/master/module` | Module master | Admin |
| `/master/department` | Department master | Admin |
| `/master/category` | Category master | Admin |
| `/master/severity` | Severity master | Admin |
| `/master/priority` | Priority master | Admin |
| `/master/status` | Status master | Admin |
| `/master/sla` | SLA configuration | Admin |
| `/master/team` | Team master | Admin |
| `/admin/users` | User management (2 tabs) | Admin |
| `/settings/notifications` | Notification preferences | All authenticated |
| `/profile` | Edit own profile | All authenticated |

---

## ACCEPTANCE CRITERIA

The application is complete when:

1. ✅ All 4 ticket types (Project Request, Bug, CR, Discussion) have working forms with type-specific fields and file upload
2. ✅ Project Request workflow correctly stops at BA approval (no Dev/QA needed)
3. ✅ Bug and CR follow full workflow chain: Requestor → BA → Dev → QA → BA → Completed
4. ✅ Discussion supports threaded comments with @mentions and reactions
5. ✅ Each role sees only the tickets and actions they have permission for
6. ✅ Status transitions are enforced server-side (no client-only checks)
7. ✅ Activity timeline captures every action with full audit trail
8. ✅ QA Fail correctly returns ticket to Developer as Rework
9. ✅ Requestor can reopen completed tickets within 7 days
10. ✅ Auto-generated ticket numbers follow format `[TYPE]-YYYYMM-XXXX`
11. ✅ Notifications fire correctly via toast, in-app bell, and email
12. ✅ @mentions in comments notify the mentioned user
13. ✅ Reports generate correctly in PDF and Excel with all selected sections
14. ✅ Master data full CRUD for all entities, with soft-delete protection
15. ✅ User management with 2 tabs fully functional (accounts + role permissions)
16. ✅ Dark/light mode works on every page
17. ✅ Responsive layouts work on mobile, tablet, desktop
18. ✅ Real-time updates work (Socket.io) when multiple users act on same ticket
19. ✅ SLA tracking works with breach warnings sent to assignee + PM
20. ✅ Draft auto-save and recovery works for long forms
