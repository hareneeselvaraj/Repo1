// ─── DWM Platform – Mock Data ───────────────────────────────────────────────
// No hardcoded values inside components – all data sourced from here.

export const currentUser = {
  name: "Ravi Kumar",
  role: "Process Owner",
  email: "ravi.kumar@dwm.corp",
  initials: "RK",
  tenant: "AcmeMfg",
};

export const currentContext = {
  site: "Chennai",
  department: "Assembly",
  line: "Line 1",
  shift: "Day",
};

export const contextOptions = {
  sites: ["Chennai", "Mumbai", "Pune"],
  departments: ["Assembly", "Quality Control", "Logistics", "Maintenance"],
  lines: ["Line 1", "Line 2", "Line 3"],
  shifts: ["Day", "Night", "General"],
};

export const kpiStats = {
  pendingApprovals: 8,
  ownershipGaps: 5,
  activeSOPs: 247,
  assignmentsExpiring: 3,
  draftStandards: 12,
  impactPending: 4,
};

export type ApprovalSeverity = "high" | "medium" | "low";
export type ApprovalStatus = "Submitted" | "Under Review" | "Approved";

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  step: string;
  dueDate: string;
  severity: ApprovalSeverity;
  status: ApprovalStatus;
}

export const pendingApprovals: ApprovalItem[] = [
  {
    id: "APR-2026-001",
    type: "SOP",
    title: "Assembly Line Setup Rev 2.1",
    submittedBy: "Priya Nair",
    submittedAt: "2026-03-10",
    step: "Reviewer",
    dueDate: "2026-03-15",
    severity: "high",
    status: "Under Review",
  },
  {
    id: "APR-2026-002",
    type: "Role Sheet",
    title: "Production Supervisor Role Sheet v3",
    submittedBy: "Anand Raj",
    submittedAt: "2026-03-09",
    step: "Approver",
    dueDate: "2026-03-16",
    severity: "medium",
    status: "Submitted",
  },
  {
    id: "APR-2026-003",
    type: "PFC",
    title: "Engine Assembly Process Flow",
    submittedBy: "Deepa Krishnan",
    submittedAt: "2026-03-08",
    step: "Approver",
    dueDate: "2026-03-14",
    severity: "high",
    status: "Under Review",
  },
  {
    id: "APR-2026-004",
    type: "Measure",
    title: "First Pass Yield KPI",
    submittedBy: "Suresh Babu",
    submittedAt: "2026-03-07",
    step: "Reviewer",
    dueDate: "2026-03-18",
    severity: "low",
    status: "Submitted",
  },
  {
    id: "APR-2026-005",
    type: "SOP",
    title: "Quality Checkpoint SOP v1.3",
    submittedBy: "Meena Sundaram",
    submittedAt: "2026-03-06",
    step: "Reviewer",
    dueDate: "2026-03-19",
    severity: "medium",
    status: "Submitted",
  },
  {
    id: "APR-2026-006",
    type: "Process",
    title: "Incoming Goods Receiving Process",
    submittedBy: "Ramesh Pillai",
    submittedAt: "2026-03-05",
    step: "Approver",
    dueDate: "2026-03-20",
    severity: "low",
    status: "Submitted",
  },
];

export interface OwnershipGap {
  id: string;
  position: string;
  orgUnit: string;
  context: string;
  gapType: string;
  since: string;
  affectedItems: number;
}

export const ownershipGaps: OwnershipGap[] = [
  {
    id: "GAP-001",
    position: "Quality Inspector",
    orgUnit: "Chennai / QC Department",
    context: "Line 1 / Day Shift",
    gapType: "No active assignment",
    since: "2026-03-05",
    affectedItems: 3,
  },
  {
    id: "GAP-002",
    position: "Process Engineer",
    orgUnit: "Chennai / Assembly",
    context: "Line 2 / Night Shift",
    gapType: "Assignment expired",
    since: "2026-03-01",
    affectedItems: 7,
  },
  {
    id: "GAP-003",
    position: "Shift Supervisor",
    orgUnit: "Mumbai / Production",
    context: "Line 3 / General",
    gapType: "Ambiguous assignment",
    since: "2026-03-08",
    affectedItems: 2,
  },
  {
    id: "GAP-004",
    position: "Maintenance Lead",
    orgUnit: "Pune / Maintenance",
    context: "General",
    gapType: "No active assignment",
    since: "2026-03-02",
    affectedItems: 5,
  },
  {
    id: "GAP-005",
    position: "Safety Officer",
    orgUnit: "Chennai / HSE",
    context: "All Shifts",
    gapType: "Expiring soon",
    since: "2026-03-10",
    affectedItems: 4,
  },
];

export type ActivityType = "approval" | "creation" | "update" | "publish" | "link" | "resolve";

export interface ActivityItem {
  id: string;
  action: string;
  object: string;
  actor: string;
  timestamp: string;
  type: ActivityType;
}

export const recentActivity: ActivityItem[] = [
  { id: "ACT-001", action: "SOP Approved", object: "Welding Process SOP v1.2", actor: "Suresh Babu", timestamp: "Today 09:45", type: "approval" },
  { id: "ACT-002", action: "Position Created", object: "Senior Process Engineer", actor: "Admin", timestamp: "Today 09:12", type: "creation" },
  { id: "ACT-003", action: "Assignment Updated", object: "Ravi Kumar → Prod. Supervisor", actor: "HR Admin", timestamp: "Today 08:55", type: "update" },
  { id: "ACT-004", action: "PFC Published", object: "Final Assembly PFC v2.0", actor: "Deepa Krishnan", timestamp: "Yesterday 17:30", type: "publish" },
  { id: "ACT-005", action: "Measure Linked", object: "Cycle Time MP → Assembly SOP", actor: "Anand Raj", timestamp: "Yesterday 16:00", type: "link" },
  { id: "ACT-006", action: "Ownership Gap Resolved", object: "QC Inspector / Chennai L2", actor: "Org Admin", timestamp: "Yesterday 14:20", type: "resolve" },
];

export interface DraftStandard {
  id: string;
  type: string;
  title: string;
  version: string;
  lastModified: string;
  owner: string;
}

export const draftStandards: DraftStandard[] = [
  { id: "DFT-001", type: "SOP", title: "Incoming Material Inspection SOP", version: "v1.0", lastModified: "2026-03-11", owner: "Meena S." },
  { id: "DFT-002", type: "PFC", title: "Packaging Process Flow Chart", version: "v2.1", lastModified: "2026-03-10", owner: "Anand R." },
  { id: "DFT-003", type: "Role Sheet", title: "Warehouse Supervisor Role Sheet", version: "v1.0", lastModified: "2026-03-09", owner: "Priya N." },
  { id: "DFT-004", type: "SOP", title: "Calibration Procedure Rev 3", version: "v3.0", lastModified: "2026-03-09", owner: "Suresh B." },
  { id: "DFT-005", type: "Measure", title: "Scrap Rate KPI Definition", version: "v1.0", lastModified: "2026-03-08", owner: "Deepa K." },
];

export interface TaskItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  overdue: boolean;
}

export const myTasks: TaskItem[] = [
  { id: "TSK-001", title: "Review Assembly Line SOP v2.1", type: "Review", dueDate: "Mar 15", priority: "high", overdue: false },
  { id: "TSK-002", title: "Approve Production Supervisor Role Sheet", type: "Approve", dueDate: "Mar 16", priority: "medium", overdue: false },
  { id: "TSK-003", title: "Resolve QC Inspector Ownership Gap", type: "Action", dueDate: "Mar 10", priority: "high", overdue: true },
];

// Chart data
export const standardsStatusData = [
  { name: "Effective", value: 186, color: "#16a34a" },
  { name: "Approved", value: 31, color: "#2563eb" },
  { name: "Under Review", value: 18, color: "#d97706" },
  { name: "Draft", value: 12, color: "#9ca3af" },
  { name: "Superseded", value: 9, color: "#9333ea" },
];

export const approvalTrendData = [
  { month: "Oct", submitted: 12, approved: 10, rejected: 2 },
  { month: "Nov", submitted: 18, approved: 14, rejected: 4 },
  { month: "Dec", submitted: 9, approved: 9, rejected: 0 },
  { month: "Jan", submitted: 22, approved: 17, rejected: 3 },
  { month: "Feb", submitted: 15, approved: 12, rejected: 2 },
  { month: "Mar", submitted: 8, approved: 3, rejected: 1 },
];

export const ownershipHealthData = [
  { name: "Resolved", value: 142, color: "#16a34a" },
  { name: "Gaps", value: 5, color: "#dc2626" },
  { name: "Expiring", value: 3, color: "#d97706" },
];

// Navigation structure
export const navGroups = [
  {
    label: "Main",
    items: [{ id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", badge: null }],
  },
  {
    label: "Organization",
    items: [
      { id: "organization", label: "Organization", icon: "Building2", badge: null },
      { id: "positions", label: "Positions", icon: "Briefcase", badge: null },
      { id: "role-sheets", label: "Role Sheets", icon: "FileText", badge: null },
      { id: "people", label: "People", icon: "Users", badge: null },
      { id: "assignments", label: "Assignments", icon: "UserCheck", badge: "3" },
    ],
  },
  {
    label: "Standards",
    items: [
      { id: "processes",        label: "Processes",         icon: "GitBranch", badge: null },
      { id: "standardization",  label: "Standardization",   icon: "BookOpen",  badge: null },
      { id: "process-designer", label: "Process Designer",  icon: "FileText",  badge: null },
      { id: "pfc-designer",     label: "PFC Designer",      icon: "Layers",    badge: null },
      { id: "sop-library",      label: "SOP Library",       icon: "BookOpen",  badge: null },
      { id: "yokoten",          label: "Yokoten",            icon: "Globe",     badge: null },
      { id: "measures",         label: "Measures",           icon: "BarChart2", badge: null },
    ],
  },
  {
    // ── Module 1.5 Execution Layer ──────────────────────────────────────────
    label: "Execution",
    items: [
      { id: "boards",    label: "Boards",    icon: "LayoutGrid",     badge: "2" },
      { id: "my-work",   label: "My Work",   icon: "ClipboardCheck", badge: "5" },
      { id: "actions",   label: "Actions",   icon: "Wrench",         badge: "8" },
      { id: "meetings",  label: "Meetings",  icon: "CalendarDays",   badge: null },
    ],
  },
  {
    label: "Governance",
    items: [
      { id: "governance",    label: "Governance",    icon: "Shield",   badge: "8" },
      { id: "notifications", label: "Notifications", icon: "Bell",     badge: "4" },
      { id: "audit",         label: "Audit",         icon: "History",  badge: null },
    ],
  },
  {
    label: "System",
    items: [{ id: "administration", label: "Administration", icon: "Settings", badge: null }],
  },
];