import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Sidebar } from "../shared/Sidebar";
import { GlobalHeader } from "../shared/GlobalHeader";
import { ContextBar } from "../shared/ContextBar";
import { currentContext } from "../../../data/mockData";
import "../../../styles/dwm-screens.css";

// Maps route path segments to nav item IDs
const PATH_TO_NAV: Record<string, string> = {
  "":                "dashboard",
  "dashboard":       "dashboard",
  "organization":    "organization",
  "positions":       "positions",
  "role-sheets":     "role-sheets",
  "people":          "people",
  "assignments":     "assignments",
  "processes":       "processes",
  "standardization": "standardization",
  "process-designer":"process-designer",
  "sop-library":     "sop-library",
  "sop-editor":      "sop-library",
  "pfc-designer":    "pfc-designer",
  "version-compare": "standardization",
  "measures":        "measures",
  "governance":      "governance",
  "approval-inbox":  "governance",
  "impact-analysis": "governance",
  "delegation":      "assignments",
  "notifications":   "notifications",
  "audit":           "audit",
  "yokoten":         "yokoten",
  "administration":  "administration",
  // ── Execution Layer (1.5) ──
  "boards":          "boards",
  "my-work":         "my-work",
  "actions":         "actions",
  "meetings":        "meetings",
};

const PAGE_TITLES: Record<string, string> = {
  "":                "Dashboard",
  "dashboard":       "Dashboard",
  "organization":    "Organization",
  "positions":       "Position Catalog",
  "role-sheets":     "Role Sheet Editor",
  "people":          "People Directory",
  "assignments":     "Assignment Console",
  "delegation":      "Delegation / Acting",
  "processes":       "Process Registry",
  "standardization": "Standardization",
  "process-designer":"Process Designer",
  "sop-library":     "SOP Library",
  "sop-editor":      "SOP Editor",
  "pfc-designer":    "PFC Designer",
  "version-compare": "Version Compare",
  "measures":        "Measures Framework",
  "governance":      "Governance",
  "approval-inbox":  "Approval Inbox",
  "impact-analysis": "Impact Analysis",
  "notifications":   "Notifications",
  "audit":           "Audit & History",
  "yokoten":         "Yokoten",
  "administration":  "Administration",
  // ── Execution Layer (1.5) ──
  "boards":          "Boards — Execution Layer",
  "my-work":         "My Work",
  "actions":         "Actions",
  "meetings":        "Meetings",
};

export const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ctx, setCtx] = useState(currentContext);

  const segment = location.pathname.split("/").filter(Boolean)[0] ?? "";
  const activeNav = PATH_TO_NAV[segment] ?? "dashboard";
  const pageTitle = PAGE_TITLES[segment] ?? "DWM Platform";

  const handleCtxChange = (key: keyof typeof ctx, value: string) => {
    setCtx((prev) => ({ ...prev, [key]: value }));
  };

  const handleNavigate = (id: string) => {
    const routeMap: Record<string, string> = {
      dashboard:          "/",
      organization:       "/organization",
      positions:          "/positions",
      "role-sheets":      "/role-sheets",
      people:             "/people",
      assignments:        "/assignments",
      processes:          "/processes",
      standardization:    "/standardization",
      "process-designer": "/process-designer",
      "sop-library":      "/sop-library",
      "pfc-designer":     "/pfc-designer",
      measures:           "/measures",
      governance:         "/approval-inbox",
      notifications:      "/notifications",
      audit:              "/audit",
      yokoten:            "/yokoten",
      administration:     "/administration",
      // ── Execution Layer (1.5) ──
      boards:             "/boards",
      "my-work":          "/my-work",
      actions:            "/actions",
      meetings:           "/meetings",
    };
    navigate(routeMap[id] ?? "/");
  };

  return (
    <div className="dwm-root" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Dark nav sidebar */}
      <Sidebar variant="dark" activeId={activeNav} onNavigate={handleNavigate} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <GlobalHeader pageTitle={pageTitle} />
        <ContextBar context={ctx} onContextChange={handleCtxChange} />

        {/* Page content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};