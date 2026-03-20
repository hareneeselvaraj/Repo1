import React, { useState } from "react";
import { BookOpen, Search, Plus, GitBranch, ChartBar, Paperclip, ChevronRight, Eye } from "lucide-react";
import { sops, SOP } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";
import { OwnershipCard } from "../shared/OwnershipCard";

export const SOPLibrary: React.FC<{ onOpenSOP?: (id: string) => void }> = ({ onOpenSOP }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<SOP | null>(sops[0]);

  const filtered = sops.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><BookOpen size={16} /></div>
        <div>
          <h1>SOP Library</h1>
          <div className="ph-sub">Browse, compare, and manage all Standard Operating Procedures</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost">Compare Versions</button>
          <button className="dwm-btn dwm-btn-primary"><Plus size={12} /> Create SOP</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-input">
          <Search size={12} color="#94a3b8" />
          <input
            placeholder="Search SOP code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {["All", "Draft", "Submitted", "Under Review", "Approved", "Effective", "Superseded"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="filter-select">
          <option>All Processes</option>
          <option>Final Assembly Operation</option>
          <option>Preventive Maintenance Cycle</option>
        </select>
        <span className="fb-count">{filtered.length} SOPs</span>
      </div>

      <div className="split-layout">
        <div className="split-center">
          <div className="list-panel">
            <table className="dwm-table">
              <thead>
                <tr><th>Code</th><th>Title</th><th>Linked Process</th><th>Owner Position</th><th>Resolved Owner</th><th>Version</th><th>Measures</th><th>Files</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const isGap = s.resolvedOwner === "Not Resolved";
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      style={{ background: selected?.id === s.id ? "#eff6ff" : undefined }}
                    >
                      <td><span className="td-primary" style={{ fontFamily: "monospace", fontSize: 11 }}>{s.code}</span></td>
                      <td><span className="td-primary">{s.title}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <GitBranch size={10} color="#94a3b8" />
                          <span className="td-secondary">{s.linkedProcess}</span>
                        </div>
                      </td>
                      <td><span className="td-secondary">{s.ownerPosition}</span></td>
                      <td>
                        <span className="td-secondary" style={{ color: isGap ? "#dc2626" : undefined }}>
                          {isGap ? "⚠ Not Resolved" : s.resolvedOwner}
                        </span>
                      </td>
                      <td><span className="td-secondary">{s.version}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <ChartBar size={10} color="#94a3b8" />
                          <span className="td-secondary">{s.linkedMeasures}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Paperclip size={10} color="#94a3b8" />
                          <span className="td-secondary">{s.attachments}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={s.status as any} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="split-right">
            <div className="detail-panel" style={{ flex: 1, overflow: "hidden" }}>
              <div className="detail-panel-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="dph-title">{selected.title}</div>
                    <div className="dph-sub">{selected.code} · {selected.version}</div>
                  </div>
                  <StatusBadge status={selected.status as any} />
                </div>
              </div>
              <div className="detail-panel-body">
                <OwnershipCard
                  ownerPosition={selected.ownerPosition}
                  resolvedPerson={selected.resolvedOwner}
                  context="Chennai / Assembly"
                />
                <div>
                  <div className="detail-field">
                    <div className="df-label">Linked Process</div>
                    <div className="df-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <GitBranch size={12} color="#64748b" />{selected.linkedProcess}
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="df-label">Reviewer Position</div>
                    <div className="df-value muted">{selected.reviewerPosition}</div>
                  </div>
                  <div className="detail-field">
                    <div className="df-label">Approver Position</div>
                    <div className="df-value muted">{selected.approverPosition}</div>
                  </div>
                  {selected.effectiveFrom && (
                    <div className="detail-field">
                      <div className="df-label">Effective From</div>
                      <div className="df-value muted">{selected.effectiveFrom}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Steps",    value: selected.steps.length },
                    { label: "Measures", value: selected.linkedMeasures },
                    { label: "Files",    value: selected.attachments },
                    { label: "Version",  value: selected.version },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1e40af" }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                  <button
                    className="dwm-btn dwm-btn-primary"
                    style={{ justifyContent: "center" }}
                    onClick={() => onOpenSOP && onOpenSOP(selected.id)}
                  >
                    <Eye size={12} /> Open SOP Editor
                  </button>
                  <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center" }}>
                    Compare Versions
                  </button>
                  <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center" }}>
                    Revise (Create New Draft)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};