// ─── Module 1.5 – Execution Layer Mock Data ───────────────────────────────────
// Consumes Measures (1.3), SOPs (1.4), Ownership (1.2) — no duplication.
// All KPI references use measureCode from standardsData.

export type KpiStatus      = "Normal" | "Warning" | "Critical" | "Missing";
export type KpiTrend       = "up" | "down" | "flat";
export type AbSeverity     = "Critical" | "High" | "Medium" | "Low";
export type AbType         = "Threshold Breach" | "Missing Signal" | "Delay" | "Manual Flag";
export type AbStatus       = "Open" | "Acknowledged" | "Resolved";
export type DispositionType = "ONE_OFF" | "MONITOR" | "RCA" | null;
export type ActionStatus   = "Open" | "In Progress" | "Resolved" | "Verified" | "Closed";
export type ActionSource   = "Abnormality" | "Meeting" | "Manual";
export type ActionPriority = "Critical" | "High" | "Medium" | "Low";
export type Tier         = "T1" | "T2" | "T3";

// ─── KPI Cell (Board display) ─────────────────────────────────────────────────
export interface KpiCell {
  id: string;
  measureCode: string;     // → links to 1.3 Measure
  name: string;
  value: number | string;
  target: number | string;
  unit: string;
  status: KpiStatus;
  trend: KpiTrend;
  abnormalities: number;   // count of open abnormalities
  actions: number;         // count of open actions
  lastUpdated: string;
  line: string;
  department: string;
  shift: string;
  sopRef: string;          // → links to 1.4 SOP
  processRef: string;      // → links to 1.2/1.4 Process
  ownerPosition: string;   // → links to 1.2 Position
  ownerPerson: string;
}

// ─── T1 Board KPIs (Line 1, Day Shift, Chennai / Assembly) ───────────────────
export const t1KpiCells: KpiCell[] = [
  {
    id: "KPI-T1-001",
    measureCode: "M-001",
    name: "First Pass Yield",
    value: 87.2, target: 92.0, unit: "%",
    status: "Warning", trend: "down",
    abnormalities: 1, actions: 2,
    lastUpdated: "10:45 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-ASM-003", processRef: "PRC-001",
    ownerPosition: "Assembly Lead", ownerPerson: "Ravi Kumar",
  },
  {
    id: "KPI-T1-002",
    measureCode: "M-002",
    name: "OEE",
    value: 71.4, target: 80.0, unit: "%",
    status: "Critical", trend: "down",
    abnormalities: 2, actions: 3,
    lastUpdated: "10:44 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-MNT-001", processRef: "PRC-001",
    ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
  },
  {
    id: "KPI-T1-003",
    measureCode: "M-003",
    name: "Cycle Time",
    value: "4.8", target: "5.2", unit: "min",
    status: "Normal", trend: "flat",
    abnormalities: 0, actions: 0,
    lastUpdated: "10:45 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-ASM-001", processRef: "PRC-001",
    ownerPosition: "Assembly Lead", ownerPerson: "Ravi Kumar",
  },
  {
    id: "KPI-T1-004",
    measureCode: "M-004",
    name: "Torque Compliance",
    value: 94.1, target: 98.0, unit: "%",
    status: "Warning", trend: "down",
    abnormalities: 1, actions: 1,
    lastUpdated: "10:43 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-ASM-002", processRef: "PRC-002",
    ownerPosition: "QC Inspector", ownerPerson: "Not Resolved",
  },
  {
    id: "KPI-T1-005",
    measureCode: "M-007",
    name: "Scrap Rate",
    value: 4.3, target: 2.5, unit: "%",
    status: "Critical", trend: "up",
    abnormalities: 2, actions: 2,
    lastUpdated: "10:40 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-QC-001", processRef: "PRC-003",
    ownerPosition: "Quality Lead", ownerPerson: "Meena Sundaram",
  },
  {
    id: "KPI-T1-006",
    measureCode: "M-008",
    name: "MTTR",
    value: 45, target: 30, unit: "min",
    status: "Warning", trend: "up",
    abnormalities: 1, actions: 1,
    lastUpdated: "09:55 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-MNT-002", processRef: "PRC-004",
    ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
  },
  {
    id: "KPI-T1-007",
    measureCode: "M-005",
    name: "Kit Lead Time",
    value: "2.1", target: "1.5", unit: "hrs",
    status: "Warning", trend: "up",
    abnormalities: 0, actions: 1,
    lastUpdated: "10:30 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-LOG-001", processRef: "PRC-005",
    ownerPosition: "Logistics Lead", ownerPerson: "Arun Sekar",
  },
  {
    id: "KPI-T1-008",
    measureCode: "M-006",
    name: "Applied Torque (CP)",
    value: "Missing", target: "45 Nm", unit: "Nm",
    status: "Missing", trend: "flat",
    abnormalities: 1, actions: 0,
    lastUpdated: "09:00 AM",
    line: "Line 1", department: "Assembly", shift: "Day",
    sopRef: "SOP-ASM-002", processRef: "PRC-002",
    ownerPosition: "Assembly Lead", ownerPerson: "Ravi Kumar",
  },
];

// ─── T2 Board – Department View (Assembly, Chennai) ──────────────────────────
export interface T2Row {
  lineId: string;
  lineName: string;
  kpiSummary: { critical: number; warning: number; normal: number; missing: number };
  kpis: { name: string; value: string; status: KpiStatus; trend: KpiTrend }[];
  openActions: number;
  escalated: boolean;
  shift: string;
}

export const t2BoardRows: T2Row[] = [
  {
    lineId: "L1", lineName: "Line 1",
    kpiSummary: { critical: 2, warning: 3, normal: 2, missing: 1 },
    kpis: [
      { name: "FPY",   value: "87.2%",  status: "Warning",  trend: "down" },
      { name: "OEE",   value: "71.4%",  status: "Critical", trend: "down" },
      { name: "Scrap", value: "4.3%",   status: "Critical", trend: "up"   },
      { name: "MTTR",  value: "45 min", status: "Warning",  trend: "up"   },
    ],
    openActions: 10, escalated: true, shift: "Day",
  },
  {
    lineId: "L2", lineName: "Line 2",
    kpiSummary: { critical: 0, warning: 2, normal: 5, missing: 0 },
    kpis: [
      { name: "FPY",   value: "93.5%", status: "Normal",  trend: "flat" },
      { name: "OEE",   value: "78.2%", status: "Warning", trend: "down" },
      { name: "Scrap", value: "1.8%",  status: "Normal",  trend: "flat" },
      { name: "MTTR",  value: "28 min",status: "Normal",  trend: "flat" },
    ],
    openActions: 3, escalated: false, shift: "Day",
  },
  {
    lineId: "L3", lineName: "Line 3",
    kpiSummary: { critical: 1, warning: 1, normal: 5, missing: 0 },
    kpis: [
      { name: "FPY",   value: "91.0%", status: "Normal",  trend: "up"   },
      { name: "OEE",   value: "82.5%", status: "Normal",  trend: "up"   },
      { name: "Scrap", value: "3.1%",  status: "Critical",trend: "up"   },
      { name: "MTTR",  value: "22 min",status: "Normal",  trend: "down" },
    ],
    openActions: 5, escalated: true, shift: "Day",
  },
];

// ─── T3 Board – Plant View (Chennai) ─────────────────────────────────────────
export interface T3Row {
  deptId: string;
  deptName: string;
  kpiSummary: { critical: number; warning: number; normal: number };
  kpis: { name: string; value: string; status: KpiStatus; trend: KpiTrend }[];
  openEscalations: number;
  persistentIssues: number;
}

export const t3BoardRows: T3Row[] = [
  {
    deptId: "D1", deptName: "Assembly",
    kpiSummary: { critical: 3, warning: 4, normal: 5 },
    kpis: [
      { name: "OEE",    value: "75.1%", status: "Warning",  trend: "down" },
      { name: "FPY",    value: "90.6%", status: "Warning",  trend: "flat" },
      { name: "Scrap",  value: "3.1%",  status: "Critical", trend: "up"  },
      { name: "Output", value: "342",   status: "Normal",   trend: "up"  },
    ],
    openEscalations: 3, persistentIssues: 2,
  },
  {
    deptId: "D2", deptName: "Quality Control",
    kpiSummary: { critical: 1, warning: 2, normal: 4 },
    kpis: [
      { name: "DPMO",    value: "1850", status: "Warning",  trend: "down" },
      { name: "Defects", value: "7",    status: "Warning",  trend: "up"  },
      { name: "CPPM",    value: "112",  status: "Critical", trend: "up"  },
      { name: "Pass %",  value: "97.2%",status: "Normal",   trend: "flat"},
    ],
    openEscalations: 1, persistentIssues: 1,
  },
  {
    deptId: "D3", deptName: "Logistics",
    kpiSummary: { critical: 0, warning: 1, normal: 5 },
    kpis: [
      { name: "OTIF",      value: "94.2%", status: "Normal",  trend: "up"  },
      { name: "Lead Time", value: "3.2d",  status: "Warning", trend: "up" },
      { name: "Kit Avail", value: "98.1%", status: "Normal",  trend: "flat"},
      { name: "Delays",    value: "2",     status: "Normal",  trend: "down"},
    ],
    openEscalations: 0, persistentIssues: 0,
  },
  {
    deptId: "D4", deptName: "Maintenance",
    kpiSummary: { critical: 0, warning: 3, normal: 3 },
    kpis: [
      { name: "Avail.",    value: "78.3%", status: "Warning", trend: "down"},
      { name: "MTTR",      value: "42 min",status: "Warning", trend: "up" },
      { name: "MTBF",      value: "6.4h",  status: "Warning", trend: "down"},
      { name: "PM Compl.", value: "91.0%", status: "Normal",  trend: "flat"},
    ],
    openEscalations: 1, persistentIssues: 1,
  },
];

// ─── Abnormalities ────────────────────────────────────────────────────────────
export interface Abnormality {
  id: string;
  kpiId: string;
  kpiName: string;
  type: AbType;
  severity: AbSeverity;
  detectedAt: string;
  description: string;
  status: AbStatus;
  line: string;
  department: string;
  linkedActionIds: string[];
  // ── Disposition (Delta 1.5) ──────────────────────────
  disposition: DispositionType;     // set at closure
  justification?: string;           // required for ONE_OFF / MONITOR
  repeatCount: number;              // # of same-type abn in last 7 days
  isRepeatFlag: boolean;            // true when repeatCount ≥ 2
  suggestedForRCA: boolean;         // system recommendation
}

export const abnormalities: Abnormality[] = [
  {
    id: "ABN-001",
    kpiId: "KPI-T1-002", kpiName: "OEE",
    type: "Threshold Breach", severity: "Critical",
    detectedAt: "09:12 AM",
    description: "OEE dropped to 71.4% — 8.6 pp below target. Equipment downtime on Station 3 contributing 62% of loss.",
    status: "Open",
    line: "Line 1", department: "Assembly",
    linkedActionIds: ["ACT-001", "ACT-002", "ACT-003"],
    disposition: null,
    repeatCount: 3, isRepeatFlag: true, suggestedForRCA: true,
  },
  {
    id: "ABN-002",
    kpiId: "KPI-T1-005", kpiName: "Scrap Rate",
    type: "Threshold Breach", severity: "Critical",
    detectedAt: "08:55 AM",
    description: "Scrap Rate at 4.3% — 1.8 pp above threshold. Root cause suspected: fixture alignment drift on Station 2.",
    status: "Acknowledged",
    line: "Line 1", department: "Assembly",
    linkedActionIds: ["ACT-004", "ACT-005"],
    disposition: null,
    repeatCount: 2, isRepeatFlag: true, suggestedForRCA: false,
  },
  {
    id: "ABN-003",
    kpiId: "KPI-T1-001", kpiName: "First Pass Yield",
    type: "Threshold Breach", severity: "High",
    detectedAt: "10:15 AM",
    description: "FPY declined from 91.1% to 87.2% over 2-hour window. Correlates with Torque Compliance drop.",
    status: "Open",
    line: "Line 1", department: "Assembly",
    linkedActionIds: ["ACT-006"],
    disposition: null,
    repeatCount: 1, isRepeatFlag: false, suggestedForRCA: false,
  },
  {
    id: "ABN-004",
    kpiId: "KPI-T1-004", kpiName: "Torque Compliance",
    type: "Threshold Breach", severity: "High",
    detectedAt: "10:10 AM",
    description: "Torque compliance fell to 94.1% — below 98% spec. Tool calibration overdue on Station 4.",
    status: "Open",
    line: "Line 1", department: "Assembly",
    linkedActionIds: ["ACT-007"],
    disposition: null,
    repeatCount: 2, isRepeatFlag: true, suggestedForRCA: false,
  },
  {
    id: "ABN-005",
    kpiId: "KPI-T1-008", kpiName: "Applied Torque (CP)",
    type: "Missing Signal", severity: "High",
    detectedAt: "09:05 AM",
    description: "No torque signal received from Station 4 torque tool since 09:00 AM. Sensor may be offline.",
    status: "Open",
    line: "Line 1", department: "Assembly",
    linkedActionIds: [],
    disposition: null,
    repeatCount: 1, isRepeatFlag: false, suggestedForRCA: false,
  },
  {
    id: "ABN-006",
    kpiId: "KPI-T1-006", kpiName: "MTTR",
    type: "Delay", severity: "Medium",
    detectedAt: "09:50 AM",
    description: "MTTR at 45 min exceeds 30-min SLA. Maintenance ticket #MNT-2026-047 still open.",
    status: "Acknowledged",
    line: "Line 1", department: "Assembly",
    linkedActionIds: ["ACT-008"],
    disposition: null,
    repeatCount: 1, isRepeatFlag: false, suggestedForRCA: false,
  },
];

// ─── Actions ──────────────────────────────────────────────────────────────────
export interface ExecutionAction {
  id: string;
  title: string;
  kpiId: string;
  kpiName: string;
  abnormalityId?: string;
  ownerPosition: string;
  ownerPerson: string;
  dueDate: string;
  dueTime: string;
  priority: ActionPriority;
  status: ActionStatus;
  source: ActionSource;
  remarks: string;
  evidence: string[];
  createdAt: string;
  escalated: boolean;
  tier: Tier;
  line: string;
  department: string;
  shift: string;
  timeline: { at: string; actor: string; event: string }[];
}

export const executionActions: ExecutionAction[] = [
  {
    id: "ACT-001",
    title: "Investigate Station 3 downtime root cause",
    kpiId: "KPI-T1-002", kpiName: "OEE",
    abnormalityId: "ABN-001",
    ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
    dueDate: "2026-03-18", dueTime: "12:00 PM",
    priority: "Critical", status: "In Progress",
    source: "Abnormality",
    remarks: "Preliminary check shows bearing wear on main drive. Awaiting spare parts.",
    evidence: ["photo_station3.jpg"],
    createdAt: "09:14 AM",
    escalated: true,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "09:12 AM", actor: "System",         event: "Abnormality ABN-001 detected (OEE critical)" },
      { at: "09:14 AM", actor: "Ravi Kumar",      event: "Action created and assigned to Maintenance Lead" },
      { at: "09:45 AM", actor: "System",          event: "Escalated to T2 — SLA at 30 min exceeded" },
      { at: "10:02 AM", actor: "Priya Nair",      event: "Status updated to In Progress" },
    ],
  },
  {
    id: "ACT-002",
    title: "Plan emergency maintenance for Station 3",
    kpiId: "KPI-T1-002", kpiName: "OEE",
    abnormalityId: "ABN-001",
    ownerPosition: "Shift Supervisor", ownerPerson: "Suresh Babu",
    dueDate: "2026-03-18", dueTime: "02:00 PM",
    priority: "Critical", status: "Open",
    source: "Abnormality",
    remarks: "",
    evidence: [],
    createdAt: "09:20 AM",
    escalated: false,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "09:20 AM", actor: "Priya Nair",      event: "Action created for emergency maintenance plan" },
    ],
  },
  {
    id: "ACT-003",
    title: "Reallocate output to Line 2 temporarily",
    kpiId: "KPI-T1-002", kpiName: "OEE",
    abnormalityId: "ABN-001",
    ownerPosition: "Production Manager", ownerPerson: "Anand Raj",
    dueDate: "2026-03-18", dueTime: "11:30 AM",
    priority: "High", status: "Open",
    source: "Meeting",
    remarks: "",
    evidence: [],
    createdAt: "10:00 AM",
    escalated: false,
    tier: "T2", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "10:00 AM", actor: "T2 Meeting",      event: "Action created during T2 Daily Review" },
    ],
  },
  {
    id: "ACT-004",
    title: "Calibrate fixture alignment on Station 2",
    kpiId: "KPI-T1-005", kpiName: "Scrap Rate",
    abnormalityId: "ABN-002",
    ownerPosition: "Process Engineer", ownerPerson: "Not Resolved",
    dueDate: "2026-03-18", dueTime: "01:00 PM",
    priority: "Critical", status: "Open",
    source: "Abnormality",
    remarks: "",
    evidence: [],
    createdAt: "09:00 AM",
    escalated: true,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "08:55 AM", actor: "System",           event: "ABN-002 detected: Scrap rate threshold breach" },
      { at: "09:00 AM", actor: "Ravi Kumar",       event: "Action created and assigned to Process Engineer" },
    ],
  },
  {
    id: "ACT-005",
    title: "100% re-inspection of parts produced since 08:00 AM",
    kpiId: "KPI-T1-005", kpiName: "Scrap Rate",
    abnormalityId: "ABN-002",
    ownerPosition: "Quality Lead", ownerPerson: "Meena Sundaram",
    dueDate: "2026-03-18", dueTime: "12:00 PM",
    priority: "High", status: "In Progress",
    source: "Abnormality",
    remarks: "Inspection in progress. 47 of 120 parts checked. 3 non-conformances found.",
    evidence: ["inspection_log_180318.pdf"],
    createdAt: "09:05 AM",
    escalated: false,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "09:05 AM", actor: "Meena Sundaram",   event: "Action started — 100% re-inspection initiated" },
      { at: "10:20 AM", actor: "Meena Sundaram",   event: "Status: 47/120 parts inspected, 3 NC found" },
    ],
  },
  {
    id: "ACT-006",
    title: "Investigate FPY decline correlation with torque",
    kpiId: "KPI-T1-001", kpiName: "First Pass Yield",
    abnormalityId: "ABN-003",
    ownerPosition: "Assembly Lead", ownerPerson: "Ravi Kumar",
    dueDate: "2026-03-18", dueTime: "03:00 PM",
    priority: "High", status: "Open",
    source: "Abnormality",
    remarks: "",
    evidence: [],
    createdAt: "10:17 AM",
    escalated: false,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "10:17 AM", actor: "System",           event: "Action auto-created from ABN-003 pattern" },
    ],
  },
  {
    id: "ACT-007",
    title: "Urgent calibration of torque tool on Station 4",
    kpiId: "KPI-T1-004", kpiName: "Torque Compliance",
    abnormalityId: "ABN-004",
    ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
    dueDate: "2026-03-18", dueTime: "11:00 AM",
    priority: "Critical", status: "Open",
    source: "Abnormality",
    remarks: "",
    evidence: [],
    createdAt: "10:12 AM",
    escalated: false,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "10:12 AM", actor: "Ravi Kumar",       event: "Action created for urgent tool calibration" },
    ],
  },
  {
    id: "ACT-008",
    title: "Expedite spare parts for Station 3 bearing",
    kpiId: "KPI-T1-006", kpiName: "MTTR",
    abnormalityId: "ABN-006",
    ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
    dueDate: "2026-03-18", dueTime: "02:30 PM",
    priority: "Medium", status: "In Progress",
    source: "Meeting",
    remarks: "PO placed for bearing replacement. ETA 2:00 PM from warehouse.",
    evidence: [],
    createdAt: "09:55 AM",
    escalated: false,
    tier: "T1", line: "Line 1", department: "Assembly", shift: "Day",
    timeline: [
      { at: "09:55 AM", actor: "T1 Meeting",       event: "Action created during T1 standup" },
      { at: "10:30 AM", actor: "Priya Nair",        event: "PO placed for spare parts" },
    ],
  },
];

// ─── My Work (current user: Ravi Kumar / Assembly Lead) ──────────────────────
export const myWorkActions = executionActions.filter(a =>
  a.ownerPerson === "Ravi Kumar" ||
  a.ownerPosition === "Assembly Lead"
);

// ─── Meetings ───────────��─────────────────────────────────────────────────────
export interface Meeting {
  id: string;
  tier: Tier;
  title: string;
  date: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed";
  context: { line?: string; department?: string; plant?: string; shift?: string };
  facilitator: string;
  attendees: string[];
  kpiSummary: { critical: number; warning: number; normal: number; missing: number };
  openAbnormalities: number;
  openActions: number;
  notes: string;
  decisions: { id: string; text: string; owner: string; due: string }[];
  actionIdsCreated: string[];
}

export const meetings: Meeting[] = [
  {
    id: "MTG-T1-001",
    tier: "T1",
    title: "T1 Daily Standup – Line 1 / Day Shift",
    date: "2026-03-18", time: "08:00 AM",
    status: "Completed",
    context: { line: "Line 1", department: "Assembly", shift: "Day" },
    facilitator: "Ravi Kumar",
    attendees: ["Ravi Kumar", "Suresh Babu", "Meena Sundaram", "Priya Nair"],
    kpiSummary: { critical: 2, warning: 3, normal: 2, missing: 1 },
    openAbnormalities: 6,
    openActions: 8,
    notes: "OEE critical — Station 3 bearing failure. Scrap rate elevated — fixture drift suspected. FPY correlated with torque drop. Torque signal missing from Station 4.",
    decisions: [
      { id: "DEC-001", text: "Escalate Station 3 OEE issue to T2 management",          owner: "Ravi Kumar",   due: "Today 09:00 AM" },
      { id: "DEC-002", text: "Initiate 100% re-inspection of today morning batch",      owner: "Meena Sundaram",due: "Today 12:00 PM" },
      { id: "DEC-003", text: "Confirm spare parts availability for Station 3 bearing",  owner: "Priya Nair",   due: "Today 10:00 AM" },
    ],
    actionIdsCreated: ["ACT-004", "ACT-005", "ACT-008"],
  },
  {
    id: "MTG-T2-001",
    tier: "T2",
    title: "T2 Department Review – Assembly",
    date: "2026-03-18", time: "10:00 AM",
    status: "In Progress",
    context: { department: "Assembly", plant: "Chennai" },
    facilitator: "Anand Raj",
    attendees: ["Anand Raj", "Ravi Kumar", "Priya Nair", "Deepa Krishnan"],
    kpiSummary: { critical: 3, warning: 4, normal: 5, missing: 1 },
    openAbnormalities: 6,
    openActions: 10,
    notes: "Line 1 escalated — OEE and Scrap critical. Line 3 scrap also elevated. Cross-line comparison shows systemic torque compliance issue.",
    decisions: [
      { id: "DEC-004", text: "Reallocate Line 1 production to Line 2 for afternoon shift", owner: "Anand Raj",      due: "Today 11:30 AM" },
      { id: "DEC-005", text: "Schedule emergency calibration across all lines",            owner: "Priya Nair",     due: "Today 04:00 PM" },
    ],
    actionIdsCreated: ["ACT-003"],
  },
  {
    id: "MTG-T3-001",
    tier: "T3",
    title: "T3 Plant Review – Chennai",
    date: "2026-03-18", time: "02:00 PM",
    status: "Scheduled",
    context: { plant: "Chennai" },
    facilitator: "Plant Director",
    attendees: ["Plant Director", "Anand Raj", "Dept Heads"],
    kpiSummary: { critical: 4, warning: 10, normal: 18, missing: 1 },
    openAbnormalities: 8,
    openActions: 18,
    notes: "",
    decisions: [],
    actionIdsCreated: [],
  },
];

// ─── Status colour helpers ─────────────────────────────────────────────────────
export const KPI_STATUS_COLOR: Record<KpiStatus, { bg: string; color: string; border: string; dot: string }> = {
  Normal:   { bg: "#f0fdf4", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  Warning:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a", dot: "#f59e0b" },
  Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
  Missing:  { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
};

export const ACTION_STATUS_COLOR: Record<ActionStatus, { bg: string; color: string }> = {
  Open:        { bg: "#fef2f2", color: "#dc2626" },
  "In Progress":{ bg: "#fffbeb", color: "#d97706" },
  Resolved:    { bg: "#eff6ff", color: "#2563eb" },
  Verified:    { bg: "#f0fdf4", color: "#15803d" },
  Closed:      { bg: "#f1f5f9", color: "#64748b" },
};

export const ACTION_PRIORITY_COLOR: Record<ActionPriority, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fff7ed", color: "#c2410c" },
  Medium:   { bg: "#fffbeb", color: "#d97706" },
  Low:      { bg: "#f0fdf4", color: "#15803d" },
};

export const AB_SEVERITY_COLOR: Record<AbSeverity, { bg: string; color: string; border: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  High:     { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
  Medium:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  Low:      { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
};

export const TIER_COLOR: Record<Tier, { bg: string; color: string; border: string }> = {
  T1: { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  T2: { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
  T3: { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
};

// ─── Control Chart Data (SPC – per KPI) ───────────────────────────────────────
// Each point: time, value, and optional annotation (event marker)
// Limits: ucl, lcl, target, warnHigh, warnLow (all in same unit as KPI)

export interface ControlChartPoint {
  time: string;          // display label e.g. "06:00"
  value: number | null;  // null = missing signal
  annotation?: string;   // event label shown on chart
}

export interface ControlChartConfig {
  kpiId: string;
  unit: string;
  target: number;
  ucl: number;           // Upper Control Limit
  lcl: number;           // Lower Control Limit
  warnHigh?: number;     // Upper Warning Limit
  warnLow?: number;      // Lower Warning Limit
  yMin: number;
  yMax: number;
  points: ControlChartPoint[];
  /** true = higher is better (FPY, OEE), false = lower is better (Scrap, MTTR) */
  higherIsBetter: boolean;
}

// KPI-T1-001 — First Pass Yield (%) — higher is better
// Target 92 | UCL 96 | LCL 89 | Warn-Low 90
const FPY_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 92.4 },
  { time: "06:12", value: 93.1 },
  { time: "06:24", value: 92.8 },
  { time: "06:36", value: 92.6 },
  { time: "06:48", value: 92.1 },
  { time: "07:00", value: 91.8 },
  { time: "07:12", value: 91.5 },
  { time: "07:24", value: 91.2 },
  { time: "07:36", value: 91.0 },
  { time: "07:48", value: 90.7 },
  { time: "08:00", value: 90.2 },
  { time: "08:12", value: 90.0, annotation: "Fixture drift detected" },
  { time: "08:24", value: 89.7 },
  { time: "08:36", value: 89.3 },
  { time: "08:48", value: 89.1 },
  { time: "09:00", value: 88.5, annotation: "ABN-003 raised" },
  { time: "09:12", value: 88.0 },
  { time: "09:24", value: 87.8 },
  { time: "09:36", value: 87.5 },
  { time: "09:48", value: 87.2 },
  { time: "10:00", value: 87.2 },
  { time: "10:12", value: 87.0 },
  { time: "10:24", value: 87.2 },
  { time: "10:45", value: 87.2, annotation: "Latest reading" },
];

// KPI-T1-002 — OEE (%) — higher is better
// Target 80 | UCL 88 | LCL 72 | Warn-Low 75
const OEE_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 81.2 },
  { time: "06:12", value: 82.0 },
  { time: "06:24", value: 81.8 },
  { time: "06:36", value: 81.5 },
  { time: "06:48", value: 80.8 },
  { time: "07:00", value: 80.4 },
  { time: "07:12", value: 80.1 },
  { time: "07:24", value: 79.6 },
  { time: "07:36", value: 78.9 },
  { time: "07:48", value: 78.2 },
  { time: "08:00", value: 77.4 },
  { time: "08:12", value: 76.5 },
  { time: "08:24", value: 75.9 },
  { time: "08:36", value: 75.1, annotation: "Warn-Low crossed" },
  { time: "08:48", value: 74.3 },
  { time: "09:00", value: 73.2 },
  { time: "09:12", value: 72.1, annotation: "ABN-001 raised" },
  { time: "09:24", value: 71.8 },
  { time: "09:36", value: 71.5 },
  { time: "09:48", value: 71.4 },
  { time: "10:00", value: 71.4 },
  { time: "10:12", value: 71.5 },
  { time: "10:24", value: 71.4 },
  { time: "10:45", value: 71.4, annotation: "Latest reading" },
];

// KPI-T1-003 — Cycle Time (min) — lower is better
// Target 5.2 | UCL (max) 5.8 | LCL (min) 4.5 | Warn-High 5.5
const CYCLE_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 5.0 },
  { time: "06:12", value: 4.9 },
  { time: "06:24", value: 5.1 },
  { time: "06:36", value: 5.0 },
  { time: "06:48", value: 4.8 },
  { time: "07:00", value: 4.9 },
  { time: "07:12", value: 5.0 },
  { time: "07:24", value: 5.1 },
  { time: "07:36", value: 4.9 },
  { time: "07:48", value: 4.8 },
  { time: "08:00", value: 5.0 },
  { time: "08:12", value: 4.9 },
  { time: "08:24", value: 5.0 },
  { time: "08:36", value: 4.8 },
  { time: "08:48", value: 4.9 },
  { time: "09:00", value: 4.8 },
  { time: "09:12", value: 4.9 },
  { time: "09:24", value: 4.8 },
  { time: "09:36", value: 4.9 },
  { time: "09:48", value: 4.8 },
  { time: "10:00", value: 4.8 },
  { time: "10:12", value: 4.9 },
  { time: "10:24", value: 4.8 },
  { time: "10:45", value: 4.8, annotation: "Latest reading" },
];

// KPI-T1-004 — Torque Compliance (%) — higher is better
// Target 98 | UCL 100 | LCL 95 | Warn-Low 96
const TORQUE_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 98.4 },
  { time: "06:12", value: 98.2 },
  { time: "06:24", value: 98.5 },
  { time: "06:36", value: 98.3 },
  { time: "06:48", value: 98.0 },
  { time: "07:00", value: 97.8 },
  { time: "07:12", value: 97.5 },
  { time: "07:24", value: 97.2 },
  { time: "07:36", value: 96.9 },
  { time: "07:48", value: 96.5, annotation: "Warn-Low crossed" },
  { time: "08:00", value: 96.2 },
  { time: "08:12", value: 95.8 },
  { time: "08:24", value: 95.5 },
  { time: "08:36", value: 95.2 },
  { time: "08:48", value: 95.0 },
  { time: "09:00", value: 94.7 },
  { time: "09:12", value: 94.4, annotation: "ABN-004 raised" },
  { time: "09:24", value: 94.2 },
  { time: "09:36", value: 94.2 },
  { time: "09:48", value: 94.1 },
  { time: "10:00", value: 94.1 },
  { time: "10:12", value: 94.2 },
  { time: "10:24", value: 94.1 },
  { time: "10:45", value: 94.1, annotation: "Latest reading" },
];

// KPI-T1-005 — Scrap Rate (%) — lower is better
// Target 2.5 | LCL (min acceptable) 0.5 | UCL (max) 3.5 | Warn-High 3.0
const SCRAP_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 2.2 },
  { time: "06:12", value: 2.3 },
  { time: "06:24", value: 2.4 },
  { time: "06:36", value: 2.3 },
  { time: "06:48", value: 2.5 },
  { time: "07:00", value: 2.6 },
  { time: "07:12", value: 2.7 },
  { time: "07:24", value: 2.9 },
  { time: "07:36", value: 3.0, annotation: "Warn-High crossed" },
  { time: "07:48", value: 3.2 },
  { time: "08:00", value: 3.4 },
  { time: "08:12", value: 3.6, annotation: "UCL breached — ABN-002" },
  { time: "08:24", value: 3.8 },
  { time: "08:36", value: 4.0 },
  { time: "08:48", value: 4.1 },
  { time: "09:00", value: 4.2 },
  { time: "09:12", value: 4.3 },
  { time: "09:24", value: 4.2 },
  { time: "09:36", value: 4.3 },
  { time: "09:48", value: 4.3 },
  { time: "10:00", value: 4.3 },
  { time: "10:12", value: 4.2 },
  { time: "10:24", value: 4.3 },
  { time: "10:45", value: 4.3, annotation: "Latest reading" },
];

// KPI-T1-006 — MTTR (min) — lower is better
// Target 30 | LCL 5 | UCL 40 | Warn-High 35
const MTTR_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 22 },
  { time: "06:30", value: 25 },
  { time: "07:00", value: 20 },
  { time: "07:30", value: 28 },
  { time: "08:00", value: 26 },
  { time: "08:30", value: 31, annotation: "Warn-High crossed" },
  { time: "09:00", value: 35 },
  { time: "09:12", value: 38, annotation: "Station 3 incident" },
  { time: "09:30", value: 42, annotation: "ABN-006 raised" },
  { time: "09:45", value: 45 },
  { time: "10:00", value: 45 },
  { time: "10:15", value: 44 },
  { time: "10:45", value: 45, annotation: "Latest reading" },
];

// KPI-T1-007 — Kit Lead Time (hrs) — lower is better
// Target 1.5 | LCL 0.5 | UCL 2.5 | Warn-High 2.0
const KIT_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 1.4 },
  { time: "06:30", value: 1.5 },
  { time: "07:00", value: 1.6 },
  { time: "07:30", value: 1.5 },
  { time: "08:00", value: 1.7 },
  { time: "08:30", value: 1.8 },
  { time: "09:00", value: 1.9 },
  { time: "09:30", value: 2.0, annotation: "Warn-High crossed" },
  { time: "10:00", value: 2.0 },
  { time: "10:30", value: 2.1 },
  { time: "10:45", value: 2.1, annotation: "Latest reading" },
];

// KPI-T1-008 — Applied Torque CP — missing signal
const TORQUE_CP_POINTS: ControlChartPoint[] = [
  { time: "06:00", value: 44.8 },
  { time: "06:30", value: 45.1 },
  { time: "07:00", value: 45.0 },
  { time: "07:30", value: 44.9 },
  { time: "08:00", value: 45.2 },
  { time: "08:30", value: 45.0 },
  { time: "09:00", value: null, annotation: "Signal lost" },
  { time: "09:30", value: null },
  { time: "10:00", value: null },
  { time: "10:45", value: null, annotation: "Still missing" },
];

export const CONTROL_CHART_DATA: Record<string, ControlChartConfig> = {
  "KPI-T1-001": {
    kpiId: "KPI-T1-001", unit: "%",
    target: 92, ucl: 96, lcl: 89, warnLow: 90,
    yMin: 84, yMax: 98, higherIsBetter: true,
    points: FPY_POINTS,
  },
  "KPI-T1-002": {
    kpiId: "KPI-T1-002", unit: "%",
    target: 80, ucl: 88, lcl: 72, warnLow: 75,
    yMin: 68, yMax: 92, higherIsBetter: true,
    points: OEE_POINTS,
  },
  "KPI-T1-003": {
    kpiId: "KPI-T1-003", unit: "min",
    target: 5.2, ucl: 5.8, lcl: 4.5, warnHigh: 5.5,
    yMin: 4.2, yMax: 6.2, higherIsBetter: false,
    points: CYCLE_POINTS,
  },
  "KPI-T1-004": {
    kpiId: "KPI-T1-004", unit: "%",
    target: 98, ucl: 100, lcl: 95, warnLow: 96,
    yMin: 92, yMax: 101, higherIsBetter: true,
    points: TORQUE_POINTS,
  },
  "KPI-T1-005": {
    kpiId: "KPI-T1-005", unit: "%",
    target: 2.5, ucl: 3.5, lcl: 0.5, warnHigh: 3.0,
    yMin: 0, yMax: 5.5, higherIsBetter: false,
    points: SCRAP_POINTS,
  },
  "KPI-T1-006": {
    kpiId: "KPI-T1-006", unit: "min",
    target: 30, ucl: 40, lcl: 5, warnHigh: 35,
    yMin: 0, yMax: 52, higherIsBetter: false,
    points: MTTR_POINTS,
  },
  "KPI-T1-007": {
    kpiId: "KPI-T1-007", unit: "hrs",
    target: 1.5, ucl: 2.5, lcl: 0.5, warnHigh: 2.0,
    yMin: 0, yMax: 3.2, higherIsBetter: false,
    points: KIT_POINTS,
  },
  "KPI-T1-008": {
    kpiId: "KPI-T1-008", unit: "Nm",
    target: 45, ucl: 47, lcl: 43, warnHigh: 46, warnLow: 44,
    yMin: 40, yMax: 50, higherIsBetter: false,
    points: TORQUE_CP_POINTS,
  },
};