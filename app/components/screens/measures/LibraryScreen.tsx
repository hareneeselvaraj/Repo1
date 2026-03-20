import React, { useState } from "react";
import { Search, Plus, Share2, Eye, CheckCircle2, AlertCircle, AlertTriangle, ChartBar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";
import { measures, Measure } from "../../../../data/standardsData";
import { measureLinks, measureTargets, ownershipMatrix, measureVersions, ResolutionStatus } from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";

export const TYPE_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  KPI: { bg: "#eff6ff", color: "#1e40af", border: "#3b82f6" },
  MP:  { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
  MOP: { bg: "#fdf4ff", color: "#7e22ce", border: "#c084fc" },
  CP:  { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
};

export const CRIT_COLOR: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fff7ed", color: "#c2410c" },
  Medium:   { bg: "#fffbeb", color: "#d97706" },
  Low:      { bg: "#f0fdf4", color: "#15803d" },
};

const RES_DOT: Record<ResolutionStatus, string> = {
  "Resolved":        "#22c55e",
  "Ownership Gap":   "#dc2626",
  "Ambiguous":       "#f59e0b",
  "Invalid Context": "#94a3b8",
};

const RES_STYLE: Record<ResolutionStatus, { bg: string; color: string; border: string }> = {
  "Resolved":        { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  "Ownership Gap":   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
  "Ambiguous":       { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  "Invalid Context": { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
};

export function getMeasureResolution(measureId: string): ResolutionStatus {
  const rows = ownershipMatrix.filter(r => r.measureId === measureId);
  if (rows.length === 0) return "Ownership Gap";
  if (rows.some(r => r.resolutionStatus === "Ownership Gap"))   return "Ownership Gap";
  if (rows.some(r => r.resolutionStatus === "Ambiguous"))        return "Ambiguous";
  if (rows.some(r => r.resolutionStatus === "Invalid Context"))  return "Invalid Context";
  return "Resolved";
}

export function getLinkCount(measureId: string): number {
  return measureLinks.filter(l => l.measureId === measureId).length;
}

export function hasActiveTarget(measureId: string): boolean {
  return measureTargets.some(t => t.measureId === measureId && t.status === "Active");
}

export const RESOLVED_PERSONS: Record<string, string> = {
  "M-001": "Ravi Kumar",    "M-002": "Ravi Kumar",     "M-003": "Ravi Kumar",
  "M-004": "Meena Sundaram","M-005": "Arun Sekar",     "M-006": "Meena Sundaram",
  "M-007": "Meena Sundaram","M-008": "Not Resolved",
};

export const MEASURE_DESCRIPTIONS: Record<string, string> = {
  "M-001": "Ratio of units passing first-time inspection without rework or scrap. Measured daily per line.",
  "M-002": "Overall Equipment Effectiveness = Availability × Performance × Quality.",
  "M-003": "Average time to complete one full assembly cycle on the line, from kit receipt to end-of-line check.",
  "M-004": "Percentage of fasteners torqued to specification on first attempt, by calibrated tool record.",
  "M-005": "Average lead time from kit request to kit availability at the assembly station.",
  "M-006": "Measured torque value applied to each fastener. Control point per Engineering Spec ES-1042.",
  "M-007": "Percentage of production units classified as scrap due to unrecoverable defects.",
  "M-008": "Average time to restore equipment to operational condition after a breakdown.",
};

interface LibraryScreenProps {
  selectedMeasure: Measure;
  setSelectedMeasure: (m: Measure) => void;
  onOpenDesigner: (m: Measure) => void;
  onOpenGraph: (m: Measure) => void;
  onCreateMeasure: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  selectedMeasure, setSelectedMeasure, onOpenDesigner, onOpenGraph, onCreateMeasure,
}) => {
  const navigate = useNavigate();
  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("All");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [filterCrit, setFilterCrit]       = useState("All");
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);

  const filtered = measures.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || m.ownerPosition.toLowerCase().includes(q);
    const isUnused = getLinkCount(m.id) === 0;
    return matchSearch
      && (filterType   === "All" || m.type        === filterType)
      && (filterStatus === "All" || m.status      === filterStatus)
      && (filterCrit   === "All" || m.criticality === filterCrit)
      && (!showUnusedOnly || isUnused);
  });

  const total      = measures.length;
  const active     = measures.filter(m => m.status === "Effective").length;
  const gaps       = measures.filter(m => getMeasureResolution(m.id) === "Ownership Gap").length;
  const inProgress = measures.filter(m => ["Draft","Submitted","Under Review"].includes(m.status)).length;
  const unusedCount = measures.filter(m => getLinkCount(m.id) === 0).length;

  const prevLinks   = measureLinks.filter(l => l.measureId === selectedMeasure.id);
  const prevTargets = measureTargets.filter(t => t.measureId === selectedMeasure.id && t.status === "Active");
  const prevVers    = measureVersions.filter(v => v.measureId === selectedMeasure.id);
  const prevRes     = getMeasureResolution(selectedMeasure.id);
  const prevResS    = RES_STYLE[prevRes];
  const prevTC      = TYPE_COLOR[selectedMeasure.type];
  const prevCC      = CRIT_COLOR[selectedMeasure.criticality];

  return (
    <div className="screen-shell">
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-input" style={{ maxWidth: 280 }}>
          <Search size={13} color="#94a3b8" />
          <input placeholder="Search code, name, owner…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          {["All","KPI","MP","MOP","CP"].map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["All","Draft","Approved","Effective","Retired"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
        </select>
        <select className="filter-select" value={filterCrit} onChange={e => setFilterCrit(e.target.value)}>
          {["All","Critical","High","Medium","Low"].map(c => <option key={c} value={c}>{c === "All" ? "All Criticality" : c}</option>)}
        </select>
        {/* Unused Only filter — §8.1 */}
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: showUnusedOnly ? "#d97706" : "#64748b", cursor: "pointer", padding: "4px 8px",
          background: showUnusedOnly ? "#fffbeb" : "transparent", border: `1px solid ${showUnusedOnly ? "#fde68a" : "#e2e8f0"}`, borderRadius: 5, fontWeight: showUnusedOnly ? 600 : 400 }}>
          <input type="checkbox" checked={showUnusedOnly} onChange={e => setShowUnusedOnly(e.target.checked)} style={{ width: 12, height: 12, cursor: "pointer", accentColor: "#d97706" }} />
          Unused Only {unusedCount > 0 && <span style={{ background: "#fde68a", color: "#92400e", borderRadius: 8, padding: "0 5px", fontSize: 10 }}>{unusedCount}</span>}
        </label>
        <span className="fb-count">{filtered.length} of {total} measures</span>
        <button className="dwm-btn dwm-btn-primary" style={{ marginLeft: "auto" }} onClick={onCreateMeasure}><Plus size={12} /> Create Measure</button>
      </div>

      {/* ── Unused Measures Alert — Spec §8.1 ── */}
      {unusedCount > 0 && (
        <div style={{ padding: "6px 18px", background: "#fffbeb", borderBottom: "1px solid #fde68a", flexShrink: 0 }}>
          <div className="alert-bar warning" style={{ marginBottom: 0 }}>
            <AlertTriangle size={12} />
            <span>
              <strong>{unusedCount} unused measure{unusedCount !== 1 ? "s" : ""} (§8.1):</strong>{" "}
              Not linked to any SOP step, process, or PFC. Link them to enable traceability and operational tracking.{" "}
              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "1px 8px", marginLeft: 4 }}
                onClick={() => setShowUnusedOnly(true)}>Show unused →</button>
            </span>
          </div>
        </div>
      )}

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[
          { label: "Total Measures",  value: total,       color: "#1d4ed8", Icon: ChartBar      },
          { label: "Active",          value: active,      color: "#15803d", Icon: CheckCircle2  },
          { label: "Ownership Gaps",  value: gaps,        color: "#dc2626", Icon: AlertCircle   },
          { label: "In Progress",     value: inProgress,  color: "#d97706", Icon: AlertTriangle },
          { label: "Unused (§8.1)",   value: unusedCount, color: "#92400e", Icon: AlertTriangle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6,
            cursor: label.includes("Unused") ? "pointer" : "default" }}
            onClick={label.includes("Unused") ? () => setShowUnusedOnly(v => !v) : undefined}
          >
            <Icon size={13} color={color} />
            <span style={{ fontSize: 14, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Table + preview */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table className="dwm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Measure Name</th>
                <th>Type</th>
                <th>Owner Position</th>
                <th>Resolution</th>
                <th>UoM</th>
                <th>Frequency</th>
                <th>Criticality</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Links</th>
                <th style={{ textAlign: "center" }}>Target</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const res    = getMeasureResolution(m.id);
                const tc     = TYPE_COLOR[m.type] ?? TYPE_COLOR.KPI;
                const cc     = CRIT_COLOR[m.criticality] ?? CRIT_COLOR.Low;
                const isActive = hasActiveTarget(m.id);
                const links  = getLinkCount(m.id);
                const isSel  = m.id === selectedMeasure.id;
                const isUnused = links === 0;
                return (
                  <tr key={m.id} onClick={() => setSelectedMeasure(m)} style={{ background: isSel ? "#eff6ff" : isUnused ? "#fffdf5" : undefined }}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{m.code}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span className="td-primary">{m.name}</span>
                        {/* Unused Measure flag — §8.1 */}
                        {isUnused && (
                          <span title="Unused: not linked to any SOP step or process (§8.1)" style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                            background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Unused</span>
                        )}
                      </div>
                      {m.formula && <div className="td-secondary" style={{ fontSize: 10 }}>{m.formula.slice(0, 42)}…</div>}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                        {m.type}
                      </span>
                    </td>
                    <td><span className="td-secondary">{m.ownerPosition}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: RES_DOT[res], flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: res === "Resolved" ? "#64748b" : res === "Ownership Gap" ? "#dc2626" : "#d97706" }}>{res}</span>
                      </div>
                    </td>
                    <td><span className="td-secondary">{m.unitOfMeasure}</span></td>
                    <td>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f1f5f9", color: "#475569" }}>{m.frequency}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cc.bg, color: cc.color }}>{m.criticality}</span>
                    </td>
                    <td><StatusBadge status={m.status as any} /></td>
                    <td style={{ textAlign: "center" }}>
                      {isUnused
                        ? <span title="Unused — not linked to any SOP step or process" style={{ fontSize: 9, fontWeight: 700, color: "#d97706" }}>—</span>
                        : <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{links}</span>
                      }
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isActive
                        ? <CheckCircle2 size={13} color="#16a34a" />
                        : <AlertCircle  size={13} color="#d97706" />
                      }
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }}
                          onClick={e => { e.stopPropagation(); onOpenDesigner(m); }}>Open</button>
                        <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 6px" }}
                          onClick={e => { e.stopPropagation(); onOpenGraph(m); }}>
                          <Share2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Preview panel */}
        <div style={{ width: 296, flexShrink: 0, borderLeft: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ padding: "10px 14px", background: "#fafafa", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{selectedMeasure.code}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: prevTC.bg, color: prevTC.color, border: `1px solid ${prevTC.border}` }}>
                {selectedMeasure.type}
              </span>
              {getLinkCount(selectedMeasure.id) === 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>Unused</span>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3, marginBottom: 6 }}>{selectedMeasure.name}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <StatusBadge status={selectedMeasure.status as any} />
              {prevVers.length > 0 && <span style={{ fontSize: 10, color: "#94a3b8" }}>{prevVers[prevVers.length - 1]?.versionNo}</span>}
            </div>
          </div>

          {/* Resolution */}
          <div style={{ padding: "8px 14px", background: prevResS.bg, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {prevRes === "Resolved"
                ? <CheckCircle2 size={12} color="#15803d" />
                : <AlertCircle  size={12} color={prevRes === "Ownership Gap" ? "#dc2626" : "#d97706"} />
              }
              <span style={{ fontSize: 11, fontWeight: 600, color: prevResS.color }}>{prevRes}</span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
              {selectedMeasure.ownerPosition} → <strong>{RESOLVED_PERSONS[selectedMeasure.id] ?? "Not Resolved"}</strong>
            </div>
          </div>

          {/* Quick fields */}
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
            {[
              { label: "Criticality",   value: selectedMeasure.criticality,  badge: prevCC },
              { label: "Source Type",   value: selectedMeasure.sourceType,   badge: null   },
              { label: "Frequency",     value: selectedMeasure.frequency,    badge: null   },
              { label: "Unit",          value: selectedMeasure.unitOfMeasure,badge: null   },
              { label: "Last Modified", value: selectedMeasure.lastModified, badge: null   },
            ].map(({ label, value, badge }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                {badge
                  ? <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: badge.bg, color: badge.color }}>{value}</span>
                  : <span style={{ fontSize: 11, fontWeight: 500, color: "#475569" }}>{value}</span>
                }
              </div>
            ))}

            {prevTargets.length > 0 && (
              <div style={{ padding: "8px 10px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>Active Target</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>
                  {prevTargets[0].targetValue} {selectedMeasure.unitOfMeasure}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{prevTargets[0].scopeLabel} · {prevTargets[0].targetType}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[
                { label: "Links",    value: getLinkCount(selectedMeasure.id) },
                { label: "Targets",  value: prevTargets.length               },
                { label: "Versions", value: prevVers.length                  },
              ].map(({ label, value }) => (
                <div key={label} style={{ flex: 1, padding: "6px 4px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 5, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: value === 0 && label === "Links" ? "#d97706" : "#1d4ed8" }}>{value}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.4, marginTop: 2 }}>
              {MEASURE_DESCRIPTIONS[selectedMeasure.id]?.slice(0, 80)}…
            </div>

            {/* Cross-navigation — UX Refinement §4 */}
            {prevLinks.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>Used In</div>
                {prevLinks.slice(0, 3).map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#f8fafc", borderRadius: 4, border: "1px solid #f1f5f9", cursor: "pointer" }}
                    onClick={() => l.objectType === "SOP" || l.objectType === "SOP Step" ? navigate("/sop-editor") : navigate("/process-designer")}
                  >
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.objectName}</span>
                    <ExternalLink size={9} color="#94a3b8" />
                  </div>
                ))}
                {prevLinks.length > 3 && <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>+{prevLinks.length - 3} more in Designer</div>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="dwm-btn dwm-btn-primary" style={{ justifyContent: "center" }} onClick={() => onOpenDesigner(selectedMeasure)}>
              <Eye size={12} /> Open in Designer
            </button>
            <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center" }} onClick={() => onOpenGraph(selectedMeasure)}>
              <Share2 size={12} /> View in Graph Explorer
            </button>
            {/* Cross-nav to linked objects */}
            {prevLinks.some(l => l.objectType === "SOP" || l.objectType === "SOP Step") && (
              <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center", fontSize: 10 }} onClick={() => navigate("/sop-editor")}>
                <ExternalLink size={10} /> Open in SOP Editor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};