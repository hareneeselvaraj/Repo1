import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";
import { processes, sops, pfcs, measures as allMeasures } from "../../../data/standardsData";
import { measureLinks } from "../../../data/measuresData";

// ─── Types ────────────────────────────────────────────────────────────────────
export type IssueSeverity = "error" | "warning" | "info";
export type IssueCategory = "ownership" | "measure" | "structure" | "cross-module";

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  detail: string;
  objectCode?: string;
  objectName?: string;
  navigateTo?: string;   // react-router path
  specRef?: string;
}

interface UnifiedValidationPanelProps {
  issues: ValidationIssue[];
  /** If true, renders as a compact sidebar panel; otherwise full-width list */
  compact?: boolean;
  /** Show filter chips */
  filterable?: boolean;
  /** Shown above the list */
  title?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const SEV_CFG: Record<IssueSeverity, { bg: string; color: string; border: string; label: string; icon: React.FC<{size:number; color?:string}> }> = {
  error:   { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "Error",   icon: XCircle },
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a", label: "Warning", icon: AlertTriangle },
  info:    { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd", label: "Info",    icon: CheckCircle2 },
};

const CAT_CFG: Record<IssueCategory, { label: string; color: string; bg: string }> = {
  "ownership":    { label: "Ownership",     color: "#c2410c", bg: "#fff7ed" },
  "measure":      { label: "Measures",      color: "#7e22ce", bg: "#fdf4ff" },
  "structure":    { label: "Structure",     color: "#1d4ed8", bg: "#eff6ff" },
  "cross-module": { label: "Cross-Module",  color: "#0f766e", bg: "#f0fdf4" },
};

const ALL_CATS: IssueCategory[] = ["ownership", "measure", "structure", "cross-module"];

// ─── Component ────────────────────────────────────────────────────────────────
export const UnifiedValidationPanel: React.FC<UnifiedValidationPanelProps> = ({
  issues,
  compact = false,
  filterable = true,
  title = "Validation Summary",
}) => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState<IssueCategory | "all">("all");
  const [expandedCats, setExpandedCats] = useState<Set<IssueCategory>>(new Set(ALL_CATS));

  const filtered = activeCat === "all" ? issues : issues.filter(i => i.category === activeCat);

  const errors   = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  const allPass  = issues.length === 0;

  const toggleCat = (cat: IssueCategory) =>
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  // Group by category
  const grouped = ALL_CATS.reduce<Record<IssueCategory, ValidationIssue[]>>(
    (acc, cat) => ({ ...acc, [cat]: filtered.filter(i => i.category === cat) }),
    {} as Record<IssueCategory, ValidationIssue[]>
  );

  return (
    <div style={{
      background: allPass ? "#f0fdf4" : "#fff",
      border: `1px solid ${allPass ? "#86efac" : errors > 0 ? "#fca5a5" : "#fde68a"}`,
      borderRadius: 8, overflow: "hidden", fontFamily: "var(--dwm-font)",
    }}>
      {/* Panel header */}
      <div style={{
        padding: compact ? "7px 12px" : "9px 14px",
        background: allPass ? "#dcfce7" : errors > 0 ? "#fef2f2" : "#fffbeb",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {allPass
          ? <CheckCircle2 size={13} color="#15803d" />
          : <AlertTriangle size={13} color={errors > 0 ? "#dc2626" : "#d97706"} />
        }
        <span style={{ fontSize: 11, fontWeight: 700, color: allPass ? "#15803d" : errors > 0 ? "#dc2626" : "#92400e", flex: 1 }}>
          {title}
        </span>
        {!allPass && (
          <div style={{ display: "flex", gap: 5 }}>
            {errors > 0   && <span style={{ fontSize: 9, fontWeight: 700, background: "#dc2626", color: "#fff", padding: "1px 6px", borderRadius: 8 }}>{errors}E</span>}
            {warnings > 0 && <span style={{ fontSize: 9, fontWeight: 700, background: "#d97706", color: "#fff", padding: "1px 6px", borderRadius: 8 }}>{warnings}W</span>}
          </div>
        )}
        {allPass && <span style={{ fontSize: 10, color: "#15803d" }}>All checks pass</span>}
      </div>

      {/* Filter chips */}
      {filterable && !allPass && !compact && (
        <div style={{ display: "flex", gap: 5, padding: "7px 12px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveCat("all")}
            style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid",
              background: activeCat === "all" ? "#1d4ed8" : "#f1f5f9",
              color: activeCat === "all" ? "#fff" : "#64748b",
              borderColor: activeCat === "all" ? "#1d4ed8" : "#e2e8f0",
              cursor: "pointer" }}
          >All ({issues.length})</button>
          {ALL_CATS.map(cat => {
            const cnt = issues.filter(i => i.category === cat).length;
            if (!cnt) return null;
            const cfg = CAT_CFG[cat];
            return (
              <button key={cat}
                onClick={() => setActiveCat(cat)}
                style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid",
                  background: activeCat === cat ? cfg.color : cfg.bg,
                  color: activeCat === cat ? "#fff" : cfg.color,
                  borderColor: activeCat === cat ? cfg.color : `${cfg.color}40`,
                  cursor: "pointer" }}
              >{cfg.label} ({cnt})</button>
            );
          })}
        </div>
      )}

      {/* Issues list */}
      {!allPass && (
        <div style={{ maxHeight: compact ? 260 : 480, overflowY: "auto" }}>
          {ALL_CATS.map(cat => {
            const catIssues = grouped[cat];
            if (!catIssues.length) return null;
            const cfg = CAT_CFG[cat];
            const isExpanded = expandedCats.has(cat);
            return (
              <div key={cat}>
                {/* Category header */}
                <div
                  onClick={() => toggleCat(cat)}
                  style={{ padding: "5px 12px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
                    display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
                >
                  {isExpanded ? <ChevronDown size={11} color="#94a3b8" /> : <ChevronRight size={11} color="#94a3b8" />}
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3,
                    background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  <span style={{ fontSize: 9, color: "#94a3b8", flex: 1 }}>{catIssues.length} issue{catIssues.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Category issues */}
                {isExpanded && catIssues.map(issue => {
                  const sev = SEV_CFG[issue.severity];
                  const SevIcon = sev.icon;
                  return (
                    <div key={issue.id}
                      style={{ padding: compact ? "6px 12px" : "8px 14px", borderBottom: "1px solid #f8fafc",
                        display: "flex", alignItems: "flex-start", gap: 8, cursor: issue.navigateTo ? "pointer" : "default",
                        background: issue.navigateTo ? undefined : "transparent" }}
                      onClick={issue.navigateTo ? () => navigate(issue.navigateTo!) : undefined}
                      onMouseEnter={e => { if (issue.navigateTo) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <SevIcon size={11} color={sev.color} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{issue.title}</span>
                          {issue.objectCode && (
                            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#1d4ed8", background: "#eff6ff", padding: "0 4px", borderRadius: 3 }}>
                              {issue.objectCode}
                            </span>
                          )}
                          {issue.specRef && (
                            <span style={{ fontSize: 8, color: "#94a3b8" }}>{issue.specRef}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{issue.detail}</div>
                        {issue.objectName && <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>{issue.objectName}</div>}
                      </div>
                      {issue.navigateTo && (
                        <ExternalLink size={10} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── System-wide validation issue builder ─────────────────────────────────────
// Builds the full cross-module validation issue list from data
export function buildSystemValidationIssues(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // ── Ownership issues ──
  processes.forEach(p => {
    if (p.resolvedOwner === "Not Resolved") {
      issues.push({
        id: `own-proc-${p.id}`, severity: "error", category: "ownership",
        title: "Process ownership not resolved",
        detail: `Position "${p.ownerPosition}" has no assigned person in context.`,
        objectCode: p.code, objectName: p.name, navigateTo: "/assignments", specRef: "§2.3",
      });
    }
  });

  sops.forEach(s => {
    if (s.resolvedOwner === "Not Resolved") {
      issues.push({
        id: `own-sop-${s.id}`, severity: "error", category: "ownership",
        title: "SOP ownership not resolved",
        detail: `Position "${s.ownerPosition}" has no person assigned.`,
        objectCode: s.code, objectName: s.title, navigateTo: "/assignments", specRef: "§2.3",
      });
    }
  });

  // ── Process structure issues ──
  processes.forEach(p => {
    const pPFCs = pfcs.filter(f => f.processId === p.id);
    if (pPFCs.length === 0) {
      issues.push({
        id: `struct-nopfc-${p.id}`, severity: "error", category: "structure",
        title: "Process has no PFC",
        detail: "Process must have at least one PFC before it can be activated.",
        objectCode: p.code, objectName: p.name, navigateTo: "/process-designer", specRef: "§11.1",
      });
    }
    pPFCs.forEach(pfc => {
      if (!pfc.nodes.some(n => n.type === "Start")) {
        issues.push({
          id: `struct-nostart-${pfc.id}`, severity: "error", category: "structure",
          title: "PFC missing Start node",
          detail: `PFC "${pfc.code}" has no Start node — cannot form a valid process flow.`,
          objectCode: pfc.code, objectName: pfc.name, navigateTo: "/pfc-designer", specRef: "§11.1",
        });
      }
      if (!pfc.nodes.some(n => n.type === "End")) {
        issues.push({
          id: `struct-noend-${pfc.id}`, severity: "warning", category: "structure",
          title: "PFC missing End node",
          detail: `PFC "${pfc.code}" has no End node.`,
          objectCode: pfc.code, objectName: pfc.name, navigateTo: "/pfc-designer", specRef: "§11.1",
        });
      }
    });
  });

  // ── SOP linkage issues ──
  sops.forEach(s => {
    if (!s.linkedPFC) {
      issues.push({
        id: `struct-sopnolink-${s.id}`, severity: "error", category: "structure",
        title: "SOP not linked to PFC node",
        detail: "SOP must reference a valid PFC node (§11.1: sopPFCLinked).",
        objectCode: s.code, objectName: s.title, navigateTo: "/sop-editor", specRef: "§11.1",
      });
    }
    if (s.steps.length === 0) {
      issues.push({
        id: `struct-sopnosteps-${s.id}`, severity: "warning", category: "structure",
        title: "SOP has no steps",
        detail: "An empty SOP provides no executable guidance.",
        objectCode: s.code, objectName: s.title, navigateTo: "/sop-editor", specRef: "§3.4",
      });
    }
  });

  // ── Measure usage issues ──
  allMeasures.forEach(m => {
    const usages = measureLinks.filter(l => l.measureId === m.id);
    if (usages.length === 0) {
      issues.push({
        id: `measure-unused-${m.id}`, severity: "warning", category: "measure",
        title: "Unused measure",
        detail: `Measure "${m.code}" is defined but not linked to any SOP step or process.`,
        objectCode: m.code, objectName: m.name, navigateTo: "/measures", specRef: "§8.1",
      });
    }
  });

  // ── Cross-module: SOP steps without any measure (critical steps) ──
  sops.forEach(s => {
    const critSteps = s.steps.filter(st => st.criticality === "Critical");
    const measuredSteps = measureLinks.filter(l =>
      l.objectType === "SOP" && l.objectId === s.id
    ).length;
    if (critSteps.length > 0 && measuredSteps === 0) {
      issues.push({
        id: `cross-sopnomeasure-${s.id}`, severity: "warning", category: "cross-module",
        title: "Critical SOP steps unmeasured",
        detail: `${critSteps.length} critical step(s) have no measure linkage (§2.1: measure_link_required).`,
        objectCode: s.code, objectName: s.title, navigateTo: "/sop-editor", specRef: "§2.1",
      });
    }
  });

  return issues;
}