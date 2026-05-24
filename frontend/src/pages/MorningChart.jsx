import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users, TrendingUp, AlertTriangle,
  Calendar, Filter,
} from "lucide-react";
import { Layout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext.jsx";
import { useCheckIns } from "../hooks/useCheckIns.js";
import WorkTimeLogForm from "../components/WorkTimeLogForm.jsx";
import AiAnalysisNote from "../components/AiAnalysisNote.jsx";
import { useAiInsight } from "../hooks/useAiInsight.js";
import {
  LATE_CATEGORIES,
  todayKey,
  buildCategoryDonut,
  buildArrivalBars,
  formatDelta,
  deltaColor,
} from "../utils/checkInCharts.js";

const TODAY = new Date().toLocaleDateString("tr-TR", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});


const DONUT_R   = 70;
const DONUT_CX  = 90;
const DONUT_CY  = 90;
const STROKE_W  = 22;
const CIRCUM    = 2 * Math.PI * DONUT_R;

function DonutArc({ segment, isActive, onClick }) {
  const cat = LATE_CATEGORIES[segment.key] || LATE_CATEGORIES.ontime;
  const dashArray  = segment.pct * CIRCUM;
  const dashOffset = CIRCUM - segment.offset * CIRCUM;
  const gap = 3;

  return (
    <motion.circle
      cx={DONUT_CX}
      cy={DONUT_CY}
      r={DONUT_R}
      fill="none"
      stroke={cat.color}
      strokeWidth={isActive ? STROKE_W + 6 : STROKE_W}
      strokeDasharray={`${dashArray - gap} ${CIRCUM - dashArray + gap}`}
      strokeDashoffset={dashOffset}
      strokeLinecap="butt"
      className={`donut-arc${isActive ? " donut-arc--active" : ""}`}
      style={{ "--cat-color": cat.color }}
      onClick={() => onClick(segment.key)}
      whileHover={{ strokeWidth: STROKE_W + 4 }}
    />
  );
}

function DonutChart({ segments, total, activeCategory, onSelect, centerLabel = "Kayıt" }) {
  const active = segments.find(s => s.key === activeCategory);
  const cat    = active ? (LATE_CATEGORIES[active.key] || LATE_CATEGORIES.ontime) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="donut-wrap">
        <svg viewBox="0 0 180 180" width="180" height="180">
          <circle
            cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE_W}
          />
          {segments.map(seg => (
            <DonutArc
              key={seg.key}
              segment={seg}
              isActive={activeCategory === seg.key}
              onClick={onSelect}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {cat ? (
            <>
              <span className="text-2xl font-bold text-white">{active.count}</span>
              <span className="donut-center-label" style={{ "--cat-color": cat.color }}>{cat.label}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">{total}</span>
              <span className="donut-center-muted">{centerLabel}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-2 mt-4 w-full px-2">
        {segments.map(seg => {
          const c = LATE_CATEGORIES[seg.key] || LATE_CATEGORIES.ontime;
          const isActive = activeCategory === seg.key;
          return (
            <button
              key={seg.key}
              type="button"
              onClick={() => onSelect(seg.key)}
              className={`legend-btn${isActive ? " legend-btn--active" : ""}`}
              style={{ "--cat-bg": c.bg, "--cat-color": c.color }}
            >
              <span className="legend-dot" style={{ "--cat-color": c.color }} />
              <span className="legend-btn__label">{c.label}</span>
              <span className="legend-btn__count">{seg.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BarChart({ barData }) {
  const [hovered, setHovered] = useState(null);
  const BAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"];
  const barMax = Math.max(...barData.map((d) => d.count), 1);

  if (barData.length === 0) {
    return (
      <div className="bar-chart-empty">
        Departman dağılımı için çalışan verisi yok.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-2.5 h-36 w-full px-1">
        {barData.map((d, i) => {
          const heightPct = (d.count / barMax) * 100;
          const color     = BAR_COLORS[i];
          const isHov     = hovered === i;
          return (
            <div
              key={d.time}
              className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="bar-tooltip"
                    style={{ "--chart-color": color }}
                  >
                    {d.count} giriş
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bar-track">
                <motion.div
                  className={`bar-fill${isHov ? " bar-fill--hover" : ""}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ "--chart-color": color }}
                >
                  <div className="bar-fill__shine" />
                </motion.div>
              </div>

              <span className="bar-axis-label">{d.time}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-3 px-1">
        <span className="bar-footer-hint">30 dk aralıklar</span>
        <span className="bar-footer-hint">Son 30 gün</span>
      </div>
    </div>
  );
}

function PersonalHistoryRow({ record, index }) {
  const cat = LATE_CATEGORIES[record.category] || LATE_CATEGORIES.ontime;
  const Icon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="row-card"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{record.date}</p>
        <p className="text-xs chart-card__subtitle">
          {record.arrival} giriş
          {record.departure ? ` · ${record.departure} çıkış` : ""}
          {record.daySummary ? " · özet var" : ""}
        </p>
      </div>
      <div
        className="category-badge"
        style={{ "--cat-bg": cat.bg, "--cat-color": cat.color }}
      >
        <Icon size={11} />
        {cat.label}
      </div>
      <span
        className="delta-value w-24 text-right"
        style={{ "--delta-color": deltaColor(record.delta) }}
      >
        {formatDelta(record.delta)}
      </span>
    </motion.div>
  );
}

function EmployeeRow({ emp, index }) {
  const cat = LATE_CATEGORIES[emp.category] || LATE_CATEGORIES.ontime;
  const Icon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="row-card group transition-all"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 category-badge"
        style={{ "--cat-bg": cat.bg, "--cat-color": cat.color }}
      >
        {emp.avatar}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
        <p className="text-xs chart-card__subtitle truncate">{emp.dept}</p>
      </div>

      <div
        className="hidden sm:flex category-badge font-medium px-2.5 py-1"
        style={{ "--cat-bg": cat.bg, "--cat-color": cat.color }}
      >
        <Icon size={11} />
        {cat.label}
      </div>

      <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
        <Clock size={11} className="text-white/30" />
        <span className="font-mono font-semibold text-white">{emp.arrival}</span>
      </div>

      <span
        className="delta-value flex-shrink-0 w-28 text-right"
        style={{ "--delta-color": deltaColor(emp.delta) }}
      >
        {formatDelta(emp.delta)}
      </span>
    </motion.div>
  );
}

function StatPill({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="glass-stat flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="glass-stat__label">{label}</span>
        <div className="stat-icon" style={{ "--stat-color": color }}>
          <Icon size={13} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <span className="glass-stat__sub">{sub}</span>
    </div>
  );
}

export default function MorningChart() {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";
  const { checkIns, loading, error, saveToday } = useCheckIns({ days: 30 });
  const { run, loading: aiLoading, error: aiError, insight: aiInsight } = useAiInsight();
  const [activeCategory, setActiveCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const today = todayKey();
  const todayRecord = checkIns.find((c) => c.date === today);
  const lateList = useMemo(() => checkIns.filter((c) => c.delta > 0), [checkIns]);
  const donutSegments = useMemo(() => buildCategoryDonut(checkIns), [checkIns]);
  const barData = useMemo(() => buildArrivalBars(checkIns), [checkIns]);

  const onTimeCount = checkIns.filter((c) => !c.delta).length;
  const lateCount = lateList.length;
  const avgDelay = lateCount
    ? Math.round(lateList.reduce((s, c) => s + c.delta, 0) / lateCount)
    : 0;

  const filtered = activeCategory
    ? checkIns.filter((c) => c.category === activeCategory)
    : isEmployee
      ? checkIns
      : lateList.length
        ? lateList
        : checkIns;

  const handleDonutClick = (key) => {
    setActiveCategory((prev) => (prev === key ? null : key));
  };

  const handleSaveCheckIn = async (payload) => {
    setSaving(true);
    try {
      await saveToday(payload);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isEmployee || loading) return;
    const timer = setTimeout(() => {
      run("morning", { checkIns }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [checkIns.length, isEmployee, loading, run]);

  const activeCatMeta = activeCategory
    ? (LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime)
    : null;

  return (
    <Layout>
      <header className="page-header">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEmployee ? "Çalışma Saatlerim" : "Sabah Analizi"}
          </h1>
          <p className="page-header__subtitle">{TODAY}</p>
        </div>
      </header>

      <div className="page-body space-y-6">

        {error ? (
          <div className="alert-error">{error}</div>
        ) : null}

        {isEmployee ? (
          <>
            <WorkTimeLogForm todayRecord={todayRecord} onSave={handleSaveCheckIn} saving={saving} />
            {checkIns.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
              >
                <h2 className="text-sm font-bold text-white mb-1">Giriş geçmişim</h2>
                <p className="chart-card__subtitle mb-4">Son kayıtlarınız</p>
                <div className="space-y-2">
                  {checkIns
                    .slice()
                    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                    .map((r, i) => (
                      <PersonalHistoryRow key={r.id} record={r} index={i} />
                    ))}
                </div>
              </motion.div>
            ) : null}
          </>
        ) : null}

        {!isEmployee ? (
        <>
        <AiAnalysisNote insight={aiInsight} loading={aiLoading} error={aiError} />

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatPill label={isEmployee ? "Toplam kayıt" : "Giriş kaydı"} value={checkIns.length} sub="Son 30 gün" icon={Users} color="#3b82f6" />
          <StatPill label="Zamanında" value={onTimeCount} sub="Gecikmesiz" icon={Clock} color="#10b981" />
          <StatPill label="Geç kalma" value={lateCount} sub="Kayıtlı gecikme" icon={AlertTriangle} color="#f59e0b" />
          <StatPill label="Ort. gecikme" value={lateCount ? `${avgDelay} dk` : "—"} sub="Geç kalanlar" icon={TrendingUp} color="#8b5cf6" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="chart-card"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {isEmployee ? "Giriş nedenleri" : "Geç kalma analizi"}
                </h2>
                <p className="chart-card__subtitle">
                  Segment veya lejanda tıklayarak filtreleyin
                </p>
              </div>
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="filter-clear-btn"
                >
                  Filtreyi kaldır
                </button>
              )}
            </div>

            {donutSegments.length === 0 && !loading ? (
              <p className="chart-empty-text">
                Grafik için henüz giriş kaydı yok.
              </p>
            ) : (
            <DonutChart
              segments={donutSegments}
              total={checkIns.length}
              activeCategory={activeCategory}
              onSelect={handleDonutClick}
              centerLabel="Kayıt"
            />
            )}

            <div className="mt-5 space-y-2.5">
              {donutSegments.map(seg => {
                const cat = LATE_CATEGORIES[seg.key] || LATE_CATEGORIES.ontime;
                const isActive = activeCategory === seg.key;
                return (
                  <div
                    key={seg.key}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => handleDonutClick(seg.key)}
                  >
                    <span
                      className={`progress-label${isActive ? " progress-label--active" : ""}`}
                      style={isActive ? { "--cat-color": cat.color } : undefined}
                    >
                      {cat.label}
                    </span>
                    <div className="progress-track">
                      <motion.div
                        className={`progress-fill${isActive ? " progress-fill--active" : ""}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.pct * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{ "--cat-color": cat.color }}
                      />
                    </div>
                    <span
                      className={`progress-pct${isActive ? " progress-pct--active" : ""}`}
                      style={isActive ? { "--cat-color": cat.color } : undefined}
                    >
                      {Math.round(seg.pct * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="chart-card"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Varış zaman çizelgesi</h2>
                <p className="chart-card__subtitle">
                  30 dakikalık aralıklara göre giriş yoğunluğu
                </p>
              </div>
              <div className="badge-pill">
                <Calendar size={11} />
                Bugün
              </div>
            </div>

            <BarChart barData={barData} />

            {barData[0] && (
              <div className="peak-hour-box">
                <div className="peak-hour-box__icon">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">En yoğun saat: {barData[0].slot}</p>
                  <p className="chart-card__subtitle">
                    {barData[0].count} giriş kaydı
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {isEmployee ? "Giriş geçmişim" : "Geç kalanlar / girişler"}
                {activeCatMeta && (
                  <span
                    className="ml-2 category-badge text-xs"
                    style={{ "--cat-bg": activeCatMeta.bg, "--cat-color": activeCatMeta.color }}
                  >
                    {activeCatMeta.label}
                  </span>
                )}
              </h2>
              <p className="chart-card__subtitle">
                {filtered.length} kayıt · tarihe göre
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="filter-chip">
                <Filter size={11} />
                {activeCategory ? (LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).label : "Tümü"}
              </div>
            </div>
          </div>

          <div className="data-table-header">
            <span />
            <span>Çalışan</span>
            <span className="hidden sm:block">Neden</span>
            <span>Varış</span>
            <span>Gecikme</span>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="space-y-1.5">
              {filtered
                .slice()
                .sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.arrival.localeCompare(b.arrival))
                .map((emp, i) => (
                  <EmployeeRow key={emp.id} emp={emp} index={i} />
                ))}
            </div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="empty-state-icon">
              <Users size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {checkIns.length === 0
                  ? (isEmployee ? "Henüz giriş kaydınız yok." : "Henüz ekip girişi yok.")
                  : "Bu filtrede kayıt yok."}
              </p>
            </div>
          )}
        </motion.div>
        </>
        ) : null}

      </div>
    </Layout>
  );
}
