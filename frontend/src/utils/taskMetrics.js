/** Görev tahmini / harcanan süreye göre verimlilik (%) */
export function calcEfficiency(task) {
  if (task.status === "To Do" || !task.spent) return null;
  if (!task.estimated) return null;
  return Math.round((task.estimated / task.spent) * 100);
}

export function teamEfficiency(tasks) {
  const scored = tasks.filter((t) => calcEfficiency(t) !== null);
  if (!scored.length) return null;
  return Math.round(scored.reduce((s, t) => s + calcEfficiency(t), 0) / scored.length);
}

export function avgEfficiency(tasks) {
  const scored = tasks.filter((t) => calcEfficiency(t) !== null);
  if (!scored.length) return null;
  return Math.round(scored.reduce((s, t) => s + calcEfficiency(t), 0) / scored.length);
}
