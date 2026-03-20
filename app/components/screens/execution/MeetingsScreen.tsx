import React, { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Plus, ChevronRight,
  ArrowUpRight, MessageSquare, Users, X, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  meetings, Meeting, executionActions, t1KpiCells, abnormalities,
  ACTION_STATUS_COLOR, ACTION_PRIORITY_COLOR, KPI_STATUS_COLOR, TIER_COLOR,
  KpiStatus, Abnormality,
} from "../../../../data/executionData";
import { AbnormalityDispositionModal, DispositionBadge, RepeatFlagChip } from "./AbnormalityDispositionModal";

// ─── Status chip ───────────────────────────────────────────────────────────────
const MeetingStatusBadge: React.FC<{ status: Meeting["status"] }> = ({ status }) => {
  const cfg: Record<Meeting["status"], { bg: string; color: string; border: string }> = {
    Scheduled:   { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
    "In Progress":{ bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Completed:   { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  };
  const s = cfg[status];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
};

// ─── KPI Snapshot row for meeting ────────────────────────────────────────────
const KpiSnapshotRow: React.FC<{ status: KpiStatus; count: number; label: string }> = ({ status, count, label }) => {
  const sc = KPI_STATUS_COLOR[status];
  if (count === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: sc.bg, borderRadius: 5, border: `1px solid ${sc.border}` }}>
      <div style={{ width: 9, height: 9, borderRadius: "50%", background: sc.dot }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{count}</span>
      <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
    </div>
  );
};

// ─── Meeting Workspace (full screen detail) ───────────────────────────────────
const MeetingWorkspace: React.FC<{ meeting: Meeting; onClose: () => void }> = ({ meeting, onClose }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"kpi" | "abnormalities" | "actions" | "decisions" | "dispositions">("kpi");
  const [newDecision, setNewDecision] = useState("");
  const [newDecisionOwner, setNewDecisionOwner] = useState("");
  const [decisions, setDecisions] = useState(meeting.decisions);

  // Disposition state per abnormality
  const [abState, setAbState] = useState<Record<string, Abnormality>>(
    Object.fromEntries(abnormalities.map(a => [a.id, { ...a }]))
  );
  const [dispositionTarget, setDispositionTarget] = useState<Abnormality | null>(null);

  const handleDispositionSubmit = (ab: Abnormality, disp: any, just: string) => {
    setAbState(prev => ({
      ...prev,
      [ab.id]: { ...prev[ab.id], disposition: disp, justification: just, status: disp === "RCA" ? "Open" : "Resolved" },
    }));
    setDispositionTarget(null);
  };

  const tc = TIER_COLOR[meeting.tier];
  const meetingActions = executionActions.filter(a => meeting.actionIdsCreated.includes(a.id));
  const kpiAbs = abnormalities.filter(a => a.status !== "Resolved").slice(0, 6);
  const pendingDisposition = kpiAbs.filter(a => abState[a.id]?.disposition === null);

  const SECTIONS = [
    { id: "kpi" as const,            label: "KPI Snapshot",     count: Object.values(meeting.kpiSummary).reduce((a, b) => a + b, 0) },
    { id: "abnormalities" as const,  label: "Abnormalities",    count: meeting.openAbnormalities },
    { id: "dispositions" as const,   label: "Dispositions",     count: pendingDisposition.length, alert: pendingDisposition.length > 0 },
    { id: "actions" as const,        label: "Actions",          count: meeting.openActions },
    { id: "decisions" as const,      label: "Decisions",        count: decisions.length },
  ];

  const addDecision = () => {
    if (!newDecision.trim()) return;
    setDecisions(d => [...d, { id: `DEC-NEW-${d.length + 1}`, text: newDecision, owner: newDecisionOwner || "Unassigned", due: "TBD" }]);
    setNewDecision("");
    setNewDecisionOwner("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Workspace header */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #e2e8f0", background: tc.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{meeting.tier}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{meeting.title}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
              <Clock size={10} color="#94a3b8" />
              <span style={{ fontSize: 10, color: "#64748b" }}>{meeting.date} · {meeting.time}</span>
              <Users size={10} color="#94a3b8" />
              <span style={{ fontSize: 10, color: "#64748b" }}>{meeting.attendees.slice(0, 3).join(", ")}{meeting.attendees.length > 3 ? ` +${meeting.attendees.length - 3}` : ""}</span>
              <MeetingStatusBadge status={meeting.status} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/boards")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              <ArrowUpRight size={11} /> Open Board
            </button>
            <button onClick={onClose}
              style={{ padding: "5px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", color: "#64748b" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fafafa", flexShrink: 0, overflowX: "auto" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ padding: "8px 20px", border: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap", position: "relative",
              fontSize: 12, fontWeight: activeSection === s.id ? 700 : 500,
              color: activeSection === s.id ? "#1d4ed8" : "#64748b",
              borderBottom: activeSection === s.id ? "2px solid #2563eb" : "2px solid transparent",
            }}>
            {s.label}
            {s.count > 0 && <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8,
              background: (s as any).alert ? "#fef2f2" : activeSection === s.id ? "#dbeafe" : "#f1f5f9",
              color: (s as any).alert ? "#dc2626" : activeSection === s.id ? "#1d4ed8" : "#64748b" }}>{s.count}</span>}
            {/* Red dot for pending dispositions */}
            {(s as any).alert && activeSection !== s.id && (
              <span style={{ position: "absolute", top: 7, right: 10, width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />
            )}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* KPI Snapshot */}
        {activeSection === "kpi" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <KpiSnapshotRow status="Critical" count={meeting.kpiSummary.critical} label="Critical KPIs" />
              <KpiSnapshotRow status="Warning"  count={meeting.kpiSummary.warning}  label="Warning KPIs" />
              <KpiSnapshotRow status="Normal"   count={meeting.kpiSummary.normal}   label="Normal KPIs" />
              <KpiSnapshotRow status="Missing"  count={meeting.kpiSummary.missing}  label="Missing Signals" />
            </div>
            <table className="dwm-table">
              <thead>
                <tr><th>KPI</th><th>Value</th><th>Target</th><th>Status</th><th>Trend</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {t1KpiCells.map(kpi => {
                  const sc = KPI_STATUS_COLOR[kpi.status];
                  return (
                    <tr key={kpi.id}>
                      <td>
                        <div className="td-primary">{kpi.name}</div>
                        <div className="td-secondary">{kpi.measureCode}</div>
                      </td>
                      <td><span style={{ fontWeight: 700, color: sc.color }}>{kpi.value} <span style={{ fontWeight: 400, fontSize: 10 }}>{kpi.unit}</span></span></td>
                      <td><span className="td-secondary">{kpi.target} {kpi.unit}</span></td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {kpi.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: kpi.trend === "up" ? "#dc2626" : kpi.trend === "down" ? "#16a34a" : "#94a3b8" }}>
                          {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"}
                        </span>
                      </td>
                      <td>{kpi.actions > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>{kpi.actions}</span> : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Abnormalities */}
        {activeSection === "abnormalities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {kpiAbs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: 12 }}>
                <CheckCircle2 size={28} color="#22c55e" style={{ margin: "0 auto 8px", display: "block" }} />
                No active abnormalities
              </div>
            ) : kpiAbs.map(ab => {
              const currentAb = abState[ab.id] ?? ab;
              const isClosed = currentAb.disposition !== null;
              return (
                <div key={ab.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", opacity: isClosed ? 0.7 : 1 }}>
                  <div style={{ padding: "8px 14px", background: ab.severity === "Critical" ? "#fef2f2" : "#fff7ed", display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={13} color={ab.severity === "Critical" ? "#dc2626" : "#c2410c"} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: ab.severity === "Critical" ? "#dc2626" : "#c2410c" }}>{ab.severity}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{ab.type}</span>
                    {ab.isRepeatFlag && <RepeatFlagChip count={ab.repeatCount} suggested={ab.suggestedForRCA} />}
                    <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>Detected {ab.detectedAt}</span>
                    {isClosed
                      ? <DispositionBadge disposition={currentAb.disposition} />
                      : <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 8,
                          background: ab.status === "Open" ? "#fef2f2" : "#fffbeb", color: ab.status === "Open" ? "#dc2626" : "#d97706" }}>{ab.status}</span>
                    }
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", marginBottom: 4 }}>KPI: {ab.kpiName} · {ab.line}</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>{ab.description}</div>
                    {!isClosed && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ fontSize: 10, padding: "4px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
                          + Create Action
                        </button>
                        <button
                          onClick={() => setDispositionTarget(currentAb)}
                          style={{ fontSize: 10, padding: "4px 12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
                          ✓ Close Abnormality
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Dispositions (NEW §2.9 Meeting Integration) ── */}
        {activeSection === "dispositions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Section header */}
            <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>
                  Abnormalities Pending Closure — Force Decision During Meeting
                </div>
                <div style={{ fontSize: 11, color: "#78350f" }}>
                  Every abnormality must end with a classification. Review each one, confirm disposition, and decide on escalation.
                  No closure without decision.
                </div>
              </div>
            </div>

            {/* Disposition table */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 90px 90px 180px",
                padding: "7px 14px", background: "#f1f5f9",
                fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", gap: 12 }}>
                <div>KPI</div>
                <div>Abnormality</div>
                <div style={{ textAlign: "center" }}>Repeat?</div>
                <div style={{ textAlign: "center" }}>Classified</div>
                <div style={{ textAlign: "center" }}>Action</div>
              </div>

              {kpiAbs.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                  <CheckCircle2 size={22} color="#22c55e" style={{ display: "block", margin: "0 auto 6px" }} />
                  All abnormalities classified
                </div>
              ) : kpiAbs.map((ab, i) => {
                const currentAb = abState[ab.id] ?? ab;
                const isClosed = currentAb.disposition !== null;
                const isLast = i === kpiAbs.length - 1;
                return (
                  <div key={ab.id}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 90px 90px 180px",
                      padding: "10px 14px", gap: 12, alignItems: "center",
                      borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                      background: !isClosed ? "#fff" : "#fafafa",
                      opacity: isClosed ? 0.75 : 1,
                    }}>
                    {/* KPI */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{ab.kpiName}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{ab.line}</div>
                    </div>
                    {/* Abnormality */}
                    <div>
                      <div style={{ fontSize: 11, color: "#334155" }}>{ab.type}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>{ab.severity} · {ab.detectedAt}</div>
                    </div>
                    {/* Repeat */}
                    <div style={{ textAlign: "center" }}>
                      {ab.isRepeatFlag
                        ? <RepeatFlagChip count={ab.repeatCount} suggested={ab.suggestedForRCA} />
                        : <span style={{ fontSize: 10, color: "#94a3b8" }}>—</span>
                      }
                    </div>
                    {/* Classified */}
                    <div style={{ textAlign: "center" }}>
                      {isClosed
                        ? <DispositionBadge disposition={currentAb.disposition} />
                        : <span style={{ fontSize: 10, fontWeight: 600, color: "#dc2626" }}>⚠ Pending</span>
                      }
                    </div>
                    {/* Inline action buttons */}
                    <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
                      {!isClosed ? (
                        <>
                          <button
                            onClick={() => setDispositionTarget({ ...currentAb, disposition: null })}
                            style={{ fontSize: 9, padding: "3px 9px", background: "#15803d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
                            ✓ One-off
                          </button>
                          <button
                            onClick={() => setDispositionTarget({ ...currentAb, disposition: null })}
                            style={{ fontSize: 9, padding: "3px 9px", background: "#d97706", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
                            👁 Monitor
                          </button>
                          <button
                            onClick={() => setDispositionTarget({ ...currentAb, disposition: null })}
                            style={{ fontSize: 9, padding: "3px 9px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
                            ⚡ RCA
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>Classified</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Pending",     value: kpiAbs.filter(a => abState[a.id]?.disposition === null).length,                bg: "#fef2f2", color: "#dc2626" },
                { label: "Closed",      value: kpiAbs.filter(a => abState[a.id]?.disposition === "ONE_OFF").length,           bg: "#f0fdf4", color: "#15803d" },
                { label: "Monitoring",  value: kpiAbs.filter(a => abState[a.id]?.disposition === "MONITOR").length,           bg: "#fffbeb", color: "#d97706" },
                { label: "→ RCA / 1.6", value: kpiAbs.filter(a => abState[a.id]?.disposition === "RCA").length,              bg: "#eff6ff", color: "#1d4ed8" },
              ].map(s => (
                <div key={s.label} style={{ padding: "8px 14px", background: s.bg, borderRadius: 7, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {activeSection === "actions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Plus size={11} /> Create Action
              </button>
            </div>
            <table className="dwm-table">
              <thead>
                <tr><th>Action</th><th>Owner</th><th>Priority</th><th>Due</th><th>Status</th><th>Source</th></tr>
              </thead>
              <tbody>
                {executionActions.map(action => {
                  const sc = ACTION_STATUS_COLOR[action.status];
                  const pc = ACTION_PRIORITY_COLOR[action.priority];
                  return (
                    <tr key={action.id} onClick={() => navigate("/actions")} style={{ cursor: "pointer" }}>
                      <td>
                        <div className="td-primary" style={{ maxWidth: 260 }}>{action.title}</div>
                        <div className="td-secondary">{action.kpiName}</div>
                      </td>
                      <td>
                        <div className="td-primary">{action.ownerPosition}</div>
                        <div style={{ fontSize: 10, color: action.ownerPerson === "Not Resolved" ? "#dc2626" : "#94a3b8" }}>{action.ownerPerson}</div>
                      </td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: pc.bg, color: pc.color }}>{action.priority}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} color="#94a3b8" />
                          <span className="td-secondary">{action.dueTime}</span>
                        </div>
                      </td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: sc.bg, color: sc.color }}>{action.status}</span></td>
                      <td><span className="td-secondary">{action.source}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Decisions */}
        {activeSection === "decisions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {meeting.notes && (
              <div style={{ padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", marginBottom: 5, textTransform: "uppercase" }}>Meeting Notes</div>
                <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>{meeting.notes}</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {decisions.map((d, i) => (
                <div key={d.id} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", marginBottom: 4 }}>{d.text}</div>
                    <div style={{ display: "flex", gap: 10, fontSize: 10, color: "#64748b" }}>
                      <span>Owner: <strong style={{ color: "#334155" }}>{d.owner}</strong></span>
                      <span>Due: <strong style={{ color: "#334155" }}>{d.due}</strong></span>
                    </div>
                  </div>
                  <button style={{ fontSize: 10, padding: "3px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", flexShrink: 0 }}>
                    → Action
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 14px", background: "#f8fafc", border: "1px dashed #d1d5db", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>+ Add Decision / Note</div>
              <textarea value={newDecision} onChange={e => setNewDecision(e.target.value)}
                placeholder="Describe the decision or action agreed in this meeting…" rows={2}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newDecisionOwner} onChange={e => setNewDecisionOwner(e.target.value)} placeholder="Owner name…"
                  style={{ flex: 1, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11, outline: "none" }} />
                <button onClick={addDecision}
                  style={{ padding: "5px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disposition modal */}
      {dispositionTarget && (
        <AbnormalityDispositionModal
          abnormality={dispositionTarget}
          onClose={() => setDispositionTarget(null)}
          onSubmit={handleDispositionSubmit}
        />
      )}
    </div>
  );
};

// ─── Main MeetingsScreen ──────────────────────────────────────────────────────
export const MeetingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  return (
    <div className="screen-shell">
      {/* In-progress meeting alert */}
      {meetings.some(m => m.status === "In Progress") && (
        <div style={{ padding: "6px 18px", background: "#fffbeb", borderBottom: "1px solid #fde68a", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
            <Clock size={12} color="#d97706" />
            <strong style={{ color: "#92400e" }}>T2 Meeting in progress</strong>
            <span style={{ color: "#78350f" }}>— Assembly Dept Review · Started 10:00 AM</span>
            <button onClick={() => setSelectedMeeting(meetings.find(m => m.status === "In Progress") ?? null)}
              style={{ marginLeft: "auto", fontSize: 10, padding: "3px 10px", background: "#d97706", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
              Open Workspace →
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Tier Meetings</span>
        <span className="fb-count">{meetings.length} scheduled today</span>
        <button style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
          <Plus size={11} /> Schedule Meeting
        </button>
      </div>

      {/* Meeting cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {meetings.map(meeting => {
          const tc = TIER_COLOR[meeting.tier];
          return (
            <div key={meeting.id}
              style={{ background: "#fff", border: `1px solid ${meeting.status === "In Progress" ? "#fde68a" : "#e2e8f0"}`, borderRadius: 8,
                boxShadow: meeting.status === "In Progress" ? "0 2px 8px rgba(217,119,6,0.1)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
              {/* Header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                {/* Tier badge */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: tc.bg, border: `1px solid ${tc.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: tc.color }}>{meeting.tier}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{meeting.title}</span>
                    <MeetingStatusBadge status={meeting.status} />
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={9} /> {meeting.time}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={9} /> {meeting.attendees.length} attendees</span>
                    <span>Facilitator: {meeting.facilitator}</span>
                  </div>
                </div>

                {/* KPI summary pills */}
                <div style={{ display: "flex", gap: 5 }}>
                  {meeting.kpiSummary.critical > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#fef2f2", color: "#dc2626" }}>🔴 {meeting.kpiSummary.critical}</span>}
                  {meeting.kpiSummary.warning > 0  && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#fffbeb", color: "#d97706" }}>🟡 {meeting.kpiSummary.warning}</span>}
                  {meeting.kpiSummary.normal > 0   && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#f0fdf4", color: "#15803d" }}>🟢 {meeting.kpiSummary.normal}</span>}
                </div>

                <button onClick={() => setSelectedMeeting(meeting)}
                  style={{ padding: "6px 16px", background: meeting.status === "In Progress" ? "#d97706" : meeting.status === "Scheduled" ? "#2563eb" : "#f1f5f9",
                    color: meeting.status === "Completed" ? "#64748b" : "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  {meeting.status === "In Progress" ? "Continue →" : meeting.status === "Scheduled" ? "Start →" : "Review →"}
                </button>
              </div>

              {/* Footer */}
              <div style={{ padding: "8px 16px", borderTop: "1px solid #f1f5f9", background: "#fafafa", display: "flex", gap: 14, fontSize: 10, color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={10} color={meeting.openAbnormalities > 0 ? "#d97706" : "#94a3b8"} />
                  {meeting.openAbnormalities} abnormalities
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#94a3b8" }}>🔧</span>
                  {meeting.openActions} open actions
                </span>
                {meeting.decisions.length > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={10} color="#22c55e" />
                    {meeting.decisions.length} decisions recorded
                  </span>
                )}
                {meeting.notes && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MessageSquare size={10} color="#94a3b8" />
                    Notes available
                  </span>
                )}
                <div style={{ marginLeft: "auto" }}>
                  {meeting.context.line && <span>Line: <strong>{meeting.context.line}</strong></span>}
                  {meeting.context.department && <span>Dept: <strong>{meeting.context.department}</strong></span>}
                  {meeting.context.plant && <span>Plant: <strong>{meeting.context.plant}</strong></span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMeeting && <MeetingWorkspace meeting={selectedMeeting} onClose={() => setSelectedMeeting(null)} />}
    </div>
  );
};