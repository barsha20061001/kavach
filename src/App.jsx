import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
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
import Login from "./pages/Login";
import Predictions from "./pages/Predictions";
import Profile from "./pages/Profile";
import RepeatOffenders from "./pages/RepeatOffenders";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

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
          element={
            <Navigate
              to="/assistant"
              replace
            />
          }
        />

        <Route
          path="hotspots"
          element={<HotspotMap />}
        />

        <Route
          path="hotspot-map"
          element={
            <Navigate
              to="/hotspots"
              replace
            />
          }
        />

        <Route
          path="trends"
          element={<CrimeTrends />}
        />

        <Route
          path="crime-trends"
          element={
            <Navigate
              to="/trends"
              replace
            />
          }
        />

        <Route
          path="network"
          element={<CriminalNetwork />}
        />

        <Route
          path="criminal-network"
          element={
            <Navigate
              to="/network"
              replace
            />
          }
        />

        <Route
          path="repeat-records"
          element={<RepeatOffenders />}
        />

        <Route
          path="repeat-offenders"
          element={
            <Navigate
              to="/repeat-records"
              replace
            />
          }
        />

        <Route
          path="predictions"
          element={<Predictions />}
        />

        <Route
          path="predictive-intelligence"
          element={
            <Navigate
              to="/predictions"
              replace
            />
          }
        />

        <Route
          path="cases"
          element={<CaseSearch />}
        />

        <Route
          path="case-search"
          element={
            <Navigate
              to="/cases"
              replace
            />
          }
        />

        <Route
          path="districts"
          element={<DistrictAnalysis />}
        />

        <Route
          path="district-analysis"
          element={
            <Navigate
              to="/districts"
              replace
            />
          }
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
          element={
            <Navigate
              to="/audit"
              replace
            />
          }
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
          path="profile"
          element={<Profile />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}