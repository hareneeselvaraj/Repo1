import React, { useState } from "react";
import { UserCog, Plus, Clock, AlertTriangle, Calendar } from "lucide-react";
import { people } from "../../../data/orgData";

const DELEGATIONS = [
  { id: "DEL-001", source: "Ravi Kumar", sourcePos: "Production Supervisor", delegate: "Arun Sekar", delegatePos: "Shift Supervisor", scope: "SOP Approval – Assembly", from: "2026-03-10", to: "2026-03-20", reason: "Annual leave", status: "Active" },
  { id: "DEL-002", source: "Meena Sundaram", sourcePos: "QC Manager",         delegate: "Lakshmi Iyer", delegatePos: "Quality Inspector", scope: "Quality Review Tasks",    from: "2026-02-01", to: "2026-02-28", reason: "Training program", status: "Expired" },
];

export const DelegationScreen: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fdf4ff", color: "#7e22ce" }}><UserCog size={16} /></div>
        <div>
          <h1>Delegation / Acting Assignments</h1>
          <div className="ph-sub">Create and manage time-bound delegated authority</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={12} /> New Delegation
          </button>
        </div>
      </div>

      <div className="split-layout">
        <div className="split-center">
          <div className="dwm-panel" style={{ flex: 1 }}>
            <div className="dwm-panel-header">
              <div className="ph-title"><UserCog size={13} color="#7e22ce" /> Active Delegations <span className="ph-count">{DELEGATIONS.length}</span></div>
            </div>
            <table className="dwm-table">
              <thead>
                <tr><th>ID</th><th>From (Source)</th><th>Delegate</th><th>Delegated Scope</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DELEGATIONS.map((d) => (
                  <tr key={d.id}>
                    <td><span className="td-primary" style={{ fontFamily: "monospace", fontSize: 11 }}>{d.id}</span></td>
                    <td>
                      <div className="td-primary">{d.source}</div>
                      <div className="td-secondary">{d.sourcePos}</div>
                    </td>
                    <td>
                      <div className="td-primary">{d.delegate}</div>
                      <div className="td-secondary">{d.delegatePos}</div>
                    </td>
                    <td><span className="td-secondary">{d.scope}</span></td>
                    <td><span className="td-secondary">{d.from}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} color="#94a3b8" />
                        <span className="td-secondary">{d.to}</span>
                      </div>
                    </td>
                    <td><span className="td-secondary" style={{ fontStyle: "italic" }}>{d.reason}</span></td>
                    <td>
                      <span className={`dwm-badge ${d.status === "Active" ? "dwm-badge-effective" : "dwm-badge-draft"}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="split-right">
            <div className="detail-panel" style={{ flex: 1 }}>
              <div className="detail-panel-header">
                <div className="dph-title">New Delegation</div>
                <div className="dph-sub">All date-bound. Will auto-expire.</div>
              </div>
              <div className="detail-panel-body">
                <div className="alert-bar warning">
                  <AlertTriangle size={12} />
                  <span>Delegation grants the delegate's actions legal weight of the source position. Review scope carefully.</span>
                </div>

                <div className="form-grid">
                  <div className="form-field"><label>Source Person *</label>
                    <select><option>Ravi Kumar</option>{people.map((p) => <option key={p.id}>{p.name}</option>)}</select>
                  </div>
                  <div className="form-field"><label>Source Position</label>
                    <input value="Production Supervisor" readOnly style={{ background: "#f8fafc" }} />
                  </div>
                  <div className="form-field"><label>Delegate Person *</label>
                    <select><option>Select delegate…</option>{people.map((p) => <option key={p.id}>{p.name}</option>)}</select>
                  </div>
                  <div className="form-field"><label>Delegated Scope *</label>
                    <select>
                      <option>SOP Review & Approval</option>
                      <option>Quality Deviation Sign-off</option>
                      <option>Production Approval</option>
                      <option>Full Position Authority</option>
                    </select>
                  </div>
                  <div className="form-field"><label>Effective From *</label><input type="date" defaultValue="2026-03-12" /></div>
                  <div className="form-field"><label>Effective To (Auto-expire) *</label><input type="date" /></div>
                  <div className="form-field" style={{ gridColumn: "1/-1" }}>
                    <label>Reason *</label>
                    <textarea placeholder="State reason for delegation…" style={{ minHeight: 60 }} />
                  </div>
                </div>

                <div className="alert-bar info">
                  <Clock size={12} />
                  <span>Delegation will auto-expire on the To date. Affected approval scopes will revert to source.</span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button className="dwm-btn dwm-btn-primary" style={{ flex: 1 }}>Create Delegation</button>
                  <button className="dwm-btn dwm-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
