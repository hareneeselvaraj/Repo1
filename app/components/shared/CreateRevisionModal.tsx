import React, { useState } from "react";
import {
  RotateCcw, Wrench, Search, GitBranch, FileText, Shield,
  AlertTriangle, Lock, CheckCircle2,
} from "lucide-react";
import { measures } from "../../../data/standardsData";

// ─── Revision Source Type Config ──────────────────────────────────────────────
// Functional Spec §7 – Revision Traceability (CRITICAL)
// revision_source_type: MANUAL / AUDIT / MEASURE_REFERENCE / DEVIATION_REFERENCE / REGULATORY

export type RevisionSourceType =
  | "MANUAL"
  | "AUDIT"
  | "MEASURE_REFERENCE"
  | "DEVIATION_REFERENCE"
  | "REGULATORY";

const SOURCE_TYPES: {
  value: RevisionSourceType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "MANUAL",
    label: "Manual Update",
    description: "Planned standard update — e.g. periodic review, content improvement, owner change",
    icon: <Wrench size={13} />,
    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
  },
  {
    value: "AUDIT",
    label: "Audit Finding",
    description: "Triggered by an internal or external audit finding requiring corrective action",
    icon: <Search size={13} />,
    color: "#c2410c", bg: "#fff7ed", border: "#fed7aa",
  },
  {
    value: "MEASURE_REFERENCE",
    label: "Measure Reference",
    description: "Triggered by a measure deviation, KPI trend, or control point breach",
    icon: <GitBranch size={13} />,
    color: "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff",
  },
  {
    value: "DEVIATION_REFERENCE",
    label: "Deviation / Abnormality",
    description: "Triggered by a site deviation or process abnormality that exposed a gap in the standard",
    icon: <AlertTriangle size={13} />,
    color: "#dc2626", bg: "#fef2f2", border: "#fca5a5",
  },
  {
    value: "REGULATORY",
    label: "Regulatory / External",
    description: "Required by external regulation, customer requirement, ISO standard, or legal mandate",
    icon: <Shield size={13} />,
    color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd",
  },
];

interface CreateRevisionModalProps {
  objectName: string;
  objectCode: string;
  objectType: "Process" | "PFC" | "SOP";
  currentVersion: string;
  onClose: () => void;
  onSubmit?: (data: {
    sourceType: RevisionSourceType;
    reason: string;
    referenceMeasureId: string;
    referenceId: string;
    changeSummary: string;
  }) => void;
}

export const CreateRevisionModal: React.FC<CreateRevisionModalProps> = ({
  objectName, objectCode, objectType, currentVersion, onClose, onSubmit,
}) => {
  const [sourceType, setSourceType]       = useState<RevisionSourceType>("MANUAL");
  const [reason, setReason]               = useState("");
  const [referenceMeasureId, setRefMeasureId] = useState("");
  const [referenceId, setReferenceId]     = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [submitted, setSubmitted]         = useState(false);

  const selected = SOURCE_TYPES.find(s => s.value === sourceType)!;
  const canSubmit = reason.trim().length >= 10;

  const nextVersion = currentVersion.replace(/v(\d+)\.(\d+)/, (_, maj, min) => `v${maj}.${parseInt(min) + 1}`);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ sourceType, reason, referenceMeasureId, referenceId, changeSummary });
    setSubmitted(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,28,46,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 620, maxHeight: "90vh", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "14px 18px", background: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
          <RotateCcw size={16} color="#60a5fa" />
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>Create Revision</div>
            <div style={{ color: "#64748b", fontSize: 10, marginTop: 1 }}>
              {objectType} · {objectCode} · {objectName} · {currentVersion} → {nextVersion}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={26} color="#15803d" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d" }}>Revision Created</div>
            <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", maxWidth: 360 }}>
              {objectCode} has been moved to <strong>{nextVersion} Draft</strong>. The previous version <strong>{currentVersion}</strong> remains active until this revision is approved and activated.
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 16px", width: "100%", maxWidth: 360, fontSize: 11 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "#94a3b8", width: 120 }}>Source Type</span>
                <span style={{ fontWeight: 600, color: selected.color }}>{selected.label}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#94a3b8", width: 120 }}>Reason</span>
                <span style={{ color: "#334155" }}>{reason.slice(0, 80)}{reason.length > 80 ? "…" : ""}</span>
              </div>
            </div>
            <button className="dwm-btn dwm-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          /* ── Form ── */
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* § STEP 1: Revision Source Type — CRITICAL per functional spec §7 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>1</span>
                Revision Source Type
                <span style={{ fontSize: 10, fontWeight: 400, color: "#dc2626", background: "#fef2f2", padding: "1px 5px", borderRadius: 3, border: "1px solid #fca5a5" }}>Required · Spec §7</span>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>
                What triggered this revision? This is recorded permanently in the audit trail and enables change traceability.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SOURCE_TYPES.map(st => (
                  <div
                    key={st.value}
                    onClick={() => setSourceType(st.value)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", borderRadius: 7, border: `1.5px solid ${sourceType === st.value ? st.border : "#e2e8f0"}`, cursor: "pointer", background: sourceType === st.value ? st.bg : "#fafafa", transition: "all 0.12s" }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: sourceType === st.value ? st.bg : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: sourceType === st.value ? st.color : "#94a3b8", flexShrink: 0, border: `1px solid ${sourceType === st.value ? st.border : "#e2e8f0"}`, marginTop: 1 }}>
                      {st.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="radio" checked={sourceType === st.value} onChange={() => setSourceType(st.value)} style={{ margin: 0, accentColor: st.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: sourceType === st.value ? st.color : "#334155" }}>{st.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "0 5px", borderRadius: 3, background: "#f1f5f9", color: "#64748b" }}>{st.value}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, paddingLeft: 20 }}>{st.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* § STEP 2: Revision Reason */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>2</span>
                Revision Reason
                <span style={{ fontSize: 10, fontWeight: 400, color: "#dc2626", background: "#fef2f2", padding: "1px 5px", borderRadius: 3, border: "1px solid #fca5a5" }}>Required</span>
              </div>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Describe clearly why this standard is being revised. This becomes part of the permanent audit record…"
                style={{ width: "100%", minHeight: 80, fontSize: 12, border: `1px solid ${reason.length > 0 && reason.length < 10 ? "#dc2626" : "#e2e8f0"}`, borderRadius: 5, padding: "8px 10px", fontFamily: "var(--dwm-font)", resize: "vertical", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 10, color: reason.length > 0 && reason.length < 10 ? "#dc2626" : "#94a3b8" }}>
                  {reason.length < 10 ? `Minimum 10 characters (${10 - reason.length} more)` : "✓ Sufficient"}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{reason.length} chars</span>
              </div>
            </div>

            {/* § STEP 3: Reference IDs */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>3</span>
                Reference IDs
                <span style={{ fontSize: 10, fontWeight: 400, color: "#64748b", background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>Optional</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Measure reference — shown when sourceType = MEASURE_REFERENCE */}
                <div className="form-field">
                  <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    Measure Reference
                    {sourceType !== "MEASURE_REFERENCE" && <span style={{ fontSize: 9, color: "#94a3b8" }}>(not required for {SOURCE_TYPES.find(s => s.value === sourceType)?.label})</span>}
                  </label>
                  <select
                    value={referenceMeasureId}
                    onChange={e => setRefMeasureId(e.target.value)}
                    style={{ opacity: sourceType === "MEASURE_REFERENCE" ? 1 : 0.5 }}
                  >
                    <option value="">— None —</option>
                    {measures.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>External Reference ID <span style={{ fontWeight: 400, color: "#94a3b8" }}>(audit no., reg. ref., NCR ID…)</span></label>
                  <input
                    value={referenceId}
                    onChange={e => setReferenceId(e.target.value)}
                    placeholder={
                      sourceType === "AUDIT"             ? "e.g. AUD-2026-014" :
                      sourceType === "REGULATORY"        ? "e.g. ISO-9001-2015-Clause-8.5" :
                      sourceType === "DEVIATION_REFERENCE" ? "e.g. NCR-2026-022" :
                      "Optional reference number"
                    }
                  />
                </div>
              </div>
            </div>

            {/* § STEP 4: Change Summary */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>4</span>
                Change Summary
                <span style={{ fontSize: 10, fontWeight: 400, color: "#64748b", background: "#f1f5f9", padding: "1px 5px", borderRadius: 3 }}>Optional</span>
              </div>
              <textarea
                value={changeSummary}
                onChange={e => setChangeSummary(e.target.value)}
                placeholder="Brief description of what will change in this revision (e.g. 'Update torque spec from 22→25 Nm. Add final inspection step.')…"
                style={{ width: "100%", minHeight: 60, fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 5, padding: "8px 10px", fontFamily: "var(--dwm-font)", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {/* § Future Phase Hooks — Spec §15 — shown disabled for awareness */}
            <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Lock size={12} color="#94a3b8" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Future Phase Hooks — Phase-2 (Read-Only)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, opacity: 0.5 }}>
                <div className="form-field">
                  <label style={{ color: "#94a3b8" }}>Abnormality Reference ID <span style={{ fontWeight: 400 }}>(Phase-2)</span></label>
                  <input disabled placeholder="Not active in Phase-1" style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
                </div>
                <div className="form-field">
                  <label style={{ color: "#94a3b8" }}>PDCA Case Reference <span style={{ fontWeight: 400 }}>(Phase-2)</span></label>
                  <input disabled placeholder="Not active in Phase-1" style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                Per functional spec §15 — These references will be enabled in Phase-2 (Abnormality Management + PDCA). The data model supports them now.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!submitted && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: selected.color }} />
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Source: <strong style={{ color: selected.color }}>{selected.label}</strong>
              </span>
              {referenceMeasureId && (
                <span style={{ fontSize: 11, color: "#7e22ce" }}>
                  · Measure: <strong>{measures.find(m => m.id === referenceMeasureId)?.code}</strong>
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="dwm-btn dwm-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="dwm-btn"
                disabled={!canSubmit}
                onClick={handleSubmit}
                style={{ background: canSubmit ? "#2563eb" : "#e2e8f0", color: canSubmit ? "#fff" : "#94a3b8", border: "none", padding: "5px 16px", borderRadius: 5, cursor: canSubmit ? "pointer" : "not-allowed", display: "flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600 }}
              >
                <RotateCcw size={12} /> Create Revision → {nextVersion}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
