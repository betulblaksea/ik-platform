import { openaiCompatibleChatJson } from "./openaiCompatibleClient.js";

const DEFAULT_BASE = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODELS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];
const DEFAULT_TIMEOUT_MS = 60_000;

export function getGroqTimeoutMs() {
  const n = Number(process.env.GROQ_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 15_000 ? n : DEFAULT_TIMEOUT_MS;
}

export function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function modelChain(preferred) {
  return [...new Set([preferred, ...FALLBACK_MODELS].filter(Boolean))];
}

function shouldTryNext(err) {
  return (
    err.code === "AI_QUOTA" ||
    err.code === "AI_PROVIDER_ERROR" ||
    err.code === "AI_EMPTY" ||
    err.code === "AI_PARSE" ||
    err.code === "AI_TIMEOUT" ||
    err.status === 429 ||
    err.status === 502 ||
    err.status === 503
  );
}

export async function groqChatJson(opts) {
  const baseUrl = process.env.GROQ_BASE_URL?.trim() || DEFAULT_BASE;
  const preferred = opts.model || process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const models = modelChain(preferred);
  const timeoutMs = opts.timeoutMs ?? getGroqTimeoutMs();
  const baseOpts = {
    baseUrl,
    apiKey: process.env.GROQ_API_KEY,
    providerLabel: "Groq",
    maxTokens: 4096,
    ...opts,
    timeoutMs,
  };

  let lastError;
  for (const model of models) {
    for (const jsonMode of [true, false]) {
      try {
        return await openaiCompatibleChatJson({
          ...baseOpts,
          model,
          jsonMode,
        });
      } catch (err) {
        lastError = err;
        if (jsonMode && (err.code === "AI_EMPTY" || err.code === "AI_PARSE")) {
          console.warn(`[ai] ${model} jsonMode=${jsonMode} başarısız, JSON modu kapalı deneniyor…`);
          continue;
        }
        if (shouldTryNext(err) && model !== models.at(-1)) {
          console.warn(`[ai] ${model} kullanılamadı (${err.code}), sıradaki model…`);
          break;
        }
        if (shouldTryNext(err) && model === models.at(-1) && jsonMode === false) {
          throw err;
        }
        if (!shouldTryNext(err)) throw err;
      }
    }
  }
  throw lastError;
}
