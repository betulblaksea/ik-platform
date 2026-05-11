// Sidebar.jsx
// Standalone, reusable sidebar component.
// Requires: react-router-dom, lucide-react, framer-motion, tailwindcss

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  ShieldCheck,
  Zap,
  LogOut,
  Settings,
} from "lucide-react";

// ─── Nav configuration ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",     icon: LayoutDashboard, path: "/"              },
  { label: "Morning Chart", icon: SunMedium,       path: "/morning-chart" },
  { label: "Tasks",         icon: CheckSquare,     path: "/tasks"         },
  { label: "Permissions",   icon: ShieldCheck,     path: "/permissions"   },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { pathname } = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-30 select-none"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.038) 0%, rgba(255,255,255,0.016) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="px-6 pt-7 pb-6 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">OrbisHQ</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Enterprise Suite
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p
          className="px-3 mb-3 text-xs font-semibold tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.16em" }}
        >
          Navigation
        </p>

        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                style={{
                  background: active
                    ? "rgba(59,130,246,0.12)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(59,130,246,0.22)"
                    : "1px solid transparent",
                  color: active ? "#93c5fd" : "rgba(255,255,255,0.38)",
                  transition: "background 0.2s, border 0.2s, color 0.2s",
                }}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: "#3b82f6" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>

                {active && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "#3b82f6" }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Live clock pill ── */}
      <div className="px-4 pb-4">
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            className="text-xs font-mono font-semibold text-white tracking-widest"
            style={{ letterSpacing: "0.12em" }}
          >
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
            {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div
        className="px-3 pb-6 pt-4 space-y-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { icon: Settings, label: "Settings" },
          { icon: LogOut,   label: "Sign Out"  },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
            style={{ color: "rgba(255,255,255,0.28)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
          >
            <Icon size={15} />
            <span className="text-sm">{label}</span>
          </div>
        ))}

        {/* User chip */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl mt-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            J
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white leading-none truncate">
              J. Alderman
            </div>
            <div
              className="text-xs leading-none mt-0.5 truncate"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Administrator
            </div>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#34d399" }}
          />
        </div>
      </div>
    </aside>
  );
}

// ─── Layout wrapper (exported from same file for convenience) ─────────────────
// Usage:
//   <Layout>
//     <YourPageContent />
//   </Layout>
export function Layout({ children }) {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "#06060f",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #3b82f622 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #8b5cf622 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <Sidebar />

      {/* Content area — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative z-10">
        {children}
      </main>
    </div>
  );
}