import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Clock, Car, HeartPulse, Home, Cpu,
  CheckCircle2, Sparkles, Zap,
} from "lucide-react";
import {
  LATE_CATEGORIES,
  STANDARD_START,
  currentArrivalTime,
  delayFromStandard,
  formatDelta,
} from "../utils/checkInCharts.js";
import { WORK_MODES, COMMUTE_METHODS } from "../utils/workTimeMeta.js";

const LATE_REASONS = [
  { id: "traffic", label: "Trafik", icon: Car },
  { id: "health", label: "Sağlık", icon: HeartPulse },
  { id: "family", label: "Aile", icon: Home },
  { id: "technical", label: "Teknik", icon: Cpu },
];

function TimeField({ label, value, onChange, onNow, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none tabular-nums"
          style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
          required
        />
        <button
          type="button"
          onClick={onNow}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 shrink-0"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}
        >
          Şimdi
        </button>
      </div>
      {hint ? <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{hint}</p> : null}
    </div>
  );
}

function EnergyPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: value === n ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${value === n ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.08)"}`,
            color: value === n ? "#fcd34d" : "rgba(255,255,255,0.35)",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function WorkTimeLogForm({ todayRecord, onSave, saving }) {
  const [tab, setTab] = useState("morning");

  const [arrival, setArrival] = useState("09:00");
  const [workMode, setWorkMode] = useState("office");
  const [category, setCategory] = useState("traffic");
  const [commute, setCommute] = useState("metrobus");
  const [morningNote, setMorningNote] = useState("");

  const [departure, setDeparture] = useState("18:00");
  const [daySummary, setDaySummary] = useState("");
  const [energy, setEnergy] = useState(3);

  useEffect(() => {
    if (!todayRecord) return;
    setArrival(todayRecord.arrival || "09:00");
    setWorkMode(todayRecord.workMode === "hybrid" ? "office" : todayRecord.workMode || "office");
    setCategory(todayRecord.category === "ontime" ? "traffic" : todayRecord.category);
    setCommute(todayRecord.commuteMethod || "metrobus");
    setMorningNote(todayRecord.note || "");
    if (todayRecord.departure) setDeparture(todayRecord.departure);
    setDaySummary(todayRecord.daySummary || "");
    if (todayRecord.energyLevel) setEnergy(todayRecord.energyLevel);
    if (todayRecord.arrival && !todayRecord.departure) setTab("evening");
  }, [todayRecord]);

  const delay = delayFromStandard(arrival, STANDARD_START);
  const hasMorning = Boolean(todayRecord?.arrival);
  const hasEvening = Boolean(todayRecord?.departure);

  const saveMorning = async (e) => {
    e.preventDefault();
    await onSave({
      arrivalTime: arrival,
      workMode,
      category: delay > 0 ? category : "ontime",
      commuteMethod: commute,
      note: morningNote,
    });
    setTab("evening");
  };

  const saveEvening = async (e) => {
    e.preventDefault();
    await onSave({
      departureTime: departure,
      daySummary,
      energyLevel: energy,
    });
  };

  return (
    <div className="space-y-4">
      {hasMorning && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.28)",
          }}
        >
          <CheckCircle2 size={18} className="text-emerald-400" />
          <div className="flex-1">
            <span className="text-emerald-100 font-semibold">Sabah kaydı: {todayRecord.arrival}</span>
            <span className="text-emerald-200/70 text-xs ml-2">{formatDelta(todayRecord.delta)}</span>
          </div>
          {hasEvening ? (
            <span className="text-xs text-emerald-300/80">Çıkış: {todayRecord.departure}</span>
          ) : null}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {[
          { id: "morning", label: "Sabah girişi", icon: Sun },
          { id: "evening", label: "Akşam çıkışı", icon: Moon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === id ? "rgba(59,130,246,0.25)" : "transparent",
              color: tab === id ? "#93c5fd" : "rgba(255,255,255,0.4)",
              border: tab === id ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.05) 100%)",
          border: "1px solid rgba(59,130,246,0.22)",
        }}
      >
        <div className="px-6 pt-5 pb-2 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.35)" }}
          >
            <Sparkles size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Günlük çalışma kaydı</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Saatleri elle girin — otomatik kayıt yok
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "morning" ? (
            <motion.form
              key="morning"
              onSubmit={saveMorning}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="px-6 pb-6 space-y-4"
            >
              <TimeField
                label="Giriş saati"
                value={arrival}
                onChange={setArrival}
                onNow={() => setArrival(currentArrivalTime())}
                hint={`Mesai başlangıcı referans: ${STANDARD_START}`}
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Bugün nerede çalışıyorsunuz?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_MODES.map((m) => {
                    const Icon = m.icon;
                    const active = workMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setWorkMode(m.id)}
                        className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-semibold"
                        style={{
                          background: active ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.08)"}`,
                          color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        <Icon size={16} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Ulaşım şekli
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMUTE_METHODS.map((c) => {
                    const Icon = c.icon;
                    const active = commute === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCommute(c.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: active ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.08)"}`,
                          color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        <Icon size={13} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {delay > 0 ? (
                <>
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}
                  >
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-amber-100">{delay} dk geç (09:00’a göre)</span>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Gecikme nedeni
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {LATE_REASONS.map((c) => {
                        const Icon = c.icon;
                        const active = category === c.id;
                        const meta = LATE_CATEGORIES[c.id];
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCategory(c.id)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: active ? meta.bg : "rgba(255,255,255,0.03)",
                              border: `1px solid ${active ? meta.color + "55" : "rgba(255,255,255,0.08)"}`,
                              color: active ? meta.color : "rgba(255,255,255,0.4)",
                            }}
                          >
                            <Icon size={14} />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <textarea
                value={morningNote}
                onChange={(e) => setMorningNote(e.target.value)}
                rows={2}
                placeholder="Sabah notu (ör. köprü trafiği, toplantı gecikmesi)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: "0 6px 24px rgba(59,130,246,0.3)",
                }}
              >
                {saving ? "Kaydediliyor…" : hasMorning ? "Sabah kaydını güncelle" : "Sabah girişini kaydet"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="evening"
              onSubmit={saveEvening}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="px-6 pb-6 space-y-4"
            >
              {!hasMorning ? (
                <p className="text-xs text-amber-200/90 rounded-lg px-3 py-2"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                  Önce sabah giriş saatini kaydedin.
                </p>
              ) : null}

              <TimeField
                label="Çıkış saati"
                value={departure}
                onChange={setDeparture}
                onNow={() => setDeparture(currentArrivalTime())}
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Gün özeti
                </p>
                <textarea
                  value={daySummary}
                  onChange={(e) => setDaySummary(e.target.value)}
                  rows={3}
                  disabled={!hasMorning}
                  placeholder="Bugün ne yaptınız? Odak, engeller, yarın planı…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none disabled:opacity-40"
                  style={{ background: "rgba(15,15,35,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                  <Zap size={11} /> Enerji seviyesi (1–5)
                </p>
                <EnergyPicker value={energy} onChange={setEnergy} />
              </div>

              <button
                type="submit"
                disabled={saving || !hasMorning}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  boxShadow: "0 6px 24px rgba(139,92,246,0.3)",
                }}
              >
                {saving ? "Kaydediliyor…" : hasEvening ? "Akşam kaydını güncelle" : "Akşam çıkışını kaydet"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
