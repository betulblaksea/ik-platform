import { Car, HeartPulse, Home, Cpu, CheckCircle2 } from "lucide-react";

export const LATE_CATEGORIES = {
  traffic: { label: "Trafik", color: "#ef4444", glow: "rgba(239,68,68,0.4)", icon: Car, bg: "rgba(239,68,68,0.1)" },
  health: { label: "Sağlık", color: "#f59e0b", glow: "rgba(245,158,11,0.4)", icon: HeartPulse, bg: "rgba(245,158,11,0.1)" },
  family: { label: "Aile", color: "#3b82f6", glow: "rgba(59,130,246,0.4)", icon: Home, bg: "rgba(59,130,246,0.1)" },
  technical: { label: "Teknik", color: "#a855f7", glow: "rgba(168,85,247,0.4)", icon: Cpu, bg: "rgba(168,85,247,0.1)" },
  ontime: { label: "Zamanında", color: "#34d399", glow: "rgba(52,211,153,0.4)", icon: CheckCircle2, bg: "rgba(52,211,153,0.1)" },
};

export const STANDARD_START = "09:00";

export function currentArrivalTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function delayFromStandard(arrivalTime, standard = STANDARD_START) {
  const [ah, am] = arrivalTime.split(":").map(Number);
  const [sh, sm] = standard.split(":").map(Number);
  return Math.max(0, ah * 60 + am - (sh * 60 + sm));
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildCategoryDonut(checkIns) {
  const counts = { traffic: 0, health: 0, family: 0, technical: 0, ontime: 0 };
  checkIns.forEach((c) => {
    const key = counts[c.category] !== undefined ? c.category : "ontime";
    counts[key]++;
  });
  const total = checkIns.length || 1;
  let cumulative = 0;
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([key, count]) => {
      const pct = count / total;
      const seg = { key, count, pct, offset: cumulative };
      cumulative += pct;
      return seg;
    });
}

const SLOTS = [
  { key: "08:00", min: 0, max: 8 * 60 + 29 },
  { key: "08:30", min: 8 * 60 + 30, max: 8 * 60 + 59 },
  { key: "09:00", min: 9 * 60, max: 9 * 60 + 29 },
  { key: "09:30", min: 9 * 60 + 30, max: 9 * 60 + 59 },
  { key: "10:00", min: 10 * 60, max: 24 * 60 },
];

export function buildArrivalBars(checkIns) {
  const counts = SLOTS.map((s) => ({ time: s.key, count: 0, slot: s.key }));
  checkIns.forEach((c) => {
    const [h, m] = c.arrival.split(":").map(Number);
    const mins = h * 60 + m;
    const slot = SLOTS.find((s) => mins >= s.min && mins <= s.max);
    if (slot) {
      const row = counts.find((x) => x.time === slot.key);
      if (row) row.count++;
    }
  });
  return counts;
}

export function formatDelta(d) {
  if (!d || d === 0) return "Zamanında";
  return `+${d} dk geç`;
}

export function deltaColor(d) {
  if (!d || d === 0) return "#34d399";
  if (d < 30) return "#f59e0b";
  return "#ef4444";
}

export function groupCheckInsByEmployee(records) {
  const map = new Map();
  for (const r of records) {
    const key = r.employeeId || r.name || "unknown";
    if (!map.has(key)) {
      map.set(key, {
        employeeId: key,
        name: r.name || "Çalışan",
        dept: r.dept || "",
        avatar: r.avatar || "??",
        records: [],
      });
    }
    map.get(key).records.push(r);
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      records: g.records.sort(
        (a, b) =>
          (b.date || "").localeCompare(a.date || "") ||
          (a.arrival || "").localeCompare(b.arrival || ""),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
