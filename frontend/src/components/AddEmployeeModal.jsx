import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { employeeInitials } from "../hooks/useManagerEmployees.js";

export default function AddEmployeeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", dept: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.password) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/add-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          position: form.role,
          dept: form.dept,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Çalışan eklenemedi");

      onAdd({
        ...data.user,
        avatar: employeeInitials(data.user.name, data.user.email),
        role: data.user.position || form.role,
        dept: data.user.dept || form.dept,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,6,15,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
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
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          >
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
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="block font-semibold tracking-widest uppercase text-[10px] text-gray-500 ml-1">
                {f.label}
              </label>
              <input
                required
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => up(f.key, e.target.value)}
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
