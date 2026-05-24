import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function employeeInitials(name, email) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const e = (email || "").trim();
  return e ? e.slice(0, 2).toUpperCase() : "??";
}

export function formatEmployee(u) {
  return {
    ...u,
    id: u.id || u._id,
    avatar: employeeInitials(u.name, u.email),
    role: u.position || "",
    dept: u.dept || "Genel",
  };
}

export function useManagerEmployees() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!token || user?.role !== "manager") {
      setEmployees([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users?role=employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Çalışanlar yüklenemedi");
      setEmployees((data.users || []).map(formatEmployee));
    } catch (err) {
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { employees, loading, error, reload, setEmployees };
}
