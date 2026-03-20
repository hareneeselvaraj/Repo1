import React, { useState } from "react";
import { FileText, Plus, Save, Send, Layers, GitBranch, ChartBar, Shield, ChevronDown, ChevronUp, Info, Link2, Target, TrendingUp, Activity, CheckCircle2, Eye, Award, AlertCircle, Star, Calendar } from "lucide-react";
import { roleSheets } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";

const RESPONSIBILITIES = [
  { id: "R1", category: "Process Ownership",    item: "Own and maintain Final Assembly Process",          source: "Department Level", override: null,         effective: "Own and maintain Final Assembly Process" },
  { id: "R2", category: "Process Ownership",    item: "Drive process improvement initiatives",            source: "Enterprise Level", override: "Site only",   effective: "Drive process improvement (Site: Chennai)" },
  { id: "R3", category: "Quality",              item: "Ensure first-pass yield ≥98% on all lines",       source: "Inherited",        override: "> 97.5%",     effective: "Ensure first-pass yield ≥97.5%" },
  { id: "R4", category: "Quality",              item: "Conduct daily quality walkthrough",                source: "Position Level",   override: null,          effective: "Conduct daily quality walkthrough" },
  { id: "R5", category: "People",               item: "Approve shift handover reports",                   source: "Site Level",       override: null,          effective: "Approve shift handover reports" },
  { id: "R6", category: "People",               item: "Authorize overtime for production staff",          source: "Position Level",   override: null,          effective: "Authorize overtime for production staff" },
  { id: "R7", category: "Governance",           item: "Review and approve SOPs in scope",                source: "Enterprise Level", override: null,          effective: "Review and approve SOPs in scope" },
  { id: "R8", category: "Governance",           item: "Ensure all critical steps have evidence records", source: "Position Level",   override: null,          effective: "Ensure all critical steps have evidence records" },
];

const AUTHORITY_MATRIX = [
  { authority: "Approve Production SOPs",        granted: true,  level: "Site",  constraint: "Chennai site only" },
  { authority: "Sign-off Quality Deviations",    granted: true,  level: "Dept",  constraint: "Assembly Dept" },
  { authority: "Approve Budget >₹50K",           granted: false, level: "—",    constraint: "Escalate to Site Head" },
  { authority: "Delegate Signing Authority",      granted: true,  level: "Team", constraint: "Max 30 days" },
  { authority: "Approve Process Change Requests", granted: true,  level: "Site", constraint: "Critical changes need QC Manager co-sign" },
];

// ─── Process Refs Data (Production Supervisor role) ───────────────────────────
const PROCESS_REFS = [
  { processCode: "P-ASM-001", processName: "Final Assembly Operation",     category: "Manufacturing", criticality: "Critical", role: "Owner",    involvedAs: "Process Owner",    sopCount: 5, pfcCount: 2, measureCount: 8,  status: "Effective",    linkSource: "Position Assignment" },
  { processCode: "P-ASM-003", processName: "Engine Assembly Subassembly",  category: "Manufacturing", criticality: "Critical", role: "Owner",    involvedAs: "Process Owner",    sopCount: 6, pfcCount: 2, measureCount: 9,  status: "Effective",    linkSource: "Position Assignment" },
  { processCode: "P-QC-001",  processName: "In-Process Quality Inspection",category: "Quality",       criticality: "Critical", role: "Approver", involvedAs: "SOP Approver",     sopCount: 4, pfcCount: 1, measureCount: 10, status: "Effective",    linkSource: "Inherited – Dept Level" },
  { processCode: "P-ASM-002", processName: "Sub-Assembly Preparation",     category: "Manufacturing", criticality: "High",     role: "Reviewer", involvedAs: "Process Reviewer", sopCount: 3, pfcCount: 1, measureCount: 5,  status: "Effective",    linkSource: "Inherited – Dept Level" },
  { processCode: "P-MNT-001", processName: "Preventive Maintenance Cycle", category: "Maintenance",   criticality: "High",     role: "Approver", involvedAs: "SOP Approver",     sopCount: 3, pfcCount: 1, measureCount: 6,  status: "Approved",     linkSource: "Site Level" },
  { processCode: "P-QC-002",  processName: "Final Quality Acceptance",     category: "Quality",       criticality: "Critical", role: "Reviewer", involvedAs: "Process Reviewer", sopCount: 1, pfcCount: 0, measureCount: 4,  status: "Draft",        linkSource: "Inherited – Dept Level" },
];

// ─── Measure Refs Data (Production Supervisor role) ───────────────────────────
const MEASURE_REFS = [
  { code: "KPI-002", name: "Overall Equipment Effectiveness", type: "KPI", role: "Owner",       uom: "%",       target: "≥ 85%", frequency: "Daily",     criticality: "Critical", status: "Effective", linkedVia: "Position – Owner",         linkedProcess: "P-ASM-001" },
  { code: "MP-001",  name: "Cycle Time – Assembly",           type: "MP",  role: "Owner",       uom: "min",     target: "≤ 12.5", frequency: "Real-time", criticality: "High",     status: "Effective", linkedVia: "Position – Owner",         linkedProcess: "P-ASM-001" },
  { code: "KPI-001", name: "First Pass Yield",                type: "KPI", role: "Accountable", uom: "%",       target: "≥ 98%", frequency: "Daily",     criticality: "Critical", status: "Effective", linkedVia: "Process Owner – P-ASM-001", linkedProcess: "P-ASM-001" },
  { code: "MP-002",  name: "Torque Compliance Rate",          type: "MP",  role: "Accountable", uom: "%",       target: "= 100%",frequency: "Daily",     criticality: "Critical", status: "Effective", linkedVia: "SOP Owner – SOP-ASM-001",  linkedProcess: "P-ASM-001" },
  { code: "CP-001",  name: "Fastener Torque Value",           type: "CP",  role: "Accountable", uom: "Nm",      target: "25 ±2", frequency: "Real-time", criticality: "Critical", status: "Effective", linkedVia: "SOP Owner – SOP-ASM-001",  linkedProcess: "P-ASM-001" },
  { code: "KPI-003", name: "Scrap Rate",                      type: "KPI", role: "Accountable", uom: "%",       target: "≤ 0.5%",frequency: "Daily",     criticality: "High",     status: "Draft",     linkedVia: "Process Owner – P-ASM-003", linkedProcess: "P-ASM-003" },
  { code: "MOP-001", name: "Kit Verification Lead Time",      type: "MOP", role: "Oversight",   uom: "min",     target: "≤ 20",  frequency: "Daily",     criticality: "Medium",   status: "Approved",  linkedVia: "Process Owner – P-ASM-001", linkedProcess: "P-ASM-001" },
  { code: "KPI-004", name: "MTTR – Maintenance",             type: "KPI", role: "Oversight",   uom: "hours",   target: "≤ 4h",  frequency: "Monthly",   criticality: "High",     status: "Effective", linkedVia: "Site Level – Maintenance",  linkedProcess: "P-MNT-001" },
];

const CRIT_STYLE: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fffbeb", color: "#d97706" },
  Medium:   { bg: "#eff6ff", color: "#2563eb" },
  Low:      { bg: "#f1f5f9", color: "#64748b" },
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  Owner:       { bg: "#eff6ff", color: "#1d4ed8" },
  Approver:    { bg: "#f0fdf4", color: "#15803d" },
  Reviewer:    { bg: "#faf5ff", color: "#7e22ce" },
  Accountable: { bg: "#fff7ed", color: "#c2410c" },
  Oversight:   { bg: "#f1f5f9", color: "#475569" },
};

const TYPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  KPI: { bg: "#eff6ff", color: "#1d4ed8", label: "KPI" },
  MP:  { bg: "#f0fdf4", color: "#15803d", label: "MP"  },
  MOP: { bg: "#faf5ff", color: "#7e22ce", label: "MOP" },
  CP:  { bg: "#fff7ed", color: "#c2410c", label: "CP"  },
};

// ─── Competencies Data (Production Supervisor) ────────────────────────────────
const PROF_LEVELS: Record<string, number> = { Awareness: 1, Practitioner: 2, Expert: 3 };

const COMPETENCIES = [
  { id: "C01", domain: "Technical",   name: "Assembly Process Knowledge",           required: "Expert",       current: "Expert",       source: "Position Level",         notes: "Covers sub-assembly & final assembly ops" },
  { id: "C02", domain: "Technical",   name: "Torque Tool Operation & Calibration",  required: "Expert",       current: "Practitioner",  source: "Position Level",         notes: "Calibration SOP training pending" },
  { id: "C03", domain: "Technical",   name: "Quality Inspection Methods",           required: "Practitioner", current: "Practitioner",  source: "Inherited – Dept",       notes: "Per ISO 9001 inspection checklists" },
  { id: "C04", domain: "Technical",   name: "ERP / Production Planning System",     required: "Practitioner", current: "Awareness",     source: "Inherited – Site",       notes: "SAP PM module – training scheduled Q2" },
  { id: "C05", domain: "Technical",   name: "PFC & SOP Authoring",                  required: "Expert",       current: "Expert",       source: "Position Level",         notes: "" },
  { id: "C06", domain: "Leadership",  name: "Shift Team Management",                required: "Expert",       current: "Expert",       source: "Position Level",         notes: "" },
  { id: "C07", domain: "Leadership",  name: "Shift Handover Protocol",              required: "Expert",       current: "Practitioner",  source: "Position Level",         notes: "Formal handover SOP: SOP-SHF-001" },
  { id: "C08", domain: "Leadership",  name: "Performance Coaching",                 required: "Practitioner", current: "Awareness",     source: "Inherited – Dept",       notes: "Coaching module in LMS – in progress" },
  { id: "C09", domain: "Governance",  name: "ISO 9001 QMS Requirements",            required: "Practitioner", current: "Practitioner",  source: "Inherited – Enterprise", notes: "" },
  { id: "C10", domain: "Governance",  name: "Document & Version Control",           required: "Practitioner", current: "Expert",        source: "Inherited – Site",       notes: "Exceeds requirement" },
  { id: "C11", domain: "Governance",  name: "Deviation & NCR Management",           required: "Expert",       current: "Practitioner",  source: "Position Level",         notes: "NCR refresher due Jun 2026" },
  { id: "C12", domain: "Safety",      name: "Hazard Identification & Control",      required: "Expert",       current: "Expert",       source: "Inherited – Enterprise", notes: "" },
  { id: "C13", domain: "Safety",      name: "Emergency Response Protocol",          required: "Practitioner", current: "Practitioner",  source: "Inherited – Site",       notes: "" },
  { id: "C14", domain: "Safety",      name: "Machine Safety & Lockout / Tagout",    required: "Expert",       current: "Practitioner",  source: "Position Level",         notes: "LOTO certification pending – Apr 2026" },
];

const CERTIFICATIONS = [
  { id: "CERT-01", name: "ISO 9001 Internal Auditor",        required: true,  validUntil: "2027-06-30", status: "Valid",    issuer: "Bureau Veritas",           daysLeft: 474  },
  { id: "CERT-02", name: "First Aid & CPR",                  required: true,  validUntil: "2026-12-31", status: "Valid",    issuer: "Red Cross India",          daysLeft: 293  },
  { id: "CERT-03", name: "Lean Manufacturing – Green Belt",  required: true,  validUntil: "2028-03-15", status: "Valid",    issuer: "CII Institute of Quality", daysLeft: 732  },
  { id: "CERT-04", name: "Fire Safety Officer",              required: true,  validUntil: "2026-04-15", status: "Due Soon", issuer: "TN Fire & Rescue Service", daysLeft: 33   },
  { id: "CERT-05", name: "Forklift Operation License",       required: false, validUntil: "2025-08-01", status: "Expired",  issuer: "State Transport Authority",daysLeft: -224 },
];

const getGapStatus = (req: string, cur: string) => {
  const ri = PROF_LEVELS[req] ?? 0, ci = PROF_LEVELS[cur] ?? 0;
  if (ci < ri) return "gap";
  if (ci > ri) return "exceeded";
  return "met";
};

const ProfDots = ({ level, color }: { level: string; color: string }) => {
  const idx = PROF_LEVELS[level] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= idx ? color : "#e2e8f0", flexShrink: 0 }} />
      ))}
      <span style={{ fontSize: 10, color: "#64748b", marginLeft: 4 }}>{level}</span>
    </div>
  );
};

const CERT_STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Valid:      { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  "Due Soon": { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  Expired:    { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
};

const DOMAIN_COLOR: Record<string, string> = {
  Technical: "#1d4ed8", Leadership: "#7e22ce", Governance: "#0369a1", Safety: "#dc2626",
};

export const RoleSheetEditor: React.FC = () => {
  const rs = roleSheets[3]; // Production Supervisor
  const [activeTab, setActiveTab] = useState("responsibilities");
  const [expandedCat, setExpandedCat] = useState<string | null>("Process Ownership");
  const [procRoleFilter, setProcRoleFilter] = useState("All");
  const [measRoleFilter, setMeasRoleFilter] = useState("All");
  const [measTypeFilter, setMeasTypeFilter] = useState("All");
  const [compDomainFilter, setCompDomainFilter] = useState("All");
  const [expandedDomain, setExpandedDomain] = useState<string | null>("Technical");

  const TABS = ["purpose", "responsibilities", "process-refs", "measure-refs", "authority", "competencies", "inheritance", "history"];

  const compDomains = Array.from(new Set(COMPETENCIES.map(c => c.domain)));
  const filteredComps = COMPETENCIES.filter(c => compDomainFilter === "All" || c.domain === compDomainFilter);
  const compGaps      = COMPETENCIES.filter(c => getGapStatus(c.required, c.current) === "gap").length;
  const compMet       = COMPETENCIES.filter(c => getGapStatus(c.required, c.current) === "met").length;
  const compExceeded  = COMPETENCIES.filter(c => getGapStatus(c.required, c.current) === "exceeded").length;
  const certsValid    = CERTIFICATIONS.filter(c => c.status === "Valid").length;
  const cats = Array.from(new Set(RESPONSIBILITIES.map((r) => r.category)));

  const filteredProcs = PROCESS_REFS.filter((p) => procRoleFilter === "All" || p.role === procRoleFilter);
  const filteredMeas  = MEASURE_REFS.filter((m) => {
    const matchRole = measRoleFilter === "All" || m.role === measRoleFilter;
    const matchType = measTypeFilter === "All" || m.type === measTypeFilter;
    return matchRole && matchType;
  });

  return (
    <div className="screen-shell">
      {/* Header */}
      <div style={{ padding: "10px 18px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div className="ph-icon"><FileText size={16} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{rs.title}</h1>
            <StatusBadge status={rs.status as any} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{rs.version} · {rs.level} Level</span>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {rs.code} · {rs.responsibilitiesCount} responsibilities · Position: {rs.linkedPosition}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="dwm-btn dwm-btn-ghost"><Save size={12} /> Save Draft</button>
          <button className="dwm-btn dwm-btn-primary"><Send size={12} /> Submit for Approval</button>
        </div>
      </div>

      <div className="tab-bar" style={{ background: "#ffffff" }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tb-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      <div className="content-area">
        {activeTab === "purpose" && (
          <div className="dwm-panel" style={{ maxWidth: 700 }}>
            <div className="dwm-panel-header"><div className="ph-title">Purpose Statement</div></div>
            <div style={{ padding: 16 }}>
              <div className="form-field">
                <label>Role Purpose *</label>
                <textarea defaultValue="The Production Supervisor is responsible for the day-to-day execution of manufacturing operations on the assembly line. This role ensures that production targets, quality standards, safety requirements, and governance obligations are met consistently across all assigned shifts and lines within the Chennai site." style={{ minHeight: 120 }} />
              </div>
              <div className="form-grid form-grid-2" style={{ marginTop: 12 }}>
                <div className="form-field"><label>Linked Position *</label><input defaultValue={rs.linkedPosition} /></div>
                <div className="form-field"><label>Role Sheet Level</label><input defaultValue={rs.level} readOnly style={{ background: "#f8fafc" }} /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "responsibilities" && (
          <div className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title"><Layers size={13} color="#2563eb" /> Responsibilities <span className="ph-count">{rs.responsibilitiesCount}</span></div>
              <button className="ph-action"><Plus size={11} /> Add Row</button>
            </div>

            {cats.map((cat) => {
              const catItems = RESPONSIBILITIES.filter((r) => r.category === cat);
              const isExpanded = expandedCat === cat;
              return (
                <div key={cat}>
                  <div
                    style={{ padding: "8px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                    onClick={() => setExpandedCat(isExpanded ? null : cat)}
                  >
                    {isExpanded ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{cat}</span>
                    <span className="ph-count">{catItems.length}</span>
                  </div>
                  {isExpanded && (
                    <table className="dwm-table">
                      <thead>
                        <tr><th>Responsibility</th><th>Source</th><th>Override</th><th>Effective Result</th></tr>
                      </thead>
                      <tbody>
                        {catItems.map((r) => (
                          <tr key={r.id}>
                            <td><span className="td-primary">{r.item}</span></td>
                            <td><span className="td-secondary" style={{ fontSize: 10 }}>{r.source}</span></td>
                            <td>
                              {r.override
                                ? <span style={{ fontSize: 11, color: "#d97706", fontStyle: "italic" }}>{r.override}</span>
                                : <span style={{ color: "#d1d5db", fontSize: 11 }}>—</span>
                              }
                            </td>
                            <td><span className="td-primary" style={{ color: "#15803d" }}>{r.effective}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── PROCESS REFS TAB ── */}
        {activeTab === "process-refs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Total Processes",  value: PROCESS_REFS.length,                                        color: "#1d4ed8", icon: GitBranch },
                { label: "As Owner",         value: PROCESS_REFS.filter(p => p.role === "Owner").length,        color: "#15803d", icon: CheckCircle2 },
                { label: "As Approver",      value: PROCESS_REFS.filter(p => p.role === "Approver").length,     color: "#7e22ce", icon: Shield },
                { label: "As Reviewer",      value: PROCESS_REFS.filter(p => p.role === "Reviewer").length,     color: "#d97706", icon: Eye },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter + table */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><GitBranch size={13} color="#2563eb" /> Linked Processes <span className="ph-count">{filteredProcs.length}</span></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select className="filter-select" style={{ fontSize: 11, padding: "3px 8px" }} value={procRoleFilter} onChange={e => setProcRoleFilter(e.target.value)}>
                    {["All", "Owner", "Approver", "Reviewer"].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <button className="ph-action"><Plus size={11} /> Link Process</button>
                </div>
              </div>

              <table className="dwm-table">
                <thead>
                  <tr>
                    <th>Process Code</th>
                    <th>Process Name</th>
                    <th>Category</th>
                    <th>Criticality</th>
                    <th>Role in Process</th>
                    <th>Link Source</th>
                    <th style={{ textAlign: "center" }}>PFCs</th>
                    <th style={{ textAlign: "center" }}>SOPs</th>
                    <th style={{ textAlign: "center" }}>Measures</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcs.map((p) => {
                    const cs  = CRIT_STYLE[p.criticality] ?? CRIT_STYLE.Low;
                    const rs2 = ROLE_STYLE[p.role] ?? ROLE_STYLE.Oversight;
                    return (
                      <tr key={p.processCode}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{p.processCode}</span>
                        </td>
                        <td>
                          <div className="td-primary">{p.processName}</div>
                        </td>
                        <td><span className="td-secondary">{p.category}</span></td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cs.bg, color: cs.color }}>{p.criticality}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: rs2.bg, color: rs2.color }}>{p.role}</span>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{p.involvedAs}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            {p.linkSource.startsWith("Inherited") && <Layers size={10} color="#7e22ce" />}
                            {p.linkSource}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{p.pfcCount}</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{p.sopCount}</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{p.measureCount}</span>
                        </td>
                        <td><StatusBadge status={p.status as any} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Inheritance note */}
              <div className="alert-bar info" style={{ margin: "10px 12px", borderRadius: 5 }}>
                <Info size={12} />
                <span>Processes marked <strong>Inherited</strong> are resolved from Department or Site level role sheets. Override at Position level to change involvement.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── MEASURE REFS TAB ── */}
        {activeTab === "measure-refs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { label: "Total Measures",   value: MEASURE_REFS.length,                                          color: "#1d4ed8", icon: ChartBar  },
                { label: "KPIs",             value: MEASURE_REFS.filter(m => m.type === "KPI").length,            color: "#1d4ed8", icon: TrendingUp },
                { label: "Process Measures", value: MEASURE_REFS.filter(m => m.type === "MP").length,             color: "#15803d", icon: Activity   },
                { label: "Control Points",   value: MEASURE_REFS.filter(m => m.type === "CP").length,             color: "#dc2626", icon: Target     },
                { label: "Owned by Role",    value: MEASURE_REFS.filter(m => m.role === "Owner").length,          color: "#7e22ce", icon: Shield     },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter + table */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><ChartBar size={13} color="#2563eb" /> Linked Measures <span className="ph-count">{filteredMeas.length}</span></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select className="filter-select" style={{ fontSize: 11, padding: "3px 8px" }} value={measRoleFilter} onChange={e => setMeasRoleFilter(e.target.value)}>
                    {["All", "Owner", "Accountable", "Oversight"].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <select className="filter-select" style={{ fontSize: 11, padding: "3px 8px" }} value={measTypeFilter} onChange={e => setMeasTypeFilter(e.target.value)}>
                    {["All", "KPI", "MP", "MOP", "CP"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button className="ph-action"><Plus size={11} /> Link Measure</button>
                </div>
              </div>

              <table className="dwm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Measure Name</th>
                    <th>Type</th>
                    <th>Role</th>
                    <th>UoM</th>
                    <th>Target</th>
                    <th>Frequency</th>
                    <th>Criticality</th>
                    <th>Linked Via</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeas.map((m) => {
                    const cs  = CRIT_STYLE[m.criticality] ?? CRIT_STYLE.Low;
                    const rs2 = ROLE_STYLE[m.role]        ?? ROLE_STYLE.Oversight;
                    const ts  = TYPE_STYLE[m.type]        ?? { bg: "#f1f5f9", color: "#475569", label: m.type };
                    return (
                      <tr key={m.code}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{m.code}</span>
                        </td>
                        <td>
                          <div className="td-primary">{m.name}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: ts.bg, color: ts.color }}>{ts.label}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: rs2.bg, color: rs2.color }}>{m.role}</span>
                        </td>
                        <td><span className="td-secondary">{m.uom}</span></td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{m.target}</span>
                        </td>
                        <td><span className="td-secondary">{m.frequency}</span></td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cs.bg, color: cs.color }}>{m.criticality}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            <Link2 size={10} color="#94a3b8" />
                            {m.linkedVia}
                          </span>
                        </td>
                        <td><StatusBadge status={m.status as any} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="alert-bar info" style={{ margin: "10px 12px", borderRadius: 5 }}>
                <Info size={12} />
                <span>Measures with role <strong>Accountable</strong> are resolved from process or SOP ownership. Measures with role <strong>Owner</strong> are directly assigned to this position in the Measure Designer.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "authority" && (
          <div className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title"><Shield size={13} color="#7e22ce" /> Authority Matrix</div>
              <button className="ph-action"><Plus size={11} /> Add Authority</button>
            </div>
            <table className="dwm-table">
              <thead>
                <tr><th>Authority</th><th>Granted</th><th>Level</th><th>Constraint / Condition</th></tr>
              </thead>
              <tbody>
                {AUTHORITY_MATRIX.map((a, i) => (
                  <tr key={i}>
                    <td><span className="td-primary">{a.authority}</span></td>
                    <td>
                      {a.granted
                        ? <span className="dwm-badge dwm-badge-effective">Granted</span>
                        : <span className="dwm-badge dwm-badge-draft">Not Granted</span>
                      }
                    </td>
                    <td><span className="td-secondary">{a.level}</span></td>
                    <td><span className="td-secondary" style={{ fontStyle: "italic" }}>{a.constraint}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "inheritance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { from: "Enterprise Role Sheet", code: "RS-ENT-001", items: 12, type: "base" },
              { from: "Chennai Site Role Sheet", code: "RS-SITE-001", items: 18, type: "inherited" },
              { from: "Assembly Department Role Sheet", code: "RS-DEPT-001", items: 22, type: "inherited" },
            ].map(({ from, code, items, type }) => (
              <div key={code} className="dwm-panel">
                <div className="dwm-panel-header">
                  <div className="ph-title" style={{ color: "#7e22ce" }}>
                    <Layers size={13} color="#7e22ce" /> Inherited From: {from}
                    <span className="ph-count">{items} items</span>
                  </div>
                  <span className="dwm-badge dwm-badge-effective">{type}</span>
                </div>
                <div className="alert-bar info" style={{ margin: 10, borderRadius: 5 }}>
                  <span>Items inherited from this level. Overrides appear at the Position level only.</span>
                </div>
              </div>
            ))}

            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title" style={{ color: "#2563eb" }}>Overridden At Position Level</div>
                <span className="ph-count">3 overrides</span>
              </div>
              {RESPONSIBILITIES.filter((r) => r.override).map((r) => (
                <div key={r.id} style={{ padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{r.item}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    Inherited: <span style={{ color: "#64748b" }}>{r.source}</span>
                    {" → "}
                    Override: <span style={{ color: "#d97706" }}>{r.override}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPETENCIES TAB ── */}
        {activeTab === "competencies" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Summary strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { label: "Total Competencies", value: COMPETENCIES.length, color: "#1d4ed8", icon: Layers       },
                { label: "Fully Met",           value: compMet,             color: "#15803d", icon: CheckCircle2 },
                { label: "Gaps Identified",     value: compGaps,            color: "#dc2626", icon: AlertCircle  },
                { label: "Exceeds Required",    value: compExceeded,        color: "#7e22ce", icon: Star         },
                { label: "Certs Valid",         value: certsValid,          color: "#0369a1", icon: Award        },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} color={color} /></div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {compGaps > 0 && (
              <div className="alert-bar warning">
                <AlertCircle size={13} />
                <span><strong>{compGaps} competency gaps</strong> detected for the current assignee (Ravi Kumar). Training plans should be initiated to close gaps before the next role review.</span>
              </div>
            )}

            {/* Competency Matrix */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><Layers size={13} color="#2563eb" /> Competency Matrix <span className="ph-count">{filteredComps.length}</span></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select className="filter-select" style={{ fontSize: 11, padding: "3px 8px" }} value={compDomainFilter} onChange={e => setCompDomainFilter(e.target.value)}>
                    {["All", ...compDomains].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <button className="ph-action"><Plus size={11} /> Add Competency</button>
                </div>
              </div>

              {compDomains.filter(d => compDomainFilter === "All" || d === compDomainFilter).map(domain => {
                const domainItems = filteredComps.filter(c => c.domain === domain);
                if (domainItems.length === 0) return null;
                const isExp = expandedDomain === domain || compDomainFilter !== "All";
                const domGaps = domainItems.filter(c => getGapStatus(c.required, c.current) === "gap").length;
                const dColor = DOMAIN_COLOR[domain] ?? "#475569";
                return (
                  <div key={domain}>
                    <div
                      style={{ padding: "8px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      onClick={() => setExpandedDomain(isExp && compDomainFilter === "All" ? null : domain)}
                    >
                      {isExp ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{domain}</span>
                      <span className="ph-count">{domainItems.length}</span>
                      {domGaps > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                          {domGaps} gap{domGaps > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {isExp && (
                      <table className="dwm-table">
                        <thead>
                          <tr><th>Competency</th><th>Required Level</th><th>Current Level</th><th style={{ textAlign: "center" }}>Status</th><th>Source</th><th>Notes</th></tr>
                        </thead>
                        <tbody>
                          {domainItems.map(c => {
                            const gap = getGapStatus(c.required, c.current);
                            const reqColor = gap === "gap" ? "#dc2626" : gap === "exceeded" ? "#7e22ce" : "#15803d";
                            const curColor = gap === "gap" ? "#94a3b8" : gap === "exceeded" ? "#7e22ce" : "#15803d";
                            return (
                              <tr key={c.id}>
                                <td><span className="td-primary">{c.name}</span></td>
                                <td><ProfDots level={c.required} color={reqColor} /></td>
                                <td><ProfDots level={c.current}  color={curColor} /></td>
                                <td style={{ textAlign: "center" }}>
                                  {gap === "met"      && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 10 }}><CheckCircle2 size={10} /> Met</span>}
                                  {gap === "gap"      && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", padding: "2px 8px", borderRadius: 10 }}><AlertCircle size={10} /> Gap</span>}
                                  {gap === "exceeded" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#7e22ce", background: "#faf5ff", border: "1px solid #d8b4fe", padding: "2px 8px", borderRadius: 10 }}><Star size={10} /> Exceeds</span>}
                                </td>
                                <td>
                                  <span style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
                                    {c.source.startsWith("Inherited") && <Layers size={9} color="#7e22ce" />}
                                    {c.source}
                                  </span>
                                </td>
                                <td><span style={{ fontSize: 10, color: "#94a3b8", fontStyle: c.notes ? "normal" : "italic" }}>{c.notes || "—"}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certifications */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><Award size={13} color="#0369a1" /> Certification Requirements <span className="ph-count">{CERTIFICATIONS.length}</span></div>
                <button className="ph-action"><Plus size={11} /> Add Certification</button>
              </div>
              <table className="dwm-table">
                <thead>
                  <tr><th>Certification</th><th>Issuing Body</th><th>Required</th><th>Valid Until</th><th style={{ textAlign: "center" }}>Status</th><th>Days Remaining</th></tr>
                </thead>
                <tbody>
                  {CERTIFICATIONS.map(cert => {
                    const ss = CERT_STATUS_STYLE[cert.status] ?? CERT_STATUS_STYLE.Valid;
                    return (
                      <tr key={cert.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Award size={12} color="#0369a1" />
                            <span className="td-primary">{cert.name}</span>
                          </div>
                        </td>
                        <td><span className="td-secondary">{cert.issuer}</span></td>
                        <td>
                          {cert.required
                            ? <span style={{ fontSize: 10, fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", padding: "1px 7px", borderRadius: 10 }}>Required</span>
                            : <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "1px 7px", borderRadius: 10 }}>Optional</span>
                          }
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569" }}>
                            <Calendar size={11} color="#94a3b8" />{cert.validUntil}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                            {cert.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, color: cert.daysLeft < 0 ? "#dc2626" : cert.daysLeft < 60 ? "#d97706" : "#15803d" }}>
                            {cert.daysLeft < 0 ? `Expired ${Math.abs(cert.daysLeft)}d ago` : `${cert.daysLeft} days`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="alert-bar info" style={{ margin: "10px 12px", borderRadius: 5 }}>
                <Info size={12} /><span>Required certifications must be valid for the role sheet to be marked <strong>Effective</strong>. Expiry alerts are sent 60 days before the valid-until date.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="es-title">History</div>
            <div className="es-sub">Full audit history for this role sheet is available in the Audit History screen</div>
          </div>
        )}
      </div>
    </div>
  );
};