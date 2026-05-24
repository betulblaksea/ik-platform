import { motion } from "framer-motion";
import { Lightbulb, BarChart3, Loader2 } from "lucide-react";

export default function AiAnalysisNote({ insight, loading, error }) {
  if (loading) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(99,102,241,0.05) 100%)",
          border: "1px solid rgba(168,85,247,0.28)",
        }}
      >
        <Loader2 size={28} className="text-violet-400 animate-spin" />
        <p className="text-sm text-violet-200/90 font-medium">Analiz üretiliyor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-2xl p-5 text-sm"
        style={{
          background: "rgba(127,29,29,0.25)",
          border: "1px solid rgba(248,113,113,0.35)",
          color: "#fecaca",
        }}
      >
        {error}
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.06) 100%)",
        border: "1px solid rgba(168,85,247,0.32)",
        boxShadow: "0 0 60px rgba(168,85,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
          transform: "translate(25%, -35%)",
        }}
      />

      <div className="flex items-start gap-4 relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{
            background: "rgba(168,85,247,0.18)",
            border: "1px solid rgba(168,85,247,0.4)",
            boxShadow: "0 0 24px rgba(168,85,247,0.25)",
          }}
        >
          🤖
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <span
              className="text-[9px] font-bold tracking-[0.16em] uppercase block mb-1.5"
              style={{ color: "#c084fc" }}
            >
              {insight.title || "AI Analiz Notu"}
              {insight.source ? (
                <span className="ml-2 opacity-70">· {insight.source}</span>
              ) : null}
            </span>
            <p className="text-sm leading-relaxed text-white/90">
              <span className="font-semibold text-violet-200">Gözlem: </span>
              {insight.observation}
            </p>
          </div>

          {insight.analysis ? (
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              <span className="font-semibold text-indigo-200">Analiz: </span>
              {insight.analysis}
            </p>
          ) : null}

          {insight.suggestion ? (
            <div
              className="rounded-xl px-4 py-3 flex gap-3"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
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
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <BarChart3 size={10} />
                  {m.label}: <span className="text-white/80">{m.value}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)" }}
      />
    </motion.div>
  );
}
