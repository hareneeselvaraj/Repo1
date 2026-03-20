import React, { useState } from "react";
import { UserCheck, Search, Plus, AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import { assignments, people } from "../../../data/orgData";
import { currentContext } from "../../../data/mockData";

const STATUS_BADGE: Record<string, string> = {
  Active:   "dwm-badge-effective",
  Expired:  "dwm-badge-draft",
  Expiring: "dwm-badge-under-review",
  Pending:  "dwm-badge-submitted",
};

export const AssignmentConsole: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState(people[0]);
  const [showForm, setShowForm] = useState(false);
  const [personSearch, setPersonSearch] = useState("");

  const personAssignments = assignments.filter(
    (a) => a.person === selectedPerson.name
  );

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(personSearch.toLowerCase())
  );

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><UserCheck size={16} /></div>
        <div>
          <h1>Assignment Console</h1>
          <div className="ph-sub">Assign people to positions with context-aware resolution</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={12} /> New Assignment
          </button>
        </div>
      </div>

      <div className="split-layout">
        {/* Left – Person picker */}
        <div className="split-left">
          <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
            <div className="dwm-panel-header">
              <div className="ph-title"><Search size={12} color="#64748b" /> People</div>
            </div>
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div className="filter-input" style={{ maxWidth: "none" }}>
                <Search size={11} color="#94a3b8" />
                <input
                  placeholder="Search people…"
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="dwm-panel-body">
              {filteredPeople.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "8px 12px", cursor: "pointer",
                    background: selectedPerson.id === p.id ? "#eff6ff" : "transparent",
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.1s",
                  }}
                  onClick={() => setSelectedPerson(p)}
                >
                  <div className="dwm-avatar sm" style={{ background: "#1e40af" }}>{p.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.code}</div>
                  </div>
                  <span style={{ fontSize: 10, background: p.activeAssignments > 0 ? "#eff6ff" : "#f1f5f9", color: p.activeAssignments > 0 ? "#1e40af" : "#94a3b8", borderRadius: 9, padding: "1px 6px" }}>
                    {p.activeAssignments}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center – Assignments */}
        <div className="split-center">
          <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
            <div className="dwm-panel-header">
              <div className="ph-title">
                <UserCheck size={13} color="#2563eb" />
                Assignments — {selectedPerson.name}
                <span className="ph-count">{personAssignments.length}</span>
              </div>
            </div>

            {personAssignments.length === 0 ? (
              <div className="empty-state">
                <UserCheck size={28} className="es-icon" />
                <div className="es-title">No assignments for this person</div>
                <div className="es-sub">Create a new assignment using the button above</div>
              </div>
            ) : (
              <table className="dwm-table">
                <thead>
                  <tr><th>Position</th><th>Type</th><th>Context</th><th>Primary</th><th>Effective From</th><th>Effective To</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {personAssignments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="td-primary">{a.position}</div>
                        <div className="td-secondary">{a.positionCode}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f1f5f9", color: "#475569", fontWeight: 500 }}>
                          {a.assignmentType}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {a.context.site}
                          {a.context.department && ` / ${a.context.department}`}
                          {a.context.line && ` / ${a.context.line}`}
                          {a.context.shift && ` / ${a.context.shift}`}
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {a.isPrimary
                          ? <span style={{ fontSize: 10, background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac", borderRadius: 3, padding: "1px 5px", fontWeight: 600 }}>Primary</span>
                          : <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Calendar size={10} color="#94a3b8" />
                          <span className="td-secondary">{a.effectiveFrom}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {a.status === "Expiring" && <AlertTriangle size={11} color="#d97706" />}
                          <span className="td-secondary" style={{ color: a.status === "Expiring" ? "#d97706" : undefined }}>
                            {a.effectiveTo ?? "Ongoing"}
                          </span>
                        </div>
                      </td>
                      <td><span className={`dwm-badge ${STATUS_BADGE[a.status]}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right – Form */}
        <div className="split-right">
          <div className="detail-panel" style={{ flex: 1 }}>
            <div className="detail-panel-header">
              <div className="dph-title">{showForm ? "New Assignment" : "Assignment Details"}</div>
              <div className="dph-sub">Fill in all required fields marked with *</div>
            </div>
            <div className="detail-panel-body">
              {/* Overlap warning */}
              <div className="alert-bar warning">
                <AlertTriangle size={13} />
                <span>Overlap check will run on save. Verify context is unique for Primary assignments.</span>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Person *</label>
                  <input value={selectedPerson.name} readOnly style={{ background: "#f8fafc" }} />
                </div>
                <div className="form-field">
                  <label>Position *</label>
                  <select>
                    <option>Select position…</option>
                    <option>Production Supervisor</option>
                    <option>Quality Inspector</option>
                    <option>Process Engineer</option>
                    <option>Shift Supervisor</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Assignment Type *</label>
                  <select><option>Primary</option><option>Secondary</option><option>Acting</option></select>
                </div>
                <div className="form-field">
                  <label>Effective From *</label>
                  <input type="date" defaultValue="2026-03-12" />
                </div>
                <div className="form-field">
                  <label>Effective To</label>
                  <input type="date" />
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Context (configured dimensions)
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Site *</label>
                    <select><option>Chennai</option><option>Mumbai</option><option>Pune</option></select>
                  </div>
                  <div className="form-field">
                    <label>Department</label>
                    <select><option>Assembly</option><option>Quality Control</option><option>Maintenance</option></select>
                  </div>
                  <div className="form-field">
                    <label>Line</label>
                    <select><option>All</option><option>Line 1</option><option>Line 2</option><option>Line 3</option></select>
                  </div>
                  <div className="form-field">
                    <label>Shift</label>
                    <select><option>All</option><option>Day</option><option>Night</option><option>General</option></select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button className="dwm-btn dwm-btn-primary" style={{ flex: 1 }}>Save Assignment</button>
                <button className="dwm-btn dwm-btn-ghost">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
