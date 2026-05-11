// Dashboard.jsx
// Main team-management page, composed inside <Layout>.
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss
// Import Layout from Sidebar.jsx (or its own file if you split it out).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, X, Wifi, TrendingUp, Zap, Shield,
  Code2, Palette, BarChart3, Globe, Cpu, Lock,
  ChevronRight, Activity, Sparkles, Bell, Search,
  CircleDot,
} from "lucide-react";

// Import Layout (and Sidebar) from Sidebar.jsx
import { Layout } from "../components/Sidebar";

// ─── Data ─────────────────────────────────────────────────────────────────────
const teams = [
  {
    id: 1,
    name: "Quantum Core",
    department: "Engineering",
    efficiency: 94,
    aiInsight: "Sprint velocity up 18% — on track to exceed Q3 targets.",
    aiScore: 98,
    icon: Cpu,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.35)",
    members: [
      { name: "Aria Nakamura",  role: "Lead Engineer",  online: true,  avatar: "AN" },
      { name: "Ethan Cross",    role: "Backend Dev",    online: true,  avatar: "EC" },
      { name: "Sofia Reyes",    role: "DevOps",         online: false, avatar: "SR" },
      { name: "Liam Okafor",    role: "Frontend Dev",   online: true,  avatar: "LO" },
      { name: "Maya Chen",      role: "QA Engineer",    online: true,  avatar: "MC" },
    ],
  },
  {
    id: 2,
    name: "Cipher Shield",
    department: "Security",
    efficiency: 88,
    aiInsight: "Threat detection improved. Zero breaches in 47 days.",
    aiScore: 91,
    icon: Shield,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    members: [
      { name: "Zara Ahmed",  role: "Security Architect", online: true,  avatar: "ZA" },
      { name: "Noah Park",   role: "Pen Tester",         online: false, avatar: "NP" },
      { name: "Isla Torres", role: "SOC Analyst",        online: true,  avatar: "IT" },
      { name: "Ryo Matsuda", role: "Compliance Lead",    online: true,  avatar: "RM" },
    ],
  },
  {
    id: 3,
    name: "Prism Studio",
    department: "Design",
    efficiency: 91,
    aiInsight: "Creative output trending 22% above baseline this month.",
    aiScore: 89,
    icon: Palette,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.35)",
    members: [
      { name: "Luna Silva",  role: "Creative Director", online: true,  avatar: "LS" },
      { name: "Finn Walsh",  role: "UX Designer",       online: true,  avatar: "FW" },
      { name: "Cleo Bauer",  role: "Motion Designer",   online: true,  avatar: "CB" },
      { name: "Ade Johnson", role: "Brand Designer",    online: false, avatar: "AJ" },
      { name: "Nora Kim",    role: "UI Lead",           online: true,  avatar: "NK" },
      { name: "Theo Grant",  role: "Illustrator",       online: false, avatar: "TG" },
    ],
  },
  {
    id: 4,
    name: "Vertex Analytics",
    department: "Data & BI",
    efficiency: 79,
    aiInsight: "Data pipeline latency flagged — recommend infrastructure review.",
    aiScore: 74,
    icon: BarChart3,
    color: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    members: [
      { name: "Omar Farsi",  role: "Data Scientist", online: false, avatar: "OF" },
      { name: "Hana Patel",  role: "BI Engineer",    online: true,  avatar: "HP" },
      { name: "Joel Stroud", role: "ML Engineer",    online: true,  avatar: "JS" },
      { name: "Vera Lund",   role: "Analytics Lead", online: false, avatar: "VL" },
    ],
  },
  {
    id: 5,
    name: "NexusComm",
    department: "Infrastructure",
    efficiency: 85,
    aiInsight: "Uptime at 99.97%. Predictive scaling saved 12% cloud costs.",
    aiScore: 95,
    icon: Globe,
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.35)",
    members: [
      { name: "Kai Brennan", role: "Infra Lead",       online: true, avatar: "KB" },
      { name: "Suki Tanaka", role: "Network Eng.",      online: true, avatar: "ST" },
      { name: "Bram Visser", role: "Cloud Architect",   online: true, avatar: "BV" },
    ],
  },
  {
    id: 6,
    name: "CodeWeave",
    department: "Platform",
    efficiency: 96,
    aiInsight: "Highest deployment frequency. CI/CD pipeline fully optimized.",
    aiScore: 99,
    icon: Code2,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.35)",
    members: [
      { name: "Ren Yoshida", role: "Platform Eng.", online: true,  avatar: "RY" },
      { name: "Mila Costa",  role: "Senior Dev",    online: false, avatar: "MC" },
      { name: "Axel Berg",   role: "Fullstack Dev", online: true,  avatar: "AB" },
      { name: "Dara Quinn",  role: "API Architect", online: true,  avatar: "DQ" },
      { name: "Sam Osei",    role: "DevEx Lead",    online: true,  avatar: "SO" },
    ],
  },
  {
    id: 7,
    name: "VaultKey",
    department: "Compliance",
    efficiency: 82,
    aiInsight: "Audit readiness at 94%. Two policy gaps identified — resolving.",
    aiScore: 86,
    icon: Lock,
    color: "#f97316",
    glow: "rgba(249,115,22,0.35)",
    members: [
      { name: "Ingrid Moss",  role: "Compliance Dir.", online: true,  avatar: "IM" },
      { name: "Carlos Vega",  role: "Risk Analyst",    online: false, avatar: "CV" },
      { name: "Pearl Nwosu",  role: "Legal Tech Lead",  online: true,  avatar: "PN" },
    ],
  },
  {
    id: 8,
    name: "PulseOps",
    department: "Operations",
    efficiency: 77,
    aiInsight: "Process bottleneck in onboarding flow — optimization recommended.",
    aiScore: 71,
    icon: Activity,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.35)",
    members: [
      { name: "Drew Larson", role: "Ops Manager",   online: true,  avatar: "DL" },
      { name: "Amara Diop",  role: "Process Lead",  online: true,  avatar: "AD" },
      { name: "Felix Holt",  role: "Coordinator",   online: false, avatar: "FH" },
      { name: "Juno Park",   role: "Analyst",       online: true,  avatar: "JP" },
    ],
  },
];

// ─── Derived stats ─────────────────────────────────────────────────────────────
const TOTAL_MEMBERS   = teams.reduce((s, t) => s + t.members.length, 0);
const AVG_EFFICIENCY  = Math.round(teams.reduce((s, t) => s + t.efficiency, 0) / teams.length);
const ONLINE_COUNT    = teams.reduce((s, t) => s + t.members.filter(m => m.online).length, 0);

// ─── Animation variants ────────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── EfficiencyBar ─────────────────────────────────────────────────────────────
function EfficiencyBar({ value, color }) {
  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.07)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </div>
  );
}

// ─── TeamCard ──────────────────────────────────────────────────────────────────
function TeamCard({ team, index, onClick }) {
  const Icon = team.icon;
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.025, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(team)}
      className="relative rounded-2xl p-5 cursor-pointer overflow-hidden group"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${team.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${team.color}18`,
            border: `1px solid ${team.color}33`,
          }}
        >
          <Icon size={18} style={{ color: team.color }} />
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <Users size={11} />
          {team.members.length}
        </div>
      </div>

      {/* Name & dept */}
      <div className="mb-4">
        <h3 className="font-bold text-white text-base leading-tight mb-0.5 tracking-tight">
          {team.name}
        </h3>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
          {team.department}
        </p>
      </div>

      {/* Efficiency */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Efficiency
          </span>
          <span className="text-xs font-semibold" style={{ color: team.color }}>
            {team.efficiency}%
          </span>
        </div>
        <EfficiencyBar value={team.efficiency} color={team.color} />
      </div>

      {/* AI Insight */}
      <div
        className="rounded-xl p-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.color}0f 0%, ${team.color}06 100%)`,
          border: `1px solid ${team.color}22`,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: team.color }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: team.color }}
            />
          </span>
          <span
            className="font-semibold tracking-widest uppercase"
            style={{ color: team.color, fontSize: "9px", letterSpacing: "0.12em" }}
          >
            AI Prediction
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {team.aiInsight}
        </p>
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${team.color}44, transparent)`,
          }}
        />
      </div>

      {/* Chevron hint */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ChevronRight size={14} style={{ color: team.color }} />
      </div>
    </motion.div>
  );
}

// ─── Drawer ────────────────────────────────────────────────────────────────────
function Drawer({ team, onClose }) {
  const onlineCount = team?.members.filter(m => m.online).length ?? 0;

  return (
    <AnimatePresence>
      {team && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            style={{
              background: "linear-gradient(160deg, #0d0d1f 0%, #060612 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div
              className="px-7 pt-8 pb-6 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${team.color}18`,
                    border: `1px solid ${team.color}33`,
                  }}
                >
                  <team.icon size={22} style={{ color: team.color }} />
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                {team.name}
              </h2>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>
                {team.department}
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Members",    value: team.members.length, Icon: Users       },
                  { label: "Online",     value: onlineCount,          Icon: Wifi        },
                  { label: "Efficiency", value: `${team.efficiency}%`, Icon: TrendingUp },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Icon size={13} className="mx-auto mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }} />
                    <div className="text-lg font-bold text-white leading-none mb-0.5">{value}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div
              className="px-7 py-5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${team.color}12 0%, ${team.color}06 100%)`,
                  border: `1px solid ${team.color}25`,
                  boxShadow: `0 0 40px ${team.color}10`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} style={{ color: team.color }} />
                  <span
                    className="font-bold tracking-widest uppercase"
                    style={{ color: team.color, fontSize: "9px", letterSpacing: "0.14em" }}
                  >
                    AI Prediction
                  </span>
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${team.color}22`, color: team.color }}
                  >
                    {team.aiScore}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {team.aiInsight}
                </p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${team.color}55, transparent)`,
                  }}
                />
              </div>
            </div>

            {/* Members list */}
            <div className="px-7 py-5 flex-1 overflow-y-auto">
              <h3
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}
              >
                Team Members
              </h3>
              <div className="space-y-2.5">
                {team.members.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3.5 rounded-xl p-3.5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: `${team.color}20`,
                        color: team.color,
                        border: `1px solid ${team.color}30`,
                      }}
                    >
                      {member.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {member.role}
                      </p>
                    </div>

                    {/* Online / Away */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {member.online ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                          </span>
                          <span className="text-xs" style={{ color: "#34d399" }}>Online</span>
                        </>
                      ) : (
                        <>
                          <CircleDot size={8} style={{ color: "rgba(255,255,255,0.2)" }} />
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Away</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ searchQuery, setSearchQuery, filtered, total }) {
  return (
    <header
      className="sticky top-0 z-20 px-8 py-4 flex items-center gap-4"
      style={{
        background: "rgba(6,6,15,0.8)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Team Management</h1>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          {filtered} of {total} teams visible
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(255,255,255,0.3)" }}
        />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search teams…"
          className="pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none w-56"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
            caretColor: "#3b82f6",
          }}
        />
      </div>

      <button
        className="w-9 h-9 rounded-xl flex items-center justify-center relative"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Bell size={15} style={{ color: "rgba(255,255,255,0.4)" }} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
      </button>
    </header>
  );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");

  const filtered = teams.filter(
    t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Layout>
      {/* Topbar */}
      <Topbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filtered={filtered.length}
        total={teams.length}
      />

      {/* Body */}
      <div className="px-8 py-7 flex-1">

        {/* ── Stats row ── */}
        <motion.div
          className="grid grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { label: "Total Teams",    value: teams.length,   Icon: Users,      color: "#3b82f6", sub: "Across all departments" },
            { label: "Team Members",   value: TOTAL_MEMBERS,  Icon: Zap,        color: "#8b5cf6", sub: "Active headcount"       },
            { label: "Avg Efficiency", value: `${AVG_EFFICIENCY}%`, Icon: TrendingUp, color: "#10b981", sub: "Org-wide average"  },
            { label: "Online Now",     value: ONLINE_COUNT,   Icon: Wifi,       color: "#f59e0b", sub: "Real-time presence"     },
          ].map(({ label, value, Icon, color, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {label}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}25` }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight mb-0.5">{value}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">All Teams</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
              {filtered.length} of {teams.length} teams · Click a card to inspect
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live data
          </div>
        </div>

        {/* ── Cards grid — exactly 4 cols on lg ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} onClick={setSelectedTeam} />
          ))}

          {filtered.length === 0 && (
            <div
              className="col-span-4 py-20 text-center"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No teams match "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <Drawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />
    </Layout>
  );
}