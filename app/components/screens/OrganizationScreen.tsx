import React, { useState } from "react";
import { Building2, ChevronRight, ChevronDown, Plus, Edit2, ToggleLeft, Users } from "lucide-react";
import { orgUnits, OrgUnit } from "../../../data/orgData";
import { OwnershipCard } from "../shared/OwnershipCard";

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Enterprise:  { bg: "#eff6ff", color: "#1e40af" },
  Region:      { bg: "#f0f9ff", color: "#0369a1" },
  Site:        { bg: "#f0fdf4", color: "#15803d" },
  Department:  { bg: "#fdf4ff", color: "#7e22ce" },
  Function:    { bg: "#fff7ed", color: "#c2410c" },
  Team:        { bg: "#f8fafc", color: "#475569" },
};

function buildTree(units: OrgUnit[]): Map<string | null, OrgUnit[]> {
  const map = new Map<string | null, OrgUnit[]>();
  for (const u of units) {
    const arr = map.get(u.parentId) ?? [];
    arr.push(u);
    map.set(u.parentId, arr);
  }
  return map;
}

interface TreeNodeProps {
  unit: OrgUnit;
  tree: Map<string | null, OrgUnit[]>;
  depth: number;
  selectedId: string | null;
  onSelect: (u: OrgUnit) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({ unit, tree, depth, selectedId, onSelect, expandedIds, onToggle }) => {
  const children = tree.get(unit.id) ?? [];
  const hasChildren = children.length > 0;
  const expanded = expandedIds.has(unit.id);
  const tc = TYPE_COLORS[unit.type] ?? { bg: "#f8fafc", color: "#475569" };

  return (
    <div>
      <div
        className={`tree-node ${selectedId === unit.id ? "active" : ""}`}
        style={{ paddingLeft: 10 + depth * 16 }}
        onClick={() => onSelect(unit)}
      >
        <span
          className="tn-toggle"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(unit.id); }}
        >
          {hasChildren
            ? expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            : <span style={{ display: "inline-block", width: 12 }} />
          }
        </span>
        <Building2 size={13} color={selectedId === unit.id ? "#2563eb" : "#64748b"} className="tn-icon" />
        <span className="tn-label">{unit.name}</span>
        <span
          style={{
            fontSize: 9, fontWeight: 600, padding: "1px 5px",
            borderRadius: 3, background: tc.bg, color: tc.color,
          }}
        >
          {unit.type}
        </span>
        {unit.childCount != null && unit.childCount > 0 && (
          <span className="tn-count">{unit.childCount}</span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNodeItem
              key={child.id}
              unit={child}
              tree={tree}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationScreen: React.FC = () => {
  const tree = buildTree(orgUnits);
  const roots = tree.get(null) ?? [];
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(orgUnits[2]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["OU-001", "OU-002", "OU-003", "OU-006"])
  );

  const onToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const children = selectedUnit ? (tree.get(selectedUnit.id) ?? []) : [];

  return (
    <div className="screen-shell">
      <div className="page-header">
        <div className="ph-icon"><Building2 size={16} /></div>
        <div>
          <h1>Organization</h1>
          <div className="ph-sub">Manage org hierarchy, units, and assigned heads</div>
        </div>
        <div className="ph-actions">
          <button className="dwm-btn dwm-btn-ghost"><Edit2 size={12} /> Edit Unit</button>
          <button className="dwm-btn dwm-btn-primary"><Plus size={12} /> Create Org Unit</button>
        </div>
      </div>

      <div className="split-layout" style={{ gap: 12 }}>
        {/* Left – Tree */}
        <div className="split-left">
          <div className="dwm-panel" style={{ flex: 1, overflow: "hidden" }}>
            <div className="dwm-panel-header">
              <div className="ph-title"><Building2 size={13} color="#2563eb" /> Org Hierarchy</div>
              <button className="ph-action">Expand All</button>
            </div>
            <div className="dwm-panel-body">
              {roots.map((root) => (
                <TreeNodeItem
                  key={root.id}
                  unit={root}
                  tree={tree}
                  depth={0}
                  selectedId={selectedUnit?.id ?? null}
                  onSelect={setSelectedUnit}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right – Detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          {selectedUnit ? (
            <>
              {/* Header */}
              <div className="dwm-panel">
                <div
                  style={{
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #1e40af, #2563eb)",
                    color: "#fff",
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Building2 size={20} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedUnit.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.75 }}>{selectedUnit.code} · {selectedUnit.type}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <span className={`dwm-badge ${selectedUnit.activeFlag ? "dwm-badge-effective" : "dwm-badge-superseded"}`}>
                        {selectedUnit.activeFlag ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid #e2e8f0" }}>
                  {[
                    { label: "Type",         value: selectedUnit.type },
                    { label: "Effective From", value: selectedUnit.effectiveFrom },
                    { label: "Effective To",   value: selectedUnit.effectiveTo ?? "Ongoing" },
                    { label: "Child Units",    value: `${selectedUnit.childCount ?? 0}` },
                  ].map((f, i) => (
                    <div key={f.label} style={{ padding: "10px 14px", borderRight: i < 3 ? "1px solid #f1f5f9" : undefined }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", marginTop: 2 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ownership */}
              <div className="dwm-panel">
                <div className="dwm-panel-header">
                  <div className="ph-title"><Users size={13} color="#64748b" /> Head / Ownership</div>
                </div>
                <div style={{ padding: 14 }}>
                  <OwnershipCard
                    ownerPosition={selectedUnit.headPosition ?? "—"}
                    resolvedPerson={selectedUnit.headPerson ?? "Not Resolved"}
                    context={selectedUnit.name}
                  />
                </div>
              </div>

              {/* Child Units */}
              {children.length > 0 && (
                <div className="dwm-panel">
                  <div className="dwm-panel-header">
                    <div className="ph-title"><Building2 size={13} color="#64748b" /> Child Units</div>
                    <span className="ph-count">{children.length}</span>
                  </div>
                  <table className="dwm-table">
                    <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Head</th><th>Status</th></tr></thead>
                    <tbody>
                      {children.map((c) => {
                        const tc = TYPE_COLORS[c.type] ?? { bg: "#f8fafc", color: "#475569" };
                        return (
                          <tr key={c.id} onClick={() => setSelectedUnit(c)}>
                            <td><span className="td-primary">{c.code}</span></td>
                            <td><span className="td-primary">{c.name}</span></td>
                            <td>
                              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: tc.bg, color: tc.color, fontWeight: 600 }}>
                                {c.type}
                              </span>
                            </td>
                            <td><span className="td-secondary">{c.headPerson ?? "—"}</span></td>
                            <td><span className={`dwm-badge ${c.activeFlag ? "dwm-badge-effective" : "dwm-badge-draft"}`}>{c.activeFlag ? "Active" : "Inactive"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="dwm-panel" style={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex" }}>
              <div className="empty-state">
                <Building2 size={32} className="es-icon" />
                <div className="es-title">Select an org unit from the tree</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
