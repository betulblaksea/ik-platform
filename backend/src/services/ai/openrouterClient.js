import { openaiCompatibleChatJson } from "./openaiCompatibleClient.js";

const DEFAULT_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";
const FALLBACK_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "deepseek/deepseek-v4-flash:free",
];
const DEFAULT_TIMEOUT_MS = 60_000;

export function getOpenRouterTimeoutMs() {
  const n = Number(process.env.OPENROUTER_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 30_000 ? n : DEFAULT_TIMEOUT_MS;
}

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

function modelChain(preferred) {
  return [...new Set([preferred, ...FALLBACK_MODELS].filter(Boolean))];
}

function openRouterHeaders() {
  const referer =
    process.env.OPENROUTER_HTTP_REFERER?.trim() ||
    process.env.CORS_ORIGIN?.trim() ||
    "http://localhost:5173";
  const title = process.env.OPENROUTER_APP_TITLE?.trim() || "ik-platform";
  return {
    "HTTP-Referer": referer,
    "X-OpenRouter-Title": title,
  };
}

function shouldTryNext(err) {
  return (
    err.code === "AI_QUOTA" ||
    err.code === "AI_PROVIDER_ERROR" ||
    err.code === "AI_EMPTY" ||
    err.code === "AI_PARSE" ||
    err.code === "AI_TIMEOUT" ||
    err.status === 402 ||
    err.status === 404 ||
    err.status === 429 ||
    err.status === 502 ||
    err.status === 503
  );
}

export async function openrouterChatJson(opts) {
  const baseUrl = process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_BASE;
  const preferred = opts.model || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  const models = modelChain(preferred);
  const timeoutMs = opts.timeoutMs ?? getOpenRouterTimeoutMs();
  const baseOpts = {
    baseUrl,
    apiKey: process.env.OPENROUTER_API_KEY,
    providerLabel: "OpenRouter",
    extraHeaders: openRouterHeaders(),
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
