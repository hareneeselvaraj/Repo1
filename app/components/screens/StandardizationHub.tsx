import React from "react";
import { useNavigate } from "react-router";
import {
  BookOpen, Layers, GitCompare, Clock, FileText, GitBranch, ChevronRight,
  Globe, ChartBar, CheckCircle2, AlertTriangle, Shield,
} from "lucide-react";
import { sops, processes, pfcs } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";
import { SystemHealthPanel } from "../shared/SystemHealthPanel";

// ─── Hub Items ────────────────────────────────────────────────────────────────
const HUB_ITEMS = [
  // Row 1 – Process authoring
  { id: "processes",         icon: GitBranch,  label: "Process Library",    sub: "Browse and manage all business processes",             route: "/processes",          color: "#eff6ff", iconColor: "#2563eb",  section: "Authoring" },
  { id: "process-designer",  icon: FileText,   label: "Process Designer",   sub: "Multi-tab process detail: PFCs, SOPs, Measures, Versions", route: "/process-designer", color: "#f0f9ff", iconColor: "#0369a1",  section: "Authoring" },
  { id: "pfc-designer",      icon: Layers,     label: "PFC Designer",       sub: "Build and edit process flow chart canvases",           route: "/pfc-designer",       color: "#f0fdf4", iconColor: "#15803d",  section: "Authoring" },
  { id: "sop-library",       icon: BookOpen,   label: "SOP Library",        sub: "Browse all Standard Operating Procedures",             route: "/sop-library",        color: "#fff7ed", iconColor: "#d97706",  section: "Authoring" },
  { id: "sop-editor",        icon: FileText,   label: "SOP Editor",         sub: "Author SOP steps, measure links, and transitions",     route: "/sop-editor",         color: "#fdf4ff", iconColor: "#7e22ce",  section: "Authoring" },
  // Row 2 – Governance
  { id: "approval-inbox",    icon: CheckCircle2, label: "Approvals",        sub: "Pending governance review and approval items",         route: "/approval-inbox",     color: "#fef2f2", iconColor: "#dc2626",  section: "Governance" },
  { id: "version-compare",   icon: GitCompare, label: "Version Compare",    sub: "Side-by-side diff of any two standards versions",      route: "/version-compare",    color: "#f0f9ff", iconColor: "#0369a1",  section: "Governance" },
  { id: "impact-analysis",   icon: AlertTriangle, label: "Impact Analysis", sub: "Downstream effects of proposed standard changes",      route: "/impact-analysis",    color: "#fffbeb", iconColor: "#d97706",  section: "Governance" },
  { id: "audit",             icon: Clock,      label: "Version History",    sub: "Full version lineage and audit trail",                  route: "/audit",              color: "#f8fafc", iconColor: "#64748b",  section: "Governance" },
  // Row 3 – Deployment
  { id: "yokoten",           icon: Globe,      label: "Yokoten Deployment", sub: "Deploy standards to target sites and departments",     route: "/yokoten",            color: "#f0fdf4", iconColor: "#0f766e",  section: "Deployment" },
  { id: "yokoten-tracker",   icon: ChartBar,  label: "Yokoten Tracker",    sub: "Monitor adoption status and deviations across sites",  route: "/yokoten",            color: "#fdf4ff", iconColor: "#7e22ce",  section: "Deployment" },
];

const SECTIONS = ["Authoring", "Governance", "Deployment"] as const;
const SECTION_META: Record<string, { color: string; bg: string }> = {
  Authoring:  { color: "#1d4ed8", bg: "#eff6ff" },
  Governance: { color: "#c2410c", bg: "#fff7ed" },
  Deployment: { color: "#0f766e", bg: "#f0fdf4" },
};

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Processes",   value: 8,   color: "#1d4ed8" },
  { label: "PFCs",        value: 7,   color: "#15803d" },
  { label: "SOPs",        value: 5,   color: "#d97706" },
  { label: "Pending Approvals", value: 3, color: "#dc2626" },
];

export const StandardizationHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><BookOpen size={16} /></div>
        <div>
          <h1>Standardization</h1>
          <div className="ph-sub">Process → PFC → SOP → Step → Measure · Govern, deploy, and track enterprise standards</div>
        </div>
      </div>

      <div className="content-area">
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── System Health / Validation Summary — UX Refinement §1 ── */}
        <SystemHealthPanel />

        {/* UX messaging — Separation of Concerns */}
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7, padding: "9px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1, minWidth: 200 }}>
            <GitBranch size={13} color="#0369a1" style={{ marginTop: 1, flexShrink: 0 }} />
            <div><div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1" }}>Process Designer</div><div style={{ fontSize: 10, color: "#64748b" }}>Link and orchestrate SOPs used in this process</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1, minWidth: 200 }}>
            <BookOpen size={13} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
            <div><div style={{ fontSize: 10, fontWeight: 700, color: "#d97706" }}>SOP Editor</div><div style={{ fontSize: 10, color: "#64748b" }}>Create and manage SOP definitions used across processes</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1, minWidth: 200 }}>
            <ChartBar size={13} color="#7e22ce" style={{ marginTop: 1, flexShrink: 0 }} />
            <div><div style={{ fontSize: 10, fontWeight: 700, color: "#7e22ce" }}>Measure Module</div><div style={{ fontSize: 10, color: "#64748b" }}>Define and manage measures used across SOP steps and processes</div></div>
          </div>
        </div>

        {/* Traceability chain */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, color: "#64748b", fontSize: 11 }}>Standardization Chain:</span>
          {["Process", "→", "PFC", "→", "SOP", "→", "Step", "→", "Measure", "→", "Owner"].map((item, i) => (
            <span
              key={i}
              onClick={() => {
                const routeMap: Record<string, string> = { Process: "/processes", PFC: "/pfc-designer", SOP: "/sop-library", Step: "/sop-editor", Measure: "/measures", Owner: "/assignments" };
                if (routeMap[item]) navigate(routeMap[item]);
              }}
              style={{
                color: item === "→" ? "#d1d5db" : "#2563eb",
                fontWeight: item === "→" ? 400 : 600,
                cursor: item === "→" ? "default" : "pointer",
                padding: item === "→" ? 0 : "2px 8px",
                borderRadius: 4,
                background: item === "→" ? "transparent" : "#eff6ff",
                fontSize: 11,
              }}
            >{item}</span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>≤ 3 clicks to any entity</span>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const items = HUB_ITEMS.filter(i => i.section === section);
          const meta  = SECTION_META[section];
          return (
            <div key={section}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 10px", borderRadius: 4, background: meta.bg, color: meta.color }}>{section}</span>
                <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
                {items.map(({ id, icon: Icon, label, sub, route, color, iconColor }) => (
                  <div
                    key={id}
                    onClick={() => navigate(route)}
                    style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "12px 14px", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.12s", display: "flex", gap: 10, alignItems: "flex-start" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={15} color={iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>{sub}</div>
                    </div>
                    <ChevronRight size={12} color="#d1d5db" style={{ flexShrink: 0, marginTop: 2 }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Recent SOPs */}
        <div className="dwm-panel">
          <div className="dwm-panel-header">
            <div className="ph-title"><BookOpen size={13} color="#d97706" /> Recently Modified SOPs</div>
            <button className="ph-action" onClick={() => navigate("/sop-library")}>View Library →</button>
          </div>
          <table className="dwm-table">
            <thead>
              <tr><th>Code</th><th>Title</th><th>Process</th><th>Version</th><th>Modified</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sops.map(s => (
                <tr key={s.id} onClick={() => navigate("/sop-editor")} style={{ cursor: "pointer" }}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#1d4ed8" }}>{s.code}</span></td>
                  <td><span className="td-primary">{s.title}</span></td>
                  <td><span className="td-secondary">{s.linkedProcessCode}</span></td>
                  <td><span className="td-secondary">{s.version}</span></td>
                  <td><span className="td-secondary">{s.lastModified}</span></td>
                  <td><StatusBadge status={s.status as any} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};