import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard";
import MorningChart from "./pages/MorningChart";
import Tasks from "./pages/Tasks";
import Permissions from "./pages/Permissions";
import Employees from "./pages/Employees";
import LoginPage from "./pages/Login";

function LoginRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function HrRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== "hr") return <Navigate to="/dashboard" replace />;
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
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
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
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <Permissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <HrRoute>
                <Employees />
              </HrRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
