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
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Yeni Çalışan Kaydı</h2>
            <p className="text-xs text-gray-500 mt-1">Sisteme yeni bir personel profili ekleyin.</p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {error ? <div className="alert-error mb-6">{error}</div> : null}

        <form onSubmit={handleAdd} className="space-y-5">
          {[
            { label: "Ad Soyad", key: "name", type: "text", placeholder: "Örn: Ahmet Yılmaz" },
            { label: "E-Posta", key: "email", type: "email", placeholder: "ahmet@sirket.com" },
            { label: "Pozisyon", key: "role", type: "text", placeholder: "Örn: Yazılım geliştirici" },
            { label: "Departman", key: "dept", type: "text", placeholder: "Örn: Mühendislik" },
            { label: "Geçici Şifre", key: "password", type: "password", placeholder: "••••••••" },
          ].map((f) => (
            <div key={f.key}>
              <label className="field-label">{f.label}</label>
              <input
                required
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => up(f.key, e.target.value)}
                className="field-input"
              />
            </div>
          ))}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="btn-submit-form">
              {loading ? "Kaydediliyor..." : "Çalışanı Sisteme Ekle"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
