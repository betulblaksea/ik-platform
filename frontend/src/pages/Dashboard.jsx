import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Zap, ChevronRight, Search, UserPlus } from "lucide-react";

import { Layout } from "../components/Sidebar";
import AddEmployeeModal from "../components/AddEmployeeModal.jsx";
import { useManagerEmployees } from "../hooks/useManagerEmployees.js";
import { employeesToTeams } from "../utils/employeeTeams.js";

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
      className="relative rounded-2xl p-5 cursor-pointer overflow-hidden group glass-card glass-card--interactive"
      style={{ "--team-color": team.color, "--team-glow": team.glow }}
    >
      <div className="team-card__glow" />
      <div className="flex items-start justify-between mb-4">
        <div className="team-card__icon">
          <Icon size={18} />
        </div>
        <div className="team-card__badge">
          <Users size={11} />
          {team.members.length}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-bold text-white text-base leading-tight mb-0.5 tracking-tight">{team.name}</h3>
        <p className="text-xs text-[var(--text-muted)]">{team.department}</p>
      </div>
      <p className="text-xs text-[var(--text-dim)]">
        {team.members.length === 1 ? "1 çalışan" : `${team.members.length} çalışan`}
      </p>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[var(--team-color)]">
        <ChevronRight size={14} />
      </div>
    </motion.div>
  );
}

function Drawer({ team, onClose }) {
  return (
    <AnimatePresence>
      {team ? (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            style={{ "--team-color": team.color }}
          >
            <div className="px-7 pt-8 pb-6 flex-shrink-0 drawer-panel__section">
              <div className="flex items-start justify-between mb-5">
                <div className="drawer-header-icon">
                  <team.icon size={22} />
                </div>
                <button type="button" onClick={onClose} className="icon-btn">
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{team.name}</h2>
              <p className="text-sm mb-5 text-[var(--text-muted)]">{team.department}</p>
              <p className="text-sm text-[var(--text-dim)]">{team.members.length} çalışan</p>
            </div>
            <div className="px-7 py-5 flex-1 overflow-y-auto">
              <h3 className="section-label mb-4">Ekip üyeleri</h3>
              <div className="space-y-2.5">
                {team.members.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="member-row"
                    style={{ "--team-color": team.color }}
                  >
                    <div className="member-row__avatar">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                      <p className="text-xs truncate text-[var(--text-muted)]">{member.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Topbar({ searchQuery, setSearchQuery }) {
  return (
    <header className="page-header">
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Panel</h1>
        <p className="page-header__subtitle">Departmanlara göre personel özeti</p>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Departman ara…"
          className="search-input"
        />
      </div>
    </header>
  );
}

export default function Dashboard() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const { employees, setEmployees } = useManagerEmployees();

  const teams = useMemo(() => employeesToTeams(employees), [employees]);
  const totalMembers = employees.length;

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Layout>
      <Topbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="page-body">
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { label: "Departman", value: teams.length, Icon: Users, color: "#3b82f6", sub: "Ekip grupları" },
            { label: "Çalışan", value: totalMembers, Icon: Zap, color: "#8b5cf6", sub: "Toplam personel" },
          ].map(({ label, value, Icon, color, sub }) => (
            <div key={label} className="glass-stat">
              <div className="flex items-center justify-between mb-3">
                <span className="glass-stat__label">{label}</span>
                <div className="stat-icon" style={{ "--stat-color": color }}>
                  <Icon size={13} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight mb-0.5">{value}</div>
              <div className="glass-stat__sub">{sub}</div>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Departmanlar</h2>
            <p className="text-xs mt-0.5 text-[var(--text-dim)]">
              {filtered.length} / {teams.length} · Detay için karta tıklayın
            </p>
          </div>
          <button type="button" onClick={() => setShowAddEmployee(true)} className="btn-primary">
            <UserPlus size={16} />
            Yeni Çalışan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} onClick={setSelectedTeam} />
          ))}
          {filtered.length === 0 ? (
            <div className="col-span-4 py-20 empty-state">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {teams.length === 0
                  ? "Henüz çalışan eklenmemiş. Yeni Çalışan ile personel ekleyin."
                  : `"${searchQuery}" ile eşleşen departman yok`}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <Drawer team={selectedTeam} onClose={() => setSelectedTeam(null)} />

      <AnimatePresence>
        {showAddEmployee ? (
          <AddEmployeeModal
            onClose={() => setShowAddEmployee(false)}
            onAdd={(newEmp) => setEmployees((prev) => [newEmp, ...prev])}
          />
        ) : null}
      </AnimatePresence>
    </Layout>
  );
}
