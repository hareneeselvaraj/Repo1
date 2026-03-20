import React, { useState } from "react";
import {
  BookOpen, Plus, GripVertical, Trash2, Copy, Link2, ChevronDown, ChevronUp,
  AlertTriangle, Save, Send, CheckCircle2, XCircle, ExternalLink,
  GitCompare, Clock, MessageSquare, ShieldAlert, RotateCcw, Search, History,
} from "lucide-react";
import { useNavigate } from "react-router";
import { sops, SOPStep, measures } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";
import { OwnershipCard } from "../shared/OwnershipCard";
import { LifecyclePipeline } from "../shared/LifecyclePipeline";
import { CreateRevisionModal } from "../shared/CreateRevisionModal";
import { OwnershipResolutionBadge, OwnershipRow, deriveOwnershipState } from "../shared/OwnershipResolutionBadge";

// ─── Style helpers ────────────────────────────────────────────────────────────
const CRIT_STYLE: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fffbeb", color: "#d97706" },
  Medium:   { bg: "#eff6ff", color: "#2563eb" },
  Low:      { bg: "#f1f5f9", color: "#64748b" },
};
const TYPE_C: Record<string, { bg: string; color: string; border: string }> = {
  KPI: { bg: "#eff6ff", color: "#1e40af", border: "#3b82f6" },
  MP:  { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
  MOP: { bg: "#fdf4ff", color: "#7e22ce", border: "#c084fc" },
  CP:  { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
};
const OUTPUT_USAGE: Record<string, { label: string; color: string; bg: string }> = {
  NEXT_STEP:       { label: "Next Step",       color: "#1d4ed8", bg: "#eff6ff" },
  MEASURE_INPUT:   { label: "Measure Input",   color: "#7e22ce", bg: "#fdf4ff" },
  AUDIT_REFERENCE: { label: "Audit Reference", color: "#d97706", bg: "#fffbeb" },
  EXTERNAL_SYSTEM: { label: "External System", color: "#0369a1", bg: "#f0f9ff" },
};
const VER_STATUS: Record<string, { bg: string; color: string }> = {
  Active:          { bg: "#dcfce7", color: "#14532d" },
  Effective:       { bg: "#dcfce7", color: "#14532d" },
  Superseded:      { bg: "#f5f3ff", color: "#5b21b6" },
  Approved:        { bg: "#ecfdf5", color: "#065f46" },
  "Under Review":  { bg: "#fffbeb", color: "#92400e" },
  Draft:           { bg: "#f3f4f6", color: "#374151" },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["overview","steps","measures","ownership","approval","versions","impact"] as const;
type Tab = typeof TABS[number];

// ─── Mock SOP linked measures (primary linkage per spec §8.1) ─────────────────
const SOP_MEASURE_LINKS: Record<string, { stepTitle: string | null; stepCode?: string; measureId: string; scope: string }[]> = {
  "SOP-002": [
    { stepTitle: null,                     stepCode: undefined, measureId: "M-001", scope: "SOP-level" },
    { stepTitle: "Set Torque Tool",        stepCode: "STP-001", measureId: "M-006", scope: "Step-level" },
    { stepTitle: "Torque to Specification",stepCode: "STP-003", measureId: "M-004", scope: "Step-level" },
    { stepTitle: "Record Torque Values",   stepCode: "STP-004", measureId: "M-003", scope: "Step-level" },
  ],
  "SOP-001": [
    { stepTitle: null,                           stepCode: undefined, measureId: "M-001", scope: "SOP-level" },
    { stepTitle: "Physical Count of Components", stepCode: "STP-002", measureId: "M-005", scope: "Step-level" },
    { stepTitle: "Condition Inspection",         stepCode: "STP-003", measureId: "M-007", scope: "Step-level" },
  ],
};

// ─── Mock SOP versions ────────────────────────────────────────────────────────
const SOP_VERSIONS: Record<string, {
  versionNo: string; status: string; createdAt: string; createdBy: string;
  approvedAt?: string; approvedBy?: string; changeNote: string;
  revisionSourceType?: string; revisionReason?: string;
}[]> = {
  "SOP-002": [
    { versionNo: "v1.0", status: "Superseded",    createdAt: "2024-05-01", createdBy: "Anand Raj",    approvedAt: "2024-05-20", approvedBy: "QC Manager",    changeNote: "Initial version.", revisionSourceType: "MANUAL",            revisionReason: "Initial definition." },
    { versionNo: "v2.0", status: "Superseded",    createdAt: "2025-06-10", createdBy: "Ravi Kumar",   approvedAt: "2025-06-28", approvedBy: "Plant Manager", changeNote: "Added thread locker step. Updated torque spec from 22 to 25 Nm.", revisionSourceType: "AUDIT",             revisionReason: "Audit finding #AUD-2025-007: torque spec mismatch with engineering drawing ES-1042." },
    { versionNo: "v2.1", status: "Under Review",  createdAt: "2026-03-01", createdBy: "Ravi Kumar",   changeNote: "Revised evidence requirements for step 1. Added torque stripe marker instruction.",           revisionSourceType: "MEASURE_REFERENCE", revisionReason: "Torque Compliance Rate (M-004) showed declining trend Q1-2026. Step 3 instruction clarified." },
  ],
  "SOP-001": [
    { versionNo: "v1.0", status: "Superseded",    createdAt: "2024-08-01", createdBy: "Meena Sundaram", approvedAt: "2024-08-15", approvedBy: "QC Director", changeNote: "Initial version.", revisionSourceType: "MANUAL", revisionReason: "Initial definition." },
    { versionNo: "v1.3", status: "Effective",     createdAt: "2025-07-01", createdBy: "Meena Sundaram", approvedAt: "2025-08-10", approvedBy: "Plant Manager", changeNote: "Added condition inspection step and safety notes.", revisionSourceType: "REGULATORY", revisionReason: "ISO 9001:2015 revision requires documented acceptance criteria for incoming components. Ref: Clause 8.4." },
  ],
};

// ─── Mock approval comments ───────────────────────────────────────────────────
const APPROVAL_COMMENTS = [
  { id: "C-001", author: "Meena Sundaram", role: "Reviewer",  date: "2026-03-12", type: "comment",  text: "Step 1 needs clarification on what 'calibration current' means. Please specify the allowed window in days." },
  { id: "C-002", author: "Suresh Babu",   role: "Approver",  date: "2026-03-11", type: "request",  text: "Request changes: Please add a contingency note on what to do if the torque tool fails mid-operation." },
  { id: "C-003", author: "Ravi Kumar",    role: "Author",    date: "2026-03-10", type: "submit",   text: "Submitted for review. Changes from v2.0: Updated tool calibration note and added stripe marking instruction. Revision triggered by M-004 trend." },
];

const SRC_CFG: Record<string, { label: string; color: string; bg: string }> = {
  MANUAL:              { label: "Manual",       color: "#1d4ed8", bg: "#eff6ff" },
  AUDIT:               { label: "Audit",        color: "#c2410c", bg: "#fff7ed" },
  MEASURE_REFERENCE:   { label: "Measure Ref",  color: "#7e22ce", bg: "#fdf4ff" },
  DEVIATION_REFERENCE: { label: "Deviation",    color: "#dc2626", bg: "#fef2f2" },
  REGULATORY:          { label: "Regulatory",   color: "#0369a1", bg: "#f0f9ff" },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const SOPEditor: React.FC<{ sopId?: string }> = ({ sopId = "SOP-002" }) => {
  const navigate = useNavigate();
  const sop    = sops.find(s => s.id === sopId) ?? sops[1];
  const [activeTab, setActiveTab]       = useState<Tab>("steps");
  const [expandedStep, setExpandedStep] = useState<string | null>(sop.steps[0]?.id ?? null);
  const [selectedStep, setSelectedStep] = useState<SOPStep | null>(sop.steps[0] ?? null);
  const [steps]                         = useState<SOPStep[]>(sop.steps);

  // Step type & output usage local state (spec §3.4: step_type ACTION/DECISION)
  const [stepTypes, setStepTypes]       = useState<Record<string, "ACTION" | "DECISION">>(
    Object.fromEntries(sop.steps.map(s => [s.id, s.stepType ?? "ACTION"]))
  );
  const [outputTypes, setOutputTypes]   = useState<Record<string, string>>(
    Object.fromEntries(sop.steps.map(s => [s.id, s.outputUsageType ?? "NEXT_STEP"]))
  );
  const [stepCodes]                     = useState<Record<string, string>>(
    Object.fromEntries(sop.steps.map((s, i) => [s.id, `STP-${String(i + 1).padStart(3, "0")}`]))
  );

  // Measure linking
  const [showMeasurePicker, setShowMeasurePicker] = useState(false);
  const [measureQuery, setMeasureQuery]           = useState("");
  const [linkedMeasurePerStep, setLinkedMeasurePerStep] = useState<Record<string, string>>({});

  // Revision modal
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Approval modal
  const [showApproveModal, setShowApproveModal]   = useState(false);
  const [approveAction, setApproveAction]         = useState<"approve"|"reject"|"changes"|null>(null);
  const [approveComment, setApproveComment]       = useState("");

  const sopLinks     = SOP_MEASURE_LINKS[sop.id] ?? [];
  const sopVersions  = SOP_VERSIONS[sop.id] ?? [];
  const filteredMeasures = measures.filter(m =>
    m.name.toLowerCase().includes(measureQuery.toLowerCase()) || m.code.toLowerCase().includes(measureQuery.toLowerCase())
  );

  const toggleStep = (id: string) => setExpandedStep(prev => prev === id ? null : id);

  // §11 Structural validation for SOP
  const sopValidation = [
    { label: "SOP links to a valid PFC node",                    pass: !!sop.linkedPFC,                         warn: !sop.linkedPFC,        specRef: "§11.1" },
    { label: "SOP steps are defined",                            pass: steps.length > 0,                        warn: steps.length === 0,    specRef: "§11.1" },
    { label: "All steps have instruction text",                  pass: steps.every(s => !!s.description),       warn: false,                 specRef: "§3.4" },
    { label: "All steps have expected output defined",           pass: steps.every(s => !!s.outputDefinition),  warn: steps.some(s => !s.outputDefinition), specRef: "§3.4" },
    { label: "Owner position assigned and resolved",             pass: sop.resolvedOwner !== "Not Resolved",    warn: sop.resolvedOwner === "Not Resolved", specRef: "§11.2" },
    { label: "Measure linkage exists (step-level per §8.1)",     pass: sopLinks.length > 0,                     warn: sopLinks.length === 0, specRef: "§8.1" },
  ];

  return (
    <div className="screen-shell">

      {/* ── Header — SOP Editor is the authoritative authoring workspace (UX §3) ── */}
      <div style={{ padding:"9px 16px", background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:10, flexShrink:0, minHeight:52 }}>
        <div className="ph-icon" style={{ flexShrink:0 }}><BookOpen size={16} /></div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, overflow:"hidden", flexWrap:"nowrap" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:280 }}>{sop.title}</span>
            <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, color:"#1d4ed8", background:"#eff6ff", padding:"1px 6px", borderRadius:3, flexShrink:0 }}>{sop.code}</span>
            <StatusBadge status={sop.status as any} />
            <span style={{ fontSize:10, color:"#94a3b8", flexShrink:0 }}>{sop.version}</span>
            <OwnershipResolutionBadge
              state={deriveOwnershipState(sop.resolvedOwner)}
              position={sop.ownerPosition}
              compact
              navigable
            />
          </div>
          {/* Breadcrumb — Process → PFC → SOP (UX Refinement §9) */}
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:"#2563eb", cursor:"pointer", background:"#eff6ff", padding:"1px 6px", borderRadius:3 }}
              onClick={() => navigate("/process-designer")}>
              {sop.linkedProcess}
            </span>
            <span style={{ fontSize:10, color:"#d1d5db" }}>›</span>
            {sop.linkedPFC
              ? <span style={{ fontSize:10, color:"#15803d", cursor:"pointer", background:"#f0fdf4", padding:"1px 6px", borderRadius:3 }}
                  onClick={() => navigate("/pfc-designer")}>{sop.linkedPFC}</span>
              : <span style={{ fontSize:10, color:"#dc2626", background:"#fef2f2", padding:"1px 6px", borderRadius:3 }}>⚠ No PFC node</span>
            }
            <span style={{ fontSize:10, color:"#d1d5db" }}>›</span>
            <span style={{ fontSize:10, color:"#94a3b8" }}>{sop.code} · {sop.steps.length} steps</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11, padding:"4px 10px" }}><Save size={11} /> Save</button>
          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11, padding:"4px 10px" }}><AlertTriangle size={11} /> Validate</button>
          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11, padding:"4px 10px" }} onClick={() => setShowRevisionModal(true)}><RotateCcw size={11} /> Revise</button>
          <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11, padding:"4px 10px" }}><Send size={11} /> Submit</button>
        </div>
      </div>

      {/* ── Lifecycle Pipeline — Spec §5.3 ── */}
      <LifecyclePipeline
        currentStatus={sop.status as any}
        submittedBy="Ravi Kumar"
        submittedAt={sop.status !== "Draft" ? "2026-03-10" : undefined}
        approvedBy={sopVersions.find(v => v.status === "Effective")?.approvedBy}
        approvedAt={sopVersions.find(v => v.status === "Effective")?.approvedAt}
      />

      {/* ── Tab bar — scrollable for 7 tabs ── */}
      <div
        className="tab-bar"
        style={{ background:"#fff", overflowX:"auto", overflowY:"hidden", flexWrap:"nowrap",
          scrollbarWidth:"none", msOverflowStyle:"none" } as React.CSSProperties}
      >
        {TABS.map(t => (
          <button key={t} className={`tb-tab ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)} style={{ flexShrink:0 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t==="steps"    && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{steps.length}</span>}
            {t==="measures" && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{sopLinks.length}</span>}
            {t==="approval" && sop.status==="Under Review" && <span style={{ marginLeft:4, background:"#d97706", color:"#fff", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>!</span>}
            {t==="versions" && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{sopVersions.length}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex:1, overflow:"hidden", display:"flex", minWidth:0 }}>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab==="overview" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:12 }}>
            <div className="dwm-panel">
              <div className="dwm-panel-header"><div className="ph-title">SOP Information</div></div>
              <div style={{ padding:16 }}>
                <div className="form-grid form-grid-2">
                  <div className="form-field"><label>SOP Code</label><input value={sop.code} readOnly style={{ background:"#f8fafc", fontFamily:"monospace" }} /></div>
                  <div className="form-field"><label>Title *</label><input defaultValue={sop.title} /></div>
                  <div className="form-field" style={{ gridColumn:"1/-1" }}><label>Description</label><textarea defaultValue={`Standard operating procedure for ${sop.title}.`} style={{ minHeight:56 }} /></div>
                  <div className="form-field"><label>Linked Process *</label><input defaultValue={sop.linkedProcess} /></div>
                  <div className="form-field"><label>Linked PFC</label><input defaultValue={sop.linkedPFC ?? ""} placeholder="PFC code (required — §11.1)" style={{ borderColor: !sop.linkedPFC ? "#f87171" : undefined }} /></div>
                  <div className="form-field"><label>Linked PFC Node — §11.1</label><input defaultValue="N-06: Torque Fasteners" placeholder="PFC node (required)" /></div>
                  <div className="form-field"><label>Owner Position *</label><input defaultValue={sop.ownerPosition} /></div>
                  <div className="form-field"><label>Reviewer Position</label><input defaultValue={sop.reviewerPosition} /></div>
                  <div className="form-field"><label>Approver Position</label><input defaultValue={sop.approverPosition} /></div>
                  <div className="form-field"><label>Effective From</label><input type="date" defaultValue={sop.effectiveFrom} /></div>
                </div>
              </div>
            </div>

            {/* §11 Structural Validation */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><AlertTriangle size={13} color={sopValidation.some(v=>!v.pass)?"#d97706":"#15803d"} /> Structural Validation — Spec §11</div>
              </div>
              <div style={{ padding:"8px 14px", display:"flex", flexDirection:"column", gap:4 }}>
                {sopValidation.map((c, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11 }}>
                    {c.pass ? <CheckCircle2 size={12} color="#15803d" /> : <XCircle size={12} color={c.warn?"#d97706":"#dc2626"} />}
                    <span style={{ flex:1, color:c.pass?"#475569":c.warn?"#d97706":"#dc2626" }}>{c.label}</span>
                    <span style={{ fontSize:9, color:"#94a3b8" }}>{c.specRef}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dwm-panel">
              <div className="dwm-panel-header"><div className="ph-title">Ownership — Spec §2.3</div></div>
              <div style={{ padding:14 }}>
                <OwnershipCard ownerPosition={sop.ownerPosition} resolvedPerson={sop.resolvedOwner} context="Chennai / Assembly" />
              </div>
            </div>
            </div>{/* closes maxWidth:640 wrapper */}
          </div>
        )}

        {/* ═══ STEPS ═══ */}
        {activeTab==="steps" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Steps list */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:5, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{steps.length} steps · §3.4: ACTION / DECISION</span>
                  {!sop.linkedPFC && <span style={{ fontSize:10, color:"#dc2626", marginLeft:8 }}>⚠ SOP must link to PFC node (§11.1)</span>}
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11 }}><AlertTriangle size={11} /> Validate Flow</button>
                  <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }}><Plus size={11} /> Add Step</button>
                </div>
              </div>

              {steps.length===0 && (
                <div className="empty-state"><BookOpen size={26} className="es-icon" /><div className="es-title">No steps defined</div><div className="es-sub">Add steps (§3.4: atomic execution units with ACTION/DECISION type)</div></div>
              )}

              {steps.map((step, idx) => {
                const cs         = CRIT_STYLE[step.criticality] ?? { bg:"#f1f5f9", color:"#64748b" };
                const isExpanded = expandedStep === step.id;
                const isSelected = selectedStep?.id === step.id;
                const sType      = stepTypes[step.id] ?? "ACTION";
                const ouType     = outputTypes[step.id] ?? "NEXT_STEP";
                const ouCfg      = OUTPUT_USAGE[ouType];
                const lm         = linkedMeasurePerStep[step.id] ? measures.find(m => m.id === linkedMeasurePerStep[step.id]) : null;
                const stepCode   = stepCodes[step.id] ?? `STP-${String(idx+1).padStart(3,"0")}`;
                return (
                  <div
                    key={step.id}
                    style={{ background:"#fff", border:`1px solid ${isSelected?"#2563eb":"#e2e8f0"}`, borderRadius:7, overflow:"hidden", cursor:"pointer" }}
                    onClick={() => { setSelectedStep(step); setExpandedStep(step.id); }}
                  >
                    {/* Step header */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", background:isSelected?"#eff6ff":"#fafafa", borderBottom:isExpanded?"1px solid #e2e8f0":"none" }}>
                      <GripVertical size={13} color="#d1d5db" />
                      <div style={{ width:22, height:22, borderRadius:"50%", background:isSelected?"#2563eb":"#e2e8f0", color:isSelected?"#fff":"#64748b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>
                        {idx+1}
                      </div>
                      {/* step_code — Spec §3.4 */}
                      <span style={{ fontFamily:"monospace", fontSize:9, color:"#94a3b8", flexShrink:0 }}>{stepCode}</span>
                      {/* step_type badge — Spec §3.4 */}
                      <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, flexShrink:0, background:sType==="ACTION"?"#eff6ff":"#fffbeb", color:sType==="ACTION"?"#1d4ed8":"#d97706", border:`1px solid ${sType==="ACTION"?"#bfdbfe":"#fde68a"}` }}>
                        {sType}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:"#0f172a" }}>{step.title}</span>
                        <span style={{ fontSize:10, color:"#94a3b8", marginLeft:7 }}>{step.responsiblePosition}</span>
                      </div>
                      <div style={{ display:"flex", gap:4, alignItems:"center", flexShrink:0, flexWrap:"nowrap" }}>
                        <span style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:cs.bg, color:cs.color }}>{step.criticality}</span>
                        {ouType !== "NEXT_STEP" && <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3, background:ouCfg.bg, color:ouCfg.color }}>{ouCfg.label}</span>}
                        {lm
                          ? <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3, background:"#fdf4ff", color:"#7e22ce", border:"1px solid #e9d5ff" }}>⊕ {lm.code}</span>
                          : ouType === "MEASURE_INPUT"
                            ? <span title="Output is MEASURE_INPUT but no measure linked — §3.3" style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:"#fef2f2", color:"#dc2626", border:"1px solid #fca5a5" }}>⚠ Measure Missing</span>
                            : step.criticality === "Critical"
                              ? <span title="Critical step — measure linkage recommended (§2.1)" style={{ fontSize:9, padding:"1px 5px", borderRadius:3, background:"#fffbeb", color:"#d97706" }}>! No Measure</span>
                              : null
                        }
                        {step.evidenceRequired && <span style={{ fontSize:9, background:"#f0f9ff", color:"#0369a1", padding:"1px 5px", borderRadius:3 }}>Evidence</span>}
                        <button style={{ border:"none", background:"none", cursor:"pointer", padding:2, color:"#94a3b8" }} onClick={e => { e.stopPropagation(); toggleStep(step.id); }}>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                        <button style={{ border:"none", background:"none", cursor:"pointer", padding:2, color:"#94a3b8" }} onClick={e=>e.stopPropagation()}><Copy size={12}/></button>
                        <button style={{ border:"none", background:"none", cursor:"pointer", padding:2, color:"#94a3b8" }} onClick={e=>e.stopPropagation()}><Trash2 size={12}/></button>
                      </div>
                    </div>

                    {/* Expanded body */}
                    {isExpanded && (
                      <div style={{ padding:"9px 14px", display:"flex", flexDirection:"column", gap:7, fontSize:12 }}>
                        {/* instruction_text — Spec §3.4 */}
                        <div style={{ color:"#334155", lineHeight:1.5 }}>{step.description}</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          {step.inputDefinition  && <div><div style={{ fontSize:9, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginBottom:2 }}>Input</div><div style={{ color:"#475569", fontSize:11 }}>{step.inputDefinition}</div></div>}
                          {/* expected_output — Spec §3.4 */}
                          {step.outputDefinition && <div><div style={{ fontSize:9, color:"#94a3b8", fontWeight:600, textTransform:"uppercase", marginBottom:2 }}>Expected Output — §3.4</div><div style={{ color:"#475569", fontSize:11 }}>{step.outputDefinition}</div></div>}
                        </div>
                        {step.safetyNote  && <div className="alert-bar warning" style={{ padding:"5px 9px", fontSize:11 }}><AlertTriangle size={11} /><span><strong>Safety:</strong> {step.safetyNote}</span></div>}
                        {step.qualityNote && <div className="alert-bar info"    style={{ padding:"5px 9px", fontSize:11 }}><Link2 size={11} /><span><strong>Quality:</strong> {step.qualityNote}</span></div>}
                        {step.timingRule  && <div style={{ fontSize:10, color:"#64748b" }}>⏱ {step.timingRule}</div>}
                        {/* DECISION branching display */}
                        {sType === "DECISION" && (
                          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:5, padding:"7px 10px" }}>
                            <div style={{ fontSize:9, fontWeight:700, color:"#d97706", marginBottom:5, textTransform:"uppercase" }}>Decision Branches — §3.4</div>
                            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                              {[{ label:"Yes / Pass", type:"Default", color:"#15803d" }, { label:"No / Fail", type:"Conditional", color:"#dc2626" }].map(b => (
                                <div key={b.label} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11 }}>
                                  <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, background:`${b.color}15`, color:b.color }}>{b.type}</span>
                                  <span style={{ color:"#475569" }}>{b.label}</span>
                                  <span style={{ color:"#94a3b8", fontSize:10 }}>→ (next step)</span>
                                </div>
                              ))}
                              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, alignSelf:"flex-start", marginTop:2 }}><Plus size={10} /> Add Branch</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Step Editor Panel ── */}
            {selectedStep && (
              <div style={{ width:340, borderLeft:"1px solid #e2e8f0", background:"#fff", overflowY:"auto", flexShrink:0, display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"9px 14px", borderBottom:"1px solid #e2e8f0", background:"#fafafa" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>Step {selectedStep.sequence}: {selectedStep.title}</div>
                  <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
                    {stepCodes[selectedStep.id]} · Spec §3.4 fields
                  </div>
                </div>
                <div style={{ padding:14, display:"flex", flexDirection:"column", gap:9, overflowY:"auto", flex:1 }}>

                  {/* §3.4: step_code */}
                  <div className="form-field">
                    <label>Step Code — §3.4</label>
                    <input defaultValue={stepCodes[selectedStep.id]} readOnly style={{ background:"#f8fafc", fontFamily:"monospace" }} />
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {/* §3.4: step_type ACTION / DECISION */}
                    <div className="form-field">
                      <label>Step Type * — §3.4</label>
                      <select value={stepTypes[selectedStep.id] ?? "ACTION"} onChange={e => setStepTypes(p => ({ ...p, [selectedStep.id]: e.target.value as any }))}>
                        <option value="ACTION">ACTION</option>
                        <option value="DECISION">DECISION</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Criticality</label>
                      <select defaultValue={selectedStep.criticality}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
                    </div>
                  </div>

                  <div className="form-field"><label>Step Name *</label><input defaultValue={selectedStep.title} /></div>
                  {/* §3.4: instruction_text */}
                  <div className="form-field"><label>Instruction Text * — §3.4</label><textarea defaultValue={selectedStep.description} style={{ minHeight:80 }} /></div>
                  {/* Node Classification — Delta §3.1 */}
                  <div className="form-field">
                    <label>Node Classification — §3.1</label>
                    <select defaultValue="INSTRUCTION">
                      <option value="INSTRUCTION">INSTRUCTION — Requires SOP (mandatory)</option>
                      <option value="OBSERVATION">OBSERVATION — No SOP required</option>
                      <option value="CONTROL">CONTROL — Optional SOP</option>
                      <option value="AUTOMATED">AUTOMATED — System-driven</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Owner Position — §3.4</label>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <select defaultValue={selectedStep.responsiblePosition} style={{ flex:1 }}>
                        <option>{selectedStep.responsiblePosition}</option>
                        <option>Quality Inspector</option><option>Shift Supervisor</option><option>QC Manager</option>
                      </select>
                      <OwnershipResolutionBadge state="Resolved" position={selectedStep.responsiblePosition} compact />
                    </div>
                  </div>

                  {/* Output usage type — Delta §3.2 */}
                  <div className="form-field">
                    <label>Output Usage Type * — §3.2</label>
                    <select value={outputTypes[selectedStep.id] ?? "NEXT_STEP"} onChange={e => setOutputTypes(p => ({ ...p, [selectedStep.id]: e.target.value }))}>
                      <option value="NEXT_STEP">NEXT_STEP — Feeds next step</option>
                      <option value="MEASURE_INPUT">MEASURE_INPUT — Input for measure (requires measure link)</option>
                      <option value="AUDIT_REFERENCE">AUDIT_REFERENCE — Audit/QMS reference</option>
                      <option value="EXTERNAL_SYSTEM">EXTERNAL_SYSTEM — Sent to external system</option>
                      <option value="NONE">NONE — No defined consumption</option>
                    </select>
                    {/* Validation: MEASURE_INPUT must have measure linked — §3.3 */}
                    {(outputTypes[selectedStep.id] ?? "NEXT_STEP") === "MEASURE_INPUT" && !linkedMeasurePerStep[selectedStep.id] && (
                      <div className="alert-bar danger" style={{ marginTop:5, padding:"4px 8px", fontSize:10 }}>
                        <AlertTriangle size={10} /><span>MEASURE_INPUT requires a linked measure — §3.3</span>
                      </div>
                    )}
                  </div>

                  {/* §3.4: expected_output */}
                  <div className="form-field"><label>Expected Output * — §3.4</label><input defaultValue={selectedStep.outputDefinition} placeholder="e.g. Completed torque record" /></div>
                  <div className="form-field"><label>Input Definition</label><input defaultValue={selectedStep.inputDefinition} /></div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="checkbox" id="ev" defaultChecked={selectedStep.evidenceRequired} />
                    <label htmlFor="ev" style={{ fontSize:12, cursor:"pointer" }}>Evidence Required</label>
                  </div>
                  <div className="form-field"><label>Safety Note</label><textarea defaultValue={selectedStep.safetyNote} style={{ minHeight:44 }} /></div>
                  <div className="form-field"><label>Quality Note</label><textarea defaultValue={selectedStep.qualityNote} style={{ minHeight:44 }} /></div>
                  <div className="form-field"><label>Timing Rule</label><input defaultValue={selectedStep.timingRule} /></div>

                  {/* §8.1 SOP Step ↔ Measure linkage (primary) */}
                  <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:9 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#475569", marginBottom:6 }}>Measure Linkage — Spec §8.1 (Primary)</div>
                    {linkedMeasurePerStep[selectedStep.id] ? (() => {
                      const lm = measures.find(m => m.id === linkedMeasurePerStep[selectedStep.id]);
                      const tc = lm ? TYPE_C[lm.type] : null;
                      return lm && tc ? (
                        <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px", background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:5 }}>
                          <span style={{ fontSize:9, fontWeight:700, color:tc.color }}>{lm.type}</span>
                          <span style={{ fontSize:11, fontWeight:600, color:"#0f172a", flex:1 }}>{lm.code} — {lm.name}</span>
                          <button onClick={() => setLinkedMeasurePerStep(p => { const n={...p}; delete n[selectedStep.id]; return n; })} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8" }}>×</button>
                        </div>
                      ) : null;
                    })() : (
                      <button className="dwm-btn dwm-btn-ghost" style={{ width:"100%", justifyContent:"center", fontSize:11 }} onClick={() => setShowMeasurePicker(true)}>
                        <Link2 size={11} /> Link a Measure (§8.1)
                      </button>
                    )}
                  </div>

                  {/* DECISION: transitions/branching — Spec §3.4 */}
                  {(stepTypes[selectedStep.id] ?? "ACTION") === "DECISION" && (
                    <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:9 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#d97706", marginBottom:7 }}>Decision Transitions — §3.4</div>
                      {[{ label:"Yes / Pass Branch" }, { label:"No / Fail Branch" }].map(b => (
                        <div key={b.label} className="form-field" style={{ marginBottom:7 }}>
                          <label style={{ fontSize:10, color:"#94a3b8" }}>{b.label}</label>
                          <select style={{ fontSize:11 }}>
                            <option>→ select target step</option>
                            {steps.filter(s => s.id !== selectedStep.id).map(s => <option key={s.id}>{s.title}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="dwm-btn dwm-btn-primary" style={{ justifyContent:"center" }}>Save Step</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ MEASURES ═══ */}
        {activeTab==="measures" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <span style={{ fontSize:11, color:"#94a3b8" }}>{sopLinks.length} measure link{sopLinks.length!==1?"s":""} · §8.1: SOP Step ↔ Measure (primary linkage)</span>
              <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }} onClick={() => setShowMeasurePicker(true)}><Plus size={11} /> Add Measure Link</button>
            </div>
            {sopLinks.length===0 && (
              <div className="alert-bar warning" style={{ marginBottom:8 }}><AlertTriangle size={12} /><span><strong>Spec §8.1:</strong> SOP step-level measure linkage enables traceability and deviation analysis. Link at least one measure.</span></div>
            )}
            {sopLinks.length > 0 && (
              <div style={{ overflowX:"auto", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff" }}>
                <table className="dwm-table" style={{ minWidth:800 }}>
                  <thead><tr><th>Level</th><th>Step Code</th><th>Step</th><th>Type</th><th>Code</th><th>Measure</th><th>Scope</th><th>Unit</th><th>Target</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {sopLinks.map((link, i) => {
                      const m = measures.find(x => x.id === link.measureId);
                      if (!m) return null;
                      const tc = TYPE_C[m.type];
                      return (
                        <tr key={i}>
                          <td><span style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:link.stepTitle?"#f0fdf4":"#eff6ff", color:link.stepTitle?"#15803d":"#1d4ed8" }}>{link.stepTitle?"Step":"SOP"}</span></td>
                          <td><span style={{ fontFamily:"monospace", fontSize:10, color:"#94a3b8", whiteSpace:"nowrap" }}>{link.stepCode ?? "–"}</span></td>
                          <td><span className="td-secondary" style={{ whiteSpace:"nowrap" }}>{link.stepTitle ?? "–"}</span></td>
                          <td><span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>{m.type}</span></td>
                          <td><span style={{ fontFamily:"monospace", fontSize:11, fontWeight:600, color:"#1d4ed8", whiteSpace:"nowrap" }}>{m.code}</span></td>
                          <td><div className="td-primary" style={{ whiteSpace:"nowrap" }}>{m.name}</div></td>
                          <td><span className="td-secondary" style={{ whiteSpace:"nowrap" }}>{link.scope}</span></td>
                          <td><span className="td-secondary">{m.unitOfMeasure}</span></td>
                          <td><span style={{ fontSize:11, fontWeight:600, color:"#15803d", whiteSpace:"nowrap" }}>{m.targetValue ?? "–"}{m.targetValue?` ${m.unitOfMeasure}`:""}</span></td>
                          <td><StatusBadge status={m.status as any} /></td>
                          <td><div style={{ display:"flex", gap:4 }}><button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"2px 7px" }}><ExternalLink size={10} /></button><button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"2px 7px" }}><Trash2 size={10} /></button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ OWNERSHIP ═══ */}
        {activeTab==="ownership" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ maxWidth:560, display:"flex", flexDirection:"column", gap:12 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Ownership — Spec §2.3</div></div>
                <div style={{ padding:14 }}>
                  {/* Ownership resolution badge */}
                  <div style={{ marginBottom:10 }}>
                    <OwnershipResolutionBadge
                      state={deriveOwnershipState(sop.resolvedOwner)}
                      position={sop.ownerPosition}
                      person={sop.resolvedOwner}
                      navigable
                    />
                  </div>
                  <OwnershipCard ownerPosition={sop.ownerPosition} resolvedPerson={sop.resolvedOwner} context="Chennai / Assembly" />
                  {/* Step ownership summary */}
                  <div style={{ marginTop:10, borderTop:"1px solid #f1f5f9", paddingTop:8 }}>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#94a3b8", marginBottom:6 }}>Step Ownership (§3.4)</div>
                    {steps.slice(0,5).map(s => (
                      <OwnershipRow key={s.id} label="Step" position={s.responsiblePosition} state="Resolved" person="Context-resolved" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Governance Chain — §5.3</div></div>
                <div style={{ padding:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"Reviewer Position",   value:sop.reviewerPosition },
                    { label:"Approver Position",   value:sop.approverPosition },
                    { label:"Effective From",       value:sop.effectiveFrom ?? "–" },
                    { label:"Context Scope",        value:"Chennai / Assembly" },
                  ].map(({ label, value }) => (
                    <div key={label} className="detail-field"><div className="df-label">{label}</div><div className="df-value">{value}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ APPROVAL ═══ */}
        {activeTab==="approval" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden", minWidth:0 }}>
            <div className="content-area" style={{ flex:1, minWidth:0 }}>
              {sop.status==="Under Review" && (
                <div className="alert-bar warning" style={{ marginBottom:10 }}>
                  <AlertTriangle size={12} />
                  <span><strong>Under Review.</strong> Awaiting action from {sop.approverPosition}.</span>
                  <button className="dwm-btn dwm-btn-primary" style={{ marginLeft:"auto", fontSize:11 }} onClick={() => { setApproveAction("approve"); setShowApproveModal(true); }}>Take Action</button>
                </div>
              )}

              {/* Summary grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                {[
                  { label:"Object",         value:`${sop.code} — ${sop.title}` },
                  { label:"Version",        value:sop.version },
                  { label:"Submitted By",   value:"Ravi Kumar" },
                  { label:"Submitted On",   value:"2026-03-10" },
                  { label:"Reviewer",       value:sop.reviewerPosition },
                  { label:"Approver",       value:sop.approverPosition },
                ].map(({ label, value }) => (
                  <div key={label} className="detail-field"><div className="df-label">{label}</div><div className="df-value">{value}</div></div>
                ))}
              </div>

              {/* §11 Review Checklist */}
              <div className="dwm-panel" style={{ marginBottom:10 }}>
                <div className="dwm-panel-header"><div className="ph-title">Review Checklist — Spec §11</div></div>
                <div style={{ padding:"8px 14px", display:"flex", flexDirection:"column", gap:5 }}>
                  {sopValidation.map((c, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:7, fontSize:11 }}>
                      {c.pass ? <CheckCircle2 size={12} color="#15803d" /> : <XCircle size={12} color={c.warn?"#d97706":"#dc2626"} />}
                      <span style={{ flex:1, color:c.pass?"#475569":c.warn?"#d97706":"#dc2626" }}>{c.label}</span>
                      <span style={{ fontSize:9, color:"#94a3b8" }}>{c.specRef}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comment thread */}
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title"><MessageSquare size={13} color="#64748b" /> Review Comments</div></div>
                <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:0 }}>
                  {APPROVAL_COMMENTS.map((c, idx) => (
                    <div key={c.id} style={{ padding:"9px 0", borderBottom:idx<APPROVAL_COMMENTS.length-1?"1px solid #f1f5f9":"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                        <div style={{ width:24, height:24, borderRadius:"50%", background:"#1e40af", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>
                          {c.author.split(" ").map(w=>w[0]).join("").slice(0,2)}
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{c.author}</span>
                        <span style={{ fontSize:10, color:"#94a3b8" }}>{c.role}</span>
                        <span style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:c.type==="request"?"#fff7ed":c.type==="comment"?"#f0f9ff":"#f0fdf4", color:c.type==="request"?"#c2410c":c.type==="comment"?"#0369a1":"#15803d" }}>
                          {c.type==="request"?"Request Changes":c.type==="comment"?"Comment":"Submitted"}
                        </span>
                        <span style={{ fontSize:10, color:"#94a3b8", marginLeft:"auto" }}>{c.date}</span>
                      </div>
                      <div style={{ fontSize:11, color:"#334155", paddingLeft:31, lineHeight:1.5 }}>{c.text}</div>
                    </div>
                  ))}
                  <div style={{ marginTop:10 }}>
                    <textarea placeholder="Add a review comment…" style={{ width:"100%", minHeight:56, fontSize:11, border:"1px solid #e2e8f0", borderRadius:5, padding:8, fontFamily:"var(--dwm-font)", boxSizing:"border-box" }} />
                    <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginTop:5 }}>
                      <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11 }}>Add Comment</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action sidebar */}
            <div style={{ width:200, borderLeft:"1px solid #e2e8f0", padding:14, display:"flex", flexDirection:"column", gap:7, flexShrink:0 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#475569", marginBottom:2 }}>Approval Actions</div>
              <button className="dwm-btn" style={{ background:"#15803d", color:"#fff", border:"none", justifyContent:"center", fontSize:12 }} onClick={() => { setApproveAction("approve"); setShowApproveModal(true); }}>
                <CheckCircle2 size={12} /> Approve
              </button>
              <button className="dwm-btn" style={{ background:"#dc2626", color:"#fff", border:"none", justifyContent:"center", fontSize:12 }} onClick={() => { setApproveAction("reject"); setShowApproveModal(true); }}>
                <XCircle size={12} /> Reject
              </button>
              <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent:"center", fontSize:12 }} onClick={() => { setApproveAction("changes"); setShowApproveModal(true); }}>
                <MessageSquare size={12} /> Request Changes
              </button>
              <div style={{ height:1, background:"#f1f5f9", margin:"3px 0" }} />
              <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent:"center", fontSize:11 }}><GitCompare size={11} /> Compare Versions</button>
              <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent:"center", fontSize:11 }}><ExternalLink size={11} /> Open Full Page</button>
            </div>
          </div>
        )}

        {/* ═══ VERSIONS ═══ */}
        {activeTab==="versions" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>{sopVersions.length} version{sopVersions.length!==1?"s":""}</span>
                <span style={{ fontSize:10, background:"#f1f5f9", color:"#64748b", padding:"1px 6px", borderRadius:3, whiteSpace:"nowrap" }}>Revision traceability — Spec §7</span>
              </div>
              <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11 }}><GitCompare size={11} /> Compare</button>
                <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }} onClick={() => setShowRevisionModal(true)}><RotateCcw size={11} /> Create Revision</button>
              </div>
            </div>
            <div style={{ overflowX:"auto", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff" }}>
            <table className="dwm-table" style={{ minWidth:780 }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace:"nowrap" }}>Version</th><th style={{ whiteSpace:"nowrap" }}>Status</th><th style={{ whiteSpace:"nowrap" }}>Source Type — §7</th><th style={{ whiteSpace:"nowrap", minWidth:160 }}>Revision Reason</th>
                  <th style={{ whiteSpace:"nowrap" }}>Created</th><th style={{ whiteSpace:"nowrap" }}>Created By</th><th style={{ whiteSpace:"nowrap" }}>Approved</th><th style={{ whiteSpace:"nowrap" }}>Approved By</th><th></th>
                </tr>
              </thead>
              <tbody>
                {[...sopVersions].reverse().map(v => {
                  const vs  = VER_STATUS[v.status] ?? { bg:"#f1f5f9", color:"#64748b" };
                  const src = v.revisionSourceType ? SRC_CFG[v.revisionSourceType] : null;
                  return (
                    <tr key={v.versionNo}>
                      <td><span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#1d4ed8" }}>{v.versionNo}</span></td>
                      <td><span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:4, background:vs.bg, color:vs.color }}>{v.status}</span></td>
                      <td>
                        {src
                          ? <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:src.bg, color:src.color }}>{src.label}</span>
                          : <span style={{ fontSize:10, color:"#94a3b8" }}>–</span>
                        }
                      </td>
                      <td style={{ maxWidth:200 }}>
                        <span style={{ fontSize:11, color:"#475569", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={v.revisionReason ?? v.changeNote}>
                          {v.revisionReason ?? v.changeNote}
                        </span>
                      </td>
                      <td><span className="td-secondary">{v.createdAt}</span></td>
                      <td><span className="td-secondary">{v.createdBy}</span></td>
                      <td><span className="td-secondary">{v.approvedAt ?? "–"}</span></td>
                      <td><span className="td-secondary">{v.approvedBy ?? "–"}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"2px 7px" }}>Open</button>
                          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"2px 7px" }}>Compare</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>{/* closes overflowX:auto wrapper */}
          </div>
        )}

        {/* ═══ IMPACT ═══ */}
        {activeTab==="impact" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
              {[
                { label:"Blocking Items", value:"1", color:"#dc2626", bg:"#fef2f2" },
                { label:"High / Medium",  value:"2", color:"#d97706", bg:"#fffbeb" },
                { label:"Total Impacted", value:"4", color:"#1d4ed8", bg:"#eff6ff" },
              ].map(c => (
                <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.color}30`, borderRadius:6, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:700, color:c.color }}>{c.value}</div>
                  <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div className="alert-bar danger" style={{ marginBottom:10 }}>
              <ShieldAlert size={12} />
              <span><strong>1 blocking impact (§6.2):</strong> Measure M-006 target value must be updated before this SOP can be activated.</span>
            </div>
            <table className="dwm-table">
              <thead><tr><th>Type</th><th>Object</th><th>Severity</th><th>Action Required — §6.2</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { type:"Measure", id:"M-006", name:"Fastener Torque Value (CP-001)", sev:"Blocking", action:"Update target values for new spec", status:"Pending", block:true },
                  { type:"Measure", id:"M-004", name:"Torque Compliance Rate (MP-002)", sev:"High",     action:"Review measurement method",         status:"Pending", block:false },
                  { type:"PFC",     id:"PFC-001", name:"Final Assembly Operation Flow", sev:"Medium",   action:"Review node linkage after SOP change", status:"Pending", block:false },
                  { type:"SOP",     id:"SOP-004", name:"Final Inspection and Release",  sev:"Low",      action:"Verify step references",            status:"Resolved", block:false },
                ].map((item, i) => {
                  const sev = { Blocking:{bg:"#fef2f2",color:"#dc2626"}, High:{bg:"#fff7ed",color:"#c2410c"}, Medium:{bg:"#fffbeb",color:"#d97706"}, Low:{bg:"#f0fdf4",color:"#15803d"} }[item.sev];
                  const sts = { Pending:{bg:"#fffbeb",color:"#d97706"}, Resolved:{bg:"#f0fdf4",color:"#15803d"} }[item.status as any] ?? { bg:"#f1f5f9", color:"#64748b" };
                  return (
                    <tr key={i} style={{ background:item.block?"#fff5f5":undefined }}>
                      <td><span style={{ fontSize:10, fontWeight:600, padding:"1px 5px", borderRadius:3, background:"#eff6ff", color:"#1d4ed8" }}>{item.type}</span></td>
                      <td><div className="td-primary">{item.name}</div><div className="td-secondary">{item.id}</div></td>
                      <td><span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:3, background:sev?.bg, color:sev?.color }}>{item.sev}</span></td>
                      <td><span className="td-secondary">{item.action}</span></td>
                      <td><span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:3, background:sts.bg, color:sts.color }}>{item.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── Measure Picker Modal ── */}
      {showMeasurePicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:500, background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"12px 16px", background:"#0f172a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#f1f5f9", fontSize:13, fontWeight:600 }}>Link a Measure — Spec §8.1</span>
              <button onClick={() => setShowMeasurePicker(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:18 }}>×</button>
            </div>
            <div style={{ padding:14 }}>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:8 }}>
                §8.1: Primary linkage is at SOP Step level. Defines what is measured at execution level.
              </div>
              <div className="filter-input" style={{ marginBottom:10 }}>
                <Search size={12} color="#94a3b8" />
                <input placeholder="Search by code or name…" value={measureQuery} onChange={e => setMeasureQuery(e.target.value)} autoFocus />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, maxHeight:260, overflowY:"auto" }}>
                {filteredMeasures.map(m => {
                  const tc = TYPE_C[m.type];
                  return (
                    <div
                      key={m.id}
                      onClick={() => { if (selectedStep) setLinkedMeasurePerStep(p => ({ ...p, [selectedStep.id]: m.id })); setShowMeasurePicker(false); setMeasureQuery(""); }}
                      style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 12px", borderRadius:5, border:"1px solid #e2e8f0", cursor:"pointer", background:"#fafafa" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#eff6ff")}
                      onMouseLeave={e=>(e.currentTarget.style.background="#fafafa")}
                    >
                      <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}`, flexShrink:0 }}>{m.type}</span>
                      <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:600, color:"#1d4ed8", flexShrink:0 }}>{m.code}</span>
                      <span style={{ fontSize:12, color:"#0f172a", flex:1 }}>{m.name}</span>
                      <span style={{ fontSize:10, color:"#94a3b8" }}>{m.unitOfMeasure}</span>
                      <StatusBadge status={m.status as any} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Action Modal ── */}
      {showApproveModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:430, background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"12px 16px", background:approveAction==="approve"?"#15803d":approveAction==="reject"?"#dc2626":"#0f172a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#f1f5f9", fontSize:13, fontWeight:600 }}>
                {approveAction==="approve"?"Approve SOP":approveAction==="reject"?"Reject SOP":"Request Changes"}
              </span>
              <button onClick={() => setShowApproveModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#f1f5f9", fontSize:18 }}>×</button>
            </div>
            <div style={{ padding:16 }}>
              <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 12px", marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{sop.code} — {sop.title}</div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{sop.version} · {sop.ownerPosition}</div>
              </div>
              <div className="form-field">
                <label>Comment {approveAction!=="approve"?" *":""}</label>
                <textarea placeholder={approveAction==="approve"?"Optional note…":approveAction==="reject"?"Reason for rejection (required)…":"Changes needed…"} value={approveComment} onChange={e => setApproveComment(e.target.value)} style={{ minHeight:70 }} />
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                <button className="dwm-btn dwm-btn-ghost" onClick={() => setShowApproveModal(false)}>Cancel</button>
                <button className="dwm-btn" style={{ background:approveAction==="approve"?"#15803d":approveAction==="reject"?"#dc2626":"#1d4ed8", color:"#fff", border:"none", padding:"5px 14px", borderRadius:5, cursor:"pointer", display:"flex", gap:5, alignItems:"center", fontSize:12, fontWeight:600 }} onClick={() => setShowApproveModal(false)}>
                  {approveAction==="approve"?<><CheckCircle2 size={12}/> Approve</>:approveAction==="reject"?<><XCircle size={12}/> Reject</>:<><MessageSquare size={12}/> Submit Request</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Revision Modal ── */}
      {showRevisionModal && (
        <CreateRevisionModal
          objectName={sop.title}
          objectCode={sop.code}
          objectType="SOP"
          currentVersion={sop.version}
          onClose={() => setShowRevisionModal(false)}
        />
      )}
    </div>
  );
};
