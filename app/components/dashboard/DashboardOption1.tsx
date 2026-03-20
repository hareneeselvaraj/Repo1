import React from "react";
import {
  ClipboardList,
  AlertTriangle,
  BookOpen,
  UserCheck,
  GitBranch,
  CheckCircle2,
  Clock,
  ChevronRight,
  LayoutGrid,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router";
import { StatusBadge } from "../shared/StatusBadge";
import { SystemHealthPanel } from "../shared/SystemHealthPanel";
import "../../../styles/dwm-option1.css";
import {
  kpiStats,
  pendingApprovals,
  ownershipGaps,
  recentActivity,
  draftStandards,
} from "../../../data/mockData";

// ─── Dashboard – Command Center (Option A) ─────────────────────────────────
// Rendered inside RootLayout – no sidebar/header/context bar here.

const TYPE_CLASS: Record<string, string> = {
  SOP: "dwm-type-sop",
  PFC: "dwm-type-pfc",
  Measure: "dwm-type-measure",
  "Role Sheet": "dwm-type-role-sheet",
  Process: "dwm-type-process",
};

const KPI_CARDS = [
  { label: "Pending Approvals",    value: kpiStats.pendingApprovals,      icon: ClipboardList, colorClass: "opt1-kpi-blue",   meta: "Awaiting your action" },
  { label: "Ownership Gaps",       value: kpiStats.ownershipGaps,         icon: AlertTriangle, colorClass: "opt1-kpi-red",    meta: "Critical positions" },
  { label: "Active SOPs",          value: kpiStats.activeSOPs,            icon: BookOpen,      colorClass: "opt1-kpi-green",  meta: "Published & effective" },
  { label: "Expiring Assignments", value: kpiStats.assignmentsExpiring,   icon: UserCheck,     colorClass: "opt1-kpi-amber",  meta: "Within 7 days" },
];

export const DashboardOption1: React.FC = () => {
  const navigate = useNavigate();
  return (
  <div className="opt1-content" style={{ height: "100%", padding: "14px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, background: "#f1f5f9" }}>
    {/* KPI row */}
    <div className="opt1-kpi-row">
      {KPI_CARDS.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className={`opt1-kpi-card ${kpi.colorClass}`}>
            <div className="opt1-kpi-icon"><Icon size={17} /></div>
            <div className="opt1-kpi-body">
              <div className="opt1-kpi-label">{kpi.label}</div>
              <div className="opt1-kpi-value">{kpi.value}</div>
              <div className="opt1-kpi-meta">{kpi.meta}</div>
            </div>
          </div>
        );
      })}
    </div>

    {/* ── Execution Layer quick-access (Module 1.5) ── */}
    <div style={{ display: "flex", gap: 8 }}>
      {[
        { label: "Boards", sub: "T1 · 2 Critical KPIs", icon: LayoutGrid, route: "/boards", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
        { label: "My Work", sub: "5 actions assigned today", icon: ClipboardList, route: "/my-work", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
        { label: "Actions", sub: "8 open · 2 escalated", icon: Wrench, route: "/actions", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
        { label: "Meetings", sub: "T2 in progress now", icon: CalendarDays, route: "/meetings", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
      ].map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} onClick={() => navigate(item.route)}
            style={{ flex: 1, padding: "10px 14px", background: item.bg, border: `1px solid ${item.border}`, borderRadius: 8, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, transition: "box-shadow 0.1s" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <Icon size={14} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{item.sub}</div>
            </div>
            <ChevronRight size={13} color={item.color} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </div>
        );
      })}
    </div>

    {/* Row 1 – Approvals + Activity */}
    <div className="opt1-row opt1-col-6-4">
      {/* Pending Approvals */}
      <div className="dwm-panel">
        <div className="dwm-panel-header">
          <div className="ph-title"><ClipboardList size={13} color="#2563eb" /> Pending Approvals <span className="ph-count">{pendingApprovals.length}</span></div>
          <button className="ph-action">View All →</button>
        </div>
        <div className="dwm-panel-body">
          <table className="dwm-table">
            <thead>
              <tr><th>ID / Type</th><th>Title</th><th>Submitted By</th><th>Step</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="td-primary" style={{ fontSize: 11 }}>{item.id}</div>
                    <span className={`dwm-type-chip ${TYPE_CLASS[item.type] ?? ""}`}>{item.type}</span>
                  </td>
                  <td><div className="td-primary" style={{ maxWidth: 200 }}>{item.title}</div></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="dwm-avatar sm" style={{ background: "#334155", fontSize: 10 }}>
                        {item.submittedBy.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="td-secondary">{item.submittedBy}</span>
                    </div>
                  </td>
                  <td><span className="td-secondary">{item.step}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} color="#94a3b8" />
                      <span className="td-secondary">{item.dueDate.slice(5)}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={item.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dwm-panel">
        <div className="dwm-panel-header">
          <div className="ph-title"><Clock size={13} color="#64748b" /> Recent Activity</div>
          <button className="ph-action">All Events →</button>
        </div>
        <div className="dwm-panel-body">
          {recentActivity.map((act) => (
            <div className="opt1-activity-item" key={act.id}>
              <div className={`opt1-act-icon ${act.type}`}><CheckCircle2 size={12} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{act.action}</div>
                <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{act.object}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{act.actor} · {act.timestamp}</div>
              </div>
              <ChevronRight size={13} color="#d1d5db" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── System Health / Validation Summary — UX Refinement §1 ── */}
    <SystemHealthPanel />

    {/* Row 2 – Gaps + Drafts */}
    <div className="opt1-row opt1-col-5-5">
      {/* Ownership Gaps */}
      <div className="dwm-panel">
        <div className="dwm-panel-header">
          <div className="ph-title">
            <AlertTriangle size={13} color="#dc2626" /> Ownership Gaps
            <span className="ph-count" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>{ownershipGaps.length}</span>
          </div>
          <button className="ph-action" style={{ color: "#dc2626" }} onClick={() => navigate("/assignments")}>Resolve All →</button>
        </div>
        <div className="dwm-panel-body">
          {ownershipGaps.map((gap) => (
            <div className="opt1-gap-item" key={gap.id} onClick={() => navigate("/assignments")} style={{ cursor: "pointer" }}>
              <div className="opt1-gap-pos">
                <span className="dwm-sev-dot high" />
                {gap.position}
                <span style={{ fontSize: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 3, padding: "1px 5px", marginLeft: "auto" }}>
                  {gap.affectedItems} affected
                </span>
              </div>
              <div className="opt1-gap-meta">{gap.orgUnit} · {gap.context}</div>
              <div className="opt1-gap-type">{gap.gapType}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Standards */}
      <div className="dwm-panel">
        <div className="dwm-panel-header">
          <div className="ph-title"><GitBranch size={13} color="#64748b" /> Draft Standards <span className="ph-count">{kpiStats.draftStandards}</span></div>
          <button className="ph-action" onClick={() => navigate("/standardization")}>All Drafts →</button>
        </div>
        <div className="dwm-panel-body">
          <table className="dwm-table">
            <thead><tr><th>Type</th><th>Title</th><th>Ver.</th><th>Owner</th><th>Modified</th></tr></thead>
            <tbody>
              {draftStandards.map((d) => (
                <tr key={d.id}>
                  <td><span className={`dwm-type-chip ${TYPE_CLASS[d.type] ?? ""}`}>{d.type}</span></td>
                  <td><span className="td-primary">{d.title}</span></td>
                  <td><span className="td-secondary">{d.version}</span></td>
                  <td><span className="td-secondary">{d.owner}</span></td>
                  <td><span className="td-secondary">{d.lastModified.slice(5)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};