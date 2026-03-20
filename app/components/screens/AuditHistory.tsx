import React, { useState } from "react";
import { History, Search, Download, Filter } from "lucide-react";
import { auditEvents, AuditEvent } from "../../../data/standardsData";

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  APPROVED:        { bg: "#f0fdf4", color: "#15803d" },
  CREATED:         { bg: "#eff6ff", color: "#1e40af" },
  UPDATED:         { bg: "#fffbeb", color: "#d97706" },
  PUBLISHED:       { bg: "#f0fdf4", color: "#0891b2" },
  LINKED:          { bg: "#fdf4ff", color: "#7e22ce" },
  RESOLVED:        { bg: "#f0fdf4", color: "#15803d" },
  SUBMITTED:       { bg: "#eff6ff", color: "#2563eb" },
  REJECTED:        { bg: "#fef2f2", color: "#dc2626" },
  DEACTIVATED:     { bg: "#fef2f2", color: "#991b1b" },
  VERSION_CREATED: { bg: "#f0f9ff", color: "#0369a1" },
};

const OBJ_TYPE_CLASS: Record<string, string> = {
  SOP:        "dwm-type-sop",
  PFC:        "dwm-type-pfc",
  Measure:    "dwm-type-measure",
  "Role Sheet": "dwm-type-role-sheet",
  Process:    "dwm-type-process",
  Position:   "dwm-type-process",
  Assignment: "dwm-type-sop",
  Person:     "dwm-type-pfc",
  Gap:        "dwm-type-role-sheet",
};

export const AuditHistory: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("All");
  const [filterObj, setFilterObj] = useState("All");
  const [activeTab, setActiveTab] = useState("change-log");

  const filtered = auditEvents.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.actor.toLowerCase().includes(q) ||
      e.objectTitle.toLowerCase().includes(q) ||
      e.objectId.toLowerCase().includes(q);
    const matchAction = filterAction === "All" || e.action === filterAction;
    const matchObj    = filterObj    === "All" || e.objectType === filterObj;
    return matchSearch && matchAction && matchObj;
  });

  const TABS = [
    { id: "change-log",      label: "Change Log" },
    { id: "approval-history", label: "Approval History" },
    { id: "event-history",   label: "Event History" },
    { id: "version-history", label: "Version History" },
  ];

  const uniqueActions = ["All", ...Array.from(new Set(auditEvents.map((e) => e.action)))];
  const uniqueTypes   = ["All", ...Array.from(new Set(auditEvents.map((e) => e.objectType)))];

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#f8fafc", color: "#475569" }}><History size={16} /></div>
        <div>
          <h1>Audit & History</h1>
          <div className="ph-sub">Full traceability of all platform changes, approvals, and events</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost"><Download size={12} /> Export</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ background: "#ffffff", padding: "0 18px" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tb-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-input">
          <Search size={12} color="#94a3b8" />
          <input
            placeholder="Search actor, object ID, or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterObj} onChange={(e) => setFilterObj(e.target.value)}>
          {uniqueTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          {uniqueActions.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input type="date" className="filter-select" title="From date" />
        <input type="date" className="filter-select" title="To date" />
        <span className="fb-count">{filtered.length} events</span>
      </div>

      <div className="content-area" style={{ padding: "12px 18px" }}>
        <div className="list-panel">
          <table className="dwm-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Object Type</th>
                <th>Object ID</th>
                <th>Object / Summary</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const as = ACTION_STYLE[ev.action] ?? { bg: "#f1f5f9", color: "#475569" };
                return (
                  <tr key={ev.id} style={{ cursor: "default" }}>
                    <td>
                      <div className="td-primary" style={{ fontSize: 11, fontFamily: "monospace" }}>
                        {ev.timestamp.split(" ")[0]}
                      </div>
                      <div className="td-secondary" style={{ fontFamily: "monospace" }}>
                        {ev.timestamp.split(" ")[1]}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div className="dwm-avatar sm" style={{ background: "#1e40af" }}>
                          {ev.actor.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="td-primary" style={{ fontSize: 11 }}>{ev.actor}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: as.bg, color: as.color }}>
                        {ev.action.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`dwm-type-chip ${OBJ_TYPE_CLASS[ev.objectType] ?? ""}`}>
                        {ev.objectType}
                      </span>
                    </td>
                    <td>
                      <span className="td-secondary" style={{ fontFamily: "monospace", fontSize: 11 }}>
                        {ev.objectId}
                      </span>
                    </td>
                    <td>
                      <span className="td-primary" style={{ maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ev.objectTitle}
                      </span>
                    </td>
                    <td>
                      <span className="td-secondary" style={{ fontSize: 11, color: "#dc2626" }}>
                        {ev.oldValue ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span className="td-secondary" style={{ fontSize: 11, color: "#15803d" }}>
                        {ev.newValue ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span className="td-secondary" style={{ fontSize: 11 }}>
                        {ev.reason ?? "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
