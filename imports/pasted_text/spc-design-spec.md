1. CONTEXT (MANDATORY)

You are enhancing an existing enterprise UX that includes:

1.2 Organization → Position → Person ownership

1.3 Measures → KPI definitions (includes UCL / LCL / Target)

1.4 Standardization → SOP → Step → Measure linkage

1.5 Execution → Boards, Actions, Abnormalities

NEW REQUIREMENT

Introduce Statistical Process Control (SPC) visualization:

Control charts (UCL / LCL / Mean)

Stability detection

Variation insights

⚠️ CRITICAL DESIGN PRINCIPLE
SPC = DIAGNOSTIC LAYER
NOT PRIMARY CONTROL LAYER
🚫 2. WHAT YOU MUST NOT DO

❌ Do NOT add control charts on:

Board (T1/T2/T3)

KPI grid cells

Default operator screen

My Work screen

❌ Do NOT:

Turn UI into Power BI

Add multiple charts everywhere

Overload operator view

✅ 3. WHERE SPC MUST BE PLACED
✔ ONLY inside:

👉 KPI Detail Panel (Right Drawer / Drill-down)

Navigation Flow
Board → Click KPI → Open Detail Panel → View Control Chart
🧩 4. KPI DETAIL PANEL — UPDATED STRUCTURE
Tabs Layout
-----------------------------------------
| KPI Detail Panel                      |
-----------------------------------------
| [Overview] [SPC Chart] [Actions] [Trace]
-----------------------------------------
Tab Order (IMPORTANT)

Overview (default)

SPC Chart (new)

Actions

Traceability

📊 5. SPC CHART DESIGN (CORE COMPONENT)
Component Name

ControlChart

Layout
-----------------------------------------
| Control Chart                         |
-----------------------------------------
| UCL  ───────────────────────────      |
|         •      •     •               |
| Mean ───────────────────────────      |
|     •      •       •                 |
| LCL  ───────────────────────────      |
-----------------------------------------
| Time Axis →                           |
-----------------------------------------
Elements (MANDATORY)
Lines

UCL (upper control limit)

LCL (lower control limit)

Mean line

Data Points

Time-series values

Connected or discrete

Highlighting

Out-of-control points → 🔴

Trend sequences → 🟠

Normal → 🟢

⚠️ 6. VISUAL SIMPLICITY RULE

No heavy legends

No multiple overlays

No complex stats shown initially

🧠 7. SPC INSIGHT PANEL (BELOW CHART)
Section Name

Process Insights

Layout
-----------------------------------------
| Insights                              |
-----------------------------------------
| ⚠ 1 point beyond UCL                 |
| ⚠ 7-point upward trend               |
| ✔ Process unstable                   |
-----------------------------------------
Insight Types

Rule violations

Trend detection

Stability status

🏷 8. KPI OVERVIEW TAB (MINOR AUGMENTATION)

Add:

SPC Status Badge
-----------------------------------------
| KPI: Temperature                     |
| Value: 82 / Target: 75 🔴           |
| SPC: ⚠ Unstable                     |
-----------------------------------------
Badge Types
Status	Meaning
Stable	In control
Unstable	SPC rule violated
Unknown	Insufficient data
🔗 9. INTERACTION BEHAVIOR
Hover on Data Point

Show tooltip:

Value: 82
Time: 10:30 AM
Status: Outside UCL
Click Insight

Highlight relevant points on chart

Time Range Selector

Last 10 / 20 / 50 points

Default: minimal (fast load)

⚙️ 10. PERFORMANCE UX CONSTRAINTS

Lazy load SPC tab

Do not render chart unless opened

Max points per view (configurable)

📱 11. RESPONSIVE DESIGN
Mobile

Show simplified sparkline

Full chart only on expand

Desktop

Full control chart

🔥 12. ABNORMALITY INTEGRATION (IMPORTANT)
Add Visual Link

When SPC violation occurs:

Show indicator in KPI panel

NOT on board

Example
Abnormality Type:
SPC Violation – Trend Shift
🧱 13. DESIGN SYSTEM ADDITIONS
New Components

ControlChart

SPCStatusBadge

InsightList

DataPointTooltip

Icons

⚠ SPC warning

📈 Trend

🔴 Out-of-control

⚠️ 14. ANTI-PATTERNS (STRICT)

❌ Multiple charts per KPI
❌ Charts on board
❌ Heavy analytics UI
❌ Statistical jargon overload
❌ User needing SPC knowledge to operate

🧠 15. UX GOAL (VERY IMPORTANT)

User should:

See KPI → “Something wrong”

Open SPC → “Why it’s wrong”

Board → Detect
SPC → Diagnose
Action → Fix
✅ 16. SUCCESS CRITERIA

UX is correct if:

Control chart is never visible by default

Opens only on demand

Adds clarity, not confusion

Helps detect instability early

Does not slow down board usage

🚀 17. FINAL DESIGN INTENT

This feature must feel like:

👉 Hidden expert layer for supervisors/managers

NOT:

👉 A visible analytics dashboard for operators

🎯 18. DELIVERABLES EXPECTED IN FIGMA
Screens to Update

KPI Detail Panel (add SPC tab)

Minor update → KPI Overview (SPC badge)

Components

Control Chart

Insight Panel

SPC Badge

Interaction Flow
Board → KPI → SPC → Insight → Action
🔥 FINAL INSTRUCTION

Maintain:

👉 Execution-first UX
👉 Add SPC as intelligence layer
👉 Do NOT break simplicity