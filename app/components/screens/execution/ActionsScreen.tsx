import React, { useState } from "react";
import {
  AlertTriangle, Clock, X, ChevronRight, Paperclip, MessageSquare,
  ExternalLink, ArrowUpRight, Search, Filter, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  executionActions, ExecutionAction, abnormalities,
  ACTION_STATUS_COLOR, ACTION_PRIORITY_COLOR, TIER_COLOR, KPI_STATUS_COLOR,
  t1KpiCells,
} from "../../../../data/executionData";
import { AbnormalityDispositionModal } from "./AbnormalityDispositionModal";

// ─── Action Detail Drawer ─────────────────────────────────────────────────────
const ActionDrawer: React.FC<{ action: ExecutionAction; onClose: () => void }> = ({ action, onClose }) => {
  const navigate = useNavigate();
  const sc  = ACTION_STATUS_COLOR[action.status];
  const pc  = ACTION_PRIORITY_COLOR[action.priority];
  const tc  = TIER_COLOR[action.tier];
  const kpi = t1KpiCells.find(k => k.id === action.kpiId);
  const abn = abnormalities.find(a => a.id === action.abnormalityId);
  const [tab, setTab]   = useState<"detail" | "timeline" | "evidence">("detail");
  const [localStatus, setLocalStatus] = useState(action.status);

  // § Action completion → trigger disposition prompt
  const [showClosurePrompt, setShowClosurePrompt] = useState(false);
  const [showDispositionModal, setShowDispositionModal] = useState(false);

  // Check if this is the last open action for the linked abnormality
  const siblingActions = action.abnormalityId
    ? executionActions.filter(a => a.abnormalityId === action.abnormalityId && a.id !== action.id)
    : [];
  const allOtherResolved = siblingActions.every(a => ["Resolved","Verified","Closed"].includes(a.status));

  const handleStatusChange = (s: ExecutionAction["status"]) => {
    setLocalStatus(s);
    // Trigger closure prompt when this is the last action being resolved
    if (s === "Resolved" && allOtherResolved && abn && abn.disposition === null) {
      setTimeout(() => setShowClosurePrompt(true), 400);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end", background: "rgba(15,23,42,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 420, height: "100%", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.18)" }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: pc.bg }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: pc.bg, color: pc.color }}>{action.priority}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: ACTION_STATUS_COLOR[localStatus].bg, color: ACTION_STATUS_COLOR[localStatus].color }}>{localStatus}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{action.tier}</span>
                {action.escalated && <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 7px", borderRadius: 8 }}>↑ Escalated</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{action.title}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{action.id} · Created {action.createdAt} · Source: {action.source}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={16} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fafafa", flexShrink: 0 }}>
          {([
            { id: "detail" as const,   label: "Detail"   },
            { id: "timeline" as const, label: "Timeline" },
            { id: "evidence" as const, label: "Evidence" },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                fontSize: 11, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#1d4ed8" : "#64748b",
                borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent" }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {tab === "detail" && (
            <>
              {/* Owner grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Owner Position",  value: action.ownerPosition },
                  { label: "Resolved To",     value: action.ownerPerson,     warn: action.ownerPerson === "Not Resolved" },
                  { label: "Due Date",         value: action.dueDate },
                  { label: "Due Time",         value: action.dueTime },
                  { label: "Line",             value: action.line },
                  { label: "Shift",            value: action.shift },
                ].map(f => (
                  <div key={f.label} style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 6 }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: (f as any).warn ? "#dc2626" : "#334155" }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Linked KPI */}
              {kpi && (
                <div onClick={() => navigate("/boards")}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: KPI_STATUS_COLOR[kpi.status].bg,
                    border: `1px solid ${KPI_STATUS_COLOR[kpi.status].border}`, borderRadius: 8, cursor: "pointer" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: KPI_STATUS_COLOR[kpi.status].dot, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: KPI_STATUS_COLOR[kpi.status].color }}>{kpi.status} — {kpi.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{kpi.value} {kpi.unit} · Target {kpi.target} {kpi.unit} · {kpi.measureCode}</div>
                  </div>
                  <ArrowUpRight size={12} color="#94a3b8" />
                </div>
              )}

              {/* Linked Abnormality */}
              {abn && (
                <div style={{ padding: "10px 12px", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", marginBottom: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Linked Abnormality</span>
                    {abn.isRepeatFlag && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "1px 6px", borderRadius: 8, border: "1px solid #fca5a5" }}>
                        🔁 ×{abn.repeatCount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#c2410c" }}>{abn.type} · {abn.severity}</div>
                  <div style={{ fontSize: 10, color: "#78350f", marginTop: 2 }}>{abn.description.slice(0, 80)}…</div>
                  {abn.disposition !== null && (
                    <div style={{ marginTop: 6, fontSize: 10, color: "#64748b" }}>
                      Classified: <strong style={{ color: abn.disposition === "ONE_OFF" ? "#15803d" : abn.disposition === "MONITOR" ? "#d97706" : "#1d4ed8" }}>
                        {abn.disposition === "ONE_OFF" ? "✓ One-off" : abn.disposition === "MONITOR" ? "👁 Monitor" : "⚡ → RCA"}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Remarks */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>Remarks</div>
                {action.remarks ? (
                  <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5, padding: "8px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5 }}>{action.remarks}</div>
                ) : (
                  <textarea placeholder="Add a remark…" rows={2}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                )}
              </div>

              {/* Status update */}
              <div style={{ padding: "10px 12px", background: "#eff6ff", borderRadius: 8, border: "1px solid #93c5fd" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", marginBottom: 6 }}>Update Status</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["Open", "In Progress", "Resolved", "Verified"] as ExecutionAction["status"][]).map(s => {
                    const sc2 = ACTION_STATUS_COLOR[s];
                    return (
                      <button key={s} onClick={() => handleStatusChange(s)}
                        style={{ fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 5,
                          border: `1px solid ${s === localStatus ? sc2.color : "#e2e8f0"}`,
                          background: s === localStatus ? sc2.bg : "#fff", color: sc2.color, cursor: "pointer" }}>{s}</button>
                    );
                  })}
                </div>
              </div>

              {/* ── All actions completed prompt (§ 9) ── */}
              {showClosurePrompt && abn && abn.disposition === null && (
                <div style={{ padding: "12px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>
                    ✅ All actions completed.
                  </div>
                  <div style={{ fontSize: 11, color: "#166534", marginBottom: 10 }}>
                    Do you want to close the linked abnormality <strong>{abn.id}</strong>? Classification is required before closure.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setShowClosurePrompt(false); setShowDispositionModal(true); }}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                      ✓ Close & Classify Abnormality
                    </button>
                    <button onClick={() => setShowClosurePrompt(false)}
                      style={{ padding: "6px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
                      Not Yet
                    </button>
                  </div>
                </div>
              )}

              {/* Escalate */}
              {!action.escalated && (
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>
                  <ArrowUpRight size={12} /> Escalate to {action.tier === "T1" ? "T2" : action.tier === "T2" ? "T3" : "Leadership"}
                </button>
              )}
            </>
          )}

          {tab === "timeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {action.timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 14, position: "relative" }}>
                  {i < action.timeline.length - 1 && (
                    <div style={{ position: "absolute", left: 7, top: 16, bottom: 0, width: 1, background: "#e2e8f0" }} />
                  )}
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#2563eb", border: "2px solid #fff", boxShadow: "0 0 0 2px #93c5fd", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{t.at}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{t.actor}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.event}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "evidence" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {action.evidence.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 11 }}>No evidence uploaded yet</div>
              ) : action.evidence.map(e => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  <Paperclip size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: "#1d4ed8", flex: 1 }}>{e}</span>
                  <ExternalLink size={10} color="#94a3b8" />
                </div>
              ))}
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px dashed #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b", justifyContent: "center" }}>
                <Paperclip size={11} /> Upload Evidence
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disposition modal triggered from action closure */}
      {showDispositionModal && abn && (
        <AbnormalityDispositionModal
          abnormality={abn}
          onClose={() => setShowDispositionModal(false)}
          onSubmit={(ab, disp, just) => {
            setShowDispositionModal(false);
          }}
        />
      )}
    </div>
  );
};

// ─── Main ActionsScreen ───────────────────────────────────────────────────────
export const ActionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterTier, setFilterTier]     = useState("All");
  const [selectedAction, setSelectedAction] = useState<ExecutionAction | null>(null);
  const [view, setView]                 = useState<"table" | "cards">("table");

  const filtered = executionActions.filter(a => {
    const q = search.toLowerCase();
    const matchQ = a.title.toLowerCase().includes(q) || a.kpiName.toLowerCase().includes(q) || a.ownerPerson.toLowerCase().includes(q);
    return matchQ
      && (filterStatus   === "All" || a.status   === filterStatus)
      && (filterPriority === "All" || a.priority === filterPriority)
      && (filterTier     === "All" || a.tier     === filterTier);
  });

  const critical = executionActions.filter(a => a.priority === "Critical" && a.status !== "Closed").length;
  const escalated = executionActions.filter(a => a.escalated).length;
  const open      = executionActions.filter(a => a.status === "Open").length;

  return (
    <div className="screen-shell">
      {/* Alert strip */}
      {critical > 0 && (
        <div style={{ padding: "6px 18px", background: "#fef2f2", borderBottom: "1px solid #fca5a5", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
            <AlertTriangle size={12} color="#dc2626" />
            <strong style={{ color: "#991b1b" }}>{critical} critical action{critical !== 1 ? "s" : ""} require immediate attention</strong>
            {escalated > 0 && <span style={{ color: "#b91c1c" }}>· {escalated} escalated to T2/T3</span>}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-input" style={{ maxWidth: 260 }}>
          <Search size={13} color="#94a3b8" />
          <input placeholder="Search actions…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["All","Open","In Progress","Resolved","Verified","Closed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          {["All","Critical","High","Medium","Low"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
          {["All","T1","T2","T3"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="fb-count">{filtered.length} of {executionActions.length} actions</span>

        {/* Summary chips */}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: "#fef2f2", color: "#dc2626" }}>{open} Open</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: "#fef2f2", color: "#b91c1c" }}>↑ {escalated} Escalated</span>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 1, background: "#f1f5f9", borderRadius: 5, padding: 2 }}>
          {(["table", "cards"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "3px 10px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: view === v ? 700 : 400,
                background: view === v ? "#fff" : "transparent", color: view === v ? "#1d4ed8" : "#64748b" }}>{v === "table" ? "Table" : "Cards"}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {view === "table" ? (
          <table className="dwm-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Linked KPI</th>
                <th>Owner</th>
                <th style={{ textAlign: "center" }}>Tier</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Escalated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(action => {
                const sc = ACTION_STATUS_COLOR[action.status];
                const pc = ACTION_PRIORITY_COLOR[action.priority];
                const tc = TIER_COLOR[action.tier];
                const kpi = t1KpiCells.find(k => k.id === action.kpiId);
                return (
                  <tr key={action.id} onClick={() => setSelectedAction(action)} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                        <span className="td-primary" style={{ maxWidth: 240 }}>{action.title}</span>
                      </div>
                      <div className="td-secondary">{action.id} · {action.source}</div>
                    </td>
                    <td>
                      {kpi ? (
                        <div onClick={e => { e.stopPropagation(); navigate("/boards"); }} style={{ cursor: "pointer" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", textDecoration: "underline" }}>{kpi.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: KPI_STATUS_COLOR[kpi.status].dot }} />
                            <span style={{ fontSize: 10, color: KPI_STATUS_COLOR[kpi.status].color }}>{kpi.status}</span>
                          </div>
                        </div>
                      ) : <span className="td-secondary">—</span>}
                    </td>
                    <td>
                      <div className="td-primary">{action.ownerPosition}</div>
                      <div style={{ fontSize: 10, color: action.ownerPerson === "Not Resolved" ? "#dc2626" : "#94a3b8" }}>{action.ownerPerson}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{action.tier}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} color="#94a3b8" />
                        <span className="td-secondary">{action.dueTime}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: pc.bg, color: pc.color }}>{action.priority}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: sc.bg, color: sc.color }}>{action.status}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {action.escalated
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>↑ Yes</span>
                        : <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {action.remarks && <MessageSquare size={10} color="#94a3b8" />}
                        {action.evidence.length > 0 && <Paperclip size={10} color="#94a3b8" />}
                        <ChevronRight size={12} color="#94a3b8" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12, padding: "14px 18px" }}>
            {filtered.map(action => {
              const sc = ACTION_STATUS_COLOR[action.status];
              const pc = ACTION_PRIORITY_COLOR[action.priority];
              const tc = TIER_COLOR[action.tier];
              const kpi = t1KpiCells.find(k => k.id === action.kpiId);
              return (
                <div key={action.id} onClick={() => setSelectedAction(action)}
                  style={{ background: "#fff", border: `1px solid ${action.priority === "Critical" ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer",
                    boxShadow: action.priority === "Critical" ? "0 2px 8px rgba(220,38,38,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: pc.bg, color: pc.color }}>{action.priority}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: sc.bg, color: sc.color }}>{action.status}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: tc.bg, color: tc.color }}>{action.tier}</span>
                    {action.escalated && <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", marginLeft: "auto" }}>↑ Escalated</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{action.title}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{action.ownerPosition} → <strong style={{ color: action.ownerPerson === "Not Resolved" ? "#dc2626" : "#334155" }}>{action.ownerPerson}</strong></div>
                  {kpi && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: KPI_STATUS_COLOR[kpi.status].dot }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: KPI_STATUS_COLOR[kpi.status].color }}>{kpi.name}: {kpi.value} {kpi.unit}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#94a3b8" }}>
                    <Clock size={10} />
                    <span>Due {action.dueTime}</span>
                    {action.remarks && <MessageSquare size={10} style={{ marginLeft: "auto" }} />}
                    {action.evidence.length > 0 && <Paperclip size={10} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAction && <ActionDrawer action={selectedAction} onClose={() => setSelectedAction(null)} />}
    </div>
  );
};