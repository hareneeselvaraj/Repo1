import React, { useState } from "react";
import {
  X, AlertTriangle, CheckCircle2, Eye, ArrowUpRight, RefreshCw, Zap,
} from "lucide-react";
import { Abnormality, DispositionType, AB_SEVERITY_COLOR, executionActions } from "../../../../data/executionData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DispositionModalProps {
  abnormality: Abnormality;
  onClose: () => void;
  onSubmit: (ab: Abnormality, disposition: DispositionType, justification: string) => void;
}

// ─── RCA Trigger Dialog ───────────────────────────────────────────────────────
const RCADialog: React.FC<{
  abnormality: Abnormality;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ abnormality, onConfirm, onCancel }) => {
  const linkedActions = executionActions.filter(a =>
    abnormality.linkedActionIds.includes(a.id)
  );
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 700,
      background: "rgba(15,23,42,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 480, background: "#fff", borderRadius: 12,
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Create Improvement Case?</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>This will initiate a 1.6 Improvement workflow</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Pre-fill preview */}
          <div style={{ background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", background: "#f1f5f9", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Will be pre-filled in Module 1.6
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "KPI",           value: abnormality.kpiName },
                { label: "Abnormality",   value: abnormality.id },
                { label: "Type",          value: abnormality.type },
                { label: "Severity",      value: abnormality.severity },
                { label: "Line",          value: `${abnormality.line} · ${abnormality.department}` },
                { label: "Repeat Count",  value: `${abnormality.repeatCount}× in last 7 days` },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", gap: 10, fontSize: 11 }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600, minWidth: 100 }}>{f.label}</span>
                  <span style={{ color: "#334155", fontWeight: 500 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions taken */}
          {linkedActions.length > 0 && (
            <div style={{ background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: 7 }}>
                Actions Taken (will be linked)
              </div>
              {linkedActions.map(a => (
                <div key={a.id} style={{ display: "flex", gap: 6, fontSize: 11, color: "#78350f", marginBottom: 4, alignItems: "baseline" }}>
                  <span style={{ color: "#d97706", minWidth: 60, fontFamily: "monospace", fontSize: 10 }}>{a.id}</span>
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: 11, color: "#1e40af" }}>
              ⚡ Module 1.6 will open with all context pre-filled. The improvement case will be tracked separately from day-to-day execution.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel}
            style={{ padding: "8px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            <Zap size={13} /> Yes, Create Improvement Case →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Disposition Radio Card ───────────────────────────────────────────────────
interface DispositionCardProps {
  value: DispositionType;
  selected: DispositionType;
  onSelect: (v: DispositionType) => void;
  icon: React.ReactNode;
  label: string;
  tagline: string;
  outcome: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  recommended?: boolean;
}
const DispositionCard: React.FC<DispositionCardProps> = ({
  value, selected, onSelect, icon, label, tagline, outcome,
  accentColor, accentBg, accentBorder, recommended,
}) => {
  const isSelected = selected === value;
  return (
    <div onClick={() => onSelect(value)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 14px", borderRadius: 9, cursor: "pointer",
        border: isSelected ? `2px solid ${accentColor}` : "2px solid #e2e8f0",
        background: isSelected ? accentBg : "#fff",
        transition: "all 0.13s",
        position: "relative",
      }}>
      {recommended && (
        <div style={{
          position: "absolute", top: -8, right: 10,
          fontSize: 9, fontWeight: 700, color: "#dc2626",
          background: "#fef2f2", border: "1px solid #fca5a5",
          padding: "2px 8px", borderRadius: 10,
        }}>
          SYSTEM RECOMMENDS ↑
        </div>
      )}
      {/* Radio */}
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: isSelected ? `5px solid ${accentColor}` : "2px solid #cbd5e1",
        background: isSelected ? "#fff" : "transparent",
        transition: "all 0.13s",
      }} />
      {/* Icon + text */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: isSelected ? accentColor : "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.13s",
        }}>
          {React.cloneElement(icon as React.ReactElement, {
            size: 14,
            color: isSelected ? "#fff" : "#94a3b8",
          })}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? accentColor : "#0f172a", marginBottom: 1 }}>
            {label}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{tagline}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: accentColor, marginTop: 4,
            background: accentBg, border: `1px solid ${accentBorder}`, padding: "2px 8px", borderRadius: 4, display: "inline-block" }}>
            → {outcome}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Disposition Modal ───────────────────────────────────────────────────
export const AbnormalityDispositionModal: React.FC<DispositionModalProps> = ({
  abnormality, onClose, onSubmit,
}) => {
  const [disposition, setDisposition]   = useState<DispositionType>(
    abnormality.suggestedForRCA ? "RCA" : null
  );
  const [justification, setJustification] = useState("");
  const [showRCA, setShowRCA]             = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const sc = AB_SEVERITY_COLOR[abnormality.severity];
  const linkedActions = executionActions.filter(a =>
    abnormality.linkedActionIds.includes(a.id)
  );
  const allActionsResolved = linkedActions.every(a =>
    ["Resolved", "Verified", "Closed"].includes(a.status)
  );

  const needsJustification = disposition === "ONE_OFF" || disposition === "MONITOR";
  const canSubmit =
    disposition !== null &&
    (disposition === "RCA" || justification.trim().length >= 10);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (disposition === "RCA") {
      setShowRCA(true);
    } else {
      setSubmitted(true);
      onSubmit(abnormality, disposition, justification);
    }
  };

  const handleRCAConfirm = () => {
    setSubmitted(true);
    onSubmit(abnormality, "RCA", "");
    setShowRCA(false);
  };

  if (submitted) {
    const DISP_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      ONE_OFF: { label: "Closed as One-off",       color: "#15803d", icon: <CheckCircle2 size={32} color="#22c55e" /> },
      MONITOR: { label: "Marked for Monitoring",   color: "#d97706", icon: <Eye size={32} color="#f59e0b" /> },
      RCA:     { label: "Escalated to RCA / 1.6",  color: "#1d4ed8", icon: <Zap size={32} color="#2563eb" /> },
    };
    const info = DISP_LABELS[disposition!];
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 360, background: "#fff", borderRadius: 14, padding: "36px 32px", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
          <div style={{ marginBottom: 14 }}>{info.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: info.color, marginBottom: 8 }}>{info.label}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
            {abnormality.id} · {abnormality.kpiName} has been classified and closed per TQM protocol.
          </div>
          <button onClick={onClose}
            style={{ padding: "8px 28px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showRCA && (
        <RCADialog
          abnormality={abnormality}
          onConfirm={handleRCAConfirm}
          onCancel={() => setShowRCA(false)}
        />
      )}

      <div style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{
          width: 500, maxHeight: "90vh", background: "#fff", borderRadius: 12,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>

          {/* ── Header ── */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 12, background: "#fafafa" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={17} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Close Abnormality</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                Every abnormality must end with a decision. No closure without classification.
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ── Abnormality summary ── */}
            <div style={{ border: `1px solid ${sc.border}`, borderRadius: 9, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: sc.bg, display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={12} color={sc.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{abnormality.severity}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{abnormality.type}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>{abnormality.id} · {abnormality.detectedAt}</span>
              </div>
              <div style={{ padding: "10px 14px", background: "#fff" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>
                  {abnormality.kpiName} · {abnormality.line}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{abnormality.description}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10 }}>
                  <span style={{ color: "#94a3b8" }}>
                    {linkedActions.length} linked action{linkedActions.length !== 1 ? "s" : ""}
                  </span>
                  {allActionsResolved && linkedActions.length > 0 && (
                    <span style={{ color: "#15803d", fontWeight: 600 }}>✓ All actions resolved</span>
                  )}
                  {!allActionsResolved && linkedActions.length > 0 && (
                    <span style={{ color: "#d97706", fontWeight: 600 }}>⚠ {linkedActions.filter(a => !["Resolved","Verified","Closed"].includes(a.status)).length} action(s) still open</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Repeat detection banner ── */}
            {abnormality.isRepeatFlag && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 9, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <RefreshCw size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", marginBottom: 3 }}>
                    🔁 Repeated {abnormality.repeatCount}× in the last 7 days
                  </div>
                  <div style={{ fontSize: 11, color: "#b91c1c" }}>
                    System detects a recurring pattern. Closing as One-off may miss the root cause.
                  </div>
                </div>
                {abnormality.suggestedForRCA && (
                  <button
                    onClick={() => setDisposition("RCA")}
                    style={{ flexShrink: 0, padding: "4px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Suggest RCA ↑
                  </button>
                )}
              </div>
            )}

            {/* ── Disposition selector ── */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: 10 }}>
                How should this be classified?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <DispositionCard
                  value="ONE_OFF"
                  selected={disposition}
                  onSelect={setDisposition}
                  icon={<CheckCircle2 />}
                  label="One-off"
                  tagline="Rare, isolated cause — corrected immediately"
                  outcome="Close abnormality"
                  accentColor="#15803d"
                  accentBg="#f0fdf4"
                  accentBorder="#86efac"
                />
                <DispositionCard
                  value="MONITOR"
                  selected={disposition}
                  onSelect={setDisposition}
                  icon={<Eye />}
                  label="Monitor"
                  tagline="Suspicious — might repeat · Add soft flag"
                  outcome="Track recurrence"
                  accentColor="#d97706"
                  accentBg="#fffbeb"
                  accentBorder="#fde68a"
                />
                <DispositionCard
                  value="RCA"
                  selected={disposition}
                  onSelect={setDisposition}
                  icon={<ArrowUpRight />}
                  label="Escalate to RCA"
                  tagline="Repeat / critical pattern — needs root cause analysis"
                  outcome="Move to 1.6 Improvement"
                  accentColor="#1d4ed8"
                  accentBg="#eff6ff"
                  accentBorder="#93c5fd"
                  recommended={abnormality.suggestedForRCA}
                />
              </div>
            </div>

            {/* ── Justification ── */}
            {needsJustification && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>
                  Justification <span style={{ color: "#dc2626" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>(required — min 10 characters)</span>
                </label>
                <textarea
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  rows={3}
                  placeholder={
                    disposition === "ONE_OFF"
                      ? 'e.g. "Maintenance activity caused temporary fluctuation — corrected at 10:15 AM"'
                      : 'e.g. "Seen twice this week — monitoring for further occurrence before escalating"'
                  }
                  style={{
                    width: "100%", padding: "9px 12px", border: justification.trim().length > 0 && justification.trim().length < 10 ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                    borderRadius: 7, fontSize: 12, resize: "none", outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.5,
                    background: "#fafafa",
                  }}
                />
                {justification.trim().length > 0 && justification.trim().length < 10 && (
                  <div style={{ fontSize: 10, color: "#d97706" }}>
                    ⚠ Minimum 10 characters required ({justification.trim().length}/10)
                  </div>
                )}
              </div>
            )}

            {disposition === "RCA" && (
              <div style={{ padding: "10px 14px", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#1e40af" }}>
                  ℹ Selecting <strong>Escalate to RCA</strong> will prompt you to create a pre-filled Improvement Case in Module 1.6. No justification required here.
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={onClose}
              style={{ padding: "8px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
              Cancel
            </button>
            <div style={{ flex: 1 }} />
            {!canSubmit && disposition !== null && needsJustification && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>Justification required to submit</span>
            )}
            {disposition === null && (
              <span style={{ fontSize: 10, color: "#94a3b8" }}>Select a disposition to continue</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 22px", borderRadius: 7, border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
                fontSize: 12, fontWeight: 700,
                background: canSubmit
                  ? (disposition === "RCA" ? "#1d4ed8" : disposition === "ONE_OFF" ? "#15803d" : "#d97706")
                  : "#e2e8f0",
                color: canSubmit ? "#fff" : "#94a3b8",
                transition: "all 0.15s",
              }}>
              {disposition === "RCA"     ? <><Zap size={13} /> Escalate to RCA →</> :
               disposition === "ONE_OFF" ? <><CheckCircle2 size={13} /> Close as One-off</> :
               disposition === "MONITOR" ? <><Eye size={13} /> Mark for Monitoring</> :
               "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Inline Disposition Badge (for board / meeting views) ────────────────────
export const DispositionBadge: React.FC<{ disposition: DispositionType }> = ({ disposition }) => {
  if (!disposition) return null;
  const cfg: Record<string, { bg: string; color: string; border: string; label: string }> = {
    ONE_OFF: { bg: "#f0fdf4", color: "#15803d", border: "#86efac", label: "✓ One-off" },
    MONITOR: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "👁 Monitor" },
    RCA:     { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", label: "⚡ → RCA" },
  };
  const s = cfg[disposition];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

// ─── Repeat Flag Chip ─────────────────────────────────────────────────────────
export const RepeatFlagChip: React.FC<{ count: number; suggested?: boolean }> = ({ count, suggested }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 3,
    fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 8,
    background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5",
  }}>
    🔁 ×{count}{suggested ? " · RCA?" : ""}
  </span>
);
