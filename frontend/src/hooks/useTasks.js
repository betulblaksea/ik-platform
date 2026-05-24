import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

export function useTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!token) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/tasks", { token });
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createTask = async (payload) => {
    const data = await apiFetch("/api/tasks", { token, method: "POST", body: payload });
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  };

  const updateTask = async (id, payload) => {
    const data = await apiFetch(`/api/tasks/${id}`, { token, method: "PATCH", body: payload });
    setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    return data.task;
  };

  return { tasks, loading, error, reload, createTask, updateTask };
}
