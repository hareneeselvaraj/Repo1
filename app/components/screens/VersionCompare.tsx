import React, { useState } from "react";
import { GitCompare, ChevronRight } from "lucide-react";

const DIFF_SECTIONS = [
  {
    section: "SOP Header",
    fields: [
      { field: "Title",         v1: "Kit Verification SOP",      v2: "Kit Verification SOP",            changed: false },
      { field: "Owner Position", v1: "Shift Supervisor",          v2: "Quality Inspector",               changed: true  },
      { field: "Version",        v1: "v1.2",                      v2: "v1.3",                            changed: true  },
    ],
  },
  {
    section: "Step 2 – Physical Count",
    fields: [
      { field: "Evidence Required", v1: "No",                    v2: "Yes – Count Record Form",         changed: true  },
      { field: "Description",       v1: "Count components…",     v2: "Physically count all components with calibrated tools…", changed: true },
    ],
  },
  {
    section: "Step 3 – Condition Inspection",
    fields: [
      { field: "Quality Note",   v1: "Ref: QC-STD-010",         v2: "Ref: QC-STD-012",                 changed: true  },
      { field: "Description",    v1: "Inspect each component for damage…", v2: "Inspect each component for damage…", changed: false },
    ],
  },
  {
    section: "Step 4 – Record & Release",
    fields: [
      { field: "Timing Rule",    v1: "Within 45 min of count",  v2: "Within 30 min of count",           changed: true  },
    ],
  },
  {
    section: "Step 5 – Escalation Protocol [ADDED]",
    fields: [
      { field: "Status",         v1: "—",                        v2: "NEW STEP ADDED",                  changed: true, added: true },
      { field: "Description",    v1: "—",                        v2: "Escalate unresolved shortages to Shift Supervisor within 15 min.", changed: true, added: true },
    ],
  },
];

export const VersionCompare: React.FC = () => {
  const [fromVer, setFromVer] = useState("v1.2");
  const [toVer, setToVer] = useState("v1.3");

  const changedCount = DIFF_SECTIONS.reduce((acc, s) => acc + s.fields.filter((f) => f.changed).length, 0);
  const addedSections = DIFF_SECTIONS.filter((s) => s.fields.some((f) => (f as any).added));

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon" style={{ background: "#fdf4ff", color: "#7e22ce" }}><GitCompare size={16} /></div>
        <div>
          <h1>Version Compare</h1>
          <div className="ph-sub">Kit Verification SOP – highlighting changes between versions</div>
        </div>
        <div className="ph-actions">
          <select className="filter-select">
            <option>SOP</option><option>PFC</option><option>Role Sheet</option><option>Measure</option>
          </select>
          <select className="filter-select">
            <option>Kit Verification SOP</option>
            <option>Torque Fastener Application SOP</option>
          </select>
        </div>
      </div>

      {/* Version selector bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        <div style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "8px 14px" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>From Version</div>
          <select
            value={fromVer}
            onChange={(e) => setFromVer(e.target.value)}
            style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", background: "transparent", border: "none", outline: "none", cursor: "pointer", fontFamily: "var(--dwm-font)" }}
          >
            <option>v1.0</option><option>v1.1</option><option>v1.2</option>
          </select>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>SOP-QC-001 · Effective · 2025-07-01</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <ChevronRight size={20} color="#94a3b8" />
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "2px 10px", fontSize: 10, fontWeight: 600, color: "#d97706" }}>
            {changedCount} changes
          </div>
        </div>

        <div style={{ flex: 1, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 7, padding: "8px 14px" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>To Version</div>
          <select
            value={toVer}
            onChange={(e) => setToVer(e.target.value)}
            style={{ fontSize: 14, fontWeight: 600, color: "#15803d", background: "transparent", border: "none", outline: "none", cursor: "pointer", fontFamily: "var(--dwm-font)" }}
          >
            <option>v1.2</option><option>v1.3</option>
          </select>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>SOP-QC-001 · Under Review · 2026-03-10</div>
        </div>
      </div>

      {/* Diff summary bar */}
      <div style={{ display: "flex", gap: 12, padding: "8px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {[
          { label: "Changed Fields", count: changedCount, color: "#d97706", bg: "#fffbeb" },
          { label: "Added Sections",  count: addedSections.length, color: "#15803d", bg: "#f0fdf4" },
          { label: "Removed Items",   count: 0, color: "#dc2626", bg: "#fef2f2" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 12px", background: bg, borderRadius: 20, fontSize: 11 }}>
            <span style={{ fontWeight: 700, color }}>{count}</span>
            <span style={{ color: "#64748b" }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
          Ownership changed: <strong style={{ color: "#d97706" }}>Shift Supervisor → Quality Inspector</strong>
        </div>
      </div>

      {/* Diff body */}
      <div className="content-area">
        {DIFF_SECTIONS.map((section) => (
          <div key={section.section} className="dwm-panel">
            <div className="dwm-panel-header">
              <div className="ph-title" style={{ color: section.fields.some((f) => (f as any).added) ? "#15803d" : undefined }}>
                {section.fields.some((f) => (f as any).added) && <span style={{ fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac", borderRadius: 3, padding: "1px 5px", marginRight: 6 }}>NEW</span>}
                {section.section}
              </div>
              <span className="ph-count">{section.fields.filter((f) => f.changed).length} change(s)</span>
            </div>
            <table className="dwm-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Field</th>
                  <th>Version {fromVer}</th>
                  <th>Version {toVer}</th>
                  <th style={{ width: 80 }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {section.fields.map((f, i) => (
                  <tr key={i}>
                    <td><span className="td-primary" style={{ fontSize: 11 }}>{f.field}</span></td>
                    <td>
                      <div
                        className={f.changed && !(f as any).added ? "diff-removed" : "diff-unchanged"}
                        style={{ margin: 0, border: "none", padding: "3px 6px" }}
                      >
                        {f.v1}
                      </div>
                    </td>
                    <td>
                      <div
                        className={f.changed ? ((f as any).added ? "diff-added" : "diff-changed") : "diff-unchanged"}
                        style={{ margin: 0, border: "none", padding: "3px 6px" }}
                      >
                        {f.v2}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {f.changed ? (
                        (f as any).added ? (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 3, padding: "1px 4px" }}>ADDED</span>
                        ) : (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#d97706", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 3, padding: "1px 4px" }}>CHANGED</span>
                        )
                      ) : (
                        <span style={{ fontSize: 10, color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
