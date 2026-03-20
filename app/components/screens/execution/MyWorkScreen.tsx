import React, { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, ChevronRight,
  ArrowUpRight, Paperclip, MessageSquare, Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  myWorkActions, ExecutionAction, ACTION_STATUS_COLOR, ACTION_PRIORITY_COLOR, KPI_STATUS_COLOR,
  t1KpiCells,
} from "../../../../data/executionData";

// ─── Inline status dropdown ───────────────────────────────────────────────────
const StatusDropdown: React.FC<{ current: ExecutionAction["status"] }> = ({ current }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(current);
  const statuses: ExecutionAction["status"][] = ["Open", "In Progress", "Resolved", "Verified"];
  const sc = ACTION_STATUS_COLOR[value];

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
          background: sc.bg, color: sc.color, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4 }}>
        {value} ▾
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 100, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", width: 130, marginTop: 2 }}>
          {statuses.map(s => {
            const sc2 = ACTION_STATUS_COLOR[s];
            return (
              <div key={s} onClick={() => { setValue(s); setOpen(false); }}
                style={{ padding: "7px 12px", fontSize: 11, fontWeight: 600, color: sc2.color,
                  cursor: "pointer", background: value === s ? sc2.bg : "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = sc2.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = value === s ? sc2.bg : "#fff")}
              >{s}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Action Row Expanded ──────────────────────────────────────────────────────
const ActionDetail: React.FC<{ action: ExecutionAction; onClose: () => void }> = ({ action, onClose }) => {
  const navigate = useNavigate();
  const kpiData = t1KpiCells.find(k => k.id === action.kpiId);
  const sc = ACTION_STATUS_COLOR[action.status];
  const pc = ACTION_PRIORITY_COLOR[action.priority];

  return (
    <div style={{ padding: "12px 16px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* KPI link */}
      {kpiData && (
        <div onClick={() => navigate("/boards")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: KPI_STATUS_COLOR[kpiData.status].bg, border: `1px solid ${KPI_STATUS_COLOR[kpiData.status].border}`, borderRadius: 6, cursor: "pointer" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: KPI_STATUS_COLOR[kpiData.status].dot }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>KPI: {kpiData.name}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Current: {kpiData.value} {kpiData.unit} · Target: {kpiData.target} {kpiData.unit}</div>
          </div>
          <ArrowUpRight size={12} color="#94a3b8" />
        </div>
      )}

      {/* Remarks */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>Remarks</div>
        {action.remarks ? (
          <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5, padding: "6px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5 }}>{action.remarks}</div>
        ) : (
          <textarea placeholder="Add a remark…" rows={2}
            style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        )}
      </div>

      {/* Evidence */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>Evidence</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {action.evidence.map(e => (
            <span key={e} style={{ fontSize: 10, padding: "3px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Paperclip size={9} /> {e}
            </span>
          ))}
          <button style={{ fontSize: 10, padding: "3px 10px", background: "#fff", border: "1px dashed #d1d5db", borderRadius: 4, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
            <Paperclip size={9} /> Upload
          </button>
        </div>
      </div>

      {/* Timeline */}
      {action.timeline.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>Timeline</div>
          {action.timeline.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", marginTop: 4, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 6 }}>{t.at}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#334155" }}>{t.actor}</span>
                <span style={{ fontSize: 10, color: "#64748b" }}> — {t.event}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ fontSize: 10, padding: "5px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>Save</button>
        <button onClick={onClose} style={{ fontSize: 10, padding: "5px 14px", background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
};

// ─── Main MyWorkScreen ────────────────────────────────────────────────────────
export const MyWorkScreen: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "in-progress">("all");

  const filtered = myWorkActions.filter(a => {
    if (filter === "open")        return a.status === "Open";
    if (filter === "in-progress") return a.status === "In Progress";
    return true;
  });

  const openCount = myWorkActions.filter(a => a.status === "Open").length;
  const inProgCount = myWorkActions.filter(a => a.status === "In Progress").length;
  const overdueCount = myWorkActions.filter(a => a.status === "Open" && a.dueTime < "11:00 AM").length;

  return (
    <div className="screen-shell">
      {/* My Work header */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          My Work — Today · <span style={{ color: "#64748b", fontWeight: 400 }}>18 Mar 2026, Day Shift</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Open",        value: openCount,    color: "#dc2626", bg: "#fef2f2" },
            { label: "In Progress", value: inProgCount,  color: "#d97706", bg: "#fffbeb" },
            { label: "Overdue",     value: overdueCount, color: "#dc2626", bg: "#fef2f2" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: s.bg, borderRadius: 6, fontSize: 11 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ color: "#64748b" }}>{s.label}</span>
            </div>
          ))}
          <button onClick={() => navigate("/boards")}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "#1d4ed8", fontWeight: 600 }}>
            <ArrowUpRight size={11} /> Open Board
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: "flex", gap: 1, background: "#f1f5f9", borderRadius: 5, padding: 2 }}>
          {(["all", "open", "in-progress"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "4px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: filter === f ? 700 : 400,
                background: filter === f ? "#fff" : "transparent", color: filter === f ? "#1d4ed8" : "#64748b",
                boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {f === "all" ? "All" : f === "open" ? "Open" : "In Progress"}
            </button>
          ))}
        </div>
        <span className="fb-count">{filtered.length} of {myWorkActions.length} actions</span>
      </div>

      {/* Action list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
            <CheckCircle2 size={32} color="#22c55e" style={{ margin: "0 auto 10px", display: "block" }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>All clear!</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>No actions in this view</div>
          </div>
        ) : filtered.map(action => {
          const sc  = ACTION_STATUS_COLOR[action.status];
          const pc  = ACTION_PRIORITY_COLOR[action.priority];
          const kpi = t1KpiCells.find(k => k.id === action.kpiId);
          const isExpanded = expandedId === action.id;

          return (
            <div key={action.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              {/* Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 120px auto", alignItems: "center", gap: 0, padding: "10px 18px",
                background: action.priority === "Critical" ? "#fffafa" : "#fff",
                cursor: "pointer" }}
                onClick={() => setExpandedId(isExpanded ? null : action.id)}
              >
                {/* Title + meta */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    {action.priority === "Critical" && <AlertTriangle size={12} color="#dc2626" />}
                    {action.escalated && <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "1px 5px", borderRadius: 3, border: "1px solid #fca5a5" }}>↑ Escalated</span>}
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: pc.bg, color: pc.color }}>{action.priority}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>{action.id}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{action.title}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                    Source: <span style={{ fontWeight: 600, color: action.source === "Abnormality" ? "#dc2626" : "#64748b" }}>{action.source}</span>
                    {action.abnormalityId && <span style={{ color: "#94a3b8" }}> · {action.abnormalityId}</span>}
                  </div>
                </div>
                {/* KPI */}
                <div style={{ padding: "0 8px" }}>
                  {kpi ? (
                    <div onClick={e => { e.stopPropagation(); navigate("/boards"); }}
                      style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: KPI_STATUS_COLOR[kpi.status].dot }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", textDecoration: "underline" }}>{kpi.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{kpi.value} {kpi.unit}</div>
                      </div>
                    </div>
                  ) : <span style={{ fontSize: 10, color: "#94a3b8" }}>—</span>}
                </div>
                {/* Due */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px" }}>
                  <Clock size={10} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: "#475569" }}>{action.dueTime}</span>
                </div>
                {/* Status dropdown */}
                <div onClick={e => e.stopPropagation()} style={{ padding: "0 8px" }}>
                  <StatusDropdown current={action.status} />
                </div>
                {/* Expand */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {action.remarks && <MessageSquare size={12} color="#94a3b8" />}
                  {action.evidence.length > 0 && <Paperclip size={12} color="#94a3b8" />}
                  <ChevronRight size={13} color="#94a3b8" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                </div>
              </div>
              {/* Expanded detail */}
              {isExpanded && <ActionDetail action={action} onClose={() => setExpandedId(null)} />}
            </div>
          );
        })}
      </div>

      {/* Quick nav footer (mobile-ready) */}
      <div style={{ padding: "8px 18px", borderTop: "1px solid #e2e8f0", background: "#fff", display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => navigate("/boards")} style={{ flex: 1, padding: "7px 0", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>
          Board View
        </button>
        <button onClick={() => navigate("/actions")} style={{ flex: 1, padding: "7px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
          All Actions
        </button>
        <button onClick={() => navigate("/meetings")} style={{ flex: 1, padding: "7px 0", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
          Meetings
        </button>
      </div>
    </div>
  );
};
