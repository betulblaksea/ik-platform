export function formatDuration(value, unit = "hours") {
  const v = Number(value) || 0;
  if (unit === "days") {
    if (v === 1) return "1 gün";
    return `${v} gün`;
  }
  if (v < 1) return `${Math.round(v * 60)} dk`;
  if (v === 1) return "1 saat";
  const h = Math.floor(v);
  const m = Math.round((v - h) * 60);
  if (m === 0) return `${h} saat`;
  return `${h} sa ${m} dk`;
}

export const PRIORITY_META = {
  low: { label: "Düşük", color: "#94a3b8" },
  medium: { label: "Orta", color: "#60a5fa" },
  high: { label: "Yüksek", color: "#f87171" },
};
