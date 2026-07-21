import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AIChatbot from "./pages/AIChatbot";
import AuditLogs from "./pages/AuditLogs";
import CaseSearch from "./pages/CaseSearch";
import CrimeTrends from "./pages/CrimeTrends";
import CriminalNetwork from "./pages/CriminalNetwork";
import Dashboard from "./pages/Dashboard";
import HotspotMap from "./pages/HotspotMap";
import Predictions from "./pages/Predictions";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="assistant"
          element={<AIChatbot />}
        />

        <Route
          path="hotspots"
          element={<HotspotMap />}
        />

        <Route
          path="trends"
          element={<CrimeTrends />}
        />

        <Route
          path="network"
          element={<CriminalNetwork />}
        />

        <Route
          path="repeat-records"
          element={
            <CaseSearch />
          }
        />

        <Route
          path="predictions"
          element={<Predictions />}
        />

        <Route
          path="cases"
          element={<CaseSearch />}
        />

        <Route
          path="districts"
          element={<CrimeTrends />}
        />

        <Route
          path="alerts"
          element={<Predictions />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="audit"
          element={<AuditLogs />}
        />

        <Route
          path="resources"
          element={<Resources />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Route>
    </Routes>
  );
}