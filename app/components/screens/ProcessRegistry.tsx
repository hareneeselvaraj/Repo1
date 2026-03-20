import React, { useState } from "react";
import { GitBranch, Search, Plus, Filter, ChartBar, BookOpen, Layers, AlertTriangle, ExternalLink } from "lucide-react";
import { processes, Process, pfcs, measures } from "../../../data/standardsData";
import { measureLinks } from "../../../data/measuresData";
import { OwnershipCard } from "../shared/OwnershipCard";
import { StatusBadge } from "../shared/StatusBadge";

const CRIT_STYLE: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626" },
  High:     { bg: "#fffbeb", color: "#d97706" },
  Medium:   { bg: "#eff6ff", color: "#2563eb" },
  Low:      { bg: "#f1f5f9", color: "#64748b" },
};

export const ProcessRegistry: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterCrit, setFilterCrit] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<Process | null>(processes[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const filtered = processes.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchCrit   = filterCrit === "All" || p.criticality === filterCrit;
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchCrit && matchStatus;
  });

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><GitBranch size={16} /></div>
        <div>
          <h1>Process Registry</h1>
          <div className="ph-sub">Create, manage, and link all business processes</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost"><Filter size={12} /> Filter</button>
          <button className="dwm-btn dwm-btn-primary"><Plus size={12} /> Create Process</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-input">
          <Search size={12} color="#94a3b8" />
          <input
            placeholder="Search process code or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterCrit} onChange={(e) => setFilterCrit(e.target.value)}>
          {["All", "Critical", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {["All", "Draft", "Approved", "Effective", "Superseded"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="fb-count">{filtered.length} processes</span>
      </div>

      <div className="split-layout">
        {/* List */}
        <div className="split-center">
          <div className="list-panel">
            <table className="dwm-table">
              <thead>
                <tr><th>Code</th><th>Process Name</th><th>Owner Position</th><th>Resolved Owner</th><th>Category</th><th>Criticality</th><th>SOPs</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const cs = CRIT_STYLE[p.criticality] ?? { bg: "#f1f5f9", color: "#64748b" };
                  const isGap = p.resolvedOwner === "Not Resolved";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      style={{ background: selected?.id === p.id ? "#eff6ff" : undefined }}
                    >
                      <td><span className="td-primary" style={{ fontFamily: "monospace", fontSize: 11 }}>{p.code}</span></td>
                      <td>
                        <div className="td-primary">{p.name}</div>
                        <div className="td-secondary">{p.category}</div>
                      </td>
                      <td><span className="td-secondary">{p.ownerPosition}</span></td>
                      <td>
                        <span
                          className="td-secondary"
                          style={{ color: isGap ? "#dc2626" : undefined, display: "flex", alignItems: "center", gap: 4 }}
                        >
                          {isGap && <AlertTriangle size={11} color="#dc2626" />}
                          {p.resolvedOwner}
                        </span>
                      </td>
                      <td><span className="td-secondary">{p.category}</span></td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: cs.bg, color: cs.color }}>
                          {p.criticality}
                        </span>
                      </td>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: "#1e40af" }}>{p.linkedSOPs}</span></td>
                      <td><StatusBadge status={p.status as any} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="split-right">
            <div className="detail-panel" style={{ flex: 1, overflow: "hidden" }}>
              <div className="detail-panel-header">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div className="dph-title">{selected.name}</div>
                    <div className="dph-sub">{selected.code} · {selected.category}</div>
                  </div>
                  <StatusBadge status={selected.status as any} />
                </div>
              </div>

              {/* Tab bar */}
              <div className="tab-bar">
                {["overview", "pfcs", "sops", "measures", "history"].map((t) => (
                  <button
                    key={t}
                    className={`tb-tab ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <div className="detail-panel-body">
                {activeTab === "overview" && (
                  <>
                    {/* Ownership */}
                    <OwnershipCard
                      ownerPosition={selected.ownerPosition}
                      resolvedPerson={selected.resolvedOwner}
                      context="Chennai / Assembly"
                    />

                    <div className="detail-field">
                      <div className="df-label">Criticality</div>
                      <div className="df-value">
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 3, background: CRIT_STYLE[selected.criticality]?.bg, color: CRIT_STYLE[selected.criticality]?.color }}>
                          {selected.criticality}
                        </span>
                      </div>
                    </div>
                    <div className="detail-field">
                      <div className="df-label">Last Modified</div>
                      <div className="df-value muted">{selected.lastModified}</div>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {[
                        { icon: Layers,    label: "PFCs",     value: selected.linkedPFCs },
                        { icon: BookOpen,  label: "SOPs",     value: selected.linkedSOPs },
                        { icon: ChartBar, label: "Measures", value: selected.linkedMeasures },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px", textAlign: "center" }}>
                          <Icon size={14} color="#64748b" />
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e40af", margin: "2px 0" }}>{value}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                      <button className="dwm-btn dwm-btn-primary" style={{ justifyContent: "center" }}>Open PFC Designer</button>
                      <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center" }}>View Linked SOPs</button>
                    </div>
                  </>
                )}

                {activeTab === "pfcs" && (() => {
                  const linkedPFCs = pfcs.filter(p => p.processId === selected.id);
                  const effective  = linkedPFCs.filter(p => p.status === "Effective").length;
                  const inProgress = linkedPFCs.filter(p => ["Draft","Submitted","Under Review"].includes(p.status)).length;
                  return linkedPFCs.length === 0 ? (
                    <div className="empty-state" style={{ padding: 30 }}>
                      <Layers size={28} className="es-icon" />
                      <div className="es-title">No PFCs defined yet</div>
                      <div className="es-sub">Create a Process Flow Chart to document this process visually</div>
                      <button className="dwm-btn dwm-btn-primary" style={{ marginTop: 12, justifyContent: "center" }}><Plus size={11} /> Create PFC</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Summary */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                        {[
                          { label: "Total",       value: linkedPFCs.length, color: "#1d4ed8" },
                          { label: "Effective",   value: effective,          color: "#15803d" },
                          { label: "In Progress", value: inProgress,         color: "#d97706" },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 17, fontWeight: 700, color }}>{value}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* PFC cards */}
                      {linkedPFCs.map(p => {
                        const nodeCount    = p.nodes.length;
                        const critCount    = p.nodes.filter(n => n.criticalFlag).length;
                        const sopCount     = p.nodes.filter(n => n.linkedSOP).length;
                        const headerBg     = p.status === "Effective" ? "#f0fdf4" : p.status === "Draft" ? "#fafafa" : "#f0f9ff";
                        const headerBorder = p.status === "Effective" ? "#bbf7d0" : "#e2e8f0";
                        return (
                          <div key={p.id} style={{ border: `1px solid ${headerBorder}`, borderRadius: 7, overflow: "hidden", background: "#fff" }}>
                            <div style={{ padding: "9px 12px", background: headerBg }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, color: "#1d4ed8" }}>{p.code}</div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginTop: 1, lineHeight: 1.3 }}>{p.name}</div>
                                </div>
                                <StatusBadge status={p.status as any} />
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 10, color: "#94a3b8", flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 500, color: "#475569" }}>{p.version}</span>
                                <span>·</span>
                                <span>{p.ownerPosition}</span>
                              </div>
                              {nodeCount > 0 && (
                                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                                  {[
                                    { label: "Nodes",    value: nodeCount, color: "#1d4ed8" },
                                    { label: "Critical", value: critCount, color: "#dc2626" },
                                    { label: "SOP-linked", value: sopCount, color: "#15803d" },
                                  ].map(({ label, value, color }) => (
                                    <div key={label} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
                                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>Modified {p.lastModified}</div>
                            </div>
                            <div style={{ padding: "7px 10px", background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", gap: 5 }}>
                              <button className="dwm-btn dwm-btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 10, padding: "4px 8px" }}>
                                <Layers size={10} /> Open Designer
                              </button>
                              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "4px 8px" }}>
                                History
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center", fontSize: 11 }}>
                        <Plus size={11} /> Create New PFC
                      </button>
                    </div>
                  );
                })()}

                {activeTab === "sops" && (
                  <div className="empty-state" style={{ padding: 30 }}>
                    <BookOpen size={28} className="es-icon" />
                    <div className="es-title">{selected.linkedSOPs} SOP(s) linked</div>
                    <div className="es-sub">Navigate to SOP Library to view them</div>
                  </div>
                )}

                {activeTab === "measures" && (() => {
                  // All links from measureLinks where objectType=Process/PFC/SOP and objectId matches selected process
                  // Also join with the measures table to show full measure details
                  const processLinks = measureLinks.filter(
                    l => l.objectType === "Process" && l.objectId === selected.id
                  );
                  // Also find measures linked via PFC or SOP that belong to this process
                  const linkedPFCIds  = pfcs.filter(p => p.processId === selected.id).map(p => p.id);
                  const pfcLinks      = measureLinks.filter(
                    l => l.objectType === "PFC" && linkedPFCIds.includes(l.objectId)
                  );
                  // Collect unique measure IDs across both
                  const allLinkedMeasureIds = Array.from(new Set([
                    ...processLinks.map(l => l.measureId),
                    ...pfcLinks.map(l => l.measureId),
                  ]));
                  const linkedMeasures = allLinkedMeasureIds
                    .map(id => measures.find(m => m.id === id))
                    .filter(Boolean) as typeof measures;

                  const TYPE_COLOR_LOCAL: Record<string, { bg: string; color: string; border: string }> = {
                    KPI: { bg: "#eff6ff", color: "#1e40af", border: "#3b82f6" },
                    MP:  { bg: "#f0fdf4", color: "#15803d", border: "#22c55e" },
                    MOP: { bg: "#fdf4ff", color: "#7e22ce", border: "#c084fc" },
                    CP:  { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
                  };

                  if (linkedMeasures.length === 0) {
                    return (
                      <div className="empty-state" style={{ padding: 30 }}>
                        <ChartBar size={26} className="es-icon" />
                        <div className="es-title">No measures linked to this process</div>
                        <div className="es-sub">Open the Measures module to link KPIs, MPs, MOPs, or CPs to this process</div>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Summary */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(["KPI","MP","MOP","CP"] as const).map(type => {
                          const count = linkedMeasures.filter(m => m.type === type).length;
                          if (count === 0) return null;
                          const tc = TYPE_COLOR_LOCAL[type];
                          return (
                            <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 5 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: tc.color }}>{type}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: tc.color }}>{count}</span>
                            </div>
                          );
                        })}
                        <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center", marginLeft: 2 }}>
                          {linkedMeasures.length} measure{linkedMeasures.length !== 1 ? "s" : ""} linked
                        </span>
                      </div>

                      {/* Measure rows */}
                      {linkedMeasures.map(m => {
                        const tc    = TYPE_COLOR_LOCAL[m.type];
                        // What link objects connect this measure to this process?
                        const directLinks = measureLinks.filter(
                          l => l.measureId === m.id && (
                            (l.objectType === "Process" && l.objectId === selected.id) ||
                            (l.objectType === "PFC"     && linkedPFCIds.includes(l.objectId))
                          )
                        );
                        const hasTarget  = m.targetValue != null;
                        const CRIT_COL: Record<string, { bg: string; color: string }> = {
                          Critical: { bg: "#fef2f2", color: "#dc2626" },
                          High:     { bg: "#fff7ed", color: "#c2410c" },
                          Medium:   { bg: "#fffbeb", color: "#d97706" },
                          Low:      { bg: "#f0fdf4", color: "#15803d" },
                        };
                        const cc = CRIT_COL[m.criticality] ?? CRIT_COL.Low;

                        return (
                          <div key={m.id} style={{ border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden", background: "#fff" }}>
                            {/* Header */}
                            <div style={{ padding: "9px 12px", background: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                                  {m.type}
                                </span>
                                <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 600, color: "#1d4ed8" }}>{m.code}</span>
                                <StatusBadge status={m.status as any} />
                                <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: cc.bg, color: cc.color }}>
                                  {m.criticality}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{m.name}</div>
                              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                                {m.ownerPosition} · {m.frequency} · {m.unitOfMeasure}
                              </div>
                            </div>

                            {/* Link details */}
                            <div style={{ padding: "7px 12px" }}>
                              <div style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                                Linked via
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {directLinks.map(dl => (
                                  <div key={dl.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
                                      background: dl.objectType === "Process" ? "#f0f9ff" : "#f0fdf4",
                                      color:      dl.objectType === "Process" ? "#0369a1" : "#15803d",
                                    }}>{dl.objectType}</span>
                                    <span style={{ fontSize: 11, color: "#475569", flex: 1 }}>{dl.objectName}</span>
                                    <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#f1f5f9", color: "#64748b" }}>
                                      {dl.scopeType}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Target row */}
                              {hasTarget && (
                                <div style={{ marginTop: 6, padding: "5px 8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 10, color: "#64748b" }}>Target</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>
                                    {m.targetValue} {m.unitOfMeasure}
                                    {m.lowerLimit != null && <span style={{ fontSize: 10, fontWeight: 400, color: "#64748b" }}> (min {m.lowerLimit})</span>}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Footer actions */}
                            <div style={{ padding: "6px 10px", borderTop: "1px solid #f1f5f9", background: "#fafafa", display: "flex", gap: 5 }}>
                              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }}>
                                <ExternalLink size={10} /> Open in Measures
                              </button>
                              <button className="dwm-btn dwm-btn-ghost" style={{ fontSize: 10, padding: "3px 8px" }}>
                                View Graph
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {activeTab === "history" && (
                  <div className="empty-state" style={{ padding: 30 }}>
                    <div className="es-title">Navigate to Audit module</div>
                    <div className="es-sub">Full detail available in the respective screen</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};