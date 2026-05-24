import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

export function useCheckIns({ date, days = 30 } = {}) {
  const { token } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!token) {
      setCheckIns([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const q = date ? `?date=${encodeURIComponent(date)}` : `?days=${days}`;
      const data = await apiFetch(`/api/check-ins${q}`, { token });
      setCheckIns(data.checkIns || []);
    } catch (err) {
      setError(err.message);
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  }, [token, date, days]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveToday = async (payload) => {
    const data = await apiFetch("/api/check-ins/today", {
      token,
      method: "POST",
      body: payload,
    });
    setCheckIns((prev) => {
      const rest = prev.filter((c) => c.date !== data.checkIn.date);
      return [data.checkIn, ...rest];
    });
    return data.checkIn;
  };

  return { checkIns, loading, error, reload, saveToday };
}
