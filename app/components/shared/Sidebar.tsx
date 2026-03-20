import React from "react";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  Users,
  UserCheck,
  GitBranch,
  BookOpen,
  ChartBar,
  Shield,
  Bell,
  History,
  Settings,
  Layers,
  Globe,
  LayoutGrid,
  ClipboardCheck,
  Wrench,
  CalendarDays,
  LucideIcon,
} from "lucide-react";
import { navGroups } from "../../../data/mockData";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Three visual variants: "dark" | "light" | "minimal"
// All variants share the same nav structure. Styling is CSS-driven.

export type SidebarVariant = "dark" | "light" | "minimal";

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  variant: SidebarVariant;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  Users,
  UserCheck,
  GitBranch,
  BookOpen,
  BarChart2: ChartBar,
  Shield,
  Bell,
  History,
  Settings,
  Layers,
  Globe,
  // ── Execution Layer (1.5) ──
  LayoutGrid,
  ClipboardCheck,
  Wrench,
  CalendarDays,
};

// ── Theme token maps ──
const themes: Record<
  SidebarVariant,
  {
    sidebar: React.CSSProperties;
    logo: React.CSSProperties;
    logoBadge: React.CSSProperties;
    logoText: React.CSSProperties;
    logoSub: React.CSSProperties;
    divider: React.CSSProperties;
    sectionLabel: React.CSSProperties;
    item: React.CSSProperties;
    itemHover: React.CSSProperties;
    itemActive: React.CSSProperties;
    itemTextActive: React.CSSProperties;
    itemText: React.CSSProperties;
    badge: React.CSSProperties;
    badgeActive: React.CSSProperties;
    iconActive: string;
    iconDefault: string;
  }
> = {
  dark: {
    sidebar:        { background: "#0f1c2e", borderRight: "none" },
    logo:           { borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px" },
    logoBadge:      { background: "#2563eb", color: "#fff", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
    logoText:       { fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "0.02em" },
    logoSub:        { fontSize: 9, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" as const },
    divider:        { borderColor: "rgba(255,255,255,0.05)" },
    sectionLabel:   { color: "#475569", fontSize: 9, letterSpacing: "0.10em" },
    item:           { color: "#94a3b8", borderRadius: 5 },
    itemHover:      { background: "rgba(255,255,255,0.05)", color: "#cbd5e1" },
    itemActive:     { background: "#1e3a5f", borderRadius: 5 },
    itemTextActive: { color: "#60a5fa" },
    itemText:       { color: "#94a3b8" },
    badge:          { background: "#dc2626", color: "#fff" },
    badgeActive:    { background: "#2563eb", color: "#fff" },
    iconActive:     "#60a5fa",
    iconDefault:    "#64748b",
  },
  light: {
    sidebar:        { background: "#ffffff", borderRight: "1px solid #e2e8f0" },
    logo:           { borderBottom: "1px solid #f1f5f9", padding: "14px 16px" },
    logoBadge:      { background: "#2563eb", color: "#fff", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
    logoText:       { fontSize: 14, fontWeight: 600, color: "#0f172a", letterSpacing: "0.02em" },
    logoSub:        { fontSize: 9, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" as const },
    divider:        { borderColor: "#f1f5f9" },
    sectionLabel:   { color: "#cbd5e1", fontSize: 9, letterSpacing: "0.10em" },
    item:           { color: "#64748b", borderRadius: 5 },
    itemHover:      { background: "#f8fafc", color: "#334155" },
    itemActive:     { background: "#eff6ff", borderRadius: 5 },
    itemTextActive: { color: "#1d4ed8" },
    itemText:       { color: "#475569" },
    badge:          { background: "#ef4444", color: "#fff" },
    badgeActive:    { background: "#2563eb", color: "#fff" },
    iconActive:     "#2563eb",
    iconDefault:    "#94a3b8",
  },
  minimal: {
    sidebar:        { background: "#f1f5f9", borderRight: "1px solid #e2e8f0" },
    logo:           { borderBottom: "1px solid #e2e8f0", padding: "14px 16px" },
    logoBadge:      { background: "#1e40af", color: "#fff", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 },
    logoText:       { fontSize: 14, fontWeight: 600, color: "#1e293b", letterSpacing: "0.02em" },
    logoSub:        { fontSize: 9, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" as const },
    divider:        { borderColor: "#e2e8f0" },
    sectionLabel:   { color: "#b0bac9", fontSize: 9, letterSpacing: "0.10em" },
    item:           { color: "#64748b", borderRadius: 5 },
    itemHover:      { background: "#e2e8f0", color: "#1e293b" },
    itemActive:     { background: "#dbeafe", borderRadius: 5, borderLeft: "2px solid #2563eb" },
    itemTextActive: { color: "#1e40af" },
    itemText:       { color: "#475569" },
    badge:          { background: "#ef4444", color: "#fff" },
    badgeActive:    { background: "#1e40af", color: "#fff" },
    iconActive:     "#1e40af",
    iconDefault:    "#94a3b8",
  },
};

export const Sidebar: React.FC<SidebarProps> = ({ activeId, onNavigate, variant }) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const t = themes[variant];

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: "var(--dwm-font)",
        ...t.sidebar,
      }}
    >
      {/* Logo / Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, ...t.logo }}>
        <div style={t.logoBadge}>D</div>
        <div>
          <div style={t.logoText}>DWM Platform</div>
          <div style={t.logoSub as React.CSSProperties}>Daily Work Mgmt</div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, padding: "8px 8px" }}>
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && (
              <div style={{ height: 1, margin: "8px 0", ...t.divider, borderTopWidth: 1, borderTopStyle: "solid" }} />
            )}
            <div
              style={{
                ...t.sectionLabel,
                padding: "6px 10px 4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {group.label}
            </div>

            {group.items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = activeId === item.id;
              const isHovered = hoveredId === item.id && !isActive;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    width: "100%",
                    padding: "6px 10px",
                    marginBottom: 1,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--dwm-font)",
                    fontSize: 12,
                    transition: "all 0.12s",
                    textAlign: "left",
                    ...(isActive ? t.itemActive : isHovered ? { ...t.item, ...t.itemHover } : t.item),
                  }}
                >
                  {Icon && (
                    <Icon
                      size={14}
                      style={{ flexShrink: 0 }}
                      color={isActive ? t.iconActive : t.iconDefault}
                    />
                  )}
                  <span
                    style={{
                      flex: 1,
                      ...(isActive ? t.itemTextActive : t.itemText),
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        borderRadius: 10,
                        padding: "1px 6px",
                        fontSize: 10,
                        fontWeight: 600,
                        ...(isActive ? t.badgeActive : t.badge),
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${variant === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div className="dwm-avatar" style={{ background: "#1e40af" }}>RK</div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: variant === "dark" ? "#e2e8f0" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Ravi Kumar
          </div>
          <div style={{ fontSize: 10, color: variant === "dark" ? "#64748b" : "#94a3b8" }}>
            Process Owner
          </div>
        </div>
      </div>
    </aside>
  );
};