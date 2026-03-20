import React, { useState } from "react";
import {
  AlertTriangle, ChevronRight, Search, Filter, Plus, X, ArrowUpRight,
  CheckCircle2, Clock, BookOpen, ChartBar, Building2, Shield, Zap,
  ChevronDown, ChevronUp, Eye, RefreshCw, FileText, Globe,
  TrendingUp, TrendingDown, Minus, ExternalLink, Paperclip,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  ComposedChart, Line, ReferenceLine, ReferenceArea,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import {
  improvementCases, ImprovementCase, PDCAStage, CAPA, StandardizationItem,
  YokotenItem, ImpTimelineEvent, RCAMethod,
  PDCA_COLOR, IMP_PRIORITY_COLOR, CAPA_STATUS_COLOR, STD_STATUS_COLOR,
  validationChartData,
} from "../../../../data/improvementData";
import { abnormalities, executionActions } from "../../../../data/executionData";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PdcaStageBar: React.FC<{ current: PDCAStage }> = ({ current }) => {
  const stages: PDCAStage[] = ["PLAN", "DO", "CHECK", "ACT", "CLOSED"];
  const idx = stages.indexOf(current);
  const labels: Record<PDCAStage, string> = {
    PLAN: "PLAN · RCA", DO: "DO · CAPA", CHECK: "CHECK · Validate",
    ACT: "ACT · Standardise", CLOSED: "CLOSED",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {stages.map((s, i) => {
        const c = PDCA_COLOR[s];
        const isActive = s === current;
        const isDone   = i < idx;
        return (
          <React.Fragment key={s}>
            <div style={{
              padding: "4px 12px", fontSize: 10, fontWeight: isActive ? 800 : 600,
              background: isActive ? c.color : isDone ? "#e2e8f0" : "#f8fafc",
              color: isActive ? "#fff" : isDone ? "#64748b" : "#94a3b8",
              borderRadius: i === 0 ? "5px 0 0 5px" : i === stages.length - 1 ? "0 5px 5px 0" : 0,
              borderRight: i < stages.length - 1 ? "1px solid rgba(255,255,255,0.2)" : "none",
              whiteSpace: "nowrap",
            }}>
              {isDone && "✓ "}{labels[s]}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Traceability Panel (always-right) ───────────────────────────────────────
const TraceabilityPanel: React.FC<{ imp: ImprovementCase }> = ({ imp }) => {
  const navigate = useNavigate();
  const abn = abnormalities.find(a => a.id === imp.sourceAbnormalityId);
  const acts = executionActions.filter(a => imp.sourceActions.includes(a.id));

  const links = [
    { icon: AlertTriangle, label: "Abnormality", code: imp.sourceAbnormalityId, desc: imp.sourceAbnormalityDesc.slice(0, 55) + "…", route: "/boards", color: "#dc2626" },
    { icon: ChartBar,      label: "KPI / Measure", code: imp.sourceKpiName, desc: `${imp.sourceKpiValue}${imp.sourceKpiUnit} vs target ${imp.sourceKpiTarget}${imp.sourceKpiUnit} · ${imp.sourceMeasureCode}`, route: "/measures", color: "#2563eb" },
    { icon: BookOpen,      label: "Source SOP",   code: imp.sourceSopRef, desc: imp.sourceSopName, route: "/sop-editor", color: "#7c3aed" },
    { icon: Shield,        label: "Owner",        code: imp.ownerPosition, desc: imp.ownerPerson, route: "/assignments", color: "#d97706" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Traceability chain */}
      <div style={{ padding: "8px 10px", background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
          Traceability Chain (≤ 3 clicks)
        </div>
        {links.map(l => {
          const Icon = l.icon;
          return (
            <div key={l.label} onClick={() => navigate(l.route)}
              style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "7px 8px",
                borderRadius: 6, cursor: "pointer", marginBottom: 4,
                border: "1px solid #f1f5f9", background: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
              <div style={{ width: 24, height: 24, borderRadius: 5, background: l.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={11} color={l.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{l.label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: l.color, marginTop: 1 }}>{l.code}</div>
                <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 1, lineHeight: 1.3 }}>{l.desc}</div>
              </div>
              <ExternalLink size={9} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          );
        })}
      </div>

      {/* Repeat count */}
      {imp.repeatCount >= 2 && (
        <div style={{ padding: "7px 10px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#991b1b" }}>
            🔁 Repeated ×{imp.repeatCount} in last 7 days
          </div>
          <div style={{ fontSize: 9.5, color: "#b91c1c", marginTop: 2 }}>Meets RCA threshold criteria</div>
        </div>
      )}

      {/* Linked actions from 1.5 */}
      {acts.length > 0 && (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 7, overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", background: "#f1f5f9", fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Actions from 1.5 ({acts.length})
          </div>
          {acts.map(a => (
            <div key={a.id} style={{ padding: "6px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 10, color: "#334155" }}>
              <div style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 9 }}>{a.id}</div>
              <div style={{ fontWeight: 500 }}>{a.title.slice(0, 50)}…</div>
              <div style={{ fontSize: 9, color: a.status === "Resolved" ? "#15803d" : "#d97706" }}>{a.status}</div>
            </div>
          ))}
        </div>
      )}

      {/* Full chain visual */}
      <div style={{ padding: "8px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#1d4ed8", marginBottom: 6, textTransform: "uppercase" }}>End-to-End Loop</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", fontSize: 9 }}>
          {["KPI","→","Abn.","→","Action","→","RCA","→","CAPA","→","SOP","→","KPI"].map((n, i) => (
            <span key={i} style={{ color: n === "→" ? "#60a5fa" : "#1e40af", fontWeight: n === "→" ? 400 : 700 }}>{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── PLAN Stage: RCA ──────────────────────────────────────────────────────────
const PlanStage: React.FC<{ imp: ImprovementCase; onUpdate: (u: Partial<ImprovementCase>) => void }> = ({ imp, onUpdate }) => {
  const [mode, setMode] = useState<RCAMethod>(imp.rcaMethod);
  const [whys, setWhys] = useState(imp.whys);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ W1: true });

  const addWhy = () => {
    const newId = `W${whys.length + 1}`;
    setWhys(w => [...w, { id: newId, question: `Why ${whys.length + 1}: ?`, answer: "" }]);
    setExpanded(e => ({ ...e, [newId]: true }));
  };

  const rcColor = PDCA_COLOR["PLAN"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Problem Statement */}
      <div style={{ border: "1px solid #fde68a", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "7px 14px", background: "#fefce8", fontSize: 10, fontWeight: 700, color: "#a16207", textTransform: "uppercase" }}>
          Problem Statement
        </div>
        <div style={{ padding: "10px 14px", background: "#fff" }}>
          <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.6 }}>{imp.problemStatement}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, color: "#64748b" }}>
            <span>KPI: <strong style={{ color: "#dc2626" }}>{imp.sourceKpiName} = {imp.sourceKpiValue}{imp.sourceKpiUnit}</strong></span>
            <span>Target: <strong>{imp.sourceKpiTarget}{imp.sourceKpiUnit}</strong></span>
            <span>Repeat: <strong style={{ color: "#dc2626" }}>×{imp.repeatCount}</strong></span>
          </div>
        </div>
      </div>

      {/* RCA Method toggle */}
      <div style={{ display: "flex", gap: 1, background: "#f1f5f9", borderRadius: 6, padding: 3, alignSelf: "flex-start" }}>
        {(["5WHY", "FISHBONE"] as RCAMethod[]).map(m => (
          <button key={m} onClick={() => { setMode(m); onUpdate({ rcaMethod: m }); }}
            style={{ padding: "5px 16px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: mode === m ? 700 : 500,
              background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1d4ed8" : "#64748b",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {m === "5WHY" ? "5 Why" : "Fishbone"}
          </button>
        ))}
      </div>

      {/* 5 WHY */}
      {mode === "5WHY" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {whys.map((why, idx) => (
            <div key={why.id} style={{ border: `1px solid ${idx === whys.length - 1 && why.answer ? "#86efac" : "#e2e8f0"}`,
              borderRadius: 8, overflow: "hidden",
              background: idx === whys.length - 1 && why.answer ? "#f0fdf4" : "#fff" }}>
              <div style={{ padding: "8px 14px", background: idx === whys.length - 1 && why.answer ? "#dcfce7" : "#f8fafc",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                onClick={() => setExpanded(e => ({ ...e, [why.id]: !e[why.id] }))}>
                <div style={{ width: 22, height: 22, borderRadius: "50%",
                  background: why.answer ? rcColor.color : "#e2e8f0",
                  color: why.answer ? "#fff" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{why.question}</span>
                {why.answer && <span style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>✓ Answered</span>}
                {expanded[why.id] ? <ChevronUp size={13} color="#94a3b8" /> : <ChevronDown size={13} color="#94a3b8" />}
              </div>
              {expanded[why.id] && (
                <div style={{ padding: "10px 14px" }}>
                  {why.answer ? (
                    <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5, padding: "8px 10px",
                      background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0" }}>
                      {why.answer}
                    </div>
                  ) : (
                    <textarea placeholder="Enter answer…" rows={2}
                      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 5,
                        fontSize: 11, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
          {whys.length < 7 && !imp.rcaFinalized && (
            <button onClick={addWhy}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#f8fafc",
                border: "1px dashed #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
              <Plus size={11} /> Add next Why
            </button>
          )}
        </div>
      )}

      {/* FISHBONE */}
      {mode === "FISHBONE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {imp.fishbone.map(bone => (
            <div key={bone.category} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "7px 14px", background: "#f1f5f9",
                fontSize: 11, fontWeight: 700, color: "#334155" }}>
                📎 {bone.category}
              </div>
              <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                {bone.causes.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11, color: "#475569" }}>
                    <span style={{ color: "#94a3b8", flexShrink: 0, marginTop: 1 }}>•</span>
                    <span>{c}</span>
                  </div>
                ))}
                {!imp.rcaFinalized && (
                  <input placeholder="Add cause…"
                    style={{ padding: "4px 8px", border: "1px dashed #d1d5db", borderRadius: 4, fontSize: 10, outline: "none", color: "#64748b" }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Root Cause Panel */}
      {imp.rootCause && (
        <div style={{ border: "2px solid #1d4ed8", borderRadius: 9, overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", background: "#1d4ed8", display: "flex", gap: 8, alignItems: "center" }}>
            <Zap size={13} color="#fff" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Root Cause {imp.rcaFinalized ? "— Finalized" : "— Draft"}</span>
            <span style={{ marginLeft: "auto", fontSize: 10, background: "rgba(255,255,255,0.2)", color: "#fff",
              padding: "1px 8px", borderRadius: 10 }}>
              Confidence: {imp.rootCause.confidence}
            </span>
          </div>
          <div style={{ padding: "12px 14px", background: "#f8fafc" }}>
            <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 600, lineHeight: 1.6, marginBottom: 8 }}>
              {imp.rootCause.description}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 10, color: "#64748b" }}>
              <span>Category: <strong style={{ color: "#334155" }}>{imp.rootCause.category}</strong></span>
            </div>
            <div style={{ marginTop: 8, padding: "7px 10px", background: "#fffbeb", borderRadius: 5, border: "1px solid #fde68a", fontSize: 10, color: "#78350f" }}>
              <strong>Validation Basis:</strong> {imp.rootCause.validationBasis}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!imp.rcaFinalized && (
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#64748b" }}>
            Save Draft
          </button>
          <button style={{ padding: "7px 18px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            Finalize RCA → Proceed to CAPA
          </button>
        </div>
      )}
    </div>
  );
};

// ─── DO Stage: CAPA ───────────────────────────────────────────────────────────
const DoStage: React.FC<{ imp: ImprovementCase }> = ({ imp }) => {
  const [selectedCapa, setSelectedCapa] = useState<CAPA | null>(null);
  const completed = imp.capas.filter(c => c.status === "Completed" || c.status === "Verified").length;
  const total = imp.capas.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Root cause summary (read-only) */}
      {imp.rootCause && (
        <div style={{ padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1e40af", marginBottom: 4, textTransform: "uppercase" }}>Root Cause (from PLAN stage)</div>
          <div style={{ fontSize: 11, color: "#1e3a8a", lineHeight: 1.5 }}>{imp.rootCause.description}</div>
          <div style={{ fontSize: 10, color: "#3b82f6", marginTop: 4 }}>Category: {imp.rootCause.category} · Confidence: {imp.rootCause.confidence}</div>
        </div>
      )}

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%`, height: "100%", background: "#22c55e", borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>{completed}/{total} CAPA completed</span>
      </div>

      {/* CAPA table */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "7px 14px", background: "#f1f5f9", display: "grid",
          gridTemplateColumns: "1.5fr 80px 1fr 100px 100px",
          fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", gap: 12 }}>
          <div>CAPA</div><div>Type</div><div>Owner</div><div>Due</div><div>Status</div>
        </div>
        {imp.capas.map((capa, i) => {
          const sc = CAPA_STATUS_COLOR[capa.status];
          const isLast = i === imp.capas.length - 1;
          return (
            <div key={capa.id} onClick={() => setSelectedCapa(capa === selectedCapa ? null : capa)}
              style={{ padding: "10px 14px", display: "grid",
                gridTemplateColumns: "1.5fr 80px 1fr 100px 100px",
                gap: 12, alignItems: "center",
                borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                background: selectedCapa?.id === capa.id ? "#f0f9ff" : "#fff",
                cursor: "pointer" }}
              onMouseEnter={e => { if (selectedCapa?.id !== capa.id) e.currentTarget.style.background = "#fafafa"; }}
              onMouseLeave={e => { if (selectedCapa?.id !== capa.id) e.currentTarget.style.background = "#fff"; }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{capa.title}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{capa.id}</div>
              </div>
              <div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8,
                  background: capa.type === "Corrective" ? "#fef2f2" : "#eff6ff",
                  color: capa.type === "Corrective" ? "#dc2626" : "#1d4ed8" }}>
                  {capa.type === "Corrective" ? "C" : "P"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#334155" }}>{capa.ownerPosition}</div>
                <div style={{ fontSize: 9, color: capa.ownerPerson === "Not Resolved" ? "#dc2626" : "#94a3b8" }}>{capa.ownerPerson}</div>
              </div>
              <div style={{ fontSize: 10, color: "#64748b", display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={9} color="#94a3b8" />{capa.dueDate.slice(5)}
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: sc.bg, color: sc.color }}>
                  {capa.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CAPA Detail Drawer (inline) */}
      {selectedCapa && (
        <div style={{ border: "1px solid #93c5fd", borderRadius: 9, background: "#f8faff", overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", background: "#1d4ed8", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", flex: 1 }}>{selectedCapa.title}</span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 8,
              background: selectedCapa.type === "Corrective" ? "rgba(220,38,38,0.3)" : "rgba(59,130,246,0.3)",
              color: "#fff" }}>{selectedCapa.type}</span>
            <button onClick={() => setSelectedCapa(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#93c5fd" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.5 }}>{selectedCapa.description}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Owner", value: `${selectedCapa.ownerPosition} → ${selectedCapa.ownerPerson}` },
                { label: "Due Date", value: selectedCapa.dueDate },
              ].map(f => (
                <div key={f.label} style={{ padding: "7px 10px", background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "7px 10px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6 }}>
              <div style={{ fontSize: 9, color: "#15803d", textTransform: "uppercase", fontWeight: 700 }}>Expected Outcome</div>
              <div style={{ fontSize: 11, color: "#166534", marginTop: 2 }}>{selectedCapa.expectedOutcome}</div>
            </div>

            {selectedCapa.comments && (
              <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>💬 {selectedCapa.comments}</div>
            )}

            {selectedCapa.evidence.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selectedCapa.evidence.map(e => (
                  <div key={e} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5 }}>
                    <Paperclip size={9} color="#94a3b8" />
                    <span style={{ fontSize: 10, color: "#1d4ed8" }}>{e}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b" }}>Update Status:</div>
              {(["Open", "In Progress", "Completed", "Verified"] as const).map(s => {
                const sc = CAPA_STATUS_COLOR[s];
                return (
                  <button key={s} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 5, border: `1px solid ${s === selectedCapa.status ? sc.color : "#e2e8f0"}`,
                    background: s === selectedCapa.status ? sc.bg : "#fff", color: sc.color, cursor: "pointer" }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add CAPA */}
      <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
        background: "#fff", border: "1px dashed #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 11, color: "#64748b", alignSelf: "flex-start" }}>
        <Plus size={11} /> Add CAPA
      </button>

      {/* Move to CHECK */}
      {completed === total && total > 0 && (
        <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={14} color="#22c55e" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#15803d", flex: 1 }}>All CAPAs completed — ready for validation</span>
          <button style={{ padding: "6px 16px", background: "#15803d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            Proceed to CHECK →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── CHECK Stage: Validation ──────────────────────────────────────────────────
const CheckStage: React.FC<{ imp: ImprovementCase; onUpdate: (u: Partial<ImprovementCase>) => void }> = ({ imp, onUpdate }) => {
  const [decision, setDecision] = useState<typeof imp.validationResult>(imp.validationResult);
  const ucl = 100; const lcl = 95; const target = 98;

  const tooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 12px", fontSize: 11 }}>
        <div style={{ fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{label}</div>
        {payload.map((p: any) => p.value !== null && (
          <div key={p.dataKey} style={{ color: p.dataKey === "before" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
            {p.dataKey === "before" ? "Before CAPA" : "After CAPA"}: {p.value} {imp.sourceKpiUnit}
          </div>
        ))}
      </div>
    );
  };

  const options: { v: typeof imp.validationResult; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
    { v: "Effective",     label: "Effective",      color: "#15803d", bg: "#f0fdf4",   icon: <CheckCircle2 size={16} color="#22c55e" /> },
    { v: "Partial",       label: "Partial",         color: "#d97706", bg: "#fffbeb",   icon: <Eye size={16} color="#f59e0b" /> },
    { v: "Not Effective", label: "Not Effective",   color: "#dc2626", bg: "#fef2f2",   icon: <AlertTriangle size={16} color="#ef4444" /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* KPI Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Before CAPA",    value: imp.kpiBeforeValue, unit: imp.sourceKpiUnit, color: "#dc2626", bg: "#fef2f2" },
          { label: "After CAPA",     value: imp.kpiAfterValue || "—",   unit: imp.kpiAfterValue ? imp.sourceKpiUnit : "",   color: imp.kpiAfterValue ? "#15803d" : "#94a3b8", bg: imp.kpiAfterValue ? "#f0fdf4" : "#f8fafc" },
          { label: "Target",         value: imp.sourceKpiTarget, unit: imp.sourceKpiUnit, color: "#1d4ed8", bg: "#eff6ff" },
        ].map(s => (
          <div key={s.label} style={{ padding: "12px 14px", background: s.bg, borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: 13, fontWeight: 500 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Chart — same visual pattern as 1.5 */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#fafafa", padding: "12px 8px 6px 0" }}>
        <div style={{ paddingLeft: 16, marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#334155" }}>
          {imp.sourceKpiName} — Before vs After CAPA · Validation Chart
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={validationChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 8.5, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval="preserveStartEnd" />
            <YAxis domain={[90, 102]} tick={{ fontSize: 8.5, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={30} />
            <Tooltip content={tooltip} />
            <ReferenceArea y1={lcl} y2={90} fill="#fee2e2" fillOpacity={0.4} ifOverflow="hidden" />
            <ReferenceLine y={ucl}    stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={1} label={{ value: "UCL 100", position: "insideTopRight", fontSize: 8, fill: "#94a3b8" }} />
            <ReferenceLine y={lcl}    stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "LCL 95", position: "insideBottomRight", fontSize: 8, fill: "#dc2626" }} />
            <ReferenceLine y={target} stroke="#16a34a" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: "Target 98", position: "insideTopLeft", fontSize: 8, fill: "#15803d" }} />
            <ReferenceLine x="Intervention" stroke="#7c3aed" strokeDasharray="3 2" strokeWidth={1.5} label={{ value: "CAPA", position: "top", fontSize: 8, fill: "#7c3aed" }} />
            <Line type="monotone" dataKey="before" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} connectNulls={false} name="Before CAPA" />
            <Line type="monotone" dataKey="after"  stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} connectNulls={false} name="After CAPA" />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, paddingLeft: 16, paddingBottom: 6 }}>
          {[{ color: "#ef4444", label: "Before CAPA" }, { color: "#22c55e", label: "After CAPA" },
            { color: "#7c3aed", label: "CAPA Executed" }].map(l => (
            <div key={l.label} style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 10, color: "#64748b" }}>
              <svg width={16} height={6}><line x1={0} y1={3} x2={16} y2={3} stroke={l.color} strokeWidth={2} /></svg>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Validation notes */}
      {imp.validationNotes && (
        <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 11, color: "#166534", lineHeight: 1.5 }}>
          📋 {imp.validationNotes}
        </div>
      )}

      {/* Decision */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Validation Decision</div>
        <div style={{ display: "flex", gap: 8 }}>
          {options.map(opt => (
            <button key={opt.v} onClick={() => setDecision(opt.v)}
              style={{ flex: 1, padding: "12px 10px", border: `2px solid ${decision === opt.v ? opt.color : "#e2e8f0"}`,
                borderRadius: 8, cursor: "pointer", background: decision === opt.v ? opt.bg : "#fff",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              {opt.icon}
              <span style={{ fontSize: 11, fontWeight: decision === opt.v ? 700 : 500, color: decision === opt.v ? opt.color : "#64748b" }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
        {decision === "Not Effective" && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>CAPA was not effective — action required</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                🔁 Reopen RCA
              </button>
              <button style={{ padding: "6px 14px", background: "#fff", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                + Create New CAPA
              </button>
            </div>
          </div>
        )}
        {(decision === "Effective" || decision === "Partial") && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button style={{ padding: "7px 20px", background: "#15803d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
              Confirm & Proceed to ACT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ACT Stage: Standardization ──────────────────────────────────────────────
const ActStage: React.FC<{ imp: ImprovementCase }> = ({ imp }) => {
  const navigate = useNavigate();
  const [stdItems, setStdItems] = useState(imp.standardizationItems);
  const [yokoten, setYokoten]   = useState(imp.yokotenItems);

  const approveAll = () => {
    setStdItems(items => items.map(i => ({ ...i, status: "Approved" as const })));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Validation result banner */}
      <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <CheckCircle2 size={16} color="#22c55e" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>Validation: {imp.validationResult}</div>
          <div style={{ fontSize: 10, color: "#166534" }}>
            KPI recovered: {imp.kpiBeforeValue}% → {imp.kpiAfterValue}% · {imp.validationNotes.slice(0, 80)}
          </div>
        </div>
      </div>

      {/* Impact summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "KPI Recovery",   value: `+${(parseFloat(imp.kpiAfterValue) - parseFloat(imp.kpiBeforeValue)).toFixed(1)} pp`, color: "#15803d" },
          { label: "CAPAs Executed", value: `${imp.capas.filter(c => c.status === "Completed").length}/${imp.capas.length}`, color: "#1d4ed8" },
          { label: "SOP/Measure Updates", value: `${imp.standardizationItems.length}`, color: "#7e22ce" },
        ].map(s => (
          <div key={s.label} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 7, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Standardization items */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>Suggested Standard Updates</div>
          <button onClick={approveAll}
            style={{ marginLeft: "auto", fontSize: 10, padding: "4px 12px", background: "#15803d", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
            Approve All
          </button>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1.5fr 100px 120px",
            padding: "7px 14px", background: "#f1f5f9", gap: 12,
            fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            <div>Type</div><div>Target</div><div>Change</div><div>Status</div><div>Action</div>
          </div>
          {stdItems.map((item, i) => {
            const sc = STD_STATUS_COLOR[item.status];
            const isLast = i === stdItems.length - 1;
            return (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1.5fr 100px 120px",
                padding: "10px 14px", gap: 12, alignItems: "center",
                borderBottom: isLast ? "none" : "1px solid #f1f5f9", background: "#fff" }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                    background: item.type === "SOP" ? "#f5f3ff" : "#eff6ff",
                    color: item.type === "SOP" ? "#7c3aed" : "#1d4ed8" }}>
                    {item.type}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{item.target}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{item.targetName.slice(0, 35)}</div>
                </div>
                <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>{item.change.slice(0, 70)}</div>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: sc.bg, color: sc.color }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {item.status === "Pending" && (
                    <>
                      <button onClick={() => setStdItems(s => s.map(it => it.id === item.id ? { ...it, status: "Approved" } : it))}
                        style={{ fontSize: 9, padding: "3px 8px", background: "#15803d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>✓ Approve</button>
                      <button onClick={() => setStdItems(s => s.map(it => it.id === item.id ? { ...it, status: "Rejected" } : it))}
                        style={{ fontSize: 9, padding: "3px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 4, cursor: "pointer" }}>✕</button>
                    </>
                  )}
                  {item.status === "Approved" && (
                    <button onClick={() => navigate(item.route)}
                      style={{ fontSize: 9, padding: "3px 10px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                      <ExternalLink size={8} /> Send to {item.type === "SOP" ? "1.4" : "1.3"}
                    </button>
                  )}
                  {item.status === "Applied" && (
                    <span style={{ fontSize: 9, color: "#15803d", fontWeight: 700 }}>✓ Applied</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yokoten */}
      {imp.yokotenItems.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
            <Globe size={13} color="#7e22ce" /> Yokoten — Knowledge Sharing
          </div>
          <div style={{ border: "1px solid #e9d5ff", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 90px 130px",
              padding: "7px 14px", background: "#fdf4ff", gap: 12,
              fontSize: 10, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase" }}>
              <div>Context</div><div>Recommendation</div><div>Status</div><div>Action</div>
            </div>
            {yokoten.map((y, i) => {
              const isLast = i === yokoten.length - 1;
              const sc = y.status === "Accepted" ? "#15803d" : y.status === "Rejected" ? "#dc2626" : y.status === "Implemented" ? "#1d4ed8" : "#d97706";
              return (
                <div key={y.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 90px 130px",
                  padding: "10px 14px", gap: 12, alignItems: "center",
                  borderBottom: isLast ? "none" : "1px solid #f3e8ff", background: "#fff" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#7e22ce" }}>{y.context}</div>
                  <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>{y.recommendation}</div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8,
                      background: y.status === "Pending" ? "#fffbeb" : y.status === "Accepted" ? "#f0fdf4" : y.status === "Rejected" ? "#fef2f2" : "#eff6ff",
                      color: sc }}>
                      {y.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {y.status === "Pending" && (
                      <>
                        <button onClick={() => setYokoten(ys => ys.map(yk => yk.id === y.id ? { ...yk, status: "Accepted" } : yk))}
                          style={{ fontSize: 9, padding: "3px 7px", background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac", borderRadius: 4, cursor: "pointer" }}>Accept</button>
                        <button onClick={() => setYokoten(ys => ys.map(yk => yk.id === y.id ? { ...yk, status: "Rejected" } : yk))}
                          style={{ fontSize: 9, padding: "3px 7px", background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 4, cursor: "pointer" }}>Reject</button>
                      </>
                    )}
                    {y.status === "Accepted" && (
                      <button style={{ fontSize: 9, padding: "3px 7px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: 4, cursor: "pointer" }}>Track</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Close case */}
      {stdItems.every(i => i.status === "Approved" || i.status === "Applied") && (
        <div style={{ padding: "12px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={16} color="#22c55e" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#15803d", flex: 1 }}>
            All standardization items approved — ready to close
          </span>
          <button style={{ padding: "7px 20px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
            ✓ Close Improvement Case
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Timeline Panel ───────────────────────────────────────────────────────────
const TimelinePanel: React.FC<{ events: ImpTimelineEvent[] }> = ({ events }) => {
  const stageColor = (s: string) => {
    const m: Record<string, string> = { ENTRY: "#94a3b8", PLAN: "#a16207", DO: "#1d4ed8", CHECK: "#15803d", ACT: "#7e22ce", CLOSED: "#475569" };
    return m[s] ?? "#94a3b8";
  };
  return (
    <div style={{ padding: "12px 18px", borderTop: "1px solid #e2e8f0", background: "#fafafa", flexShrink: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
        Case Timeline
      </div>
      <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", minWidth: 160, maxWidth: 200, flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: stageColor(ev.stage), border: "2px solid #fff", boxShadow: `0 0 0 2px ${stageColor(ev.stage)}40`, flexShrink: 0 }} />
              {i < events.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 24, background: "#e2e8f0", marginTop: 4 }} />}
            </div>
            <div style={{ paddingBottom: 12 }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "#94a3b8" }}>{ev.at.split(" · ")[1] ?? ev.at.slice(0, 10)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: stageColor(ev.stage), marginTop: 1 }}>{ev.stage}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", marginTop: 1, lineHeight: 1.3 }}>{ev.actor}</div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.3 }}>{ev.event.slice(0, 55)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Case Workspace (full overlay) ───────────────────────────────────────────
const CaseWorkspace: React.FC<{ imp: ImprovementCase; onClose: () => void }> = ({ imp: initialImp, onClose }) => {
  const navigate = useNavigate();
  const [imp, setImp] = useState(initialImp);
  const handleUpdate = (u: Partial<ImprovementCase>) => setImp(prev => ({ ...prev, ...u }));

  const stageColor = PDCA_COLOR[imp.pdcaStage];
  const prioColor  = IMP_PRIORITY_COLOR[imp.priority];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #e2e8f0", background: "#0f172a", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ flex: 1 }}>
            {/* Case ID + badges */}
            <div style={{ display: "flex", gap: 7, marginBottom: 5, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#60a5fa" }}>{imp.id}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 8,
                background: stageColor.bg, color: stageColor.color, border: `1px solid ${stageColor.border}` }}>
                {imp.pdcaStage}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 8, background: prioColor.bg, color: prioColor.color }}>
                {imp.priority}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                {imp.status}
              </span>
              {imp.repeatCount >= 2 && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: "#fef2f2", color: "#dc2626" }}>
                  🔁 ×{imp.repeatCount}
                </span>
              )}
            </div>
            {/* Title */}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{imp.title}</div>
            {/* Context row */}
            <div style={{ display: "flex", gap: 14, fontSize: 10, color: "#64748b", flexWrap: "wrap" }}>
              <span>{imp.context.site} · {imp.context.line} · {imp.context.department}</span>
              <span>KPI: <strong style={{ color: "#60a5fa" }}>{imp.sourceKpiName}</strong></span>
              <span>Owner: <strong style={{ color: "#94a3b8" }}>{imp.ownerPerson}</strong></span>
              <span>Updated: {imp.updatedAt}</span>
            </div>
          </div>
          {/* PDCA Stepper */}
          <div style={{ flexShrink: 0 }}>
            <PdcaStageBar current={imp.pdcaStage} />
          </div>
          {/* Header actions */}
          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
            <button onClick={() => navigate("/boards")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "rgba(255,255,255,0.1)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, cursor: "pointer", fontSize: 10 }}>
              <AlertTriangle size={10} /> Source Abn. ↗
            </button>
            <button onClick={onClose}
              style={{ padding: "5px 9px", background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body: Left Work + Right Trace ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: Stage Work Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor.dot }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: stageColor.color }}>
              {imp.pdcaStage === "PLAN" ? "Root Cause Analysis" :
               imp.pdcaStage === "DO"   ? "CAPA Execution" :
               imp.pdcaStage === "CHECK"? "Effectiveness Validation" :
               imp.pdcaStage === "ACT"  ? "Standardization & Yokoten" : "Case Summary"}
            </span>
          </div>

          {imp.pdcaStage === "PLAN"   && <PlanStage  imp={imp} onUpdate={handleUpdate} />}
          {imp.pdcaStage === "DO"     && <DoStage    imp={imp} />}
          {imp.pdcaStage === "CHECK"  && <CheckStage imp={imp} onUpdate={handleUpdate} />}
          {imp.pdcaStage === "ACT"    && <ActStage   imp={imp} />}
          {imp.pdcaStage === "CLOSED" && (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <CheckCircle2 size={40} color="#22c55e" style={{ margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "#15803d" }}>Case Closed</div>
            </div>
          )}
        </div>

        {/* Right: Traceability (always visible) */}
        <div style={{ width: 260, flexShrink: 0, borderLeft: "1px solid #e2e8f0", overflowY: "auto", padding: "16px 14px", background: "#fafafa" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12 }}>
            Traceability Panel
          </div>
          <TraceabilityPanel imp={imp} />
        </div>
      </div>

      {/* ── Timeline ── */}
      <TimelinePanel events={imp.timeline} />
    </div>
  );
};

// ─── Main ImprovementScreen (Case List) ──────────────────────────────────────
export const ImprovementScreen: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [filterPrio, setFilterPrio]   = useState("All");
  const [selectedCase, setSelectedCase] = useState<ImprovementCase | null>(null);

  // Accept an initial case ID from navigation state (from AbnormalityDispositionModal RCA trigger)
  const openCount     = improvementCases.filter(c => c.pdcaStage !== "CLOSED").length;
  const pendingValidation = improvementCases.filter(c => c.pdcaStage === "CHECK").length;
  const pendingStd    = improvementCases.filter(c => c.pdcaStage === "ACT").length;

  const filtered = improvementCases.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.title.toLowerCase().includes(q) || c.sourceKpiName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    return matchQ
      && (filterStage === "All" || c.pdcaStage === filterStage)
      && (filterPrio  === "All" || c.priority  === filterPrio);
  });

  const stageOrder: PDCAStage[] = ["PLAN", "DO", "CHECK", "ACT", "CLOSED"];

  return (
    <div className="screen-shell" style={{ background: "#f8fafc" }}>

      {/* Alert strip — pending items */}
      {(pendingValidation > 0 || pendingStd > 0) && (
        <div style={{ padding: "6px 18px", background: "#fffbeb", borderBottom: "1px solid #fde68a", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
            {pendingValidation > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#d97706", fontWeight: 600 }}>
                <Eye size={11} /> {pendingValidation} case{pendingValidation !== 1 ? "s" : ""} awaiting validation
              </span>
            )}
            {pendingStd > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#7e22ce", fontWeight: 600 }}>
                <BookOpen size={11} /> {pendingStd} case{pendingStd !== 1 ? "s" : ""} pending standardization
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 8, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0, flexWrap: "wrap" }}>
        {stageOrder.map(s => {
          const count = improvementCases.filter(c => c.pdcaStage === s).length;
          if (count === 0) return null;
          const c = PDCA_COLOR[s];
          return (
            <div key={s} onClick={() => setFilterStage(filterStage === s ? "All" : s)}
              style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${filterStage === s ? c.color : c.border}`,
                background: filterStage === s ? c.bg : "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{s}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{count}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>
            Cases created only from 1.5 Abnormality → Disposition → Escalate to RCA
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ flexShrink: 0 }}>
        <div className="filter-input" style={{ maxWidth: 280 }}>
          <Search size={13} color="#94a3b8" />
          <input placeholder="Search cases, KPIs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          {["All", "PLAN", "DO", "CHECK", "ACT", "CLOSED"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterPrio} onChange={e => setFilterPrio(e.target.value)}>
          {["All", "Critical", "High", "Medium", "Low"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="fb-count">{filtered.length} of {improvementCases.length} cases</span>
      </div>

      {/* Case Table */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "90px 2fr 100px 130px 90px 110px 90px 110px",
            padding: "7px 14px", background: "#f1f5f9", gap: 12,
            fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            <div>Case ID</div>
            <div>Title</div>
            <div>KPI</div>
            <div style={{ textAlign: "center" }}>PDCA Stage</div>
            <div style={{ textAlign: "center" }}>Priority</div>
            <div>Owner</div>
            <div>Source Abn.</div>
            <div>Updated</div>
          </div>

          {filtered.map((c, i) => {
            const sc = PDCA_COLOR[c.pdcaStage];
            const pc = IMP_PRIORITY_COLOR[c.priority];
            const isLast = i === filtered.length - 1;
            return (
              <div key={c.id} onClick={() => setSelectedCase(c)}
                style={{ display: "grid", gridTemplateColumns: "90px 2fr 100px 130px 90px 110px 90px 110px",
                  padding: "11px 14px", gap: 12, alignItems: "center",
                  borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                  cursor: "pointer", background: "#fff", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#1d4ed8" }}>{c.id}</div>
                  {c.repeatCount >= 2 && (
                    <span style={{ fontSize: 8, fontWeight: 700, background: "#fef2f2", color: "#dc2626", padding: "1px 5px", borderRadius: 4 }}>
                      🔁 ×{c.repeatCount}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{c.context.line} · {c.context.department} · {c.sourceAbnormalityId}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{c.sourceKpiName}</div>
                  <div style={{ fontSize: 9, color: "#dc2626", fontWeight: 600 }}>{c.sourceKpiValue}{c.sourceKpiUnit}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {c.pdcaStage}
                  </span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: pc.bg, color: pc.color }}>
                    {c.priority}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#334155" }}>{c.ownerPerson}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{c.ownerPosition}</div>
                </div>
                <div style={{ fontSize: 10, color: "#1d4ed8", fontFamily: "monospace", fontWeight: 600 }}>{c.sourceAbnormalityId}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{c.updatedAt.split(" · ")[1] ?? c.updatedAt.slice(0, 10)}</div>
              </div>
            );
          })}
        </div>

        {/* Entry constraint notice */}
        <div style={{ marginTop: 14, padding: "10px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Zap size={14} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af" }}>Entry Constraint — TQM Compliance</div>
            <div style={{ fontSize: 10, color: "#1e3a8a", marginTop: 2, lineHeight: 1.5 }}>
              Improvement Cases are created <strong>only</strong> from abnormality disposition "Escalate to RCA" (Module 1.5).
              No standalone creation allowed. This ensures every case has a real execution trigger and ≥2 repeat occurrences or critical severity.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
              <button onClick={() => navigate("/boards")}
                style={{ fontSize: 10, padding: "4px 12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
                → Go to 1.5 Boards
              </button>
              <button onClick={() => navigate("/actions")}
                style={{ fontSize: 10, padding: "4px 12px", background: "#fff", border: "1px solid #93c5fd", color: "#1d4ed8", borderRadius: 5, cursor: "pointer", fontWeight: 600 }}>
                → Go to Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Case Workspace overlay */}
      {selectedCase && (
        <CaseWorkspace imp={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
};
