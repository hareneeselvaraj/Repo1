import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { contextOptions } from "../../../data/mockData";

// ─── ContextBar ───────────────────────────────────────────────────────────────
// Configurable context filter bar. Styles from dwm-shared.css.
// Only renders dimensions that are "enabled" (passed via props).

interface ContextState {
  site: string;
  department: string;
  line: string;
  shift: string;
}

interface ContextBarProps {
  context: ContextState;
  onContextChange: (key: keyof ContextState, value: string) => void;
  /** Which dimensions to show. Defaults to all four. */
  enabledDimensions?: Array<keyof ContextState>;
  className?: string;
}

const DIMENSION_LABELS: Record<keyof ContextState, string> = {
  site: "Site",
  department: "Dept",
  line: "Line",
  shift: "Shift",
};

const DIMENSION_OPTIONS: Record<keyof ContextState, string[]> = {
  site: contextOptions.sites,
  department: contextOptions.departments,
  line: contextOptions.lines,
  shift: contextOptions.shifts,
};

export const ContextBar: React.FC<ContextBarProps> = ({
  context,
  onContextChange,
  enabledDimensions = ["site", "department", "line", "shift"],
  className = "",
}) => {
  const [openDim, setOpenDim] = useState<keyof ContextState | null>(null);

  const toggleDim = (dim: keyof ContextState) => {
    setOpenDim((prev) => (prev === dim ? null : dim));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 20px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 10,
      }}
      className={className}
    >
      <span style={{ fontSize: 11, color: "#94a3b8", marginRight: 4 }}>Context:</span>
      {enabledDimensions.map((dim) => (
        <div key={dim} style={{ position: "relative" }}>
          <button
            className="dwm-ctx-chip"
            onClick={() => toggleDim(dim)}
          >
            <span className="ctx-label">{DIMENSION_LABELS[dim]}:</span>
            <span className="ctx-value">{context[dim]}</span>
            <ChevronDown size={11} className="ctx-arrow" />
          </button>

          {openDim === dim && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 100,
                minWidth: 150,
                overflow: "hidden",
              }}
            >
              {DIMENSION_OPTIONS[dim].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onContextChange(dim, opt);
                    setOpenDim(null);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "7px 14px",
                    textAlign: "left",
                    fontSize: 12,
                    background: context[dim] === opt ? "#eff6ff" : "transparent",
                    color: context[dim] === opt ? "#1d4ed8" : "#334155",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    context[dim] !== opt && ((e.currentTarget as HTMLButtonElement).style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    context[dim] !== opt && ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Click-away backdrop */}
      {openDim && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9 }}
          onClick={() => setOpenDim(null)}
        />
      )}
    </div>
  );
};
