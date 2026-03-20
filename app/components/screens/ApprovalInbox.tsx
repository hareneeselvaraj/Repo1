import React, { useState } from "react";
import { Shield, Filter, CheckCircle2, XCircle, MessageSquare, Clock, AlertTriangle, ChevronRight, FileText } from "lucide-react";
import { pendingApprovals, ApprovalItem } from "../../../data/mockData";
import { sops } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";
import { OwnershipCard } from "../shared/OwnershipCard";

const TYPE_CLASS: Record<string, string> = {
  SOP: "dwm-type-sop", PFC: "dwm-type-pfc",
  Measure: "dwm-type-measure", "Role Sheet": "dwm-type-role-sheet", Process: "dwm-type-process",
};

const CHANGE_SUMMARY = [
  { section: "Step 3 – Condition Inspection", change: "Updated acceptance criteria reference from QC-STD-010 to QC-STD-012", type: "changed" },
  { section: "Step 2 – Physical Count",       change: "Added evidence requirement: 'Completed count record form'",          type: "added" },
  { section: "Step 4 – Timing Rule",          change: "Changed from '45 min' to '30 min' to align with cycle time KPI",    type: "changed" },
  { section: "Owner Position",                change: "Changed from 'Shift Supervisor' to 'Quality Inspector'",             type: "changed" },
];

export const ApprovalInbox: React.FC = () => {
  const [selected, setSelected] = useState<ApprovalItem | null>(pendingApprovals[0]);
  const [filterSev, setFilterSev] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [comment, setComment] = useState("");
  const [decided, setDecided] = useState<Record<string, string>>({});

  const filtered = pendingApprovals.filter((a) => {
    const matchSev  = filterSev  === "All" || a.severity === filterSev;
    const matchType = filterType === "All" || a.type === filterType;
    return matchSev && matchType;
  });

  const linkedSOP = sops.find((s) => s.id === "SOP-001");

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fef2f2", color: "#dc2626" }}><Shield size={16} /></div>
        <div>
          <h1>Approval Inbox</h1>
          <div className="ph-sub">Review, approve, reject, or request changes on submitted governance objects</div>
        </div>
        <div className="ph-actions">
          <select className="filter-select" value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
            {["All", "high", "medium", "low"].map((s) => <option key={s} value={s}>{s === "All" ? "All Severity" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {["All", "SOP", "PFC", "Role Sheet", "Measure", "Process"].map((t) => <option key={t}>{t === "All" ? "All Types" : t}</option>)}
          </select>
        </div>
      </div>

      <div className="split-layout">
        {/* Task list */}
        <div className="split-left" style={{ width: 340 }}>
          <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
            <div className="dwm-panel-header">
              <div className="ph-title"><Shield size={13} color="#dc2626" /> Pending Tasks <span className="ph-count">{filtered.length}</span></div>
            </div>
            <div className="dwm-panel-body">
              {filtered.map((item) => {
                const isSelected = selected?.id === item.id;
                const isDone = decided[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "10px 12px", cursor: "pointer",
                      background: isSelected ? "#eff6ff" : isDone ? "#f0fdf4" : "transparent",
                      borderBottom: "1px solid #f1f5f9",
                      borderLeft: `3px solid ${item.severity === "high" ? "#dc2626" : item.severity === "medium" ? "#d97706" : "#d1d5db"}`,
                      transition: "background 0.1s",
                    }}
                    onClick={() => setSelected(item)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span className={`dwm-type-chip ${TYPE_CLASS[item.type] ?? ""}`}>{item.type}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                          {item.id} · {item.step} step
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <Clock size={10} color="#94a3b8" />
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>Due {item.dueDate.slice(5)}</span>
                          <span style={{ fontSize: 10, color: "#94a3b8" }}>· by {item.submittedBy}</span>
                        </div>
                      </div>
                      {isDone ? (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3, background: isDone === "approved" ? "#dcfce7" : "#fef2f2", color: isDone === "approved" ? "#15803d" : "#dc2626" }}>
                          {isDone.toUpperCase()}
                        </span>
                      ) : (
                        <StatusBadge status={item.status as any} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review panel */}
        {selected && (
          <div className="split-center">
            <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
              {/* Review header */}
              <div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`dwm-type-chip ${TYPE_CLASS[selected.type] ?? ""}`}>{selected.type}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{selected.title}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {selected.id} · Submitted by {selected.submittedBy} on {selected.submittedAt} · Step: <strong>{selected.step}</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span className={`dwm-sev-dot ${selected.severity}`} />
                    <span style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{selected.severity} severity</span>
                  </div>
                  <StatusBadge status={selected.status as any} />
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Ownership */}
                <div className="dwm-panel">
                  <div className="dwm-panel-header"><div className="ph-title"><Shield size={13} color="#2563eb" /> Ownership Summary</div></div>
                  <div style={{ padding: 12 }}>
                    {linkedSOP && (
                      <OwnershipCard
                        ownerPosition={linkedSOP.ownerPosition}
                        resolvedPerson={linkedSOP.resolvedOwner}
                        context="Chennai / Assembly"
                      />
                    )}
                  </div>
                </div>

                {/* Change summary */}
                <div className="dwm-panel">
                  <div className="dwm-panel-header"><div className="ph-title"><FileText size={13} color="#2563eb" /> Change Summary</div></div>
                  <div style={{ padding: 0 }}>
                    {CHANGE_SUMMARY.map((c, i) => (
                      <div key={i} className={`diff-${c.type}`} style={{ margin: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 2 }}>{c.section}</div>
                        <div style={{ fontSize: 12 }}>{c.change}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation summary */}
                <div className="validation-panel">
                  <div className="vp-header"><AlertTriangle size={13} /> Validation Summary</div>
                  <div className="vp-item"><span className="vp-dot warning" /><span>Step 3 evidence requirement added – verify downstream impact on reporting systems</span></div>
                  <div className="vp-item"><span className="vp-dot info"    /><span>Ownership changed – confirm new responsible person has active assignment</span></div>
                  <div className="vp-item"><span className="vp-dot info"    /><span>Linked KPI "First Pass Yield" measurement frequency may need adjustment</span></div>
                </div>

                {/* Downstream impact */}
                <div className="dwm-panel">
                  <div className="dwm-panel-header">
                    <div className="ph-title"><AlertTriangle size={13} color="#d97706" /> Downstream Impact</div>
                    <span style={{ fontSize: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 9, padding: "0 7px" }}>1 Blocking</span>
                  </div>
                  <div style={{ padding: 0 }}>
                    {[
                      { type: "Measure",  title: "Torque Compliance Rate", severity: "Blocking", action: "Update measurement method" },
                      { type: "Process",  title: "Final Assembly Operation", severity: "Medium",  action: "Review participant list" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                        <span className={`dwm-sev-dot ${item.severity === "Blocking" ? "high" : "medium"}`} />
                        <span className={`dwm-type-chip ${TYPE_CLASS[item.type] ?? ""}`}>{item.type}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.action}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: item.severity === "Blocking" ? "#fef2f2" : "#fffbeb", color: item.severity === "Blocking" ? "#dc2626" : "#d97706" }}>
                          {item.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment box */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Comment / Reason
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add comment or reason for your decision…"
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontFamily: "var(--dwm-font)", fontSize: 12, color: "#0f172a", resize: "vertical", minHeight: 70, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Action bar */}
              <div className="approval-action-bar">
                <button
                  className={`dwm-btn btn-approve`}
                  onClick={() => setDecided((d) => ({ ...d, [selected.id]: "approved" }))}
                >
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button
                  className="dwm-btn btn-request-change"
                  onClick={() => setDecided((d) => ({ ...d, [selected.id]: "changes" }))}
                >
                  <MessageSquare size={13} /> Request Changes
                </button>
                <button
                  className="dwm-btn btn-reject"
                  onClick={() => setDecided((d) => ({ ...d, [selected.id]: "rejected" }))}
                >
                  <XCircle size={13} /> Reject
                </button>
                <div style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
                  Due: <strong style={{ color: "#0f172a" }}>{selected.dueDate}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
