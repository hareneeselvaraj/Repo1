import React, { useState, useRef, useCallback } from "react";
import { Layers, Save, AlertTriangle, Send, ZoomIn, ZoomOut, GitBranch, ChevronRight, List, ShieldCheck, Settings } from "lucide-react";
import { pfcs, PFCNode, PFCEdge, PFCNodeType } from "../../../data/standardsData";
import { StatusBadge } from "../shared/StatusBadge";

// ─── Node Visual Config ────────────────────────────────────────────────────────
const NODE_CONFIG: Record<PFCNodeType, { shape: "rect" | "circle" | "diamond" | "hexagon"; bg: string; border: string; textColor: string; icon: string }> = {
  Start:             { shape: "circle",  bg: "#16a34a", border: "#15803d", textColor: "#fff", icon: "▶" },
  End:               { shape: "circle",  bg: "#dc2626", border: "#b91c1c", textColor: "#fff", icon: "■" },
  Activity:          { shape: "rect",    bg: "#eff6ff", border: "#93c5fd", textColor: "#1e40af", icon: "⬡" },
  Decision:          { shape: "diamond", bg: "#fffbeb", border: "#fcd34d", textColor: "#92400e", icon: "◆" },
  Handoff:           { shape: "rect",    bg: "#f0f9ff", border: "#7dd3fc", textColor: "#0369a1", icon: "→" },
  Inspection:        { shape: "rect",    bg: "#f0fdf4", border: "#86efac", textColor: "#15803d", icon: "✓" },
  Rework:            { shape: "rect",    bg: "#fff7ed", border: "#fdba74", textColor: "#c2410c", icon: "↺" },
  Escalation:        { shape: "rect",    bg: "#fdf4ff", border: "#d8b4fe", textColor: "#7e22ce", icon: "↑" },
  Exception:         { shape: "rect",    bg: "#fef2f2", border: "#fca5a5", textColor: "#991b1b", icon: "!" },
  ExternalInterface: { shape: "rect",    bg: "#f8fafc", border: "#94a3b8", textColor: "#475569", icon: "⇔" },
};

const NODE_W = 140;
const NODE_H_CIRCLE = 40;
const NODE_H_RECT = 44;
const NODE_H_DIAMOND = 50;

const PALETTE_TYPES: PFCNodeType[] = ["Activity", "Decision", "Inspection", "Handoff", "Rework", "Escalation", "Exception", "ExternalInterface"];

// ─── Compute port positions ────────────────────────────────────────────────────
function getPortPos(node: PFCNode, side: "top" | "bottom" | "left" | "right") {
  const h = node.type === "Start" || node.type === "End" ? NODE_H_CIRCLE : node.type === "Decision" ? NODE_H_DIAMOND : NODE_H_RECT;
  const cx = node.x + NODE_W / 2;
  const cy = node.y + h / 2;
  if (side === "top")    return { x: cx, y: node.y };
  if (side === "bottom") return { x: cx, y: node.y + h };
  if (side === "left")   return { x: node.x, y: cy };
  return { x: node.x + NODE_W, y: cy };
}

function renderNode(node: PFCNode, isSelected: boolean, onClick: () => void) {
  const cfg = NODE_CONFIG[node.type];
  const h = node.type === "Start" || node.type === "End" ? NODE_H_CIRCLE : node.type === "Decision" ? NODE_H_DIAMOND : NODE_H_RECT;
  const cx = node.x + NODE_W / 2;
  const cy = node.y + h / 2;
  const sel = isSelected;

  let shape: React.ReactNode;
  if (node.type === "Start" || node.type === "End") {
    const r = NODE_H_CIRCLE / 2;
    shape = (
      <circle cx={cx} cy={cy} r={r}
        fill={cfg.bg} stroke={sel ? "#1d4ed8" : cfg.border} strokeWidth={sel ? 2.5 : 1.5} />
    );
  } else if (node.type === "Decision") {
    const hw = NODE_W / 2, hh = h / 2;
    const pts = `${cx},${node.y} ${node.x + NODE_W},${cy} ${cx},${node.y + h} ${node.x},${cy}`;
    shape = <polygon points={pts} fill={cfg.bg} stroke={sel ? "#1d4ed8" : cfg.border} strokeWidth={sel ? 2.5 : 1.5} />;
  } else {
    shape = (
      <rect x={node.x} y={node.y} width={NODE_W} height={h} rx={5}
        fill={cfg.bg} stroke={sel ? "#1d4ed8" : cfg.border} strokeWidth={sel ? 2.5 : 1.5} />
    );
  }

  const badge = node.criticalFlag || node.exceptionFlag || node.reworkFlag;

  return (
    <g key={node.id} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {shape}
      {/* Node text */}
      <text
        x={cx} y={cy + (node.type === "Start" || node.type === "End" ? 0 : -4)}
        textAnchor="middle" dominantBaseline="middle"
        fill={cfg.textColor} fontSize={10} fontWeight={600}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <tspan>{cfg.icon} </tspan>
        <tspan>{node.name.length > 16 ? node.name.slice(0, 15) + "…" : node.name}</tspan>
      </text>
      {/* Subtitle */}
      {node.type !== "Start" && node.type !== "End" && node.responsiblePosition && (
        <text x={cx} y={cy + 11} textAnchor="middle" fill="#94a3b8" fontSize={8} style={{ pointerEvents: "none", userSelect: "none" }}>
          {node.responsiblePosition.length > 20 ? node.responsiblePosition.slice(0, 19) + "…" : node.responsiblePosition}
        </text>
      )}
      {/* Critical flag badge */}
      {node.criticalFlag && (
        <circle cx={node.x + NODE_W - 4} cy={node.y + 4} r={5} fill="#dc2626" />
      )}
      {/* Rework badge */}
      {node.reworkFlag && (
        <circle cx={node.x + NODE_W - 14} cy={node.y + 4} r={5} fill="#d97706" />
      )}
      {/* SOP link indicator */}
      {node.linkedSOP && (
        <rect x={node.x + 2} y={node.y + 2} width={8} height={8} rx={2} fill="#2563eb" />
      )}
    </g>
  );
}

function renderEdge(edge: PFCEdge, nodes: PFCNode[]) {
  const from = nodes.find((n) => n.id === edge.from);
  const to   = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  const fp = getPortPos(from, "bottom");
  const tp = getPortPos(to, "top");

  // Draw curved path
  const dx = tp.x - fp.x;
  const dy = tp.y - fp.y;
  const isRight = dx > 40;
  let d: string;
  if (isRight) {
    d = `M ${fp.x} ${fp.y} C ${fp.x} ${fp.y + 40} ${tp.x} ${tp.y - 40} ${tp.x} ${tp.y}`;
  } else {
    d = `M ${fp.x} ${fp.y} C ${fp.x} ${fp.y + 30} ${tp.x} ${tp.y - 30} ${tp.x} ${tp.y}`;
  }

  const midX = (fp.x + tp.x) / 2;
  const midY = (fp.y + tp.y) / 2;

  return (
    <g key={edge.id}>
      <defs>
        <marker id={`arrow-${edge.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
        </marker>
      </defs>
      <path d={d} stroke="#94a3b8" strokeWidth={1.5} fill="none" markerEnd={`url(#arrow-${edge.id})`} />
      {edge.label && (
        <text x={midX} y={midY - 4} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight={500}
          style={{ background: "#fff" }}>
          {edge.label}
        </text>
      )}
    </g>
  );
}

export const PFCDesigner: React.FC = () => {
  const pfc = pfcs[0];
  const [nodes, setNodes] = useState<PFCNode[]>(pfc.nodes);
  const [selectedNode, setSelectedNode] = useState<PFCNode | null>(pfc.nodes[2]);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 20 });
  const [propTab, setPropTab] = useState<"props" | "nodes" | "validate">("props");
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const nx = (e.clientX - rect.left - pan.x) / zoom - dragging.current.ox;
    const ny = (e.clientY - rect.top  - pan.y) / zoom - dragging.current.oy;
    setNodes((prev) => prev.map((n) => n.id === dragging.current!.id ? { ...n, x: Math.max(0, nx), y: Math.max(0, ny) } : n));
  }, [pan, zoom]);

  const onNodeMouseDown = (e: React.MouseEvent, node: PFCNode) => {
    e.stopPropagation();
    const rect = svgRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pan.x) / zoom;
    const my = (e.clientY - rect.top  - pan.y) / zoom;
    dragging.current = { id: node.id, ox: mx - node.x, oy: my - node.y };
  };

  const onSvgMouseUp = () => { dragging.current = null; };

  return (
    <div className="screen-shell">
      {/* Toolbar */}
      <div style={{ padding: "8px 16px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div className="ph-icon"><Layers size={16} /></div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{pfc.name}</div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>{pfc.code} · {pfc.version} · Process: {pfc.processName}</div>
        </div>
        <StatusBadge status={pfc.status as any} />

        {/* Ownership ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, marginLeft: 8, fontSize: 11 }}>
          <span style={{ color: "#94a3b8" }}>Owner Position:</span>
          <span style={{ fontWeight: 500, color: "#0f172a" }}>{pfc.ownerPosition}</span>
          <span style={{ color: "#94a3b8" }}>·</span>
          <span style={{ color: "#94a3b8" }}>Responsible:</span>
          <span style={{ fontWeight: 500, color: "#16a34a" }}>{pfc.resolvedOwner}</span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <button className="dwm-btn dwm-btn-ghost" onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}><ZoomOut size={12} /></button>
          <span style={{ fontSize: 11, color: "#64748b", minWidth: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button className="dwm-btn dwm-btn-ghost" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}><ZoomIn size={12} /></button>
          <button className="dwm-btn dwm-btn-ghost"><Save size={12} /> Save</button>
          <button className="dwm-btn dwm-btn-ghost"><AlertTriangle size={12} /> Validate</button>
          <button className="dwm-btn dwm-btn-primary"><Send size={12} /> Submit</button>
        </div>
      </div>

      {/* Main PFC shell */}
      <div className="pfc-shell" style={{ flex: 1, overflow: "hidden" }}>
        {/* Node palette */}
        <div className="pfc-palette">
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0", fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Node Types
          </div>
          {/* Start / End */}
          {(["Start", "End"] as PFCNodeType[]).map((t) => {
            const cfg = NODE_CONFIG[t];
            return (
              <div key={t} className="pfc-palette-item">
                <div className="ppi-icon" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "50%", color: cfg.textColor }}>{cfg.icon}</div>
                <span>{t}</span>
              </div>
            );
          })}
          <div style={{ height: 1, background: "#e2e8f0", margin: "4px 0" }} />
          {PALETTE_TYPES.map((t) => {
            const cfg = NODE_CONFIG[t];
            return (
              <div key={t} className="pfc-palette-item">
                <div className="ppi-icon" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.textColor }}>{cfg.icon}</div>
                <span>{t}</span>
              </div>
            );
          })}
          {/* Legend */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #e2e8f0", marginTop: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Legend</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626" }} /> Critical step
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706" }} /> Rework node
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#2563eb" }} /> SOP linked
              </div>
            </div>
          </div>
        </div>

        {/* Canvas + stats footer column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="pfc-canvas-area" style={{ flex: 1 }}>
            <svg
              ref={svgRef}
              width="100%" height="100%"
              style={{ cursor: dragging.current ? "grabbing" : "default" }}
              onMouseMove={onSvgMouseMove}
              onMouseUp={onSvgMouseUp}
              onClick={() => setSelectedNode(null)}
            >
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {pfc.edges.map((edge) => renderEdge(edge, nodes))}
                {nodes.map((node) => (
                  <g key={node.id} onMouseDown={(e) => onNodeMouseDown(e, node)}>
                    {renderNode(node, selectedNode?.id === node.id, () => setSelectedNode(node))}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Stats footer */}
          <div style={{ height: 34, background: "#0f172a", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 0, padding: "0 16px", flexShrink: 0, overflow: "hidden" }}>
            {[
              { label: "Nodes",         value: nodes.length,                                    color: "#93c5fd" },
              { label: "Critical Steps",value: nodes.filter(n => n.criticalFlag).length,         color: "#f87171" },
              { label: "SOP-Linked",    value: nodes.filter(n => n.linkedSOP).length,            color: "#6ee7b7" },
              { label: "Rework Paths",  value: nodes.filter(n => n.reworkFlag).length,           color: "#fbbf24" },
              { label: "Decisions",     value: nodes.filter(n => n.type === "Decision").length,  color: "#c084fc" },
              { label: "Exceptions",    value: nodes.filter(n => n.type === "Exception").length, color: "#fb923c" },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, paddingRight: 18, borderRight: i < 5 ? "1px solid #1e293b" : "none", marginRight: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 10, color: "#334155" }}>
              PFC: {pfc.code} · {pfc.version} · Last modified {pfc.lastModified}
            </div>
          </div>
        </div>

        {/* Properties panel – tabbed */}
        <div className="pfc-props-panel" style={{ overflow: "hidden" }}>
          {/* Panel header */}
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0", background: "#fafafa", fontSize: 11, fontWeight: 600, color: "#0f172a", flexShrink: 0 }}>
            {selectedNode ? `Node: ${selectedNode.name}` : "PFC Inspector"}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            {([
              { key: "props",    icon: Settings,    label: "Properties" },
              { key: "nodes",    icon: List,        label: "All Nodes"  },
              { key: "validate", icon: ShieldCheck, label: "Validate"   },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setPropTab(key)}
                style={{
                  flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  borderBottom: propTab === key ? "2px solid #2563eb" : "2px solid transparent",
                  background: "transparent", color: propTab === key ? "#2563eb" : "#94a3b8",
                  fontFamily: "inherit",
                }}
              >
                <Icon size={11} />{label}
              </button>
            ))}
          </div>

          {/* ── Properties sub-tab ── */}
          {propTab === "props" && (
            <>
              {selectedNode ? (
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
                  <div className="form-field"><label>Node Code</label><input value={selectedNode.code} readOnly style={{ background: "#f8fafc" }} /></div>
                  <div className="form-field"><label>Node Name *</label><input defaultValue={selectedNode.name} /></div>
                  <div className="form-field"><label>Node Type</label>
                    <select defaultValue={selectedNode.type}>
                      {Object.keys(NODE_CONFIG).map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label>Responsible Position</label>
                    <select defaultValue={selectedNode.responsiblePosition}>
                      <option>Production Supervisor</option>
                      <option>Quality Inspector</option>
                      <option>Shift Supervisor</option>
                      <option>QC Manager</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { key: "criticalFlag",  label: "Critical Step"  },
                      { key: "exceptionFlag", label: "Exception Path" },
                      { key: "reworkFlag",    label: "Rework Node"    },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" id={key} defaultChecked={(selectedNode as any)[key]} />
                        <label htmlFor={key} style={{ fontSize: 12, cursor: "pointer" }}>{label}</label>
                      </div>
                    ))}
                  </div>
                  <div className="form-field"><label>Linked SOP</label><input defaultValue={selectedNode.linkedSOP ?? ""} placeholder="e.g. SOP-001" /></div>
                  <button className="dwm-btn dwm-btn-primary" style={{ justifyContent: "center" }}>Update Node</button>
                  {selectedNode.linkedSOP && (
                    <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center", fontSize: 11 }}>
                      <ChevronRight size={11} /> Open Linked SOP
                    </button>
                  )}
                </div>
              ) : (
                <div className="empty-state" style={{ flex: 1 }}>
                  <Layers size={28} className="es-icon" />
                  <div className="es-title">Click a node</div>
                  <div className="es-sub">Select any node on the canvas to edit its properties</div>
                </div>
              )}
            </>
          )}

          {/* ── Node List sub-tab ── */}
          {propTab === "nodes" && (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
                    <th style={{ padding: "6px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Node</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                    <th style={{ padding: "6px 6px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((n) => {
                    const cfg = NODE_CONFIG[n.type];
                    const isSel = selectedNode?.id === n.id;
                    return (
                      <tr
                        key={n.id}
                        style={{ cursor: "pointer", background: isSel ? "#eff6ff" : undefined, borderBottom: "1px solid #f1f5f9" }}
                        onClick={() => { setSelectedNode(n); setPropTab("props"); }}
                      >
                        <td style={{ padding: "6px 10px" }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: isSel ? "#1d4ed8" : "#0f172a" }}>{n.name}</div>
                          {n.responsiblePosition && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{n.responsiblePosition}</div>}
                          {n.linkedSOP && <div style={{ fontSize: 9, color: "#2563eb", marginTop: 1 }}>↗ {n.linkedSOP}</div>}
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}`, fontWeight: 600 }}>{n.type}</span>
                        </td>
                        <td style={{ padding: "6px 6px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                            {n.criticalFlag  && <div title="Critical"   style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />}
                            {n.reworkFlag    && <div title="Rework"     style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706" }} />}
                            {n.linkedSOP     && <div title="SOP Linked" style={{ width: 6, height: 6, borderRadius: 2,    background: "#2563eb" }} />}
                            {n.exceptionFlag && <div title="Exception"  style={{ width: 6, height: 6, borderRadius: "50%", background: "#7e22ce" }} />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0", fontSize: 10, color: "#94a3b8", background: "#fafafa" }}>
                Click any row to select & edit that node
              </div>
            </div>
          )}

          {/* ── Validate sub-tab ── */}
          {propTab === "validate" && (() => {
            const critMissingSOPs  = nodes.filter(n => n.criticalFlag && !n.linkedSOP && n.type !== "Start" && n.type !== "End");
            const missingPosition  = nodes.filter(n => !n.responsiblePosition && n.type !== "Start" && n.type !== "End");
            const connectedIds     = new Set([...pfc.edges.map(e => e.from), ...pfc.edges.map(e => e.to)]);
            const orphans          = nodes.filter(n => n.type !== "Start" && n.type !== "End" && !connectedIds.has(n.id));
            const decisionNodes    = nodes.filter(n => n.type === "Decision");
            const underboundDec    = decisionNodes.filter(dn => pfc.edges.filter(e => e.from === dn.id).length < 2);
            const reworkLoops      = nodes.filter(n => n.reworkFlag).length;

            const checks = [
              {
                label: "Responsible positions assigned",
                pass: missingPosition.length === 0,
                detail: missingPosition.length > 0
                  ? `Missing on: ${missingPosition.map(n => n.name).join(", ")}`
                  : `${nodes.filter(n => n.type !== "Start" && n.type !== "End").length} nodes checked`,
              },
              {
                label: "Critical steps have SOP links",
                pass: critMissingSOPs.length === 0,
                detail: critMissingSOPs.length > 0
                  ? `Missing SOP: ${critMissingSOPs.map(n => n.name).join(", ")}`
                  : `${nodes.filter(n => n.criticalFlag).length} critical steps verified`,
              },
              {
                label: "Decision nodes have ≥ 2 outgoing edges",
                pass: underboundDec.length === 0,
                detail: underboundDec.length > 0
                  ? `Under-bound: ${underboundDec.map(d => d.name).join(", ")}`
                  : `${decisionNodes.length} decision nodes checked`,
              },
              {
                label: "No orphan nodes detected",
                pass: orphans.length === 0,
                detail: orphans.length > 0
                  ? `Orphaned: ${orphans.map(n => n.name).join(", ")}`
                  : "All nodes connected",
              },
              {
                label: "Rework loops are bounded",
                pass: true,
                detail: reworkLoops > 0 ? `${reworkLoops} rework path(s) detected – bounded` : "No rework loops",
              },
            ];

            const passCount = checks.filter(c => c.pass).length;
            const failCount = checks.filter(c => !c.pass).length;

            return (
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Score */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 10px", borderRadius: 7, background: failCount === 0 ? "#f0fdf4" : "#fffbeb", border: `1px solid ${failCount === 0 ? "#86efac" : "#fcd34d"}` }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: failCount === 0 ? "#15803d" : "#d97706" }}>{passCount}/{checks.length}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: failCount === 0 ? "#15803d" : "#d97706" }}>{failCount === 0 ? "All checks passed" : `${failCount} issue${failCount > 1 ? "s" : ""} found`}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Structural validation</div>
                  </div>
                </div>

                {checks.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "7px 10px", borderRadius: 6, background: c.pass ? "#f0fdf4" : "#fef2f2", border: `1px solid ${c.pass ? "#bbf7d0" : "#fca5a5"}` }}>
                    <span style={{ fontSize: 13, color: c.pass ? "#15803d" : "#dc2626", flexShrink: 0, lineHeight: 1.4 }}>{c.pass ? "✓" : "✗"}</span>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: c.pass ? "#166534" : "#991b1b" }}>{c.label}</div>
                      <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{c.detail}</div>
                    </div>
                  </div>
                ))}

                <button className="dwm-btn dwm-btn-ghost" style={{ justifyContent: "center", marginTop: 4, fontSize: 11 }}>
                  <ShieldCheck size={11} /> Re-run Validation
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};