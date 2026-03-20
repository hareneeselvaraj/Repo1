import React, { useState, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, GitBranch, Info, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { measures, Measure } from "../../../../data/standardsData";
import { measureRelationships, graphNodePositions } from "../../../../data/measuresData";
import { TYPE_COLOR } from "./LibraryScreen";

const NODE_W = 148;
const NODE_H = 52;

const TYPE_GRAPH: Record<string, { bg: string; border: string; textColor: string; badge: string }> = {
  KPI: { bg: "#eff6ff", border: "#3b82f6", textColor: "#1e40af",  badge: "KPI" },
  MP:  { bg: "#f0fdf4", border: "#22c55e", textColor: "#15803d",  badge: "MP"  },
  MOP: { bg: "#fdf4ff", border: "#c084fc", textColor: "#7e22ce",  badge: "MOP" },
  CP:  { bg: "#fff7ed", border: "#fb923c", textColor: "#c2410c",  badge: "CP"  },
};

const REL_COLORS: Record<string, string> = {
  "Contributes To": "#3b82f6",
  "Derived From":   "#7e22ce",
  "Rollup":         "#15803d",
  "Baseline":       "#94a3b8",
};

interface GraphScreenProps {
  centerMeasureId: string;
  onSelectMeasure: (m: Measure) => void;
}

export const GraphScreen: React.FC<GraphScreenProps> = ({ centerMeasureId, onSelectMeasure }) => {
  const [zoom, setZoom]         = useState(0.88);
  const [pan, setPan]           = useState({ x: 30, y: 20 });
  const [selectedId, setSelectedId] = useState(centerMeasureId);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ x0: number; y0: number; px: number; py: number } | null>(null);

  const posMap    = new Map(graphNodePositions.map(p => [p.measureId, p]));
  const measureMap = new Map(measures.map(m => [m.id, m]));
  const selected  = measureMap.get(selectedId);

  const onSvgMouseDown = (e: React.MouseEvent) => {
    dragging.current = { x0: e.clientX, y0: e.clientY, px: pan.x, py: pan.y };
  };
  const onSvgMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.x0;
    const dy = e.clientY - dragging.current.y0;
    setPan({ x: dragging.current.px + dx, y: dragging.current.py + dy });
  }, []);
  const onSvgMouseUp = () => { dragging.current = null; };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Canvas column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <GitBranch size={14} color="#2563eb" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>Graph Explorer</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>· Measure Relationships · {measures.length} nodes · {measureRelationships.length} edges</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button className="dwm-btn dwm-btn-ghost" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut size={12} /></button>
            <span style={{ fontSize: 11, color: "#64748b", minWidth: 42, textAlign: "center", alignSelf: "center" }}>{Math.round(zoom * 100)}%</span>
            <button className="dwm-btn dwm-btn-ghost" onClick={() => setZoom(z => Math.min(1.6, z + 0.1))}><ZoomIn size={12} /></button>
            <button className="dwm-btn dwm-btn-ghost" onClick={() => { setZoom(0.88); setPan({ x: 30, y: 20 }); }}><Maximize2 size={12} /></button>
          </div>
        </div>

        {/* SVG canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f8fafc",
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <svg
            ref={svgRef} width="100%" height="100%"
            style={{ cursor: dragging.current ? "grabbing" : "grab" }}
            onMouseDown={onSvgMouseDown}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
            onClick={() => {}}
          >
            <defs>
              {measureRelationships.map(r => (
                <marker key={`m-${r.id}`} id={`arrow-${r.id}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L0,7 L7,3.5 z" fill={r.shared ? "#c084fc" : REL_COLORS[r.type] ?? "#94a3b8"} />
                </marker>
              ))}
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {measureRelationships.map(r => {
                const fromPos = posMap.get(r.fromId);
                const toPos   = posMap.get(r.toId);
                if (!fromPos || !toPos) return null;

                // Edge from child bottom-center to parent top-center (arrows point up = toward parent)
                const x1 = fromPos.x + NODE_W / 2;
                const y1 = fromPos.y;                 // top of child → pointing UP means we go from child top to parent bottom
                const x2 = toPos.x   + NODE_W / 2;
                const y2 = toPos.y   + NODE_H;       // parent bottom (since parent is above = smaller y)
                const midY = (y1 + y2) / 2;
                const d = `M ${x1} ${y1} C ${x1} ${midY - 20} ${x2} ${midY + 20} ${x2} ${y2}`;
                const edgeColor = r.shared ? "#c084fc" : REL_COLORS[r.type] ?? "#94a3b8";

                const midX = (x1 + x2) / 2;
                const midYLabel = (y1 + y2) / 2;

                return (
                  <g key={r.id}>
                    <path d={d} stroke={edgeColor} strokeWidth={r.shared ? 1.5 : 1.2}
                      strokeDasharray={r.shared ? "5,3" : "none"}
                      fill="none" markerEnd={`url(#arrow-${r.id})`} />
                    {/* Weight badge */}
                    <rect x={midX - 14} y={midYLabel - 8} width={28} height={14} rx={4}
                      fill="white" stroke={edgeColor} strokeWidth={0.8} />
                    <text x={midX} y={midYLabel + 3} textAnchor="middle" fontSize={9} fontWeight={600} fill={edgeColor}>
                      {(r.weight * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {measures.map(m => {
                const pos = posMap.get(m.id);
                if (!pos) return null;
                const cfg = TYPE_GRAPH[m.type] ?? TYPE_GRAPH.KPI;
                const isSel = m.id === selectedId;
                const isShared = measureRelationships.filter(r => r.fromId === m.id).some(r => r.shared);

                return (
                  <g key={m.id} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setSelectedId(m.id); onSelectMeasure(m); }}>
                    {/* Shared measure dashed border */}
                    {isShared && (
                      <rect x={pos.x - 3} y={pos.y - 3} width={NODE_W + 6} height={NODE_H + 6} rx={9}
                        fill="none" stroke="#7e22ce" strokeWidth={1.5} strokeDasharray="4,3" />
                    )}
                    {/* Node body */}
                    <rect x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={7}
                      fill={isSel ? "#eff6ff" : cfg.bg}
                      stroke={isSel ? "#2563eb" : cfg.border}
                      strokeWidth={isSel ? 2.5 : 1.5}
                      style={{ filter: isSel ? "drop-shadow(0 2px 6px rgba(37,99,235,0.25))" : undefined }}
                    />
                    {/* Type badge */}
                    <rect x={pos.x + 5} y={pos.y + 5} width={26} height={14} rx={3} fill={cfg.border + "33"} />
                    <text x={pos.x + 18} y={pos.y + 15} textAnchor="middle" fontSize={8} fontWeight={700} fill={cfg.textColor}>{cfg.badge}</text>
                    {/* Name */}
                    <text x={pos.x + NODE_W / 2} y={pos.y + 30} textAnchor="middle" fontSize={10} fontWeight={600}
                      fill={isSel ? "#1d4ed8" : cfg.textColor}
                      style={{ pointerEvents: "none", userSelect: "none" }}>
                      {m.name.length > 18 ? m.name.slice(0, 17) + "…" : m.name}
                    </text>
                    {/* Code */}
                    <text x={pos.x + NODE_W - 5} y={pos.y + NODE_H - 5} textAnchor="end" fontSize={8} fill="#94a3b8" style={{ pointerEvents: "none" }}>
                      {m.code}
                    </text>
                    {/* Shared badge */}
                    {isShared && (
                      <>
                        <rect x={pos.x + NODE_W - 36} y={pos.y + 5} width={32} height={13} rx={5} fill="#fdf4ff" />
                        <text x={pos.x + NODE_W - 20} y={pos.y + 14} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#7e22ce">Shared</text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Legend bar */}
        <div style={{ display: "flex", gap: 16, padding: "7px 16px", background: "#0f172a", borderTop: "1px solid #1e293b", flexShrink: 0, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", alignSelf: "center" }}>Legend:</span>
          {Object.entries(TYPE_GRAPH).map(([type, cfg]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{type}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 24, height: 2, background: "#3b82f6" }} />
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Contributes To</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#c084fc" strokeWidth="2" strokeDasharray="4,2" /></svg>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Shared Measure</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, border: "1.5px dashed #7e22ce", background: "transparent" }} />
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Multi-parent</span>
          </div>
        </div>
      </div>

      {/* Node detail panel */}
      <div style={{ width: 280, flexShrink: 0, borderLeft: "1px solid #e2e8f0", background: "#fff", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {selected ? (
          <>
            <div style={{ padding: "10px 14px", background: "#fafafa", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                {(() => { const tc = TYPE_COLOR[selected.type]; return (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{selected.type}</span>
                ); })()}
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#1d4ed8", fontWeight: 600 }}>{selected.code}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>{selected.name}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{selected.ownerPosition}</div>
            </div>

            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {[
                { label: "Unit",       value: selected.unitOfMeasure },
                { label: "Frequency",  value: selected.frequency     },
                { label: "Source",     value: selected.sourceType    },
                { label: "Criticality",value: selected.criticality   },
                { label: "Status",     value: selected.status        },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#475569" }}>{value}</span>
                </div>
              ))}

              {/* Relationships summary */}
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Relationships</div>
                {measureRelationships.filter(r => r.fromId === selected.id).map(r => {
                  const parent = measures.find(m => m.id === r.toId);
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <ArrowUpRight size={11} color="#15803d" />
                      <span style={{ fontSize: 11, color: "#0f172a", flex: 1 }}>{parent?.name ?? r.toId}</span>
                      <span style={{ fontSize: 9, color: "#64748b" }}>{(r.weight * 100).toFixed(0)}%</span>
                      {r.shared && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "#fdf4ff", color: "#7e22ce" }}>Shared</span>}
                    </div>
                  );
                })}
                {measureRelationships.filter(r => r.toId === selected.id).map(r => {
                  const child = measures.find(m => m.id === r.fromId);
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <ArrowDownLeft size={11} color="#7e22ce" />
                      <span style={{ fontSize: 11, color: "#0f172a", flex: 1 }}>{child?.name ?? r.fromId}</span>
                      <span style={{ fontSize: 9, color: "#64748b" }}>{(r.weight * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
                {measureRelationships.filter(r => r.fromId === selected.id || r.toId === selected.id).length === 0 && (
                  <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>No relationships defined</div>
                )}
              </div>
            </div>

            <div style={{ padding: "10px 14px", borderTop: "1px solid #e2e8f0" }}>
              <button className="dwm-btn dwm-btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 11 }}
                onClick={() => onSelectMeasure(selected)}>
                Open in Designer
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1 }}>
            <Info size={24} className="es-icon" />
            <div className="es-title">Click a node</div>
            <div className="es-sub">Select any measure node to view its details and relationships</div>
          </div>
        )}
      </div>
    </div>
  );
};
