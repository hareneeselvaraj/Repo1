import React from "react";
import { User, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";

interface OwnershipCardProps {
  ownerPosition: string;
  resolvedPerson: string;
  context?: string;
  delegatedTo?: string;
  backupOwner?: string;
  compact?: boolean;
}

export const OwnershipCard: React.FC<OwnershipCardProps> = ({
  ownerPosition,
  resolvedPerson,
  context,
  delegatedTo,
  backupOwner,
  compact = false,
}) => {
  const isGap = resolvedPerson === "Not Resolved" || !resolvedPerson;

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: isGap ? "#fef2f2" : "#f8fafc",
          border: `1px solid ${isGap ? "#fecaca" : "#e2e8f0"}`,
          borderRadius: 6,
        }}
      >
        {isGap
          ? <AlertTriangle size={13} color="#dc2626" />
          : <CheckCircle2 size={13} color="#16a34a" />
        }
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{ownerPosition}</div>
          <div style={{ fontSize: 11, color: isGap ? "#dc2626" : "#64748b" }}>
            {isGap ? "Ownership Gap" : resolvedPerson}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dwm-ownership-card">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div className="oc-label">Owner Position</div>
          <div className="oc-position">{ownerPosition}</div>
        </div>
        <div>
          <div className="oc-label">Responsible Person</div>
          <div
            className="oc-person"
            style={{ color: isGap ? "#dc2626" : undefined, fontWeight: isGap ? 500 : undefined }}
          >
            {isGap ? (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle size={11} color="#dc2626" /> Not Resolved
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <User size={11} color="#64748b" /> {resolvedPerson}
              </span>
            )}
          </div>
        </div>
      </div>

      {context && (
        <div style={{ marginTop: 8 }}>
          <div className="oc-label">Context</div>
          <div className="oc-context" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={10} color="#94a3b8" /> {context}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className={`dwm-badge ${isGap ? "dwm-badge-ownership-gap" : "dwm-badge-effective"}`}
        >
          {isGap ? "Ownership Gap" : "Resolved"}
        </span>
        {delegatedTo && (
          <span style={{ fontSize: 10, color: "#7e22ce" }}>
            Delegated → {delegatedTo}
          </span>
        )}
        {backupOwner && (
          <span style={{ fontSize: 10, color: "#64748b" }}>
            Backup: {backupOwner}
          </span>
        )}
      </div>
    </div>
  );
};
