import React, { useState, useEffect } from "react";
import {
  AlertTriangle, Wrench, TrendingUp, TrendingDown, Minus, ExternalLink,
  RefreshCw, Plus, X, ChevronRight, BookOpen, ChartBar,
  Building2, CheckCircle2, Clock, ArrowUpRight, Shield,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  ComposedChart, Line, ReferenceLine, ReferenceArea,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  t1KpiCells, t2BoardRows, t3BoardRows, abnormalities, executionActions,
  KPI_STATUS_COLOR, ACTION_STATUS_COLOR, ACTION_PRIORITY_COLOR, AB_SEVERITY_COLOR, TIER_COLOR,
  KpiCell, Tier, KpiStatus, Abnormality,
  CONTROL_CHART_DATA, ControlChartConfig, ControlChartPoint,
} from "../../../../data/executionData";
import {
  AbnormalityDispositionModal, DispositionBadge, RepeatFlagChip,
} from "./AbnormalityDispositionModal";

// ─── Status dot / icon ────────────────────────────────────────────────────────
const StatusDot: React.FC<{ status: KpiStatus; size?: number }> = ({ status, size = 8 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: KPI_STATUS_COLOR[status].dot, flexShrink: 0 }} />
);

const TrendIcon: React.FC<{ trend: "up" | "down" | "flat"; size?: number }> = ({ trend, size = 11 }) =>
  trend === "up"   ? <TrendingUp  size={size} color="#ef4444" /> :
  trend === "down" ? <TrendingDown size={size} color="#22c55e" /> :
  <Minus size={size} color="#94a3b8" />;

// ─── SPC helpers ──────────────────────────────────────────────────────────────
const getPointColor = (v: number | null, cfg: ControlChartConfig): string => {
  if (v === null) return "#94a3b8";
  if (v > cfg.ucl || v < cfg.lcl) return "#ef4444";
  if (cfg.higherIsBetter && cfg.warnLow !== undefined && v < cfg.warnLow) return "#f59e0b";
  if (!cfg.higherIsBetter && cfg.warnHigh !== undefined && v > cfg.warnHigh) return "#f59e0b";
  return "#22c55e";
};

const SPCDot = (cfg: ControlChartConfig) => (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const fill = getPointColor(payload.value, cfg);
  const hasAnnotation = !!payload.annotation;
  return (
    <g>
      <circle cx={cx} cy={cy} r={hasAnnotation ? 5 : 3} fill={fill} stroke="#fff" strokeWidth={1.5} />
      {hasAnnotation && <circle cx={cx} cy={cy} r={7} fill="none" stroke={fill} strokeWidth={1} strokeDasharray="2 1" />}
    </g>
  );
};

const SPCTooltip = (cfg: ControlChartConfig) => ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v: number | null = payload[0]?.payload?.value ?? null;
  const annotation: string | undefined = payload[0]?.payload?.annotation;
  const color = getPointColor(v, cfg);
  const isOut  = v !== null && (v > cfg.ucl || v < cfg.lcl);
  const isWarn = !isOut && v !== null && (
    (cfg.higherIsBetter  && cfg.warnLow  !== undefined && v < cfg.warnLow) ||
    (!cfg.higherIsBetter && cfg.warnHigh !== undefined && v > cfg.warnHigh)
  );
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 11, minWidth: 140 }}>
      <div style={{ fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{label}</div>
      {v === null ? (
        <div style={{ color: "#94a3b8", fontWeight: 600 }}>⚠ Signal Missing</div>
      ) : (
        <>
          <div style={{ fontSize: 16, fontWeight: 800, color, marginBottom: 2 }}>
            {v} <span style={{ fontSize: 11, fontWeight: 400 }}>{cfg.unit}</span>
          </div>
          <div style={{ color: "#64748b" }}>Target: {cfg.target} {cfg.unit}</div>
          {isOut  && <div style={{ color: "#dc2626", fontWeight: 700, marginTop: 3 }}>⛔ Out of Control</div>}
          {isWarn && <div style={{ color: "#d97706", fontWeight: 700, marginTop: 3 }}>⚠ Warning Zone</div>}
        </>
      )}
      {annotation && (
        <div style={{ marginTop: 5, paddingTop: 5, borderTop: "1px solid #f1f5f9", color: "#1d4ed8", fontWeight: 600 }}>
          📌 {annotation}
        </div>
      )}
    </div>
  );
};

// ─── Control Chart Tab ────────────────────────────────────────────────────────
const ControlChartTab: React.FC<{ kpi: KpiCell }> = ({ kpi }) => {
  const cfg = CONTROL_CHART_DATA[kpi.id];
  if (!cfg) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "#94a3b8" }}>
        <ChartBar size={30} color="#cbd5e1" style={{ margin: "0 auto 10px", display: "block" }} />
        <div style={{ fontSize: 12, fontWeight: 600 }}>No signal history available</div>
      </div>
    );
  }
  const { ucl, lcl, target, warnHigh, warnLow, yMin, yMax, unit, higherIsBetter, points } = cfg;
  const validValues  = points.filter(p => p.value !== null).map(p => p.value as number);
  const latest       = validValues.at(-1) ?? null;
  const outOfControl = validValues.filter(v => v > ucl || v < lcl).length;
  const inWarning    = validValues.filter(v =>
    higherIsBetter ? (warnLow !== undefined && v < warnLow && v >= lcl)
                   : (warnHigh !== undefined && v > warnHigh && v <= ucl)
  ).length;
  const missingCount = points.filter(p => p.value === null).length;
  const DotComponent     = SPCDot(cfg);
  const TooltipComponent = SPCTooltip(cfg);
  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
        {[
          { label: "Latest",         value: latest !== null ? `${latest}` : "—", sub: unit,  color: latest !== null ? getPointColor(latest, cfg) : "#94a3b8" },
          { label: "Out of Control", value: String(outOfControl),                 sub: "pts", color: outOfControl > 0 ? "#dc2626" : "#15803d" },
          { label: "In Warning",     value: String(inWarning),                    sub: "pts", color: inWarning > 0    ? "#d97706" : "#15803d" },
          { label: "Missing",        value: String(missingCount),                 sub: "pts", color: missingCount > 0 ? "#94a3b8" : "#15803d" },
        ].map(s => (
          <div key={s.label} style={{ padding: "7px 6px", background: "#f8fafc", borderRadius: 6, border: "1px solid #f1f5f9", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{s.sub}</div>
            <div style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {outOfControl > 0 && (
        <div style={{ padding: "7px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <AlertTriangle size={12} color="#dc2626" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#991b1b" }}>
            {outOfControl} point{outOfControl !== 1 ? "s" : ""} outside control limits — abnormality conditions met
          </span>
        </div>
      )}
      <div style={{ background: "#fafafa", borderRadius: 8, border: "1px solid #e2e8f0", paddingTop: 10, paddingBottom: 4, paddingRight: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", paddingLeft: 14, marginBottom: 6, textTransform: "uppercase" }}>
          {kpi.name} — {kpi.line} · {kpi.shift} Shift · Today
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={points} margin={{ top: 8, right: 10, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#efefef" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 8.5, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval="preserveStartEnd" />
            <YAxis domain={[yMin, yMax]} tick={{ fontSize: 8.5, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={34} />
            <Tooltip content={<TooltipComponent />} />
            <ReferenceArea y1={ucl} y2={yMax} fill="#fee2e2" fillOpacity={0.55} ifOverflow="hidden" />
            <ReferenceArea y1={yMin} y2={lcl} fill="#fee2e2" fillOpacity={0.55} ifOverflow="hidden" />
            {!higherIsBetter && warnHigh !== undefined && <ReferenceArea y1={warnHigh} y2={ucl} fill="#fef9c3" fillOpacity={0.65} ifOverflow="hidden" />}
            {higherIsBetter  && warnLow  !== undefined && <ReferenceArea y1={lcl} y2={warnLow} fill="#fef9c3" fillOpacity={0.65} ifOverflow="hidden" />}
            <ReferenceLine y={ucl}    stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `UCL ${ucl}`, position: "insideTopRight", fontSize: 8.5, fill: "#dc2626", fontWeight: 700 }} />
            <ReferenceLine y={lcl}    stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `LCL ${lcl}`, position: "insideBottomRight", fontSize: 8.5, fill: "#dc2626", fontWeight: 700 }} />
            {warnHigh !== undefined && <ReferenceLine y={warnHigh} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} label={{ value: `Warn ↑ ${warnHigh}`, position: "insideTopRight", fontSize: 8, fill: "#b45309", fontWeight: 600 }} />}
            {warnLow  !== undefined && <ReferenceLine y={warnLow}  stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} label={{ value: `Warn ↓ ${warnLow}`, position: "insideBottomRight", fontSize: 8, fill: "#b45309", fontWeight: 600 }} />}
            <ReferenceLine y={target} stroke="#16a34a" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: `Target ${target}`, position: "insideTopLeft", fontSize: 8.5, fill: "#15803d", fontWeight: 700 }} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={<DotComponent />} activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { type: "line",  color: "#16a34a", dash: "6 3", label: `Target (${target} ${unit})` },
          { type: "line",  color: "#ef4444", dash: "5 3", label: "UCL / LCL" },
          { type: "line",  color: "#f59e0b", dash: "3 3", label: "Warning limits" },
          { type: "area",  color: "#ef4444", bg: "#fee2e2", label: "Critical zone" },
          { type: "area",  color: "#f59e0b", bg: "#fef9c3", label: "Warning zone" },
          { type: "dot",   color: "#22c55e", label: "Normal" },
          { type: "dot",   color: "#f59e0b", label: "Warning" },
          { type: "dot",   color: "#ef4444", label: "Out of control" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: "#64748b" }}>
            {l.type === "line" && <svg width={18} height={8}><line x1={0} y1={4} x2={18} y2={4} stroke={l.color} strokeWidth={1.5} strokeDasharray={l.dash} /></svg>}
            {l.type === "area" && <div style={{ width: 12, height: 9, background: (l as any).bg, border: `1px solid ${l.color}`, borderRadius: 2 }} />}
            {l.type === "dot"  && <svg width={10} height={10}><circle cx={5} cy={5} r={4} fill={l.color} /></svg>}
            <span>{l.label}</span>
          </div>
        ))}
      </div>
      {points.some(p => p.annotation) && (
        <div style={{ background: "#eff6ff", borderRadius: 7, border: "1px solid #bfdbfe", padding: "8px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", marginBottom: 6, textTransform: "uppercase" }}>📌 Annotated Events</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {points.filter(p => p.annotation).map((p, i) => {
              const dotColor = getPointColor(p.value, cfg);
              return (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 10.5, color: "#334155", alignItems: "baseline" }}>
                  <span style={{ color: "#94a3b8", minWidth: 38, fontFamily: "monospace", fontSize: 10 }}>{p.time}</span>
                  <span style={{ fontWeight: 700, color: dotColor, minWidth: 52 }}>{p.value !== null ? `${p.value} ${unit}` : "—"}</span>
                  <span style={{ color: "#475569" }}>{p.annotation}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Abnormalities Tab (full disposition flow) ────────────────────────────────
const AbnormalitiesTab: React.FC<{ kpi: KpiCell }> = ({ kpi }) => {
  const kpiAbs = abnormalities.filter(a => a.kpiId === kpi.id);
  const [abState, setAbState] = useState<Record<string, Abnormality>>(
    Object.fromEntries(kpiAbs.map(a => [a.id, { ...a }]))
  );
  const [dispositionTarget, setDispositionTarget] = useState<Abnormality | null>(null);

  const handleDispositionSubmit = (ab: Abnormality, disp: any, just: string) => {
    setAbState(prev => ({
      ...prev,
      [ab.id]: { ...prev[ab.id], disposition: disp, justification: just, status: disp === "RCA" ? "Open" : "Resolved" },
    }));
    setDispositionTarget(null);
  };

  const abs = kpiAbs.map(a => abState[a.id] ?? a);
  const pendingClosure = abs.filter(a => a.status !== "Resolved" && a.disposition === null);

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Pending closure banner */}
      {pendingClosure.length > 0 && (
        <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <AlertTriangle size={12} color="#dc2626" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#991b1b", flex: 1 }}>
            {pendingClosure.length} abnormalit{pendingClosure.length !== 1 ? "ies" : "y"} pending disposition — closure required
          </span>
        </div>
      )}

      {abs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 12 }}>
          <CheckCircle2 size={28} color="#22c55e" style={{ display: "block", margin: "0 auto 8px" }} />
          No open abnormalities
        </div>
      ) : abs.map(ab => {
        const sc2 = AB_SEVERITY_COLOR[ab.severity];
        const isClosed = ab.disposition !== null;
        return (
          <div key={ab.id} style={{ border: `1px solid ${isClosed ? "#e2e8f0" : sc2.border}`, borderRadius: 8, overflow: "hidden", opacity: isClosed ? 0.75 : 1 }}>
            {/* Card header */}
            <div style={{ padding: "8px 12px", background: isClosed ? "#f8fafc" : sc2.bg, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <AlertTriangle size={12} color={isClosed ? "#94a3b8" : sc2.color} />
              <span style={{ fontSize: 11, fontWeight: 700, color: isClosed ? "#64748b" : sc2.color }}>{ab.severity}</span>
              <span style={{ fontSize: 10, color: "#64748b" }}>{ab.type}</span>
              {ab.isRepeatFlag && <RepeatFlagChip count={ab.repeatCount} suggested={ab.suggestedForRCA} />}
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>Detected {ab.detectedAt}</span>
              {isClosed
                ? <DispositionBadge disposition={ab.disposition} />
                : <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 10,
                    background: ab.status === "Open" ? "#fef2f2" : "#fffbeb",
                    color: ab.status === "Open" ? "#dc2626" : "#d97706" }}>{ab.status}</span>
              }
            </div>

            {/* Card body */}
            <div style={{ padding: "9px 12px", background: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", marginBottom: 4 }}>{ab.type}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{ab.description}</div>

              {/* Repeat detection inline alert */}
              {ab.isRepeatFlag && !isClosed && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#fef2f2", borderRadius: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "#991b1b", lineHeight: 1.5 }}>
                    🔁 <strong>Repeated {ab.repeatCount}×</strong> in the last 7 days.
                    {ab.suggestedForRCA
                      ? " System recommends escalating to RCA."
                      : " Monitor for further occurrence before closing."}
                  </span>
                </div>
              )}

              {/* Justification (if already classified) */}
              {isClosed && ab.justification && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, fontSize: 10, color: "#166534" }}>
                  📝 <em>"{ab.justification}"</em>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                {!isClosed && ab.status === "Open" && (
                  <button style={{ fontSize: 10, padding: "4px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", color: "#334155" }}>
                    Acknowledge
                  </button>
                )}
                {!isClosed && (
                  <button style={{ fontSize: 10, padding: "4px 10px", background: "#2563eb", border: "none", borderRadius: 5, cursor: "pointer", color: "#fff", fontWeight: 600 }}>
                    + Action
                  </button>
                )}
                {!isClosed && (
                  <button
                    onClick={() => setDispositionTarget(ab)}
                    style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
                      fontSize: 10, padding: "5px 12px",
                      background: "#0f172a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 700 }}>
                    ✓ Close Abnormality
                  </button>
                )}
                {isClosed && (
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Classified and closed · {ab.id}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Disposition Modal */}
      {dispositionTarget && (
        <AbnormalityDispositionModal
          abnormality={dispositionTarget}
          onClose={() => setDispositionTarget(null)}
          onSubmit={handleDispositionSubmit}
        />
      )}
    </div>
  );
};

// ─── KPI Detail Drawer ────────────────────────────────────────────────────────
const KpiDrawer: React.FC<{ kpi: KpiCell; onClose: () => void }> = ({ kpi, onClose }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "chart" | "abnormalities" | "actions" | "traceability">("overview");
  const sc      = KPI_STATUS_COLOR[kpi.status];
  const kpiAbs  = abnormalities.filter(a => a.kpiId === kpi.id);
  const kpiActs = executionActions.filter(a => a.kpiId === kpi.id);
  const hasRepeat      = kpiAbs.some(a => a.isRepeatFlag);
  const hasSuggestedRCA = kpiAbs.some(a => a.suggestedForRCA);
  const pendingDisposition = kpiAbs.filter(a => a.disposition === null && a.status !== "Resolved").length;

  const TABS = [
    { id: "overview" as const,       label: "Overview"        },
    { id: "chart" as const,          label: "Control Chart"   },
    { id: "abnormalities" as const,  label: `Abn.${kpiAbs.length  > 0 ? ` (${kpiAbs.length})`  : ""}` },
    { id: "actions" as const,        label: `Actions${kpiActs.length > 0 ? ` (${kpiActs.length})` : ""}` },
    { id: "traceability" as const,   label: "Trace"           },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end", background: "rgba(15,23,42,0.35)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 460, height: "100%", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-8px 0 32px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: sc.bg, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                <StatusDot status={kpi.status} size={10} />
                <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, textTransform: "uppercase" }}>{kpi.status}</span>
                <TrendIcon trend={kpi.trend} size={12} />
                {hasRepeat && (
                  <RepeatFlagChip count={kpiAbs.find(a => a.isRepeatFlag)?.repeatCount ?? 0} suggested={hasSuggestedRCA} />
                )}
                <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>{kpi.line} · {kpi.shift} Shift</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{kpi.name}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{kpi.measureCode} · {kpi.sopRef} · Updated {kpi.lastUpdated}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={16} /></button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 10, paddingBottom: 2 }}>
            <div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Current</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: sc.color, lineHeight: 1 }}>
                {kpi.value}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>{kpi.unit}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Target</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#475569", lineHeight: 1 }}>
                {kpi.target}<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>{kpi.unit}</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
              {kpi.abnormalities > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>
                  ⚠ {kpi.abnormalities} abnormality
                </span>
              )}
              {kpi.actions > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                  🔧 {kpi.actions} action{kpi.actions !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#fafafa", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "8px 2px", border: "none", background: "none", cursor: "pointer",
                fontSize: 10.5, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? "#1d4ed8" : "#64748b",
                borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent",
                whiteSpace: "nowrap", position: "relative" }}>
              {t.label}
              {/* Red dot if abnormalities tab has pending dispositions */}
              {t.id === "abnormalities" && pendingDisposition > 0 && (
                <span style={{ position: "absolute", top: 6, right: 4, width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Overview */}
          {tab === "overview" && (
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Owner Position", value: kpi.ownerPosition },
                  { label: "Resolved To",    value: kpi.ownerPerson,  warn: kpi.ownerPerson === "Not Resolved" },
                  { label: "Department",     value: kpi.department },
                  { label: "Shift",          value: kpi.shift },
                ].map(f => (
                  <div key={f.label} style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 6, border: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: (f as any).warn ? "#dc2626" : "#334155" }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Control Chart CTA */}
              <div onClick={() => setTab("chart")}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, cursor: "pointer" }}>
                <ChartBar size={16} color="#2563eb" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8" }}>View Control Chart</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>SPC chart — UCL/LCL, warning zones & annotated events</div>
                </div>
                <ChevronRight size={13} color="#2563eb" />
              </div>

              {/* Pending disposition CTA */}
              {pendingDisposition > 0 && (
                <div onClick={() => setTab("abnormalities")}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer" }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b" }}>
                      {pendingDisposition} abnormalit{pendingDisposition !== 1 ? "ies" : "y"} pending classification
                    </div>
                    <div style={{ fontSize: 10, color: "#b91c1c" }}>Closure requires disposition — click to classify</div>
                  </div>
                  <ChevronRight size={13} color="#dc2626" />
                </div>
              )}

              {/* Manual signal entry */}
              <div style={{ padding: "10px 12px", background: "#eff6ff", borderRadius: 8, border: "1px solid #93c5fd" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>Manual Signal Entry</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input placeholder={`Enter ${kpi.unit} value…`}
                    style={{ flex: 1, padding: "5px 10px", border: "1px solid #93c5fd", borderRadius: 5, fontSize: 12, outline: "none" }} />
                  <button style={{ padding: "5px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "chart" && <ControlChartTab kpi={kpi} />}
          {tab === "abnormalities" && <AbnormalitiesTab kpi={kpi} />}

          {/* Actions */}
          {tab === "actions" && (
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, alignSelf: "flex-start" }}>
                <Plus size={11} /> New Action
              </button>
              {kpiActs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 12 }}>No actions linked</div>
              ) : kpiActs.map(act => {
                const sc2 = ACTION_STATUS_COLOR[act.status];
                const pc  = ACTION_PRIORITY_COLOR[act.priority];
                return (
                  <div key={act.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{act.title}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          {act.ownerPosition} → <strong style={{ color: act.ownerPerson === "Not Resolved" ? "#dc2626" : "#334155" }}>{act.ownerPerson}</strong>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: sc2.bg, color: sc2.color }}>{act.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: pc.bg, color: pc.color }}>{act.priority}</span>
                      <Clock size={9} color="#94a3b8" />
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>Due {act.dueTime}</span>
                      {act.escalated && <span style={{ fontSize: 9, fontWeight: 700, color: "#dc2626", marginLeft: "auto" }}>↑ Escalated</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Traceability */}
          {tab === "traceability" && (
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Full traceability chain per §8 — ≤ 3 clicks to any object.</div>
              {[
                { icon: ChartBar,  label: "Measure", code: kpi.measureCode,   route: "/measures",    desc: "View in 1.3 Measures Framework" },
                { icon: BookOpen,  label: "SOP",     code: kpi.sopRef,        route: "/sop-editor",  desc: "View SOP step containing this measure" },
                { icon: Building2, label: "Process", code: kpi.processRef,    route: "/processes",   desc: "Parent process in 1.4 Standardization" },
                { icon: Shield,    label: "Owner",   code: kpi.ownerPosition, route: "/assignments", desc: "Resolve in 1.2 Organization" },
              ].map(row => {
                const Icon = row.icon;
                return (
                  <div key={row.label} onClick={() => navigate(row.route)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{row.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>{row.code}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{row.desc}</div>
                    </div>
                    <ExternalLink size={12} color="#94a3b8" />
                  </div>
                );
              })}
              <div style={{ padding: "10px 12px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>Traceability Chain</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  {["Process","→","SOP","→","Step","→","Measure","→","KPI","→","Abnormality","→","Action"].map((node, i) => (
                    <span key={i} style={{ fontSize: 10, color: node === "→" ? "#d97706" : "#92400e", fontWeight: node === "→" ? 400 : 600 }}>{node}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── T1 Board ─────────────────────────────────────────────────────────────────
const T1Board: React.FC<{ onKpiClick: (kpi: KpiCell) => void }> = ({ onKpiClick }) => {
  const critCount    = t1KpiCells.filter(k => k.status === "Critical").length;
  const warnCount    = t1KpiCells.filter(k => k.status === "Warning").length;
  const missingCount = t1KpiCells.filter(k => k.status === "Missing").length;

  // Build per-KPI repeat flags from abnormalities data
  const kpiRepeatMap: Record<string, { hasRepeat: boolean; hasSuggestedRCA: boolean; maxCount: number }> = {};
  abnormalities.forEach(ab => {
    if (!kpiRepeatMap[ab.kpiId]) kpiRepeatMap[ab.kpiId] = { hasRepeat: false, hasSuggestedRCA: false, maxCount: 0 };
    if (ab.isRepeatFlag)    kpiRepeatMap[ab.kpiId].hasRepeat = true;
    if (ab.suggestedForRCA) kpiRepeatMap[ab.kpiId].hasSuggestedRCA = true;
    kpiRepeatMap[ab.kpiId].maxCount = Math.max(kpiRepeatMap[ab.kpiId].maxCount, ab.repeatCount);
  });

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {(critCount > 0 || missingCount > 0) && (
        <div style={{ padding: "6px 18px", background: "#fef2f2", borderBottom: "1px solid #fca5a5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
            <AlertTriangle size={13} color="#dc2626" />
            <strong style={{ color: "#991b1b" }}>{critCount} Critical · {warnCount} Warning · {missingCount} Missing Signal</strong>
            <span style={{ color: "#b91c1c" }}>— Immediate attention required</span>
          </div>
        </div>
      )}

      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 90px 70px 70px 70px 100px",
          padding: "6px 12px", background: "#f1f5f9", borderRadius: "6px 6px 0 0",
          border: "1px solid #e2e8f0", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
          <div>KPI / Measure</div>
          <div style={{ textAlign: "right" }}>Current</div>
          <div style={{ textAlign: "right" }}>Target</div>
          <div style={{ textAlign: "center" }}>Status</div>
          <div style={{ textAlign: "center" }}>Trend</div>
          <div style={{ textAlign: "center" }}>⚠ Abn.</div>
          <div style={{ textAlign: "center" }}>🔧 Act.</div>
          <div style={{ textAlign: "right" }}>Updated</div>
        </div>

        {t1KpiCells.map((kpi, idx) => {
          const sc     = KPI_STATUS_COLOR[kpi.status];
          const isLast = idx === t1KpiCells.length - 1;
          const rf     = kpiRepeatMap[kpi.id];
          return (
            <div key={kpi.id} onClick={() => onKpiClick(kpi)}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 90px 70px 70px 70px 100px",
                padding: "10px 12px",
                background: kpi.status === "Critical" ? "#fff8f8" : kpi.status === "Missing" ? "#f8fafc" : "#fff",
                border: "1px solid #e2e8f0", borderTop: "none",
                borderRadius: isLast ? "0 0 6px 6px" : 0,
                cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
              onMouseLeave={e => (e.currentTarget.style.background = kpi.status === "Critical" ? "#fff8f8" : kpi.status === "Missing" ? "#f8fafc" : "#fff")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusDot status={kpi.status} size={8} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{kpi.name}</span>
                    {/* §2.8 — Repeat icon on KPI cell (minimal) */}
                    {rf?.hasRepeat && <RepeatFlagChip count={rf.maxCount} suggested={rf.hasSuggestedRCA} />}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{kpi.measureCode} · {kpi.ownerPosition}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14, color: sc.color, alignSelf: "center" }}>
                {kpi.value === "Missing"
                  ? <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>— N/A</span>
                  : <>{kpi.value} <span style={{ fontSize: 10 }}>{kpi.unit}</span></>}
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "#64748b", alignSelf: "center" }}>{kpi.target} <span style={{ fontSize: 10 }}>{kpi.unit}</span></div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  {kpi.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><TrendIcon trend={kpi.trend} size={14} /></div>
              <div style={{ textAlign: "center", alignSelf: "center" }}>
                {kpi.abnormalities > 0
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "1px 7px", borderRadius: 10, border: "1px solid #fca5a5" }}>{kpi.abnormalities}</span>
                  : <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>}
              </div>
              <div style={{ textAlign: "center", alignSelf: "center" }}>
                {kpi.actions > 0
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fffbeb", padding: "1px 7px", borderRadius: 10, border: "1px solid #fde68a" }}>{kpi.actions}</span>
                  : <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>}
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#94a3b8", alignSelf: "center" }}>{kpi.lastUpdated}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── T2 Board ─────────────────────────────────────────────────────────────────
const T2Board: React.FC = () => (
  <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr 1fr 80px 80px" }}>
      {["Line","FPY","OEE","Scrap","MTTR","Actions","Escalated"].map((h, hi) => (
        <div key={h} style={{ padding: "6px 10px", background: "#f1f5f9", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase",
          textAlign: h === "Line" ? "left" : "center",
          borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0",
          borderLeft: hi === 0 ? "1px solid #e2e8f0" : "none",
          borderRadius: hi === 0 ? "6px 0 0 0" : hi === 6 ? "0 6px 0 0" : 0,
        }}>{h}</div>
      ))}
      {t2BoardRows.map((row, ri) => {
        const isLast = ri === t2BoardRows.length - 1;
        return (
          <React.Fragment key={row.lineId}>
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", background: "#fff", borderRadius: isLast ? "0 0 0 6px" : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{row.lineName}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{row.shift} Shift</div>
              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                {row.kpiSummary.critical > 0 && <span style={{ fontSize: 9, background: "#fef2f2", color: "#dc2626", padding: "1px 5px", borderRadius: 3 }}>🔴 {row.kpiSummary.critical}</span>}
                {row.kpiSummary.warning  > 0 && <span style={{ fontSize: 9, background: "#fffbeb", color: "#d97706", padding: "1px 5px", borderRadius: 3 }}>🟡 {row.kpiSummary.warning}</span>}
                {row.kpiSummary.normal   > 0 && <span style={{ fontSize: 9, background: "#f0fdf4", color: "#15803d", padding: "1px 5px", borderRadius: 3 }}>🟢 {row.kpiSummary.normal}</span>}
              </div>
            </div>
            {row.kpis.map((kpi, ki) => {
              const sc = KPI_STATUS_COLOR[kpi.status];
              return (
                <div key={ki} style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", background: kpi.status === "Critical" ? "#fff8f8" : "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{kpi.value}</div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <StatusDot status={kpi.status} size={7} />
                    <TrendIcon trend={kpi.trend} size={10} />
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", background: "#fff" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.openActions > 5 ? "#dc2626" : "#d97706" }}>{row.openActions}</span>
            </div>
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", borderRadius: isLast ? "0 0 6px 0" : 0, textAlign: "center", background: "#fff" }}>
              {row.escalated
                ? <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>↑ Yes</span>
                : <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>No</span>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ─── T3 Board ─────────────────────────────────────────────────────────────────
const T3Board: React.FC = () => (
  <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 80px 80px" }}>
      {["Department","KPI 1","KPI 2","KPI 3","KPI 4","Escalations","Issues"].map((h, hi) => (
        <div key={h} style={{ padding: "6px 10px", background: "#f1f5f9", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase",
          textAlign: h === "Department" ? "left" : "center",
          borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0",
          borderLeft: hi === 0 ? "1px solid #e2e8f0" : "none",
          borderRadius: hi === 0 ? "6px 0 0 0" : hi === 6 ? "0 6px 0 0" : 0,
        }}>{h}</div>
      ))}
      {t3BoardRows.map((row, ri) => {
        const isLast = ri === t3BoardRows.length - 1;
        return (
          <React.Fragment key={row.deptId}>
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", background: "#fff", borderRadius: isLast ? "0 0 0 6px" : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{row.deptName}</div>
              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                {row.kpiSummary.critical > 0 && <span style={{ fontSize: 9, background: "#fef2f2", color: "#dc2626", padding: "1px 5px", borderRadius: 3 }}>🔴 {row.kpiSummary.critical}</span>}
                {row.kpiSummary.warning  > 0 && <span style={{ fontSize: 9, background: "#fffbeb", color: "#d97706", padding: "1px 5px", borderRadius: 3 }}>🟡 {row.kpiSummary.warning}</span>}
              </div>
            </div>
            {row.kpis.map((kpi, ki) => {
              const sc = KPI_STATUS_COLOR[kpi.status];
              return (
                <div key={ki} style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", background: kpi.status === "Critical" ? "#fff8f8" : "#fff", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{kpi.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{kpi.value}</div>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 3, marginTop: 2 }}>
                    <StatusDot status={kpi.status} size={7} />
                    <TrendIcon trend={kpi.trend} size={10} />
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", textAlign: "center", background: "#fff" }}>
              {row.openEscalations > 0
                ? <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>↑ {row.openEscalations}</span>
                : <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>0</span>}
            </div>
            <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", borderRadius: isLast ? "0 0 6px 0" : 0, textAlign: "center", background: "#fff" }}>
              {row.persistentIssues > 0
                ? <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>{row.persistentIssues}</span>
                : <span style={{ fontSize: 12, color: "#22c55e" }}>0</span>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ─── Main BoardsScreen ────────────────────────────────────────────────────────
export const BoardsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [tier, setTier]               = useState<Tier>("T1");
  const [selectedKpi, setSelectedKpi] = useState<KpiCell | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [pulse, setPulse]             = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefresh(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const totalAbn  = abnormalities.filter(a => a.status !== "Resolved").length;
  const totalAct  = executionActions.filter(a => !["Closed", "Verified"].includes(a.status)).length;
  const pendingDisp = abnormalities.filter(a => a.disposition === null && a.status !== "Resolved").length;

  const TIER_TABS: { id: Tier; label: string; sub: string }[] = [
    { id: "T1", label: "T1 Board", sub: "Line / Shift" },
    { id: "T2", label: "T2 Board", sub: "Department"   },
    { id: "T3", label: "T3 Board", sub: "Plant"        },
  ];

  return (
    <div className="screen-shell" style={{ background: "#f8fafc" }}>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 1, background: "#f1f5f9", borderRadius: 7, padding: 3 }}>
          {TIER_TABS.map(t => {
            const tc = TIER_COLOR[t.id];
            return (
              <button key={t.id} onClick={() => setTier(t.id)}
                style={{ padding: "5px 14px", border: "none", borderRadius: 5, cursor: "pointer",
                  background: tier === t.id ? tc.bg : "transparent",
                  color: tier === t.id ? tc.color : "#64748b",
                  fontWeight: tier === t.id ? 700 : 500, fontSize: 12, transition: "all 0.1s" }}>
                <div>{t.label}</div>
                <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7 }}>{t.sub}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Critical", value: t1KpiCells.filter(k => k.status === "Critical").length, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
            { label: "Warning",  value: t1KpiCells.filter(k => k.status === "Warning").length,  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
            { label: "Normal",   value: t1KpiCells.filter(k => k.status === "Normal").length,   color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
          ].map(p => (
            <span key={p.label} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
              {p.value} {p.label}
            </span>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Pending disposition alert */}
          {pendingDisp > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", padding: "4px 10px", borderRadius: 6, border: "1px solid #93c5fd" }}>
              ✓ {pendingDisp} pending disposition
            </span>
          )}
          {totalAbn > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 6, border: "1px solid #fca5a5" }}>
              <AlertTriangle size={11} /> {totalAbn} abnormalities
            </span>
          )}
          {totalAct > 0 && (
            <span onClick={() => navigate("/actions")}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#d97706", background: "#fffbeb", padding: "4px 10px", borderRadius: 6, border: "1px solid #fde68a", cursor: "pointer" }}>
              <Wrench size={11} /> {totalAct} actions →
            </span>
          )}
          <button onClick={() => { setLastRefresh(new Date()); setPulse(true); setTimeout(() => setPulse(false), 600); }}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "none", border: "1px solid #e2e8f0", borderRadius: 5, cursor: "pointer", fontSize: 10, color: "#94a3b8" }}>
            <RefreshCw size={11} style={{ animation: pulse ? "spin 0.6s linear" : "none" }} />
            <span>{lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
          <button onClick={() => navigate("/meetings")}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            <ArrowUpRight size={11} /> Meetings
          </button>
        </div>
      </div>

      {/* Context sub-bar */}
      <div style={{ display: "flex", gap: 8, padding: "5px 18px", background: "#fafafa", borderBottom: "1px solid #e2e8f0", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Viewing:</span>
        {tier === "T1" && <>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>Line 1</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>Day Shift</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 11, color: "#334155" }}>Assembly · Chennai</span>
        </>}
        {tier === "T2" && <>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>Assembly Department</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 11, color: "#334155" }}>Chennai Plant · Day Shift</span>
        </>}
        {tier === "T3" && <>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>Chennai Plant</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
          <span style={{ fontSize: 11, color: "#334155" }}>All Departments</span>
        </>}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>
          Click any KPI row → detail panel → Abn. tab → ✓ Close Abnormality
        </span>
      </div>

      {tier === "T1" && <T1Board onKpiClick={setSelectedKpi} />}
      {tier === "T2" && <T2Board />}
      {tier === "T3" && <T3Board />}

      {selectedKpi && <KpiDrawer kpi={selectedKpi} onClose={() => setSelectedKpi(null)} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
