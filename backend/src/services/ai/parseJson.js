/** Model bazen ```json ... ``` döndürür veya dizi döndürür */
export function parseModelJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return typeof parsed[0] === "object" && parsed[0] !== null ? parsed[0] : parsed;
  }
  return parsed;
}
