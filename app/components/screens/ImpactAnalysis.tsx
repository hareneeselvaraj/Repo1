import React, { useState } from "react";
import { Zap, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Filter } from "lucide-react";
import { impactItems, ImpactItem } from "../../../data/standardsData";

const SEV_CONFIG: Record<string, { bg: string; color: string; border: string; dotColor: string }> = {
  Blocking: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dotColor: "#dc2626" },
  High:     { bg: "#fff7ed", color: "#c2410c", border: "#fdba74", dotColor: "#d97706" },
  Medium:   { bg: "#fffbeb", color: "#92400e", border: "#fcd34d", dotColor: "#d97706" },
  Low:      { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", dotColor: "#94a3b8" },
};

const TYPE_CLASS: Record<string, string> = {
  SOP: "dwm-type-sop", PFC: "dwm-type-pfc",
  Measure: "dwm-type-measure", "Role Sheet": "dwm-type-role-sheet", Process: "dwm-type-process",
};

const GROUP_ORDER = ["Blocking", "High", "Medium", "Low"];

export const ImpactAnalysis: React.FC = () => {
  const [filterSev, setFilterSev] = useState("All");
  const [filterBlocking, setFilterBlocking] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set(["IMP-005"]));

  const filtered = impactItems.filter((item) => {
    const matchSev  = filterSev === "All" || item.severity === filterSev;
    const matchBlock = !filterBlocking || item.isBlocking;
    return matchSev && matchBlock;
  });

  const grouped = GROUP_ORDER.reduce<Record<string, ImpactItem[]>>((acc, sev) => {
    acc[sev] = filtered.filter((i) => i.severity === sev);
    return acc;
  }, {});

  const blockingCount = impactItems.filter((i) => i.isBlocking && !resolvedIds.has(i.id)).length;
  const pendingCount  = impactItems.filter((i) => !resolvedIds.has(i.id)).length;
  const resolvedCount = resolvedIds.size;

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fff7ed", color: "#d97706" }}><Zap size={16} /></div>
        <div>
          <h1>Impact Analysis</h1>
          <div className="ph-sub">Final Assembly PFC v2.1 → downstream objects affected by proposed changes</div>
        </div>
        <div className="ph-actions">
          <button
            className="dwm-btn dwm-btn-ghost"
            style={{ borderColor: filterBlocking ? "#fca5a5" : undefined, color: filterBlocking ? "#dc2626" : undefined }}
            onClick={() => setFilterBlocking((b) => !b)}
          >
            <Filter size={12} /> {filterBlocking ? "Show All" : "Blocking Only"}
          </button>
          <select className="filter-select" value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
            {["All", "Blocking", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="content-area">
        {/* Source object */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ padding: "8px 12px", background: "#eff6ff", borderRadius: 7 }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Source Object</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Final Assembly PFC v2.1</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>PFC-ASM-001 · Engine Assembly Operation</div>
          </div>
          <ChevronRight size={18} color="#d1d5db" />
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Blocking", count: blockingCount, bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
              { label: "Pending",  count: pendingCount,  bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
              { label: "Resolved", count: resolvedCount, bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
              { label: "Total",    count: impactItems.length, bg: "#f8fafc", color: "#0f172a", border: "#e2e8f0" },
            ].map(({ label, count, bg, color, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 7, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 10, color, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
              </div>
            ))}
          </div>

          {blockingCount > 0 && (
            <div className="alert-bar danger" style={{ marginLeft: "auto", flex: 0 }}>
              <AlertTriangle size={13} />
              <span style={{ whiteSpace: "nowrap" }}>
                <strong>{blockingCount} blocking item{blockingCount > 1 ? "s" : ""}</strong> — activation prevented
              </span>
            </div>
          )}
        </div>

        {/* Impact items grouped by severity */}
        {GROUP_ORDER.map((sev) => {
          const items = grouped[sev];
          if (!items?.length) return null;
          const cfg = SEV_CONFIG[sev];
          return (
            <div key={sev} className="dwm-panel">
              <div className="dwm-panel-header" style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
                <div className="ph-title" style={{ color: cfg.color }}>
                  {sev === "Blocking" && <XCircle size={13} />}
                  {sev === "High"     && <AlertTriangle size={13} />}
                  {sev === "Medium"   && <AlertTriangle size={13} />}
                  {sev === "Low"      && <CheckCircle2 size={13} />}
                  {sev} Severity
                  <span className="ph-count" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    {items.length}
                  </span>
                </div>
                {sev === "Blocking" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#dc2626" }}>
                    Must resolve before activation
                  </span>
                )}
              </div>

              <table className="dwm-table">
                <thead>
                  <tr>
                    <th>Object Type</th>
                    <th>Object ID / Title</th>
                    <th>Action Required</th>
                    <th>Blocking</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isResolved = resolvedIds.has(item.id);
                    return (
                      <tr key={item.id} style={{ opacity: isResolved ? 0.6 : 1 }}>
                        <td>
                          <span className={`dwm-type-chip ${TYPE_CLASS[item.objectType] ?? ""}`}>
                            {item.objectType}
                          </span>
                        </td>
                        <td>
                          <div className="td-primary">{item.objectTitle}</div>
                          <div className="td-secondary">{item.objectId}</div>
                        </td>
                        <td><span className="td-secondary">{item.actionRequired}</span></td>
                        <td style={{ textAlign: "center" }}>
                          {item.isBlocking
                            ? <XCircle size={14} color="#dc2626" />
                            : <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                          }
                        </td>
                        <td>
                          {isResolved ? (
                            <span className="dwm-badge dwm-badge-effective">Resolved</span>
                          ) : (
                            <span className="dwm-badge dwm-badge-under-review">Pending</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }}>
                              Open <ChevronRight size={10} />
                            </button>
                            {!isResolved && (
                              <button
                                className="dwm-btn"
                                style={{ fontSize: 10, padding: "3px 8px", background: "#f0fdf4", color: "#15803d", borderColor: "#86efac" }}
                                onClick={() => setResolvedIds((s) => new Set([...s, item.id]))}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
