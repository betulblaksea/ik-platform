import { motion } from "framer-motion";
import { Lightbulb, BarChart3, Loader2 } from "lucide-react";

export default function AiAnalysisNote({ insight, loading, error }) {
  if (loading) {
    return (
      <div className="glass-ai-loading">
        <Loader2 size={28} className="text-violet-400 animate-spin" />
        <p className="text-sm text-violet-200/90 font-medium">Analiz üretiliyor…</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass-ai-note"
    >
      <div className="glass-ai-note__glow" />

      <div className="flex items-start gap-4 relative">
        <div className="glass-ai-note__icon">🤖</div>
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <span className="glass-ai-note__title">
              {insight.title || "Yapay zeka analizi"}
            </span>
            <p className="text-sm leading-relaxed text-white/90">
              <span className="font-semibold text-violet-200">Gözlem: </span>
              {insight.observation}
            </p>
          </div>

          {insight.analysis ? (
            <p className="text-sm leading-relaxed text-white/72">
              <span className="font-semibold text-indigo-200">Analiz: </span>
              {insight.analysis}
            </p>
          ) : null}

          {insight.suggestion ? (
            <div className="ai-suggestion-box">
              <Lightbulb size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-emerald-100/90">
                <span className="font-semibold text-emerald-300">Öneri: </span>
                {insight.suggestion}
              </p>
            </div>
          ) : null}

          {insight.metrics?.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {insight.metrics.map((m) => (
                <span key={m.label} className="ai-metric-chip">
                  <BarChart3 size={10} />
                  {m.label}: <span className="text-white/80">{m.value}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="glass-ai-note__footer-line" />
    </motion.div>
  );
}
