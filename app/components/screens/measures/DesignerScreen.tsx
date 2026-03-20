import React, { useState } from "react";
import {
  Save, Send, Plus, Trash2, Link2, GitBranch, Target, Settings,
  CheckCircle2, AlertCircle, Info, ArrowUpRight, ArrowDownLeft, Eye,
  BookOpen, ExternalLink, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { measures, Measure, impactItems } from "../../../../data/standardsData";
import {
  measureLinks, measureTargets, measureRelationships, ownershipMatrix,
  measureVersions, measureHistory, ResolutionStatus,
} from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";
import { TYPE_COLOR, CRIT_COLOR, RESOLVED_PERSONS, MEASURE_DESCRIPTIONS, getMeasureResolution } from "./LibraryScreen";
import { OwnershipResolutionBadge, deriveOwnershipState } from "../../shared/OwnershipResolutionBadge";

const TABS = ["overview","links","relationships","targets","source","ownership","versions","impact","history"] as const;
type Tab = typeof TABS[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview", links: "Links", relationships: "Relationships",
  targets: "Targets", source: "Source", ownership: "Ownership",
  versions: "Versions", impact: "Impact", history: "History",
};

const RES_STYLE: Record<ResolutionStatus, { bg: string; color: string; border: string }> = {
  "Resolved":        { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  "Ownership Gap":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  "Ambiguous":       { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  "Invalid Context": { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
};

const OBJ_TYPE_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  "Process":  { bg: "#f0f9ff", color: "#0369a1",  icon: "⟳" },
  "PFC":      { bg: "#f0fdf4", color: "#15803d",  icon: "⬡" },
  "SOP":      { bg: "#eff6ff", color: "#1e40af",  icon: "≡" },
  "SOP Step": { bg: "#fdf4ff", color: "#7e22ce",  icon: "→" },
  "Position": { bg: "#fff7ed", color: "#c2410c",  icon: "◎" },
};

// source configs
const SOURCE_FIELDS: Record<string, string[]> = {
  Manual:     ["Collection Method", "Manual Entry Form", "Timing Rule"],
  System:     ["Source System", "Source Entity", "Source Field", "Extraction Rule", "Transformation Rule"],
  Calculated: ["Aggregation Method", "Formula", "Calculation Trigger", "Contributing Measures"],
  Hybrid:     ["Source System", "Source Entity", "Manual Override Rule", "Formula"],
};

interface DesignerScreenProps {
  measure: Measure;
  onOpenGraph: () => void;
}

export const DesignerScreen: React.FC<DesignerScreenProps> = ({ measure, onOpenGraph }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedVersion, setSelectedVersion] = useState(0);

  const tc  = TYPE_COLOR[measure.type] ?? TYPE_COLOR.KPI;
  const cc  = CRIT_COLOR[measure.criticality] ?? CRIT_COLOR.Low;
  const res = getMeasureResolution(measure.id);
  const resS = RES_STYLE[res];

  const links    = measureLinks.filter(l => l.measureId === measure.id);
  const targets  = measureTargets.filter(t => t.measureId === measure.id);
  const parents  = measureRelationships.filter(r => r.fromId === measure.id);
  const children = measureRelationships.filter(r => r.toId   === measure.id);
  const ownership= ownershipMatrix.filter(r => r.measureId === measure.id);
  const versions = measureVersions.filter(v => v.measureId === measure.id);
  const history  = measureHistory.filter(h => h.measureId === measure.id);

  const getMeasure = (id: string) => measures.find(m => m.id === id);

  return (
    <div className="screen-shell">
      {/* Measure header */}
      <div style={{ padding: "10px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{measure.code}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{measure.type}</span>
              <StatusBadge status={measure.status as any} />
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cc.bg, color: cc.color }}>{measure.criticality}</span>
              {/* Unused measure flag — UX Refinement §4 */}
              {links.length === 0 && (
                <span title="Unused: not linked to any SOP step or process (§8.1)" style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <AlertTriangle size={9} /> Unused Measure
                </span>
              )}
              {/* Orphan Contribution flag: in graph (has relationships) but no operational links */}
              {links.filter(l => l.objectType === "SOP" || l.objectType === "SOP Step").length === 0 && (parents.length + children.length) > 0 && (
                <span title="Orphan Contribution: exists in measure graph but not used operationally" style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <AlertCircle size={9} /> Orphan Contribution
                </span>
              )}
              {measure.type === "KPI" && parents.length === 0 && children.length > 0 &&
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" }}>Root KPI</span>
              }
            </div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{measure.name}</h1>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {measure.ownerPosition} → <span style={{ fontWeight: 500 }}>{RESOLVED_PERSONS[measure.id] ?? "Not Resolved"}</span>
              <span style={{ margin: "0 6px", color: "#d1d5db" }}>·</span>
              {measure.unitOfMeasure} · {measure.frequency} · v{versions[versions.length - 1]?.versionNo ?? "1.0"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
            {/* Ownership resolution badge — §2.3 */}
            <OwnershipResolutionBadge
              state={deriveOwnershipState(RESOLVED_PERSONS[measure.id])}
              position={measure.ownerPosition}
              person={RESOLVED_PERSONS[measure.id]}
              navigable
              compact
            />
            {/* Cross-navigation — UX Refinement §4 */}
            {links.some(l => l.objectType === "SOP" || l.objectType === "SOP Step") && (
              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => navigate("/sop-editor")}>
                <BookOpen size={10} /> → SOP
              </button>
            )}
            {links.some(l => l.objectType === "Process") && (
              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => navigate("/process-designer")}>
                <ExternalLink size={10} /> → Process
              </button>
            )}
            <div style={{ padding: "4px 10px", borderRadius: 5, background: resS.bg, border: `1px solid ${resS.border}`, display: "flex", alignItems: "center", gap: 5 }}>
              {res === "Resolved" ? <CheckCircle2 size={12} color="#15803d" /> : <AlertCircle size={12} color={resS.color} />}
              <span style={{ fontSize: 11, fontWeight: 500, color: resS.color }}>{res}</span>
            </div>
            <button className="dwm-btn dwm-btn-ghost" onClick={onOpenGraph}><GitBranch size={12} /> Graph</button>
            <button className="dwm-btn dwm-btn-ghost"><Save size={12} /> Save</button>
            <button className="dwm-btn dwm-btn-primary"><Send size={12} /> Submit</button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar" style={{ background: "#fff" }}>
        {TABS.map(t => (
          <button key={t} className={`tb-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ flexShrink: 0 }}>
            {TAB_LABELS[t]}
            {t === "links"         && links.length     > 0 && <span className="ph-count" style={{ marginLeft: 5 }}>{links.length}</span>}
            {t === "targets"       && targets.length   > 0 && <span className="ph-count" style={{ marginLeft: 5 }}>{targets.length}</span>}
            {t === "relationships" && (parents.length + children.length) > 0 && <span className="ph-count" style={{ marginLeft: 5 }}>{parents.length + children.length}</span>}
          </button>
        ))}
      </div>

      <div className="content-area">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
          <div className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title"><Settings size={13} color="#2563eb" /> Measure Definition</div>
              <button className="ph-action">Edit</button>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Measure Code",  value: measure.code,          mono: true  },
                    { label: "Measure Name",  value: measure.name,          mono: false },
                    { label: "Measure Type",  value: measure.type,          mono: false },
                    { label: "Criticality",   value: measure.criticality,   mono: false },
                  ].map(({ label, value, mono }) => (
                    <div className="form-field" key={label}>
                      <label>{label}</label>
                      <input readOnly value={value} style={{ background: "#f8fafc", fontFamily: mono ? "monospace" : undefined }} />
                    </div>
                  ))}
                  <div className="form-field">
                    <label>Description</label>
                    <textarea readOnly value={MEASURE_DESCRIPTIONS[measure.id] ?? ""} style={{ background: "#f8fafc", minHeight: 72 }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Owner Position", value: measure.ownerPosition  },
                    { label: "Unit of Measure",value: measure.unitOfMeasure  },
                    { label: "Source Type",    value: measure.sourceType     },
                    { label: "Frequency",      value: measure.frequency      },
                    { label: "Last Modified",  value: measure.lastModified   },
                  ].map(({ label, value }) => (
                    <div className="form-field" key={label}>
                      <label>{label}</label>
                      <input readOnly value={value} style={{ background: "#f8fafc" }} />
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="form-field"><label>Target Value</label><input readOnly value={measure.targetValue ?? "—"} style={{ background: "#f8fafc" }} /></div>
                    <div className="form-field"><label>Lower Limit</label><input readOnly value={measure.lowerLimit ?? "—"} style={{ background: "#f8fafc" }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Usage Panel — UX Refinement §4 ── */}
          <div className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title"><Eye size={13} color="#7e22ce" /> Usage Panel <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>— Spec §8.1 · Define and manage measures used across SOP steps and processes</span></div>
            </div>
            {links.length === 0 ? (
              <div style={{ padding: 14 }}>
                <div className="alert-bar warning">
                  <AlertTriangle size={12} />
                  <span><strong>Unused Measure (§8.1):</strong> This measure is not linked to any SOP step, process, or PFC. Link it to enable traceability and operational tracking.</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Usage summary counters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  {[
                    { label: "Processes",  count: links.filter(l => l.objectType === "Process").length,  color: "#0369a1",  bg: "#f0f9ff" },
                    { label: "SOPs",       count: links.filter(l => l.objectType === "SOP").length,      color: "#1d4ed8",  bg: "#eff6ff" },
                    { label: "SOP Steps",  count: links.filter(l => l.objectType === "SOP Step").length, color: "#7e22ce",  bg: "#fdf4ff" },
                    { label: "PFCs",       count: links.filter(l => l.objectType === "PFC").length,      color: "#15803d",  bg: "#f0fdf4" },
                  ].map(u => (
                    <div key={u.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: u.bg, border: `1px solid ${u.color}30` }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: u.color }}>{u.count}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{u.label}</span>
                    </div>
                  ))}
                </div>
                {/* Detailed usage rows */}
                {links.map(l => {
                  const os = OBJ_TYPE_STYLE[l.objectType] ?? { bg: "#f8fafc", color: "#64748b", icon: "○" };
                  return (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "#f8fafc", borderRadius: 5, border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: os.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: os.color, flexShrink: 0 }}>{os.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: os.color }}>{l.objectType}</span>
                        <span style={{ fontSize: 11, color: "#0f172a", marginLeft: 7 }}>{l.objectName}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "#64748b" }}>{l.scopeType}</span>
                      <StatusBadge status={l.status as any} />
                      <button
                        className="dwm-btn dwm-btn-ghost"
                        style={{ fontSize: 10, padding: "2px 7px" }}
                        onClick={() => {
                          if (l.objectType === "SOP" || l.objectType === "SOP Step") navigate("/sop-editor");
                          else if (l.objectType === "Process") navigate("/process-designer");
                        }}
                      ><ExternalLink size={9} /> Go</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        )}

        {/* ── LINKS ── */}
        {activeTab === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><Link2 size={13} color="#2563eb" /> Linked Objects <span className="ph-count">{links.length}</span></div>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}><Plus size={11} /> Add Link</button>
              </div>
              <table className="dwm-table">
                <thead>
                  <tr><th>Object Type</th><th>Object ID / Name</th><th>Scope Type</th><th>Source Service</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr>
                </thead>
                <tbody>
                  {links.map(l => {
                    const os = OBJ_TYPE_STYLE[l.objectType] ?? { bg: "#f8fafc", color: "#64748b", icon: "○" };
                    return (
                      <tr key={l.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 4, background: os.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: os.color }}>{os.icon}</div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: os.color }}>{l.objectType}</span>
                          </div>
                        </td>
                        <td>
                          <div className="td-primary">{l.objectName}</div>
                          <div className="td-secondary">{l.objectId}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, background: "#f1f5f9", color: "#475569" }}>{l.scopeType}</span>
                        </td>
                        <td><span className="td-secondary">{l.sourceService}</span></td>
                        <td>
                          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: l.status === "Active" ? "#f0fdf4" : "#f1f5f9", color: l.status === "Active" ? "#15803d" : "#64748b", border: `1px solid ${l.status === "Active" ? "#86efac" : "#e2e8f0"}` }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                            <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "2px 8px" }}><Eye size={10} /></button>
                            <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "2px 8px", color: "#dc2626" }}><Trash2 size={10} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {links.length === 0 && (
                <div className="empty-state"><div className="es-title">No links defined</div><div className="es-sub">Link this measure to a Process, PFC, SOP, or Position</div></div>
              )}
            </div>
            <div className="alert-bar info">
              <Info size={13} />
              <span>Adding a link: choose object type → search and select → choose scope type → save. At least one link is required for activation.</span>
            </div>
          </div>
        )}

        {/* ── RELATIONSHIPS ── */}
        {activeTab === "relationships" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Parents - this measure contributes to */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <ArrowUpRight size={13} color="#15803d" />
                  <span style={{ color: "#15803d" }}>This measure contributes to</span>
                  <span className="ph-count">{parents.length}</span>
                </div>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}><Plus size={11} /> Add Parent</button>
              </div>
              {parents.length > 0 ? (
                <table className="dwm-table">
                  <thead><tr><th>Measure</th><th>Type</th><th>Relationship</th><th>Weight</th><th>Shared</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                  <tbody>
                    {parents.map(r => {
                      const parent = getMeasure(r.toId);
                      if (!parent) return null;
                      const ptc = TYPE_COLOR[parent.type];
                      return (
                        <tr key={r.id}>
                          <td>
                            <div className="td-primary">{parent.name}</div>
                            <div className="td-secondary">{parent.code}</div>
                          </td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ptc.bg, color: ptc.color }}>{parent.type}</span></td>
                          <td><span style={{ fontSize: 11, color: "#475569" }}>{r.type}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 50, height: 5, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
                                <div style={{ width: `${r.weight * 100}%`, height: "100%", background: "#2563eb", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{(r.weight * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td>
                            {r.shared && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #c084fc" }}>Shared</span>}
                          </td>
                          <td><StatusBadge status={parent.status as any} /></td>
                          <td style={{ textAlign: "right" }}>
                            <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "2px 8px" }}>Open</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: 20 }}><div className="es-title">No parent measures</div><div className="es-sub">This measure does not contribute to any parent measure (may be a root KPI)</div></div>
              )}
            </div>

            {/* Children - contributed by */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <ArrowDownLeft size={13} color="#7e22ce" />
                  <span style={{ color: "#7e22ce" }}>This measure is contributed by</span>
                  <span className="ph-count">{children.length}</span>
                </div>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}><Plus size={11} /> Add Child</button>
              </div>
              {children.length > 0 ? (
                <table className="dwm-table">
                  <thead><tr><th>Measure</th><th>Type</th><th>Relationship</th><th>Weight</th><th>Shared</th><th>Status</th></tr></thead>
                  <tbody>
                    {children.map(r => {
                      const child = getMeasure(r.fromId);
                      if (!child) return null;
                      const ctc = TYPE_COLOR[child.type];
                      return (
                        <tr key={r.id}>
                          <td>
                            <div className="td-primary">{child.name}</div>
                            <div className="td-secondary">{child.code}</div>
                          </td>
                          <td><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ctc.bg, color: ctc.color }}>{child.type}</span></td>
                          <td><span style={{ fontSize: 11, color: "#475569" }}>{r.type}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 50, height: 5, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
                                <div style={{ width: `${r.weight * 100}%`, height: "100%", background: "#7e22ce", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#7e22ce" }}>{(r.weight * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td>
                            {r.shared && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #c084fc" }}>Shared</span>}
                          </td>
                          <td><StatusBadge status={child.status as any} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: 20 }}><div className="es-title">No child measures</div><div className="es-sub">No measures contribute to this measure yet</div></div>
              )}
            </div>
          </div>
        )}

        {/* ── TARGETS ── */}
        {activeTab === "targets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title"><Target size={13} color="#2563eb" /> Targets & Thresholds <span className="ph-count">{targets.length}</span></div>
                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}><Plus size={11} /> Add Target</button>
              </div>
              <table className="dwm-table">
                <thead>
                  <tr>
                    <th>Type</th><th>Scope</th><th>Target</th><th>Lower Limit</th><th>Upper Limit</th>
                    <th>Warning</th><th>Critical</th><th>Effective From</th><th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map(t => {
                    const isActive = t.status === "Active";
                    return (
                      <tr key={t.id} style={{ background: isActive ? undefined : "#fafafa" }}>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                            background: t.targetType === "Standard" ? "#eff6ff" : t.targetType === "Stretch" ? "#f0fdf4" : "#fff7ed",
                            color:      t.targetType === "Standard" ? "#1e40af" : t.targetType === "Stretch" ? "#15803d" : "#c2410c",
                          }}>{t.targetType}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}>
                              {t.scopeLabel}
                            </span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{t.targetValue} <span style={{ fontSize: 10, fontWeight: 400, color: "#64748b" }}>{measure.unitOfMeasure}</span></span></td>
                        <td><span style={{ fontSize: 11, color: t.lowerLimit != null ? "#1d4ed8" : "#d1d5db" }}>{t.lowerLimit ?? "—"}</span></td>
                        <td><span style={{ fontSize: 11, color: t.upperLimit != null ? "#1d4ed8" : "#d1d5db" }}>{t.upperLimit ?? "—"}</span></td>
                        <td><span style={{ fontSize: 11, color: t.warningThreshold  != null ? "#d97706" : "#d1d5db" }}>{t.warningThreshold  ?? "—"}</span></td>
                        <td><span style={{ fontSize: 11, color: t.criticalThreshold != null ? "#dc2626" : "#d1d5db" }}>{t.criticalThreshold ?? "—"}</span></td>
                        <td><span className="td-secondary">{t.effectiveFrom}{t.effectiveTo ? ` → ${t.effectiveTo}` : ""}</span></td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 10,
                            background: isActive ? "#f0fdf4" : "#f1f5f9",
                            color:      isActive ? "#15803d" : "#64748b",
                            border:     `1px solid ${isActive ? "#86efac" : "#e2e8f0"}`,
                          }}>{t.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {targets.length === 0 && (
                <div className="alert-bar warning" style={{ margin: "10px 12px", borderRadius: 5 }}>
                  <AlertCircle size={13} /><span>No active targets defined. A target is required before this measure can be activated.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SOURCE ── */}
        {activeTab === "source" && (
          <div className="dwm-panel" style={{ maxWidth: 700 }}>
            <div className="dwm-panel-header">
              <div className="ph-title"><Settings size={13} color="#2563eb" /> Source Configuration</div>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-field">
                <label>Source Type *</label>
                <select defaultValue={measure.sourceType} style={{ maxWidth: 200 }}>
                  {["Manual","System","Calculated","Hybrid"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  {measure.sourceType} Source Fields
                </div>
                <div className="form-grid form-grid-2" style={{ gap: 10 }}>
                  {(SOURCE_FIELDS[measure.sourceType] ?? []).map((field, i) => (
                    <div className="form-field" key={i}>
                      <label>{field}</label>
                      {field === "Formula" || field === "Aggregation Method"
                        ? <textarea defaultValue={measure.formula ?? ""} style={{ minHeight: 60 }} />
                        : <input defaultValue={
                            field === "Source System"      ? "SAP ERP" :
                            field === "Source Entity"      ? "PP_PRODUCTION_ORDER" :
                            field === "Source Field"       ? "FIRST_PASS_COUNT / TOTAL_COUNT" :
                            field === "Extraction Rule"    ? "Daily batch at 23:55" :
                            field === "Transformation Rule"? "(passed / total) * 100" :
                            field === "Contributing Measures" ? "M-003 (Cycle Time), M-004 (Torque), M-005 (Kit Lead)" : ""
                          } />
                      }
                    </div>
                  ))}
                </div>
              </div>
              <button className="dwm-btn dwm-btn-primary" style={{ alignSelf: "flex-start" }}><Save size={12} /> Save Source Config</button>
            </div>
          </div>
        )}

        {/* ── OWNERSHIP ── */}
        {activeTab === "ownership" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, padding: "0 0 4px" }}>
              {[
                { label: "Resolved",       value: ownership.filter(r => r.resolutionStatus === "Resolved").length,       color: "#15803d" },
                { label: "Ownership Gaps", value: ownership.filter(r => r.resolutionStatus === "Ownership Gap").length,  color: "#dc2626" },
                { label: "Ambiguous",      value: ownership.filter(r => r.resolutionStatus === "Ambiguous").length,      color: "#d97706" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "5px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                </div>
              ))}
              <button className="dwm-btn dwm-btn-ghost" style={{ marginLeft: "auto", fontSize: 11 }}>Refresh Ownership</button>
            </div>
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">Ownership Matrix <span className="ph-count">{ownership.length} contexts</span></div>
              </div>
              <table className="dwm-table">
                <thead><tr><th>Region</th><th>Site</th><th>Dept</th><th>Line</th><th>Shift</th><th>Owner Position</th><th>Responsible Person</th><th style={{ textAlign: "center" }}>Status</th><th>Last Refreshed</th></tr></thead>
                <tbody>
                  {ownership.map(row => {
                    const rs = RES_STYLE[row.resolutionStatus];
                    return (
                      <tr key={row.id} style={{ background: row.resolutionStatus !== "Resolved" ? rs.bg + "88" : undefined }}>
                        <td><span className="td-secondary">{row.region}</span></td>
                        <td><span className="td-primary">{row.site}</span></td>
                        <td><span className="td-secondary">{row.department}</span></td>
                        <td><span className="td-secondary">{row.line}</span></td>
                        <td><span className="td-secondary">{row.shift}</span></td>
                        <td><span className="td-secondary">{row.ownerPosition}</span></td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 500, color: row.responsiblePerson === "Not Resolved" ? "#dc2626" : "#0f172a" }}>
                            {row.responsiblePerson}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                            {row.resolutionStatus}
                          </span>
                        </td>
                        <td><span className="td-secondary">{row.lastRefreshed}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {ownership.length === 0 && (
                <div className="empty-state" style={{ padding: 24 }}><div className="es-title">No ownership contexts defined</div></div>
              )}
            </div>
          </div>
        )}

        {/* ── VERSIONS ── */}
        {activeTab === "versions" && (
          <div style={{ display: "flex", gap: 12, flex: 1, overflow: "hidden" }}>
            {/* Version list */}
            <div className="dwm-panel" style={{ width: 260, flexShrink: 0, overflow: "hidden" }}>
              <div className="dwm-panel-header"><div className="ph-title"><GitBranch size={13} color="#2563eb" /> Versions <span className="ph-count">{versions.length}</span></div></div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {versions.map((v, i) => (
                  <div key={v.id} onClick={() => setSelectedVersion(i)}
                    style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: selectedVersion === i ? "#eff6ff" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: selectedVersion === i ? "#1d4ed8" : "#0f172a" }}>{v.versionNo}</span>
                      <StatusBadge status={v.status as any} />
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{v.createdBy}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{v.createdAt}</div>
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="empty-state" style={{ padding: 20 }}><div className="es-title">No versions found</div></div>
                )}
              </div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid #e2e8f0" }}>
                <button className="dwm-btn dwm-btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 11 }}><Plus size={11} /> Create Revision</button>
              </div>
            </div>

            {/* Version detail */}
            {versions[selectedVersion] && (
              <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
                <div className="dwm-panel-header">
                  <div className="ph-title">Version Detail: {versions[selectedVersion].versionNo}</div>
                  <StatusBadge status={versions[selectedVersion].status as any} />
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
                  {[
                    { label: "Version",       value: versions[selectedVersion].versionNo   },
                    { label: "Created At",    value: versions[selectedVersion].createdAt    },
                    { label: "Created By",    value: versions[selectedVersion].createdBy    },
                    { label: "Approved At",   value: versions[selectedVersion].approvedAt  ?? "—" },
                    { label: "Activated At",  value: versions[selectedVersion].activatedAt ?? "—" },
                    { label: "Change Summary",value: versions[selectedVersion].changeLog    },
                  ].map(({ label, value }) => (
                    <div key={label} className="detail-field">
                      <div className="df-label">{label}</div>
                      <div className="df-value">{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 6 }}>
                  <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}>Compare with Previous</button>
                  <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 11 }}>Open Snapshot</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── IMPACT ── */}
        {activeTab === "impact" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Impacted Objects", value: impactItems.length,                                               color: "#1d4ed8" },
                { label: "Blocking",         value: impactItems.filter(i => i.isBlocking).length,                     color: "#dc2626" },
                { label: "Pending",          value: impactItems.filter(i => i.status === "Pending").length,           color: "#d97706" },
                { label: "Resolved",         value: impactItems.filter(i => i.status === "Resolved").length,          color: "#15803d" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
                </div>
              ))}
            </div>
            <div className="dwm-panel">
              <div className="dwm-panel-header"><div className="ph-title">Impact Objects</div></div>
              <table className="dwm-table">
                <thead><tr><th>Object Type</th><th>Object</th><th>Severity</th><th>Action Required</th><th>Status</th></tr></thead>
                <tbody>
                  {impactItems.map(item => (
                    <tr key={item.id}>
                      <td><span className="td-secondary">{item.objectType}</span></td>
                      <td>
                        <div className="td-primary">{item.objectTitle}</div>
                        <div className="td-secondary">{item.objectId}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3,
                          background: item.severity === "Blocking" ? "#fef2f2" : item.severity === "High" ? "#fff7ed" : item.severity === "Medium" ? "#fffbeb" : "#f0fdf4",
                          color:      item.severity === "Blocking" ? "#dc2626" : item.severity === "High" ? "#c2410c" : item.severity === "Medium" ? "#d97706" : "#15803d",
                        }}>{item.severity}</span>
                      </td>
                      <td><span className="td-secondary">{item.actionRequired}</span></td>
                      <td><StatusBadge status={item.status as any} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="dwm-panel">
            <div className="dwm-panel-header"><div className="ph-title">Audit History <span className="ph-count">{history.length}</span></div></div>
            <table className="dwm-table">
              <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Field Changed</th><th>Old Value</th><th>New Value</th><th>Reason</th></tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>{h.timestamp}</span></td>
                    <td><span className="td-primary">{h.actor}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: h.action === "APPROVED" ? "#f0fdf4" : h.action === "ACTIVATED" ? "#dcfce7" : h.action === "REJECTED" ? "#fef2f2" : "#eff6ff",
                        color:      h.action === "APPROVED" ? "#15803d" : h.action === "ACTIVATED" ? "#14532d" : h.action === "REJECTED" ? "#dc2626" : "#1e40af",
                      }}>{h.action}</span>
                    </td>
                    <td><span className="td-secondary">{h.field ?? "—"}</span></td>
                    <td>{h.oldValue ? <span className="diff-removed" style={{ fontSize: 10 }}>{h.oldValue}</span> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    <td>{h.newValue ? <span className="diff-added"   style={{ fontSize: 10 }}>{h.newValue}</span> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                    <td><span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>{h.reason ?? "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};