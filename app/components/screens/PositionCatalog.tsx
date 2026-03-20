import React, { useState } from "react";
import { Briefcase, Search, Plus, Edit2, CheckCircle2, XCircle, Users, FileText, GitBranch, ChartBar } from "lucide-react";
import { positions, Position } from "../../../data/orgData";
import { OwnershipCard } from "../shared/OwnershipCard";

export const PositionCatalog: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterScope, setFilterScope] = useState("All");
  const [selected, setSelected] = useState<Position | null>(positions[0]);

  const filtered = positions.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchScope = filterScope === "All" || p.scopeType === filterScope;
    return matchSearch && matchScope;
  });

  const scopeTypes = ["All", "Enterprise", "Site", "Department", "Team"];

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><Briefcase size={16} /></div>
        <div>
          <h1>Position Catalog</h1>
          <div className="ph-sub">Manage all positions, role sheets, and ownership capabilities</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost"><Edit2 size={12} /> Edit</button>
          <button className="dwm-btn dwm-btn-ghost" style={{ color: "#dc2626", borderColor: "#fca5a5" }}>Deactivate</button>
          <button className="dwm-btn dwm-btn-primary"><Plus size={12} /> Create Position</button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-input">
          <Search size={12} color="#94a3b8" />
          <input
            placeholder="Search positions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterScope} onChange={(e) => setFilterScope(e.target.value)}>
          {scopeTypes.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <span className="fb-count">{filtered.length} positions</span>
      </div>

      <div className="split-layout">
        {/* List */}
        <div className="split-center">
          <div className="list-panel">
            <table className="dwm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Position Name</th>
                  <th>Scope</th>
                  <th>Org Unit</th>
                  <th>Reports To</th>
                  <th>Can Own</th>
                  <th>Can Review</th>
                  <th>Can Approve</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    style={{ background: selected?.id === p.id ? "#eff6ff" : undefined }}
                  >
                    <td><span className="td-primary" style={{ fontFamily: "monospace", fontSize: 11 }}>{p.code}</span></td>
                    <td><span className="td-primary">{p.name}</span></td>
                    <td>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f1f5f9", color: "#475569", fontWeight: 500 }}>
                        {p.scopeType}
                      </span>
                    </td>
                    <td><span className="td-secondary">{p.orgUnit}</span></td>
                    <td><span className="td-secondary">{p.reportsTo}</span></td>
                    <td style={{ textAlign: "center" }}>{p.canOwn    ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#d1d5db" />}</td>
                    <td style={{ textAlign: "center" }}>{p.canReview  ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#d1d5db" />}</td>
                    <td style={{ textAlign: "center" }}>{p.canApprove ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#d1d5db" />}</td>
                    <td>
                      <span className={`dwm-badge ${p.activeFlag ? "dwm-badge-effective" : "dwm-badge-draft"}`}>
                        {p.activeFlag ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="split-right">
            <div className="detail-panel" style={{ flex: 1 }}>
              <div className="detail-panel-header">
                <div className="dph-title">{selected.name}</div>
                <div className="dph-sub">{selected.code} · {selected.scopeType} scope</div>
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selected.canOwn    && <span className="dwm-badge dwm-badge-approved">Can Own</span>}
                  {selected.canReview && <span className="dwm-badge dwm-badge-submitted">Can Review</span>}
                  {selected.canApprove&& <span className="dwm-badge dwm-badge-effective">Can Approve</span>}
                  <span className={`dwm-badge ${selected.activeFlag ? "dwm-badge-effective" : "dwm-badge-draft"}`}>
                    {selected.activeFlag ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="detail-panel-body">
                <div>
                  <div className="detail-field"><div className="df-label">Org Unit</div><div className="df-value">{selected.orgUnit}</div></div>
                  <div className="detail-field"><div className="df-label">Reports To</div><div className="df-value">{selected.reportsTo}</div></div>
                  <div className="detail-field"><div className="df-label">Scope Type</div><div className="df-value">{selected.scopeType}</div></div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { icon: FileText, label: "Role Sheets",     value: selected.linkedRoleSheets },
                    { icon: Users,    label: "Assignments",      value: selected.activeAssignments },
                    { icon: GitBranch,label: "Linked Processes", value: selected.linkedProcesses },
                    { icon: ChartBar, label: "Linked Measures", value: selected.linkedMeasures },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                        <Icon size={11} color="#64748b" />
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#1e40af" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Ownership quick view */}
                <div>
                  <div className="section-divider" style={{ padding: "0 0 6px 0", borderBottom: "none", marginBottom: 6 }}>Ownership Status</div>
                  <OwnershipCard
                    ownerPosition={selected.name}
                    resolvedPerson={selected.activeAssignments > 0 ? "Ravi Kumar" : "Not Resolved"}
                    context={`${selected.orgUnit}`}
                    compact
                  />
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button className="dwm-btn dwm-btn-primary" style={{ flex: 1 }}>View Role Sheet</button>
                  <button className="dwm-btn dwm-btn-ghost" style={{ flex: 1 }}>View Assignments</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};