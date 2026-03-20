import React, { useState } from "react";
import {
  BookOpen, FileText, Share2, UserCheck, Target, SquareCheck,
  GitBranch, ChartBar, GitMerge, Zap, X, Plus,
} from "lucide-react";
import { measures, Measure } from "../../../data/standardsData";
import { measureTargets, ownershipMatrix } from "../../../data/measuresData";
import { LibraryScreen }          from "./measures/LibraryScreen";
import { DesignerScreen }         from "./measures/DesignerScreen";
import { GraphScreen }            from "./measures/GraphScreen";
import { WorkbenchScreens }       from "./measures/WorkbenchScreens";
import { RelationshipsScreen }    from "./measures/RelationshipsScreen";
import { ImpactAnalysisScreen }   from "./measures/ImpactAnalysisScreen";

// ─── Secondary nav items (matches 4.1 spec exactly) ──────────────────────────
type MeasureScreen =
  | "library" | "designer" | "targets" | "relationships"
  | "graph"   | "ownership" | "approvals" | "versions" | "impact";

interface NavItem { id: MeasureScreen; label: string; icon: React.ElementType; badge?: string; group?: string }

const MEASURE_NAV: NavItem[] = [
  // Library
  { id: "library",       label: "Measure Library",   icon: BookOpen,    group: "browse"     },
  { id: "designer",      label: "Measure Designer",  icon: FileText,    group: "browse"     },
  // Workbenches
  { id: "targets",       label: "Targets",           icon: Target,      group: "manage"     },
  { id: "relationships", label: "Relationships",     icon: GitMerge,    group: "manage"     },
  { id: "graph",         label: "Graph Explorer",    icon: Share2,      group: "manage"     },
  { id: "ownership",     label: "Ownership Matrix",  icon: UserCheck,   group: "manage", badge: "3 gaps" },
  // Governance
  { id: "approvals",     label: "Approvals",         icon: SquareCheck, group: "govern", badge: "2"     },
  { id: "versions",      label: "Versions",          icon: GitBranch,   group: "govern"     },
  { id: "impact",        label: "Impact Analysis",   icon: Zap,         group: "govern"     },
];

const NAV_GROUPS: { key: string; label: string }[] = [
  { key: "browse",  label: "Browse"    },
  { key: "manage",  label: "Manage"    },
  { key: "govern",  label: "Governance"},
];

// ─── Quick stats ──────────────────────────────────────────────────────────────
function getStats() {
  const gaps = measures.filter(m => {
    const rows = ownershipMatrix.filter(r => r.measureId === m.id);
    return rows.length === 0 || rows.some(r => r.resolutionStatus === "Ownership Gap");
  }).length;
  return {
    total:   measures.length,
    active:  measures.filter(m => m.status === "Effective").length,
    gaps,
    draft:   measures.filter(m => m.status === "Draft").length,
    targets: measureTargets.filter(t => t.status === "Active").length,
  };
}

// ─── Create Measure Modal ─────────────────────────────────────────────────────
const CreateMeasureModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    code: "", name: "", type: "KPI", description: "",
    ownerPosition: "", unitOfMeasure: "", sourceType: "Manual",
    frequency: "Daily", criticality: "High",
  });

  const TYPE_DESCRIPTIONS: Record<string, string> = {
    KPI: "Key Performance Indicator – top-level strategic/operational outcome",
    MP:  "Monitoring Point – process or line-level performance measure",
    MOP: "Measure of Performance – step or activity level measure",
    CP:  "Control Point – critical parameter requiring process control",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 600, background: "#fff", borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={14} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Create New Measure</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Step {step} of 3 — {step === 1 ? "Basic Definition" : step === 2 ? "Source & Ownership" : "Review & Submit"}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={16} /></button>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", padding: "10px 18px", gap: 0, background: "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: step >= s ? "#2563eb" : "#e2e8f0",
                color: step >= s ? "#fff" : "#94a3b8",
                fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {s}
              </div>
              <div style={{ fontSize: 11, color: step >= s ? "#1d4ed8" : "#94a3b8", marginLeft: 6, fontWeight: step === s ? 600 : 400 }}>
                {s === 1 ? "Definition" : s === 2 ? "Source & Owner" : "Review"}
              </div>
              {s < 3 && <div style={{ flex: 1, height: 1, background: step > s ? "#2563eb" : "#e2e8f0", margin: "0 10px" }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {step === 1 && (
            <>
              {/* Type selector */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", display: "block", marginBottom: 8 }}>Measure Type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["KPI","MP","MOP","CP"] as const).map(t => (
                    <div key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      style={{ padding: "10px 12px", border: `2px solid ${form.type === t ? "#2563eb" : "#e2e8f0"}`,
                        borderRadius: 7, cursor: "pointer", background: form.type === t ? "#eff6ff" : "#fff",
                        transition: "all 0.12s" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.type === t ? "#1d4ed8" : "#0f172a", marginBottom: 3 }}>{t}</div>
                      <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{TYPE_DESCRIPTIONS[t]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-field">
                  <label>Measure Code *</label>
                  <input placeholder="e.g. KPI-005" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Criticality *</label>
                  <select value={form.criticality} onChange={e => setForm(f => ({ ...f, criticality: e.target.value }))}>
                    {["Critical","High","Medium","Low"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Measure Name *</label>
                <input placeholder="e.g. On-Time Delivery Rate" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea placeholder="Describe what this measure tracks and why it exists…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 64 }} />
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-field">
                  <label>Unit of Measure *</label>
                  <input placeholder="e.g. %, count, hours, Nm" value={form.unitOfMeasure} onChange={e => setForm(f => ({ ...f, unitOfMeasure: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Frequency *</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    {["Real-time","Hourly","Daily","Weekly","Monthly"].map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-field">
                <label>Owner Position *</label>
                <select value={form.ownerPosition} onChange={e => setForm(f => ({ ...f, ownerPosition: e.target.value }))}>
                  <option value="">— Select Position —</option>
                  {["Production Supervisor","QC Manager","Quality Inspector","Maintenance Lead","Shift Supervisor","Process Engineer"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Source Type *</label>
                <select value={form.sourceType} onChange={e => setForm(f => ({ ...f, sourceType: e.target.value }))}>
                  {["Manual","System","Calculated","Hybrid"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {(form.sourceType === "System" || form.sourceType === "Hybrid") && (
                <div className="form-grid form-grid-2">
                  <div className="form-field"><label>Source System</label><input placeholder="e.g. SAP ERP" /></div>
                  <div className="form-field"><label>Source Entity</label><input placeholder="e.g. PP_PRODUCTION_ORDER" /></div>
                  <div className="form-field"><label>Source Field</label><input placeholder="e.g. TOTAL_COUNT" /></div>
                  <div className="form-field"><label>Extraction Rule</label><input placeholder="e.g. Daily batch at 23:55" /></div>
                </div>
              )}
              {form.sourceType === "Calculated" && (
                <div className="form-field">
                  <label>Formula / Aggregation</label>
                  <textarea placeholder="e.g. (passed_units / total_units) * 100" style={{ minHeight: 64, fontFamily: "monospace" }} />
                </div>
              )}
              <div className="alert-bar info">
                <div style={{ fontSize: 11 }}>
                  After creation, add links to Process, PFC, or SOP in the <strong>Links</strong> tab, and define targets in the <strong>Targets</strong> tab.
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Review & Confirm</div>
              {[
                { label: "Code",          value: form.code          || "—" },
                { label: "Name",          value: form.name          || "—" },
                { label: "Type",          value: form.type               },
                { label: "Criticality",   value: form.criticality        },
                { label: "Unit",          value: form.unitOfMeasure || "—" },
                { label: "Frequency",     value: form.frequency          },
                { label: "Owner Position",value: form.ownerPosition || "—" },
                { label: "Source Type",   value: form.sourceType         },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{value}</span>
                </div>
              ))}
              <div className="alert-bar warning" style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11 }}>
                  Measure will be created as <strong>Draft</strong>. You can submit for approval after adding links and targets.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 8, background: "#fafafa" }}>
          <button className="dwm-btn dwm-btn-ghost" onClick={step === 1 ? onClose : () => setStep(s => (s - 1) as any)}>
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          <button className="dwm-btn dwm-btn-primary" onClick={() => { if (step < 3) setStep(s => (s + 1) as any); else onClose(); }}>
            {step < 3 ? "Next →" : "Create Draft Measure"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Hub component ─────────────────────────────────────────────────────────────
export const MeasureDesigner: React.FC = () => {
  const [activeScreen, setActiveScreen]     = useState<MeasureScreen>("library");
  const [selectedMeasure, setSelectedMeasure] = useState<Measure>(measures[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hoveredNav, setHoveredNav]           = useState<MeasureScreen | null>(null);

  const stats = getStats();

  const navigateTo = (screen: MeasureScreen, measure?: Measure) => {
    if (measure) setSelectedMeasure(measure);
    setActiveScreen(screen);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ── Secondary nav ── */}
      <div style={{
        width: 188, flexShrink: 0,
        background: "#f8fafc", borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Section header */}
        <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ChartBar size={14} color="#2563eb" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Measures</span>
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Framework v1.3</div>
        </div>

        {/* Grouped nav items */}
        <nav style={{ padding: "6px 6px", flex: 1 }}>
          {NAV_GROUPS.map((grp, gi) => {
            const items = MEASURE_NAV.filter(n => n.group === grp.key);
            return (
              <div key={grp.key}>
                {gi > 0 && <div style={{ height: 1, background: "#e2e8f0", margin: "6px 4px" }} />}
                <div style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em", padding: "4px 10px 2px" }}>
                  {grp.label}
                </div>
                {items.map(item => {
                  const Icon    = item.icon;
                  const isActive  = activeScreen === item.id;
                  const isHovered = hoveredNav === item.id && !isActive;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveScreen(item.id)}
                      onMouseEnter={() => setHoveredNav(item.id)}
                      onMouseLeave={() => setHoveredNav(null)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        width: "100%", padding: "6px 10px", marginBottom: 1,
                        border: "none", cursor: "pointer", borderRadius: 5,
                        fontFamily: "var(--dwm-font)", fontSize: 12, textAlign: "left",
                        background: isActive ? "#eff6ff" : isHovered ? "rgba(0,0,0,0.04)" : "transparent",
                        color: isActive ? "#1d4ed8" : "#475569",
                        transition: "all 0.12s",
                      }}
                    >
                      <Icon size={13} style={{ flexShrink: 0 }} color={isActive ? "#2563eb" : "#94a3b8"} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: 9, padding: "1px 5px", borderRadius: 8,
                          background: item.badge.includes("gaps") ? "#fef2f2" : "#eff6ff",
                          color:      item.badge.includes("gaps") ? "#dc2626"  : "#1d4ed8",
                          fontWeight: 700, border: `1px solid ${item.badge.includes("gaps") ? "#fca5a5" : "#93c5fd"}`,
                        }}>{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Active measure context strip */}
        {(activeScreen === "designer" || activeScreen === "graph" || activeScreen === "approvals" || activeScreen === "versions") && (
          <div style={{ padding: "8px 12px", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Active Measure</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{selectedMeasure.name}</div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#1d4ed8" }}>{selectedMeasure.code}</div>
          </div>
        )}

        {/* Quick create button */}
        <div style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0" }}>
          <button className="dwm-btn dwm-btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
            onClick={() => setShowCreateModal(true)}>
            <Plus size={11} /> New Measure
          </button>
        </div>

        {/* Stats footer */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Stats</div>
          {[
            { label: "Total",          value: stats.total,   color: "#1d4ed8" },
            { label: "Active",         value: stats.active,  color: "#15803d" },
            { label: "Owner Gaps",     value: stats.gaps,    color: "#dc2626" },
            { label: "Active Targets", value: stats.targets, color: "#d97706" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Screen content ── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeScreen === "library" && (
          <LibraryScreen
            selectedMeasure={selectedMeasure}
            setSelectedMeasure={setSelectedMeasure}
            onOpenDesigner={m => navigateTo("designer", m)}
            onOpenGraph={m => navigateTo("graph", m)}
            onCreateMeasure={() => setShowCreateModal(true)}
          />
        )}
        {activeScreen === "designer" && (
          <DesignerScreen
            measure={selectedMeasure}
            onOpenGraph={() => navigateTo("graph")}
          />
        )}
        {activeScreen === "graph" && (
          <GraphScreen
            centerMeasureId={selectedMeasure.id}
            onSelectMeasure={m => setSelectedMeasure(m)}
          />
        )}
        {activeScreen === "relationships" && <RelationshipsScreen />}
        {activeScreen === "impact"         && <ImpactAnalysisScreen />}
        {activeScreen === "ownership" && (
          <WorkbenchScreens screen="ownership" measure={selectedMeasure} />
        )}
        {activeScreen === "targets" && (
          <WorkbenchScreens screen="targets" measure={selectedMeasure} />
        )}
        {activeScreen === "approvals" && (
          <WorkbenchScreens screen="approvals" measure={selectedMeasure} />
        )}
        {activeScreen === "versions" && (
          <WorkbenchScreens screen="versions" measure={selectedMeasure} />
        )}
      </div>

      {/* ── Create Measure Modal ── */}
      {showCreateModal && <CreateMeasureModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};