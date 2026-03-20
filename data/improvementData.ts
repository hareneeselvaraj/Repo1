// ─── Module 1.6 – Improvement Layer Data ─────────────────────────────────────
// Entry: ONLY from 1.5 abnormality disposition → "Escalate to RCA"
// Exit: Feeds back into 1.3 (Measures) and 1.4 (SOP Library)

export type PDCAStage  = "PLAN" | "DO" | "CHECK" | "ACT" | "CLOSED";
export type ImpStatus  = "Open" | "RCA" | "CAPA" | "Validation" | "Standardization" | "Closed";
export type ImpPriority = "Critical" | "High" | "Medium" | "Low";
export type CapaType   = "Corrective" | "Preventive";
export type CapaStatus = "Open" | "In Progress" | "Completed" | "Verified";
export type ValidationResult = "Effective" | "Not Effective" | "Partial" | null;
export type StdItemStatus = "Pending" | "Approved" | "Rejected" | "Applied";
export type YokotenStatus = "Pending" | "Accepted" | "Rejected" | "Implemented";
export type RCAMethod = "5WHY" | "FISHBONE";
export type Confidence = "High" | "Medium" | "Low";

export interface WhyStep {
  id: string;
  question: string;
  answer: string;
}

export interface FishboneEntry {
  category: "Man" | "Machine" | "Method" | "Material" | "Measurement" | "Environment";
  causes: string[];
}

export interface RootCause {
  description: string;
  category: string;
  validationBasis: string;
  confidence: Confidence;
}

export interface CAPA {
  id: string;
  title: string;
  description: string;
  type: CapaType;
  ownerPosition: string;
  ownerPerson: string;
  dueDate: string;
  status: CapaStatus;
  expectedOutcome: string;
  evidence: string[];
  comments: string;
}

export interface StandardizationItem {
  id: string;
  type: "SOP" | "Measure";
  target: string;
  targetName: string;
  change: string;
  status: StdItemStatus;
  route: string;   // navigation target
}

export interface YokotenItem {
  id: string;
  context: string;
  recommendation: string;
  status: YokotenStatus;
}

export interface ImpTimelineEvent {
  at: string;
  actor: string;
  event: string;
  stage: PDCAStage | "ENTRY";
}

export interface ImprovementCase {
  id: string;
  title: string;
  // Source traceability
  sourceAbnormalityId: string;
  sourceAbnormalityDesc: string;
  sourceKpiId: string;
  sourceKpiName: string;
  sourceKpiValue: string;
  sourceKpiTarget: string;
  sourceKpiUnit: string;
  sourceSopRef: string;
  sourceSopName: string;
  sourceMeasureCode: string;
  sourceActions: string[];     // action IDs from 1.5
  repeatCount: number;
  // Lifecycle
  pdcaStage: PDCAStage;
  status: ImpStatus;
  priority: ImpPriority;
  severity: "Critical" | "High" | "Medium";
  context: { site: string; line: string; department: string; shift: string };
  ownerPosition: string;
  ownerPerson: string;
  createdAt: string;
  updatedAt: string;
  // PLAN — RCA
  problemStatement: string;
  rcaMethod: RCAMethod;
  whys: WhyStep[];
  fishbone: FishboneEntry[];
  rootCause: RootCause | null;
  rcaFinalized: boolean;
  // DO — CAPA
  capas: CAPA[];
  // CHECK — Validation
  validationResult: ValidationResult;
  validationNotes: string;
  kpiBeforeValue: string;
  kpiAfterValue: string;
  // ACT — Standardization
  standardizationItems: StandardizationItem[];
  yokotenItems: YokotenItem[];
  // Timeline
  timeline: ImpTimelineEvent[];
}

// ─── Mock Cases ───────────────────────────────────────────────────────────────

export const improvementCases: ImprovementCase[] = [

  // ── IMP-001: OEE / Station 3 Bearing Failure — PLAN (RCA in progress) ──
  {
    id: "IMP-001",
    title: "OEE Critical — Station 3 Bearing Failure Root Cause",
    sourceAbnormalityId: "ABN-001",
    sourceAbnormalityDesc: "OEE dropped to 71.4% — 8.6 pp below target. Equipment downtime on Station 3 contributing 62% of loss.",
    sourceKpiId: "KPI-T1-002", sourceKpiName: "OEE",
    sourceKpiValue: "71.4", sourceKpiTarget: "80", sourceKpiUnit: "%",
    sourceSopRef: "SOP-ASM-003", sourceSopName: "Station 3 Equipment Operating Procedure",
    sourceMeasureCode: "M-OEE-001",
    sourceActions: ["ACT-001", "ACT-002", "ACT-003"],
    repeatCount: 3,
    pdcaStage: "PLAN",
    status: "RCA",
    priority: "Critical",
    severity: "Critical",
    context: { site: "Chennai", line: "Line 1", department: "Assembly", shift: "Day" },
    ownerPosition: "Maintenance Manager",
    ownerPerson: "Anand Raj",
    createdAt: "2026-03-18 · 10:15 AM",
    updatedAt: "2026-03-18 · 11:30 AM",
    problemStatement: "Station 3 OEE has fallen below 75% threshold for the 3rd consecutive occurrence in 7 days. Primary loss driver is unplanned equipment downtime from bearing failure. Each incident causes 45–90 min downtime affecting shift output by 15–20 units.",
    rcaMethod: "5WHY",
    whys: [
      { id: "W1", question: "Why did OEE drop below 72%?",
        answer: "Station 3 had unplanned downtime of 90 min due to bearing seizure on the main drive." },
      { id: "W2", question: "Why did the bearing seize?",
        answer: "Bearing was running dry — no lubrication was present during inspection after seizure." },
      { id: "W3", question: "Why was there no lubrication?",
        answer: "Scheduled lubrication (every 500 hrs) was last done at 2,100 hrs. Current reading is 2,680 hrs — 180 hrs overdue." },
      { id: "W4", question: "Why was the lubrication schedule overdue by 180 hours?",
        answer: "PM calendar was not updated after last execution. The task was marked 'In Progress' but never closed out." },
      { id: "W5", question: "Why was the PM task not properly closed out?",
        answer: "No mandatory sign-off step exists in the SOP for PM task completion. Technicians informally close tasks without system update." },
    ],
    fishbone: [
      { category: "Machine",  causes: ["Bearing wear beyond design life", "No vibration sensor on main drive"] },
      { category: "Method",   causes: ["PM SOP missing mandatory sign-off step", "Lubrication schedule not enforced digitally"] },
      { category: "Man",      causes: ["Technician did not update PM system", "Supervisor did not verify PM closure"] },
      { category: "Material", causes: ["Correct lubricant grade not specified in SOP"] },
    ],
    rootCause: {
      description: "No mandatory digital sign-off step in PM SOP for lubrication task closure. Allows PM tasks to lapse without system visibility.",
      category: "Process / SOP Gap",
      validationBasis: "PM history shows 3 of last 6 lubrication tasks marked 'In Progress' without closure. All 3 correlated with subsequent bearing incidents.",
      confidence: "High",
    },
    rcaFinalized: true,
    capas: [
      {
        id: "CAPA-001", title: "Add mandatory PM sign-off to Station 3 SOP",
        description: "Update SOP-ASM-003 to include a mandatory step: after each PM task, technician must scan QR code to confirm completion and lubricant grade used. System auto-closes task only after scan.",
        type: "Corrective", ownerPosition: "Process Engineer", ownerPerson: "Priya Nair",
        dueDate: "2026-03-22", status: "In Progress",
        expectedOutcome: "Zero overdue PM tasks. All bearing lubrication captured in system.",
        evidence: ["sop_draft_rev_2.2.pdf"], comments: "SOP revision in review with Quality team.",
      },
      {
        id: "CAPA-002", title: "Install vibration sensor on Station 3 main drive",
        description: "Install IoT vibration sensor to provide early warning of bearing degradation. Set alert threshold at 4.5 mm/s (current baseline: 2.1 mm/s).",
        type: "Preventive", ownerPosition: "Maintenance Lead", ownerPerson: "Not Resolved",
        dueDate: "2026-03-28", status: "Open",
        expectedOutcome: "Predictive alert 48–72 hrs before bearing failure. Reduce unplanned downtime by 80%.",
        evidence: [], comments: "",
      },
    ],
    validationResult: null,
    validationNotes: "",
    kpiBeforeValue: "71.4", kpiAfterValue: "",
    standardizationItems: [],
    yokotenItems: [],
    timeline: [
      { at: "2026-03-18 · 09:12 AM", actor: "System",         event: "ABN-001 detected — OEE Critical (71.4%)",                 stage: "ENTRY" },
      { at: "2026-03-18 · 09:50 AM", actor: "Ravi Kumar",     event: "Disposition: Escalate to RCA — repeat count ×3",         stage: "ENTRY" },
      { at: "2026-03-18 · 10:15 AM", actor: "System",         event: "Improvement Case IMP-001 created from ABN-001",           stage: "PLAN" },
      { at: "2026-03-18 · 10:30 AM", actor: "Anand Raj",      event: "Assigned as Case Owner · RCA started",                   stage: "PLAN" },
      { at: "2026-03-18 · 11:20 AM", actor: "Anand Raj",      event: "5-Why analysis completed (5/5 steps)",                    stage: "PLAN" },
      { at: "2026-03-18 · 11:30 AM", actor: "Anand Raj",      event: "Root Cause identified and finalized — Confidence: High",  stage: "PLAN" },
    ],
  },

  // ── IMP-002: Scrap Rate Fixture Drift — DO (CAPA executing) ──
  {
    id: "IMP-002",
    title: "Scrap Rate Persistent — Station 2 Fixture Alignment Drift",
    sourceAbnormalityId: "ABN-002",
    sourceAbnormalityDesc: "Scrap Rate at 4.3% — 1.8 pp above threshold. Fixture alignment drift on Station 2.",
    sourceKpiId: "KPI-T1-005", sourceKpiName: "Scrap Rate",
    sourceKpiValue: "4.3", sourceKpiTarget: "2.5", sourceKpiUnit: "%",
    sourceSopRef: "SOP-ASM-007", sourceSopName: "Station 2 Fixture Setup & Inspection",
    sourceMeasureCode: "M-SCRAP-001",
    sourceActions: ["ACT-004", "ACT-005"],
    repeatCount: 2,
    pdcaStage: "DO",
    status: "CAPA",
    priority: "Critical",
    severity: "Critical",
    context: { site: "Chennai", line: "Line 1", department: "Assembly", shift: "Day" },
    ownerPosition: "Quality Engineer",
    ownerPerson: "Meena Sundaram",
    createdAt: "2026-03-16 · 02:30 PM",
    updatedAt: "2026-03-18 · 09:00 AM",
    problemStatement: "Scrap rate on Line 1 has exceeded 3.5% UCL for 2 consecutive occurrences. Failure mode is dimensional non-conformance — parts out of tolerance at Station 2. Fixture alignment drift suspected as primary cause.",
    rcaMethod: "FISHBONE",
    whys: [],
    fishbone: [
      { category: "Machine",  causes: ["Fixture alignment drift >0.3 mm after 200 cycles", "Locating pin wear not tracked"] },
      { category: "Method",   causes: ["No fixture verification step before each shift", "Inspection frequency: weekly only"] },
      { category: "Man",      causes: ["Setup operator not checking fixture datum before production"] },
      { category: "Measurement", causes: ["No CMM check for fixture alignment", "Gauge R&R not performed on fixture gauge"] },
    ],
    rootCause: {
      description: "Fixture alignment is not verified before each production shift. Locating pins wear over 200 cycles and drift without detection. SOP-ASM-007 does not include a shift-start fixture verification step.",
      category: "Measurement / Method Gap",
      validationBasis: "CMM inspection confirmed 0.42 mm alignment drift on Station 2 fixture. Scrap occurred only on parts processed after drift exceeded 0.30 mm (confirmed from batch traceability).",
      confidence: "High",
    },
    rcaFinalized: true,
    capas: [
      {
        id: "CAPA-003", title: "Add shift-start fixture verification to SOP-ASM-007",
        description: "Update SOP-ASM-007 to include mandatory fixture alignment check using dial gauge at shift start. Tolerance: ≤0.15 mm. Record in system before production begins.",
        type: "Corrective", ownerPosition: "Process Engineer", ownerPerson: "Priya Nair",
        dueDate: "2026-03-19", status: "Completed",
        expectedOutcome: "Zero undetected fixture drift. Scrap rate below 2.5% target.",
        evidence: ["sop_asm007_rev1.3.pdf", "fixture_check_template.xlsx"], comments: "SOP approved by Quality. Training done with day shift operators.",
      },
      {
        id: "CAPA-004", title: "Implement locating pin wear tracking system",
        description: "Create digital log for locating pin replacement cycle. Set PM task at every 200 production cycles. Alert generated automatically.",
        type: "Preventive", ownerPosition: "Maintenance Lead", ownerPerson: "Ravi Kumar",
        dueDate: "2026-03-24", status: "In Progress",
        expectedOutcome: "Pin replacement before wear causes dimensional drift. Extend fixture accuracy life to 400+ cycles.",
        evidence: [], comments: "Digital log template created. PM system integration pending.",
      },
      {
        id: "CAPA-005", title: "Perform Gauge R&R study on fixture gauge",
        description: "Conduct Gauge R&R study to validate fixture alignment gauge capability. MSA report required.",
        type: "Preventive", ownerPosition: "Quality Engineer", ownerPerson: "Meena Sundaram",
        dueDate: "2026-03-26", status: "Open",
        expectedOutcome: "Gauge R&R ≤10% (Acceptable). Validated measurement system.",
        evidence: [], comments: "",
      },
    ],
    validationResult: null,
    validationNotes: "",
    kpiBeforeValue: "4.3", kpiAfterValue: "",
    standardizationItems: [],
    yokotenItems: [],
    timeline: [
      { at: "2026-03-15 · 08:55 AM", actor: "System",           event: "ABN-002 detected — Scrap Rate Critical (4.3%)",         stage: "ENTRY" },
      { at: "2026-03-15 · 10:20 AM", actor: "Meena Sundaram",   event: "Disposition: Escalate to RCA — repeat count ×2",       stage: "ENTRY" },
      { at: "2026-03-16 · 02:30 PM", actor: "System",           event: "Improvement Case IMP-002 created",                     stage: "PLAN" },
      { at: "2026-03-16 · 03:00 PM", actor: "Meena Sundaram",   event: "Fishbone analysis completed",                          stage: "PLAN" },
      { at: "2026-03-16 · 04:15 PM", actor: "Meena Sundaram",   event: "Root Cause finalized — CMM data confirms fixture drift",stage: "PLAN" },
      { at: "2026-03-17 · 09:00 AM", actor: "System",           event: "Stage advanced: PLAN → DO",                           stage: "DO" },
      { at: "2026-03-17 · 09:30 AM", actor: "Priya Nair",       event: "CAPA-003 created and assigned",                       stage: "DO" },
      { at: "2026-03-17 · 11:00 AM", actor: "Priya Nair",       event: "CAPA-003 completed — SOP updated & operators trained", stage: "DO" },
      { at: "2026-03-18 · 09:00 AM", actor: "Ravi Kumar",       event: "CAPA-004 In Progress — digital log template created",  stage: "DO" },
    ],
  },

  // ── IMP-003: Torque Compliance Degradation — CHECK (Validation) ──
  {
    id: "IMP-003",
    title: "Torque Compliance Decline — Tool Calibration Gap Resolved",
    sourceAbnormalityId: "ABN-004",
    sourceAbnormalityDesc: "Torque compliance fell to 94.1% — below 98% spec. Tool calibration overdue on Station 4.",
    sourceKpiId: "KPI-T1-004", sourceKpiName: "Torque Compliance",
    sourceKpiValue: "94.1", sourceKpiTarget: "98", sourceKpiUnit: "%",
    sourceSopRef: "SOP-ASM-011", sourceSopName: "Torque Tool Calibration & Verification",
    sourceMeasureCode: "M-TORQ-001",
    sourceActions: ["ACT-007"],
    repeatCount: 2,
    pdcaStage: "CHECK",
    status: "Validation",
    priority: "High",
    severity: "High",
    context: { site: "Chennai", line: "Line 1", department: "Assembly", shift: "Day" },
    ownerPosition: "Quality Lead",
    ownerPerson: "Deepa Krishnan",
    createdAt: "2026-03-14 · 11:00 AM",
    updatedAt: "2026-03-18 · 08:30 AM",
    problemStatement: "Torque compliance on Station 4 has degraded from 98.5% to 94.1% over 4 days. This creates a safety risk — torque non-compliance on safety-critical fasteners. Tool calibration was found to be 45 days overdue.",
    rcaMethod: "5WHY",
    whys: [
      { id: "W1", question: "Why did torque compliance drop to 94.1%?",
        answer: "Torque tool on Station 4 was delivering 6% below set point due to tool drift." },
      { id: "W2", question: "Why was the tool drifting?",
        answer: "Calibration was 45 days overdue. Tool had not been recalibrated since November 2025." },
      { id: "W3", question: "Why was calibration overdue?",
        answer: "Calibration schedule is tracked manually on a whiteboard. No automated reminder or system enforcement." },
      { id: "W4", question: "Why is there no automated calibration tracking?",
        answer: "SOP-ASM-011 specifies calibration every 30 days but does not mandate system-based scheduling." },
      { id: "W5", question: "Why does the SOP not mandate system scheduling?",
        answer: "SOP was written before the DWM system was deployed. It has not been updated to leverage digital PM capabilities." },
    ],
    fishbone: [],
    rootCause: {
      description: "SOP-ASM-011 does not mandate digital PM scheduling for torque tool calibration. Manual whiteboard tracking is unreliable and creates compliance risk.",
      category: "SOP Gap / Process",
      validationBasis: "Calibration log shows 3 of 5 torque tools had overdue calibration in last 90 days — all correlated with torque compliance events.",
      confidence: "High",
    },
    rcaFinalized: true,
    capas: [
      {
        id: "CAPA-006", title: "Recalibrate all torque tools immediately",
        description: "Emergency recalibration of all 5 torque tools on Line 1. Verify against reference standard. Record calibration certificates in system.",
        type: "Corrective", ownerPosition: "Calibration Technician", ownerPerson: "Suresh Babu",
        dueDate: "2026-03-15", status: "Completed",
        expectedOutcome: "All tools within ±2% of setpoint. Compliance returns to ≥98%.",
        evidence: ["calibration_cert_mar2026.pdf", "torque_tool_verification.xlsx"],
        comments: "All 5 tools recalibrated. Results: ±0.8 to 1.4% — within spec.",
      },
      {
        id: "CAPA-007", title: "Update SOP-ASM-011 to mandate digital PM scheduling",
        description: "Revise SOP to require torque tool calibration schedule to be managed in DWM PM module. 30-day auto-reminder. Supervisor approval required before tool use after calibration due date.",
        type: "Preventive", ownerPosition: "Process Engineer", ownerPerson: "Priya Nair",
        dueDate: "2026-03-18", status: "Completed",
        expectedOutcome: "Zero overdue calibrations. Digital enforcement of schedule.",
        evidence: ["sop_asm011_rev2.0.pdf"], comments: "Approved by Quality Manager on 2026-03-17.",
      },
    ],
    validationResult: null,
    validationNotes: "",
    kpiBeforeValue: "94.1", kpiAfterValue: "97.8",
    standardizationItems: [
      { id: "STD-001", type: "SOP", target: "SOP-ASM-011", targetName: "Torque Tool Calibration & Verification",
        change: "Add mandatory digital PM scheduling step. Supervisor lock-out if calibration overdue.",
        status: "Pending", route: "/sop-editor" },
      { id: "STD-002", type: "Measure", target: "KPI-T1-004", targetName: "Torque Compliance",
        change: "Add pre-shift tool verification check as leading indicator. Threshold: tool calibration ≤30 days.",
        status: "Pending", route: "/measures" },
    ],
    yokotenItems: [
      { id: "YOK-001", context: "Line 2 · Assembly", recommendation: "Apply digital PM scheduling for torque tools. Line 2 uses same tool model — same risk.", status: "Pending" },
      { id: "YOK-002", context: "Line 3 · Assembly", recommendation: "Review torque tool calibration history. Whiteboard tracking also used on Line 3.", status: "Pending" },
    ],
    timeline: [
      { at: "2026-03-13 · 10:10 AM", actor: "System",         event: "ABN-004 detected — Torque Compliance 94.1%",           stage: "ENTRY" },
      { at: "2026-03-13 · 12:00 PM", actor: "Deepa Krishnan", event: "Disposition: Escalate to RCA — repeated ×2",           stage: "ENTRY" },
      { at: "2026-03-14 · 11:00 AM", actor: "System",         event: "IMP-003 created",                                      stage: "PLAN" },
      { at: "2026-03-14 · 02:00 PM", actor: "Deepa Krishnan", event: "5-Why completed · Root Cause identified",              stage: "PLAN" },
      { at: "2026-03-15 · 09:00 AM", actor: "System",         event: "Stage advanced: PLAN → DO",                           stage: "DO" },
      { at: "2026-03-15 · 10:30 AM", actor: "Suresh Babu",    event: "CAPA-006 completed — all tools recalibrated",         stage: "DO" },
      { at: "2026-03-17 · 04:00 PM", actor: "Priya Nair",     event: "CAPA-007 completed — SOP-ASM-011 updated & approved", stage: "DO" },
      { at: "2026-03-18 · 08:30 AM", actor: "System",         event: "Stage advanced: DO → CHECK (validation period: 3 days)", stage: "CHECK" },
    ],
  },

  // ── IMP-004: FPY Decline — ACT (Ready for standardization) ──
  {
    id: "IMP-004",
    title: "FPY Systematic Decline — Operator Technique Standardization",
    sourceAbnormalityId: "ABN-003",
    sourceAbnormalityDesc: "FPY declined from 91.1% to 87.2% over 2-hour window. Correlates with torque compliance drop.",
    sourceKpiId: "KPI-T1-001", sourceKpiName: "First Pass Yield",
    sourceKpiValue: "87.2", sourceKpiTarget: "92", sourceKpiUnit: "%",
    sourceSopRef: "SOP-ASM-001", sourceSopName: "Assembly Line Standard Work — Line 1",
    sourceMeasureCode: "M-FPY-001",
    sourceActions: ["ACT-006"],
    repeatCount: 1,
    pdcaStage: "ACT",
    status: "Standardization",
    priority: "High",
    severity: "High",
    context: { site: "Chennai", line: "Line 1", department: "Assembly", shift: "Day" },
    ownerPosition: "Process Manager",
    ownerPerson: "Anand Raj",
    createdAt: "2026-03-10 · 09:00 AM",
    updatedAt: "2026-03-18 · 07:00 AM",
    problemStatement: "FPY on Line 1 shows a consistent 2–3% decline every 2–3 weeks. Pattern analysis shows it correlates with operator rotation. New operators on Station 5 hand-tightening sequence deviate from standard, causing 68% of first-pass failures.",
    rcaMethod: "5WHY",
    whys: [
      { id: "W1", question: "Why is FPY below 88%?", answer: "68% of failures trace to Station 5 — incorrect fastener tightening sequence." },
      { id: "W2", question: "Why is the tightening sequence incorrect?", answer: "Station 5 operators are following a different sequence than SOP. The SOP visual aid is incorrect (outdated illustration)." },
      { id: "W3", question: "Why is the SOP visual aid outdated?", answer: "SOP-ASM-001 was last updated in 2023. The fastener pattern changed in 2024 redesign but SOP was not updated." },
      { id: "W4", question: "Why was the SOP not updated during product redesign?", answer: "There is no formal SOP impact review in the product change process. Engineering changes are approved without checking SOP alignment." },
      { id: "W5", question: "Why is there no SOP impact review in the change process?", answer: "The change management process (1.4) does not have a mandatory SOP traceability check as a gate." },
    ],
    fishbone: [],
    rootCause: {
      description: "No mandatory SOP impact review in the engineering change approval process. SOP-ASM-001 visual aid for Station 5 tightening sequence is outdated (2023 version, 2024 pattern not updated). Operators follow incorrect sequence, causing dimensional failures.",
      category: "Process / Change Management Gap",
      validationBasis: "Defect traceability analysis: 68% of FPY failures in last 30 days trace to Station 5 tightening sequence. Confirmed by comparing operator-executed sequence against engineering specification.",
      confidence: "High",
    },
    rcaFinalized: true,
    capas: [
      {
        id: "CAPA-008", title: "Update SOP-ASM-001 visual aid for Station 5",
        description: "Revise SOP-ASM-001 Section 4.3 — replace 2023 tightening sequence illustration with current 2024 fastener pattern. Add torque value table.",
        type: "Corrective", ownerPosition: "Process Engineer", ownerPerson: "Priya Nair",
        dueDate: "2026-03-12", status: "Completed",
        expectedOutcome: "Operators follow correct 2024 tightening sequence. FPY returns to ≥92%.",
        evidence: ["sop_asm001_rev3.1.pdf"], comments: "Updated & approved. Posted at station.",
      },
      {
        id: "CAPA-009", title: "Retrain all Line 1 operators on Station 5 procedure",
        description: "Conduct re-training session with all Line 1 operators on updated Station 5 SOP. Confirm competency via skill assessment.",
        type: "Corrective", ownerPosition: "Training Coordinator", ownerPerson: "Suresh Babu",
        dueDate: "2026-03-14", status: "Completed",
        expectedOutcome: "All 12 Line 1 operators certified on new sequence.",
        evidence: ["training_attendance_mar14.pdf", "competency_assessment_results.xlsx"], comments: "12/12 operators trained and assessed.",
      },
      {
        id: "CAPA-010", title: "Add SOP impact review gate to engineering change process",
        description: "Modify the engineering change approval form (ECO process) to include mandatory 'SOP Traceability Review' step. No ECO approved without process engineer sign-off on SOP impact.",
        type: "Preventive", ownerPosition: "Process Manager", ownerPerson: "Anand Raj",
        dueDate: "2026-03-20", status: "In Progress",
        expectedOutcome: "Zero SOP misalignment from future engineering changes.",
        evidence: [], comments: "ECO form revised. Awaiting quality management system update.",
      },
    ],
    validationResult: "Effective",
    validationNotes: "FPY recovered from 87.2% to 92.8% over 4-day validation period. Station 5 defect rate dropped from 68% of failures to 8%. Trend stable above 92% for 3 consecutive shifts.",
    kpiBeforeValue: "87.2", kpiAfterValue: "92.8",
    standardizationItems: [
      { id: "STD-003", type: "SOP", target: "SOP-ASM-001", targetName: "Assembly Line Standard Work — Line 1",
        change: "Update Section 4.3 with correct 2024 fastener tightening sequence illustration and torque table.",
        status: "Approved", route: "/sop-editor" },
      { id: "STD-004", type: "SOP", target: "SOP-ECO-001", targetName: "Engineering Change Order Process",
        change: "Add mandatory 'SOP Traceability Review' gate before ECO approval. Process Engineer sign-off required.",
        status: "Pending", route: "/sop-editor" },
      { id: "STD-005", type: "Measure", target: "KPI-T1-001", targetName: "First Pass Yield",
        change: "Add leading indicator: Station 5 tightening sequence verification pass rate. Alert threshold <95%.",
        status: "Pending", route: "/measures" },
    ],
    yokotenItems: [
      { id: "YOK-003", context: "Line 2 · Assembly", recommendation: "Review Station 5 SOP alignment on Line 2. Same tightening sequence applies.", status: "Accepted" },
      { id: "YOK-004", context: "Line 3 · Assembly", recommendation: "Check if 2024 engineering change was reflected in Line 3 SOP.", status: "Pending" },
      { id: "YOK-005", context: "Mumbai Plant · Assembly", recommendation: "Yokoten SOP update + ECO gate to Mumbai plant. Same product family.", status: "Pending" },
    ],
    timeline: [
      { at: "2026-03-10 · 10:15 AM", actor: "System",         event: "ABN-003 detected — FPY 87.2%",                              stage: "ENTRY" },
      { at: "2026-03-10 · 12:00 PM", actor: "Ravi Kumar",     event: "Disposition: Escalate to RCA",                             stage: "ENTRY" },
      { at: "2026-03-10 · 01:00 PM", actor: "System",         event: "IMP-004 created",                                          stage: "PLAN" },
      { at: "2026-03-10 · 03:30 PM", actor: "Anand Raj",      event: "5-Why completed · Root Cause: SOP outdated sequence",      stage: "PLAN" },
      { at: "2026-03-11 · 09:00 AM", actor: "System",         event: "Stage advanced: PLAN → DO",                               stage: "DO" },
      { at: "2026-03-12 · 11:00 AM", actor: "Priya Nair",     event: "CAPA-008 completed — SOP-ASM-001 updated",                stage: "DO" },
      { at: "2026-03-14 · 05:00 PM", actor: "Suresh Babu",    event: "CAPA-009 completed — 12/12 operators re-trained",         stage: "DO" },
      { at: "2026-03-15 · 06:00 AM", actor: "System",         event: "Stage advanced: DO → CHECK",                              stage: "CHECK" },
      { at: "2026-03-17 · 06:00 AM", actor: "Deepa Krishnan", event: "Validation completed — FPY 92.8% — Effective",           stage: "CHECK" },
      { at: "2026-03-17 · 09:00 AM", actor: "System",         event: "Stage advanced: CHECK → ACT",                            stage: "ACT" },
      { at: "2026-03-17 · 10:00 AM", actor: "Anand Raj",      event: "STD-003 Approved — SOP-ASM-001 change sent to 1.4",      stage: "ACT" },
      { at: "2026-03-17 · 10:30 AM", actor: "System",         event: "Yokoten recommendations generated — 3 contexts identified", stage: "ACT" },
    ],
  },
];

// ─── Status colour helpers ────────────────────────────────────────────────────
export const PDCA_COLOR: Record<PDCAStage, { bg: string; color: string; border: string; dot: string }> = {
  PLAN:   { bg: "#fefce8", color: "#a16207", border: "#fde68a", dot: "#eab308" },
  DO:     { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", dot: "#3b82f6" },
  CHECK:  { bg: "#f0fdf4", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  ACT:    { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff", dot: "#a855f7" },
  CLOSED: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
};

export const IMP_PRIORITY_COLOR: Record<ImpPriority, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fff7ed", color: "#c2410c" },
  Medium:   { bg: "#fffbeb", color: "#d97706" },
  Low:      { bg: "#f0fdf4", color: "#15803d" },
};

export const CAPA_STATUS_COLOR: Record<CapaStatus, { bg: string; color: string }> = {
  Open:        { bg: "#fef2f2", color: "#dc2626" },
  "In Progress":{ bg: "#fffbeb", color: "#d97706" },
  Completed:   { bg: "#f0fdf4", color: "#15803d" },
  Verified:    { bg: "#eff6ff", color: "#1d4ed8" },
};

export const STD_STATUS_COLOR: Record<StdItemStatus, { bg: string; color: string }> = {
  Pending:  { bg: "#fffbeb", color: "#d97706" },
  Approved: { bg: "#f0fdf4", color: "#15803d" },
  Rejected: { bg: "#fef2f2", color: "#dc2626" },
  Applied:  { bg: "#eff6ff", color: "#1d4ed8" },
};

// Validation SPC data for CHECK stage (IMP-003 Torque Compliance)
export const validationChartData = [
  { time: "Day -7", before: 94.1, after: null },
  { time: "Day -6", before: 94.2, after: null },
  { time: "Day -5", before: 94.1, after: null },
  { time: "Day -4", before: 94.3, after: null },
  { time: "Day -3", before: 94.0, after: null },
  { time: "Day -2", before: 94.1, after: null },
  { time: "Day -1", before: 94.2, after: null },
  { time: "Intervention", before: 94.1, after: null, annotation: "CAPA executed" },
  { time: "Day +1", before: null, after: 97.2 },
  { time: "Day +2", before: null, after: 97.5, annotation: "Improving" },
  { time: "Day +3", before: null, after: 97.8 },
  { time: "Day +4", before: null, after: 97.9 },
  { time: "Day +5", before: null, after: 97.8 },
];
