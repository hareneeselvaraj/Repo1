import React, { useState } from "react";
import {
  Globe, CheckCircle2, AlertTriangle, Clock, ChevronRight,
  Plus, Search, Filter, RefreshCw, MessageSquare, ChartBar,
} from "lucide-react";
import {
  yokotenDeployments, YokotenDeployment, YokotenAdoptionStatus,
  processes, sops, pfcs,
} from "../../../../data/standardsData";

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<YokotenAdoptionStatus, { bg: string; color: string; border: string; icon: React.ReactNode; label: string }> = {
  ADOPTED:     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", icon: <CheckCircle2 size={11} />, label: "Adopted" },
  IN_PROGRESS: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", icon: <Clock size={11} />,        label: "In Progress" },
  NOT_STARTED: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", icon: <Clock size={11} />,        label: "Not Started" },
  DEVIATED:    { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", icon: <AlertTriangle size={11} />, label: "Deviated" },
};

const TYPE_CFG: Record<string, { bg: string; color: string }> = {
  Process: { bg: "#eff6ff", color: "#1e40af" },
  PFC:     { bg: "#f0fdf4", color: "#15803d" },
  SOP:     { bg: "#fff7ed", color: "#c2410c" },
};

// ─── Wizard step config ────────────────────────────────────────────────────────
const WIZARD_STEPS = [
  { no: 1, label: "Select Standard" },
  { no: 2, label: "Target Scope" },
  { no: 3, label: "Review Summary" },
  { no: 4, label: "Confirm" },
];

const SITES = ["Mumbai", "Pune", "Hyderabad", "Bengaluru", "Delhi NCR"];
const DEPTS: Record<string, string[]> = {
  Mumbai:    ["Assembly", "Quality Control", "Logistics"],
  Pune:      ["Assembly", "Quality Control", "Maintenance"],
  Hyderabad: ["Assembly", "Logistics"],
  Bengaluru: ["Assembly", "Quality Control", "Safety"],
  "Delhi NCR": ["Logistics", "Maintenance"],
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function AdoptionBadge({ status }: { status: YokotenAdoptionStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Deviation Note Modal ──────────────────────────────────────────────────────
function DeviationModal({ deployment, onClose }: { deployment: YokotenDeployment; onClose: () => void }) {
  const [note, setNote] = useState(deployment.deviationNote ?? "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "12px 16px", background: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>Deviation Note – {deployment.targetSite}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            <strong>{deployment.standardName}</strong> {deployment.version} deployed to {deployment.targetSite} / {deployment.targetDepartment}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe the deviation from the standard…"
            style={{ width: "100%", minHeight: 90, fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 5, padding: 10, fontFamily: "var(--dwm-font)", resize: "vertical", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button className="dwm-btn dwm-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="dwm-btn dwm-btn-primary" onClick={onClose}>Save Deviation Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export const YokotenScreen: React.FC = () => {
  const [mode, setMode]                   = useState<"wizard" | "tracker">("tracker");
  const [wizardStep, setWizardStep]       = useState(1);
  const [stdType, setStdType]             = useState<"Process" | "PFC" | "SOP">("Process");
  const [selectedStdId, setSelectedStdId] = useState(processes[0].id);
  const [selectedVersion, setSelectedVersion] = useState("v2.1");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<Record<string, string[]>>({});
  const [deployed, setDeployed]           = useState(false);
  const [searchT, setSearchT]             = useState("");
  const [filterStatus, setFilterStatus]   = useState<YokotenAdoptionStatus | "All">("All");
  const [filterType, setFilterType]       = useState<"All" | "Process" | "PFC" | "SOP">("All");
  const [deviationTarget, setDeviationTarget] = useState<YokotenDeployment | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, YokotenAdoptionStatus>>({});

  const allDeployments = yokotenDeployments;

  const filtered = allDeployments.filter(d => {
    const q = searchT.toLowerCase();
    const matchSearch = d.standardName.toLowerCase().includes(q) || d.standardCode.toLowerCase().includes(q) || d.targetSite.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || (statusOverrides[d.id] ?? d.adoptionStatus) === filterStatus;
    const matchType   = filterType === "All" || d.standardType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const adoptedCount    = allDeployments.filter(d => (statusOverrides[d.id] ?? d.adoptionStatus) === "ADOPTED").length;
  const deviatedCount   = allDeployments.filter(d => (statusOverrides[d.id] ?? d.adoptionStatus) === "DEVIATED").length;
  const inProgressCount = allDeployments.filter(d => (statusOverrides[d.id] ?? d.adoptionStatus) === "IN_PROGRESS").length;
  const notStartedCount = allDeployments.filter(d => (statusOverrides[d.id] ?? d.adoptionStatus) === "NOT_STARTED").length;

  const toggleSite = (site: string) => {
    setSelectedSites(prev => prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]);
  };

  const toggleDept = (site: string, dept: string) => {
    setSelectedDepts(prev => {
      const current = prev[site] ?? [];
      const next = current.includes(dept) ? current.filter(d => d !== dept) : [...current, dept];
      return { ...prev, [site]: next };
    });
  };

  const totalTargets = selectedSites.reduce((acc, site) => acc + (selectedDepts[site]?.length ?? 1), 0);

  const stdOptions = stdType === "Process" ? processes : stdType === "SOP" ? sops.map(s => ({ id: s.id, code: s.code, name: s.title, status: s.status })) : pfcs.map(p => ({ id: p.id, code: p.code, name: p.name, status: p.status }));

  return (
    <div className="screen-shell">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="ph-icon"><Globe size={16} /></div>
        <div>
          <h1>Yokoten</h1>
          <div className="ph-sub">Deploy and track adoption of standards across sites and departments</div>
        </div>
        <div className="ph-actions">
          <button className={`dwm-btn ${mode === "tracker" ? "dwm-btn-primary" : "dwm-btn-ghost"}`} onClick={() => setMode("tracker")}>
            <ChartBar size={12} /> Adoption Tracker
          </button>
          <button className={`dwm-btn ${mode === "wizard" ? "dwm-btn-primary" : "dwm-btn-ghost"}`} onClick={() => { setMode("wizard"); setWizardStep(1); setDeployed(false); }}>
            <Plus size={12} /> New Deployment
          </button>
        </div>
      </div>

      {/* ── Mode: Tracker ── */}
      {mode === "tracker" && (
        <>
          {/* Summary KPIs */}
          <div style={{ padding: "0 16px 10px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "Adopted",     value: adoptedCount,    ...STATUS_CFG.ADOPTED },
              { label: "In Progress", value: inProgressCount, ...STATUS_CFG.IN_PROGRESS },
              { label: "Not Started", value: notStartedCount, ...STATUS_CFG.NOT_STARTED },
              { label: "Deviated",    value: deviatedCount,   ...STATUS_CFG.DEVIATED },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 7, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 11, color: c.color, fontWeight: 500 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <div className="filter-input">
              <Search size={12} color="#94a3b8" />
              <input placeholder="Search standard or site…" value={searchT} onChange={e => setSearchT(e.target.value)} />
            </div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="All">All Statuses</option>
              <option value="ADOPTED">Adopted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="DEVIATED">Deviated</option>
            </select>
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="All">All Types</option>
              <option value="Process">Process</option>
              <option value="PFC">PFC</option>
              <option value="SOP">SOP</option>
            </select>
            <span className="fb-count">{filtered.length} deployments</span>
          </div>

          {/* Table */}
          <div className="content-area" style={{ paddingTop: 0 }}>
            <table className="dwm-table">
              <thead>
                <tr>
                  <th>Standard</th>
                  <th>Type</th>
                  <th>Version</th>
                  <th>Target Context</th>
                  <th>Deployed</th>
                  <th>Adoption Status</th>
                  <th>Deviation Note</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const currentStatus = statusOverrides[d.id] ?? d.adoptionStatus;
                  const tc = TYPE_CFG[d.standardType];
                  return (
                    <tr key={d.id} style={{ background: currentStatus === "DEVIATED" ? "#fff5f5" : undefined }}>
                      <td>
                        <div className="td-primary">{d.standardName}</div>
                        <div className="td-secondary" style={{ fontFamily: "monospace" }}>{d.standardCode}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: tc.bg, color: tc.color }}>{d.standardType}</span>
                      </td>
                      <td><span className="td-secondary">{d.version}</span></td>
                      <td>
                        <div className="td-primary">{d.targetSite}</div>
                        <div className="td-secondary">{d.targetDepartment}{d.targetLine ? ` / ${d.targetLine}` : ""}</div>
                      </td>
                      <td>
                        <div className="td-secondary">{d.deployedDate}</div>
                        <div className="td-secondary">by {d.deployedBy}</div>
                      </td>
                      <td>
                        <AdoptionBadge status={currentStatus} />
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        {d.deviationNote ? (
                          <span style={{ fontSize: 11, color: "#dc2626", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.deviationNote}>
                            {d.deviationNote}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#d1d5db" }}>–</span>
                        )}
                      </td>
                      <td>
                        <div className="td-secondary">{d.lastUpdated}</div>
                        <div className="td-secondary">by {d.updatedBy}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <select
                            value={currentStatus}
                            onChange={e => setStatusOverrides(prev => ({ ...prev, [d.id]: e.target.value as YokotenAdoptionStatus }))}
                            style={{ fontSize: 10, padding: "2px 5px", border: "1px solid #e2e8f0", borderRadius: 4, fontFamily: "var(--dwm-font)", cursor: "pointer" }}
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="ADOPTED">Adopted</option>
                            <option value="DEVIATED">Deviated</option>
                          </select>
                          <button
                            className="dwm-btn dwm-btn-ghost"
                            style={{ fontSize: 10, padding: "2px 7px" }}
                            onClick={() => setDeviationTarget(d)}
                            title="Add deviation note"
                          >
                            <MessageSquare size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Mode: Deployment Wizard ── */}
      {mode === "wizard" && (
        <div className="content-area" style={{ maxWidth: 700 }}>
          {/* Wizard Stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
            {WIZARD_STEPS.map((step, idx) => {
              const isDone    = step.no < wizardStep;
              const isCurrent = step.no === wizardStep;
              return (
                <React.Fragment key={step.no}>
                  <div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, background: isCurrent ? "#eff6ff" : isDone ? "#f0fdf4" : "#fafafa" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: isCurrent ? "#2563eb" : isDone ? "#15803d" : "#e2e8f0", color: isCurrent || isDone ? "#fff" : "#94a3b8", flexShrink: 0 }}>
                      {isDone ? <CheckCircle2 size={12} /> : step.no}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isCurrent ? "#1d4ed8" : isDone ? "#15803d" : "#94a3b8" }}>{step.label}</span>
                  </div>
                  {idx < WIZARD_STEPS.length - 1 && <ChevronRight size={14} color="#d1d5db" style={{ flexShrink: 0 }} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Step 1: Select Standard ── */}
          {wizardStep === 1 && !deployed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Source Standard</div></div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="form-field">
                    <label>Standard Type</label>
                    <select value={stdType} onChange={e => setStdType(e.target.value as any)}>
                      <option value="Process">Process</option>
                      <option value="PFC">PFC</option>
                      <option value="SOP">SOP</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Select Standard</label>
                    <select value={selectedStdId} onChange={e => setSelectedStdId(e.target.value)}>
                      {stdOptions.map((s: any) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Version</label>
                    <select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)}>
                      <option>v2.1</option><option>v2.0</option><option>v1.3</option>
                    </select>
                  </div>
                  {/* Selected standard preview */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Preview</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: TYPE_CFG[stdType].bg, color: TYPE_CFG[stdType].color }}>{stdType}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{(stdOptions.find((s: any) => s.id === selectedStdId) as any)?.name ?? "–"}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{selectedVersion}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="dwm-btn dwm-btn-primary" onClick={() => setWizardStep(2)}>Next: Target Scope <ChevronRight size={12} /></button>
              </div>
            </div>
          )}

          {/* ── Step 2: Target Scope ── */}
          {wizardStep === 2 && !deployed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header">
                  <div className="ph-title">Select Target Sites &amp; Departments</div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{selectedSites.length} site{selectedSites.length !== 1 ? "s" : ""} selected</span>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {SITES.map(site => (
                    <div key={site} style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
                      <div
                        style={{ padding: "8px 14px", background: selectedSites.includes(site) ? "#eff6ff" : "#fafafa", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                        onClick={() => toggleSite(site)}
                      >
                        <input type="checkbox" checked={selectedSites.includes(site)} onChange={() => toggleSite(site)} onClick={e => e.stopPropagation()} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{site}</span>
                        {selectedSites.includes(site) && <span style={{ fontSize: 10, color: "#1d4ed8", marginLeft: "auto" }}>{selectedDepts[site]?.length ?? 0} dept{(selectedDepts[site]?.length ?? 0) !== 1 ? "s" : ""} selected</span>}
                      </div>
                      {selectedSites.includes(site) && (
                        <div style={{ padding: "8px 14px 10px 36px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {(DEPTS[site] ?? []).map(dept => (
                            <label key={dept} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, cursor: "pointer", padding: "3px 10px", borderRadius: 4, background: selectedDepts[site]?.includes(dept) ? "#eff6ff" : "#f8fafc", border: "1px solid #e2e8f0" }}>
                              <input type="checkbox" checked={selectedDepts[site]?.includes(dept) ?? false} onChange={() => toggleDept(site, dept)} />
                              {dept}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="dwm-btn dwm-btn-ghost" onClick={() => setWizardStep(1)}>← Back</button>
                <button className="dwm-btn dwm-btn-primary" disabled={selectedSites.length === 0} style={{ opacity: selectedSites.length === 0 ? 0.5 : 1 }} onClick={() => setWizardStep(3)}>
                  Next: Review Summary <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review Summary ── */}
          {wizardStep === 3 && !deployed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Deployment Summary</div></div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Standard",    value: (stdOptions.find((s: any) => s.id === selectedStdId) as any)?.name ?? "–" },
                      { label: "Type",        value: stdType },
                      { label: "Version",     value: selectedVersion },
                      { label: "Target Sites", value: `${selectedSites.length} sites` },
                      { label: "Total Contexts", value: `${totalTargets} deployments` },
                      { label: "Initiated by", value: "Ravi Kumar" },
                    ].map(({ label, value }) => (
                      <div key={label} className="detail-field">
                        <div className="df-label">{label}</div>
                        <div className="df-value">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Target Contexts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {selectedSites.map(site => (
                      <div key={site} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0" }}>
                        <Globe size={12} color="#64748b" />
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{site}</span>
                        {selectedDepts[site]?.length > 0 && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>— {selectedDepts[site].join(", ")}</span>
                        )}
                        <span style={{ marginLeft: "auto" }}><AdoptionBadge status="NOT_STARTED" /></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="alert-bar info">
                <AlertTriangle size={12} />
                <span>Applicability rules will be validated at each target site before deployment is confirmed.</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="dwm-btn dwm-btn-ghost" onClick={() => setWizardStep(2)}>← Back</button>
                <button className="dwm-btn dwm-btn-primary" onClick={() => setWizardStep(4)}>Next: Confirm <ChevronRight size={12} /></button>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ── */}
          {wizardStep === 4 && !deployed && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dwm-panel">
                <div className="dwm-panel-header"><div className="ph-title">Confirm Deployment</div></div>
                <div style={{ padding: 16 }}>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#d97706", display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><AlertTriangle size={11} /> Review Before Confirming</div>
                    <div style={{ fontSize: 11, color: "#92400e" }}>
                      You are about to deploy <strong>{(stdOptions.find((s: any) => s.id === selectedStdId) as any)?.name}</strong> {selectedVersion} to <strong>{totalTargets} target context{totalTargets !== 1 ? "s" : ""}</strong>. This action will notify all site leads and create adoption tracking records.
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {["Applicability rules validated", "All target sites exist and are active", "No duplicate deployments detected", "Governance rules satisfied"].map((check, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                        <CheckCircle2 size={12} color="#15803d" />
                        <span style={{ color: "#475569" }}>{check}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="dwm-btn dwm-btn-ghost" onClick={() => setWizardStep(3)}>← Back</button>
                    <button className="dwm-btn dwm-btn-primary" onClick={() => setDeployed(true)}>
                      <CheckCircle2 size={12} /> Confirm &amp; Deploy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Deployed Success ── */}
          {deployed && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 32, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <CheckCircle2 size={26} color="#fff" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>Deployment Created Successfully</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                {(stdOptions.find((s: any) => s.id === selectedStdId) as any)?.name} {selectedVersion} has been deployed to {totalTargets} target context{totalTargets !== 1 ? "s" : ""}. Site leads have been notified.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="dwm-btn dwm-btn-ghost" onClick={() => { setMode("tracker"); setDeployed(false); setWizardStep(1); setSelectedSites([]); setSelectedDepts({}); }}>
                  View Adoption Tracker
                </button>
                <button className="dwm-btn dwm-btn-primary" onClick={() => { setDeployed(false); setWizardStep(1); setSelectedSites([]); setSelectedDepts({}); }}>
                  <Plus size={12} /> New Deployment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deviation Modal */}
      {deviationTarget && <DeviationModal deployment={deviationTarget} onClose={() => setDeviationTarget(null)} />}
    </div>
  );
};
