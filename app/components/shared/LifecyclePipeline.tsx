import React from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";

// ─── Lifecycle Pipeline ────────────────────────────────────────────────────────
// Spec §5.3: Draft → Submit → Review → Approve → Activate
// Spec §5.1 Status model: DRAFT / SUBMITTED / APPROVED / ACTIVE / SUPERSEDED / RETIRED

export type LifecycleStatus =
  | "Draft" | "Submitted" | "Under Review" | "Approved" | "Active"
  | "Effective" | "Superseded" | "Retired";

interface PipelineStep {
  key: LifecycleStatus;
  label: string;
  shortLabel: string;
  actor?: string;
  date?: string;
}

interface LifecyclePipelineProps {
  currentStatus: LifecycleStatus | string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  activatedAt?: string;
  compact?: boolean;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { key: "Draft",        label: "Draft",       shortLabel: "Draft" },
  { key: "Submitted",    label: "Submitted",   shortLabel: "Submit" },
  { key: "Under Review", label: "Under Review", shortLabel: "Review" },
  { key: "Approved",     label: "Approved",    shortLabel: "Approve" },
  { key: "Active",       label: "Active",      shortLabel: "Activate" },
];

const STATUS_ORDER: Record<string, number> = {
  Draft: 0, Submitted: 1, "Under Review": 2, Approved: 3,
  Active: 4, Effective: 4, Superseded: 5, Retired: 5,
};

function getStepState(stepKey: string, currentStatus: string): "done" | "current" | "pending" {
  const current = STATUS_ORDER[currentStatus] ?? 0;
  const step    = STATUS_ORDER[stepKey] ?? 0;
  if (currentStatus === "Superseded" || currentStatus === "Retired") {
    return step <= 4 ? "done" : "done";
  }
  if (current > step) return "done";
  if (current === step) return "current";
  return "pending";
}

export const LifecyclePipeline: React.FC<LifecyclePipelineProps> = ({
  currentStatus,
  submittedBy,
  submittedAt,
  approvedBy,
  approvedAt,
  activatedAt,
  compact = false,
}) => {
  const isTerminal = currentStatus === "Superseded" || currentStatus === "Retired";

  const stepMeta: Record<string, { actor?: string; date?: string }> = {
    "Submitted":    { actor: submittedBy, date: submittedAt },
    "Approved":     { actor: approvedBy,  date: approvedAt },
    "Active":       { date: activatedAt },
    "Effective":    { date: activatedAt },
  };

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {PIPELINE_STEPS.map((step, idx) => {
          const state = getStepState(step.key, currentStatus);
          return (
            <React.Fragment key={step.key}>
              <div style={{
                display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
                borderRadius: 12, fontSize: 10, fontWeight: 600,
                background: state === "done" ? "#dcfce7" : state === "current" ? "#2563eb" : "#f1f5f9",
                color: state === "done" ? "#14532d" : state === "current" ? "#fff" : "#94a3b8",
                border: `1px solid ${state === "done" ? "#4ade80" : state === "current" ? "#1d4ed8" : "#e2e8f0"}`,
              }}>
                {state === "done" ? <CheckCircle2 size={9} /> : <Circle size={9} />}
                {step.shortLabel}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && <ChevronRight size={10} color="#d1d5db" />}
            </React.Fragment>
          );
        })}
        {isTerminal && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: currentStatus === "Retired" ? "#f1f5f9" : "#f5f3ff", color: currentStatus === "Retired" ? "#475569" : "#5b21b6", border: "1px solid #e2e8f0", marginLeft: 4 }}>
            {currentStatus}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "7px 16px", display: "flex", alignItems: "center", gap: 0, flexShrink: 0, overflowX: "auto", overflowY: "hidden" }}>
      {/* Lifecycle label */}
      <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 12, flexShrink: 0 }}>Lifecycle</span>

      {/* Steps */}
      {PIPELINE_STEPS.map((step, idx) => {
        const state = getStepState(step.key, currentStatus);
        const meta  = stepMeta[step.key] ?? {};
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 74, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: state === "done" ? "#dcfce7" : state === "current" ? "#2563eb" : "#fff",
                color: state === "done" ? "#14532d" : state === "current" ? "#fff" : "#94a3b8",
                border: `1px solid ${state === "done" ? "#4ade80" : state === "current" ? "#1d4ed8" : "#e2e8f0"}`,
                boxShadow: state === "current" ? "0 1px 6px rgba(37,99,235,0.25)" : "none",
              }}>
                {state === "done" ? <CheckCircle2 size={11} /> : <Circle size={11} style={{ opacity: 0.5 }} />}
                {step.label}
              </div>
              {(meta.actor || meta.date) && (
                <div style={{ fontSize: 9, color: "#94a3b8", textAlign: "center", lineHeight: 1.3 }}>
                  {meta.actor && <div>{meta.actor}</div>}
                  {meta.date && <div>{meta.date}</div>}
                </div>
              )}
            </div>
            {idx < PIPELINE_STEPS.length - 1 && (
              <div style={{ width: 28, height: 1, flexShrink: 0, background: state === "done" ? "#4ade80" : "#e2e8f0", margin: "0 3px", marginBottom: meta.actor || meta.date ? 14 : 0 }} />
            )}
          </React.Fragment>
        );
      })}

      {/* Terminal states */}
      {isTerminal && (
        <>
          <ChevronRight size={12} color="#d1d5db" style={{ marginLeft: 4 }} />
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12, marginLeft: 4, background: currentStatus === "Retired" ? "#f1f5f9" : "#f5f3ff", color: currentStatus === "Retired" ? "#475569" : "#5b21b6", border: `1px solid ${currentStatus === "Retired" ? "#cbd5e1" : "#c4b5fd"}` }}>
            {currentStatus}
          </span>
        </>
      )}
    </div>
  );
};
