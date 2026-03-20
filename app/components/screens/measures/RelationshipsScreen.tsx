import React, { useState } from "react";
import { GitMerge, ArrowUpRight, ArrowDownLeft, Share2, Search } from "lucide-react";
import { measures } from "../../../../data/standardsData";
import { measureRelationships, MeasureRelationship } from "../../../../data/measuresData";
import { StatusBadge } from "../../shared/StatusBadge";
import { TYPE_COLOR } from "./LibraryScreen";

const REL_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Contributes To": { bg: "#eff6ff", color: "#1e40af" },
  "Derived From":   { bg: "#fdf4ff", color: "#7e22ce" },
  "Rollup":         { bg: "#f0fdf4", color: "#15803d" },
  "Baseline":       { bg: "#fff7ed", color: "#c2410c" },
};

export const RelationshipsScreen: React.FC = () => {
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedRel, setSelectedRel] = useState<MeasureRelationship | null>(null);

  const filtered = measureRelationships.filter(r => {
    const from = measures.find(m => m.id === r.fromId);
    const to   = measures.find(m => m.id === r.toId);
    const q    = search.toLowerCase();
    const matchSearch = !q
      || from?.name.toLowerCase().includes(q) || from?.code.toLowerCase().includes(q)
      || to?.name.toLowerCase().includes(q)   || to?.code.toLowerCase().includes(q);
    const matchType = filterType === "All" || r.type === filterType;
    return matchSearch && matchType;
  });

  const sharedCount  = measureRelationships.filter(r => r.shared).length;
  const relTypes     = Array.from(new Set(measureRelationships.map(r => r.type)));

  const measureMap   = new Map(measures.map(m => [m.id, m]));

  // Build adjacency summary per measure
  const measureSummary = measures.map(m => ({
    measure: m,
    parents:  measureRelationships.filter(r => r.fromId === m.id),
    children: measureRelationships.filter(r => r.toId   === m.id),
    isShared: measureRelationships.some(r => r.fromId === m.id && r.shared),
  }));

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#f0fdf4", color: "#15803d" }}><GitMerge size={16} /></div>
        <div>
          <h1>Relationships</h1>
          <div className="ph-sub">Measure contribution graph — {measureRelationships.length} relationships across {measures.length} measures</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost"><Share2 size={12} /> View in Graph</button>
          <button className="dwm-btn dwm-btn-primary">+ Add Relationship</button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[
          { label: "Total Relationships", value: measureRelationships.length, color: "#1d4ed8" },
          { label: "Shared Measures",     value: sharedCount,                  color: "#7e22ce" },
          { label: "Contributes To",      value: measureRelationships.filter(r => r.type === "Contributes To").length, color: "#15803d" },
          { label: "Derived From",        value: measureRelationships.filter(r => r.type === "Derived From").length,   color: "#c2410c" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Measure summary matrix */}
        <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid #e2e8f0", background: "#fff", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Measures Overview
            </div>
          </div>
          {measureSummary.map(({ measure: m, parents, children, isShared }) => {
            const tc = TYPE_COLOR[m.type];
            return (
              <div
                key={m.id}
                style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                onClick={() => {
                  const firstRel = [...parents, ...children][0];
                  if (firstRel) setSelectedRel(firstRel);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{m.type}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{m.name}</span>
                  {isShared && (
                    <span style={{ marginLeft: "auto", fontSize: 8, padding: "1px 5px", borderRadius: 8, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #c084fc" }}>Shared</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowUpRight size={10} color="#15803d" />
                    <span style={{ fontSize: 10, color: "#64748b" }}>{parents.length} parents</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ArrowDownLeft size={10} color="#7e22ce" />
                    <span style={{ fontSize: 10, color: "#64748b" }}>{children.length} children</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Relationship table */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <div className="filter-input" style={{ flex: 1, maxWidth: 280 }}>
              <Search size={13} color="#94a3b8" />
              <input placeholder="Search measures…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              {relTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="fb-count">{filtered.length} of {measureRelationships.length}</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <table className="dwm-table">
              <thead>
                <tr>
                  <th>From (Contributing)</th>
                  <th style={{ textAlign: "center", width: 40 }}>→</th>
                  <th>To (Receiving)</th>
                  <th>Relationship Type</th>
                  <th style={{ textAlign: "center" }}>Weight</th>
                  <th style={{ textAlign: "center" }}>Shared</th>
                  <th>From Status</th>
                  <th>To Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const from = measureMap.get(r.fromId);
                  const to   = measureMap.get(r.toId);
                  const rtStyle = REL_TYPE_STYLE[r.type] ?? REL_TYPE_STYLE["Contributes To"];
                  const ftc  = from ? TYPE_COLOR[from.type] : TYPE_COLOR.KPI;
                  const ttc  = to   ? TYPE_COLOR[to.type]   : TYPE_COLOR.KPI;
                  const isSel = selectedRel?.id === r.id;
                  return (
                    <tr key={r.id}
                      onClick={() => setSelectedRel(isSel ? null : r)}
                      style={{ background: isSel ? "#eff6ff" : undefined }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: ftc.bg, color: ftc.color }}>{from?.type}</span>
                          <div>
                            <div className="td-primary">{from?.name ?? r.fromId}</div>
                            <div className="td-secondary">{from?.code}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <ArrowUpRight size={14} color="#64748b" />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700, background: ttc.bg, color: ttc.color }}>{to?.type}</span>
                          <div>
                            <div className="td-primary">{to?.name ?? r.toId}</div>
                            <div className="td-secondary">{to?.code}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: rtStyle.bg, color: rtStyle.color }}>
                          {r.type}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                          <div style={{ width: 44, height: 5, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
                            <div style={{ width: `${r.weight * 100}%`, height: "100%", background: "#2563eb", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", minWidth: 28 }}>{(r.weight * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {r.shared
                          ? <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #c084fc", fontWeight: 600 }}>Shared</span>
                          : <span style={{ color: "#d1d5db", fontSize: 10 }}>—</span>
                        }
                      </td>
                      <td>{from && <StatusBadge status={from.status as any} />}</td>
                      <td>{to   && <StatusBadge status={to.status   as any} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected relationship detail */}
      {selectedRel && (() => {
        const from = measureMap.get(selectedRel.fromId);
        const to   = measureMap.get(selectedRel.toId);
        return (
          <div style={{ flexShrink: 0, padding: "10px 18px", background: "#eff6ff", borderTop: "1px solid #bfdbfe", display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Selected</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{from?.name}</span>
              <ArrowUpRight size={14} color="#2563eb" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{to?.name}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#fff", border: "1px solid #93c5fd", color: "#1d4ed8" }}>{selectedRel.type}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>Weight: <strong>{(selectedRel.weight * 100).toFixed(0)}%</strong></span>
              {selectedRel.shared && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "#fdf4ff", color: "#7e22ce", border: "1px solid #c084fc" }}>Shared</span>}
            </div>
            <button style={{ marginLeft: "auto", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }} onClick={() => setSelectedRel(null)}>✕</button>
          </div>
        );
      })()}
    </div>
  );
};
