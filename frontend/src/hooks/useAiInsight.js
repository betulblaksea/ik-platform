import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

const AI_INSIGHT_TIMEOUT_MS = 90_000;

export function useAiInsight() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insight, setInsight] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(null);

  const checkStatus = useCallback(async () => {
    if (!token) return false;
    try {
      const data = await apiFetch("/api/ai/status", { token });
      setAiConfigured(data.configured);
      return data;
    } catch {
      setAiConfigured(false);
      return false;
    }
  }, [token]);

  const run = useCallback(
    async (type, input) => {
      if (!token) throw new Error("Oturum gerekli");
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/ai/insight", {
          token,
          method: "POST",
          body: { type, input },
          timeoutMs: AI_INSIGHT_TIMEOUT_MS,
        });
        setInsight(data.insight);
        return data.insight;
      } catch (err) {
        setError(err.message);
        setInsight(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return {
    run,
    loading,
    error,
    insight,
    setInsight,
    aiConfigured,
    checkStatus,
  };
}
