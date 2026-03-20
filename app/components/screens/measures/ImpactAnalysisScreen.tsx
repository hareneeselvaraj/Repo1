import React, { useState } from "react";
import { Zap, AlertCircle, AlertTriangle, CheckCircle2, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { measures, impactItems } from "../../../../data/standardsData";
import { measureRelationships } from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";
import { TYPE_COLOR } from "./LibraryScreen";

const SEV_STYLE: Record<string, { bg: string; color: string; border: string; rowBg: string }> = {
  Blocking: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", rowBg: "#fef2f2" },
  High:     { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", rowBg: "#fffbf5" },
  Medium:   { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", rowBg: "#fffef5" },
  Low:      { bg: "#f0fdf4", color: "#15803d", border: "#86efac", rowBg: "transparent" },
};

// Derive cross-measure impact from relationships
function buildImpactRows() {
  const rows: { id: string; measureId: string; objectType: string; objectId: string; objectTitle: string; severity: string; actionRequired: string; isBlocking: boolean; status: string }[] = [];

  // From impactItems (already defined in standardsData)
  impactItems.forEach(item => {
    rows.push({
      id:             item.id,
      measureId:      "M-001",
      objectType:     item.objectType,
      objectId:       item.objectId,
      objectTitle:    item.objectTitle,
      severity:       item.severity,
      actionRequired: item.actionRequired,
      isBlocking:     item.isBlocking,
      status:         item.status,
    });
  });

  // Add synthetic cross-measure impact from relationships
  measures.forEach(m => {
    const children = measureRelationships.filter(r => r.toId === m.id);
    if (children.length > 0 && m.status === "Draft") {
      rows.push({
        id: `CI-${m.id}`,
        measureId: m.id,
        objectType: "Measure",
        objectId: m.code,
        objectTitle: `${m.name} – draft version pending approval`,
        severity: "High",
        actionRequired: "Review and approve contributing measure",
        isBlocking: false,
        status: "Pending",
      });
    }
  });

  return rows;
}

const ALL_IMPACT = buildImpactRows();

export const ImpactAnalysisScreen: React.FC = () => {
  const [filterMeasure, setFilterMeasure] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "Blocking": true, "High": true, "Medium": false, "Low": false });

  const filtered = ALL_IMPACT.filter(item =>
    (filterMeasure  === "All" || item.measureId === filterMeasure)
    && (filterSeverity === "All" || item.severity  === filterSeverity)
    && (filterStatus   === "All" || item.status    === filterStatus)
  );

  const grouped: Record<string, typeof filtered> = {};
  ["Blocking", "High", "Medium", "Low"].forEach(s => {
    grouped[s] = filtered.filter(i => i.severity === s);
  });

  const blocking  = ALL_IMPACT.filter(i => i.isBlocking).length;
  const pending   = ALL_IMPACT.filter(i => i.status === "Pending").length;
  const resolved  = ALL_IMPACT.filter(i => i.status === "Resolved").length;

  // Per-measure impact counts
  const measureImpact = measures.map(m => ({
    m,
    count: ALL_IMPACT.filter(i => i.measureId === m.id).length,
    blocking: ALL_IMPACT.filter(i => i.measureId === m.id && i.isBlocking).length,
  })).filter(x => x.count > 0);

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><Zap size={16} /></div>
        <div>
          <h1>Impact Analysis</h1>
          <div className="ph-sub">Downstream and cross-measure impact of changes — {ALL_IMPACT.length} impact items across {measureImpact.length} measures</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Export</button>
          <button className="dwm-btn dwm-btn-ghost">Refresh</button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[
          { label: "Total Impact Items",  value: ALL_IMPACT.length, color: "#1d4ed8",  Icon: Zap         },
          { label: "Blocking",            value: blocking,           color: "#dc2626",  Icon: AlertCircle  },
          { label: "Pending Resolution",  value: pending,            color: "#d97706",  Icon: AlertTriangle},
          { label: "Resolved",            value: resolved,           color: "#15803d",  Icon: CheckCircle2 },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
            <Icon size={13} color={color} />
            <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: per-measure summary */}
        <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#fff", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Measure Impact Summary</div>
          </div>
          {measureImpact.map(({ m, count, blocking: bl }) => {
            const tc = TYPE_COLOR[m.type];
            return (
              <div
                key={m.id}
                style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                onClick={() => setFilterMeasure(filterMeasure === m.id ? "All" : m.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: tc.bg, color: tc.color }}>{m.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{m.name}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{count} items</span>
                  {bl > 0 && (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>
                      {bl} blocking
                    </span>
                  )}
                  {filterMeasure === m.id && (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#eff6ff", color: "#1d4ed8", marginLeft: "auto" }}>Active</span>
                  )}
                </div>
              </div>
            );
          })}
          {measureImpact.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              <div className="es-title">No impact data</div>
            </div>
          )}
        </div>

        {/* Right: impact table */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <select className="filter-select" value={filterMeasure} onChange={e => setFilterMeasure(e.target.value)}>
              <option value="All">All Measures</option>
              {measures.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select className="filter-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
              {["All","Blocking","High","Medium","Low"].map(s => <option key={s} value={s}>{s === "All" ? "All Severity" : s}</option>)}
            </select>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {["All","Pending","Resolved"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>
            <span className="fb-count">{filtered.length} of {ALL_IMPACT.length}</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
            {["Blocking", "High", "Medium", "Low"].map(sev => {
              const group = grouped[sev];
              if (group.length === 0) return null;
              const ss = SEV_STYLE[sev];
              const isOpen = expanded[sev] !== false;
              return (
                <div key={sev} className="dwm-panel" style={{ marginBottom: 10 }}>
                  <div
                    className="dwm-panel-header"
                    style={{ cursor: "pointer", background: ss.bg }}
                    onClick={() => setExpanded(prev => ({ ...prev, [sev]: !isOpen }))}
                  >
                    <div className="ph-title">
                      {isOpen ? <ChevronDown size={13} color={ss.color} /> : <ChevronRight size={13} color={ss.color} />}
                      <span style={{ color: ss.color, fontWeight: 700 }}>{sev} Severity</span>
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 10, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{group.length}</span>
                      {sev === "Blocking" && <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 500 }}>Pinned — must resolve before activation</span>}
                    </div>
                  </div>
                  {isOpen && (
                    <table className="dwm-table">
                      <thead>
                        <tr><th>Object Type</th><th>Object</th><th>Measure</th><th>Action Required</th><th style={{ textAlign: "center" }}>Status</th><th style={{ textAlign: "right" }}>Navigate</th></tr>
                      </thead>
                      <tbody>
                        {group.map(item => {
                          const m = measures.find(m => m.id === item.measureId);
                          const tc = m ? TYPE_COLOR[m.type] : null;
                          return (
                            <tr key={item.id} style={{ background: ss.rowBg }}>
                              <td>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                                  background: item.objectType === "SOP" ? "#eff6ff" : item.objectType === "Measure" ? "#fdf4ff" : "#f0f9ff",
                                  color:      item.objectType === "SOP" ? "#1e40af" : item.objectType === "Measure" ? "#7e22ce" : "#0369a1",
                                }}>{item.objectType}</span>
                              </td>
                              <td>
                                <div className="td-primary">{item.objectTitle}</div>
                                <div className="td-secondary">{item.objectId}</div>
                              </td>
                              <td>
                                {m && tc && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, fontWeight: 700, background: tc.bg, color: tc.color }}>{m.type}</span>
                                    <span style={{ fontSize: 11, color: "#475569" }}>{m.name}</span>
                                  </div>
                                )}
                              </td>
                              <td><span style={{ fontSize: 11, color: "#475569" }}>{item.actionRequired}</span></td>
                              <td style={{ textAlign: "center" }}>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 10,
                                  background: item.status === "Resolved" ? "#f0fdf4" : "#fffbeb",
                                  color:      item.status === "Resolved" ? "#15803d" : "#d97706",
                                  border:     `1px solid ${item.status === "Resolved" ? "#86efac" : "#fcd34d"}`,
                                }}>{item.status}</span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "2px 8px" }}>
                                  <ArrowRight size={10} />
                                </button>
                              </td>
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
        </div>
      </div>
    </div>
  );
};