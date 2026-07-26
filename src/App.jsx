import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import AIChatbot from "./pages/AIChatbot";
import Alerts from "./pages/Alerts";
import AuditLogs from "./pages/AuditLogs";
import CaseSearch from "./pages/CaseSearch";
import CrimeTrends from "./pages/CrimeTrends";
import CriminalNetwork from "./pages/CriminalNetwork";
import Dashboard from "./pages/Dashboard";
import DistrictAnalysis from "./pages/DistrictAnalysis";
import HotspotMap from "./pages/HotspotMap";
import Predictions from "./pages/Predictions";
import RepeatOffenders from "./pages/RepeatOffenders";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        <Route
          path="assistant"
          element={<AIChatbot />}
        />

        <Route
          path="ai-assistant"
          element={<AIChatbot />}
        />

        <Route
          path="hotspots"
          element={<HotspotMap />}
        />

        <Route
          path="hotspot-map"
          element={<HotspotMap />}
        />

        <Route
          path="trends"
          element={<CrimeTrends />}
        />

        <Route
          path="crime-trends"
          element={<CrimeTrends />}
        />

        <Route
          path="network"
          element={<CriminalNetwork />}
        />

        <Route
          path="criminal-network"
          element={<CriminalNetwork />}
        />

        <Route
          path="repeat-records"
          element={<RepeatOffenders />}
        />

        <Route
          path="repeat-offenders"
          element={<RepeatOffenders />}
        />

        <Route
          path="predictions"
          element={<Predictions />}
        />

        <Route
          path="predictive-intelligence"
          element={<Predictions />}
        />

        <Route
          path="cases"
          element={<CaseSearch />}
        />

        <Route
          path="case-search"
          element={<CaseSearch />}
        />

        <Route
          path="districts"
          element={<DistrictAnalysis />}
        />

        <Route
          path="district-analysis"
          element={<DistrictAnalysis />}
        />

        <Route
          path="alerts"
          element={<Alerts />}
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
          path="audit-logs"
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