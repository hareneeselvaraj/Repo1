import React, { useState } from "react";
import { Users, Search, Plus, Mail, Building2, Briefcase, UserCheck } from "lucide-react";
import { people, Person } from "../../../data/orgData";

const STATUS_STYLE: Record<string, string> = {
  "Active":   "dwm-badge-effective",
  "Inactive": "dwm-badge-draft",
  "On Leave": "dwm-badge-under-review",
};

const AVATAR_COLORS = ["#1e40af", "#15803d", "#7e22ce", "#c2410c", "#0369a1", "#4338ca"];

export const PeopleDirectory: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType,   setFilterType]   = useState("All");
  const [selected, setSelected] = useState<Person | null>(people[0]);

  const filtered = people.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const matchType   = filterType === "All" || p.employmentType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const colorFor = (idx: number) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><Users size={16} /></div>
        <div>
          <h1>People Directory</h1>
          <div className="ph-sub">View and manage all people records and assignments</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Import</button>
          <button className="dwm-btn dwm-btn-primary"><Plus size={12} /> Add Person</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-input">
          <Search size={12} color="#94a3b8" />
          <input
            placeholder="Search by name, code, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {["All", "Active", "Inactive", "On Leave"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {["All", "Full-time", "Contract", "Temporary"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="fb-count">{filtered.length} records</span>
      </div>

      <div className="split-layout">
        {/* List */}
        <div className="split-center">
          <div className="list-panel">
            <table className="dwm-table">
              <thead>
                <tr><th>Emp Code</th><th>Name</th><th>Email</th><th>Home Org</th><th>Type</th><th>Assignments</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    style={{ background: selected?.id === p.id ? "#eff6ff" : undefined }}
                  >
                    <td><span className="td-primary" style={{ fontFamily: "monospace", fontSize: 11 }}>{p.code}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="dwm-avatar sm" style={{ background: colorFor(i) }}>{p.initials}</div>
                        <span className="td-primary">{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={11} color="#94a3b8" />
                        <span className="td-secondary">{p.email}</span>
                      </div>
                    </td>
                    <td><span className="td-secondary">{p.homeOrg}</span></td>
                    <td>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f1f5f9", color: "#475569", fontWeight: 500 }}>
                        {p.employmentType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 600, color: p.activeAssignments > 0 ? "#1e40af" : "#94a3b8" }}>
                        {p.activeAssignments}
                      </span>
                    </td>
                    <td><span className={`dwm-badge ${STATUS_STYLE[p.status]}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="split-right">
            <div className="detail-panel" style={{ flex: 1 }}>
              <div className="detail-panel-header" style={{ textAlign: "center", padding: 16 }}>
                <div
                  className="dwm-avatar lg"
                  style={{
                    background: colorFor(people.indexOf(selected)),
                    width: 48, height: 48, fontSize: 16,
                    margin: "0 auto 8px",
                  }}
                >
                  {selected.initials}
                </div>
                <div className="dph-title">{selected.name}</div>
                <div className="dph-sub">{selected.code}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  <span className={`dwm-badge ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 3, background: "#f1f5f9", color: "#475569", fontWeight: 500 }}>
                    {selected.employmentType}
                  </span>
                </div>
              </div>
              <div className="detail-panel-body">
                <div>
                  <div className="detail-field">
                    <div className="df-label">Email</div>
                    <div className="df-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Mail size={11} color="#64748b" />{selected.email}
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="df-label">Home Org</div>
                    <div className="df-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Building2 size={11} color="#64748b" />{selected.homeOrg}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { icon: UserCheck, label: "Active Assignments", value: selected.activeAssignments, color: "#1e40af" },
                    { icon: Briefcase, label: "Employment Type",    value: selected.employmentType,   color: "#15803d" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <Icon size={11} color="#64748b" />
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{label}</span>
                      </div>
                      <div style={{ fontSize: typeof value === "number" ? 22 : 13, fontWeight: 700, color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="alert-bar info">
                  <span style={{ fontSize: 11 }}>
                    Click "View Assignments" to see all active and historical position assignments for this person.
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button className="dwm-btn dwm-btn-primary" style={{ flex: 1 }}>View Assignments</button>
                  <button className="dwm-btn dwm-btn-ghost" style={{ flex: 1 }}>Edit Person</button>
                </div>
                <button className="dwm-btn dwm-btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                  View Effective Responsibilities
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
