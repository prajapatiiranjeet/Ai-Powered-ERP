# NIU Campus Portal — Dashboard Redesign Blueprint

## Product direction

Design a role-aware campus operations workspace that answers one question immediately: **what needs my attention, and what is the fastest safe next action?** Use a shared system shell and design language, then tailor each dashboard to its role. Do not force every role into the same KPI grid.

The repository currently supports three roles: **Admin, Faculty, and Student**. Existing data sources are materially different, so the blueprint distinguishes metrics that can be built from existing endpoints from metrics that require new API support. Never replace unavailable data with demo values.

## 1. Role-based information architecture and UX strategy

### Shared experience model

- Keep authentication and role authorization in the existing protected route layer. A role determines which navigation and dashboard template render; visual hiding is not access control.
- Use a persistent role-specific primary navigation on desktop and a compact drawer on small screens. Keep page title, active term/context, account menu, and global help consistent.
- Use the dashboard as an action starting point. Put daily tasks and exceptions before profile details and infrequent administration.
- Each data region owns its loading, empty, partial-failure, and retry states. A failed widget must not blank the whole dashboard.
- Show an “Updated” timestamp only when the API supplies a trustworthy timestamp. Clearly label filters and the scope they affect.

### Admin — institutional operations

**Core objective:** Keep enrollment and academic operations healthy, and complete high-impact changes accurately.

**Above the fold, first release (all sourceable today):**

1. Total students — derive from the student list endpoint, with the active scope stated.
2. Faculty count — faculty count endpoint.
3. Departments — count from the departments endpoint.
4. Courses — course count endpoint.

Do not show trend deltas, pending approvals, or “at risk” counts until real APIs provide those values and their definitions. A student list length is not an enrollment trend.

**Flow priority:** overview → exception/attention queue → common create/manage actions → detailed records and filters → infrequent utilities. Keep destructive operations behind a confirmation that names the record and consequence; favor reversible changes and auditability.

**Widget framework:** a 12-column responsive grid, not masonry. Stable positions help administrators compare metric cards and scan a predictable operations queue.

**Desktop wireframe:**

```text
┌ Header: Institution / term scope · search · profile ───────────────┐
│ Admin overview · context/date                         [Export*]    │
├────────────┬────────────┬────────────┬────────────────────────────┤
│ Students   │ Faculty    │ Departments│ Courses                    │
├──────────────────────────────────┬───────────────────────────────┤
│ Operational attention /          │ Quick actions                 │
│ records needing review            │ Add student · Add faculty     │
│ (only when backed by API)         │ Add department · Add course   │
├──────────────────────────────────┼───────────────────────────────┤
│ Enrollment / structure charts*   │ Recent changes / audit*       │
└──────────────────────────────────┴───────────────────────────────┘
*Requires a real analytics or audit API; defer until available.
```

**Daily actions:** register a student or faculty member; create a department/course; assign subjects; update records; resolve a flagged issue. Place frequently used actions near the top, and move utilities such as bulk maintenance and knowledge-document uploads into clearly named sections.

### Faculty — teaching and attendance

**Core objective:** Prepare for teaching, take accurate attendance, and see which assigned classes still need action.

**Above the fold:**

- Today’s teaching assignments and the selected class/cohort.
- Attendance tasks: not started, in progress, submitted. These counts must come from assigned subjects and attendance roster/status data; if the API cannot distinguish status, show the class list and do not invent a count.
- Attendance marking action and the class/section context before the roster opens.
- A compact profile/department identity, with personal details available in Profile rather than consuming prime dashboard space.

**Flow priority:** choose assigned subject → verify section/date → mark roster → review absences/changes → submit and receive confirmation. Keep class selection and date visible while marking. Provide a clear correction path if the API supports edits; otherwise state the submission is final before submit.

**Widget framework:** a task-first, two-column desktop workspace. The attendance roster is the primary wide panel; assignments and status form a narrow supporting rail. On mobile, collapse to a single-column class selector followed by one student row/card per learner.

**Desktop wireframe:**

```text
┌ Header: Faculty workspace · term · account ────────────────────────┐
│ Good morning · Today’s classes                         [Profile]  │
├───────────────────────────────┬───────────────────────────────────┤
│ Today / assigned classes      │ Attendance status                 │
│ Subject · section · time      │ To take · In progress · Submitted │
├───────────────────────────────┴───────────────────────────────────┤
│ Attendance workspace: class + section + date                      │
│ roster search · present/absent controls · notes · submit           │
├───────────────────────────────────────────────────────────────────┤
│ Recent attendance activity / teaching guidance (if available)     │
└───────────────────────────────────────────────────────────────────┘
```

Existing backend sources include faculty profile, assigned subjects, attendance roster, and attendance submission. A timetable, class time, attendance completion summary, and recent activity should be shown only when the corresponding fields/endpoints are available.

### Student — personal academic progress

**Core objective:** Understand academic standing, know what is next, and resolve attendance or profile issues early.

**Above the fold:**

- Attendance percentage only if present and total sessions are both supplied and the calculation policy is clear.
- Course/semester/section context from the student profile.
- The next class or deadline only when a timetable/deadline source exists.
- One primary action: view attendance; secondary actions: profile and password.

**Flow priority:** check progress → see the course or date that needs attention → open attendance details → take the next available action. Keep profile fields in Profile; the dashboard should summarize rather than repeat the entire record.

**Widget framework:** a simple 8/4 desktop split: progress and attendance across the main column, next steps and academic context in the side rail. Mobile becomes a vertical sequence ordered by urgency, with no horizontal scrolling.

**Desktop wireframe:**

```text
┌ Header: Student workspace · term · account ───────────────────────┐
│ Welcome · course / semester / section                  [Help]     │
├────────────────────────────┬──────────────────────────────────────┤
│ Attendance progress*       │ Next up / action list*               │
│ overall + per-course view  │ timetable, due items, notices        │
├────────────────────────────┴──────────────────────────────────────┤
│ Attendance history: date/course filters · accessible table        │
├───────────────────────────────────────────────────────────────────┤
│ Academic context: department · course · branch · batch             │
└───────────────────────────────────────────────────────────────────┘
*Attendance source exists; timetable, grade, deadline, and notice data  
 require authoritative endpoints before these modules are populated.
```

Existing student sources include profile and attendance. Do not imply grades, fees, assignments, timetable, or notifications exist unless verified in the product API.

## 2. Design system and visual identity

### Direction

Use a **quiet, data-dense academic operations** style: warm neutral canvas, evergreen NIU accents, clean white surfaces, restrained borders, and compact but breathable layouts. Use a 12-column grid and consistent 8px spacing increments. Avoid glass effects, ornamental gradients, and dashboard masonry; they reduce clarity and make data positions unstable.

### Typography

Use **Plus Jakarta Sans** as a single UI family with a system sans-serif fallback. It balances an institutional tone with approachable mobile legibility. Use tabular numerals for counts and percentages; reserve a monospaced face for IDs and codes only.

| Token | Size / line height | Weight | Use |
|---|---:|---:|---|
| Display | 32 / 38px | 700 | Dashboard greeting, only once per page |
| Page title | 28 / 34px | 700 | Main page heading |
| Section | 20 / 28px | 650–700 | Major content groups |
| Card title | 16 / 24px | 600 | KPI and panel titles |
| Body | 16 / 24px | 400–500 | Reading and instructions |
| Compact/table | 14 / 20px | 400–600 | Dense records, never below 12px for metadata |
| Eyebrow | 12 / 16px | 600 | Scope, status labels; use sparingly |

### Color tokens

The palette retains NIU evergreen while making text and controls meet WCAG contrast targets. The listed foreground/background pairs were checked against the WCAG contrast formula; each is above 4.5:1.

| Token | Light | Dark | Purpose |
|---|---|---|---|
| Canvas | `#F5F7F6` | `#101813` | App background |
| Surface | `#FFFFFF` | `#17231B` | Cards, menus, tables |
| Surface muted | `#EEF3EF` | `#1D2B22` | Secondary panels and selected rows |
| Text primary | `#14201A` | `#EAF0EC` | Main content |
| Text secondary | `#536259` | `#B8C5BD` | Supporting content |
| Brand primary | `#176B50` | `#8FC9A1` | Primary action and selected state |
| On brand | `#FFFFFF` | `#10261B` | Text on primary action |
| Border | `#D7E0DA` | `#34463B` | Dividers and surfaces |
| Focus ring | `#176B50` | `#8FC9A1` | Keyboard focus |
| Success | `#176B50` on `#E8F5EC` | `#A8DDB6` on `#163322` | Completed/safe |
| Warning | `#7A4B00` on `#FFF2CC` | `#F2C66D` on `#3C2B0A` | Attention needed |
| Error | `#9B1C1C` on `#FEF2F2` | `#FFB4AB` on `#3B1717` | Failed/blocked |
| Info | `#1E4F91` on `#EAF2FF` | `#A9C7FF` on `#142A46` | Informational |

Status must always include text or an icon with an accessible name; color alone never communicates state. Use the semantic pairs as text on their listed backgrounds, not as arbitrary foreground/background combinations. For chart series, label series directly and pair hue with shape, pattern, or line style.

### Surfaces and spacing

- Cards: 12–16px radius, 1px border, subtle shadow (`0 2px 8px rgba(20,32,26,.04)`); no hover lift for non-interactive panels.
- Buttons and inputs: 8px radius, minimum 44px interactive height, consistent 12–16px horizontal padding.
- Main content max width: 1440px; desktop sidebar 256px; content gutters 24–32px, reducing to 16px on mobile.
- KPI cards share a baseline, label position, number style, and optional trend slot. Reserve the trend slot even when no trend is available to prevent layout shift.

## 3. Data visualization and component system

### Atomic component model

- **Atoms:** color/type/space tokens, focus ring, icon, status dot, skeleton block, button, input, select, checkbox.
- **Molecules:** search/filter row, date/term scope, KPI card, metric delta, field with validation, empty/error state, table toolbar, pagination.
- **Organisms:** admin attention queue, attendance roster, student progress panel, data table, chart panel, profile summary, responsive sidebar.
- **Templates:** Admin Operations, Faculty Teaching, Student Progress. Share only the shell, page header, feedback patterns, and base grid; keep role modules distinct.
- **Pages:** role dashboard and existing deep-link destinations, with URL-backed filters where useful.

### Chart rules

- Use a line chart for a real time series (for example, enrollment by term), and grouped/stacked bars for discrete comparisons (for example, attendance by course). Avoid trend charts until historical API data exists.
- Use a donut only for a small part-to-whole summary with a visible total and direct labels; prefer a bar when precise comparison matters.
- Use an attendance heatmap only when enough dated observations exist. Every cell needs a value on focus, a numeric legend, and a table/list alternative; do not make red/green the only signal.
- Remove heavy gridlines; keep light axis guides, clear units, direct labels, and descriptive tooltips. Charts must expose a text summary and an accessible tabular equivalent.
- Charts are not an API substitute. Start with real data cards and tables where the backend has no time series or aggregate endpoint.

### Component states

| Component | Default | Hover / active | Focus | Disabled / loading | Error / empty |
|---|---|---|---|---|---|
| Button | Clear primary/secondary hierarchy | Subtle shade; pressed feedback | 2px visible ring, not clipped | Preserve label; spinner plus “Saving…” | Inline form error; retain recoverable input |
| Input/select | Persistent label, hint, clear value | Border emphasis | High-contrast ring | Disabled text and surface remain legible | Error text adjacent, `aria-describedby`, invalid state |
| Table | Header, units, row actions | Highlight row without changing meaning | Row/action focus visible | Skeleton rows with reserved height | Empty message with a relevant next action; mobile stacked cards or scroll region |
| KPI | Label, value, period | No interaction styling unless clickable | Focus only if it links | Skeleton preserves dimensions | “Unavailable” for failed data; “No records yet” for true zero |
| Chart | Title, period, legend | Tooltip also reachable by keyboard | Focusable points or equivalent data list | Loading skeleton | Error + retry per widget; no chart for empty values |
| Dialog/drawer | Purpose-led title and close | Clear action feedback | Focus trap and return focus | Prevent duplicate submit | Inline error; never clear entered form data |

## 4. Accessibility, animation, and interaction

Target WCAG 2.1 AA across all role dashboards:

- Normal text contrast ≥4.5:1; large text and meaningful non-text controls ≥3:1. Verify both themes and all component states.
- All actions work by keyboard; logical tab sequence; visible focus; no hover-only behavior. Focus must not be hidden by sticky headers, dialogs, or the assistant widget.
- Use landmarks, one page-level `h1`, ordered headings, semantic buttons/links, labels, `aria-live` for save/loading results, and `aria-busy` on updating regions.
- Use at least 44×44px touch targets where practical; at minimum maintain WCAG target-spacing/size compliance and avoid adjacent tiny icon controls.
- Use text plus icon/shape for statuses. Provide chart data tables and meaningful alternative summaries. Do not announce decorative skeleton blocks individually.
- Attendance rows and data tables must remain operable at 200% zoom and at 320 CSS px without page-level horizontal scrolling. A specific table may use a labeled horizontal scroll region if cards would destroy comparison context.
- Honor `prefers-reduced-motion: reduce`; remove non-essential movement and keep all final content visible.

Motion is functional and restrained:

- Hover/focus feedback: 120–160ms.
- Button press and inline feedback: 100–160ms.
- Panel, menu, and drawer transitions: 180–240ms, `cubic-bezier(.2,.8,.2,1)`.
- Page content: optional 180ms opacity/8px fade; do not animate layout size or delay access to content.
- Skeleton shimmer may be disabled for reduced motion; prefer a static tonal skeleton.
- Successful submissions use a brief status change and confirmation text; no celebratory animation that hides the result.

## 5. Responsive behavior and shared navigation

- **1440px+:** persistent sidebar, 12-column grid, max-width content, 4 admin KPI cards across.
- **1024–1439px:** sidebar remains if content can retain 8/4 and 4-card layouts; otherwise collapse it to icons with accessible labels.
- **768–1023px:** compact drawer; KPIs in two columns; simplify chart/table controls into a filter disclosure.
- **≤767px:** single-column task order, sticky page title only where it does not obscure focus, 44px targets, attendance roster as stacked records, bottom navigation only for the student’s 4–5 most-used destinations if user testing supports it.
- Avoid separate mobile-only feature sets. Preserve deep links and identical authorization behavior at every viewport.

## 6. Delivery sequence and product validation

1. **Data contracts:** document endpoint shape, ownership/role, empty semantics, error semantics, freshness, and whether each metric is authoritative. Add aggregates/history only where user decisions require them.
2. **Shared foundation:** tokens, typography, button/form/table primitives, loading/error/empty patterns, keyboard behavior, responsive shell.
3. **Student and Faculty task paths:** attendance is a frequent, concrete workflow; prototype with real roster/profile/attendance data and validate with representative users.
4. **Admin operations:** add the sourced KPI summary, registration/academic actions, then exception queue and analytics after APIs exist.
5. **Instrumentation and iterate:** measure median time to mark attendance, task completion rate, failed submissions, repeat navigation, dashboard load/error rate, and accessibility defects. Compare before/after with the current baseline.

Acceptance checklist: each role can identify its top task quickly; no metric is fabricated; every widget has loading/empty/error states; no dead “coming soon” control is presented as active; keyboard-only completion works; color contrast passes in both themes; 320px/768px/1024px/1440px layouts are usable; charts have text/table equivalents; reduced-motion is respected.

## 7. Product domain and frontend architecture

> Grounded in the current React/Vite frontend. Roles are inferred from constants/routes: Admin, Faculty, Student. Proposed analytics are not treated as existing functionality.

### Domain exploration

- Concepts: institution, term, department, course, branch/section, cohort/batch, teaching assignment, attendance event, academic profile, account role, enrollment.
- Color world: evergreen canopy, chalkboard green, paper white, warm limestone, oxidized brass, graphite ink, muted clay, campus ID-card blue.
- Signature: **Cohort Context Rail.** A compact persistent strip names term and, when available, course, section, and date. Faculty see scope before attendance; admins see count scope; students see their own context. Render only authoritative fields.
- Rejected defaults: identical KPI grids for every role; generic oversized greeting plus decorative charts; masonry/glass cards with unstable positions and role-coded accents. Use task-first hierarchy, stable grids, and one institutional visual language.

### Frontend architecture map

| Layer | Existing code | Responsibility |
|---|---|---|
| Bootstrap | src/main.jsx: StrictMode, ErrorBoundary, BrowserRouter, AuthProvider, App | Catch render failures and restore session before route evaluation. |
| Session | src/context/AuthContext.jsx, src/services/authService.js, src/utils/jwt.js | Login, storage hydration, JWT expiry, role normalization, logout, default route. Client role guides navigation; backend remains authorization authority. |
| Routes | src/routes/AppRoutes.jsx, src/routes/ProtectedRoute.jsx | /admin/*, /faculty/*, /student/* wrap role layouts. Preserve deep links/refresh with SPA history fallback. |
| Shells | src/layouts/AdminLayout.jsx, FacultyLayout.jsx, StudentLayout.jsx | Shared navigation/header, role-specific links, Outlet, logout, responsive shell. |
| Pages | src/pages/{admin,faculty,student}/*Dashboard.jsx | Role-specific information architecture and widget orchestration. |
| Services | src/services/api.js and *Service.js | Bearer token, API base, finite timeout, HTTP parsing/errors. Keep networking out of view components. |
| UI/styles | src/components/common/*, role panels, src/index.css, Tailwind, Vite | Shared primitives/state patterns; semantic CSS variables. |

**Observed data boundary:** Admin requests student records, faculty count, departments, course count. Faculty has profile, assigned-subject, roster, attendance-submission services. Student has profile and attendance. Existing dashboards include loading/error/empty and retry patterns. Do not add trends, next-class, audit, deadline, grade, or attendance-task counts without authoritative API fields. Confirm endpoint schemas with backend before implementation.

### Runtime and data-state contract

1. AuthProvider starts loading and waits for storage hydration/JWT expiry validation.
2. Login normalizes the backend role and selects that role's default route. Unknown roles fail closed with a useful error.
3. ProtectedRoute checks session and allowed role; APIs must enforce authorization too. 401 clears persisted auth and redirects to login; 403 remains explicit access denied.
4. Load independent widgets with bounded requests; Admin can use Promise.allSettled. Each widget owns loading/data/true-empty/error/retry. Failed/null metrics are unavailable, never zero.
5. Fetch effects prevent stale/unmounted updates or use AbortController. Every request has a finite timeout. Retry failed widgets independently.

Network contract: VITE_API_BASE_URL may be empty when Vite proxies relative endpoints; production must configure API origin and SPA fallback. Use bearer JWTs and never log token values. Verify CORS, role serialization, expiry, and response shapes against target backend.

### State ownership

```text
App
├── AuthProvider → AppRoutes → ProtectedRoute(role)
│   └── RoleLayout (navigation/header/Outlet)
│       └── RoleDashboard → PageHeader + CohortContextRail
│           └── WidgetBoundary (loading/data/empty/error+retry)
│               ├── AdminMetric / AdminActionQueue
│               ├── FacultyAttendancePanel → RosterRow / AttendanceControl
│               └── StudentAttendanceSummary / AcademicContext
└── AppErrorBoundary
```

AuthContext owns identity/session; routes own access decisions; page owns query orchestration/filters; widgets own presentation states; services own HTTP and DTO normalization. Avoid a global loading flag. Persist only preferences/non-sensitive UI state.

## 8. Implementation-ready specifications

### Typography

Use Plus Jakarta Sans with optical sizing, tabular numerals for metrics, system sans fallback, and font-display swap. Self-host licensed WOFF2 where practical; use monospace only for IDs. Tracking is CSS letter-spacing.

| Token | Size / line | Weight | Tracking |
|---|---:|---:|---:|
| Display | 36 / 44px | 700 | -0.035em |
| H1 | 28 / 36px | 700 | -0.03em |
| H2 | 22 / 28px | 650 | -0.02em |
| H3 | 18 / 24px | 650 | -0.01em |
| Body | 15 / 23px | 400 | 0 |
| Body strong | 14 / 20px | 600 | 0 |
| Compact | 13 / 18px | 400-500 | 0 |
| Micro | 11 / 16px | 600 | 0.04em |
| KPI | 30 / 36px | 650 | -0.025em |

Use a 1.25 scale; weight/color do more hierarchy work than extra sizes. Dense essential content stays at least 14px; microcopy is supplemental.

### Theme architecture and color tokens

Define semantic custom properties under :root[data-theme=light] and [data-theme=dark]; components use variables, never literal mode colors. Set color-scheme. First visit follows prefers-color-scheme; explicit choice persists in localStorage. Apply before React paint to prevent flash; system changes apply only without override.

| Token | Light | Dark |
|---|---|---|
| Canvas / surface | #F5F7F6 / #FFFFFF | #101813 / #17231B |
| Raised / selected | #FFFFFF / #E8F2EB | #1D2B22 / #23392C |
| Text primary / secondary | #14201A / #536259 | #EAF0EC / #B8C5BD |
| Muted text | #64736A | #A3B1A8 |
| Brand / on-brand | #176B50 / #FFFFFF | #8FC9A1 / #10261B |
| Border / focus | #D7E0DA / #176B50 | #34463B / #A8DDB6 |
| Success text/surface | #176B50 / #E8F5EC | #A8DDB6 / #163322 |
| Warning text/surface | #7A4B00 / #FFF2CC | #F2C66D / #3C2B0A |
| Error text/surface | #9B1C1C / #FEF2F2 | #FFB4AB / #3B1717 |
| Info text/surface | #1E4F91 / #EAF2FF | #A9C7FF / #142A46 |

Validate final pairs to WCAG 2.1 AA: 4.5:1 normal text, 3:1 large text and meaningful non-text controls. Pair semantic text only with listed surface; statuses also use a word/icon/shape. Focus ring is 2px with 2px offset and visible on adjacent surfaces.

Style: quiet academic workbench; warm canvas, evergreen actions, graphite text, restrained rules. Radius: 6px controls, 10px compact panels, 14px cards. Shadows: 0 1px 3px rgba(20,32,26,.08) cards; 0 8px 24px rgba(20,32,26,.12) popovers. Spacing base 4px, common 8/12/16/24/32px. Cards 20-24px padding; content max 1440px; sidebar 248px; desktop gutter 24px, mobile 16px.

### Interaction states

| Element | Default | Hover | Focus-visible | Active/disabled/error |
|---|---|---|---|---|
| Primary action | Brand fill, readable label, 40-44px target | One shade step | 2px offset ring | Pressed shade; disabled semantics and readable progress label |
| Input/select | Persistent label, hint, value | Border emphasis | Visible ring | Invalid uses aria-invalid and described error; preserve entered value |
| Navigation | Icon/label and generous target | Muted surface | Ring around target | aria-current=page, tint + marker; no dead active-looking links |
| Data row | Stable columns/units | Subtle tint | Actions individually focusable | Skeleton reserves height; errors/empty retain table context |
| Dialog/drawer | Purpose-led title and close | Clear action feedback | Focus trap and return focus | Escape when safe; prevent duplicate submit; preserve form on error |

Widgets implement idle/loading/success-empty/success-data/error. Partial failure is per-widget. Skeletons match final dimensions. Empty states explain what's missing and provide valid next action. Errors provide retry; stale data is never presented as current.

### Chart architecture

- Line: authoritative time series; label units/range, mark gaps, keyboard inspection, table equivalent.
- Bar: discrete comparison with zero baseline; horizontal for long labels; direct values and meaningful sort.
- Stacked bar: few comparable categories, stable series order, direct legend and shape/pattern redundancy.
- Donut: 2-5 parts with visible total/direct labels; use bars for precise comparison.
- Structural/heatmap: only real hierarchy or sufficiently complete date series; focused values, numeric legend, missing-data state, table/list equivalent.
- Remove heavy grids, 3D, decorative gradients. Tooltip supplements labels. No chart substitutes for missing API data; respect reduced motion.

### Motion

Curves: standard cubic-bezier(.2,.8,.2,1); enter cubic-bezier(.16,1,.3,1); exit cubic-bezier(.4,0,1,1). Animate opacity/transform for transient feedback; avoid layout dimensions.

| Interaction | Duration cap |
|---|---:|
| Hover/focus color | 120ms |
| Button press | 100ms |
| Tooltip | 140ms |
| Popover/navigation drawer | 240ms |
| Page content | 160ms, opacity only |
| Expand/collapse | 260ms |

Honor prefers-reduced-motion: remove nonessential movement/shimmer and reduce durations to 1ms. Never delay data or action availability.

## 9. Role workspace specifications

### Admin — operations overview

- Objective: keep institutional records/academic structure accurate and complete changes safely.
- Above fold: title/scope; four sourced counts; independent metric error/freshness states; create/manage actions. No attention queue until its API exists.
- Primary flow: inspect counts → add/manage → validate → confirm → return to record. Secondary: subject assignment, account maintenance, knowledge upload, security.
- Grid: 12 columns; four equal metric columns; 7/5 records/actions split when records exist; actions span below metrics otherwise. Tablet filters collapse; phone uses stacked records.
- Data gate: failed counts unavailable, not zero. Verify pagination before treating student-list length as total.

### Faculty — attendance workbench

- Objective: select correct assigned class, record attendance, confirm submission.
- Above fold: date, subject/section; assignments only when returned; Take Attendance focal action; status only when authoritative.
- Primary flow: select assignment → verify section/date → find learner → mark status → review totals → submit → confirmation/correction if supported. Secondary: profile/account.
- Grid: 8/4 roster/support split on desktop; tablet full-width roster and collapsible selector; mobile learner cards with large controls and submit summary that never obscures last row.
- Safety: preserve identity when filtering; announce unsaved marks; prevent duplicate submit; confirm persistence only after API success.

### Student — academic status

- Objective: understand attendance/context and open details needed to resolve an issue.
- Above fold: profile-derived course/branch/section/batch; percentage only with valid numerator/denominator and clear policy; View Attendance. No unsupported grades, timetable, or due dates.
- Primary flow: check attendance → see totals/empty → filter/open history. Secondary: profile, password, help.
- Grid: 8/4 attendance/context split; mobile urgency-ordered single column.
- Data gate: distinguish zero sessions from request failure; omit percentage for zero/malformed denominator.

### Shared acceptance

At 1440px retain 248px sidebar and 12-column content; at 1024px collapse navigation if necessary; below 768px use drawer and 16px gutters. At 320px keep actions readable without page-level horizontal scroll. Validate keyboard completion, 200% zoom, accessible names, table alternatives, focus visibility, both themes, reduced motion. Every widget demonstrates loading, data, true-empty, error/retry, partial-failure.
