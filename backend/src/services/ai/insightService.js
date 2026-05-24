import { chatJson, isAiConfigured, getAiInfo } from "./llmClient.js";
import {
  buildWorkforcePlanningContext,
  workforcePayloadForAi,
  summarizeCheckInsForAiTr,
  summarizeTasksForAiTr,
} from "./planningContext.js";

const INSIGHT_SCHEMA = `Yanıtı YALNIZCA geçerli JSON olarak ver. Şema (anahtarlar İngilizce kalır):
{
  "title": "string",
  "observation": "string",
  "analysis": "string",
  "suggestion": "string",
  "metrics": [{"label": "string", "value": "string"}],
  "actions": [{"type": "hire|transfer|ok|risk", "title": "string", "detail": "string", "impact": "Yüksek|Orta|Düşük|—"}],
  "delayRiskPct": number,
  "budgetHint": "string veya null"
}`;

const TURKISH_RULES = `ZORUNLU DİL KURALLARI:
- title, observation, analysis, suggestion, budgetHint, metrics[].label, metrics[].value, actions[].title, actions[].detail alanlarının TAMAMI Türkçe olmalı.
- İngilizce cümle veya paragraf YAZMA (load, efficiency, team, hire, transfer gibi İngilizce terim kullanma).
- Türkçe karşılıklar: yük, verimlilik, kapasite, gecikme, devam, kadro, transfer, işe alım, risk, öneri.
- Verideki departman ve kişi adlarını aynen kullan; uydurma ekleme.
- actions[].impact yalnızca: Yüksek, Orta, Düşük veya —`;

const EXAMPLE_JSON = `Örnek (buna benzer Türkçe yaz):
{
  "title": "Mobil Uygulama Kadro Planı",
  "observation": "Operasyon (%71 yük) ve Güvenlik (%56 yük) yoğun; Veri & BI (%14) ve Tasarım (%20) boş kapasiteye sahip.",
  "analysis": "Mühendislik verimliliği %152 ile yüksek; Satış ve Güvenlik dengeli. 'aaa' departmanında verimlilik verisi eksik — risk belirsiz.",
  "suggestion": "Altyapı ve Veri & BI'dan 3 görevi Operasyon ve Satış'a kaydırın; yeni projeler için 1 kıdemli mühendis planlayın.",
  "metrics": [{"label": "Ortalama yük", "value": "%48"}],
  "actions": [{"type": "transfer", "title": "Görev kaydırma", "detail": "Veri & BI → Operasyon", "impact": "Orta"}],
  "delayRiskPct": 35,
  "budgetHint": null
}`;

const BASE_SYSTEM = `Sen Türkçe yazan bir İK ve operasyon yapay zeka danışmanısın.
${TURKISH_RULES}
${EXAMPLE_JSON}
${INSIGHT_SCHEMA}`;

const USER_LANG_FOOTER =
  "\n\nÖNEMLİ: Tüm metin alanlarını yalnızca Türkçe yaz. İngilizce çıktı kabul edilmez.";

function normalizeInsight(raw, defaults = {}) {
  return {
    title: raw.title || defaults.title || "AI Analiz Notu",
    observation: raw.observation || "",
    analysis: raw.analysis || "",
    suggestion: raw.suggestion || "",
    metrics: Array.isArray(raw.metrics) ? raw.metrics.slice(0, 8) : [],
    actions: Array.isArray(raw.actions) ? raw.actions.slice(0, 6) : [],
    delayRiskPct: typeof raw.delayRiskPct === "number" ? raw.delayRiskPct : defaults.delayRiskPct ?? null,
    budgetHint: raw.budgetHint ?? defaults.budgetHint ?? null,
    source: "openrouter",
  };
}

async function generateInsight(system, user, temperature) {
  const raw = await chatJson({ system, user, temperature });
  return normalizeInsight(raw);
}

export async function generateWorkforceInsight(input) {
  const context = buildWorkforcePlanningContext(input);
  const veri = workforcePayloadForAi(context);

  const user = `Stratejik kadro planlama analizi üret. Aşağıdaki veriler Türkçe etiketlidir.
${JSON.stringify(veri, null, 2)}${USER_LANG_FOOTER}`;

  const insight = await generateInsight(BASE_SYSTEM, user, 0.55);

  return {
    ...insight,
    teamSnapshots: context.teamSnapshots,
  };
}

export async function generateMorningInsightFromData(checkIns) {
  const veri = summarizeCheckInsForAiTr(checkIns);
  const user = `Sabah girişi ve çalışma saati analizi. Veri:
${JSON.stringify(veri, null, 2)}${USER_LANG_FOOTER}`;
  return generateInsight(BASE_SYSTEM, user, 0.5);
}

export async function generateTasksCoachInsight(tasks) {
  const veri = summarizeTasksForAiTr(tasks);
  const user = `Görev koçluğu ve verimlilik analizi. Veri:
${JSON.stringify(veri, null, 2)}${USER_LANG_FOOTER}`;
  return generateInsight(BASE_SYSTEM, user, 0.5);
}

export { isAiConfigured, getAiInfo };
