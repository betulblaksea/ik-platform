import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MorningChart from "./pages/MorningChart";
import Tasks from "./pages/Tasks";
import Permissions from "./pages/Permissions";
import LoginPage from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
    <Routes>
  {/* Ana sayfa (/) artık Login sayfası olacak */}
  <Route path="/" element={<LoginPage />} /> 
  
  {/* Dashboard'a artık /dashboard yazarak veya login'den yönlenerek gidilecek */}
  <Route path="/dashboard" element={<Dashboard />} />
  
  <Route path="/morning-chart" element={<MorningChart />} />
  <Route path="/tasks" element={<Tasks />} />
  <Route path="/permissions" element={<Permissions />} />
</Routes>
    </BrowserRouter>
  );
}