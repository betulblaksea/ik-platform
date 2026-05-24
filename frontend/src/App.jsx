import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard";
import MorningChart from "./pages/MorningChart";
import Tasks from "./pages/Tasks";
import WorkforcePlanning from "./pages/WorkforcePlanning";
import LoginPage from "./pages/Login";
function homePath(user) {
  return user?.role === "manager" ? "/dashboard" : "/tasks";
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
  if (user?.role !== "manager") return <Navigate to="/tasks" replace />;
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
