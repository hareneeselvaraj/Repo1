Create a complete enterprise-grade UX extension for the Daily Work Management (DWM) application based on the uploaded Process Standardization specifications.

This is NOT a standalone product. It must extend the existing DWM UX already created for:
• 1.2 Organization & Role Clarity
• 1.3 Measures Framework

Reuse the same design language, navigation, spacing system, visual hierarchy, and interaction patterns.

Module to design now:

1.4 Process Standardization (Process → PFC → SOP → SOP Steps)

The generated UX must fit seamlessly on top of the existing DWM application.

Application style requirements

Use a professional enterprise light theme.

Use a crisp modern sans-serif font suitable for dense data screens and compact layouts. Prefer Inter, IBM Plex Sans, or Source Sans.

The UX must feel like a serious operational/governance product, similar in quality to ServiceNow, Atlassian admin consoles, or modern Microsoft enterprise apps.

Keep pages compact and highly usable. Avoid excessive whitespace and oversized cards.

Primary desktop pages should fit well within a standard laptop window and avoid unnecessary long scrolling.

Use subtle, neutral backgrounds with strong readability.

Maintain a consistent left navigation pattern from the existing DWM UX.

Color and interaction requirements

Use a light professional palette.

Primary actions and navigation emphasis: blue.

Approved / active / effective states: green.

Warnings / review required: amber.

Blocking / ownership gap / invalid dependency / structural issue: red.

Use clear status badges across all process-related objects.

Use subtle color, not flashy consumer-app colors.

Navigation and IA requirements

Extend the existing left navigation and add / refine the Standardization section.

Standardization section should include:
• Process Library
• Process Designer
• PFC Designer
• SOP Library
• SOP Editor
• Step Designer
• Approvals
• Versions
• Impact Analysis
• Yokoten Deployment
• Yokoten Tracker

The Standardization UX must integrate with the broader DWM navigation and allow cross-navigation to:
• Positions (1.2)
• Assignments (1.2)
• Measures (1.3)
• Measure Graph
• Ownership Matrix

Do not create a disconnected or isolated module.

Core UX pages to generate

Generate all of the following complete pages and connected flows:

Process Library

Process Detail / Process Designer

PFC Designer (Graph Canvas)

PFC Node Property Panel

SOP Library

SOP Editor

SOP Step Editor

Step Transition / Branching Designer

Measure Linkage Panel (inside SOP/Step)

Ownership Panel (context-aware)

Validation Panel (unified across modules)

Approval Review Screen (Standardization)

Activation & Override Screen

Version History Screen

Version Compare Screen

Impact Analysis Screen

Yokoten Deployment Screen

Yokoten Adoption Tracker

Each screen must be a proper, realistic enterprise application screen, not just a rough wireframe.

Core UX behavior requirements

Every process-related screen must clearly show:
• Process / SOP Code
• Name
• Status
• Owner Position
• Responsible Person by Context (from 1.2)
• Version
• Context Scope

Ownership must be shown in 2 layers:
• Owner Position
• Responsible Person (resolved via context)

Show ownership resolution states:
• Resolved
• Ownership Gap
• Ambiguous Assignment
• Invalid Context

PFC and SOP must be clearly separated:

PFC:
• Flow logic only
• Nodes and edges
• No detailed instructions

SOP:
• Detailed work instructions
• Step-level execution logic

Do NOT merge or blur these concepts in UI.

PFC Designer must support:

• Start / Activity / Decision / End nodes
• Node classification:

INSTRUCTION

OBSERVATION

CONTROL
• Edge types:

default

conditional

exception

Show:
• node → SOP linkage
• ownership indicator

SOP Step Editor must support:

• Step type (ACTION / DECISION)
• Instruction text
• Expected output
• output_usage_type:

NEXT_STEP

MEASURE_INPUT

AUDIT_REFERENCE

EXTERNAL_SYSTEM
• Owner position
• Measure linkage (from 1.3)

Measure integration (MANDATORY)

Every relevant step must support:

• linking to measure
• measure status display
• quick navigation to measure

Show measure state:
• ACTIVE
• UNUSED
• ORPHAN
• INVALID

Validation (UNIFIED across 1.2 + 1.3 + 1.4)

Validation panel must show:

• ownership gaps (1.2)
• unused or invalid measures (1.3)
• missing SOP for instruction node (1.4)
• invalid flow / unreachable steps (1.4)
• trigger mismatch (1.3 ↔ 1.4)

Use ONE consistent validation panel pattern.

Activation and Override UX

Activation flow must include:

• structural validation summary
• ownership validation
• measure linkage validation
• impact summary

Override must:

• require justification
• show impacted measures
• highlight risk clearly

Applicability & Context Awareness

Add applicability rules to Process/SOP:

• site type
• product type
• line type
• capacity

Must reuse context model from 1.2.

Yokoten UX

Support:

• deployment selection (context-based)
• applicability validation
• adoption tracking

Show status:

• NOT_STARTED
• IN_PROGRESS
• ADOPTED
• DEVIATED

Screen-level design guidance

A. Process Library
Compact data grid with:
• search
• filters
• create process button
• columns: code, name, owner, resolution status, context, status, version, SOP count

B. Process Designer
Multi-tab page:
• Overview
• PFC
• SOPs
• Measures
• Ownership
• Versions
• Impact
• History

C. PFC Designer
Graph canvas with:
• node palette
• zoom / fit
• node detail panel
• validation highlights

D. SOP Editor
Structured workspace with tabs:
• Overview
• Steps
• Measures
• Ownership
• Versions
• Impact
• History

E. Step Editor
Table + detail panel layout
Compact, highly usable

F. Transition Designer
Visual or structured transition editor
Clear decision branching

G. Approval Screen
Consolidated reviewer workspace:
• summary
• ownership
• validation
• impact
• version changes
• actions

H. Impact Screen
Table showing:
• impacted objects
• severity
• action required

I. Yokoten Tracker
Grid showing:
• context
• status
• deviation note

Reusable components required

Generate a component library extension including:

• Process Header Card
• SOP Header Card
• PFC Node Badge
• Ownership Card
• Context Chips
• Validation Panel
• Impact Banner
• Override Modal
• Version Diff Block
• Step Output Badge
• Measure Link Indicator

Interaction and prototype requirements

Create interactive prototype links for:

Journey 1 – Create Process
Process Library → Create → PFC → SOP → Submit

Journey 2 – Flow Design
Process → PFC → Node → SOP

Journey 3 – Measure Trace
SOP Step → Measure → Measure Detail

Journey 4 – Approval
Approvals → Review → Compare → Approve

Journey 5 – Impact
Edit SOP → Validate → Impact Screen

Consistency requirements with existing UX

Reuse the same:
• left nav
• header
• filter bar
• cards
• badges
• modal patterns

Do NOT redesign the platform

Treat this as an extension

Layout density requirements

Keep tables compact

Avoid oversized layouts

Use structured enterprise grids

Minimize scrolling

Prioritize usability over aesthetics

Final output expected

Generate:

• All listed pages
• Standardization-specific component library
• Interactive prototype flows
• Professional enterprise light theme
• Compact, crisp, desktop-first layouts
• High-fidelity realistic UI (not wireframes)

This must feel like a deeply integrated, enterprise-grade standardization engine, not a separate module.