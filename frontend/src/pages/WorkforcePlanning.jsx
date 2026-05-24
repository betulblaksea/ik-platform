import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target, Users, BarChart3,
  Calendar,
  Smartphone, Server, Layers, TrendingUp, AlertTriangle,
  UserPlus, ArrowRightLeft, Wallet,
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

function TeamCapacityCard({ team }) {
  return (
    <motion.div layout className="team-capacity-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{team.dept}</h3>
        <span className="headcount-badge">{team.headcount} kişi</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="metric-label">Verimlilik</span>
          <p className="font-bold text-white">{team.efficiency != null ? `%${team.efficiency}` : "—"}</p>
        </div>
        <div>
          <span className="metric-label">Devamlılık</span>
          <p className="font-bold text-emerald-400">%{team.attendanceRate}</p>
        </div>
        <div>
          <span className="metric-label">Aktif yük</span>
          <p className="font-bold text-amber-300">%{team.loadPct}</p>
        </div>
        <div>
          <span className="metric-label">Kapasite</span>
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
    <div className="action-card" style={{ "--action-color": color }}>
      <div className="action-card__icon">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white">{action.title}</p>
          {action.impact !== "—" ? (
            <span className="action-card__impact">{action.impact}</span>
          ) : null}
        </div>
        <p className="action-card__detail">{action.detail}</p>
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
      <header className="page-header">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target size={20} className="text-violet-400" />
            Kadro & Bütçe Planlama
          </h1>
          <p className="page-header__subtitle">
            Görev verimliliği ve çalışma saatleri devamlılığına göre plan
          </p>
        </div>
      </header>

      <div className="page-body space-y-6 max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="planning-hero space-y-5"
        >
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Planlama hedefiniz</h2>
            <p className="glass-stat__label">
              Örn: «Önümüzdeki 6 ay içinde 2 yeni mobil uygulama geliştireceğiz»
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="preset-btn"
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            className="field-input resize-none"
            placeholder="Hangi takıma kaç kişi, hangi projeler, hangi süre?"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="field-label">Süre (ay)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value) || 6)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Yeni proje sayısı</label>
              <input
                type="number"
                min={1}
                max={10}
                value={projectCount}
                onChange={(e) => setProjectCount(Number(e.target.value) || 1)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label flex items-center gap-1">
                <Wallet size={10} /> Aylık bütçe (₺, opsiyonel)
              </label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="120000"
                className="field-input"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => runAnalysis().catch(() => {})}
                disabled={dataLoading || aiLoading || !goal.trim()}
                className="btn-gradient-primary"
              >
                {dataLoading ? "Veriler yükleniyor…" : aiLoading ? "AI düşünüyor…" : "AI analizi çalıştır"}
              </button>
            </div>
          </div>

          <div>
            <p className="field-label mb-2">Proje odağı</p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((f) => {
                const Icon = f.icon;
                const active = focus === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFocus(f.id)}
                    className={`focus-option${active ? " focus-option--active" : ""}`}
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
          <p className="alert-config-hint">
            {aiStatus?.hint || "AI yapılandırılmadı. OPENROUTER_API_KEY kontrol edin."}
          </p>
        ) : null}

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

        <AiAnalysisNote insight={insight} loading={aiLoading} error={aiError} />

        {insight?.delayRiskPct > 15 ? (
          <div className="alert-warning-box">
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
          <p className="budget-hint-box">
            <Calendar size={12} />
            {insight.budgetHint}
          </p>
        ) : null}

        {!dataLoading && tasks.length === 0 && checkIns.length === 0 ? (
          <p className="empty-state py-8 text-sm">
            Henüz görev veya giriş kaydı yok.
          </p>
        ) : null}
      </div>
    </Layout>
  );
}
