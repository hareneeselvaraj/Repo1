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
  CheckSquare,
  FileText,
  BarChart2,
  Shield,
} from "lucide-react";
import "../../../styles/dwm-option2.css";
import { Sidebar } from "../shared/Sidebar";
import { ContextBar } from "../shared/ContextBar";
import { StatusBadge } from "../shared/StatusBadge";
import {
  currentUser,
  currentContext,
  kpiStats,
  pendingApprovals,
  ownershipGaps,
  recentActivity,
  draftStandards,
  myTasks,
} from "../../../data/mockData";

// ─── Dashboard Option 2 – Workspace Hub ──────────────────────────────────────
// White sidebar • welcome banner • My Tasks prominently • 3-col widget grid

const TYPE_CLASS: Record<string, string> = {
  SOP: "dwm-type-sop",
  PFC: "dwm-type-pfc",
  Measure: "dwm-type-measure",
  "Role Sheet": "dwm-type-role-sheet",
  Process: "dwm-type-process",
};

const DRAFT_ICON_STYLE: Record<string, React.CSSProperties> = {
  SOP:        { background: "#eff6ff", color: "#1e40af" },
  PFC:        { background: "#f0fdf4", color: "#15803d" },
  Measure:    { background: "#fdf4ff", color: "#7e22ce" },
  "Role Sheet":{ background: "#fff7ed", color: "#c2410c" },
};

export const DashboardOption2: React.FC = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [ctx, setCtx] = useState(currentContext);

  const handleCtxChange = (key: keyof typeof ctx, value: string) => {
    setCtx((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="dwm-root opt2-shell">
      {/* Sidebar – light variant */}
      <Sidebar variant="light" activeId={activeNav} onNavigate={setActiveNav} />

      {/* Main */}
      <div className="opt2-main">
        {/* Header */}
        <header className="opt2-header">
          <span className="h-title">Dashboard</span>

          <div className="h-search">
            <Search size={13} color="#94a3b8" />
            <input placeholder="Search SOPs, processes, people…" />
          </div>

          <div className="opt2-header-actions">
            <button
              className="dwm-btn dwm-btn-primary"
              style={{ padding: "4px 12px", fontSize: 11 }}
            >
              <Plus size={12} /> New Standard
            </button>

            <button className="opt2-icon-btn" title="Notifications">
              <Bell size={16} />
              <span className="opt2-notif-dot">{kpiStats.pendingApprovals}</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <div className="dwm-avatar" style={{ background: "#1e40af" }}>
                {currentUser.initials}
              </div>
            </div>
          </div>
        </header>

        {/* Context bar */}
        <ContextBar context={ctx} onContextChange={handleCtxChange} />

        {/* Welcome banner */}
        <div className="opt2-welcome">
          <div className="opt2-welcome-text">
            <h2>Good morning, {currentUser.name}!</h2>
            <p>{currentUser.role} · {ctx.site} / {ctx.department} / {ctx.line} / {ctx.shift} Shift</p>
          </div>

          <div className="opt2-welcome-stats">
            <div className="opt2-welcome-stat danger">
              <div className="ws-value">{kpiStats.pendingApprovals}</div>
              <div className="ws-label">Pending<br />Approvals</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)", alignSelf: "stretch" }} />
            <div className="opt2-welcome-stat warning">
              <div className="ws-value">{kpiStats.ownershipGaps}</div>
              <div className="ws-label">Ownership<br />Gaps</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)", alignSelf: "stretch" }} />
            <div className="opt2-welcome-stat">
              <div className="ws-value">{kpiStats.draftStandards}</div>
              <div className="ws-label">Draft<br />Standards</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.15)", alignSelf: "stretch" }} />
            <div className="opt2-welcome-stat warning">
              <div className="ws-value">{kpiStats.assignmentsExpiring}</div>
              <div className="ws-label">Expiring<br />Assigns.</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="opt2-content">
          {/* My Tasks */}
          <div className="opt2-tasks-block">
            <div className="opt2-tasks-header">
              <div className="th-title">
                <CheckSquare size={13} color="#2563eb" />
                My Tasks
                <span className="dwm-badge dwm-badge-submitted">{myTasks.length}</span>
              </div>
              <button className="ph-action" style={{ fontSize: 11, color: "#2563eb", border: "none", background: "none", cursor: "pointer" }}>
                View All →
              </button>
            </div>

            {myTasks.map((task) => (
              <div className="opt2-task-item" key={task.id}>
                <div className="opt2-task-checkbox" />
                <span className={`opt2-task-priority-dot ${task.priority}`} />
                <div className="opt2-task-title">{task.title}</div>
                <span className="opt2-task-type">{task.type}</span>
                <div className={`opt2-task-due ${task.overdue ? "overdue" : ""}`}>
                  <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
                  {task.overdue ? "Overdue – " : "Due "}{task.dueDate}
                </div>
                <ChevronRight size={13} color="#d1d5db" />
              </div>
            ))}
          </div>

          {/* Widget grid – 3 columns */}
          <div className="opt2-widget-grid">
            {/* Pending Approvals */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <ClipboardList size={13} color="#2563eb" />
                  Pending Approvals
                  <span className="ph-count">{pendingApprovals.length}</span>
                </div>
                <button className="ph-action">All →</button>
              </div>
              <div className="dwm-panel-body">
                {pendingApprovals.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "8px 14px", borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className={`dwm-sev-dot ${item.severity}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {item.id} · {item.step} · Due {item.dueDate.slice(5)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership Gaps */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <AlertTriangle size={13} color="#dc2626" />
                  Ownership Gaps
                  <span className="ph-count" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>
                    {ownershipGaps.length}
                  </span>
                </div>
                <button className="ph-action" style={{ color: "#dc2626" }}>Resolve →</button>
              </div>
              <div className="dwm-panel-body">
                {ownershipGaps.map((gap) => (
                  <div className="opt2-gap-item" key={gap.id}>
                    <div className="opt2-gap-pos">
                      <span className="dwm-sev-dot high" />
                      {gap.position}
                    </div>
                    <div className="opt2-gap-detail">{gap.orgUnit}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "#dc2626" }}>{gap.gapType}</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{gap.affectedItems} items affected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Standards */}
            <div className="dwm-panel">
              <div className="dwm-panel-header">
                <div className="ph-title">
                  <BookOpen size={13} color="#64748b" />
                  Draft Standards
                  <span className="ph-count">{kpiStats.draftStandards}</span>
                </div>
                <button className="ph-action">All Drafts →</button>
              </div>
              <div className="dwm-panel-body">
                {draftStandards.map((d) => (
                  <div className="opt2-draft-item" key={d.id}>
                    <div
                      className="opt2-draft-icon"
                      style={DRAFT_ICON_STYLE[d.type] ?? { background: "#f1f5f9", color: "#475569" }}
                    >
                      <FileText size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {d.version} · {d.owner} · {d.lastModified.slice(5)}
                      </div>
                    </div>
                    <span className={`dwm-type-chip ${TYPE_CLASS[d.type] ?? ""}`}>{d.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity – full width */}
          <div className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title">
                <Clock size={13} color="#64748b" />
                Recently Updated
              </div>
              <button className="ph-action">Audit Trail →</button>
            </div>
            <div
              className="dwm-panel-body"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              {recentActivity.map((act) => (
                <div className="opt2-recent-item" key={act.id}>
                  <div className={`opt2-recent-icon ${act.type}`}>
                    {act.type === "approval" && <Shield size={11} />}
                    {act.type === "creation" && <Plus size={11} />}
                    {act.type === "update" && <BarChart2 size={11} />}
                    {act.type === "publish" && <BookOpen size={11} />}
                    {act.type === "link" && <FileText size={11} />}
                    {act.type === "resolve" && <CheckSquare size={11} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{act.action}</div>
                    <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.object}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{act.actor} · {act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
