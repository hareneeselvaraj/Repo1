Create a complete enterprise-grade UX extension for the Daily Work Management (DWM) application based on the uploaded Measures Framework specifications.

This is NOT a standalone product. It must extend the existing DWM UX already created for 1.2 Organization & Role Clarity and Standardization-related screens. Reuse the same design language, navigation, spacing system, visual hierarchy, and interaction patterns.

Module to design now:
1.3 Measures Framework

The generated UX must fit seamlessly on top of the existing DWM application.

Application style requirements

1. Use a professional enterprise light theme.
2. Use a crisp modern sans-serif font suitable for dense data screens and compact layouts. Prefer Inter, IBM Plex Sans, or Source Sans.
3. The UX must feel like a serious operational/governance product, similar in quality to ServiceNow, Atlassian admin consoles, or modern Microsoft enterprise apps.
4. Keep pages compact and highly usable. Avoid excessive whitespace and oversized cards.
5. Primary desktop pages should fit well within a standard laptop window and avoid unnecessary long scrolling.
6. Use subtle, neutral backgrounds with strong readability.
7. Maintain a consistent left navigation pattern from the existing DWM UX.

Color and interaction requirements

1. Use a light professional palette.
2. Primary actions and navigation emphasis: blue.
3. Approved / active / effective states: green.
4. Warnings / review required: amber.
5. Blocking / ownership gap / invalid dependency / ambiguous assignment: red.
6. Use clear status badges across all measure-related objects.
7. Use subtle color, not flashy consumer-app colors.

Navigation and IA requirements

Extend the existing left navigation and add / refine the Measures section.

Measures section should include:
• Measure Library
• Measure Designer
• Targets
• Relationships
• Graph Explorer
• Ownership Matrix
• Approvals
• Versions
• Impact Analysis

The Measures UX must integrate with the broader DWM navigation and allow cross-navigation to:
• Process
• PFC
• SOP
• SOP Step
• Positions
• Assignments

Do not create a disconnected or isolated module.

Core UX pages to generate

Generate all of the following complete pages and connected flows:

1. Measure Library
2. Measure Detail / Measure Designer
3. Measure Links tab
4. Measure Relationships tab
5. Measure Targets tab
6. Measure Source tab
7. Measure Ownership tab
8. Measure Versions tab
9. Measure Impact tab
10. Measure History tab
11. Measure Graph Explorer
12. Ownership Matrix Workbench
13. Target Manager
14. Measure Approval Review Screen
15. Version Compare Screen

Each screen must be a proper, realistic enterprise application screen, not just a rough wireframe.

Core UX behavior requirements

1. Every measure screen must clearly show:
   • Measure Code
   • Measure Name
   • Measure Type
   • Status
   • Owner Position
   • Responsible Person by Context
   • Version
   • Criticality

2. Every measure screen must support context awareness using the same platform context model:
   • Enterprise
   • Region
   • Site
   • Department
   • Line
   • Shift
   • Product Family

Only show enabled context dimensions in the UX, but design the layout to support all of them in a configurable way.

3. Ownership must be shown in 2 layers:
   • Owner Position
   • Responsible Person by Context

4. Show ownership resolution states clearly:
   • Resolved
   • Ownership Gap
   • Ambiguous Assignment
   • Invalid Context

5. Measures use a flexible graph model, not a strict tree. The UX must visually support:
   • one measure contributing to multiple parent measures
   • one measure having multiple child measures
   • shared measures

6. Include a graph legend to distinguish:
   • KPI
   • MP
   • MOP
   • CP
   • relationship direction
   • contribution vs dependency vs rollup vs derived relationships

7. Approval and review screens must consolidate:
   • object summary
   • ownership
   • validations
   • links
   • targets
   • graph relationships
   • impact summary
   • version changes
   • action buttons

8. The UX must feel immediately usable by:
   • Measure Authors
   • Process Owners
   • Reviewers / Approvers
   • Business Leads
   • Admin / Governance users

Screen-level design guidance

A. Measure Library
Create a compact enterprise data-grid screen with:
• search bar
• filter row
• create measure button
• columns for code, name, type, owner position, resolution status, frequency, criticality, status, linked object count, active target flag
• detail preview or slide-out panel
• saved filter capable layout styling

B. Measure Designer
Create a multi-tab detail page with:
• Overview
• Links
• Relationships
• Targets
• Source
• Ownership
• Versions
• Impact
• History

This must feel like a serious authoring workspace.

C. Overview tab
Design a structured, compact form with:
• Measure Code
• Measure Name
• Measure Type
• Description
• Owner Position
• Unit of Measure
• Source Type
• Frequency
• Criticality
• Effective Dates

D. Links tab
Design a table + add-link workflow:
• linked object type
• linked object id/name
• scope type
• source service
• status
Add workflow should be:
1. choose linked object type
2. search/select object
3. choose scope
4. save

E. Relationships tab
Design a split or dual-section layout that clearly shows:
• parent measures
• child measures
with relationship direction clearly labeled:
• “This measure contributes to”
• “This measure is contributed by”

F. Targets tab
Design a compact threshold management table with:
• target type
• target value
• lower limit
• upper limit
• warning threshold
• critical threshold
• context scope chips
• effective dates
• status
Show inline validation for bad ranges and overlapping scoped targets.

G. Source tab
Design a source configuration page that adapts by source type:
• MANUAL
• SYSTEM
• CALCULATED
• HYBRID
SYSTEM and HYBRID should expose:
• source system
• source entity
• source field
• extraction rule
• transformation rule

H. Ownership tab
Design a context-aware ownership matrix with configurable dimensions.
It must work well for large organizations with Enterprise → Region → Site.
Show:
• context columns
• owner position
• responsible person
• resolution status
• last refreshed
Provide visual highlighting for ownership gaps and ambiguity.

I. Graph Explorer
Design a canvas-based graph explorer.
Include:
• selected measure summary
• zoom / fit controls
• expand upstream / downstream
• node detail panel
• graph legend
The graph must clearly support shared measures and multiple parent relationships.

J. Target Manager
Design a workbench-like grid for bulk viewing of targets across measures and contexts.

K. Approval Review Screen
Design a reviewer workbench page with:
• measure summary
• ownership card
• validation summary panel
• links summary
• targets summary
• relationship summary
• impact summary
• comments
• action bar with Approve / Reject / Request Changes

L. Version Compare Screen
Design a side-by-side or structured diff view for measure versions.
Group changes by:
• Overview fields
• Owner changes
• Source changes
• Link additions/removals
• Relationship changes
• Target changes
• Lifecycle changes

Reusable components required

Generate a component library extension for the Measures module including:
• Measure Header Card
• Measure Type Badge (KPI / MP / MOP / CP)
• Ownership Card
• Context Chips
• Validation Summary Panel
• Relationship Direction Badge
• Threshold Range Editor
• Graph Legend Panel
• Status Badges
• Impact Severity Banner
• Version Diff Block

Interaction and prototype requirements

Create interactive prototype links for the following journeys:

Journey 1 – Create Measure
Measure Library → Create Measure → Overview → Links → Targets → Submit

Journey 2 – Explore Graph
Measure Library → Open Measure → Relationships → Graph Explorer → Select Related Measure

Journey 3 – Ownership Investigation
Measure Library → Open Measure → Ownership → Ownership Matrix Workbench → Assignment-related drillthrough placeholder

Journey 4 – Review and Approve
Approvals → Measure Approval Review Screen → Version Compare → Approve

Journey 5 – Impact Review
Measure Detail → Targets → Save Change → Impact Tab

Consistency requirements with existing UX

1. Reuse the same left nav, header style, filter bar pattern, card style, badge style, modal style, and table density from the existing 1.2 UX.
2. Do not redesign the whole application from scratch.
3. Treat this as a new module plugged into the existing DWM platform.
4. Preserve the same overall visual language as the 1.2 screens already generated.

Layout density requirements

1. Keep table rows compact.
2. Avoid giant cards or oversized headers.
3. Use a structured enterprise grid.
4. Keep most screens usable without excessive scrolling.
5. Prioritize clarity and productivity over visual decoration.

Final output expected

Generate:
• All listed pages
• Measures-specific component library
• Interactive prototype links between screens
• Professional enterprise light theme
• Compact, crisp, desktop-first layouts
• High-fidelity realistic UI, not low-fidelity wireframes