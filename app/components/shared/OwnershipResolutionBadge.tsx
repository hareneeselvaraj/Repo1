import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";

// ─── Ownership Resolution States (per DWM UX Refinement spec) ─────────────────
export type OwnershipState = "Resolved" | "Missing" | "Ambiguous" | "Invalid";

interface OwnershipResolutionBadgeProps {
  state: OwnershipState;
  position: string;
  person?: string;
  context?: string;
  /** If true, shows navigate → assignment link */
  navigable?: boolean;
  /** compact: icon only, normal: icon + label */
  compact?: boolean;
}

const STATE_CFG: Record<OwnershipState, {
  bg: string; color: string; border: string; icon: React.FC<{ size: number }>;
  label: string; tip: string;
}> = {
  Resolved:  { bg: "#f0fdf4", color: "#15803d", border: "#86efac", icon: CheckCircle2, label: "Resolved",  tip: "Owner position is filled and context-resolved" },
  Missing:   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", icon: XCircle,      label: "Missing",   tip: "No person assigned to this position in context" },
  Ambiguous: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", icon: HelpCircle,   label: "Ambiguous", tip: "Multiple candidates exist — assignment must be disambiguated" },
  Invalid:   { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff", icon: AlertCircle,  label: "Invalid",   tip: "Position exists but is deactivated or out of scope" },
};

export const OwnershipResolutionBadge: React.FC<OwnershipResolutionBadgeProps> = ({
  state, position, person, context, navigable = false, compact = false,
}) => {
  const navigate   = useNavigate();
  const cfg        = STATE_CFG[state];
  const Icon       = cfg.icon;
  const resolvedBy = state === "Resolved" ? person ?? "—" : null;

  return (
    <div
      title={cfg.tip}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        borderRadius: 5, padding: compact ? "2px 6px" : "4px 10px",
        fontSize: compact ? 9 : 11, fontWeight: 600, cursor: navigable ? "pointer" : "default",
        flexShrink: 0,
      }}
      onClick={navigable ? () => navigate("/assignments") : undefined}
    >
      <Icon size={compact ? 9 : 11} />
      {!compact && (
        <span>
          {cfg.label}
          {resolvedBy && <span style={{ fontWeight: 400, marginLeft: 4, opacity: 0.85 }}>· {resolvedBy}</span>}
        </span>
      )}
      {compact && cfg.label}
      {navigable && !compact && (
        <ExternalLink size={9} style={{ opacity: 0.6, marginLeft: 2 }} />
      )}
    </div>
  );
};

// ─── Inline ownership row ─────────────────────────────────────────────────────
// Compact one-liner: "Assembly Lead  [Resolved] Ravi Kumar  ↗"
export const OwnershipRow: React.FC<{
  label?: string;
  position: string;
  person?: string;
  state: OwnershipState;
  context?: string;
}> = ({ label, position, person, state, context }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "5px 0", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap",
  }}>
    {label && <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", width: 80, flexShrink: 0 }}>{label}</span>}
    <span style={{ fontSize: 11, color: "#334155", fontWeight: 500, flex: 1 }}>{position}</span>
    <OwnershipResolutionBadge state={state} position={position} person={person} context={context} navigable compact />
    {person && state === "Resolved" && (
      <span style={{ fontSize: 11, color: "#64748b" }}>{person}</span>
    )}
  </div>
);

// ─── Resolution state deriver ─────────────────────────────────────────────────
export function deriveOwnershipState(resolvedPerson?: string): OwnershipState {
  if (!resolvedPerson || resolvedPerson === "Not Resolved") return "Missing";
  if (resolvedPerson.includes("(Multiple)"))                  return "Ambiguous";
  if (resolvedPerson.includes("(Invalid)"))                   return "Invalid";
  return "Resolved";
}
