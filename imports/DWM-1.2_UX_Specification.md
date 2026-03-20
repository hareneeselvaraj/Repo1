----- START FILE: 10_UX_Specification.md -----
# Daily Work Management (DWM) Platform
## UX Specification

Version: 1.0
Architecture Style: Microservices
Scope: Core Platform – Standardization First

---

# 1. Purpose

This document defines the UX specification for the DWM platform core module set.

It covers:

- information architecture
- navigation model
- primary screens
- interaction patterns
- validation and status behavior
- role-based UX variations
- ownership and context display standards
- workflow and approval interactions

This document is intended for:

- product owners
- UX designers
- frontend developers
- solution architects
- QA teams

---

# 2. UX Design Principles

## 2.1 Ownership Must Always Be Visible

Because ownership is position-based and resolved to people through assignment, every relevant business screen must clearly show:

- owner position
- current responsible person
- context of responsibility
- resolution status

Display standard:

```text
Owner Position: Production Supervisor
Responsible Person: Ravi Kumar
Context: Chennai / Line 1 / Day Shift
Resolution Status: Resolved
If unresolved:
Owner Position: Production Supervisor
Responsible Person: Not Resolved
Resolution Status: Ownership Gap
________________________________________
2.2 Context Must Be Explicit but Configurable
The platform is multi-industry and configuration-driven, so the UI must:
•	show only enabled context dimensions
•	keep context placement consistent
•	support filtering and scoping by context
•	avoid hardcoding manufacturing-only layouts
Examples of context chips:
•	Site: Chennai
•	Department: Assembly
•	Line: Line 1
•	Shift: Day
________________________________________
2.3 Standards Must Be Traceable
Users should be able to navigate clearly across the standardization chain:
Process → PFC → SOP → Step → Measure
Every screen should provide both upstream and downstream references.
Example in SOP screen:
•	linked process
•	linked PFC
•	linked measures
•	impacted downstream items
________________________________________
2.4 Draft vs Active State Must Be Obvious
All governed objects should visually show status.
Recommended statuses:
•	Draft
•	Submitted
•	Under Review
•	Approved
•	Effective
•	Superseded
•	Retired
Use consistent status treatment across screens.
________________________________________
2.5 Review Work Must Be Efficient
Reviewers and approvers should not be forced to open many screens to make decisions.
Approval UX should provide:
•	business summary
•	ownership summary
•	change summary
•	version comparison
•	validation warnings
•	downstream impact summary
________________________________________
3. Primary User Roles and UX Behavior
3.1 Platform Administrator
Needs:
•	tenant config
•	org setup
•	context setup
•	user/role administration
•	governance policies
UI preference:
•	administration-heavy views
•	matrix/table views
•	configuration panels
________________________________________
3.2 Org / Function Admin
Needs:
•	position creation
•	role sheet maintenance
•	person assignment
•	delegation management
UI preference:
•	form + table hybrid
•	org tree and assignment views
________________________________________
3.3 Process Owner
Needs:
•	process registry
•	PFC authoring
•	SOP review
•	measure mapping
•	ownership visibility
UI preference:
•	object-centric workspace
•	dependency visualization
•	traceability links
________________________________________
3.4 Standard Author
Needs:
•	create and edit SOPs
•	attach files
•	step authoring
•	compare versions
UI preference:
•	document/editor style UX
•	step-by-step structured editing
________________________________________
3.5 Reviewer / Approver
Needs:
•	inbox
•	compare versions
•	see impact and validations
•	approve/reject/request changes
UI preference:
•	task-driven dashboard
•	concise but rich review panels
________________________________________
3.6 Operator / Consumer of Standards
Needs:
•	browse active SOPs
•	see effective version only
•	search by context/process
•	read steps clearly
UI preference:
•	simplified view
•	read-first experience
•	mobile friendliness if needed later
________________________________________
4. Information Architecture
4.1 Top-Level Navigation
Recommended left navigation:
Dashboard
Organization
Positions
Role Sheets
People
Assignments
Processes
Standardization
Measures
Governance
Notifications
Audit / History
Administration
For a simplified tenant, sections can be hidden by configuration.
________________________________________
4.2 Standardization Navigation Model
Inside Standardization domain, recommended secondary navigation:
Process Registry
PFC Designer
SOP Library
Drafts
Approvals
Version History
Impact Analysis
________________________________________
4.3 Object-Centric Deep Navigation
Every core object detail page should show tabs:
Recommended pattern:
Overview | Ownership | Linked Items | History | Audit
Example for Process:
•	Overview
•	Participants
•	Linked PFCs
•	Linked SOPs
•	Measures
•	History
Example for SOP:
•	Overview
•	Steps
•	Linked Measures
•	Attachments
•	Approval History
•	Versions
•	Impact
________________________________________
5. Global UX Components
5.1 Global Header
Should include:
•	tenant / organization selector if applicable
•	global search
•	notifications
•	approval tasks count
•	user menu
________________________________________
5.2 Global Search
Search must support:
•	process code/name
•	SOP code/title
•	position
•	person
•	measure
•	role sheet
•	approval request id
Recommended filters:
•	object type
•	status
•	context
•	owner position
•	responsible person
________________________________________
5.3 Context Selector Bar
When enabled by tenant configuration, show a context filter bar at top of workspace.
Example:
Site [Chennai ▼]  Department [Assembly ▼]  Line [Line 1 ▼]  Shift [Day ▼]
Rules:
•	filters only show enabled context dimensions
•	selection influences lists and resolution displays
•	current filter context must be visible
________________________________________
5.4 Status Badge Component
A reusable badge component should be used across all business objects.
Examples:
•	DRAFT
•	SUBMITTED
•	APPROVED
•	EFFECTIVE
•	SUPERSEDED
•	OWNERSHIP GAP
•	BLOCKED
________________________________________
5.5 Ownership Card Component
Reusable component showing:
•	owner position
•	resolved person
•	context
•	resolution status
•	delegation indicator
•	backup owner if configured
________________________________________
5.6 Validation Summary Panel
Reusable component for edit/review screens.
Shows:
•	blocking errors
•	warnings
•	recommendations
Sections:
•	Structural validation
•	Policy validation
•	Dependency warnings
•	Context issues
________________________________________
6. Screen Specifications
6.1 Dashboard
Purpose
Provide role-specific landing page.
Audience
All users.
Widgets (configurable by role)
•	pending approvals
•	ownership gaps
•	recently updated standards
•	assignments expiring soon
•	draft standards requiring action
•	impact analyses pending review
Key UX behavior
•	widgets adapt by role
•	clicking widget opens filtered workbench
•	dashboard must be configurable by tenant/role
________________________________________
6.2 Organization Screen
Purpose
Manage and view org hierarchy.
Layout
Left:
•	hierarchy tree
Right:
•	selected org unit details
•	linked positions
•	linked heads
•	related statistics
Core actions
•	create org unit
•	edit org unit
•	activate/deactivate org unit
•	assign org head
Required fields
•	code
•	name
•	type
•	parent
•	active flag
•	effective dates
UX considerations
•	prevent accidental hierarchy mistakes
•	show breadcrumb path
•	show child count
•	warn before deactivation if dependencies exist
________________________________________
6.3 Position Catalog Screen
Purpose
Manage positions.
Layout
Top:
•	filters
•	search
•	create button
Middle:
•	grid/list of positions
Right drawer or details panel:
•	selected position metadata
•	linked role sheets
•	active assignments
•	linked processes/measures count
Columns
•	position code
•	position name
•	scope type
•	org unit
•	reports to
•	active flag
•	can own / review / approve indicators
Actions
•	create position
•	edit position
•	deactivate
•	open role sheet
•	view assignments
________________________________________
6.4 Role Sheet Editor
Purpose
Create and maintain multi-level role sheets.
Layout
Header:
•	role sheet title
•	level
•	linked position
•	version
•	status
Main area with tabs:
•	Purpose
•	Responsibilities
•	Process References
•	Measure References
•	Authority Matrix
•	Competencies
•	Inheritance / Composition
•	History
Core interactions
•	add responsibility rows
•	map processes/measures
•	edit authority matrix
•	compare inherited vs current
•	submit for approval
Critical UX feature
Inheritance visualization.
Display sections:
Inherited From:
- Enterprise Role Sheet
- Site Role Sheet
- Department Role Sheet

Overridden At Current Level:
- Added responsibilities
- Removed items
- Modified authorities
Validation behavior
Warn if:
•	no linked position for position-level role sheet
•	conflicting authority matrix
•	invalid inheritance chain
________________________________________
6.5 People Directory
Purpose
View and manage people records.
Layout
Search + filters at top
Grid/list in main area
Details panel on selection
Key fields
•	employee code
•	full name
•	email
•	home org
•	employment type
•	status
Actions
•	create person
•	edit person
•	deactivate
•	view assignments
•	view effective responsibilities
________________________________________
6.6 Assignment Console
Purpose
Assign people to positions with context.
Layout
Left:
•	person search and selected person card
Center:
•	active assignments list
Right:
•	create/edit assignment form
Assignment form fields
•	person
•	position
•	assignment type
•	primary flag
•	effective from/to
•	context fields (dynamic based on config)
UX rules
•	only enabled context fields shown
•	required fields marked dynamically from config
•	overlap warning shown before save
•	deactivation impact warning shown if assignment drives active ownership
Important view
Assignment list should show:
•	position
•	context summary
•	primary flag
•	status
•	effective date range
________________________________________
6.7 Responsibility Overlay Screen
Purpose
Handle person-specific overrides on top of role sheet.
Layout
Header:
•	person
•	position
•	assignment context
Panels:
1.	inherited profile
2.	pending overrides
3.	effective result
4.	history
Key UX feature
Three-column compare table:
Item	Inherited Value	Override	Effective Result
Supported actions
•	add override
•	remove inherited responsibility
•	modify target/authority reference
•	set effective date range
•	submit for approval if required
UX warnings
•	changing approval rights may violate policy
•	removing process ownership may create orphan ownership
•	expiring overlay may affect downstream responsibilities
________________________________________
6.8 Delegation / Acting Assignment Screen
Purpose
Create time-bound delegated authority.
Fields
•	source person / position
•	delegate person
•	delegated scope
•	effective dates
•	reason
UX behavior
•	show overlapping delegations warning
•	show affected approval/workflow scopes
•	show automatic expiry date clearly
________________________________________
6.9 Process Registry Screen
Purpose
Create and maintain processes.
Layout
Top:
•	search, filters, create process
Center:
•	process table
Details panel / page:
•	overview
•	participants
•	linked PFCs
•	linked SOPs
•	linked measures
•	history
Table columns
•	process code
•	process name
•	owner position
•	resolved owner person
•	category
•	criticality
•	status
Create/Edit form fields
•	process code
•	process name
•	description
•	owner position
•	criticality
•	category
•	applicable scope
•	participants
UX must show
•	owner position and resolved person side by side
•	participant role types clearly
•	dependency warnings before activation
________________________________________
6.10 PFC Designer
Purpose
Create and edit Process Flow Charts.
Layout
Top toolbar:
•	save
•	validate
•	submit
•	version compare
•	zoom
•	node palette
Left panel:
•	node palette
•	properties summary
Center:
•	flow canvas
Right panel:
•	selected node properties
Supported node types
•	Start
•	End
•	Activity
•	Decision
•	Handoff
•	Inspection
•	Rework
•	Escalation
•	Exception
•	External Interface
Node property fields
•	node code
•	node name
•	node type
•	responsible position
•	critical flag
•	exception flag
•	rework flag
•	metadata
Core UX requirements
•	drag and connect nodes
•	inline validation of invalid connectors
•	highlight orphan nodes
•	show unresolved responsible positions
•	enable quick link to downstream SOP creation
Important addition
Contextual and ownership ribbon at top:
Process: Assembly Line Operation
Owner Position: Production Supervisor
Responsible Person: Ravi Kumar
Status: Draft
________________________________________
6.11 SOP Library
Purpose
Browse all SOPs.
List columns
•	SOP code
•	title
•	linked process
•	owner position
•	resolved owner
•	version
•	status
•	effective date
Filters
•	process
•	owner position
•	status
•	context
•	reviewer
•	approver
Actions
•	open SOP
•	create SOP
•	compare versions
•	view history
•	revise
________________________________________
6.12 SOP Editor
Purpose
Create and edit SOPs with structured steps.
Layout
Header:
•	title
•	code
•	status
•	version
•	ownership card
•	linked process/PFC references
Main content tabs:
•	Overview
•	Steps
•	Measures
•	Attachments
•	Approval
•	Versions
•	Impact
Overview tab
Fields:
•	SOP code
•	title
•	linked process
•	linked PFC
•	owner/reviewer/approver positions
•	effective dates
•	change summary
Steps tab
Table + form hybrid.
Columns:
•	sequence
•	step title
•	responsible position
•	linked PFC node
•	evidence required
•	criticality indicator
Actions:
•	add step
•	reorder steps
•	duplicate step
•	delete step
•	link measure
•	link checkpoint
Step detail form
Fields:
•	title
•	description
•	responsible position
•	input definition
•	output definition
•	evidence requirement
•	safety note
•	quality note
•	timing rule
•	conditional expression
Critical UX requirement
Step editor must be structured, not only rich text.
________________________________________
6.13 Version Compare Screen
Purpose
Compare two versions of governed object.
Supported objects
•	role sheet
•	PFC
•	SOP
•	measure
Layout
Left:
•	from version
Right:
•	to version
Center / inline diff:
•	changed fields
•	added/removed steps
•	changed ownership
•	changed measures
•	changed attachments
UX notes
•	changes must be grouped by section
•	reviewer should not manually hunt for differences
•	highlight dependency-impacting changes
________________________________________
6.14 Measure Designer
Purpose
Create and link measures.
Layout
Header:
•	measure title/code
•	type
•	status
•	owner position
Tabs:
•	Definition
•	Targets
•	Links
•	Source
•	History
Definition fields
•	measure code
•	name
•	type (KPI/MP/MOP/CP)
•	owner position
•	unit of measure
•	formula
•	source type
•	frequency
•	criticality
Targets tab
•	target type
•	target value
•	lower / upper limits
•	context scope
•	effective dates
Links tab
•	linked object type
•	linked object
•	link scope type
UX behavior
•	show upstream/downstream traceability
•	show whether measure is linked to process/PFC/SOP/step
•	warn if no links before publish
________________________________________
6.15 Approval Inbox
Purpose
Allow reviewers and approvers to process pending tasks.
Layout
Left:
•	filter panel
Center:
•	approval task list
Right:
•	selected task review panel
Task list columns
•	object type
•	object title/code
•	submitted by
•	current step
•	pending since
•	due date
•	severity/impact indicator
Review panel sections
•	object summary
•	ownership card
•	validation summary
•	version changes
•	downstream impact
•	comments history
•	action buttons
Action buttons
•	Approve
•	Reject
•	Request Changes
This screen is critical for governance usability.
________________________________________
6.16 Impact Analysis Screen
Purpose
Display downstream dependencies affected by a change.
Layout
Header:
•	source object summary
Main area:
•	impact severity summary
•	impacted object list
•	recommended actions
Columns
•	impacted object type
•	impacted object id/title
•	severity
•	action required
•	blocking flag
UX behavior
•	group by severity
•	allow filtering by blocking items
•	link directly to impacted object
•	show “must review before activation” clearly
________________________________________
6.17 Audit / History Screen
Purpose
Provide full traceability.
Tabs
•	Change Log
•	Approval History
•	Event History
•	Version History
Key columns
•	timestamp
•	actor
•	action
•	object type
•	object id
•	old/new summary
•	reason
UX behavior
•	searchable by object id/code
•	filter by actor/date range/action
•	export capability optional later
________________________________________
7. Form Interaction Rules
7.1 Save Modes
All edit screens should support:
•	Save Draft
•	Submit for Approval
•	Cancel / Discard
________________________________________
7.2 Validation Behavior
Inline validation
Used for:
•	required fields
•	field format
•	simple enum rules
Section-level validation
Used for:
•	missing step sequence
•	missing required ownership
•	invalid context
Submission validation
Used for:
•	policy rules
•	dependency rules
•	approval readiness
________________________________________
7.3 Unsaved Changes Handling
If user attempts to navigate away:
•	show unsaved changes prompt
•	allow save draft
•	allow discard
________________________________________
8. UX Status and Messaging Standards
8.1 Success Messages
Use concise messages:
•	“Process saved as Draft”
•	“SOP submitted for approval”
•	“Measure published successfully”
8.2 Warning Messages
Use for non-blocking issues:
•	“No measure linked yet”
•	“Backup owner is not configured”
•	“Critical step has no evidence rule”
8.3 Blocking Errors
Use for submission/activation blockers:
•	“Owner Position is required”
•	“PFC must contain exactly one Start node”
•	“No active assignment found for owner position”
________________________________________
9. Role-Based Access in UX
9.1 View vs Edit vs Approve
Each screen should support:
•	read-only mode
•	edit mode
•	approval mode
Example:
Operator can view effective SOP but cannot edit.
Reviewer can comment and approve.
Author can edit while draft/rework only.
________________________________________
9.2 Field-Level Disable Rules
Examples:
•	approved/effective objects become non-editable unless revision initiated
•	approval fields read-only to non-governance users
•	context fields disabled if locked by configuration
________________________________________
10. Responsive and Layout Guidance
10.1 Desktop First
Current module scope is best optimized for desktop because:
•	tables
•	process mapping
•	PFC canvas
•	structured forms
10.2 Future Mobile Consideration
Operator-facing read screens and approval tasks can later have mobile-optimized views.
________________________________________
11. Design System Recommendations
Recommended reusable components:
•	Status Badge
•	Ownership Card
•	Context Chips
•	Validation Panel
•	Version Diff Viewer
•	Approval Action Bar
•	Impact Severity Banner
•	Object Link Breadcrumb
•	Audit Timeline
________________________________________
12. UX for Key Edge Scenarios
12.1 Ownership Gap
Where shown:
•	process detail
•	SOP detail
•	approval review panel
•	dashboard widget
UX treatment:
•	red badge or blocking alert
•	clear recommended next step: “Create or activate assignment”
________________________________________
12.2 Ambiguous Assignment
UX treatment:
•	warning banner
•	show matched assignments
•	require admin resolution
•	provide link to Assignment Console
________________________________________
12.3 Superseded Standard
UX treatment:
•	read-only
•	clear superseded banner
•	direct link to active version
________________________________________
12.4 Blocking Impact
In activation/review flows:
•	show blocking item count prominently
•	prevent activation action
•	direct navigation to impact details
________________________________________
13. Recommended User Journeys
13.1 Standardization Author Journey
1.	Open Process Registry
2.	Select process
3.	Create / update PFC
4.	Create SOP from PFC
5.	Add structured steps
6.	Link measures
7.	Validate
8.	Submit for approval
13.2 Reviewer Journey
1.	Open Approval Inbox
2.	Select submitted object
3.	Review summary, ownership, validations, impact
4.	Compare versions if needed
5.	Approve / reject / request changes
13.3 Admin Journey
1.	Configure contexts
2.	Create positions
3.	create role sheets
4.	create people and assignments
5.	resolve gaps
6.	support governance
________________________________________
14. Relationship to Other Documents
This document should be used with:
•	01_Functional_Specification.md
•	03_Process_Flows.md
•	04_System_Design.md
•	05_Technical_Specification.md
•	07_Data_Contracts.md
________________________________________
15. Future AI UX Extensions (Deferred)
Later AI addendum files may add UX patterns for:
•	AI suggestion side panels
•	SOP generation assistant
•	measure recommendation assistant
•	explanation drawer
•	accept/reject AI suggestion controls
•	confidence indicators
These are intentionally excluded from the core UX design in Phase 1.

----- END FILE -----

