import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle, Users, Layers, ChartBar, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { buildSystemValidationIssues, UnifiedValidationPanel } from "./UnifiedValidationPanel";

// ─── System Health / Validation Summary Panel ─────────────────────────────────
// Shows cross-module health: Ownership, Structure, Measures, Cross-module
// Spec: DWM UX Refinement §1 — "System Health / Validation Summary" panel

interface SystemHealthPanelProps {
  /** Collapsed (tile) vs expanded (full list) mode */
  expanded?: boolean;
}

const HEALTH_CATEGORIES = [
  { key: "ownership"    as const, icon: Users,         label: "Ownership",     route: "/assignments" },
  { key: "structure"    as const, icon: Layers,        label: "Structure",     route: "/process-designer" },
  { key: "measure"      as const, icon: ChartBar,      label: "Measures",      route: "/measures" },
  { key: "cross-module" as const, icon: Shield,        label: "Cross-Module",  route: "/standardization" },
];

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ expanded = false }) => {
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(expanded);

  const issues   = buildSystemValidationIssues();
  const errors   = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  const allPass  = issues.length === 0;

  return (
    <div style={{ border: `1px solid ${allPass ? "#86efac" : errors > 0 ? "#fca5a5" : "#fde68a"}`, borderRadius: 8, overflow: "hidden", background: "#fff", fontFamily: "var(--dwm-font)" }}>
      {/* Header */}
      <div
        onClick={() => setShowDetail(d => !d)}
        style={{
          padding: "9px 14px",
          background: allPass ? "#f0fdf4" : errors > 0 ? "#fef9f9" : "#fffdf0",
          borderBottom: showDetail ? "1px solid #e2e8f0" : "none",
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
        }}
      >
        {allPass
          ? <CheckCircle2 size={14} color="#15803d" />
          : errors > 0
            ? <XCircle size={14} color="#dc2626" />
            : <AlertTriangle size={14} color="#d97706" />
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: allPass ? "#15803d" : errors > 0 ? "#dc2626" : "#92400e" }}>
            System Health
            {allPass && " — All Pass"}
          </div>
          {!allPass && (
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
              {errors > 0 && `${errors} error${errors !== 1 ? "s" : ""}`}
              {errors > 0 && warnings > 0 && " · "}
              {warnings > 0 && `${warnings} warning${warnings !== 1 ? "s" : ""}`}
              {" across all modules"}
            </div>
          )}
        </div>
        {/* Category tiles */}
        <div style={{ display: "flex", gap: 5 }}>
          {HEALTH_CATEGORIES.map(cat => {
            const cnt = issues.filter(i => i.category === cat.key).length;
            const hasErr = issues.filter(i => i.category === cat.key && i.severity === "error").length;
            const Icon = cat.icon;
            if (cnt === 0) return (
              <div key={cat.key} title={`${cat.label}: OK`}
                style={{ width: 26, height: 26, borderRadius: 5, background: "#f0fdf4", border: "1px solid #86efac",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={12} color="#15803d" />
              </div>
            );
            return (
              <div key={cat.key} title={`${cat.label}: ${cnt} issue${cnt !== 1 ? "s" : ""}`}
                style={{ width: 26, height: 26, borderRadius: 5,
                  background: hasErr ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${hasErr ? "#fca5a5" : "#fde68a"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Icon size={12} color={hasErr ? "#dc2626" : "#d97706"} />
                <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%",
                  background: hasErr ? "#dc2626" : "#d97706", color: "#fff", fontSize: 7, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cnt}
                </span>
              </div>
            );
          })}
        </div>
        <ChevronRight size={12} color="#94a3b8" style={{ transform: showDetail ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
      </div>

      {/* Expanded detail */}
      {showDetail && (
        <div>
          {/* Quick-nav row */}
          <div style={{ padding: "8px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {HEALTH_CATEGORIES.map(cat => {
              const cnt = issues.filter(i => i.category === cat.key).length;
              const hasErr = issues.filter(i => i.category === cat.key && i.severity === "error").length;
              const Icon = cat.icon;
              return (
                <button key={cat.key}
                  onClick={() => navigate(cat.route)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 5, cursor: "pointer", border: "1px solid",
                    background: cnt === 0 ? "#f0fdf4" : hasErr ? "#fef2f2" : "#fffbeb",
                    color: cnt === 0 ? "#15803d" : hasErr ? "#dc2626" : "#d97706",
                    borderColor: cnt === 0 ? "#86efac" : hasErr ? "#fca5a5" : "#fde68a" }}
                >
                  <Icon size={10} />
                  {cat.label}
                  {cnt > 0 && <span style={{ background: hasErr ? "#dc2626" : "#d97706", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 9 }}>{cnt}</span>}
                  {cnt === 0 && <CheckCircle2 size={9} />}
                </button>
              );
            })}
          </div>

          {/* Full validation panel */}
          <div style={{ padding: 14 }}>
            <UnifiedValidationPanel
              issues={issues}
              title="Cross-Module Validation"
              filterable
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};