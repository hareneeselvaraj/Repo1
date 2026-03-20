import React from "react";

// ─── StatusBadge ─────────────────────────────────────────────────────────────
// Reusable badge for all governed-object statuses.
// Styles live in dwm-shared.css  (no inline styles, no hardcoding).

export type StatusValue =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Active"
  | "Effective"
  | "Superseded"
  | "Retired"
  | "Ownership Gap"
  | "Blocked";

interface StatusBadgeProps {
  status: StatusValue | string;
  className?: string;
}

function toCssKey(status: string): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const key = toCssKey(status);
  return (
    <span className={`dwm-badge dwm-badge-${key} ${className}`}>
      {status}
    </span>
  );
};