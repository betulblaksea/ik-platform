// MorningChart.jsx
// Daily Analytics page for HR platform.
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss
// Place in: src/pages/MorningChart.jsx

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Car, HeartPulse, Home, Cpu,
  Clock, Users, TrendingUp, AlertTriangle,
  ChevronRight, Bell, Calendar, Filter,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { Layout } from "../components/Sidebar";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const CATEGORIES = {
  traffic:   { label: "Traffic",   color: "#ef4444", glow: "rgba(239,68,68,0.4)",    icon: Car,       bg: "rgba(239,68,68,0.1)"   },
  health:    { label: "Health",    color: "#f59e0b", glow: "rgba(245,158,11,0.4)",   icon: HeartPulse, bg: "rgba(245,158,11,0.1)"  },
  family:    { label: "Family",    color: "#3b82f6", glow: "rgba(59,130,246,0.4)",   icon: Home,      bg: "rgba(59,130,246,0.1)"  },
  technical: { label: "Technical", color: "#a855f7", glow: "rgba(168,85,247,0.4)",   icon: Cpu,       bg: "rgba(168,85,247,0.1)"  },
};

const employees = [
  { id: 1,  name: "Aria Nakamura",  dept: "Engineering",    category: "traffic",   arrival: "08:47", avatar: "AN", delta: +12 },
  { id: 2,  name: "Ethan Cross",    dept: "Engineering",    category: "technical", arrival: "09:15", avatar: "EC", delta: +45 },
  { id: 3,  name: "Sofia Reyes",    dept: "DevOps",         category: "traffic",   arrival: "09:33", avatar: "SR", delta: +63 },
  { id: 4,  name: "Liam Okafor",    dept: "Frontend",       category: "family",    arrival: "10:02", avatar: "LO", delta: +92 },
  { id: 5,  name: "Maya Chen",      dept: "QA",             category: "health",    arrival: "09:48", avatar: "MC", delta: +78 },
  { id: 6,  name: "Zara Ahmed",     dept: "Security",       category: "traffic",   arrival: "08:52", avatar: "ZA", delta: +22 },
  { id: 7,  name: "Noah Park",      dept: "Security",       category: "health",    arrival: "09:20", avatar: "NP", delta: +50 },
  { id: 8,  name: "Isla Torres",    dept: "SOC",            category: "family",    arrival: "09:55", avatar: "IT", delta: +85 },
  { id: 9,  name: "Ryo Matsuda",    dept: "Compliance",     category: "technical", arrival: "10:10", avatar: "RM", delta: +100},
  { id: 10, name: "Luna Silva",     dept: "Design",         category: "traffic",   arrival: "08:41", avatar: "LS", delta: +11 },
  { id: 11, name: "Finn Walsh",     dept: "UX",             category: "health",    arrival: "09:05", avatar: "FW", delta: +35 },
  { id: 12, name: "Cleo Bauer",     dept: "Motion",         category: "family",    arrival: "09:38", avatar: "CB", delta: +68 },
  { id: 13, name: "Omar Farsi",     dept: "Data Science",   category: "technical", arrival: "09:50", avatar: "OF", delta: +80 },
  { id: 14, name: "Hana Patel",     dept: "BI",             category: "traffic",   arrival: "09:12", avatar: "HP", delta: +42 },
  { id: 15, name: "Joel Stroud",    dept: "ML",             category: "health",    arrival: "10:05", avatar: "JS", delta: +95 },
  { id: 16, name: "Kai Brennan",    dept: "Infrastructure", category: "family",    arrival: "08:30", avatar: "KB", delta: 0   },
  { id: 17, name: "Drew Larson",    dept: "Operations",     category: "technical", arrival: "09:27", avatar: "DL", delta: +57 },
  { id: 18, name: "Amara Diop",     dept: "Operations",     category: "traffic",   arrival: "09:44", avatar: "AD", delta: +74 },
];

// Bar chart time slots
const BAR_DATA = [
  { time: "08:00", count: 3,  slot: "08:00–08:29" },
  { time: "08:30", count: 5,  slot: "08:30–08:59" },
  { time: "09:00", count: 6,  slot: "09:00–09:29" },
  { time: "09:30", count: 7,  slot: "09:30–09:59" },
  { time: "10:00", count: 4,  slot: "10:00–10:30" },
];
const BAR_MAX = Math.max(...BAR_DATA.map(d => d.count));

// Derived donut data
function buildDonutSegments() {
  const counts = { traffic: 0, health: 0, family: 0, technical: 0 };
  employees.forEach(e => counts[e.category]++);
  const total = employees.length;
  let cumulative = 0;
  return Object.entries(counts).map(([key, count]) => {
    const pct = count / total;
    const seg = { key, count, pct, offset: cumulative };
    cumulative += pct;
    return seg;
  });
}
const DONUT_SEGMENTS = buildDonutSegments();

// AI insights
const AI_INSIGHTS = [
  { icon: Car,       color: "#ef4444", text: "Traffic delays account for 33% of late arrivals today — notably high. Consider pushing the 10:00 AM all-hands by 15 minutes." },
  { icon: HeartPulse,color: "#f59e0b", text: "Health-related absences spiked vs. last Monday (+18%). HR may want to follow up with the QA and ML teams proactively." },
  { icon: TrendingUp, color: "#10b981", text: "Average arrival time improved by 4 minutes week-over-week. Flex-start pilot appears to be working." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDelta(d) {
  if (d === 0) return "On time";
  return `+${d} min late`;
}

function deltaColor(d) {
  if (d === 0) return "#34d399";
  if (d < 30) return "#f59e0b";
  return "#ef4444";
}

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
  const cat = CATEGORIES[segment.key];
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

function DonutChart({ activeCategory, onSelect }) {
  const active = DONUT_SEGMENTS.find(s => s.key === activeCategory);
  const cat    = active ? CATEGORIES[active.key] : null;

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
          {DONUT_SEGMENTS.map(seg => (
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
              <span className="text-2xl font-bold text-white">{employees.length}</span>
              <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Late today</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 mt-4 w-full px-2">
        {DONUT_SEGMENTS.map(seg => {
          const c = CATEGORIES[seg.key];
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
function BarChart() {
  const [hovered, setHovered] = useState(null);
  const BAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"];

  return (
    <div className="w-full">
      <div className="flex items-end gap-2.5 h-36 w-full px-1">
        {BAR_DATA.map((d, i) => {
          const heightPct = (d.count / BAR_MAX) * 100;
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
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Arrival slots (30-min windows)</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>Peak: 09:30–09:59</span>
      </div>
    </div>
  );
}

// ─── Employee Row ─────────────────────────────────────────────────────────────
function EmployeeRow({ emp, index }) {
  const cat = CATEGORIES[emp.category];
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

      {/* Arrival time */}
      <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
        <Clock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="font-mono font-semibold text-white">{emp.arrival}</span>
      </div>

      {/* Delta */}
      <div
        className="text-xs font-semibold flex-shrink-0 w-24 text-right"
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
  const [activeCategory, setActiveCategory] = useState(null);
  const [insightIdx,     setInsightIdx]     = useState(0);

  // Rotate AI insights
  useEffect(() => {
    const id = setInterval(() => setInsightIdx(i => (i + 1) % AI_INSIGHTS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = activeCategory
    ? employees.filter(e => e.category === activeCategory)
    : employees;

  const handleDonutClick = (key) => {
    setActiveCategory(prev => prev === key ? null : key);
  };

  const insight = AI_INSIGHTS[insightIdx];
  const InsightIcon = insight.icon;

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
          <h1 className="text-xl font-bold text-white tracking-tight">Morning Chart</h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{TODAY}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live — refreshed 2 min ago
        </div>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center relative"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
        </button>
      </header>

      {/* ── Page body ── */}
      <div
        className="px-8 py-7 flex-1 space-y-6"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >

        {/* ── AI Insight Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(99,102,241,0.06) 100%)",
            border: "1px solid rgba(168,85,247,0.28)",
            boxShadow: "0 0 60px rgba(168,85,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />

          <div className="flex items-start gap-4 relative">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: "rgba(168,85,247,0.15)",
                border: "1px solid rgba(168,85,247,0.35)",
                boxShadow: "0 0 20px rgba(168,85,247,0.2)",
              }}
            >
              <Sparkles size={17} style={{ color: "#c084fc" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#c084fc", fontSize: "9px", letterSpacing: "0.16em" }}
                >
                  AI Insight · Daily Summary
                </span>
                {/* Dot indicators */}
                <div className="flex gap-1 ml-auto">
                  {AI_INSIGHTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setInsightIdx(i)}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{
                        background: i === insightIdx ? "#c084fc" : "rgba(255,255,255,0.2)",
                        transform: i === insightIdx ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={insightIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${insight.color}20`, border: `1px solid ${insight.color}30` }}
                  >
                    <InsightIcon size={13} style={{ color: insight.color }} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                    {insight.text}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)" }}
          />
        </motion.div>

        {/* ── KPI row ── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatPill label="Late Today"      value={employees.length}  sub="+3 vs yesterday"    icon={AlertTriangle} color="#ef4444" trend={1}  />
          <StatPill label="Avg Delay"       value="54 min"            sub="−4 min vs last Mon" icon={Clock}         color="#f59e0b" trend={-1} />
          <StatPill label="Total Workforce" value="142"               sub="18 affected (12%)"  icon={Users}         color="#3b82f6" trend={0}  />
          <StatPill label="On Time Rate"    value="87.3%"             sub="+2.1pp this week"   icon={TrendingUp}    color="#10b981" trend={-1} />
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
                <h2 className="text-sm font-bold text-white tracking-tight">Late Arrival Analysis</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Click a segment or legend to filter
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
                  Clear filter
                </button>
              )}
            </div>

            <DonutChart activeCategory={activeCategory} onSelect={handleDonutClick} />

            {/* Category breakdown bars */}
            <div className="mt-5 space-y-2.5">
              {DONUT_SEGMENTS.map(seg => {
                const cat = CATEGORIES[seg.key];
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
                <h2 className="text-sm font-bold text-white tracking-tight">Office Entry Timeline</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Arrivals by 30-minute window
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

            <BarChart />

            {/* Peak callout */}
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
                <p className="text-xs font-semibold text-white">Peak window: 09:30–09:59</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  7 employees arrived — highest concentration today
                </p>
              </div>
            </div>
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
                Late Employees
                {activeCategory && (
                  <span
                    className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: CATEGORIES[activeCategory].bg,
                      color: CATEGORIES[activeCategory].color,
                      border: `1px solid ${CATEGORIES[activeCategory].color}30`,
                    }}
                  >
                    {CATEGORIES[activeCategory].label}
                  </span>
                )}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {filtered.length} employee{filtered.length !== 1 ? "s" : ""} · sorted by arrival time
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
                {activeCategory ? CATEGORIES[activeCategory].label : "All reasons"}
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
            <span>Employee</span>
            <span className="hidden sm:block">Reason</span>
            <span>Arrival</span>
            <span>Delay</span>
          </div>

          {/* Rows */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-1.5">
              {filtered
                .slice()
                .sort((a, b) => a.arrival.localeCompare(b.arrival))
                .map((emp, i) => (
                  <EmployeeRow key={emp.id} emp={emp} index={i} />
                ))}
            </div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-12 text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
              <Users size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No employees in this category</p>
            </div>
          )}
        </motion.div>

      </div>
    </Layout>
  );
}