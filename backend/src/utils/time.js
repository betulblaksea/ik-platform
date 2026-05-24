/** Yerel tarih YYYY-MM-DD */
export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "09:15" → 09:15'ten itibaren geçen dakika (standart 09:00) */
export function delayFromStandard(arrivalTime, standard = "09:00") {
  const [ah, am] = arrivalTime.split(":").map(Number);
  const [sh, sm] = standard.split(":").map(Number);
  const arrival = ah * 60 + am;
  const start = sh * 60 + sm;
  return Math.max(0, arrival - start);
}
