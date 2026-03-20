import React, { useState } from "react";
import {
  CheckCircle2, AlertCircle, AlertTriangle, Users, Target,
  GitBranch, ArrowUpRight, ArrowDownLeft, MessageSquare, Info,
} from "lucide-react";
import { measures, Measure, impactItems } from "../../../../data/standardsData";
import {
  measureTargets, ownershipMatrix, measureVersions,
  measureRelationships, measureLinks, versionCompareData, ResolutionStatus,
} from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";
import { TYPE_COLOR, CRIT_COLOR } from "./LibraryScreen";

// ─── Shared styles ────────────────────────────────────────────────────────────
const RES_STYLE: Record<ResolutionStatus, { bg: string; color: string; border: string; rowBg: string }> = {
  "Resolved":        { bg: "#f0fdf4", color: "#15803d", border: "#86efac", rowBg: "transparent"  },
  "Ownership Gap":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", rowBg: "#fef2f2"      },
  "Ambiguous":       { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", rowBg: "#fffbeb"      },
  "Invalid Context": { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", rowBg: "#f8fafc"      },
};

// ─── Ownership Matrix Workbench ───────────────────────────────────────────────
export const OwnershipWorkbench: React.FC = () => {
  const [filterSite,   setFilterSite]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMeasure,setFilterMeasure]= useState("All");

  const sites    = Array.from(new Set(ownershipMatrix.map(r => r.site)));
  const statuses = ["All", "Resolved", "Ownership Gap", "Ambiguous", "Invalid Context"];

  const filtered = ownershipMatrix.filter(r => {
    const matchSite   = filterSite    === "All" || r.site              === filterSite;
    const matchStatus = filterStatus  === "All" || r.resolutionStatus  === filterStatus;
    const matchM      = filterMeasure === "All" || r.measureId         === filterMeasure;
    return matchSite && matchStatus && matchM;
  });

  const gaps       = ownershipMatrix.filter(r => r.resolutionStatus === "Ownership Gap").length;
  const ambiguous  = ownershipMatrix.filter(r => r.resolutionStatus === "Ambiguous").length;
  const resolved   = ownershipMatrix.filter(r => r.resolutionStatus === "Resolved").length;

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fdf4ff", color: "#7e22ce" }}><Users size={16} /></div>
        <div>
          <h1>Ownership Matrix Workbench</h1>
          <div className="ph-sub">Investigate ownership resolution across all enterprise contexts</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Refresh All</button>
          <button className="dwm-btn dwm-btn-ghost">Export</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterMeasure} onChange={e => setFilterMeasure(e.target.value)}>
          <option value="All">All Measures</option>
          {measures.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="filter-select" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
          <option value="All">All Sites</option>
          {sites.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === "All" ? "All Resolution Status" : s}</option>)}
        </select>
        <span className="fb-count">{filtered.length} ownership rows</span>
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[
          { label: "Resolved",       value: resolved,  color: "#15803d", Icon: CheckCircle2  },
          { label: "Ownership Gaps", value: gaps,      color: "#dc2626", Icon: AlertCircle   },
          { label: "Ambiguous",      value: ambiguous, color: "#d97706", Icon: AlertTriangle },
          { label: "Total Contexts", value: ownershipMatrix.length, color: "#1d4ed8", Icon: Users },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
            <Icon size={13} color={color} />
            <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table className="dwm-table">
          <thead>
            <tr>
              <th>Measure</th><th>Region</th><th>Site</th><th>Dept</th><th>Line</th><th>Shift</th>
              <th>Owner Position</th><th>Responsible Person</th><th style={{ textAlign: "center" }}>Resolution</th><th>Last Refreshed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const m  = measures.find(m => m.id === row.measureId);
              const rs = RES_STYLE[row.resolutionStatus];
              const tc = m ? TYPE_COLOR[m.type] : TYPE_COLOR.KPI;
              return (
                <tr key={row.id} style={{ background: rs.rowBg }}>
                  <td>
                    {m && (
                      <div style={{ display: "flex", align: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{m.type}</span>
                        <span className="td-primary">{m.name}</span>
                      </div>
                    )}
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#94a3b8" }}>{row.measureId}</span>
                  </td>
                  <td><span className="td-secondary">{row.region}</span></td>
                  <td><span className="td-primary">{row.site}</span></td>
                  <td><span className="td-secondary">{row.department}</span></td>
                  <td><span className="td-secondary">{row.line}</span></td>
                  <td><span className="td-secondary">{row.shift}</span></td>
                  <td><span className="td-secondary">{row.ownerPosition}</span></td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 500, color: row.responsiblePerson === "Not Resolved" || row.responsiblePerson === "Multiple" ? rs.color : "#0f172a" }}>
                      {row.responsiblePerson}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, whiteSpace: "nowrap" }}>
                      {row.resolutionStatus}
                    </span>
                  </td>
                  <td><span className="td-secondary">{row.lastRefreshed}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Target Manager ──────────────────────────────────────────────���────────────
export const TargetManager: React.FC = () => {
  const [filterMeasure, setFilterMeasure] = useState("All");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [filterScope,   setFilterScope]   = useState("All");

  const scopes = Array.from(new Set(measureTargets.map(t => t.scopeLabel)));

  const filtered = measureTargets.filter(t => {
    return (filterMeasure === "All" || t.measureId === filterMeasure)
        && (filterStatus  === "All" || t.status    === filterStatus)
        && (filterScope   === "All" || t.scopeLabel === filterScope);
  });

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><Target size={16} /></div>
        <div>
          <h1>Target Manager</h1>
          <div className="ph-sub">Manage and review targets across all measures and contexts</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Bulk Edit</button>
          <button className="dwm-btn dwm-btn-primary">+ Add Target</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterMeasure} onChange={e => setFilterMeasure(e.target.value)}>
          <option value="All">All Measures</option>
          {measures.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="filter-select" value={filterScope} onChange={e => setFilterScope(e.target.value)}>
          <option value="All">All Scopes</option>
          {scopes.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["All","Active","Inactive","Superseded"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
        </select>
        <span className="fb-count">{filtered.length} of {measureTargets.length} targets</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table className="dwm-table">
          <thead>
            <tr>
              <th>Measure</th><th>Type</th><th>Scope</th><th>Target Value</th>
              <th>Lower</th><th>Upper</th><th>Warning</th><th>Critical</th>
              <th>Effective From</th><th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const m  = measures.find(m => m.id === t.measureId);
              const tc = m ? TYPE_COLOR[m.type] : TYPE_COLOR.KPI;
              const isActive = t.status === "Active";
              return (
                <tr key={t.id} style={{ background: isActive ? undefined : "#fafafa" }}>
                  <td>
                    {m && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: tc.bg, color: tc.color }}>{m.type}</span>
                      <div>
                        <div className="td-primary">{m.name}</div>
                        <div className="td-secondary">{m.code}</div>
                      </div>
                    </div>}
                  </td>
                  <td>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      background: t.targetType === "Standard" ? "#eff6ff" : t.targetType === "Stretch" ? "#f0fdf4" : "#fff7ed",
                      color:      t.targetType === "Standard" ? "#1e40af" : t.targetType === "Stretch" ? "#15803d" : "#c2410c",
                    }}>{t.targetType}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd" }}>
                      {t.scopeLabel}
                    </span>
                  </td>
                  <td><span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{t.targetValue}</span>  <span style={{ fontSize: 10, color: "#94a3b8" }}>{m?.unitOfMeasure}</span></td>
                  <td><span style={{ fontSize: 11, color: t.lowerLimit != null ? "#1d4ed8" : "#d1d5db" }}>{t.lowerLimit ?? "—"}</span></td>
                  <td><span style={{ fontSize: 11, color: t.upperLimit != null ? "#1d4ed8" : "#d1d5db" }}>{t.upperLimit ?? "—"}</span></td>
                  <td><span style={{ fontSize: 11, color: "#d97706" }}>{t.warningThreshold  ?? "—"}</span></td>
                  <td><span style={{ fontSize: 11, color: "#dc2626" }}>{t.criticalThreshold ?? "—"}</span></td>
                  <td><span className="td-secondary">{t.effectiveFrom}</span></td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
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
      </div>
    </div>
  );
};

// ─── Approval Review Screen ───────────────────────────────────────────────────
const MOCK_COMMENTS = [
  { id: 1, author: "Suresh Babu",    role: "Approver",          ts: "2026-03-12 09:45", text: "Reviewed the target structure. Chennai Line 1 stretch target is appropriate given recent performance trend.", avatar: "SB" },
  { id: 2, author: "Deepa Krishnan", role: "Measure Author",    ts: "2026-03-10 14:20", text: "Added SOP-004 link and PFC node reference as requested in previous cycle. Warning threshold calculated from 6-month moving average.", avatar: "DK" },
  { id: 3, author: "Priya Nair",     role: "Governance Review", ts: "2026-03-09 10:00", text: "Ownership resolution for Chennai Line 2 is pending. Assignment gap needs to be resolved before activation.", avatar: "PN" },
];

export const MeasureApprovalReview: React.FC<{ measure: Measure }> = ({ measure }) => {
  const [commentText, setCommentText] = useState("");
  const tc  = TYPE_COLOR[measure.type];
  const cc  = CRIT_COLOR[measure.criticality];
  const links    = measureLinks.filter(l => l.measureId === measure.id);
  const targets  = measureTargets.filter(t => t.measureId === measure.id && t.status === "Active");
  const parents  = measureRelationships.filter(r => r.fromId === measure.id);
  const children = measureRelationships.filter(r => r.toId   === measure.id);
  const versions = measureVersions.filter(v => v.measureId === measure.id);
  const currentV = versions[versions.length - 1];

  const validationChecks = [
    { label: "Measure code and name defined",   pass: true,             detail: "KPI-001 · First Pass Yield"            },
    { label: "Owner position assigned",         pass: true,             detail: measure.ownerPosition                   },
    { label: "At least one link exists",        pass: links.length > 0, detail: `${links.length} linked objects`        },
    { label: "Active target defined",           pass: targets.length>0, detail: `${targets.length} active target(s)`   },
    { label: "Graph relationship defined",      pass: parents.length>0, detail: `Contributes to ${parents.length} parent(s)` },
    { label: "No orphan ownership contexts",    pass: false,            detail: "Chennai Line 2 – Ownership Gap"        },
  ];

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><CheckCircle2 size={16} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1>Measure Approval Review</h1>
            <StatusBadge status={measure.status as any} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{currentV?.versionNo ?? "v1.0"}</span>
          </div>
          <div className="ph-sub">{measure.code} · {measure.name} · {measure.ownerPosition} → Deepa Krishnan (Author)</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Measure summary */}
        <div className="dwm-panel">
          <div className="dwm-panel-header"><div className="ph-title">Measure Summary</div></div>
          <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Code",     value: measure.code,          mono: true  },
              { label: "Type",     value: measure.type,          mono: false },
              { label: "Unit",     value: measure.unitOfMeasure, mono: false },
              { label: "Frequency",value: measure.frequency,     mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: mono ? "monospace" : undefined }}>{value}</div>
              </div>
            ))}
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{measure.type}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cc.bg, color: cc.color }}>{measure.criticality}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{measure.ownerPosition}</span>
              <span style={{ color: "#d1d5db", margin: "0 2px" }}>→</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#0f172a" }}>Ravi Kumar</span>
            </div>
          </div>
        </div>

        {/* Validation summary */}
        <div className="dwm-panel">
          <div className="dwm-panel-header">
            <div className="ph-title">
              <span>Validation Summary</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginLeft: 8 }}>
                {validationChecks.filter(c => !c.pass).length} issue(s)
              </span>
            </div>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {validationChecks.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 10px", borderRadius: 5,
                background: c.pass ? "#f0fdf4" : "#fef2f2", border: `1px solid ${c.pass ? "#bbf7d0" : "#fca5a5"}` }}>
                <span style={{ fontSize: 14, color: c.pass ? "#15803d" : "#dc2626", flexShrink: 0, lineHeight: 1.3 }}>{c.pass ? "✓" : "✗"}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: c.pass ? "#166534" : "#991b1b" }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-column summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Links summary */}
          <div className="dwm-panel">
            <div className="dwm-panel-header"><div className="ph-title">Links <span className="ph-count">{links.length}</span></div></div>
            <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
              {links.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#475569" }}>{l.objectType}</span>
                  <span style={{ fontWeight: 500, color: "#0f172a", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.objectName}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Targets summary */}
          <div className="dwm-panel">
            <div className="dwm-panel-header"><div className="ph-title">Active Targets <span className="ph-count">{targets.length}</span></div></div>
            <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
              {targets.map(t => (
                <div key={t.id} style={{ fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>{t.scopeLabel}</span>
                    <span style={{ fontWeight: 700, color: "#15803d" }}>{t.targetValue} {measure.unitOfMeasure}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Relationships summary */}
          <div className="dwm-panel">
            <div className="dwm-panel-header"><div className="ph-title">Relationships <span className="ph-count">{parents.length + children.length}</span></div></div>
            <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
              {parents.map(r => {
                const pm = measures.find(m => m.id === r.toId);
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                    <ArrowUpRight size={11} color="#15803d" />
                    <span style={{ color: "#475569" }}>{pm?.name ?? r.toId}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", marginLeft: "auto" }}>{(r.weight * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
              {children.map(r => {
                const cm = measures.find(m => m.id === r.fromId);
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                    <ArrowDownLeft size={11} color="#7e22ce" />
                    <span style={{ color: "#475569" }}>{cm?.name ?? r.fromId}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", marginLeft: "auto" }}>{(r.weight * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comments thread */}
        <div className="dwm-panel">
          <div className="dwm-panel-header"><div className="ph-title"><MessageSquare size={13} color="#2563eb" /> Review Comments <span className="ph-count">{MOCK_COMMENTS.length}</span></div></div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_COMMENTS.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10 }}>
                <div className="dwm-avatar sm" style={{ background: "#1e40af", flexShrink: 0 }}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{c.author}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f1f5f9", color: "#64748b" }}>{c.role}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>{c.ts}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
              <textarea
                value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a review comment…"
                style={{ flex: 1, padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 12, fontFamily: "var(--dwm-font)", resize: "none", minHeight: 56 }}
              />
              <button className="dwm-btn dwm-btn-primary" style={{ alignSelf: "flex-end" }}>Post</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="approval-action-bar">
        <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>Review decision for <strong>{measure.code} · {currentV?.versionNo}</strong></span>
        <button className="dwm-btn btn-request-change" style={{ padding: "6px 16px" }}>Request Changes</button>
        <button className="dwm-btn btn-reject"          style={{ padding: "6px 16px" }}>Reject</button>
        <button className="dwm-btn btn-approve"         style={{ padding: "6px 16px" }}>Approve</button>
      </div>
    </div>
  );
};

// ─── Version Compare Screen ───────────────────────────────────────────────────
export const MeasureVersionCompare: React.FC<{ measure: Measure }> = ({ measure }) => {
  const { left, right, sections } = versionCompareData;

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#eff6ff", color: "#2563eb" }}><GitBranch size={16} /></div>
        <div>
          <h1>Version Compare</h1>
          <div className="ph-sub">{measure.code} · {measure.name} · Comparing {left.version} → {right.version}</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Export Diff</button>
        </div>
      </div>

      {/* Version header bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: "10px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[left, right].map((v, i) => (
          <div key={i} style={{ padding: "8px 14px", background: i === 1 ? "#f0fdf4" : "#fef9f0", borderRadius: 6, margin: "0 4px", border: `1px solid ${i === 1 ? "#86efac" : "#fed7aa"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{v.version}</span>
              <StatusBadge status={v.status as any} />
              <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>Activated: {v.activatedAt}</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Created by {v.createdBy}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(section => (
          <div key={section.section} className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title">{section.section}</div>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>
                {section.fields.filter(f => f.changed).length} change(s)
              </span>
            </div>
            <div style={{ padding: "6px 0" }}>
              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: 0, padding: "4px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Field</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>v{left.version.replace("v","")}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>v{right.version.replace("v","")}</span>
              </div>
              {section.fields.map((field, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: 0, padding: "7px 14px",
                  borderBottom: "1px solid #f8fafc",
                  background: field.changed ? "#fffef0" : undefined }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#475569", alignSelf: "center" }}>
                    {field.field}
                    {field.changed && <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#fef3c7", color: "#d97706" }}>Changed</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", alignSelf: "center" }}>
                    {field.v1 === "—" || field.v1.includes("added")
                      ? <span style={{ color: "#d1d5db" }}>—</span>
                      : <span className={field.changed ? "diff-removed" : "diff-unchanged"} style={{ display: "inline-block" }}>{field.v1}</span>
                    }
                  </div>
                  <div style={{ fontSize: 11, alignSelf: "center" }}>
                    {field.v2.includes("added")
                      ? <span className="diff-added" style={{ display: "inline-block" }}>{field.v2}</span>
                      : <span className={field.changed ? "diff-added" : "diff-unchanged"} style={{ display: "inline-block" }}>{field.v2}</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="alert-bar info">
          <Info size={13} />
          <span>Impact-sensitive changes (Target Value, Owner Position, Links) are highlighted. Review downstream impact before activating the new version.</span>
        </div>
      </div>
    </div>
  );
};

// ─── WorkbenchScreens wrapper ─────────────────────────────────────────────────
type WorkbenchScreen = "ownership" | "targets" | "approvals" | "versions";

interface WorkbenchScreensProps {
  screen: WorkbenchScreen;
  measure?: Measure;
}

export const WorkbenchScreens: React.FC<WorkbenchScreensProps> = ({ screen, measure }) => {
  const m = measure ?? measures[0];
  if (screen === "ownership")  return <OwnershipWorkbench />;
  if (screen === "targets")    return <TargetManager />;
  if (screen === "approvals")  return <MeasureApprovalReview measure={m} />;
  if (screen === "versions")   return <MeasureVersionCompare measure={m} />;
  return null;
};