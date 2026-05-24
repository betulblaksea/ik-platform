import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard";
import MorningChart from "./pages/MorningChart";
import Tasks from "./pages/Tasks";
import WorkforcePlanning from "./pages/WorkforcePlanning";
import LoginPage from "./pages/Login";
import { isManagerRole } from "./utils/roleLabels.js";

function homePath(user) {
  return isManagerRole(user?.role) ? "/dashboard" : "/tasks";
}

function LoginRoute() {
  const { token, user } = useAuth();
  if (token) return <Navigate to={homePath(user)} replace />;
  return <LoginPage />;
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function ManagerRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (!isManagerRole(user?.role)) return <Navigate to="/tasks" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRoute />} />

          <Route
            path="/dashboard"
            element={
              <ManagerRoute>
                <Dashboard />
              </ManagerRoute>
            }
          />

          <Route
            path="/morning-chart"
            element={
              <ProtectedRoute>
                <MorningChart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route path="/employees" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/workforce"
            element={
              <ManagerRoute>
                <WorkforcePlanning />
              </ManagerRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
