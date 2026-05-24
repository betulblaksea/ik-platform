// Dashboard.jsx
// Main team-management page, composed inside <Layout>.
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss
// Import Layout from Sidebar.jsx (or its own file if you split it out).

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, X, TrendingUp, Zap,
  ChevronRight, Sparkles, Bell, Search, UserPlus,
} from "lucide-react";

import { Layout } from "../components/Sidebar";
import AddEmployeeModal from "../components/AddEmployeeModal.jsx";
import { useManagerEmployees } from "../hooks/useManagerEmployees.js";
import { employeesToTeams } from "../utils/employeeTeams.js";

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
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Çalışan", value: team.members.length, Icon: Users },
                  { label: "Verim", value: `${team.efficiency}%`, Icon: TrendingUp },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { employees, setEmployees } = useManagerEmployees();

  const teams = useMemo(() => employeesToTeams(employees), [employees]);
  const totalMembers = employees.length;
  const avgEfficiency = teams.length
    ? Math.round(teams.reduce((s, t) => s + t.efficiency, 0) / teams.length)
    : 0;

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
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { label: "Departman", value: teams.length, Icon: Users, color: "#3b82f6", sub: "Ekip grupları" },
            { label: "Çalışan", value: totalMembers, Icon: Zap, color: "#8b5cf6", sub: "Toplam personel" },
            { label: "Ort. verim", value: `${avgEfficiency}%`, Icon: TrendingUp, color: "#10b981", sub: "Departman bazlı" },
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
          <button
            type="button"
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 8px 24px rgba(59,130,246,0.25)",
            }}
          >
            <UserPlus size={16} />
            Yeni Çalışan
          </button>
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
              <p className="text-sm">
                {teams.length === 0
                  ? "Henüz çalışan eklenmemiş. Yeni Çalışan ile personel ekleyin."
                  : `No teams match "${searchQuery}"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <Drawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />

      <AnimatePresence>
        {showAddEmployee && (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAdd={(newEmp) => setEmployees((prev) => [newEmp, ...prev])}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}