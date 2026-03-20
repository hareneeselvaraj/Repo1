import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { DashboardOption1 } from "./components/dashboard/DashboardOption1";
import { OrganizationScreen } from "./components/screens/OrganizationScreen";
import { PositionCatalog } from "./components/screens/PositionCatalog";
import { RoleSheetEditor } from "./components/screens/RoleSheetEditor";
import { PeopleDirectory } from "./components/screens/PeopleDirectory";
import { AssignmentConsole } from "./components/screens/AssignmentConsole";
import { DelegationScreen } from "./components/screens/DelegationScreen";
import { ProcessRegistry } from "./components/screens/ProcessRegistry";
import { StandardizationHub } from "./components/screens/StandardizationHub";
import { SOPLibrary } from "./components/screens/SOPLibrary";
import { SOPEditor } from "./components/screens/SOPEditor";
import { PFCDesigner } from "./components/screens/PFCDesigner";
import { VersionCompare } from "./components/screens/VersionCompare";
import { MeasureDesigner } from "./components/screens/MeasureDesigner";
import { ApprovalInbox } from "./components/screens/ApprovalInbox";
import { ImpactAnalysis } from "./components/screens/ImpactAnalysis";
import { AuditHistory } from "./components/screens/AuditHistory";
import { ProcessDesignerScreen } from "./components/screens/standardization/ProcessDesignerScreen";
import { YokotenScreen } from "./components/screens/standardization/YokotenScreen";
// ── Module 1.5 – Execution Layer ──────────────────────────────────────────────
import { BoardsScreen } from "./components/screens/execution/BoardsScreen";
import { MyWorkScreen } from "./components/screens/execution/MyWorkScreen";
import { ActionsScreen } from "./components/screens/execution/ActionsScreen";
import { MeetingsScreen } from "./components/screens/execution/MeetingsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,                  Component: DashboardOption1 },
      { path: "dashboard",            Component: DashboardOption1 },
      { path: "organization",         Component: OrganizationScreen },
      { path: "positions",            Component: PositionCatalog },
      { path: "role-sheets",          Component: RoleSheetEditor },
      { path: "people",               Component: PeopleDirectory },
      { path: "assignments",          Component: AssignmentConsole },
      { path: "delegation",           Component: DelegationScreen },
      { path: "processes",            Component: ProcessRegistry },
      { path: "standardization",      Component: StandardizationHub },
      { path: "process-designer",     Component: ProcessDesignerScreen },
      { path: "sop-library",          Component: SOPLibrary },
      { path: "sop-editor",           Component: SOPEditor },
      { path: "pfc-designer",         Component: PFCDesigner },
      { path: "version-compare",      Component: VersionCompare },
      { path: "measures",             Component: MeasureDesigner },
      { path: "approval-inbox",       Component: ApprovalInbox },
      { path: "governance",           Component: ApprovalInbox },
      { path: "impact-analysis",      Component: ImpactAnalysis },
      { path: "audit",                Component: AuditHistory },
      { path: "yokoten",              Component: YokotenScreen },
      { path: "notifications",        Component: DashboardOption1 },
      { path: "administration",       Component: DashboardOption1 },
      // ── Execution Layer routes (1.5) ──
      { path: "boards",               Component: BoardsScreen },
      { path: "my-work",              Component: MyWorkScreen },
      { path: "actions",              Component: ActionsScreen },
      { path: "meetings",             Component: MeetingsScreen },
    ],
  },
]);