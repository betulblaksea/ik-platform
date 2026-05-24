// MorningChart.jsx
// Daily Analytics page.
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss
// Place in: src/pages/MorningChart.jsx

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Clock,
  Users, TrendingUp, AlertTriangle,
  Bell, Calendar, Filter,
  ArrowUpRight, ArrowDownRight, Minus,
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


// ─── SVG Donut ────────────────────────────────────────────────────────────────
const DONUT_R   = 70;
const DONUT_CX  = 90;
const DONUT_CY  = 90;
const STROKE_W  = 22;
const CIRCUM    = 2 * Math.PI * DONUT_R;

function polarToXY(cx, cy, r, pct) {
  const angle = pct * 2 * Math.PI - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

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
      style={{
        cursor: "pointer",
        filter: isActive ? `drop-shadow(0 0 10px ${cat.color})` : "none",
        transition: "stroke-width 0.25s ease, filter 0.25s ease",
      }}
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
      <div className="relative" style={{ width: 180, height: 180 }}>
        <svg viewBox="0 0 180 180" width="180" height="180">
          {/* Track */}
          <circle
            cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE_W}
          />
          {/* Segments */}
          {segments.map(seg => (
            <DonutArc
              key={seg.key}
              segment={seg}
              isActive={activeCategory === seg.key}
              onClick={onSelect}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {cat ? (
            <>
              <span className="text-2xl font-bold text-white">{active.count}</span>
              <span className="text-xs mt-0.5" style={{ color: cat.color }}>{cat.label}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">{total}</span>
              <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{centerLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 mt-4 w-full px-2">
        {segments.map(seg => {
          const c = LATE_CATEGORIES[seg.key] || LATE_CATEGORIES.ontime;
          const isActive = activeCategory === seg.key;
          return (
            <button
              key={seg.key}
              onClick={() => onSelect(seg.key)}
              className="flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-all"
              style={{
                background: isActive ? c.bg : "transparent",
                border: `1px solid ${isActive ? c.color + "44" : "transparent"}`,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className="text-xs truncate" style={{ color: isActive ? c.color : "rgba(255,255,255,0.5)" }}>
                {c.label}
              </span>
              <span className="ml-auto text-xs font-bold" style={{ color: isActive ? c.color : "rgba(255,255,255,0.3)" }}>
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ barData }) {
  const [hovered, setHovered] = useState(null);
  const BAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"];
  const barMax = Math.max(...barData.map((d) => d.count), 1);

  if (barData.length === 0) {
    return (
      <div className="py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
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
              {/* Tooltip */}
              <AnimatePresence>
                {isHov && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                    style={{
                      background: color + "22",
                      border: `1px solid ${color}44`,
                      color,
                    }}
                  >
                    {d.count} arrivals
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar */}
              <div className="w-full relative flex items-end" style={{ height: "100px" }}>
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: `linear-gradient(180deg, ${color} 0%, ${color}55 100%)`,
                    boxShadow: isHov ? `0 0 18px ${color}66` : `0 0 8px ${color}33`,
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  {/* Shimmer */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
                    }}
                  />
                </motion.div>
              </div>

              {/* Label */}
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                {d.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Gridlines label */}
      <div className="flex justify-between mt-3 px-1">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Departmanlara göre dağılım</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Canlı çalışan listesi</span>
      </div>
    </div>
  );
}

// ─── Çalışan: kendi giriş geçmişi satırı ─────────────────────────────────────
function PersonalHistoryRow({ record, index }) {
  const cat = LATE_CATEGORIES[record.category] || LATE_CATEGORIES.ontime;
  const Icon = cat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{record.date}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {record.arrival} giriş
          {record.departure ? ` · ${record.departure} çıkış` : ""}
          {record.daySummary ? " · özet var" : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}>
        <Icon size={11} />
        {cat.label}
      </div>
      <span className="text-xs font-semibold w-24 text-right" style={{ color: deltaColor(record.delta) }}>
        {formatDelta(record.delta)}
      </span>
    </motion.div>
  );
}

// ─── Employee Row (yönetici görünümü) ─────────────────────────────────────────
function EmployeeRow({ emp, index }) {
  const cat = LATE_CATEGORIES[emp.category] || LATE_CATEGORIES.ontime;
  const Icon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl group transition-all"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
      >
        {emp.avatar}
      </div>

      {/* Name & dept */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{emp.dept}</p>
      </div>

      {/* Category badge */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
      >
        <Icon size={11} />
        {cat.label}
      </div>

      <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
        <Clock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="font-mono font-semibold text-white">{emp.arrival}</span>
      </div>

      <div
        className="text-xs font-semibold flex-shrink-0 w-28 text-right"
        style={{ color: deltaColor(emp.delta) }}
      >
        {formatDelta(emp.delta)}
      </div>
    </motion.div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, sub, icon: Icon, color, trend }) {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? "#ef4444" : trend < 0 ? "#34d399" : "#94a3b8";

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="flex items-center gap-1">
        <TrendIcon size={12} style={{ color: trendColor }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── MorningChart Page ────────────────────────────────────────────────────────
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

  return (
    <Layout>
      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-20 px-8 py-4 flex items-center gap-4"
        style={{
          background: "rgba(6,6,15,0.82)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isEmployee ? "Çalışma Saatlerim" : "Sabah Analizi"}
          </h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{TODAY}</p>
        </div>
        {!isEmployee ? (
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
          </button>
        ) : null}
      </header>

      {/* ── Page body ── */}
      <div
        className="px-8 py-7 flex-1 space-y-6"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >

        {error ? (
          <div className="rounded-xl px-4 py-3 text-sm text-red-200"
            style={{ background: "rgba(127,29,29,0.35)", border: "1px solid rgba(248,113,113,0.35)" }}>
            {error}
          </div>
        ) : null}

        {isEmployee ? (
          <>
            <WorkTimeLogForm todayRecord={todayRecord} onSave={handleSaveCheckIn} saving={saving} />
            {checkIns.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h2 className="text-sm font-bold text-white mb-1">Giriş geçmişim</h2>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Son kayıtlarınız
                </p>
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

        {/* ── KPI row ── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatPill label={isEmployee ? "Toplam kayıt" : "Giriş kaydı"} value={checkIns.length} sub="Son 30 gün" icon={Users} color="#3b82f6" trend={0} />
          <StatPill label="Zamanında" value={onTimeCount} sub="Gecikmesiz" icon={Clock} color="#10b981" trend={-1} />
          <StatPill label="Geç kalma" value={lateCount} sub="Kayıtlı gecikme" icon={AlertTriangle} color="#f59e0b" trend={1} />
          <StatPill label="Ort. gecikme" value={lateCount ? `${avgDelay} dk` : "—"} sub="Geç kalanlar" icon={TrendingUp} color="#8b5cf6" trend={-1} />
        </motion.div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {isEmployee ? "Giriş nedenleri" : "Geç kalma analizi"}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Segment veya lejanda tıklayarak filtreleyin
                </p>
              </div>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Filtreyi kaldır
                </button>
              )}
            </div>

            {donutSegments.length === 0 && !loading ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
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
                  <div key={seg.key}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => handleDonutClick(seg.key)}
                  >
                    <span className="text-xs w-16 text-right flex-shrink-0"
                      style={{ color: isActive ? cat.color : "rgba(255,255,255,0.35)" }}>
                      {cat.label}
                    </span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.pct * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          background: cat.color,
                          boxShadow: isActive ? `0 0 8px ${cat.color}` : "none",
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold flex-shrink-0 w-8 text-right"
                      style={{ color: isActive ? cat.color : "rgba(255,255,255,0.4)" }}>
                      {Math.round(seg.pct * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Varış zaman çizelgesi</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  30 dakikalık aralıklara göre giriş yoğunluğu
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#818cf8",
                }}
              >
                <Calendar size={11} />
                Today
              </div>
            </div>

            <BarChart barData={barData} />

            {barData[0] && (
              <div
                className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(168,85,247,0.07)",
                  border: "1px solid rgba(168,85,247,0.15)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(168,85,247,0.15)" }}>
                  <TrendingUp size={14} style={{ color: "#c084fc" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">En kalabalık departman: {barData[0].slot}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {barData[0].count} çalışan bu departmanda
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Employee list ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {isEmployee ? "Giriş geçmişim" : "Geç kalanlar / girişler"}
                {activeCategory && (
                  <span
                    className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: (LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).bg,
                      color: (LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).color,
                      border: `1px solid ${(LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).color}30`,
                    }}
                  >
                    {(LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).label}
                  </span>
                )}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {filtered.length} kayıt · tarihe göre
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <Filter size={11} />
                {activeCategory ? (LATE_CATEGORIES[activeCategory] || LATE_CATEGORIES.ontime).label : "Tümü"}
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div
            className="grid gap-4 px-4 pb-2 mb-2 text-xs font-semibold tracking-widest uppercase"
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "9px",
              letterSpacing: "0.14em",
              gridTemplateColumns: "2rem 1fr auto auto auto",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span />
            <span>Çalışan</span>
            <span className="hidden sm:block">Neden</span>
            <span>Varış</span>
            <span>Gecikme</span>
          </div>

          {/* Rows */}
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
            <div className="py-12 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
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