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
      <label className="field-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field-input flex-1 tabular-nums"
          required
        />
        <button type="button" onClick={onNow} className="quick-add-btn shrink-0">
          Şimdi
        </button>
      </div>
      {hint ? <p className="field-hint">{hint}</p> : null}
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
          className={`energy-btn${value === n ? " energy-btn--active" : ""}`}
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
        <div className="work-log-success">
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

      <div className="tab-switcher">
        {[
          { id: "morning", label: "Sabah girişi", icon: Sun },
          { id: "evening", label: "Akşam çıkışı", icon: Moon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`tab-btn${tab === id ? " tab-btn--active" : ""}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <motion.div className="work-log-panel">
        <div className="px-6 pt-5 pb-2 flex items-center gap-3">
          <div className="work-log-panel__icon">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Günlük çalışma kaydı</h2>
            <p className="chart-card__subtitle">
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
                <p className="field-label mb-2">Bugün nerede çalışıyorsunuz?</p>
                <div className="grid grid-cols-2 gap-2">
                  {WORK_MODES.map((m) => {
                    const Icon = m.icon;
                    const active = workMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setWorkMode(m.id)}
                        className={`choice-grid-btn${active ? " choice-grid-btn--active" : ""}`}
                        style={active ? { "--status-color": "#93c5fd" } : undefined}
                      >
                        <Icon size={16} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="field-label mb-2">Ulaşım şekli</p>
                <div className="flex flex-wrap gap-2">
                  {COMMUTE_METHODS.map((c) => {
                    const Icon = c.icon;
                    const active = commute === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCommute(c.id)}
                        className={`choice-chip-btn${active ? " choice-chip-btn--active" : ""}`}
                        style={active ? { "--status-color": "#93c5fd" } : undefined}
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
                  <div className="alert-warning-box text-sm">
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-amber-100">{delay} dk geç (09:00’a göre)</span>
                  </div>

                  <div>
                    <p className="field-label mb-2">Gecikme nedeni</p>
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
                            className={`choice-grid-btn flex-row justify-center gap-2 py-2.5${active ? " choice-grid-btn--cat-active" : ""}`}
                            style={active ? { "--status-color": meta.color, "--cat-bg": meta.bg } : undefined}
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
                className="field-input resize-none"
              />

              <button type="submit" disabled={saving} className="btn-submit-blue">
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
                <p className="alert-warning-box text-xs text-amber-200/90 py-2 px-3">
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
                <p className="field-label mb-2">Gün özeti</p>
                <textarea
                  value={daySummary}
                  onChange={(e) => setDaySummary(e.target.value)}
                  rows={3}
                  disabled={!hasMorning}
                  placeholder="Bugün ne yaptınız? Odak, engeller, yarın planı…"
                  className="field-input resize-none disabled:opacity-40"
                />
              </div>

              <div>
                <p className="field-label mb-2 flex items-center gap-1">
                  <Zap size={11} /> Enerji seviyesi (1–5)
                </p>
                <EnergyPicker value={energy} onChange={setEnergy} />
              </div>

              <button type="submit" disabled={saving || !hasMorning} className="btn-submit-violet">
                {saving ? "Kaydediliyor…" : hasEvening ? "Akşam kaydını güncelle" : "Akşam çıkışını kaydet"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
