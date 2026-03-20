import React, { useState } from "react";
import {
  Search,
  Bell,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Clock,
  ChevronRight,
  Plus,
  Shield,
  UserCheck,
  GitBranch,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../../../styles/dwm-option3.css";
import { Sidebar } from "../shared/Sidebar";
import { ContextBar } from "../shared/ContextBar";
import { StatusBadge } from "../shared/StatusBadge";
import {
  currentUser,
  currentContext,
  kpiStats,
  pendingApprovals,
  ownershipGaps,
  standardsStatusData,
  approvalTrendData,
  ownershipHealthData,
} from "../../../data/mockData";

// ─── Dashboard Option 3 – Analytics Overview ─────────────────────────────────
// Minimal gray sidebar • 6-tile metric strip • charts-first 3-col layout

const TYPE_CLASS: Record<string, string> = {
  SOP: "dwm-type-sop",
  PFC: "dwm-type-pfc",
  Measure: "dwm-type-measure",
  "Role Sheet": "dwm-type-role-sheet",
  Process: "dwm-type-process",
};

const METRIC_TILES = [
  { label: "Pending Approvals", value: kpiStats.pendingApprovals, color: "opt3-m-blue",   delta: "+2 today", deltaType: "down" as const },
  { label: "Ownership Gaps",    value: kpiStats.ownershipGaps,    color: "opt3-m-red",    delta: "−1 resolved", deltaType: "up" as const },
  { label: "Active SOPs",       value: kpiStats.activeSOPs,       color: "opt3-m-green",  delta: "+3 this week", deltaType: "up" as const },
  { label: "Expiring Assigns.", value: kpiStats.assignmentsExpiring, color: "opt3-m-amber", delta: "Within 7d", deltaType: "warn" as const },
  { label: "Draft Standards",   value: kpiStats.draftStandards,   color: "opt3-m-purple", delta: "Awaiting submit", deltaType: "warn" as const },
  { label: "Impact Pending",    value: kpiStats.impactPending,    color: "opt3-m-teal",   delta: "Need review", deltaType: "warn" as const },
];

const ALERTS = [
  { id: "A1", severity: "high",   title: "QC Inspector – No Assignment",         desc: "Chennai / Line 1 – Since Mar 5" },
  { id: "A2", severity: "high",   title: "Engine Assembly PFC – Due Mar 14",      desc: "APR-2026-003 · Approver step" },
  { id: "A3", severity: "medium", title: "Process Engineer – Assignment Expired",  desc: "Chennai / Line 2 / Night Shift" },
  { id: "A4", severity: "medium", title: "Assembly SOP Rev 2.1 – Awaiting Review", desc: "APR-2026-001 · Due Mar 15" },
  { id: "A5", severity: "low",    title: "3 Assignments expiring within 7 days",   desc: "Bangalore, Mumbai sites" },
];

const QUICK_ACTIONS = [
  { label: "Open Approval Inbox",   icon: ClipboardList, color: "#2563eb" },
  { label: "Resolve Ownership Gaps", icon: AlertTriangle, color: "#dc2626" },
  { label: "Create New SOP",         icon: BookOpen,      color: "#15803d" },
  { label: "Assign Positions",       icon: UserCheck,     color: "#d97706" },
];

// Custom recharts tooltip
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <strong style={{ color: payload[0].payload.color }}>{payload[0].name}</strong>: {payload[0].value}
    </div>
  );
};

export const DashboardOption3: React.FC = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [ctx, setCtx] = useState(currentContext);

  const handleCtxChange = (key: keyof typeof ctx, value: string) => {
    setCtx((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="dwm-root opt3-shell">
      {/* Sidebar – minimal variant */}
      <Sidebar variant="minimal" activeId={activeNav} onNavigate={setActiveNav} />

      {/* Main */}
      <div className="opt3-main">
        {/* Header */}
        <header className="opt3-header">
          <span className="h-title">Dashboard</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Analytics Overview</span>

          <div className="h-search" style={{ marginLeft: "auto" }}>
            <Search size={13} color="#94a3b8" />
            <input placeholder="Search processes, SOPs, positions…" />
          </div>

          <div className="opt3-header-actions">
            <button
              className="dwm-btn dwm-btn-primary"
              style={{ padding: "4px 12px", fontSize: 11 }}
            >
              <Plus size={12} /> Quick Action
            </button>
            <button className="opt3-icon-btn">
              <Bell size={16} />
              <span className="opt3-notif-dot">{kpiStats.pendingApprovals}</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <div className="dwm-avatar" style={{ background: "#1e40af" }}>
                {currentUser.initials}
              </div>
              <div style={{ fontSize: 11 }}>
                <div style={{ fontWeight: 500, color: "#0f172a", fontSize: 12 }}>{currentUser.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 10 }}>{currentUser.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Context bar */}
        <ContextBar context={ctx} onContextChange={handleCtxChange} />

        {/* Metric strip */}
        <div className="opt3-metric-strip">
          {METRIC_TILES.map((m) => (
            <div key={m.label} className={`opt3-metric-tile ${m.color}`}>
              <div className="opt3-metric-value">{m.value}</div>
              <div className="opt3-metric-label">{m.label}</div>
              <div className={`opt3-metric-delta ${m.deltaType}`}>
                {m.deltaType === "up" ? "▲" : m.deltaType === "down" ? "▼" : "●"} {m.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="opt3-content">
          {/* Three-column layout */}
          <div className="opt3-triple-grid">
            {/* Column 1 – Approval Trend Chart */}
            <div className="opt3-chart-panel">
              <div className="cp-header">
                <div className="cp-title">
                  <TrendingUp size={13} color="#2563eb" />
                  Approval Activity (6 months)
                </div>
                <span className="cp-sub">Submitted vs Approved vs Rejected</span>
              </div>
              <div className="cp-body" style={{ padding: "12px 8px 6px", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={approvalTrendData} barSize={10} barCategoryGap="30%">
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="submitted" name="Submitted" fill="#93c5fd" radius={[2,2,0,0]} />
                    <Bar dataKey="approved"  name="Approved"  fill="#4ade80" radius={[2,2,0,0]} />
                    <Bar dataKey="rejected"  name="Rejected"  fill="#fca5a5" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="opt3-legend">
                {[{ c: "#93c5fd", l: "Submitted" }, { c: "#4ade80", l: "Approved" }, { c: "#fca5a5", l: "Rejected" }].map(({ c, l }) => (
                  <div className="opt3-legend-item" key={l}>
                    <div className="opt3-legend-dot" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 – Standards Health Pie + Ownership */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Standards status pie */}
              <div className="opt3-chart-panel" style={{ flex: 1 }}>
                <div className="cp-header">
                  <div className="cp-title">
                    <BookOpen size={13} color="#15803d" />
                    Standards Status
                  </div>
                  <span className="cp-sub">256 total</span>
                </div>
                <div className="cp-body" style={{ flexDirection: "column", gap: 4, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={standardsStatusData}
                        cx="40%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={68}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {standardsStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 10, color: "#475569" }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ownership health */}
              <div className="opt3-chart-panel" style={{ flex: 1 }}>
                <div className="cp-header">
                  <div className="cp-title">
                    <UserCheck size={13} color="#d97706" />
                    Ownership Health
                  </div>
                  <span className="cp-sub">150 positions</span>
                </div>
                <div className="cp-body" style={{ height: 130 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ownershipHealthData}
                        cx="40%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={52}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {ownershipHealthData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 10, color: "#475569" }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Column 3 – Alerts + Quick Actions */}
            <div className="opt3-alert-panel">
              <div className="opt3-alert-header">
                <AlertTriangle size={13} color="#dc2626" />
                Active Alerts
                <span
                  style={{
                    marginLeft: "auto", background: "#fef2f2", color: "#dc2626",
                    border: "1px solid #fecaca", borderRadius: 10, padding: "0 7px", fontSize: 10,
                  }}
                >
                  {ALERTS.length}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {ALERTS.map((a) => (
                  <div className="opt3-alert-item" key={a.id}>
                    <div className="opt3-alert-row">
                      <div className={`opt3-alert-indicator ${a.severity}`} />
                      <div className="opt3-alert-body">
                        <div className="opt3-alert-title">{a.title}</div>
                        <div className="opt3-alert-desc">{a.desc}</div>
                      </div>
                      <ChevronRight size={12} color="#d1d5db" style={{ flexShrink: 0 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="opt3-quick-actions">
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                  Quick Actions
                </div>
                {QUICK_ACTIONS.map(({ label, icon: Icon, color }) => (
                  <button key={label} className="opt3-quick-btn">
                    <Icon size={12} color={color} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row – Approval list + Gaps */}
          <div className="opt3-bottom-row">
            {/* Recent Approvals list */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <ClipboardList size={13} color="#2563eb" />
                  Pending Approvals
                  <span className="ph-count">{pendingApprovals.length}</span>
                </div>
                <button className="ph-action">Open Inbox →</button>
              </div>
              <div className="dwm-panel-body">
                {pendingApprovals.slice(0, 5).map((item) => (
                  <div className="opt3-appr-item" key={item.id}>
                    <span className={`dwm-sev-dot ${item.severity}`} />
                    <span className={`dwm-type-chip ${TYPE_CLASS[item.type] ?? ""}`}>{item.type}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        {item.submittedBy} · {item.step} · Due {item.dueDate.slice(5)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                    <ChevronRight size={12} color="#d1d5db" />
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership Gaps */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <Shield size={13} color="#dc2626" />
                  Ownership Gaps
                  <span className="ph-count" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>
                    {ownershipGaps.length}
                  </span>
                </div>
                <button className="ph-action" style={{ color: "#dc2626" }}>Assignments →</button>
              </div>
              <div className="dwm-panel-body">
                {ownershipGaps.map((gap) => (
                  <div
                    key={gap.id}
                    style={{ padding: "9px 14px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span className="dwm-sev-dot high" />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#991b1b", flex: 1 }}>
                        {gap.position}
                      </span>
                      <span style={{ fontSize: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 3, padding: "1px 5px" }}>
                        {gap.affectedItems} affected
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                      <span>{gap.orgUnit}</span>
                      <span style={{ color: "#dc2626", fontSize: 10 }}>{gap.gapType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
