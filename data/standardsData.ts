// ─── Standards, Processes, PFC, SOP, Measures Data ──────────────────────────

export interface Process {
  id: string;
  code: string;
  name: string;
  category: string;
  criticality: "Critical" | "High" | "Medium" | "Low";
  ownerPosition: string;
  resolvedOwner: string;
  status: "Draft" | "Approved" | "Effective" | "Superseded" | "Retired";
  linkedPFCs: number;
  linkedSOPs: number;
  linkedMeasures: number;
  lastModified: string;
}

export const processes: Process[] = [
  { id: "PRC-001", code: "P-ASM-001", name: "Final Assembly Operation",     category: "Manufacturing", criticality: "Critical", ownerPosition: "Production Supervisor",   resolvedOwner: "Ravi Kumar",     status: "Effective",  linkedPFCs: 2, linkedSOPs: 5,  linkedMeasures: 8,  lastModified: "2026-02-15" },
  { id: "PRC-002", code: "P-ASM-002", name: "Sub-Assembly Preparation",      category: "Manufacturing", criticality: "High",     ownerPosition: "Senior Process Engineer", resolvedOwner: "Deepa Krishnan", status: "Effective",  linkedPFCs: 1, linkedSOPs: 3,  linkedMeasures: 5,  lastModified: "2026-01-20" },
  { id: "PRC-003", code: "P-QC-001",  name: "In-Process Quality Inspection", category: "Quality",       criticality: "Critical", ownerPosition: "QC Manager",              resolvedOwner: "Meena Sundaram", status: "Effective",  linkedPFCs: 1, linkedSOPs: 4,  linkedMeasures: 10, lastModified: "2026-02-01" },
  { id: "PRC-004", code: "P-QC-002",  name: "Final Quality Acceptance",      category: "Quality",       criticality: "Critical", ownerPosition: "QC Manager",              resolvedOwner: "Meena Sundaram", status: "Draft",      linkedPFCs: 0, linkedSOPs: 1,  linkedMeasures: 4,  lastModified: "2026-03-05" },
  { id: "PRC-005", code: "P-MNT-001", name: "Preventive Maintenance Cycle",  category: "Maintenance",   criticality: "High",     ownerPosition: "Maintenance Lead",        resolvedOwner: "Not Resolved",   status: "Approved",   linkedPFCs: 1, linkedSOPs: 3,  linkedMeasures: 6,  lastModified: "2026-01-10" },
  { id: "PRC-006", code: "P-LOG-001", name: "Incoming Goods Receiving",       category: "Logistics",     criticality: "Medium",   ownerPosition: "Logistics Lead",          resolvedOwner: "Not Resolved",   status: "Effective",  linkedPFCs: 1, linkedSOPs: 2,  linkedMeasures: 3,  lastModified: "2025-12-15" },
  { id: "PRC-007", code: "P-ASM-003", name: "Engine Assembly Subassembly",   category: "Manufacturing", criticality: "Critical", ownerPosition: "Production Supervisor",   resolvedOwner: "Ravi Kumar",     status: "Effective",  linkedPFCs: 2, linkedSOPs: 6,  linkedMeasures: 9,  lastModified: "2026-02-28" },
  { id: "PRC-008", code: "P-HSE-001", name: "Hazard Identification & Control", category: "Safety",      criticality: "Critical", ownerPosition: "Safety Officer",          resolvedOwner: "Priya Nair",     status: "Under Review", linkedPFCs: 1, linkedSOPs: 2, linkedMeasures: 4, lastModified: "2026-03-08" },
];

// ─── PFC Nodes ────────────────────────────────────────────────────────────────

export type PFCNodeType = "Start" | "End" | "Activity" | "Decision" | "Handoff" | "Inspection" | "Rework" | "Escalation" | "Exception" | "ExternalInterface";

export interface PFCNode {
  id: string;
  code: string;
  name: string;
  type: PFCNodeType;
  x: number;
  y: number;
  responsiblePosition: string;
  criticalFlag: boolean;
  exceptionFlag: boolean;
  reworkFlag: boolean;
  linkedSOP?: string;
}

export interface PFCEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface PFC {
  id: string;
  code: string;
  name: string;
  processId: string;
  processName: string;
  version: string;
  status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Effective";
  ownerPosition: string;
  resolvedOwner: string;
  lastModified: string;
  nodes: PFCNode[];
  edges: PFCEdge[];
}

export const pfcs: PFC[] = [
  {
    id: "PFC-001",
    code: "PFC-ASM-001",
    name: "Final Assembly Operation Flow",
    processId: "PRC-001",
    processName: "Final Assembly Operation",
    version: "v2.1",
    status: "Effective",
    ownerPosition: "Production Supervisor",
    resolvedOwner: "Ravi Kumar",
    lastModified: "2026-02-10",
    nodes: [
      { id: "N-01", code: "N01", name: "Start",                     type: "Start",       x: 120,  y: 80,  responsiblePosition: "",                       criticalFlag: false, exceptionFlag: false, reworkFlag: false },
      { id: "N-02", code: "N02", name: "Receive Sub-Assembly Kit",   type: "Activity",    x: 120,  y: 180, responsiblePosition: "Shift Supervisor",        criticalFlag: false, exceptionFlag: false, reworkFlag: false, linkedSOP: "SOP-003" },
      { id: "N-03", code: "N03", name: "Verify Kit Completeness",    type: "Inspection",  x: 120,  y: 280, responsiblePosition: "Quality Inspector",       criticalFlag: true,  exceptionFlag: false, reworkFlag: false, linkedSOP: "SOP-001" },
      { id: "N-04", code: "N04", name: "Kit Complete?",              type: "Decision",    x: 120,  y: 380, responsiblePosition: "Quality Inspector",       criticalFlag: false, exceptionFlag: false, reworkFlag: false },
      { id: "N-05", code: "N05", name: "Raise Kit Shortage NCR",     type: "Exception",   x: 320,  y: 380, responsiblePosition: "Shift Supervisor",        criticalFlag: false, exceptionFlag: true,  reworkFlag: false },
      { id: "N-06", code: "N06", name: "Torque Fasteners",           type: "Activity",    x: 120,  y: 480, responsiblePosition: "Production Supervisor",   criticalFlag: true,  exceptionFlag: false, reworkFlag: false, linkedSOP: "SOP-002" },
      { id: "N-07", code: "N07", name: "Torque Validation Check",    type: "Inspection",  x: 120,  y: 580, responsiblePosition: "Quality Inspector",       criticalFlag: true,  exceptionFlag: false, reworkFlag: false },
      { id: "N-08", code: "N08", name: "Pass?",                      type: "Decision",    x: 120,  y: 680, responsiblePosition: "Quality Inspector",       criticalFlag: false, exceptionFlag: false, reworkFlag: false },
      { id: "N-09", code: "N09", name: "Rework Fastening",           type: "Rework",      x: 320,  y: 680, responsiblePosition: "Production Supervisor",   criticalFlag: false, exceptionFlag: false, reworkFlag: true },
      { id: "N-10", code: "N10", name: "Final Inspection",           type: "Inspection",  x: 120,  y: 780, responsiblePosition: "QC Manager",              criticalFlag: true,  exceptionFlag: false, reworkFlag: false, linkedSOP: "SOP-004" },
      { id: "N-11", code: "N11", name: "End",                        type: "End",         x: 120,  y: 880, responsiblePosition: "",                       criticalFlag: false, exceptionFlag: false, reworkFlag: false },
    ],
    edges: [
      { id: "E-01", from: "N-01", to: "N-02" },
      { id: "E-02", from: "N-02", to: "N-03" },
      { id: "E-03", from: "N-03", to: "N-04" },
      { id: "E-04", from: "N-04", to: "N-05", label: "No" },
      { id: "E-05", from: "N-04", to: "N-06", label: "Yes" },
      { id: "E-06", from: "N-06", to: "N-07" },
      { id: "E-07", from: "N-07", to: "N-08" },
      { id: "E-08", from: "N-08", to: "N-09", label: "Fail" },
      { id: "E-09", from: "N-09", to: "N-06" },
      { id: "E-10", from: "N-08", to: "N-10", label: "Pass" },
      { id: "E-11", from: "N-10", to: "N-11" },
    ],
  },
  {
    id: "PFC-002", code: "PFC-ASM-002",
    name: "Sub-Assembly Preparation Flow",
    processId: "PRC-002", processName: "Sub-Assembly Preparation",
    version: "v1.0", status: "Approved",
    ownerPosition: "Senior Process Engineer", resolvedOwner: "Deepa Krishnan",
    lastModified: "2026-01-18", nodes: [], edges: [],
  },
  {
    id: "PFC-003", code: "PFC-QC-001",
    name: "In-Process Inspection Flow",
    processId: "PRC-003", processName: "In-Process Quality Inspection",
    version: "v1.2", status: "Effective",
    ownerPosition: "QC Manager", resolvedOwner: "Meena Sundaram",
    lastModified: "2026-01-30", nodes: [], edges: [],
  },
  {
    id: "PFC-004", code: "PFC-ASM-003",
    name: "Engine Sub-Assembly Main Flow",
    processId: "PRC-007", processName: "Engine Assembly Subassembly",
    version: "v2.0", status: "Effective",
    ownerPosition: "Production Supervisor", resolvedOwner: "Ravi Kumar",
    lastModified: "2026-02-25", nodes: [], edges: [],
  },
  {
    id: "PFC-005", code: "PFC-ASM-004",
    name: "Engine Assembly Rework Path",
    processId: "PRC-007", processName: "Engine Assembly Subassembly",
    version: "v1.0", status: "Draft",
    ownerPosition: "Production Supervisor", resolvedOwner: "Ravi Kumar",
    lastModified: "2026-03-07", nodes: [], edges: [],
  },
  {
    id: "PFC-006", code: "PFC-MNT-001",
    name: "Preventive Maintenance Flow",
    processId: "PRC-005", processName: "Preventive Maintenance Cycle",
    version: "v1.0", status: "Approved",
    ownerPosition: "Maintenance Lead", resolvedOwner: "Not Resolved",
    lastModified: "2026-01-08", nodes: [], edges: [],
  },
  {
    id: "PFC-007", code: "PFC-ASM-005",
    name: "Assembly Exception Handling Flow",
    processId: "PRC-001", processName: "Final Assembly Operation",
    version: "v1.1", status: "Approved",
    ownerPosition: "Production Supervisor", resolvedOwner: "Ravi Kumar",
    lastModified: "2026-02-08", nodes: [], edges: [],
  },
];

// ─── SOPs ─────────────────────────────────────────────────────────────────────

export interface SOPStep {
  id: string;
  sequence: number;
  title: string;
  description: string;
  responsiblePosition: string;
  linkedPFCNode?: string;
  evidenceRequired: boolean;
  criticality: "Critical" | "High" | "Medium" | "Low";
  inputDefinition?: string;
  outputDefinition?: string;
  safetyNote?: string;
  qualityNote?: string;
  timingRule?: string;
  stepType?: "ACTION" | "DECISION";
  outputUsageType?: "NEXT_STEP" | "MEASURE_INPUT" | "AUDIT_REFERENCE" | "EXTERNAL_SYSTEM";
  linkedMeasureCode?: string;
  transitions?: { toStepId: string; conditionLabel: string; transitionType: "Default" | "Conditional" | "Exception" }[];
}

export interface SOP {
  id: string;
  code: string;
  title: string;
  linkedProcess: string;
  linkedProcessCode: string;
  linkedPFC?: string;
  ownerPosition: string;
  resolvedOwner: string;
  reviewerPosition: string;
  approverPosition: string;
  version: string;
  status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Effective" | "Superseded";
  effectiveFrom?: string;
  effectiveTo?: string;
  lastModified: string;
  steps: SOPStep[];
  linkedMeasures: number;
  attachments: number;
}

export const sops: SOP[] = [
  {
    id: "SOP-001", code: "SOP-QC-001",
    title: "Kit Verification SOP",
    linkedProcess: "Final Assembly Operation", linkedProcessCode: "P-ASM-001",
    linkedPFC: "PFC-ASM-001",
    ownerPosition: "Quality Inspector", resolvedOwner: "Not Resolved",
    reviewerPosition: "QC Manager", approverPosition: "Production Supervisor",
    version: "v1.3", status: "Effective",
    effectiveFrom: "2025-09-01", lastModified: "2025-08-20",
    linkedMeasures: 3, attachments: 2,
    steps: [
      { id: "S-001-01", sequence: 1, title: "Retrieve Kit Manifest",       description: "Obtain the kit manifest from the planning system (ERP). Verify the BOM revision is correct for the current production order.", responsiblePosition: "Shift Supervisor",  evidenceRequired: false, criticality: "Medium", inputDefinition: "Production order number",    outputDefinition: "Verified kit manifest",  timingRule: "Before receiving kit" },
      { id: "S-001-02", sequence: 2, title: "Physical Count of Components", description: "Physically count all components against the manifest. Record any shortages or overages. Verify part numbers and revision levels.", responsiblePosition: "Quality Inspector", evidenceRequired: true,  criticality: "Critical", inputDefinition: "Kit manifest, Physical kit",  outputDefinition: "Count record form",      qualityNote: "Use calibrated counting tools. No estimation allowed." },
      { id: "S-001-03", sequence: 3, title: "Condition Inspection",         description: "Visually inspect each component for damage, corrosion, or incorrect packaging. Reject any component not meeting acceptance criteria.", responsiblePosition: "Quality Inspector", evidenceRequired: true,  criticality: "High",     safetyNote: "Wear cut-resistant gloves when handling metal components.", qualityNote: "Reference: QC-STD-012 for acceptance criteria.", outputDefinition: "Inspection record" },
      { id: "S-001-04", sequence: 4, title: "Record and Release",           description: "Record verification outcome in the production tracking system. Release kit to assembly station or raise NCR for shortages.", responsiblePosition: "Shift Supervisor",  evidenceRequired: true,  criticality: "Medium", timingRule: "Within 30 min of physical count" },
    ],
  },
  {
    id: "SOP-002", code: "SOP-ASM-001",
    title: "Torque Fastener Application SOP",
    linkedProcess: "Final Assembly Operation", linkedProcessCode: "P-ASM-001",
    linkedPFC: "PFC-ASM-001",
    ownerPosition: "Production Supervisor", resolvedOwner: "Ravi Kumar",
    reviewerPosition: "Quality Inspector", approverPosition: "QC Manager",
    version: "v2.1", status: "Under Review",
    lastModified: "2026-03-10",
    linkedMeasures: 4, attachments: 3,
    steps: [
      { id: "S-002-01", sequence: 1, title: "Set Torque Tool",             description: "Set the pneumatic torque wrench to the specified torque value per the assembly drawing. Verify calibration tag is current.", responsiblePosition: "Production Supervisor", evidenceRequired: true,  criticality: "Critical", safetyNote: "Verify tool calibration date. Do not use expired tools.", qualityNote: "Torque spec: 25 Nm ± 2 Nm per Engineering Spec ES-1042." },
      { id: "S-002-02", sequence: 2, title: "Apply Thread Locker",         description: "Apply Loctite 243 to first three threads of bolt. Do not apply to mating surface.", responsiblePosition: "Production Supervisor", evidenceRequired: false, criticality: "High",     qualityNote: "One drop only. Excess must be wiped clean before assembly." },
      { id: "S-002-03", sequence: 3, title: "Torque to Specification",     description: "Engage fastener hand-tight then apply torque tool in single stroke. Mark fastener with torque stripe marker.", responsiblePosition: "Production Supervisor", evidenceRequired: true,  criticality: "Critical", timingRule: "Within 10 min of thread locker application", outputDefinition: "Torque-marked fastener" },
      { id: "S-002-04", sequence: 4, title: "Record Torque Values",        description: "Enter torque values into the production record card for each fastener location.", responsiblePosition: "Production Supervisor", evidenceRequired: true,  criticality: "High",     outputDefinition: "Completed production record" },
    ],
  },
  {
    id: "SOP-003", code: "SOP-ASM-002",
    title: "Assembly Line Setup SOP",
    linkedProcess: "Final Assembly Operation", linkedProcessCode: "P-ASM-001",
    ownerPosition: "Shift Supervisor", resolvedOwner: "Arun Sekar",
    reviewerPosition: "Production Supervisor", approverPosition: "QC Manager",
    version: "v2.1", status: "Submitted",
    lastModified: "2026-03-10",
    linkedMeasures: 2, attachments: 1,
    steps: [],
  },
  {
    id: "SOP-004", code: "SOP-QC-002",
    title: "Final Inspection and Release SOP",
    linkedProcess: "Final Assembly Operation", linkedProcessCode: "P-ASM-001",
    ownerPosition: "QC Manager", resolvedOwner: "Meena Sundaram",
    reviewerPosition: "Production Supervisor", approverPosition: "Process Engineer",
    version: "v1.2", status: "Effective",
    effectiveFrom: "2025-11-01", lastModified: "2025-10-15",
    linkedMeasures: 5, attachments: 4,
    steps: [],
  },
  {
    id: "SOP-005", code: "SOP-MNT-001",
    title: "Preventive Maintenance Checklist SOP",
    linkedProcess: "Preventive Maintenance Cycle", linkedProcessCode: "P-MNT-001",
    ownerPosition: "Maintenance Lead", resolvedOwner: "Not Resolved",
    reviewerPosition: "Process Engineer", approverPosition: "Production Supervisor",
    version: "v1.0", status: "Draft",
    lastModified: "2026-03-08",
    linkedMeasures: 1, attachments: 0,
    steps: [],
  },
];

// ─── Measures ─────────────────────────────────────────────────────────────────

export type MeasureType = "KPI" | "MP" | "MOP" | "CP";

export interface Measure {
  id: string;
  code: string;
  name: string;
  type: MeasureType;
  ownerPosition: string;
  unitOfMeasure: string;
  formula?: string;
  sourceType: "Manual" | "System" | "Calculated";
  frequency: "Real-time" | "Hourly" | "Daily" | "Weekly" | "Monthly";
  criticality: "Critical" | "High" | "Medium" | "Low";
  status: "Draft" | "Approved" | "Effective" | "Retired";
  targetValue?: number;
  lowerLimit?: number;
  upperLimit?: number;
  linkedObjects: number;
  lastModified: string;
}

export const measures: Measure[] = [
  { id: "M-001", code: "KPI-001", name: "First Pass Yield",              type: "KPI", ownerPosition: "QC Manager",              unitOfMeasure: "%",       formula: "(Total units – Rework units) / Total units × 100", sourceType: "Calculated", frequency: "Daily",   criticality: "Critical", status: "Effective", targetValue: 98.0, lowerLimit: 95.0, linkedObjects: 4, lastModified: "2026-01-15" },
  { id: "M-002", code: "KPI-002", name: "Overall Equipment Effectiveness", type: "KPI", ownerPosition: "Production Supervisor",  unitOfMeasure: "%",       formula: "Availability × Performance × Quality",             sourceType: "Calculated", frequency: "Daily",   criticality: "Critical", status: "Effective", targetValue: 85.0, lowerLimit: 75.0, linkedObjects: 6, lastModified: "2026-01-10" },
  { id: "M-003", code: "MP-001",  name: "Cycle Time – Assembly",         type: "MP",  ownerPosition: "Production Supervisor",  unitOfMeasure: "minutes", sourceType: "System",     frequency: "Real-time", criticality: "High",     status: "Effective", targetValue: 12.5, upperLimit: 15.0, linkedObjects: 3, lastModified: "2025-11-20" },
  { id: "M-004", code: "MP-002",  name: "Torque Compliance Rate",        type: "MP",  ownerPosition: "Quality Inspector",       unitOfMeasure: "%",       sourceType: "Manual",     frequency: "Daily",   criticality: "Critical", status: "Effective", targetValue: 100.0, lowerLimit: 98.0, linkedObjects: 2, lastModified: "2026-02-01" },
  { id: "M-005", code: "MOP-001", name: "Kit Verification Lead Time",    type: "MOP", ownerPosition: "Shift Supervisor",        unitOfMeasure: "minutes", sourceType: "System",     frequency: "Daily",   criticality: "Medium",   status: "Approved", targetValue: 20.0, upperLimit: 30.0, linkedObjects: 1, lastModified: "2026-02-20" },
  { id: "M-006", code: "CP-001",  name: "Fastener Torque Value",         type: "CP",  ownerPosition: "Quality Inspector",       unitOfMeasure: "Nm",      sourceType: "Manual",     frequency: "Real-time", criticality: "Critical", status: "Effective", targetValue: 25.0, lowerLimit: 23.0, upperLimit: 27.0, linkedObjects: 2, lastModified: "2026-01-05" },
  { id: "M-007", code: "KPI-003", name: "Scrap Rate",                    type: "KPI", ownerPosition: "QC Manager",              unitOfMeasure: "%",       formula: "Scrapped units / Total units × 100",               sourceType: "Calculated", frequency: "Daily",   criticality: "High",     status: "Draft",    targetValue: 0.5, upperLimit: 1.0,  linkedObjects: 3, lastModified: "2026-03-08" },
  { id: "M-008", code: "KPI-004", name: "MTTR – Maintenance",            type: "KPI", ownerPosition: "Maintenance Lead",        unitOfMeasure: "hours",   formula: "Total repair time / Number of failures",            sourceType: "Calculated", frequency: "Monthly", criticality: "High",     status: "Effective", targetValue: 4.0,  upperLimit: 6.0,  linkedObjects: 2, lastModified: "2025-10-01" },
];

// ─── Role Sheets ──────────────────────────────────────────────────────────────

export interface RoleSheet {
  id: string;
  code: string;
  title: string;
  level: "Enterprise" | "Site" | "Department" | "Position";
  linkedPosition?: string;
  version: string;
  status: "Draft" | "Submitted" | "Approved" | "Effective";
  lastModified: string;
  responsibilitiesCount: number;
}

export const roleSheets: RoleSheet[] = [
  { id: "RS-001", code: "RS-ENT-001", title: "Enterprise Operations Role Sheet",      level: "Enterprise",  version: "v1.0", status: "Effective", lastModified: "2024-01-01", responsibilitiesCount: 12 },
  { id: "RS-002", code: "RS-SITE-001", title: "Chennai Site Role Sheet",              level: "Site",        version: "v1.2", status: "Effective", lastModified: "2025-03-15", responsibilitiesCount: 18 },
  { id: "RS-003", code: "RS-DEPT-001", title: "Assembly Department Role Sheet",       level: "Department",  version: "v2.0", status: "Effective", lastModified: "2025-06-01", responsibilitiesCount: 22 },
  { id: "RS-004", code: "RS-POS-001",  title: "Production Supervisor Role Sheet",     level: "Position",    linkedPosition: "Production Supervisor",   version: "v3.0", status: "Submitted", lastModified: "2026-03-09", responsibilitiesCount: 31 },
  { id: "RS-005", code: "RS-POS-002",  title: "Quality Inspector Role Sheet",         level: "Position",    linkedPosition: "Quality Inspector",        version: "v1.1", status: "Effective", lastModified: "2025-09-10", responsibilitiesCount: 19 },
  { id: "RS-006", code: "RS-POS-003",  title: "Process Engineer Role Sheet",          level: "Position",    linkedPosition: "Process Engineer",          version: "v2.1", status: "Effective", lastModified: "2025-11-20", responsibilitiesCount: 27 },
  { id: "RS-007", code: "RS-POS-004",  title: "Warehouse Supervisor Role Sheet",      level: "Position",    linkedPosition: "Logistics Lead",            version: "v1.0", status: "Draft",     lastModified: "2026-03-09", responsibilitiesCount: 14 },
];

// ─── Audit Events ─────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  objectType: string;
  objectId: string;
  objectTitle: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
}

export const auditEvents: AuditEvent[] = [
  { id: "AUD-001", timestamp: "2026-03-12 09:45:22", actor: "Suresh Babu",    action: "APPROVED",        objectType: "SOP",     objectId: "SOP-002", objectTitle: "Welding Process SOP v1.2",             newValue: "Status: Approved",                    reason: "Compliant with QMS standards",    ipAddress: "10.0.1.22" },
  { id: "AUD-002", timestamp: "2026-03-12 09:12:05", actor: "Admin",          action: "CREATED",         objectType: "Position",objectId: "POS-010", objectTitle: "Senior Process Engineer",                                                                                           ipAddress: "10.0.1.1"  },
  { id: "AUD-003", timestamp: "2026-03-12 08:55:11", actor: "HR Admin",       action: "UPDATED",         objectType: "Assignment", objectId: "ASN-001", objectTitle: "Ravi Kumar → Prod. Supervisor",   oldValue: "Eff To: 2027-06-30", newValue: "Eff To: 2027-12-31",    ipAddress: "10.0.1.15" },
  { id: "AUD-004", timestamp: "2026-03-11 17:30:00", actor: "Deepa Krishnan", action: "PUBLISHED",       objectType: "PFC",     objectId: "PFC-001", objectTitle: "Final Assembly PFC v2.0",              newValue: "Status: Effective",                                              ipAddress: "10.0.1.44" },
  { id: "AUD-005", timestamp: "2026-03-11 16:05:33", actor: "Anand Raj",      action: "LINKED",          objectType: "Measure", objectId: "M-003",   objectTitle: "Cycle Time MP → Assembly SOP",          newValue: "Linked to SOP-002",                                              ipAddress: "10.0.1.33" },
  { id: "AUD-006", timestamp: "2026-03-11 14:20:18", actor: "Org Admin",      action: "RESOLVED",        objectType: "Gap",     objectId: "GAP-006", objectTitle: "QC Inspector / Chennai L2",              newValue: "Assignment created: ASN-008",                                     ipAddress: "10.0.1.5"  },
  { id: "AUD-007", timestamp: "2026-03-10 11:15:40", actor: "Ravi Kumar",     action: "SUBMITTED",       objectType: "SOP",     objectId: "SOP-003", objectTitle: "Assembly Line Setup SOP v2.1",           newValue: "Status: Submitted",                   reason: "Ready for review",        ipAddress: "10.0.1.22" },
  { id: "AUD-008", timestamp: "2026-03-09 15:22:00", actor: "Meena Sundaram", action: "REJECTED",        objectType: "SOP",     objectId: "SOP-005", objectTitle: "Maintenance Procedure Rev 2",            oldValue: "Status: Under Review",                reason: "Missing step 4 evidence",  ipAddress: "10.0.1.88" },
  { id: "AUD-009", timestamp: "2026-03-08 10:00:00", actor: "Admin",          action: "DEACTIVATED",     objectType: "Person",  objectId: "PER-012", objectTitle: "Nisha Menon",                            oldValue: "Status: Active",     newValue: "Status: Inactive",         ipAddress: "10.0.1.1"  },
  { id: "AUD-010", timestamp: "2026-03-07 09:30:45", actor: "Priya Nair",     action: "CREATED",         objectType: "SOP",     objectId: "SOP-005", objectTitle: "Preventive Maintenance Checklist SOP",                                                                                ipAddress: "10.0.1.67" },
  { id: "AUD-011", timestamp: "2026-03-06 16:45:00", actor: "Anand Raj",      action: "VERSION_CREATED", objectType: "PFC",     objectId: "PFC-001", objectTitle: "Final Assembly PFC v2.1",                newValue: "New version v2.1 created from v2.0",                              ipAddress: "10.0.1.33" },
  { id: "AUD-012", timestamp: "2026-03-05 14:00:22", actor: "Deepa Krishnan", action: "UPDATED",         objectType: "Role Sheet", objectId: "RS-004", objectTitle: "Production Supervisor Role Sheet",    oldValue: "Responsibilities: 28", newValue: "Responsibilities: 31",     ipAddress: "10.0.1.44" },
];

// ─── Impact Analysis ──────────────────────────────────────────────────────────

export interface ImpactItem {
  id: string;
  objectType: string;
  objectId: string;
  objectTitle: string;
  severity: "Blocking" | "High" | "Medium" | "Low";
  actionRequired: string;
  isBlocking: boolean;
  status: "Pending" | "Resolved" | "Waived";
}

export const impactItems: ImpactItem[] = [
  { id: "IMP-001", objectType: "SOP",     objectId: "SOP-001", objectTitle: "Kit Verification SOP v1.3",          severity: "Blocking", actionRequired: "Must revise before PFC activation",    isBlocking: true,  status: "Pending" },
  { id: "IMP-002", objectType: "SOP",     objectId: "SOP-002", objectTitle: "Torque Fastener Application SOP v2.1", severity: "High",    actionRequired: "Review and resubmit",                   isBlocking: false, status: "Pending" },
  { id: "IMP-003", objectType: "Measure", objectId: "M-006",   objectTitle: "Fastener Torque Value (CP-001)",      severity: "High",     actionRequired: "Update target values for new spec",     isBlocking: false, status: "Pending" },
  { id: "IMP-004", objectType: "Measure", objectId: "M-004",   objectTitle: "Torque Compliance Rate (MP-002)",     severity: "Medium",   actionRequired: "Review measurement method",             isBlocking: false, status: "Pending" },
  { id: "IMP-005", objectType: "SOP",     objectId: "SOP-004", objectTitle: "Final Inspection and Release SOP",    severity: "Medium",   actionRequired: "Verify step references remain valid",   isBlocking: false, status: "Resolved" },
  { id: "IMP-006", objectType: "Role Sheet", objectId: "RS-004", objectTitle: "Production Supervisor Role Sheet",  severity: "Low",     actionRequired: "Update process ownership references",    isBlocking: false, status: "Pending" },
];

// ─── Yokoten Deployments ─────────────────────────────────────────────────────

export type YokotenAdoptionStatus = "NOT_STARTED" | "IN_PROGRESS" | "ADOPTED" | "DEVIATED";

export interface YokotenDeployment {
  id: string;
  standardCode: string;
  standardName: string;
  standardType: "Process" | "PFC" | "SOP";
  version: string;
  targetSite: string;
  targetDepartment: string;
  targetLine?: string;
  deployedDate: string;
  deployedBy: string;
  adoptionStatus: YokotenAdoptionStatus;
  deviationNote?: string;
  lastUpdated: string;
  updatedBy: string;
}

export const yokotenDeployments: YokotenDeployment[] = [
  { id: "YOK-001", standardCode: "P-ASM-001", standardName: "Final Assembly Operation",           standardType: "Process", version: "v2.1", targetSite: "Mumbai",   targetDepartment: "Assembly",        deployedDate: "2026-01-15", deployedBy: "Ravi Kumar",       adoptionStatus: "ADOPTED",      lastUpdated: "2026-02-10", updatedBy: "Plant Manager" },
  { id: "YOK-002", standardCode: "P-ASM-001", standardName: "Final Assembly Operation",           standardType: "Process", version: "v2.1", targetSite: "Pune",     targetDepartment: "Assembly",        deployedDate: "2026-01-15", deployedBy: "Ravi Kumar",       adoptionStatus: "IN_PROGRESS", deviationNote: "Line 3 tooling differs; SOP adaptation in progress", lastUpdated: "2026-03-05", updatedBy: "Site Lead" },
  { id: "YOK-003", standardCode: "SOP-ASM-001", standardName: "Torque Fastener Application SOP", standardType: "SOP",     version: "v2.1", targetSite: "Mumbai",   targetDepartment: "Assembly",        targetLine: "Line 2", deployedDate: "2026-02-01", deployedBy: "Deepa Krishnan",  adoptionStatus: "DEVIATED",    deviationNote: "Calibration interval adjusted from 30→45 days per local maintenance schedule",  lastUpdated: "2026-03-08", updatedBy: "Quality Manager" },
  { id: "YOK-004", standardCode: "SOP-ASM-001", standardName: "Torque Fastener Application SOP", standardType: "SOP",     version: "v2.1", targetSite: "Pune",     targetDepartment: "Assembly",        deployedDate: "2026-02-01", deployedBy: "Deepa Krishnan",  adoptionStatus: "ADOPTED",      lastUpdated: "2026-02-25", updatedBy: "Process Lead" },
  { id: "YOK-005", standardCode: "PFC-ASM-001", standardName: "Final Assembly Operation Flow",   standardType: "PFC",     version: "v2.1", targetSite: "Mumbai",   targetDepartment: "Assembly",        deployedDate: "2026-03-01", deployedBy: "Ravi Kumar",       adoptionStatus: "NOT_STARTED", lastUpdated: "2026-03-01", updatedBy: "Ravi Kumar" },
  { id: "YOK-006", standardCode: "P-QC-001",   standardName: "In-Process Quality Inspection",   standardType: "Process", version: "v1.2", targetSite: "Pune",     targetDepartment: "Quality Control", deployedDate: "2026-02-15", deployedBy: "Meena Sundaram",   adoptionStatus: "IN_PROGRESS", lastUpdated: "2026-03-10", updatedBy: "QC Lead" },
  { id: "YOK-007", standardCode: "P-ASM-003",  standardName: "Engine Assembly Subassembly",      standardType: "Process", version: "v2.0", targetSite: "Mumbai",   targetDepartment: "Assembly",        deployedDate: "2026-03-05", deployedBy: "Ravi Kumar",       adoptionStatus: "NOT_STARTED", lastUpdated: "2026-03-05", updatedBy: "Ravi Kumar" },
  { id: "YOK-008", standardCode: "SOP-QC-001", standardName: "Kit Verification SOP",             standardType: "SOP",     version: "v1.3", targetSite: "Pune",     targetDepartment: "Assembly",        deployedDate: "2026-02-20", deployedBy: "Meena Sundaram",   adoptionStatus: "ADOPTED",      lastUpdated: "2026-03-01", updatedBy: "QC Supervisor" },
];

// ─── Process Versions ─────────────────────────────────────────────────────────

export interface ProcessVersion {
  id: string;
  processId: string;
  versionNo: string;
  status: "Draft" | "Under Review" | "Approved" | "Active" | "Superseded" | "Retired";
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  activatedAt?: string;
  supersededAt?: string;
  changeNote: string;
  overrideUsed?: boolean;
  revisionSourceType?: "MANUAL" | "AUDIT" | "MEASURE_REFERENCE" | "DEVIATION_REFERENCE" | "REGULATORY";
  revisionReason?: string;
  referenceMeasureId?: string;
}

export const processVersions: ProcessVersion[] = [
  { id: "PV-001", processId: "PRC-001", versionNo: "v1.0", status: "Superseded",  createdAt: "2024-06-01", createdBy: "Anand Raj",       approvedAt: "2024-06-20", approvedBy: "Plant Manager",   activatedAt: "2024-07-01",  supersededAt: "2025-08-15", changeNote: "Initial version. Defined core assembly steps and SOP linkages.",                                    revisionSourceType: "MANUAL",              revisionReason: "New process definition required for assembly line standardization." },
  { id: "PV-002", processId: "PRC-001", versionNo: "v2.0", status: "Superseded",  createdAt: "2025-07-01", createdBy: "Ravi Kumar",       approvedAt: "2025-07-25", approvedBy: "Deepa Krishnan",  activatedAt: "2025-08-15",  supersededAt: "2026-02-15", changeNote: "Added torque validation node, revised kit shortage exception flow. Linked M-004.", overrideUsed: false, revisionSourceType: "MEASURE_REFERENCE",   revisionReason: "Torque Compliance Rate (M-004) deviation trend triggered review.", referenceMeasureId: "M-004" },
  { id: "PV-003", processId: "PRC-001", versionNo: "v2.1", status: "Active",       createdAt: "2026-01-20", createdBy: "Ravi Kumar",       approvedAt: "2026-02-08", approvedBy: "Plant Manager",   activatedAt: "2026-02-15",                              changeNote: "Added final inspection node, updated rework path ownership. Linked OEE KPI.", overrideUsed: false, revisionSourceType: "MANUAL",              revisionReason: "Annual standard review. Added missing final inspection control point." },
  { id: "PV-004", processId: "PRC-002", versionNo: "v1.0", status: "Active",       createdAt: "2025-10-01", createdBy: "Deepa Krishnan",   approvedAt: "2025-11-01", approvedBy: "Ravi Kumar",      activatedAt: "2026-01-20",                              changeNote: "Initial version. Sub-assembly preparation flow defined.",                                          revisionSourceType: "MANUAL",              revisionReason: "New process required for sub-assembly standardization initiative." },
  { id: "PV-005", processId: "PRC-003", versionNo: "v1.0", status: "Superseded",  createdAt: "2024-09-01", createdBy: "Meena Sundaram",   approvedAt: "2024-10-01", approvedBy: "QC Director",     activatedAt: "2024-10-15", supersededAt: "2026-02-01",  changeNote: "Initial version.",                                                                                 revisionSourceType: "MANUAL",              revisionReason: "Initial definition." },
  { id: "PV-006", processId: "PRC-003", versionNo: "v1.2", status: "Active",       createdAt: "2025-12-01", createdBy: "Meena Sundaram",   approvedAt: "2025-12-20", approvedBy: "QC Director",     activatedAt: "2026-02-01",                              changeNote: "Revised inspection criteria to align with ISO 9001:2015 updates. New owner assignment.",          revisionSourceType: "REGULATORY",          revisionReason: "ISO 9001:2015 revision requires updated inspection acceptance criteria." },
  { id: "PV-007", processId: "PRC-007", versionNo: "v1.0", status: "Superseded",  createdAt: "2024-11-01", createdBy: "Ravi Kumar",       approvedAt: "2024-12-01", approvedBy: "Plant Manager",   activatedAt: "2024-12-15", supersededAt: "2026-02-28",  changeNote: "Initial engine assembly flow.",                                                                    revisionSourceType: "MANUAL",              revisionReason: "Initial definition for engine assembly." },
  { id: "PV-008", processId: "PRC-007", versionNo: "v2.0", status: "Active",       createdAt: "2026-01-15", createdBy: "Ravi Kumar",       approvedAt: "2026-02-15", approvedBy: "Plant Manager",   activatedAt: "2026-02-28",                              changeNote: "Major revision: added rework path and exception escalation flow.", overrideUsed: true,           revisionSourceType: "AUDIT",               revisionReason: "Quality audit finding #QA-2026-014 identified missing exception handling for fastener rework. Immediate revision required.", },
];