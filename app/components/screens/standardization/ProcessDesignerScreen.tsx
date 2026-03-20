import React, { useState } from "react";
import {
  GitBranch, Save, Send, AlertTriangle, Plus, Layers, BookOpen, ChartBar,
  Users, History, ExternalLink, CheckCircle2, XCircle, ChevronDown,
  ShieldAlert, GitCompare, RotateCcw, Lock, Clock,
} from "lucide-react";

import {
  processes, pfcs, sops, measures, impactItems, processVersions,
  auditEvents, Process, ProcessVersion,
} from "../../../../data/standardsData";
import { measureLinks } from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";
import { OwnershipCard } from "../../shared/OwnershipCard";
import { LifecyclePipeline } from "../../shared/LifecyclePipeline";
import { CreateRevisionModal } from "../../shared/CreateRevisionModal";
import { OwnershipResolutionBadge, deriveOwnershipState } from "../../shared/OwnershipResolutionBadge";
import { UnifiedValidationPanel, buildSystemValidationIssues } from "../../shared/UnifiedValidationPanel";
import { useNavigate } from "react-router";

// ─── Style helpers ────────────────────────────────────────────────────────────
const CRIT: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fff7ed", color: "#c2410c" },
  Medium:   { bg: "#fffbeb", color: "#d97706" },
  Low:      { bg: "#f0fdf4", color: "#15803d" },
};
const TYPE_C: Record<string, { bg: string; color: string; border: string }> = {
  KPI: { bg: "#eff6ff", color: "#1e40af", border: "#3b82f6" },
  MP:  { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
  MOP: { bg: "#fdf4ff", color: "#7e22ce", border: "#c084fc" },
  CP:  { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
};
const SRC_CFG: Record<string, { label: string; color: string; bg: string }> = {
  MANUAL:              { label: "Manual",       color: "#1d4ed8", bg: "#eff6ff" },
  AUDIT:               { label: "Audit",        color: "#c2410c", bg: "#fff7ed" },
  MEASURE_REFERENCE:   { label: "Measure Ref",  color: "#7e22ce", bg: "#fdf4ff" },
  DEVIATION_REFERENCE: { label: "Deviation",    color: "#dc2626", bg: "#fef2f2" },
  REGULATORY:          { label: "Regulatory",   color: "#0369a1", bg: "#f0f9ff" },
};
const VER_STATUS: Record<string, { bg: string; color: string }> = {
  Active:        { bg: "#dcfce7", color: "#14532d" },
  Effective:     { bg: "#dcfce7", color: "#14532d" },
  Superseded:    { bg: "#f5f3ff", color: "#5b21b6" },
  Approved:      { bg: "#ecfdf5", color: "#065f46" },
  "Under Review":{ bg: "#fffbeb", color: "#92400e" },
  Draft:         { bg: "#f3f4f6", color: "#374151" },
  Retired:       { bg: "#f1f5f9", color: "#475569" },
};

// ─── Structural Validation — Spec §11 ────────────────────────────────────────
// §11.1 Structural, §11.2 Governance, §11.3 Linkage, §11.4 Override Validation
function buildValidation(proc: Process, linkedPFCs: typeof pfcs, linkedSOPs: typeof sops, linkedMeasures: typeof measures) {
  const hasPFC       = linkedPFCs.length > 0;                                           // §11.1: Process must have at least one PFC
  const pfcStart     = linkedPFCs.every(p => p.nodes.length === 0 || p.nodes.some(n => n.type === "Start")); // §11.1: PFC must have start node
  const pfcEnd       = linkedPFCs.every(p => p.nodes.length === 0 || p.nodes.some(n => n.type === "End"));   // §11.1: PFC must have end node
  const sopPFCLinked = linkedSOPs.every(s => !!s.linkedPFC);                            // §11.1: SOP must link to valid PFC node
  const ownerResolved= proc.resolvedOwner !== "Not Resolved";                           // §11.2 Governance
  const hasMeasures  = proc.linkedMeasures > 0;                                         // §11.3 Linkage
  const blockingImpacts = impactItems.filter(i => i.isBlocking && i.status === "Pending").length;

  return [
    // Structural
    { group: "Structural",  label: "Process has at least one PFC linked",   pass: hasPFC,       warn: false, specRef: "§11.1" },
    { group: "Structural",  label: "All PFCs have a Start node",            pass: pfcStart,     warn: !pfcStart && linkedPFCs.some(p => p.nodes.length > 0), specRef: "§11.1" },
    { group: "Structural",  label: "All PFCs have an End node",             pass: pfcEnd,       warn: !pfcEnd && linkedPFCs.some(p => p.nodes.length > 0), specRef: "§11.1" },
    { group: "Structural",  label: "All SOPs link to a valid PFC node",     pass: sopPFCLinked, warn: false, specRef: "§11.1" },
    // Governance
    { group: "Governance",  label: "Owner position resolved",               pass: ownerResolved, warn: !ownerResolved, specRef: "§11.2" },
    { group: "Governance",  label: "Process version is unique",             pass: true,          warn: false, specRef: "§11.2" },
    // Linkage
    { group: "Linkage",     label: "Measure linkage exists (optional)",     pass: hasMeasures,   warn: !hasMeasures, specRef: "§11.3" },
    { group: "Impact",      label: "No blocking downstream impacts",        pass: blockingImpacts === 0, warn: blockingImpacts > 0, specRef: "§6.2" },
  ];
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["overview","pfcs","sops","measures","ownership","versions","impact","history"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = {
  overview:"Overview", pfcs:"PFCs", sops:"SOPs", measures:"Measures",
  ownership:"Ownership", versions:"Versions", impact:"Impact", history:"History",
};

// ─── Activate Modal with §6.3 Override Model ─────────────────────────────────
function ActivateModal({ proc, linkedMeasures, onClose }: { proc: Process; linkedMeasures: typeof measures; onClose: () => void }) {
  const [step, setStep]           = useState<"check" | "override">("check");
  const [justification, setJust]  = useState("");
  const [approverNote, setNote]   = useState("");
  const blocking = impactItems.filter(i => i.isBlocking && i.status === "Pending");

  const impactedSOPs      = impactItems.filter(i => i.objectType === "SOP" && i.status === "Pending");
  const impactedMeasures  = impactItems.filter(i => i.objectType === "Measure" && i.status === "Pending");
  const impactedOther     = impactItems.filter(i => !["SOP","Measure"].includes(i.objectType) && i.status === "Pending");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,28,46,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:560, maxHeight:"90vh", background:"#fff", borderRadius:10, overflow:"hidden", boxShadow:"0 28px 70px rgba(0,0,0,0.28)", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"13px 18px", background: step==="override" ? "#7c2d12" : "#0f172a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#f1f5f9", fontSize:13, fontWeight:600 }}>
              {step==="override" ? "Override & Activate — Justification Required" : "Activate Process Standard"}
            </div>
            <div style={{ color:"#64748b", fontSize:10, marginTop:1 }}>{proc.code} · {proc.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:20 }}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
          {/* Object summary */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:6, padding:"10px 14px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              { l:"PFCs",     v: proc.linkedPFCs.toString() },
              { l:"SOPs",     v: proc.linkedSOPs.toString() },
              { l:"Measures", v: linkedMeasures.length.toString() },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{v}</div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* §6.2 Impact Awareness — Impacted objects */}
          <div>
            <div style={{ fontSize:11, fontWeight:600, color:"#475569", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Impact Awareness — Spec §6.2
            </div>
            {blocking.length > 0 && (
              <div className="alert-bar danger" style={{ marginBottom:8 }}>
                <ShieldAlert size={12} />
                <span><strong>{blocking.length} blocking impact{blocking.length > 1 ? "s" : ""} detected.</strong> Activation is blocked unless overridden with justification.</span>
              </div>
            )}
            {[
              { label:"Impacted SOPs",      items: impactedSOPs,     color:"#d97706", bg:"#fffbeb" },
              { label:"Impacted Measures",  items: impactedMeasures, color:"#7e22ce", bg:"#fdf4ff" },
              { label:"Other",              items: impactedOther,    color:"#64748b", bg:"#f1f5f9" },
            ].filter(g => g.items.length > 0).map(group => (
              <div key={group.label} style={{ marginBottom:6 }}>
                <div style={{ fontSize:10, fontWeight:600, color:group.color, marginBottom:4 }}>{group.label} ({group.items.length})</div>
                {group.items.map(item => {
                  const sev = { Blocking:{bg:"#fef2f2",color:"#dc2626"}, High:{bg:"#fff7ed",color:"#c2410c"}, Medium:{bg:"#fffbeb",color:"#d97706"}, Low:{bg:"#f0fdf4",color:"#15803d"} }[item.severity];
                  return (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 10px", background:item.isBlocking ? "#fff5f5" : "#fafafa", border:`1px solid ${item.isBlocking ? "#fca5a5" : "#e2e8f0"}`, borderRadius:5, marginBottom:3, fontSize:11 }}>
                      {item.isBlocking && <ShieldAlert size={11} color="#dc2626" />}
                      <span style={{ flex:1, color:"#334155" }}>{item.objectTitle}</span>
                      <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, background:sev?.bg, color:sev?.color }}>{item.severity}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* §6.3 Override Model */}
          {step === "override" && (
            <div style={{ background:"#fff7ed", border:"1.5px solid #fed7aa", borderRadius:7, padding:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#c2410c", marginBottom:8, display:"flex", alignItems:"center", gap:5 }}>
                <AlertTriangle size={12} /> Override Justification — Spec §6.3
              </div>
              <div style={{ fontSize:10, color:"#92400e", marginBottom:10 }}>
                This justification is permanently recorded. Fields captured: <code>override_flag=true</code>, <code>justification_text</code>, <code>approved_by</code>, <code>impacted_objects_snapshot</code>.
              </div>
              <div className="form-field" style={{ marginBottom:10 }}>
                <label>Justification Text <span style={{ color:"#dc2626" }}>*</span></label>
                <textarea
                  value={justification}
                  onChange={e => setJust(e.target.value)}
                  placeholder="Provide a clear business reason for overriding the impact warning. This cannot be undone…"
                  style={{ minHeight:80 }}
                />
                {justification.length > 0 && justification.length < 20 && (
                  <span style={{ fontSize:10, color:"#dc2626" }}>{20 - justification.length} more characters required</span>
                )}
              </div>
              <div className="form-field">
                <label>Approver Note <span style={{ fontSize:10, fontWeight:400, color:"#94a3b8" }}>(optional)</span></label>
                <input value={approverNote} onChange={e => setNote(e.target.value)} placeholder="Approver comment if separate authorization required…" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding:"11px 16px", borderTop:"1px solid #e2e8f0", background:"#f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexShrink:0 }}>
          {step === "check" ? (
            <>
              <button className="dwm-btn dwm-btn-ghost" onClick={onClose}>Cancel</button>
              <div style={{ display:"flex", gap:8 }}>
                {blocking.length > 0 && (
                  <button className="dwm-btn" style={{ background:"#fff7ed", color:"#c2410c", border:"1.5px solid #fed7aa", fontSize:12, padding:"5px 12px", borderRadius:5, cursor:"pointer", display:"flex", gap:5, alignItems:"center" }} onClick={() => setStep("override")}>
                    <AlertTriangle size={12} /> Override &amp; Activate
                  </button>
                )}
                <button
                  className="dwm-btn"
                  disabled={blocking.length > 0}
                  style={{ background: blocking.length===0 ? "#15803d" : "#e2e8f0", color: blocking.length===0 ? "#fff" : "#94a3b8", border:"none", fontSize:12, padding:"5px 14px", borderRadius:5, cursor: blocking.length===0 ? "pointer" : "not-allowed", display:"flex", gap:5, alignItems:"center", fontWeight:600 }}
                  onClick={onClose}
                >
                  <CheckCircle2 size={12} /> Activate
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="dwm-btn dwm-btn-ghost" onClick={() => setStep("check")}>← Back</button>
              <button
                className="dwm-btn"
                disabled={justification.length < 20}
                onClick={onClose}
                style={{ background: justification.length >= 20 ? "#c2410c" : "#e2e8f0", color: justification.length >= 20 ? "#fff" : "#94a3b8", border:"none", fontSize:12, padding:"5px 14px", borderRadius:5, cursor: justification.length >= 20 ? "pointer" : "not-allowed", display:"flex", gap:5, alignItems:"center", fontWeight:600 }}
              >
                <AlertTriangle size={12} /> Confirm Override &amp; Activate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export const ProcessDesignerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId]           = useState(processes[0].id);
  const [activeTab, setActiveTab]             = useState<Tab>("overview");
  const [showSelector, setShowSelector]       = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showLinkSOPMenu, setShowLinkSOPMenu] = useState(false);

  const proc        = processes.find(p => p.id === selectedId) ?? processes[0];
  const linkedPFCs  = pfcs.filter(p => p.processId === proc.id);
  const linkedSOPs  = sops.filter(s => s.linkedProcessCode === proc.code);
  const pVersions   = processVersions.filter(v => v.processId === proc.id);
  const activeVer   = pVersions.find(v => v.status === "Active" || v.status === "Effective") ?? pVersions[pVersions.length - 1];
  const pfcIds      = linkedPFCs.map(p => p.id);
  const allMLIds    = Array.from(new Set([
    ...measureLinks.filter(l => l.objectType === "Process" && l.objectId === proc.id).map(l => l.measureId),
    ...measureLinks.filter(l => l.objectType === "PFC" && pfcIds.includes(l.objectId)).map(l => l.measureId),
  ]));
  const linkedMeasures = allMLIds.map(id => measures.find(m => m.id === id)).filter(Boolean) as typeof measures;
  const validation     = buildValidation(proc, linkedPFCs, linkedSOPs, linkedMeasures);
  const valFails       = validation.filter(v => !v.pass);
  const hasOwnerGap    = proc.resolvedOwner === "Not Resolved";

  // Audit events grouped
  const procAuditEvents = auditEvents.filter(e => ["PFC","SOP","Process"].includes(e.objectType)).slice(0, 14);

  return (
    <div className="screen-shell">

      {/* ── Header ── */}
      <div style={{ padding:"9px 16px", background:"#fff", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:10, flexShrink:0, position:"relative", minHeight:52 }}>
        <div className="ph-icon" style={{ flexShrink:0 }}><GitBranch size={16} /></div>

        {/* Process selector — fixed two-row layout */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, overflow:"hidden" }}>
            <button
              onClick={() => setShowSelector(s => !s)}
              style={{ display:"inline-flex", alignItems:"center", gap:5, background:"none", border:"1px solid #e2e8f0", borderRadius:5, padding:"3px 10px", cursor:"pointer", fontFamily:"var(--dwm-font)", flexShrink:0, maxWidth:280 }}
            >
              <span style={{ fontSize:13, fontWeight:600, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{proc.name}</span>
              <ChevronDown size={11} color="#64748b" style={{ flexShrink:0 }} />
            </button>
            <span style={{ fontFamily:"monospace", fontSize:10, color:"#1d4ed8", fontWeight:700, background:"#eff6ff", padding:"1px 6px", borderRadius:4, flexShrink:0 }}>{proc.code}</span>
            <StatusBadge status={proc.status as any} />
            <span style={{ fontSize:10, color:"#94a3b8", flexShrink:0, whiteSpace:"nowrap" }}>{proc.category} · {proc.criticality}</span>
            {hasOwnerGap && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:9, fontWeight:600, background:"#fef2f2", color:"#dc2626", padding:"2px 6px", borderRadius:4, border:"1px solid #fca5a5", flexShrink:0 }}>
                <ShieldAlert size={9} /> Gap
              </span>
            )}
            {valFails.length > 0 && (
              <span style={{ fontSize:9, fontWeight:600, background:"#fff7ed", color:"#c2410c", padding:"2px 6px", borderRadius:4, border:"1px solid #fed7aa", flexShrink:0 }}>
                {valFails.length} issues
              </span>
            )}
          </div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            Owner: {proc.ownerPosition} · {proc.resolvedOwner} · {proc.lastModified}
            {activeVer && <span style={{ marginLeft:6, color:"#1d4ed8", fontWeight:600 }}>{activeVer.versionNo}</span>}
          </div>
        </div>

        {/* Action buttons — never wrap, always right-aligned */}
        <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
          <button className="dwm-btn dwm-btn-ghost" style={{ padding:"4px 10px", fontSize:11 }}><Save size={11} /> Save</button>
          <button className="dwm-btn dwm-btn-ghost" style={{ padding:"4px 10px", fontSize:11 }}><AlertTriangle size={11} /> Validate</button>
          <button className="dwm-btn dwm-btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={() => setShowActivateModal(true)}><CheckCircle2 size={11} /> Activate</button>
          <button className="dwm-btn dwm-btn-primary" style={{ padding:"4px 10px", fontSize:11 }}><Send size={11} /> Submit</button>
        </div>

        {/* Process dropdown — anchored below the selector button */}
        {showSelector && (
          <div style={{ position:"absolute", top:"calc(100% + 2px)", left:46, zIndex:200, background:"#fff", border:"1px solid #e2e8f0", borderRadius:7, boxShadow:"0 8px 28px rgba(0,0,0,0.14)", width:380, maxHeight:320, overflowY:"auto" }}>
            <div style={{ padding:"7px 12px", fontSize:10, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f1f5f9" }}>Select Process</div>
            {processes.map(p => (
              <div key={p.id} onClick={() => { setSelectedId(p.id); setShowSelector(false); setActiveTab("overview"); }}
                style={{ padding:"8px 14px", cursor:"pointer", borderBottom:"1px solid #f1f5f9", background:p.id===selectedId?"#eff6ff":"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}
                onMouseEnter={e => { if(p.id!==selectedId)(e.currentTarget as HTMLElement).style.background="#f8fafc"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=p.id===selectedId?"#eff6ff":"#fff"; }}
              >
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                  <div style={{ fontSize:10, color:"#94a3b8", fontFamily:"monospace" }}>{p.code} · {p.category}</div>
                </div>
                <StatusBadge status={p.status as any} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lifecycle Pipeline — Spec §5.3 ── */}
      <LifecyclePipeline
        currentStatus={proc.status as any}
        submittedBy="Ravi Kumar"
        submittedAt={proc.status !== "Draft" ? "2026-01-20" : undefined}
        approvedBy={activeVer?.approvedBy}
        approvedAt={activeVer?.approvedAt}
        activatedAt={activeVer?.activatedAt}
      />

      {/* ── Tab bar — horizontally scrollable for 8 tabs ── */}
      <div
        className="tab-bar"
        style={{ background:"#fff", overflowX:"auto", overflowY:"hidden", flexWrap:"nowrap",
          scrollbarWidth:"none", msOverflowStyle:"none" } as React.CSSProperties}
      >
        {TABS.map(t => (
          <button key={t} className={`tb-tab ${activeTab===t?"active":""}`} onClick={() => setActiveTab(t)} style={{ flexShrink:0 }}>
            {TAB_LABELS[t]}
            {t==="pfcs"     && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{linkedPFCs.length}</span>}
            {t==="sops"     && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{linkedSOPs.length}</span>}
            {t==="measures" && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{linkedMeasures.length}</span>}
            {t==="versions" && <span style={{ marginLeft:4, background:"#e2e8f0", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>{pVersions.length}</span>}
            {t==="impact" && impactItems.some(i=>i.isBlocking&&i.status==="Pending") && <span style={{ marginLeft:4, background:"#dc2626", color:"#fff", borderRadius:8, padding:"0 5px", fontSize:10, lineHeight:"16px" }}>!</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab==="overview" && (
          <div style={{ display:"flex", flex:1, overflow:"hidden", minWidth:0 }}>
            <div className="content-area" style={{ flex:1, minWidth:0 }}>
              {/* Process metadata */}
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title"><GitBranch size={13} color="#2563eb" /> Process Information</div></div>
                <div style={{ padding:16 }}>
                  <div className="form-grid form-grid-2">
                    <div className="form-field"><label>Process Code</label><input defaultValue={proc.code} readOnly style={{ background:"#f8fafc", fontFamily:"monospace" }} /></div>
                    <div className="form-field"><label>Process Name *</label><input defaultValue={proc.name} /></div>
                    <div className="form-field" style={{ gridColumn:"1/-1" }}><label>Description</label><textarea defaultValue={`Standard process for ${proc.name} at Chennai Assembly.`} style={{ minHeight:56 }} /></div>
                    <div className="form-field"><label>Category</label>
                      <select defaultValue={proc.category}><option>Manufacturing</option><option>Quality</option><option>Maintenance</option><option>Logistics</option><option>Safety</option></select>
                    </div>
                    <div className="form-field"><label>Criticality</label>
                      <select defaultValue={proc.criticality}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
                    </div>
                    <div className="form-field"><label>Owner Position *</label><input defaultValue={proc.ownerPosition} /></div>
                    <div className="form-field"><label>Effective From</label><input type="date" defaultValue="2026-02-15" /></div>
                    {/* Applicability rules per spec §10 */}
                    <div className="form-field"><label>Site Type Scope</label>
                      <select defaultValue="All"><option>All</option><option>Assembly</option><option>CKD</option><option>SKD</option></select>
                    </div>
                    <div className="form-field"><label>Product Family</label>
                      <select defaultValue="All"><option>All</option><option>2-Wheeler</option><option>3-Wheeler</option><option>Commercial</option></select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Scope — Spec §10 */}
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Context Scope — Enterprise → Site → Shift</div></div>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {[
                      { label:"AcmeMfg Group", tier:"Enterprise" },
                      { label:"South India", tier:"Region" },
                      { label:"Chennai", tier:"Site" },
                      { label:"Assembly", tier:"Department" },
                      { label:"Line 1", tier:"Line" },
                      { label:"Line 2", tier:"Line" },
                      { label:"Day Shift", tier:"Shift" },
                      { label:"Night Shift", tier:"Shift" },
                    ].map(({ label, tier }) => (
                      <span key={label} title={tier} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:"#eff6ff", color:"#1d4ed8", border:"1px solid #bfdbfe", cursor:"default" }}>
                        {label}
                      </span>
                    ))}
                    <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"2px 8px" }}><Plus size={10} /> Add Scope</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar — fixed 260px, scrolls independently */}
            <div style={{ width:260, minWidth:260, borderLeft:"1px solid #e2e8f0", overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:10, flexShrink:0, background:"#fff" }}>
              {/* Object stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {[
                  { label:"PFCs",     value:proc.linkedPFCs,     color:"#1d4ed8", icon:Layers },
                  { label:"SOPs",     value:proc.linkedSOPs,     color:"#15803d", icon:BookOpen },
                  { label:"Measures", value:proc.linkedMeasures, color:"#7e22ce", icon:ChartBar },
                  { label:"Yokoten",  value:2,                   color:"#0f766e", icon:GitBranch },
                ].map(({ label, value, color, icon:Icon }) => (
                  <div key={label} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                    <Icon size={12} color={color} />
                    <div style={{ fontSize:17, fontWeight:700, color, margin:"2px 0" }}>{value}</div>
                    <div style={{ fontSize:9, color:"#94a3b8", textTransform:"uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Ownership resolution — §2.3 */}
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:6, padding:"8px 10px" }}>
                <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#94a3b8", marginBottom:5 }}>Ownership</div>
                <OwnershipResolutionBadge
                  state={deriveOwnershipState(proc.resolvedOwner)}
                  position={proc.ownerPosition}
                  person={proc.resolvedOwner}
                  navigable
                />
                <div style={{ fontSize:10, color:"#64748b", marginTop:4 }}>{proc.resolvedOwner !== "Not Resolved" ? proc.resolvedOwner : "No person assigned"}</div>
              </div>

              {/* §11 Validation — using unified panel (compact) */}
              <UnifiedValidationPanel
                issues={buildSystemValidationIssues().filter(i =>
                  i.objectCode === proc.code ||
                  linkedSOPs.some(s => i.objectCode === s.code) ||
                  linkedPFCs.some(p => i.objectCode === p.code)
                )}
                title={`Validation — §11 (${valFails.length} issues)`}
                compact
                filterable={false}
              />

              {/* Quick actions */}
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <button className="dwm-btn dwm-btn-primary" style={{ justifyContent:"center", fontSize:11 }}><Layers size={11} /> Open PFC Designer</button>
                <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent:"center", fontSize:11 }} onClick={() => { setActiveTab("versions"); setShowRevisionModal(true); }}><RotateCcw size={11} /> Create Revision</button>
                <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent:"center", fontSize:11 }}><GitCompare size={11} /> Compare Versions</button>
              </div>

              {/* Criticality chip */}
              <div style={{ background:CRIT[proc.criticality]?.bg, border:`1px solid ${CRIT[proc.criticality]?.color}40`, borderRadius:6, padding:"7px 12px" }}>
                <div style={{ fontSize:9, fontWeight:600, textTransform:"uppercase", color:"#94a3b8", marginBottom:3 }}>Criticality</div>
                <span style={{ fontSize:12, fontWeight:700, color:CRIT[proc.criticality]?.color }}>{proc.criticality}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PFCs ═══ */}
        {activeTab==="pfcs" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:11, color:"#94a3b8" }}>{linkedPFCs.length} PFC{linkedPFCs.length!==1?"s":""} · §11.1: Process must have ≥1 PFC {linkedPFCs.length===0 ? "⚠ None defined" : "✓"}</span>
              <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }}><Plus size={11} /> Create PFC</button>
            </div>
            {linkedPFCs.length===0 ? (
              <div className="alert-bar warning"><AlertTriangle size={12} /><span><strong>Structural Validation (§11.1):</strong> This process must have at least one PFC before it can be submitted for approval.</span></div>
            ) : null}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {linkedPFCs.map(pfc => {
                const nodeCount = pfc.nodes.length;
                const hasStart  = pfc.nodes.some(n => n.type==="Start");
                const hasEnd    = pfc.nodes.some(n => n.type==="End");
                const sopCount  = pfc.nodes.filter(n => n.linkedSOP).length;
                const critCount = pfc.nodes.filter(n => n.criticalFlag).length;
                return (
                  <div key={pfc.id} style={{ border:"1px solid #e2e8f0", borderRadius:7, overflow:"hidden", background:"#fff" }}>
                    <div style={{ padding:"10px 14px", background:"#fafafa" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <div style={{ fontSize:10, fontFamily:"monospace", fontWeight:600, color:"#1d4ed8" }}>{pfc.code}</div>
                          <div style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginTop:1 }}>{pfc.name}</div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{pfc.version} · {pfc.ownerPosition} · {pfc.resolvedOwner}</div>
                        </div>
                        <StatusBadge status={pfc.status as any} />
                      </div>
                      {nodeCount > 0 && (
                        <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap" }}>
                          {[
                            { label:"Nodes",      value:nodeCount,    color:"#1d4ed8" },
                            { label:"Critical",   value:critCount,    color:"#dc2626" },
                            { label:"SOP-linked", value:sopCount,     color:"#15803d" },
                          ].map(s => (
                            <div key={s.label} style={{ display:"flex", gap:4, alignItems:"center" }}>
                              <span style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.value}</span>
                              <span style={{ fontSize:10, color:"#94a3b8" }}>{s.label}</span>
                            </div>
                          ))}
                          {/* §11.1 start/end validation */}
                          {nodeCount > 0 && (
                            <>
                              <span style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:hasStart?"#f0fdf4":"#fef2f2", color:hasStart?"#15803d":"#dc2626", border:`1px solid ${hasStart?"#bbf7d0":"#fca5a5"}` }}>
                                {hasStart ? "✓ Start" : "✗ No Start Node"}
                              </span>
                              <span style={{ fontSize:9, fontWeight:600, padding:"1px 5px", borderRadius:3, background:hasEnd?"#f0fdf4":"#fef2f2", color:hasEnd?"#15803d":"#dc2626", border:`1px solid ${hasEnd?"#bbf7d0":"#fca5a5"}` }}>
                                {hasEnd ? "✓ End" : "✗ No End Node"}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ padding:"6px 10px", borderTop:"1px solid #e2e8f0", background:"#fff", display:"flex", gap:5 }}>
                      <button className="dwm-btn dwm-btn-primary" style={{ flex:1, justifyContent:"center", fontSize:10 }}><Layers size={10} /> Open Designer</button>
                      <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10 }}>Impact</button>
                      <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10 }}>History</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SOPs ═══ — Process = orchestration layer only (UX Refinement §2) ═══ */}
        {activeTab==="sops" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            {/* Authoring role banner */}
            <div className="alert-bar info" style={{ marginBottom:8 }}>
              <BookOpen size={12} />
              <span><strong>Process Designer — Orchestration Layer:</strong> Link and orchestrate SOPs used in this process. To <em>create</em> SOP definitions, use the SOP Editor.</span>
              <button className="dwm-btn dwm-btn-ghost" style={{ marginLeft:"auto", fontSize:10, padding:"2px 8px" }} onClick={() => navigate("/sop-editor")}><ExternalLink size={10} /> SOP Editor</button>
            </div>

            {/* Toolbar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <span style={{ fontSize:11, color:"#94a3b8" }}>{linkedSOPs.length} SOPs linked · §11.1: All SOPs must link to valid PFC node</span>
              {/* Corrected action: Link OR Create (opens SOP Editor) — no full creation inside */}
              <div style={{ display:"flex", gap:5, position:"relative" }}>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11 }} onClick={() => setShowLinkSOPMenu(s => !s)}>
                  <ExternalLink size={11} /> Link Existing SOP <ChevronDown size={10} />
                </button>
                <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }} onClick={() => navigate("/sop-editor")}>
                  <Plus size={11} /> Create SOP (Editor)
                </button>
                {showLinkSOPMenu && (
                  <div style={{ position:"absolute", top:"100%", right:0, zIndex:100, background:"#fff", border:"1px solid #e2e8f0", borderRadius:7, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", width:320, marginTop:3 }}>
                    <div style={{ padding:"7px 12px", fontSize:10, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f1f5f9" }}>
                      Link Existing SOP to this Process
                    </div>
                    <div style={{ padding:"6px 8px", borderBottom:"1px solid #f1f5f9" }}>
                      <input style={{ width:"100%", padding:"5px 8px", border:"1px solid #e2e8f0", borderRadius:5, fontSize:11 }} placeholder="Search SOPs…" />
                    </div>
                    {sops.filter(s => s.linkedProcessCode !== proc.code).slice(0,4).map(s => (
                      <div key={s.id}
                        style={{ padding:"7px 12px", cursor:"pointer", borderBottom:"1px solid #f8fafc", display:"flex", justifyContent:"space-between", alignItems:"center" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#fff"}
                        onClick={() => setShowLinkSOPMenu(false)}
                      >
                        <div>
                          <div style={{ fontSize:11, fontWeight:500, color:"#0f172a" }}>{s.title}</div>
                          <div style={{ fontSize:10, color:"#94a3b8", fontFamily:"monospace" }}>{s.code}</div>
                        </div>
                        <StatusBadge status={s.status as any} />
                      </div>
                    ))}
                    <div style={{ padding:"6px 12px", fontSize:10, color:"#94a3b8", textAlign:"center" }}>Or <span style={{ color:"#2563eb", cursor:"pointer" }} onClick={() => { setShowLinkSOPMenu(false); navigate("/sop-library"); }}>browse full SOP Library →</span></div>
                  </div>
                )}
              </div>
            </div>

            {linkedSOPs.some(s => !s.linkedPFC) && (
              <div className="alert-bar warning" style={{ marginBottom:8 }}><AlertTriangle size={12} /><span><strong>Structural issue (§11.1):</strong> {linkedSOPs.filter(s=>!s.linkedPFC).length} SOP(s) are not linked to a PFC node.</span></div>
            )}

            {/* Enhanced SOP card list with ownership + measure indicators */}
            {linkedSOPs.length === 0 ? (
              <div className="empty-state"><BookOpen size={26} className="es-icon" /><div className="es-title">No SOPs linked</div><div className="es-sub">Link existing SOPs or create a new one in the SOP Editor</div></div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {linkedSOPs.map(s => {
                  const ownerState = deriveOwnershipState(s.resolvedOwner);
                  const hasMeasures = s.linkedMeasures > 0;
                  const critSteps = s.steps.filter(st => st.criticality === "Critical").length;
                  return (
                    <div key={s.id} style={{ background:"#fff", border:`1px solid ${!s.linkedPFC?"#fde68a":"#e2e8f0"}`, borderRadius:7, overflow:"hidden" }}>
                      <div style={{ padding:"9px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                        <div style={{ flex:1, minWidth:200 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, color:"#1d4ed8" }}>{s.code}</span>
                            <span style={{ fontSize:12, fontWeight:600, color:"#0f172a" }}>{s.title}</span>
                            <StatusBadge status={s.status as any} />
                            {!s.linkedPFC && <span style={{ fontSize:9, fontWeight:600, color:"#dc2626", background:"#fef2f2", padding:"1px 5px", borderRadius:3, border:"1px solid #fca5a5" }}>⚠ No PFC Node</span>}
                          </div>
                          <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>
                            {s.version} · {s.steps.length} steps
                            {critSteps > 0 && <span style={{ marginLeft:6, color:"#dc2626" }}>· {critSteps} critical</span>}
                            {s.linkedPFC && <span style={{ marginLeft:6, color:"#15803d" }}>· PFC: {s.linkedPFC}</span>}
                          </div>
                        </div>

                        {/* Ownership indicator — §2.3 */}
                        <OwnershipResolutionBadge
                          state={ownerState}
                          position={s.ownerPosition}
                          person={s.resolvedOwner}
                          navigable
                          compact
                        />

                        {/* Measure linkage indicator — §8.1 */}
                        <div style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:4,
                          background: hasMeasures ? "#fdf4ff" : "#f1f5f9",
                          color: hasMeasures ? "#7e22ce" : "#94a3b8",
                          border: `1px solid ${hasMeasures ? "#e9d5ff" : "#e2e8f0"}` }}>
                          <ChartBar size={9} />
                          {hasMeasures ? `${s.linkedMeasures} Measures` : "No Measures"}
                        </div>

                        {/* Actions */}
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="dwm-btn dwm-btn-primary" style={{ fontSize:10, padding:"3px 9px" }} onClick={() => navigate("/sop-editor")}>
                            <ExternalLink size={9} /> Open Editor
                          </button>
                          <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"3px 7px" }}>Unlink</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ MEASURES ═══ */}
        {activeTab==="measures" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                {(["KPI","MP","MOP","CP"] as const).map(type => {
                  const cnt = linkedMeasures.filter(m => m.type===type).length;
                  if (!cnt) return null;
                  const tc = TYPE_C[type];
                  return <span key={type} style={{ padding:"1px 7px", borderRadius:4, fontSize:10, fontWeight:700, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>{type} ×{cnt}</span>;
                })}
                <span style={{ fontSize:11, color:"#94a3b8" }}>{linkedMeasures.length} measure{linkedMeasures.length!==1?"s":""} · §11.3</span>
              </div>
              <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }}><Plus size={11} /> Add Measure Link</button>
            </div>
            {linkedMeasures.length===0 ? (
              <div className="empty-state"><ChartBar size={26} className="es-icon" /><div className="es-title">No measures linked</div><div className="es-sub">Link KPIs or MPs to this process (optional per spec §8.2)</div></div>
            ) : (
              <div style={{ overflowX:"auto", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff" }}>
                <table className="dwm-table" style={{ minWidth:760 }}>
                  <thead><tr><th>Type</th><th>Code</th><th>Measure</th><th>Unit</th><th>Freq.</th><th>Target</th><th>Linked via</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {linkedMeasures.map(m => {
                      const tc = TYPE_C[m.type];
                      const links = measureLinks.filter(l => l.measureId===m.id && (
                        (l.objectType==="Process" && l.objectId===proc.id) || (l.objectType==="PFC" && pfcIds.includes(l.objectId))
                      ));
                      return (
                        <tr key={m.id}>
                          <td><span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>{m.type}</span></td>
                          <td><span style={{ fontFamily:"monospace", fontSize:11, fontWeight:600, color:"#1d4ed8", whiteSpace:"nowrap" }}>{m.code}</span></td>
                          <td><div className="td-primary" style={{ whiteSpace:"nowrap" }}>{m.name}</div></td>
                          <td><span className="td-secondary">{m.unitOfMeasure}</span></td>
                          <td><span className="td-secondary" style={{ whiteSpace:"nowrap" }}>{m.frequency}</span></td>
                          <td><span style={{ fontSize:11, fontWeight:600, color:"#15803d", whiteSpace:"nowrap" }}>{m.targetValue ?? "–"}{m.targetValue ? ` ${m.unitOfMeasure}` : ""}</span></td>
                          <td><div style={{ display:"flex", flexDirection:"column", gap:2 }}>{links.map(l => <span key={l.id} style={{ fontSize:9, fontWeight:600, padding:"1px 4px", borderRadius:3, background:l.objectType==="Process"?"#f0f9ff":"#f0fdf4", color:l.objectType==="Process"?"#0369a1":"#15803d" }}>{l.objectType}</span>)}</div></td>
                          <td><StatusBadge status={m.status as any} /></td>
                          <td><button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10, padding:"3px 8px" }}><ExternalLink size={10} /></button></td>
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
            <div style={{ maxWidth:620, display:"flex", flexDirection:"column", gap:12 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title"><Users size={13} color="#2563eb" /> Ownership — Spec §2.3 (Aligned with Module 1.2)</div></div>
                <div style={{ padding:14 }}>
                  <OwnershipCard ownerPosition={proc.ownerPosition} resolvedPerson={proc.resolvedOwner} context="Chennai / Assembly / Line 1" />
                  <div style={{ marginTop:10, padding:"8px 12px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:6, fontSize:11, color:"#64748b" }}>
                    Responsible person is resolved dynamically via Assignment Service based on context (enterprise→region→site). See Module 1.2 for ownership resolution rules.
                  </div>
                </div>
              </div>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Context Scope — Spec §10</div></div>
                <div style={{ padding:14 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Enterprise",  value:"AcmeMfg Group" },
                      { label:"Region",      value:"South India" },
                      { label:"Site",        value:"Chennai" },
                      { label:"Department",  value:"Assembly" },
                      { label:"Line Scope",  value:"Line 1, Line 2" },
                      { label:"Shift Scope", value:"Day, Night" },
                    ].map(({ label, value }) => (
                      <div key={label} className="detail-field"><div className="df-label">{label}</div><div className="df-value">{value}</div></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Governance Chain — Spec §5.3</div></div>
                <div style={{ padding:14 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Reviewer Position",  value:"QC Manager" },
                      { label:"Approver Position",  value:"Plant Manager" },
                      { label:"Override Policy",    value:"Requires Approval + Justification" },
                      { label:"Review Frequency",   value:"Annual" },
                    ].map(({ label, value }) => (
                      <div key={label} className="detail-field"><div className="df-label">{label}</div><div className="df-value">{value}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ VERSIONS ═══ */}
        {activeTab==="versions" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:6 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>{pVersions.length} version{pVersions.length!==1?"s":""}</span>
                <span style={{ fontSize:10, background:"#f1f5f9", color:"#64748b", padding:"1px 6px", borderRadius:3, whiteSpace:"nowrap" }}>
                  Revision traceability — Spec §7 (CRITICAL)
                </span>
              </div>
              <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize:11 }}><GitCompare size={11} /> Compare</button>
                <button className="dwm-btn dwm-btn-primary" style={{ fontSize:11 }} onClick={() => setShowRevisionModal(true)}><RotateCcw size={11} /> Create Revision</button>
              </div>
            </div>
            {pVersions.length===0 ? (
              <div className="empty-state"><Clock size={26} className="es-icon" /><div className="es-title">No versions found</div></div>
            ) : (
              <div style={{ overflowX:"auto", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff" }}>
                <table className="dwm-table" style={{ minWidth:900 }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace:"nowrap" }}>Version</th>
                      <th style={{ whiteSpace:"nowrap" }}>Status</th>
                      <th style={{ whiteSpace:"nowrap" }}>Source Type — §7</th>
                      <th style={{ whiteSpace:"nowrap", minWidth:200 }}>Revision Reason</th>
                      <th style={{ whiteSpace:"nowrap" }}>Created</th>
                      <th style={{ whiteSpace:"nowrap" }}>Approved By</th>
                      <th style={{ whiteSpace:"nowrap" }}>Activated</th>
                      <th style={{ whiteSpace:"nowrap" }}>Superseded</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...pVersions].reverse().map(v => {
                      const vs  = VER_STATUS[v.status] ?? { bg:"#f1f5f9", color:"#64748b" };
                      const src = v.revisionSourceType ? SRC_CFG[v.revisionSourceType] : null;
                      return (
                        <tr key={v.id}>
                          <td style={{ whiteSpace:"nowrap" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"#1d4ed8" }}>{v.versionNo}</span>
                              {v.overrideUsed && <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa" }}>Override</span>}
                            </div>
                          </td>
                          <td><span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:4, background:vs.bg, color:vs.color, whiteSpace:"nowrap" }}>{v.status}</span></td>
                          <td>
                            {src
                              ? <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:3, background:src.bg, color:src.color, whiteSpace:"nowrap" }}>{src.label}</span>
                              : <span style={{ fontSize:10, color:"#94a3b8" }}>–</span>
                            }
                          </td>
                          <td style={{ maxWidth:220 }}>
                            <span style={{ fontSize:11, color:"#475569", display:"block", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={v.revisionReason ?? v.changeNote}>
                              {v.revisionReason ?? v.changeNote}
                            </span>
                            {v.referenceMeasureId && <span style={{ fontSize:9, color:"#7e22ce" }}>Ref: {v.referenceMeasureId}</span>}
                          </td>
                          <td style={{ whiteSpace:"nowrap" }}><span className="td-secondary">{v.createdAt}</span><br /><span className="td-secondary">{v.createdBy}</span></td>
                          <td style={{ whiteSpace:"nowrap" }}><span className="td-secondary">{v.approvedBy ?? "–"}</span><br /><span className="td-secondary">{v.approvedAt ?? ""}</span></td>
                          <td style={{ whiteSpace:"nowrap" }}><span className="td-secondary">{v.activatedAt ?? "–"}</span></td>
                          <td style={{ whiteSpace:"nowrap" }}><span className="td-secondary">{v.supersededAt ?? "–"}</span></td>
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
              </div>
            )}
          </div>
        )}

        {/* ═══ IMPACT ═══ */}
        {activeTab==="impact" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            {/* §6.2 Impact Awareness summary */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
              {[
                { label:"Highest Severity", value:"Blocking", color:"#dc2626", bg:"#fef2f2" },
                { label:"Blocking Items",   value:impactItems.filter(i=>i.isBlocking&&i.status==="Pending").length.toString(), color:"#dc2626", bg:"#fef2f2" },
                { label:"Pending Items",    value:impactItems.filter(i=>i.status==="Pending").length.toString(), color:"#d97706", bg:"#fffbeb" },
                { label:"Total Impacted",   value:impactItems.length.toString(), color:"#1d4ed8", bg:"#eff6ff" },
              ].map(c => (
                <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.color}30`, borderRadius:6, padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:700, color:c.color }}>{c.value}</div>
                  <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* §6.2 Categorized impact — Impacted SOPs / Measures / Linked Processes */}
            {[
              { label:"Impacted SOPs",        items:impactItems.filter(i=>i.objectType==="SOP"),     color:"#d97706" },
              { label:"Impacted Measures",    items:impactItems.filter(i=>i.objectType==="Measure"), color:"#7e22ce" },
              { label:"Other Linked Objects", items:impactItems.filter(i=>!["SOP","Measure"].includes(i.objectType)), color:"#64748b" },
            ].map(group => group.items.length > 0 && (
              <div key={group.label} className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title" style={{ color:group.color }}>{group.label} ({group.items.length})</div></div>
                <table className="dwm-table">
                  <thead><tr><th>Object</th><th>ID</th><th>Severity</th><th>Action Required — Spec §6.2</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {group.items.sort((a,b)=>a.isBlocking?-1:1).map(item => {
                      const sev = {Blocking:{bg:"#fef2f2",color:"#dc2626"}, High:{bg:"#fff7ed",color:"#c2410c"}, Medium:{bg:"#fffbeb",color:"#d97706"}, Low:{bg:"#f0fdf4",color:"#15803d"}}[item.severity];
                      const sts = {Pending:{bg:"#fffbeb",color:"#d97706"}, Resolved:{bg:"#f0fdf4",color:"#15803d"}, Waived:{bg:"#f1f5f9",color:"#64748b"}}[item.status];
                      return (
                        <tr key={item.id} style={{ background:item.isBlocking?"#fff5f5":undefined }}>
                          <td><div className="td-primary">{item.objectTitle}</div>{item.isBlocking&&<span style={{ fontSize:9, color:"#dc2626", fontWeight:600 }}>⊘ Blocking activation</span>}</td>
                          <td><span style={{ fontFamily:"monospace", fontSize:10, color:"#64748b" }}>{item.objectId}</span></td>
                          <td><span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:3, background:sev?.bg, color:sev?.color }}>{item.severity}</span></td>
                          <td><span className="td-secondary">{item.actionRequired}</span></td>
                          <td><span style={{ fontSize:10, fontWeight:600, padding:"1px 6px", borderRadius:3, background:sts?.bg, color:sts?.color }}>{item.status}</span></td>
                          <td><button className="dwm-btn dwm-btn-ghost" style={{ fontSize:10 }}>Open</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {activeTab==="history" && (
          <div className="content-area" style={{ flex:1, minWidth:0 }}>
            <span style={{ fontSize:11, color:"#94a3b8", display:"block", marginBottom:8 }}>Audit trail for {proc.code} — all governed object changes</span>
            <div style={{ display:"flex", flexDirection:"column", gap:0, border:"1px solid #e2e8f0", borderRadius:7, overflow:"hidden", background:"#fff" }}>
              {procAuditEvents.map((evt, idx) => {
                const colors: Record<string,string> = { APPROVED:"#15803d", SUBMITTED:"#1d4ed8", REJECTED:"#dc2626", PUBLISHED:"#15803d", UPDATED:"#d97706", CREATED:"#0369a1", LINKED:"#7e22ce", RESOLVED:"#15803d", VERSION_CREATED:"#0369a1" };
                const color = colors[evt.action] ?? "#64748b";
                return (
                  <div key={evt.id} style={{ padding:"9px 14px", display:"flex", gap:10, alignItems:"flex-start", borderBottom:idx<procAuditEvents.length-1?"1px solid #f1f5f9":"none" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:`${color}15`, border:`1px solid ${color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <History size={11} color={color} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:6, alignItems:"baseline", flexWrap:"wrap" }}>
                        <span style={{ fontSize:11, fontWeight:600, color }}>{evt.action}</span>
                        <span style={{ fontSize:11, color:"#0f172a" }}>{evt.objectTitle}</span>
                        <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"monospace" }}>{evt.objectId}</span>
                      </div>
                      <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
                        {evt.actor} · {evt.timestamp}
                        {evt.reason && <span style={{ color:"#64748b" }}> · "{evt.reason}"</span>}
                      </div>
                      {(evt.oldValue || evt.newValue) && (
                        <div style={{ display:"flex", gap:7, marginTop:3 }}>
                          {evt.oldValue && <span style={{ fontSize:10, background:"#fef2f2", color:"#dc2626", padding:"1px 6px", borderRadius:3 }}>− {evt.oldValue}</span>}
                          {evt.newValue && <span style={{ fontSize:10, background:"#f0fdf4", color:"#15803d", padding:"1px 6px", borderRadius:3 }}>+ {evt.newValue}</span>}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize:9, color:"#94a3b8", flexShrink:0 }}>{evt.ipAddress}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {showActivateModal && (
        <ActivateModal proc={proc} linkedMeasures={linkedMeasures} onClose={() => setShowActivateModal(false)} />
      )}
      {showRevisionModal && (
        <CreateRevisionModal
          objectName={proc.name}
          objectCode={proc.code}
          objectType="Process"
          currentVersion={activeVer?.versionNo ?? "v1.0"}
          onClose={() => setShowRevisionModal(false)}
        />
      )}
    </div>
  );
};
