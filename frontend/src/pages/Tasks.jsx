import { useState, useMemo } from "react";
import { Layout } from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, Circle, ChevronRight, Plus, Zap,
  Users, BarChart3, Timer, TrendingUp, TrendingDown,
  Filter, Search, X, Flame, AlertTriangle, Star, Sparkles,
  ShieldAlert, Trophy, Activity
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────────────────────
const TEAMS = ["All", "Development", "Design", "Sales"];

const TASKS = [
  // Development
  { id: 1, team: "Development", employee: "Aiden Park", avatar: "AP", title: "Refactor Auth Microservice", status: "Done", estimated: 8, spent: 6 },
  { id: 2, team: "Development", employee: "Sofia Reyes", avatar: "SR", title: "Build REST API Endpoints", status: "In Progress", estimated: 5, spent: 6.5 },
  { id: 3, team: "Development", employee: "Marcus Webb", avatar: "MW", title: "Database Schema Migration", status: "In Progress", estimated: 3, spent: 2 },
  { id: 4, team: "Development", employee: "Priya Nair", avatar: "PN", title: "Integrate Payment Gateway", status: "To Do", estimated: 6, spent: 0 },
  { id: 5, team: "Development", employee: "Luca Ferretti", avatar: "LF", title: "Write Unit Test Suite", status: "Done", estimated: 4, spent: 3 },
  // Design
  { id: 6, team: "Design", employee: "Zoe Hartmann", avatar: "ZH", title: "Redesign Onboarding Flow", status: "Done", estimated: 5, spent: 4 },
  { id: 7, team: "Design", employee: "Omar Khalil", avatar: "OK", title: "Create Component Library", status: "In Progress", estimated: 10, spent: 13 },
  { id: 8, team: "Design", employee: "Isla Monroe", avatar: "IM", title: "Brand Identity Refresh", status: "In Progress", estimated: 7, spent: 5 },
  { id: 9, team: "Design", employee: "Zoe Hartmann", avatar: "ZH", title: "Mobile App Prototyping", status: "To Do", estimated: 4, spent: 0 },
  { id: 10, team: "Design", employee: "Omar Khalil", avatar: "OK", title: "Accessibility Audit & Fixes", status: "Done", estimated: 3, spent: 2.5 },
  // Sales
  { id: 11, team: "Sales", employee: "Nina Castillo", avatar: "NC", title: "Q3 Enterprise Outreach", status: "In Progress", estimated: 4, spent: 3 },
  { id: 12, team: "Sales", employee: "Ben Okafor", avatar: "BO", title: "Close Renewal — Acme Corp", status: "Done", estimated: 2, spent: 3.5 },
  { id: 13, team: "Sales", employee: "Jess Tanaka", avatar: "JT", title: "Demo Deck — EMEA Region", status: "Done", estimated: 3, spent: 2 },
  { id: 14, team: "Sales", employee: "Nina Castillo", avatar: "NC", title: "Competitor Analysis Report", status: "To Do", estimated: 5, spent: 0 },
  { id: 15, team: "Sales", employee: "Ben Okafor", avatar: "BO", title: "Lead Qualification Sprint", status: "In Progress", estimated: 6, spent: 7 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
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
  if (score === null) return { label: "Pending", color: "#6b7280", bg: "rgba(107,114,128,0.15)", icon: Circle };
  if (score >= 115) return { label: "Exceptional", color: "#34d399", bg: "rgba(52,211,153,0.15)", icon: Star };
  if (score >= 100) return { label: "On Track", color: "#60a5fa", bg: "rgba(96,165,250,0.15)", icon: TrendingUp };
  if (score >= 80)  return { label: "Lagging",   color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  icon: AlertTriangle };
  return              { label: "Critical",  color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: TrendingDown };
}

// ── AI ANALYSIS ENGINE ────────────────────────────────────────────────────────
// Database-ready: swap `tasks` param with your API response shape anytime.
// Returns a structured insights object — connect to any backend by replacing
// the input array with: const tasks = await fetchTasksFromDB();

export function analyzeTeamPerformance(tasks) {
  // ── 1. BOTTLENECK: lowest average team efficiency ─────────────────────────
  const teamNames = [...new Set(tasks.map(t => t.team))];
  const teamScores = teamNames
    .map(team => {
      const scored = tasks.filter(t => t.team === team && calcEfficiency(t) !== null);
      if (!scored.length) return null;
      const avg = Math.round(scored.reduce((s, t) => s + calcEfficiency(t), 0) / scored.length);
      return { team, avg };
    })
    .filter(Boolean);

  const bottleneck = teamScores.length
    ? teamScores.reduce((min, t) => (t.avg < min.avg ? t : min))
    : null;

  // ── 2. STAR PERFORMER: highest efficiency across all employees ────────────
  const employeeMap = {};
  tasks.forEach(t => {
    const eff = calcEfficiency(t);
    if (eff === null) return;
    if (!employeeMap[t.employee]) employeeMap[t.employee] = { scores: [], team: t.team };
    employeeMap[t.employee].scores.push(eff);
  });

  const employeeAvgs = Object.entries(employeeMap).map(([name, data]) => ({
    name,
    team: data.team,
    avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
  }));

  const star = employeeAvgs.length
    ? employeeAvgs.reduce((max, e) => (e.avg > max.avg ? e : max))
    : null;

  // ── 3. RISK ALERTS: In Progress tasks ≥ 90% of estimated time consumed ────
  const risks = tasks.filter(t =>
    t.status === "In Progress" &&
    t.estimated > 0 &&
    t.spent / t.estimated >= 0.9
  );

  // ── Compose structured insights (DB-ready shape) ──────────────────────────
  return {
    bottleneck: bottleneck
      ? {
          team: bottleneck.team,
          avgEfficiency: bottleneck.avg,
          delta: 100 - bottleneck.avg, // how many % points below 100%
          message: `${bottleneck.team} team is the current bottleneck at ${bottleneck.avg}% avg efficiency — ${100 - bottleneck.avg}% below target.`,
        }
      : null,
    star: star
      ? {
          employee: star.name,
          team: star.team,
          avgEfficiency: star.avg,
          message: `${star.name} (${star.team}) is the top performer at ${star.avg}% efficiency across all tasks.`,
        }
      : null,
    risks: risks.map(t => ({
      id: t.id,
      employee: t.employee,
      title: t.title,
      team: t.team,
      burnPct: Math.round((t.spent / t.estimated) * 100),
      message: `"${t.title}" by ${t.employee} has consumed ${Math.round((t.spent / t.estimated) * 100)}% of its budget with status still In Progress.`,
    })),
    generatedAt: new Date().toISOString(), // timestamp for cache-busting on DB refresh
  };
}

// ── AI COACH CARD COMPONENT ───────────────────────────────────────────────────
function AICoachCard({ tasks }) {
  const insights = useMemo(() => analyzeTeamPerformance(tasks), [tasks]);
  const [expanded, setExpanded] = useState(true);

  const bullets = [
    insights.bottleneck && {
      key: "bottleneck",
      icon: ShieldAlert,
      color: "#f87171",
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.25)",
      label: "Bottleneck",
      text: insights.bottleneck.message,
    },
    insights.star && {
      key: "star",
      icon: Trophy,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.25)",
      label: "Star Performer",
      text: insights.star.message,
    },
    ...(insights.risks.length > 0
      ? insights.risks.slice(0, 2).map((r, i) => ({
          key: `risk-${r.id}`,
          icon: Activity,
          color: "#fb923c",
          bg: "rgba(251,146,60,0.1)",
          border: "rgba(251,146,60,0.25)",
          label: `Risk Alert · ${r.burnPct}% burned`,
          text: r.message,
        }))
      : [{
          key: "no-risk",
          icon: CheckCircle2,
          color: "#34d399",
          bg: "rgba(52,211,153,0.1)",
          border: "rgba(52,211,153,0.25)",
          label: "All Clear",
          text: "No tasks are approaching their time budget. Everything looks healthy!",
        }]
    ),
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "relative",
        borderRadius: 20,
        marginBottom: 28,
        overflow: "hidden",
      }}
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: -1, borderRadius: 21, zIndex: 0,
          background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(99,102,241,0.2), rgba(52,211,153,0.15))",
          filter: "blur(1px)",
        }}
      />

      {/* Card body */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(10,10,28,0.85)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 20,
        backdropFilter: "blur(20px)",
        overflow: "hidden",
      }}>
        {/* Top shimmer line */}
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(99,102,241,0.9), transparent)",
          }}
        />

        {/* Inner background glow */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 22px", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Pulsing icon ring */}
            <div style={{ position: "relative" }}>
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: -5, borderRadius: "50%",
                  background: "rgba(139,92,246,0.35)",
                }}
              />
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))",
                border: "1px solid rgba(139,92,246,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={17} color="#a78bfa" />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", letterSpacing: -0.2 }}>AI Team Coach</span>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{
                    background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.4)",
                    borderRadius: 99, padding: "2px 8px",
                    fontSize: 9, color: "#34d399", fontWeight: 700, letterSpacing: 0.8,
                  }}
                >● LIVE</motion.div>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#475569", marginTop: 1 }}>
                {bullets.length} insight{bullets.length !== 1 ? "s" : ""} · Updated just now
              </p>
            </div>
          </div>

          {/* Collapse toggle */}
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: 0.25 }}
            style={{ color: "#475569", display: "flex" }}
          >
            <ChevronRight size={16} style={{ transform: "rotate(90deg)" }} />
          </motion.div>
        </div>

        {/* Bullets */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                padding: "0 22px 18px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 4 }} />

                {bullets.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <motion.div
                      key={b.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        background: b.bg,
                        border: `1px solid ${b.border}`,
                        borderRadius: 12, padding: "11px 14px",
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                        background: `${b.color}18`, border: `1px solid ${b.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <BIcon size={13} color={b.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: b.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 }}>
                          {b.label.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.55 }}>{b.text}</div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* DB-ready footer hint */}
                <div style={{
                  marginTop: 4, fontSize: 10, color: "#334155",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#334155" }} />
                  Analysis via <code style={{ color: "#475569", fontSize: 9 }}>analyzeTeamPerformance(tasks)</code> — swap <code style={{ color: "#475569", fontSize: 9 }}>tasks</code> with your DB response to go live.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const STATUS_META = {
  "Done":        { color: "#34d399", icon: CheckCircle2 },
  "In Progress": { color: "#818cf8", icon: Flame },
  "To Do":       { color: "#6b7280", icon: Circle },
};

// ── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ initials, color }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}55, ${color}22)`,
      border: `1px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color, letterSpacing: 0.5,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

const AVATAR_COLORS = {
  AP: "#60a5fa", SR: "#f472b6", MW: "#34d399", PN: "#a78bfa",
  LF: "#fbbf24", ZH: "#f472b6", OK: "#818cf8", IM: "#34d399",
  NC: "#60a5fa", BO: "#fbbf24", JT: "#a78bfa",
};

function TaskCard({ task, index }) {
  const efficiency = calcEfficiency(task);
  const perf = perfLabel(efficiency);
  const status = STATUS_META[task.status];
  const StatusIcon = status.icon;
  const PerfIcon = perf.icon;

  const barMax = Math.max(task.estimated, task.spent, 1);
  const estPct = (task.estimated / barMax) * 100;
  const spentPct = (task.spent / barMax) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "18px 20px",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.13)",
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {/* glow accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${perf.color}44, transparent)`,
      }} />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar initials={task.avatar} color={AVATAR_COLORS[task.avatar] || "#818cf8"} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3 }}>{task.title}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{task.employee}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: `${status.color}18`, border: `1px solid ${status.color}33`,
            borderRadius: 20, padding: "3px 9px",
          }}>
            <StatusIcon size={10} color={status.color} />
            <span style={{ fontSize: 10, color: status.color, fontWeight: 600, letterSpacing: 0.3 }}>{task.status}</span>
          </div>
          {/* Perf tag */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: perf.bg, border: `1px solid ${perf.color}44`,
            borderRadius: 20, padding: "3px 9px",
          }}>
            <PerfIcon size={10} color={perf.color} />
            <span style={{ fontSize: 10, color: perf.color, fontWeight: 600, letterSpacing: 0.3 }}>
              {efficiency !== null ? `${efficiency}%` : ""} {perf.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ marginTop: 14 }}>
        {/* Estimated */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#475569", letterSpacing: 0.4 }}>ESTIMATED</span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{task.estimated}d</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", marginBottom: 9, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${estPct}%` }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #334155, #64748b)" }}
          />
        </div>

        {/* Time Spent */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#475569", letterSpacing: 0.4 }}>TIME SPENT</span>
          <span style={{ fontSize: 10, color: perf.color, fontWeight: 600 }}>{task.spent}d</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPct}%` }}
            transition={{ delay: index * 0.05 + 0.4, duration: 0.6, ease: "easeOut" }}
            style={{
              height: "100%", borderRadius: 99,
              background: efficiency === null
                ? "rgba(107,114,128,0.4)"
                : efficiency >= 100
                  ? `linear-gradient(90deg, #059669, #34d399)`
                  : efficiency >= 80
                    ? `linear-gradient(90deg, #d97706, #fbbf24)`
                    : `linear-gradient(90deg, #dc2626, #f87171)`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TeamEfficiencyBadge({ score }) {
  if (score === null) return null;
  const perf = perfLabel(score);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: perf.bg, border: `1px solid ${perf.color}44`,
      borderRadius: 20, padding: "5px 14px",
    }}>
      <Zap size={12} color={perf.color} />
      <span style={{ fontSize: 12, color: perf.color, fontWeight: 700 }}>Team Avg: {score}%</span>
    </div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────────────────────
function AddTaskModal({ team, onClose, onAdd }) {
  const [form, setForm] = useState({
    employee: "", title: "", status: "To Do", estimated: 3, spent: 0,
  });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.employee || !form.title) return;
    const initials = form.employee.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    onAdd({ ...form, team, avatar: initials, id: Date.now(), estimated: +form.estimated, spent: +form.spent });
    onClose();
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(6,6,15,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0d0d1f", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: 28, width: 420,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Add Task — {team}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569" }}><X size={18} /></button>
        </div>

        {[
          { label: "Employee Name", key: "employee", type: "text", placeholder: "e.g. Sarah Chen" },
          { label: "Task Title", key: "title", type: "text", placeholder: "e.g. Design Sprint Kickoff" },
          { label: "Estimated Days", key: "estimated", type: "number", placeholder: "5" },
          { label: "Days Spent", key: "spent", type: "number", placeholder: "0" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 0.4, display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
            <input
              type={f.type} placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => up(f.key, e.target.value)}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "#64748b", letterSpacing: 0.4, display: "block", marginBottom: 6 }}>STATUS</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["To Do", "In Progress", "Done"].map(s => (
              <button key={s} onClick={() => up("status", s)} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: form.status === s ? `${STATUS_META[s].color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${form.status === s ? STATUS_META[s].color + "66" : "rgba(255,255,255,0.08)"}`,
                color: form.status === s ? STATUS_META[s].color : "#64748b",
                transition: "all 0.2s",
              }}>{s}</button>
            ))}
          </div>
        </div>

        <button onClick={handleAdd} style={{
          width: "100%", padding: "12px 0", borderRadius: 12, cursor: "pointer",
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
          letterSpacing: 0.3,
        }}>Add Task</button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState(TASKS);
  const [activeTeam, setActiveTeam] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTeam, setModalTeam] = useState("Development");

  const filteredTeams = useMemo(() => {
    const teams = activeTeam === "All" ? ["Development", "Design", "Sales"] : [activeTeam];
    return teams.map(team => {
      const teamTasks = tasks
        .filter(t => t.team === team)
        .filter(t =>
          !search ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.employee.toLowerCase().includes(search.toLowerCase())
        );
      return { team, tasks: teamTasks, efficiency: teamEfficiency(teamTasks) };
    }).filter(g => g.tasks.length > 0);
  }, [tasks, activeTeam, search]);

  const globalStats = useMemo(() => {
    const active = tasks.filter(t => t.status === "In Progress").length;
    const done = tasks.filter(t => t.status === "Done").length;
    const all = tasks.filter(t => calcEfficiency(t) !== null);
    const avg = all.length ? Math.round(all.reduce((s, t) => s + calcEfficiency(t), 0) / all.length) : 0;
    return { active, done, total: tasks.length, avg };
  }, [tasks]);

  const openModal = (team) => { setModalTeam(team); setShowModal(true); };
  const addTask = (task) => setTasks(prev => [...prev, task]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060f",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "36px 40px",
      boxSizing: "border-box",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Background radial glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -60, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: "#f1f5f9" }}>Task Management</h1>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#475569" }}>Track team efficiency · Real-time performance metrics</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => openModal(activeTeam === "All" ? "Development" : activeTeam)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  border: "none", borderRadius: 12, padding: "10px 18px",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                }}
              >
                <Plus size={15} /> Add Task
              </button>
            </div>
          </div>
        </motion.div>

        {/* AI Coach Card */}
        <AICoachCard tasks={tasks} />

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 30 }}
        >
          {[
            { icon: BarChart3, label: "Total Tasks", value: globalStats.total, color: "#818cf8" },
            { icon: Flame, label: "In Progress", value: globalStats.active, color: "#f472b6" },
            { icon: CheckCircle2, label: "Completed", value: globalStats.done, color: "#34d399" },
            { icon: Zap, label: "Avg Efficiency", value: `${globalStats.avg}%`, color: "#fbbf24" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "18px 20px", backdropFilter: "blur(8px)",
                position: "relative", overflow: "hidden",
              }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}55, transparent)` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon size={16} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", letterSpacing: 0.4 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters + Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center" }}>
          {/* Team tabs */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 5 }}>
            {TEAMS.map(t => (
              <button key={t} onClick={() => setActiveTeam(t)} style={{
                padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeTeam === t ? "rgba(99,102,241,0.25)" : "transparent",
                border: activeTeam === t ? "1px solid rgba(99,102,241,0.5)" : "1px solid transparent",
                color: activeTeam === t ? "#a5b4fc" : "#475569",
                transition: "all 0.2s",
              }}>{t}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks or employees…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "9px 14px 9px 38px", color: "#e2e8f0", fontSize: 13, outline: "none",
              }}
            />
          </div>
        </motion.div>

        {/* Team sections */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTeam} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {filteredTeams.map(({ team, tasks: tTasks, efficiency }) => (
              <motion.div key={team} style={{ marginBottom: 36 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

                {/* Team header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={16} color="#64748b" />
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#cbd5e1", letterSpacing: -0.2 }}>{team}</span>
                      <div style={{
                        background: "rgba(255,255,255,0.06)", borderRadius: 99, padding: "2px 9px",
                        fontSize: 11, color: "#64748b", fontWeight: 600,
                      }}>{tTasks.length} tasks</div>
                    </div>
                    <TeamEfficiencyBadge score={efficiency} />
                  </div>
                  <button onClick={() => openModal(team)} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10, padding: "6px 14px", color: "#818cf8",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                    <Plus size={12} /> Add
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.2), transparent)", marginBottom: 16 }} />

                {/* Task grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                  <AnimatePresence>
                    {tTasks.map((task, i) => (
                      <TaskCard key={task.id} task={task} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredTeams.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
            <BarChart3 size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No tasks match your search.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <AddTaskModal team={modalTeam} onClose={() => setShowModal(false)} onAdd={addTask} />}
      </AnimatePresence>
    </div>
  );
}