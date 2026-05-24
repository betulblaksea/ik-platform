import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target, Users, BarChart3, Sparkles, Calendar,
  Smartphone, Server, Layers, TrendingUp, AlertTriangle,
  UserPlus, ArrowRightLeft, Wallet, Bell,
} from "lucide-react";
import { Layout } from "../components/Sidebar";
import { useManagerEmployees } from "../hooks/useManagerEmployees.js";
import { useTasks } from "../hooks/useTasks.js";
import { useCheckIns } from "../hooks/useCheckIns.js";
import AiAnalysisNote from "../components/AiAnalysisNote.jsx";
import { buildWorkforcePlanningContext } from "../utils/workforcePlanning.js";
import { useAiInsight } from "../hooks/useAiInsight.js";

const FOCUS_OPTIONS = [
  { id: "mobile", label: "Mobil uygulama", icon: Smartphone },
  { id: "backend", label: "Backend / API", icon: Server },
  { id: "general", label: "Genel yazılım", icon: Layers },
];

const PRESETS = [
  {
    label: "2 mobil uygulama · 6 ay",
    goal: "Önümüzdeki 6 ay içinde 2 yeni mobil uygulama geliştireceğiz",
    months: 6,
    projects: 2,
    focus: "mobile",
  },
  {
    label: "Platform yenileme · 4 ay",
    goal: "4 ayda mevcut müşteri portalını yeniden yazacağız",
    months: 4,
    projects: 1,
    focus: "backend",
  },
];

function StatChip({ label, value, color = "#818cf8" }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </p>
      <p className="text-lg font-bold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}

function TeamCapacityCard({ team }) {
  return (
    <motion.div
      layout
      className="rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{team.dept}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
          {team.headcount} kişi
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Verimlilik</span>
          <p className="font-bold text-white">{team.efficiency != null ? `%${team.efficiency}` : "—"}</p>
        </div>
        <div>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Devamlılık</span>
          <p className="font-bold text-emerald-400">%{team.attendanceRate}</p>
        </div>
        <div>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Aktif yük</span>
          <p className="font-bold text-amber-300">%{team.loadPct}</p>
        </div>
        <div>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Kapasite</span>
          <p className="font-bold text-violet-300">{team.capacityIndex}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({ action }) {
  const icons = { hire: UserPlus, transfer: ArrowRightLeft, ok: TrendingUp };
  const colors = { hire: "#f472b6", transfer: "#60a5fa", ok: "#34d399" };
  const Icon = icons[action.type] || Target;
  const color = colors[action.type] || "#818cf8";

  return (
    <div
      className="rounded-xl p-4 flex gap-3"
      style={{ background: `${color}10`, border: `1px solid ${color}33` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white">{action.title}</p>
          {action.impact !== "—" ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}22`, color }}>
              {action.impact}
            </span>
          ) : null}
        </div>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {action.detail}
        </p>
      </div>
    </div>
  );
}

export default function WorkforcePlanning() {
  const { employees, loading: empLoading } = useManagerEmployees();
  const { tasks, loading: taskLoading } = useTasks();
  const { checkIns, loading: ciLoading } = useCheckIns({ days: 60 });

  const [goal, setGoal] = useState(PRESETS[0].goal);
  const [months, setMonths] = useState(6);
  const [projectCount, setProjectCount] = useState(2);
  const [focus, setFocus] = useState("mobile");
  const [budget, setBudget] = useState("");
  const dataLoading = empLoading || taskLoading || ciLoading;
  const { run, loading: aiLoading, error: aiError, insight, checkStatus, aiConfigured } = useAiInsight();
  const [aiStatus, setAiStatus] = useState(null);

  const context = useMemo(
    () =>
      buildWorkforcePlanningContext({
        goalText: goal,
        horizonMonths: months,
        newProjectCount: projectCount,
        focus,
        monthlyBudgetTry: budget ? Number(budget) : null,
        tasks,
        checkIns,
        employees,
      }),
    [goal, months, projectCount, focus, budget, tasks, checkIns, employees],
  );

  const runAnalysis = useCallback(async () => {
    if (!goal.trim()) return;
    await run("workforce", {
      goalText: goal,
      horizonMonths: months,
      newProjectCount: projectCount,
      focus,
      monthlyBudgetTry: budget ? Number(budget) : null,
      tasks,
      checkIns,
      employees,
    });
  }, [run, goal, months, projectCount, focus, budget, tasks, checkIns, employees]);

  useEffect(() => {
    checkStatus().then((s) => s && setAiStatus(s));
  }, [checkStatus]);

  const applyPreset = (p) => {
    setGoal(p.goal);
    setMonths(p.months);
    setProjectCount(p.projects);
    setFocus(p.focus);
    run("workforce", {
      goalText: p.goal,
      horizonMonths: p.months,
      newProjectCount: p.projects,
      focus: p.focus,
      monthlyBudgetTry: budget ? Number(budget) : null,
      tasks,
      checkIns,
      employees,
    }).catch(() => {});
  };

  return (
    <Layout>
      <header
        className="sticky top-0 z-20 px-8 py-4 flex items-center gap-4"
        style={{
          background: "rgba(6,6,15,0.82)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target size={20} className="text-violet-400" />
            Kadro & Bütçe Planlama
          </h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Strategic Workforce Planning · Görev verimliliği + çalışma saatleri devamlılığı
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "#c084fc" }}
        >
          <Sparkles size={12} />
          Gemini AI
        </div>
        <button
          type="button"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      </header>

      <div className="px-8 py-7 flex-1 space-y-6 max-w-6xl" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {/* Veri kaynağı */}
        <div className="grid grid-cols-3 gap-3">
          <StatChip label="Görev kaydı" value={String(tasks.length)} color="#818cf8" />
          <StatChip label="Giriş kaydı (60g)" value={String(checkIns.length)} color="#34d399" />
          <StatChip label="Çalışan" value={String(employees.length)} color="#f472b6" />
        </div>

        {/* Hedef formu */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Planlama hedefiniz</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Örn: «Önümüzdeki 6 ay içinde 2 yeni mobil uygulama geliştireceğiz»
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
            placeholder="Hangi takıma kaç kişi, hangi projeler, hangi süre?"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                Süre (ay)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value) || 6)}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2">
                Yeni proje sayısı
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={projectCount}
                onChange={(e) => setProjectCount(Number(e.target.value) || 1)}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-2 flex items-center gap-1">
                <Wallet size={10} /> Aylık bütçe (₺, opsiyonel)
              </label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="120000"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => runAnalysis().catch(() => {})}
                disabled={dataLoading || aiLoading || !goal.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                {dataLoading ? "Veriler yükleniyor…" : aiLoading ? "AI düşünüyor…" : "AI analizi çalıştır"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Proje odağı</p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((f) => {
                const Icon = f.icon;
                const active = focus === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocus(f.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                      color: active ? "#a5b4fc" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Icon size={14} />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {aiConfigured === false ? (
          <p className="text-xs rounded-xl px-4 py-3" style={{ color: "#fcd34d", background: "rgba(120,53,15,0.25)", border: "1px solid rgba(251,191,36,0.35)" }}>
            {aiStatus?.hint || "AI yapılandırılmadı. OPENROUTER_API_KEY kontrol edin."}
          </p>
        ) : null}

        {/* Ekip kapasitesi */}
        {context.teamSnapshots?.length > 0 ? (
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Mevcut ekip kapasitesi
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {context.teamSnapshots.map((t) => (
                <TeamCapacityCard key={t.dept} team={t} />
              ))}
            </div>
          </div>
        ) : null}

        {/* AI öngörüsü */}
        <AiAnalysisNote insight={insight} loading={aiLoading} error={aiError} />

        {insight?.delayRiskPct > 15 ? (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.28)" }}
          >
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <span className="text-amber-100">
              Mevcut projelerde tahmini <strong>%{insight.delayRiskPct}</strong> gecikme riski — kadro veya kaydırma kararı önerilir.
            </span>
          </div>
        ) : null}

        {insight?.actions?.length > 0 ? (
          <div>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />
              Önerilen aksiyonlar
            </h2>
            <div className="space-y-3">
              {insight.actions.map((a, i) => (
                <ActionCard key={i} action={a} />
              ))}
            </div>
          </div>
        ) : null}

        {insight?.budgetHint ? (
          <p className="text-xs rounded-xl px-4 py-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Calendar size={12} />
            {insight.budgetHint}
          </p>
        ) : null}

        {!dataLoading && tasks.length === 0 && checkIns.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.35)" }}>
            Henüz görev veya giriş kaydı yok.
          </p>
        ) : null}
      </div>
    </Layout>
  );
}
