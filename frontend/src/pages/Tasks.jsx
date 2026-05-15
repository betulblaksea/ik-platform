// TasksPage.jsx
// Core Tasks page for HR platform — styled to match MorningChart.jsx
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss
// Place in: src/pages/TasksPage.jsx

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Plus, Zap, Users, BarChart3,
  TrendingUp, TrendingDown, Search, X, Flame, AlertTriangle,
  Star, Sparkles, ShieldAlert, Trophy, Activity, ChevronRight,
  Bell, Filter, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { Layout } from "../components/Sidebar";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const TEAMS = ["All", "Development", "Design", "Sales"];

const TASKS = [
  { id: 1,  team: "Development", employee: "Aiden Park",    avatar: "AP", title: "Refactor Auth Microservice",  status: "Done",        estimated: 8,  spent: 6   },
  { id: 2,  team: "Development", employee: "Sofia Reyes",   avatar: "SR", title: "Build REST API Endpoints",    status: "In Progress", estimated: 5,  spent: 6.5 },
  { id: 3,  team: "Development", employee: "Marcus Webb",   avatar: "MW", title: "Database Schema Migration",   status: "In Progress", estimated: 3,  spent: 2   },
  { id: 4,  team: "Development", employee: "Priya Nair",    avatar: "PN", title: "Integrate Payment Gateway",   status: "To Do",       estimated: 6,  spent: 0   },
  { id: 5,  team: "Development", employee: "Luca Ferretti", avatar: "LF", title: "Write Unit Test Suite",       status: "Done",        estimated: 4,  spent: 3   },
  { id: 6,  team: "Design",      employee: "Zoe Hartmann",  avatar: "ZH", title: "Redesign Onboarding Flow",    status: "Done",        estimated: 5,  spent: 4   },
  { id: 7,  team: "Design",      employee: "Omar Khalil",   avatar: "OK", title: "Create Component Library",    status: "In Progress", estimated: 10, spent: 13  },
  { id: 8,  team: "Design",      employee: "Isla Monroe",   avatar: "IM", title: "Brand Identity Refresh",      status: "In Progress", estimated: 7,  spent: 5   },
  { id: 9,  team: "Design",      employee: "Zoe Hartmann",  avatar: "ZH", title: "Mobile App Prototyping",      status: "To Do",       estimated: 4,  spent: 0   },
  { id: 10, team: "Design",      employee: "Omar Khalil",   avatar: "OK", title: "Accessibility Audit & Fixes", status: "Done",        estimated: 3,  spent: 2.5 },
  { id: 11, team: "Sales",       employee: "Nina Castillo", avatar: "NC", title: "Q3 Enterprise Outreach",      status: "In Progress", estimated: 4,  spent: 3   },
  { id: 12, team: "Sales",       employee: "Ben Okafor",    avatar: "BO", title: "Close Renewal — Acme Corp",   status: "Done",        estimated: 2,  spent: 3.5 },
  { id: 13, team: "Sales",       employee: "Jess Tanaka",   avatar: "JT", title: "Demo Deck — EMEA Region",     status: "Done",        estimated: 3,  spent: 2   },
  { id: 14, team: "Sales",       employee: "Nina Castillo", avatar: "NC", title: "Competitor Analysis Report",  status: "To Do",       estimated: 5,  spent: 0   },
  { id: 15, team: "Sales",       employee: "Ben Okafor",    avatar: "BO", title: "Lead Qualification Sprint",   status: "In Progress", estimated: 6,  spent: 7   },
];

const AVATAR_COLORS = {
  AP: "#60a5fa", SR: "#f472b6", MW: "#34d399", PN: "#a78bfa",
  LF: "#fbbf24", ZH: "#f472b6", OK: "#818cf8", IM: "#34d399",
  NC: "#60a5fa", BO: "#fbbf24", JT: "#a78bfa",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcEfficiency(task) {
  if (task.status === "To Do" || task.spent === 0) return null;
  return Math.round((task.estimated / task.spent) * 100);
}

function teamEfficiency(tasks) {
  const scored = tasks.filter(t => calcEfficiency(t) !== null);
  if (!scored.length) return null;
  return Math.round(scored.reduce((s, t) => s + calcEfficiency(t), 0) / scored.length);
}

function perfLabel(score) {
  if (score === null) return { label: "Pending",     color: "#6b7280", bg: "rgba(107,114,128,0.15)", icon: Circle        };
  if (score >= 115)   return { label: "Exceptional", color: "#34d399", bg: "rgba(52,211,153,0.15)",  icon: Star          };
  if (score >= 100)   return { label: "On Track",    color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  icon: TrendingUp    };
  if (score >= 80)    return { label: "Lagging",     color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  icon: AlertTriangle };
  return                     { label: "Critical",    color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: TrendingDown  };
}

const STATUS_META = {
  "Done":        { color: "#34d399", icon: CheckCircle2 },
  "In Progress": { color: "#818cf8", icon: Flame        },
  "To Do":       { color: "#6b7280", icon: Circle       },
};

// ── AI Analysis Engine ────────────────────────────────────────────────────────
// DB-ready: replace `tasks` param with your API/DB response anytime.
export function analyzeTeamPerformance(tasks) {
  const teamNames  = [...new Set(tasks.map(t => t.team))];
  const teamScores = teamNames.map(team => {
    const scored = tasks.filter(t => t.team === team && calcEfficiency(t) !== null);
    if (!scored.length) return null;
    return { team, avg: Math.round(scored.reduce((s, t) => s + calcEfficiency(t), 0) / scored.length) };
  }).filter(Boolean);

  const bottleneck = teamScores.length ? teamScores.reduce((min, t) => t.avg < min.avg ? t : min) : null;

  const employeeMap = {};
  tasks.forEach(t => {
    const eff = calcEfficiency(t);
    if (eff === null) return;
    if (!employeeMap[t.employee]) employeeMap[t.employee] = { scores: [], team: t.team };
    employeeMap[t.employee].scores.push(eff);
  });
  const employeeAvgs = Object.entries(employeeMap).map(([name, d]) => ({
    name, team: d.team,
    avg: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
  }));
  const star = employeeAvgs.length ? employeeAvgs.reduce((max, e) => e.avg > max.avg ? e : max) : null;

  const risks = tasks.filter(t =>
    t.status === "In Progress" && t.estimated > 0 && t.spent / t.estimated >= 0.9
  );

  return {
    bottleneck: bottleneck ? {
      team: bottleneck.team, avgEfficiency: bottleneck.avg, delta: 100 - bottleneck.avg,
      message: `${bottleneck.team} team is the current bottleneck at ${bottleneck.avg}% avg efficiency — ${100 - bottleneck.avg}% below target.`,
    } : null,
    star: star ? {
      employee: star.name, team: star.team, avgEfficiency: star.avg,
      message: `${star.name} (${star.team}) is the top performer at ${star.avg}% efficiency across all tasks.`,
    } : null,
    risks: risks.map(t => ({
      id: t.id, employee: t.employee, title: t.title, team: t.team,
      burnPct: Math.round((t.spent / t.estimated) * 100),
      message: `"${t.title}" by ${t.employee} has consumed ${Math.round((t.spent / t.estimated) * 100)}% of its budget with status still In Progress.`,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ── AI Coach Card ─────────────────────────────────────────────────────────────
function AICoachCard({ tasks }) {
  const insights   = useMemo(() => analyzeTeamPerformance(tasks), [tasks]);
  const [open, setOpen] = useState(true);

  const bullets = [
    insights.bottleneck && { key: "bottleneck", icon: ShieldAlert, color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)",  label: "Bottleneck",    text: insights.bottleneck.message },
    insights.star        && { key: "star",        icon: Trophy,      color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",   label: "Star Performer", text: insights.star.message       },
    ...(insights.risks.length > 0
      ? insights.risks.slice(0, 2).map(r => ({ key: `risk-${r.id}`, icon: Activity, color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)", label: `Risk · ${r.burnPct}% burned`, text: r.message }))
      : [{ key: "clear", icon: CheckCircle2, color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)", label: "All Clear", text: "No tasks approaching their time budget. Everything looks healthy!" }]
    ),
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.06) 100%)",
        border: "1px solid rgba(139,92,246,0.28)",
        boxShadow: "0 0 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Glow orb */}
      <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />

      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)" }}
      />

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />

      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer relative" onClick={() => setOpen(o => !o)}>
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{ inset: "-5px", background: "rgba(139,92,246,0.35)" }}
          />
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 0 20px rgba(139,92,246,0.2)" }}>
            <Sparkles size={17} style={{ color: "#c084fc" }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white tracking-tight">AI Team Coach</span>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              LIVE
            </motion.div>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {bullets.length} insight{bullets.length !== 1 ? "s" : ""} · Updated just now
          </p>
        </div>

        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}
          style={{ color: "rgba(255,255,255,0.3)" }}>
          <ChevronRight size={16} />
        </motion.div>
      </div>

      {/* Bullets */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 space-y-2.5">
              <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />
              {bullets.map((b, i) => {
                const BIcon = b.icon;
                return (
                  <motion.div
                    key={b.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-3 rounded-xl px-3.5 py-3"
                    style={{ background: b.bg, border: `1px solid ${b.border}` }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${b.color}18`, border: `1px solid ${b.color}30` }}>
                      <BIcon size={13} style={{ color: b.color }} />
                    </div>
                    <div>
                      <p className="font-bold mb-1 tracking-widest uppercase"
                        style={{ color: b.color, fontSize: "9px", letterSpacing: "0.12em" }}>{b.label}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{b.text}</p>
                    </div>
                  </motion.div>
                );
              })}
              <p className="pt-1" style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>
                Analysis via <code style={{ color: "rgba(255,255,255,0.25)" }}>analyzeTeamPerformance(tasks)</code> — swap with your DB response to go live.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, sub, icon: Icon, color, trend }) {
  const TrendIcon  = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? "#ef4444"    : trend < 0 ? "#34d399"      : "#94a3b8";
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
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

// ── Team Efficiency Badge ─────────────────────────────────────────────────────
function TeamEfficiencyBadge({ score }) {
  if (score === null) return null;
  const perf = perfLabel(score);
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: perf.bg, border: `1px solid ${perf.color}44`, color: perf.color }}>
      <Zap size={11} />
      Team Avg: {score}%
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, index }) {
  const efficiency  = calcEfficiency(task);
  const perf        = perfLabel(efficiency);
  const status      = STATUS_META[task.status];
  const StatusIcon  = status.icon;
  const PerfIcon    = perf.icon;
  const avatarColor = AVATAR_COLORS[task.avatar] || "#818cf8";
  const barMax      = Math.max(task.estimated, task.spent, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 relative overflow-hidden cursor-default"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 0.2s, background 0.2s",
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${perf.color}44, transparent)` }} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex gap-2.5 items-center min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: `${avatarColor}18`, color: avatarColor, border: `1px solid ${avatarColor}30` }}>
            {task.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-snug">{task.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{task.employee}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${status.color}18`, border: `1px solid ${status.color}33`, color: status.color }}>
            <StatusIcon size={10} />
            {task.status}
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: perf.bg, border: `1px solid ${perf.color}44`, color: perf.color }}>
            <PerfIcon size={10} />
            {efficiency !== null ? `${efficiency}% ` : ""}{perf.label}
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2.5">
        {[
          { label: "ESTIMATED", value: task.estimated, pct: (task.estimated / barMax) * 100, barColor: "linear-gradient(90deg,#334155,#64748b)", textColor: "rgba(255,255,255,0.5)", delay: 0.3 },
          { label: "TIME SPENT", value: task.spent,    pct: (task.spent / barMax) * 100,
            barColor: efficiency === null ? "rgba(107,114,128,0.4)" : efficiency >= 100 ? "linear-gradient(90deg,#059669,#34d399)" : efficiency >= 80 ? "linear-gradient(90deg,#d97706,#fbbf24)" : "linear-gradient(90deg,#dc2626,#f87171)",
            textColor: perf.color, delay: 0.4 },
        ].map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between mb-1">
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>{bar.label}</span>
              <span className="text-xs font-bold" style={{ color: bar.textColor }}>{bar.value}d</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.pct}%` }}
                transition={{ delay: index * 0.05 + bar.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: bar.barColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────────────────────
function AddTaskModal({ team, onClose, onAdd }) {
  const [form, setForm] = useState({ employee: "", title: "", status: "To Do", estimated: 3, spent: 0 });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.employee || !form.title) return;
    const initials = form.employee.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    onAdd({ ...form, team, avatar: initials, id: Date.now(), estimated: +form.estimated, spent: +form.spent });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(6,6,15,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-7 w-[420px]"
        style={{
          background: "#0d0d1f", border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-base font-bold text-white">Add Task — {team}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {[
          { label: "Employee Name",  key: "employee",  type: "text",   placeholder: "e.g. Sarah Chen" },
          { label: "Task Title",     key: "title",     type: "text",   placeholder: "e.g. Design Sprint Kickoff" },
          { label: "Estimated Days", key: "estimated", type: "number", placeholder: "5" },
          { label: "Days Spent",     key: "spent",     type: "number", placeholder: "0" },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <label className="block mb-1.5 font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "0.14em" }}>{f.label}</label>
            <input
              type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => up(f.key, e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        ))}

        <div className="mb-6">
          <label className="block mb-1.5 font-semibold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "0.14em" }}>Status</label>
          <div className="flex gap-2">
            {["To Do", "In Progress", "Done"].map(s => (
              <button key={s} onClick={() => up("status", s)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: form.status === s ? `${STATUS_META[s].color}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${form.status === s ? STATUS_META[s].color + "55" : "rgba(255,255,255,0.08)"}`,
                  color: form.status === s ? STATUS_META[s].color : "rgba(255,255,255,0.35)",
                }}>{s}</button>
            ))}
          </div>
        </div>

        <button onClick={handleAdd}
          className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", border: "none" }}>
          Add Task
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks,      setTasks]      = useState(TASKS);
  const [activeTeam, setActiveTeam] = useState("All");
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [modalTeam,  setModalTeam]  = useState("Development");

  const globalStats = useMemo(() => {
    const active = tasks.filter(t => t.status === "In Progress").length;
    const done   = tasks.filter(t => t.status === "Done").length;
    const todo   = tasks.filter(t => t.status === "To Do").length;
    const all    = tasks.filter(t => calcEfficiency(t) !== null);
    const avg    = all.length ? Math.round(all.reduce((s, t) => s + calcEfficiency(t), 0) / all.length) : 0;
    return { active, done, todo, total: tasks.length, avg };
  }, [tasks]);

  const filteredTeams = useMemo(() => {
    const teams = activeTeam === "All" ? ["Development", "Design", "Sales"] : [activeTeam];
    return teams.map(team => {
      const teamTasks = tasks
        .filter(t => t.team === team)
        .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.employee.toLowerCase().includes(search.toLowerCase()));
      return { team, tasks: teamTasks, efficiency: teamEfficiency(teamTasks) };
    }).filter(g => g.tasks.length > 0);
  }, [tasks, activeTeam, search]);

  const openModal = team => { setModalTeam(team); setShowModal(true); };
  const addTask   = task  => setTasks(prev => [...prev, task]);

  return (
    <Layout>
      {/* ── Topbar — matches MorningChart header exactly ── */}
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
          <h1 className="text-xl font-bold text-white tracking-tight">Task Management</h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Track team efficiency · Real-time performance metrics
          </p>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live — synced now
        </div>

        {/* Bell */}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center relative"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
          <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
        </button>

        {/* Add Task CTA */}
        <button
          onClick={() => openModal(activeTeam === "All" ? "Development" : activeTeam)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}
        >
          <Plus size={14} /> Add Task
        </button>
      </header>

      {/* ── Page body ── */}
      <div className="px-8 py-7 flex-1 space-y-6"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* AI Coach */}
        <AICoachCard tasks={tasks} />

        {/* KPI row */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatPill label="Total Tasks"    value={globalStats.total}      sub={`${globalStats.todo} pending`}                                            icon={BarChart3}    color="#818cf8" trend={0}  />
          <StatPill label="In Progress"    value={globalStats.active}     sub="across all teams"                                                         icon={Flame}        color="#f472b6" trend={1}  />
          <StatPill label="Completed"      value={globalStats.done}       sub="this sprint"                                                              icon={CheckCircle2} color="#34d399" trend={-1} />
          <StatPill label="Avg Efficiency" value={`${globalStats.avg}%`}  sub={globalStats.avg >= 100 ? "On target" : "Below target"} icon={Zap}         color="#fbbf24"     trend={globalStats.avg >= 100 ? -1 : 1} />
        </motion.div>

        {/* Filters + Search */}
        <motion.div className="flex gap-3 items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {/* Team tabs */}
          <div className="flex gap-1 rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {TEAMS.map(t => (
              <button key={t} onClick={() => setActiveTeam(t)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: activeTeam === t ? "rgba(99,102,241,0.25)" : "transparent",
                  border:     activeTeam === t ? "1px solid rgba(99,102,241,0.5)" : "1px solid transparent",
                  color:      activeTeam === t ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                }}>{t}</button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks or employees…"
              className="w-full rounded-xl py-2 pl-9 pr-4 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Filter chip */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
            <Filter size={11} />
            {activeTeam === "All" ? "All teams" : activeTeam}
          </div>
        </motion.div>

        {/* Team sections */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTeam} className="space-y-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filteredTeams.map(({ team, tasks: tTasks, efficiency }) => (
              <motion.div
                key={team}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Team header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span className="text-sm font-bold text-white tracking-tight">{team}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                      {tTasks.length} tasks
                    </span>
                    <TeamEfficiencyBadge score={efficiency} />
                  </div>
                  <button onClick={() => openModal(team)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>
                    <Plus size={11} /> Add task
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px mb-5"
                  style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.25), transparent)" }} />

                {/* Task grid */}
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                  <AnimatePresence>
                    {tTasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredTeams.length === 0 && (
          <div className="py-16 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
            <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks match your search.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && <AddTaskModal team={modalTeam} onClose={() => setShowModal(false)} onAdd={addTask} />}
      </AnimatePresence>
    </Layout>
  );
}