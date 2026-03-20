import React from "react";
import { Search, Bell, ShieldAlert } from "lucide-react";
import { currentUser, kpiStats } from "../../../data/mockData";

interface GlobalHeaderProps {
  pageTitle: string;
  onNavigate?: (id: string) => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ pageTitle }) => (
  <header className="global-header">
    <span className="gh-title">{pageTitle}</span>

    <div className="gh-search">
      <Search size={13} color="#94a3b8" />
      <input placeholder="Search processes, SOPs, positions…" />
    </div>

    <div className="gh-actions">
      <div className="gh-approval-chip">
        <ShieldAlert size={12} />
        <span>{kpiStats.pendingApprovals} Approvals</span>
      </div>
      <button className="gh-notif" title="Notifications">
        <Bell size={16} />
        <span className="gh-notif-count">{kpiStats.pendingApprovals}</span>
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
);
