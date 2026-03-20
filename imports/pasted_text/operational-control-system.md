1. CONTEXT (MANDATORY – DO NOT SKIP)

You are extending an existing enterprise-grade product UX with the following modules already designed:

1.2 Organization

Position → Person assignment

Context-aware ownership

1.3 Measures

Graph-based KPI system

Targets, thresholds, relationships

1.4 Standardization

PFC → SOP → Step hierarchy

Measure linkage at Step level

CRITICAL PLATFORM PRINCIPLES (MUST BE PRESERVED)

Single source of truth per entity

No duplication across modules

Context-driven visibility

Position-based ownership (NOT person-first)

≤ 3-click traceability across modules

Enterprise-grade UI (ServiceNow / Atlassian level)

Light theme, compact layout

Strong left navigation + contextual right panels

⚠️ 2. EXECUTION LAYER UX PHILOSOPHY (NON-NEGOTIABLE)
❌ DO NOT DESIGN THIS AS:

Task management tool (like Jira)

Dashboard/reporting tool (like Power BI)

Workflow engine UI

✅ THIS MUST BE DESIGNED AS:

👉 REAL-TIME OPERATIONAL CONTROL SYSTEM

🔥 CORE UX PRINCIPLE
BOARD = SYSTEM

Everything originates from:

Board

KPI state

Abnormality

🧩 3. INFORMATION ARCHITECTURE (EXTEND EXISTING NAV)
Add to Left Navigation
---------------------------------
[Organization]
[Measures]
[Standardization]
---------------------------------
[Boards]          ← NEW (PRIMARY)
[My Work]         ← NEW
[Actions]         ← NEW
[Meetings]        ← NEW
---------------------------------
Navigation Behavior

Boards → Default landing page

Context selector (top bar) reused from 1.2/1.3/1.4

Filters persist across screens

🧱 4. CORE SCREENS TO DESIGN
🔷 4.1 BOARDS (PRIMARY SCREEN)
Screen Name

Boards – Tier View

Layout Structure
---------------------------------------------------------
| Top Bar: Context | Tier Toggle (T1 / T2 / T3) | Filters |
---------------------------------------------------------
| Left Panel (Optional): Process / Line Selector          |
---------------------------------------------------------
| MAIN BOARD GRID                                        |
---------------------------------------------------------
| KPI Cells (Grid/Table Hybrid)                          |
---------------------------------------------------------
Board Types
T1 (Line / Shift)

Row = KPIs or Processes

Columns = Value / Target / Status

T2 (Department)

Row = Lines

Columns = KPIs

T3 (Plant)

Row = Departments

Columns = Aggregated KPIs

KPI CELL DESIGN (VERY IMPORTANT)

Each cell must show:

---------------------------------
| KPI Name                      |
| Value vs Target              |
| Status Color (R/A/G)         |
| Small Icons: ⚠ / 🔧 / ↑↓     |
---------------------------------
Color Logic

Green → Normal

Amber → Warning

Red → Critical

Grey → Missing

Cell Interaction (MANDATORY)

Click → Opens Right Side Panel

Panel Tabs:

KPI Details

Abnormalities

Actions

SOP / Measure Link

🔷 4.2 KPI DETAIL PANEL (RIGHT DRAWER)
Tabs Structure
Tab 1: Overview

Current value

Target

Trend

Last updated

Tab 2: Abnormalities

List of active abnormalities

Severity

Time detected

Tab 3: Actions

Linked actions

Status

Owner

Tab 4: Traceability

Measure → SOP Step → Process

⚠️ DO NOT:

Create separate full page for KPI unless deep analytics

🔷 4.3 MY WORK (OPERATOR FOCUS)
Layout
---------------------------------
| My Work – Today               |
---------------------------------
| Action | KPI | Due | Status   |
---------------------------------
Capabilities

Update status (inline dropdown)

Add remarks

Upload evidence

One-click → KPI panel

UX RULE

👉 Must work in mobile-first layout

🔷 4.4 ACTIONS (MANAGEMENT VIEW)
Layout
-----------------------------------------
| Filters: Status / Priority / Context   |
-----------------------------------------
| Table / Card View                      |
-----------------------------------------
Columns

Action Title

Linked KPI

Owner (Position → Person)

Due Date

Status

Escalation Flag

Action Detail Drawer

Description

Timeline

Comments

Evidence

⚠️ IMPORTANT

No kanban board

No sprint-like UI

🔷 4.5 ABNORMALITY VISUALIZATION (EMBEDDED)
NOT a separate module

Instead:

Badge on KPI cell

Inline indicator in board

Visible in KPI panel

Abnormality UI Elements

Severity tag

Type (threshold / delay / missing)

Time detected

🔷 4.6 MEETING WORKSPACE
Screen Name

Tier Meeting Workspace

Layout
-------------------------------------------------
| Meeting Header (T1 / T2 / T3)                  |
-------------------------------------------------
| KPI Snapshot                                  |
-------------------------------------------------
| Abnormalities                                 |
-------------------------------------------------
| Actions                                       |
-------------------------------------------------
| Notes / Decisions                             |
-------------------------------------------------
Capabilities

Create action inline

Escalate item

Add notes

⚠️ DESIGN RULE

👉 This is NOT a document editor
👉 This is live operational workspace

🔗 5. CROSS-MODULE INTEGRATION (CRITICAL)
From KPI Panel → Must navigate to:

Measure (1.3)

SOP Step (1.4)

Owner (1.2)

Interaction Example
Board → KPI → SOP Step → Measure → Owner
⚠️ RULE

👉 No duplication of data
👉 Only reference + navigation

🎨 6. VISUAL DESIGN GUIDELINES
Style

Clean enterprise UI

Compact density

Minimal whitespace

High data visibility

Typography

KPI value → large, bold

Labels → small, subtle

Icons

Use consistent icons:

🔴 Critical

🟠 Warning

🟢 Normal

⚠ Abnormality

🔧 Action

Spacing

Tight grid

No card-heavy layouts (avoid dashboard feel)

⚡ 7. REAL-TIME UX BEHAVIOR
Must Support

Auto-refresh (WebSocket style)

Visual pulse for updates

No full page reload

Update Behavior

KPI changes → animate cell

New abnormality → highlight

📱 8. RESPONSIVE DESIGN
Mobile (Operator)

My Work

T1 Board

Quick input

Tablet

T1/T2 Boards

Desktop

Full system

🚫 9. ANTI-PATTERNS (STRICTLY AVOID)

❌ Task creation screen without KPI
❌ Duplicate KPI entry forms
❌ Workflow diagrams
❌ Heavy forms
❌ Report-style dashboards
❌ Deep nested navigation

✅ 10. SUCCESS CRITERIA FOR UX

UX is correct if:

Operator updates action in < 5 clicks

Supervisor detects issue in < 3 seconds

Manager understands system state in < 10 seconds

No training required

🚀 11. DELIVERABLE EXPECTATION (FROM DESIGNER / FIGMA AI)

Create:

Screens

Boards (T1 / T2 / T3)

KPI Detail Panel

My Work

Actions List + Detail

Meeting Workspace

Components

KPI Cell

Status Badge

Abnormality Tag

Action Card

Right Drawer Panel

Flows

Signal → KPI → Abnormality → Action

Board → KPI → SOP / Measure

Meeting → Action → Escalation

🔥 FINAL INSTRUCTION (IMPORTANT)

Design must feel like:

👉 ServiceNow (structured)
+
👉 Andon Board (real-time operations)
+
👉 NOT Jira / NOT Power BI