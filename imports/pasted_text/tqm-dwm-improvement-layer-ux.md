1. Objective

Design the Improvement Layer (1.6) UX for a TQM-based DWM platform that enables:

Structured Root Cause Analysis (RCA)

Corrective & Preventive Action (CAPA) management

PDCA lifecycle execution

Strong traceability from execution (1.5)

Continuous improvement feedback into SOP (1.4) and Measures (1.3)

2. Design Philosophy (MANDATORY ALIGNMENT)
2.1 Enterprise UX Standard

Design at level of:

ServiceNow

Atlassian (Jira)

👉 Clean, dense, professional — NOT consumer UI

2.2 No Duplication Rule

DO NOT recreate:

Measures → from 1.3

SOP / Steps → from 1.4

Ownership → from 1.2

👉 Only reference via links / panels

2.3 Trigger-Based Entry

Improvement case is created ONLY from:

Abnormality (1.5)

Escalation

Repeat detection

👉 No “Create Case” button in primary UX

2.4 Stage-Driven UX (CRITICAL)

UI must change based on PDCA stage:

Stage	Screen Focus
PLAN	RCA
DO	CAPA
CHECK	Validation
ACT	Standardization
CLOSED	Summary
2.5 Progressive Disclosure

Show only relevant fields per stage

Avoid clutter

Guide user step-by-step

🧩 3. SCREEN STRUCTURE (MASTER LAYOUT)
3.1 Case Workspace Layout
Design a 3-section layout
---------------------------------------------------------
| Header (Case Summary + Status + Actions)              |
---------------------------------------------------------
| Left: Work Area     | Right: Traceability Panel       |
| (Dynamic by stage)  | (Always visible)                |
---------------------------------------------------------
| Bottom: Timeline / Activity Feed                     |
---------------------------------------------------------
3.2 Header Section
Must include

Case ID + Title

Status (RCA / CAPA / Validation / Closed)

PDCA Stage (visual indicator)

Priority + Severity (color-coded)

Context (Site / Line / Shift)

KPI (Measure name)

Owner (Position → Person)

Actions

Assign Owner

Move to next stage (controlled)

View source abnormality

3.3 Right Panel — TRACEABILITY (MANDATORY)
Always visible

Display chain:

Abnormality → Action → KPI → SOP → Owner
Each item must be clickable

Navigate to 1.5 abnormality

Navigate to 1.4 SOP

Navigate to 1.3 measure

🟡 4. RCA SCREEN (PLAN STAGE)
4.1 Layout
Top Section

Problem statement (editable)

Context snapshot

KPI mini trend (sparkline or small chart)

4.2 RCA Workspace (MAIN AREA)
Provide 2 modes (toggle)
Mode 1: 5 WHY (DEFAULT)

Design:

Vertical step flow

Each step expandable

Why 1 → Answer
Why 2 → Answer
Why 3 → Answer
Why 4 → Answer
Why 5 → Answer
UX Requirements

Auto-add next “Why”

Allow branching (optional advanced)

Highlight final step

Mode 2: Fishbone Diagram

Design:

Visual diagram (horizontal)

Categories:

Man

Machine

Method

Material

4.3 Root Cause Panel
Fields

Cause description

Category (dropdown)

Validation basis

Confidence level

4.4 Actions

Save draft

Finalize RCA (mandatory gate)

🔵 5. CAPA SCREEN (DO STAGE)
5.1 Layout
Top

Root cause summary (read-only)

5.2 CAPA Table
CAPA	Type	Owner	Due Date	Status
5.3 CAPA Detail Drawer

Fields:

Title

Description

Type (Corrective / Preventive)

Owner

Due date

Expected outcome

5.4 Execution Tracking

Status toggle

Evidence upload

Comments

5.5 UX Behavior

Inline editing

Color-coded status:

Red → overdue

Green → completed

🟢 6. VALIDATION SCREEN (CHECK STAGE)
6.1 KPI Comparison Panel
Metric	Before	After
6.2 CONTROL CHART (CRITICAL REQUIREMENT)
Must include

Time-series line

UCL / LCL

Mean line

Outliers highlighted

Behavior

Same visual pattern as 1.5

Hover → show values

Zoom capability

6.3 Decision Panel
Options

Effective

Not Effective

Partial

If NOT Effective

Show:

“Reopen RCA” button

“Create new CAPA”

🔴 7. ACT SCREEN (STANDARDIZATION)
7.1 Layout
Suggested Updates Table
Type	Target	Change	Status
Actions

Approve

Reject

Send to 1.4 / 1.3

7.2 UX Behavior

Show impact summary

Show linked SOP / Measure

⚫ 8. CLOSURE SCREEN
8.1 Summary View

Root cause

CAPA summary

Validation result

SOP updates

Yokoten

8.2 Action

Close case

🔁 9. YOKOTEN UX
Location

ACT stage

Layout
Context	Recommendation	Status
Actions

Accept

Reject

Track implementation

🧾 10. TIMELINE PANEL (BOTTOM)
Design

Chronological feed:

[10:00] Case Created  
[10:30] RCA Started  
[11:15] Root Cause Identified  
[12:30] CAPA Created  
[Next Day] CAPA Completed  
[Day 3] Validation Done  
[Day 3] Case Closed  
UX Behavior

Click → navigate to section

Filter by event type

🔔 11. NOTIFICATIONS

Design notification system for:

CAPA assigned

CAPA overdue

Validation pending

RCA incomplete

📱 12. MOBILE UX

Simplified RCA (max 3 steps visible)

Quick CAPA updates

Minimal typing

👥 13. ROLE-BASED UX
Role	UX Priority
Operator	CAPA updates
Supervisor	RCA + CAPA
Quality	Validation + ACT
Leadership	Dashboard view
⚠️ 14. UX CONSTRAINTS (MANDATORY)

No standalone RCA creation

No duplication of master data

No skipping PDCA stages

No hidden state transitions

🎯 15. DELIVERABLES EXPECTED FROM FIGMA TEAM

Design the following screens:

Case List View

Case Workspace (Master Layout)

RCA Screen (5 Why + Fishbone)

CAPA Screen

Validation Screen (with Control Chart)

ACT Screen (Standardization)

Closure Screen

Yokoten Panel

Timeline Panel

🚀 FINAL DESIGN GOAL

UX should:

Guide users through PDCA naturally

Reduce thinking effort

Make RCA structured (not free-form chaos)

Make CAPA actionable

Make validation data-driven

Close the loop to SOP