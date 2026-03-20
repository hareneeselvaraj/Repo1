// ─── Measures Framework – Extended Data ──────────────────────────────────────

export type ResolutionStatus = "Resolved" | "Ownership Gap" | "Ambiguous" | "Invalid Context";
export type RelationshipType = "Contributes To" | "Derived From" | "Rollup" | "Baseline";
export type TargetType = "Standard" | "Stretch" | "Minimum";
export type ScopeType  = "Monitoring" | "Control" | "Performance" | "Compliance";

// ─── Relationships ────────────────────────────────────────────────────────────
export interface MeasureRelationship {
  id: string;
  fromId: string; // child / contributing measure
  toId:   string; // parent / receiving measure
  type:   RelationshipType;
  weight: number; // 0–1 contribution weight
  shared: boolean; // shared measure (multi-parent)
}

export const measureRelationships: MeasureRelationship[] = [
  { id: "R-001", fromId: "M-001", toId: "M-002", type: "Contributes To", weight: 0.40, shared: false },
  { id: "R-002", fromId: "M-007", toId: "M-002", type: "Contributes To", weight: 0.30, shared: false },
  { id: "R-003", fromId: "M-003", toId: "M-002", type: "Contributes To", weight: 0.30, shared: true  },
  { id: "R-004", fromId: "M-003", toId: "M-001", type: "Contributes To", weight: 0.25, shared: true  },
  { id: "R-005", fromId: "M-004", toId: "M-001", type: "Contributes To", weight: 0.35, shared: false },
  { id: "R-006", fromId: "M-005", toId: "M-001", type: "Contributes To", weight: 0.40, shared: false },
  { id: "R-007", fromId: "M-006", toId: "M-004", type: "Contributes To", weight: 1.00, shared: false },
  { id: "R-008", fromId: "M-008", toId: "M-007", type: "Contributes To", weight: 0.50, shared: false },
];

// ─── Targets ──────────────────────────────────────────────────────────────────
export interface MeasureTarget {
  id:                 string;
  measureId:          string;
  targetType:         TargetType;
  targetValue:        number;
  lowerLimit?:        number;
  upperLimit?:        number;
  warningThreshold?:  number;
  criticalThreshold?: number;
  scopeLabel:         string;
  scopeSite?:         string;
  effectiveFrom:      string;
  effectiveTo?:       string;
  status:             "Active" | "Inactive" | "Superseded";
}

export const measureTargets: MeasureTarget[] = [
  { id: "T-001", measureId: "M-001", targetType: "Standard", targetValue: 98.0, lowerLimit: 95.0, warningThreshold: 96.5, criticalThreshold: 94.0, scopeLabel: "All Sites",          effectiveFrom: "2026-01-01", status: "Active"    },
  { id: "T-002", measureId: "M-001", targetType: "Stretch",  targetValue: 99.5, lowerLimit: 98.0, warningThreshold: 98.5, criticalThreshold: 97.5, scopeLabel: "Chennai / Line 1",   scopeSite: "Chennai", effectiveFrom: "2026-01-01", status: "Active"    },
  { id: "T-003", measureId: "M-001", targetType: "Standard", targetValue: 97.5, lowerLimit: 94.0, warningThreshold: 95.5, criticalThreshold: 93.0, scopeLabel: "Mumbai",             scopeSite: "Mumbai",  effectiveFrom: "2026-01-01", status: "Active"    },
  { id: "T-004", measureId: "M-002", targetType: "Standard", targetValue: 85.0, lowerLimit: 75.0, warningThreshold: 78.0, criticalThreshold: 70.0, scopeLabel: "All Sites",          effectiveFrom: "2025-10-01", status: "Active"    },
  { id: "T-005", measureId: "M-003", targetType: "Standard", targetValue: 12.5, upperLimit: 15.0, warningThreshold: 13.5, criticalThreshold: 15.5, scopeLabel: "Chennai",            scopeSite: "Chennai", effectiveFrom: "2025-11-01", status: "Active"    },
  { id: "T-006", measureId: "M-003", targetType: "Standard", targetValue: 14.0, upperLimit: 17.0, warningThreshold: 15.5, criticalThreshold: 17.5, scopeLabel: "Mumbai",             scopeSite: "Mumbai",  effectiveFrom: "2025-11-01", status: "Active"    },
  { id: "T-007", measureId: "M-004", targetType: "Standard", targetValue: 100.0,lowerLimit: 98.0, warningThreshold: 98.5, criticalThreshold: 97.5, scopeLabel: "All Sites",          effectiveFrom: "2026-01-01", status: "Active"    },
  { id: "T-008", measureId: "M-006", targetType: "Standard", targetValue: 25.0, lowerLimit: 23.0, upperLimit: 27.0, warningThreshold: 24.0, criticalThreshold: 22.5, scopeLabel: "All Sites", effectiveFrom: "2025-09-01", status: "Active" },
  { id: "T-009", measureId: "M-007", targetType: "Standard", targetValue: 0.5,  upperLimit: 1.0,  warningThreshold: 0.8, criticalThreshold: 1.2, scopeLabel: "All Sites",            effectiveFrom: "2026-01-01", status: "Active"    },
  { id: "T-010", measureId: "M-008", targetType: "Standard", targetValue: 4.0,  upperLimit: 6.0,  warningThreshold: 5.0, criticalThreshold: 7.0, scopeLabel: "All Sites",            effectiveFrom: "2025-10-01", status: "Active"    },
];

// ─── Links ────────────────────────────────────────────────────────────────────
export interface MeasureLink {
  id:            string;
  measureId:     string;
  objectType:    "Process" | "PFC" | "SOP" | "SOP Step" | "Position";
  objectId:      string;
  objectName:    string;
  scopeType:     ScopeType;
  sourceService: string;
  status:        "Active" | "Inactive";
}

export const measureLinks: MeasureLink[] = [
  { id: "L-001", measureId: "M-001", objectType: "Process",  objectId: "PRC-001", objectName: "Final Assembly Operation",                       scopeType: "Performance", sourceService: "Process Registry", status: "Active" },
  { id: "L-002", measureId: "M-001", objectType: "SOP",      objectId: "SOP-001", objectName: "Kit Verification SOP",                          scopeType: "Monitoring",  sourceService: "SOP Service",      status: "Active" },
  { id: "L-003", measureId: "M-001", objectType: "SOP",      objectId: "SOP-004", objectName: "Final Inspection and Release SOP",               scopeType: "Monitoring",  sourceService: "SOP Service",      status: "Active" },
  { id: "L-004", measureId: "M-001", objectType: "PFC",      objectId: "PFC-001", objectName: "Final Assembly Operation Flow (N-10 Final Insp)",scopeType: "Monitoring",  sourceService: "PFC Service",      status: "Active" },
  { id: "L-005", measureId: "M-003", objectType: "Process",  objectId: "PRC-001", objectName: "Final Assembly Operation",                       scopeType: "Performance", sourceService: "Process Registry", status: "Active" },
  { id: "L-006", measureId: "M-003", objectType: "PFC",      objectId: "PFC-001", objectName: "Final Assembly Operation Flow",                  scopeType: "Monitoring",  sourceService: "PFC Service",      status: "Active" },
  { id: "L-007", measureId: "M-004", objectType: "SOP",      objectId: "SOP-002", objectName: "Torque Fastener Application SOP",                scopeType: "Control",     sourceService: "SOP Service",      status: "Active" },
  { id: "L-008", measureId: "M-004", objectType: "SOP Step", objectId: "S-002-03",objectName: "SOP-002 · Step 3 – Torque to Specification",     scopeType: "Control",     sourceService: "SOP Service",      status: "Active" },
  { id: "L-009", measureId: "M-006", objectType: "SOP Step", objectId: "S-002-03",objectName: "SOP-002 · Step 3 – Torque to Specification",     scopeType: "Control",     sourceService: "SOP Service",      status: "Active" },
  { id: "L-010", measureId: "M-006", objectType: "PFC",      objectId: "PFC-001", objectName: "Final Assembly Flow (N-07 Torque Validation)",   scopeType: "Control",     sourceService: "PFC Service",      status: "Active" },
  { id: "L-011", measureId: "M-002", objectType: "Process",  objectId: "PRC-001", objectName: "Final Assembly Operation",                       scopeType: "Performance", sourceService: "Process Registry", status: "Active" },
  { id: "L-012", measureId: "M-002", objectType: "Process",  objectId: "PRC-007", objectName: "Engine Assembly Subassembly",                    scopeType: "Performance", sourceService: "Process Registry", status: "Active" },
];

// ─── Ownership Matrix ─────────────────────────────────────────────────────────
export interface OwnershipRow {
  id:               string;
  measureId:        string;
  region:           string;
  site:             string;
  department:       string;
  line:             string;
  shift:            string;
  ownerPosition:    string;
  responsiblePerson:string;
  resolutionStatus: ResolutionStatus;
  lastRefreshed:    string;
}

export const ownershipMatrix: OwnershipRow[] = [
  { id: "O-001", measureId: "M-001", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Ravi Kumar",     resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
  { id: "O-002", measureId: "M-001", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 1", shift: "Night",   ownerPosition: "Production Supervisor", responsiblePerson: "Suresh Babu",    resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
  { id: "O-003", measureId: "M-001", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 2", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Not Resolved",   resolutionStatus: "Ownership Gap",  lastRefreshed: "2026-03-13" },
  { id: "O-004", measureId: "M-001", region: "West India",  site: "Mumbai",  department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Kiran Mehta",    resolutionStatus: "Resolved",       lastRefreshed: "2026-03-12" },
  { id: "O-005", measureId: "M-001", region: "West India",  site: "Pune",    department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Multiple",       resolutionStatus: "Ambiguous",      lastRefreshed: "2026-03-11" },
  { id: "O-006", measureId: "M-004", region: "South India", site: "Chennai", department: "Quality Control",  line: "Line 1", shift: "Day",     ownerPosition: "Quality Inspector",     responsiblePerson: "Meena Sundaram", resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
  { id: "O-007", measureId: "M-004", region: "South India", site: "Chennai", department: "Quality Control",  line: "Line 2", shift: "Day",     ownerPosition: "Quality Inspector",     responsiblePerson: "Not Resolved",   resolutionStatus: "Ownership Gap",  lastRefreshed: "2026-03-13" },
  { id: "O-008", measureId: "M-004", region: "West India",  site: "Mumbai",  department: "Quality Control",  line: "Line 1", shift: "Day",     ownerPosition: "Quality Inspector",     responsiblePerson: "Anita Shinde",   resolutionStatus: "Resolved",       lastRefreshed: "2026-03-12" },
  { id: "O-009", measureId: "M-002", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Ravi Kumar",     resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
  { id: "O-010", measureId: "M-003", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Production Supervisor", responsiblePerson: "Ravi Kumar",     resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
  { id: "O-011", measureId: "M-003", region: "West India",  site: "Pune",    department: "Assembly",         line: "Line 1", shift: "General", ownerPosition: "Production Supervisor", responsiblePerson: "Not Resolved",   resolutionStatus: "Invalid Context",lastRefreshed: "2026-03-10" },
  { id: "O-012", measureId: "M-006", region: "South India", site: "Chennai", department: "Assembly",         line: "Line 1", shift: "Day",     ownerPosition: "Quality Inspector",     responsiblePerson: "Meena Sundaram", resolutionStatus: "Resolved",       lastRefreshed: "2026-03-13" },
];

// ─── Versions ─────────────────────────────────────────────────────────────────
export interface MeasureVersion {
  id:           string;
  measureId:    string;
  versionNo:    string;
  status:       string;
  createdAt:    string;
  createdBy:    string;
  approvedAt?:  string;
  activatedAt?: string;
  changeLog:    string;
}

export const measureVersions: MeasureVersion[] = [
  { id: "V-001", measureId: "M-001", versionNo: "v1.0", status: "Superseded", createdAt: "2025-01-10", createdBy: "Anand Raj",       approvedAt: "2025-01-25", activatedAt: "2025-02-01", changeLog: "Initial definition" },
  { id: "V-002", measureId: "M-001", versionNo: "v1.1", status: "Superseded", createdAt: "2025-06-15", createdBy: "Meena Sundaram",  approvedAt: "2025-07-01", activatedAt: "2025-07-05", changeLog: "Target revised: 97% → 98%; lower limit added" },
  { id: "V-003", measureId: "M-001", versionNo: "v1.2", status: "Effective",  createdAt: "2026-01-05", createdBy: "Deepa Krishnan",  approvedAt: "2026-01-20", activatedAt: "2026-02-01", changeLog: "Site-specific stretch target added for Chennai Line 1; warning threshold added" },
  { id: "V-004", measureId: "M-004", versionNo: "v1.0", status: "Superseded", createdAt: "2025-04-01", createdBy: "Ravi Kumar",       approvedAt: "2025-04-15", activatedAt: "2025-05-01", changeLog: "Initial definition" },
  { id: "V-005", measureId: "M-004", versionNo: "v2.0", status: "Effective",  createdAt: "2026-01-10", createdBy: "Ravi Kumar",       approvedAt: "2026-01-22", activatedAt: "2026-02-01", changeLog: "Critical threshold tightened 97% → 97.5%; SOP Step link added" },
  { id: "V-006", measureId: "M-002", versionNo: "v1.0", status: "Superseded", createdAt: "2024-10-01", createdBy: "Priya Nair",       approvedAt: "2024-10-15", activatedAt: "2024-11-01", changeLog: "Initial enterprise KPI" },
  { id: "V-007", measureId: "M-002", versionNo: "v1.1", status: "Effective",  createdAt: "2025-10-01", createdBy: "Priya Nair",       approvedAt: "2025-10-15", activatedAt: "2025-11-01", changeLog: "Availability/Performance/Quality sub-measures linked" },
];

// ─── History / Audit Events ───────────────────────────────────────────────────
export interface MeasureHistoryEvent {
  id:         string;
  measureId:  string;
  timestamp:  string;
  actor:      string;
  action:     string;
  field?:     string;
  oldValue?:  string;
  newValue?:  string;
  reason?:    string;
}

export const measureHistory: MeasureHistoryEvent[] = [
  { id: "MH-001", measureId: "M-001", timestamp: "2026-02-01 10:00", actor: "System",          action: "ACTIVATED",      field: "Status",       oldValue: "Approved",    newValue: "Effective"  },
  { id: "MH-002", measureId: "M-001", timestamp: "2026-01-20 14:30", actor: "Suresh Babu",     action: "APPROVED",       field: "Status",       oldValue: "Under Review",newValue: "Approved",  reason: "Validated against Q1 production targets" },
  { id: "MH-003", measureId: "M-001", timestamp: "2026-01-15 11:00", actor: "Deepa Krishnan",  action: "SUBMITTED",      field: "Status",       oldValue: "Draft",       newValue: "Submitted" },
  { id: "MH-004", measureId: "M-001", timestamp: "2026-01-12 09:20", actor: "Deepa Krishnan",  action: "UPDATED",        field: "Target Value", oldValue: "97.5",        newValue: "98.0",      reason: "Aligned with Chennai site quality targets" },
  { id: "MH-005", measureId: "M-001", timestamp: "2026-01-10 09:00", actor: "Deepa Krishnan",  action: "LINKED",         field: "Links",        newValue: "SOP-004 – Final Inspection SOP added" },
  { id: "MH-006", measureId: "M-001", timestamp: "2026-01-05 08:45", actor: "Deepa Krishnan",  action: "CREATED",        field: "Version",      newValue: "v1.2 created from v1.1" },
  { id: "MH-007", measureId: "M-001", timestamp: "2025-07-05 10:00", actor: "System",          action: "ACTIVATED",      field: "Status",       oldValue: "Approved",    newValue: "Effective"  },
  { id: "MH-008", measureId: "M-001", timestamp: "2025-07-01 15:00", actor: "Priya Nair",      action: "APPROVED",       field: "Status",       oldValue: "Under Review",newValue: "Approved",  reason: "Reviewed and compliant" },
];

// ─── Graph Positions ──────────────────────────────────────────────────────────
export interface GraphNodePos {
  measureId: string;
  x:         number;
  y:         number;
}

export const graphNodePositions: GraphNodePos[] = [
  { measureId: "M-002", x: 310, y: 30  }, // OEE (root)
  { measureId: "M-001", x: 100, y: 160 }, // First Pass Yield
  { measureId: "M-007", x: 310, y: 160 }, // Scrap Rate
  { measureId: "M-003", x: 530, y: 160 }, // Cycle Time [shared]
  { measureId: "M-004", x: 20,  y: 290 }, // Torque Compliance
  { measureId: "M-005", x: 200, y: 290 }, // Kit Lead Time
  { measureId: "M-008", x: 380, y: 290 }, // MTTR
  { measureId: "M-006", x: 20,  y: 420 }, // Fastener Torque Value (leaf)
];

// ─── Version Compare Data (for Measure v1.1 → v1.2 of FPY) ──────────────────
export const versionCompareData = {
  left:  { version: "v1.1", status: "Superseded", createdBy: "Meena Sundaram",  activatedAt: "2025-07-05" },
  right: { version: "v1.2", status: "Effective",  createdBy: "Deepa Krishnan", activatedAt: "2026-02-01" },
  sections: [
    {
      section: "Overview",
      fields: [
        { field: "Target Value",       v1: "97.5 %",             v2: "98.0 %",             changed: true  },
        { field: "Lower Limit",        v1: "94.0 %",             v2: "95.0 %",             changed: true  },
        { field: "Warning Threshold",  v1: "—",                  v2: "96.5 %",             changed: true  },
        { field: "Description",        v1: "Ratio of units passing first-time inspection", v2: "Ratio of units passing first-time inspection without rework or scrap", changed: true  },
        { field: "Frequency",          v1: "Daily",              v2: "Daily",              changed: false },
      ],
    },
    {
      section: "Owner",
      fields: [
        { field: "Owner Position",     v1: "QC Manager",         v2: "Production Supervisor", changed: true  },
        { field: "Resolved Person",    v1: "Meena Sundaram",     v2: "Ravi Kumar",          changed: true  },
      ],
    },
    {
      section: "Links",
      fields: [
        { field: "SOP-001",            v1: "Linked",             v2: "Linked",             changed: false },
        { field: "SOP-004",            v1: "—",                  v2: "Linked (added)",     changed: true  },
        { field: "PFC-001",            v1: "—",                  v2: "Linked (added)",     changed: true  },
      ],
    },
    {
      section: "Targets",
      fields: [
        { field: "All Sites – Standard", v1: "97.5 %",           v2: "98.0 %",             changed: true  },
        { field: "Chennai / Line 1 – Stretch", v1: "—",          v2: "99.5 % (added)",     changed: true  },
        { field: "Mumbai – Standard",    v1: "—",                v2: "97.5 % (added)",     changed: true  },
      ],
    },
    {
      section: "Relationships",
      fields: [
        { field: "Contributes To: OEE", v1: "Yes",              v2: "Yes",                changed: false },
        { field: "Via Cycle Time (shared)", v1: "—",            v2: "Added",              changed: true  },
      ],
    },
  ],
};
