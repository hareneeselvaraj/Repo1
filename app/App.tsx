import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

// ─── DWM Platform App Entry Point ────────────────────────────────────────────
// Uses React Router Data Mode with a shared RootLayout.
// All 17 screens are routed under the same shell (dark nav sidebar).

export default function App() {
  return <RouterProvider router={router} />;
}
