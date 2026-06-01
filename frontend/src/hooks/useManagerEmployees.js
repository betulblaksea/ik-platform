import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function employeeInitials(name, email) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return (email || "??").slice(0, 2).toUpperCase();
}

export function useManagerEmployees() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "manager") {
      setEmployees([]);
      setLoading(false);
      return;
    }
    fetch("/api/users?role=employee", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setEmployees(
          (data.users || []).map((u) => ({
            ...u,
            avatar: employeeInitials(u.name, u.email),
            role: u.position || "",
          })),
        );
      })
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, [token, user?.role]);

  return { employees, loading, setEmployees };
}
