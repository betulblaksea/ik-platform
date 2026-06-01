import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

export function useAiInsight() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insight, setInsight] = useState(null);

  const run = async (type, input) => {
    if (!token) {
      setError("Oturum gerekli");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/ai/insight", {
        token,
        method: "POST",
        body: { type, input },
        timeoutMs: 90_000,
      });
      setInsight(data.insight);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error, insight };
}
