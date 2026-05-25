import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  Zap,
  LogOut,
  Target,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Panel", icon: LayoutDashboard, path: "/dashboard", managerOnly: true },
  { label: "Kadro Planlama", icon: Target, path: "/workforce", managerOnly: true },
  { label: "Çalışma Saatleri", icon: SunMedium, path: "/morning-chart", managerOnly: false },
  { label: "Görevler", icon: CheckSquare, path: "/tasks", managerOnly: false },
];

function profileInitials(name, email) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const e = (email || "").trim();
  return e ? e.slice(0, 2).toUpperCase() : "?";
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const displayName = (user?.name || "").trim() || user?.email || "Kullanıcı";
  const managerName =
    user?.role === "employee" && user?.addedBy
      ? (user.addedBy.name || user.addedBy.email)
      : null;
  const detailLine = managerName
    ? `${user?.role ?? "—"} · ${managerName}`
    : user?.email || "—";
  const initials = profileInitials(user?.name, user?.email);

  const navItems =
    user?.role === "employee"
      ? NAV_ITEMS.filter((item) => item.path === "/morning-chart" || item.path === "/tasks")
      : NAV_ITEMS.filter((item) => !item.managerOnly || user?.role === "manager");

  return (
    <aside className="sidebar">
      <div className="sidebar__logo-wrap">
        <div className="sidebar__logo">
          <Zap size={15} className="text-white" />
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="sidebar__nav-label">
          {user?.role === "employee" ? "İşlerim" : "Menü"}
        </p>

        {navItems.map(({ label, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} className="sidebar__link">
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`sidebar__nav-item${active ? " sidebar__nav-item--active" : ""}`}
              >
                {active ? (
                  <motion.div
                    layoutId="activeBar"
                    className="sidebar__nav-bar"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
                {active ? <div className="sidebar__nav-dot" /> : null}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div
          role="button"
          tabIndex={0}
          onClick={signOut}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              signOut();
            }
          }}
          className="sidebar__signout"
        >
          <LogOut size={15} />
          <span className="text-sm">Çıkış</span>
        </div>

        <div className="sidebar__profile">
          <div className="sidebar__avatar">{initials}</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white leading-none truncate">{displayName}</div>
            <div className="sidebar__profile-detail truncate" title={user?.email || ""}>
              {detailLine}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="app-shell__blob app-shell__blob--tl" />
        <div className="app-shell__blob app-shell__blob--br" />
      </div>
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
