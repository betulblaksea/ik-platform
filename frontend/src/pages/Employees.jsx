import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Users, UserPlus, Search, Filter, Mail,
  MoreVertical, Shield, Briefcase, MapPin,
  CheckCircle2, XCircle, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Minus, Bell, X
} from "lucide-react";

// --- Mock Data ---
const MOCK_EMPLOYEES = [
  { id: 1, name: "Aria Nakamura", role: "Lead Engineer", dept: "Engineering", email: "aria@orbis.hq", status: "Active", avatar: "AN" },
  { id: 2, name: "Ethan Cross", role: "Backend Dev", dept: "Engineering", email: "ethan@orbis.hq", status: "Active", avatar: "EC" },
  { id: 3, name: "Sofia Reyes", role: "DevOps", dept: "Infrastructure", email: "sofia@orbis.hq", status: "On Leave", avatar: "SR" },
  { id: 4, name: "Liam Okafor", role: "Frontend Dev", dept: "Engineering", email: "liam@orbis.hq", status: "Active", avatar: "LO" },
  { id: 5, name: "Zara Ahmed", role: "Security Architect", dept: "Security", email: "zara@orbis.hq", status: "Active", avatar: "ZA" },
  { id: 6, name: "Luna Silva", role: "Creative Director", dept: "Design", email: "luna@orbis.hq", status: "Active", avatar: "LS" },
];

// --- Add Employee Modal ---
function AddEmployeeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", dept: "", password: "", status: "Active" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.password) return;
    
    setLoading(true);
    setError("");
    try {
      // Not: Backend'de register endpoint'i HR yetkisiyle korunmalıdır.
      const res = await fetch("/api/auth/add-employee", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: form.name,
          email: form.email,
          password: form.password,
          position: form.role,
          dept: form.dept
        }), 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Çalışan eklenemedi");
      
      // Avatar için baş harfleri oluştur
      const initials = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      onAdd({ ...data.user, avatar: initials, dept: form.dept, status: "Active" });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,6,15,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="rounded-3xl p-8 w-full max-w-md relative overflow-hidden"
        style={{
          background: "rgba(15, 15, 35, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Yeni Çalışan Kaydı</h2>
            <p className="text-xs text-gray-500 mt-1">Sisteme yeni bir personel profili ekleyin.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-5">
          {[
            { label: "Ad Soyad", key: "name", type: "text", placeholder: "Örn: Ahmet Yılmaz" },
            { label: "E-Posta", key: "email", type: "email", placeholder: "ahmet@orbis.hq" },
            { label: "Pozisyon", key: "role", type: "text", placeholder: "Örn: Frontend Developer" },
            { label: "Departman", key: "dept", type: "text", placeholder: "Örn: Engineering" },
            { label: "Geçici Şifre", key: "password", type: "password", placeholder: "••••••••" },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="block font-semibold tracking-widest uppercase text-[10px] text-gray-500 ml-1">{f.label}</label>
              <input
                required
                type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => up(f.key, e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none border border-white/10 bg-white/5 focus:bg-white/10 focus:border-blue-500/40 transition-all placeholder:text-gray-600"
              />
            </div>
          ))}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
            >
              {loading ? "Kaydediliyor..." : "Çalışanı Sisteme Ekle"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- Components ---
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 flex-1"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight mb-1">{value}</div>
      <div className="flex items-center gap-1">
        {trend && <ArrowUpRight size={12} className="text-emerald-400" />}
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</span>
      </div>
    </motion.div>
  );
}

export default function Employees() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/users?role=employee", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const formatted = (data.users || data).map(u => ({
            ...u,
            avatar: u.name ? u.name.split(" ").map(n => n[0]).join("").toUpperCase() : "??",
            dept: u.dept || "Genel",
            status: u.status || "Active"
          }));
          setEmployees(formatted.length > 0 ? formatted : MOCK_EMPLOYEES);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEmployees(MOCK_EMPLOYEES);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchEmployees();
  }, [token]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Header Section */}
      <header 
        className="px-8 py-4 flex items-center justify-between sticky top-0 z-20" 
        style={{ 
          background: "rgba(6,6,15,0.82)", 
          backdropFilter: "blur(20px)", 
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'DM Sans', system-ui, sans-serif"
        }}
      >
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Çalışan Yönetimi</h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Şirket genelindeki tüm personeli yönetin.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Sistem Aktif
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-shadow"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px rgba(59,130,246,0.3)" }}
          >
            <UserPlus size={16} />
            Yeni Çalışan
          </motion.button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <StatCard label="Toplam Personel" value={employees.length} sub="Tüm departmanlar" icon={Users} color="#3b82f6" />
          <StatCard label="Aktif Çalışanlar" value={employees.filter(e => e.status === "Active").length} sub="Şu an aktif" icon={CheckCircle2} color="#10b981" trend={true} />
          <StatCard label="İzinli" value={employees.filter(e => e.status === "On Leave").length} sub="Gelecek hafta dönecek" icon={Clock} color="#f59e0b" />
          <StatCard label="Departmanlar" value="5" sub="Organizasyon yapısı" icon={Briefcase} color="#8b5cf6" />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="İsim veya departman ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                caretColor: "#3b82f6"
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              <Filter size={16} />
              Filtrele
            </button>
          </div>
        </div>

        {/* Employees Table/List */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Çalışan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Departman</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Durum (Live)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">E-Posta</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredEmployees.map((emp, idx) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
                        >
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Briefcase size={14} className="text-gray-500" />
                        {emp.dept}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {emp.status === "Active" ? "Aktif" : "İzinli"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-blue-400 transition-colors">
                        <Mail size={14} />
                        {emp.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-400">Aradığınız kriterlere uygun çalışan bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Bottom Section - Org Chart Preview / Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/10" 
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)", backdropFilter: "blur(10px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
                <Shield size={16} className="text-blue-400" />
                Erişim Yetkileri
              </h3>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Çalışanların sistem üzerindeki yetki seviyelerini ve rol tabanlı erişim kontrollerini buradan düzenleyebilirsiniz.
            </p>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} 
                  className="w-8 h-8 rounded-lg border-2 border-[#06060f] flex items-center justify-center text-[10px] text-white font-bold shadow-xl"
                  style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-7 h-7 rounded-lg border-2 border-[#06060f] bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                +12
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10" 
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 100%)", backdropFilter: "blur(10px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
                <MapPin size={16} className="text-purple-400" />
                Ofis Yerleşimi
              </h3>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Hibrit çalışma düzenindeki çalışanların ofis doluluk oranlarını ve masa rezervasyonlarını takip edin.
            </p>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-2/3 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Doluluk Oranı</span>
              <span className="text-[10px] text-purple-400 font-bold">67%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showModal && (
          <AddEmployeeModal 
            onClose={() => setShowModal(false)} 
            onAdd={(newEmp) => setEmployees(prev => [newEmp, ...prev])} 
          />
        )}
      </AnimatePresence>
      
      <style>{`
        input::placeholder {
          color: rgba(255,255,255,0.2);
        }
      `}</style>
    </Layout>
  );
}
