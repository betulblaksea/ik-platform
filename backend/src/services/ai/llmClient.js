import { openrouterChatJson, isOpenRouterConfigured } from "./openrouterClient.js";

/** Yalnızca OpenRouter (ücretsiz DeepSeek V4 Flash) */
export function getAiMode() {
  return "openrouter";
}

export function isAiConfigured() {
  return isOpenRouterConfigured();
}

export function getAiInfo() {
  if (!isOpenRouterConfigured()) {
    return {
      configured: false,
      provider: "openrouter",
      model: null,
      hint: "openrouter.ai/keys → OPENROUTER_API_KEY ekleyin",
    };
  }
  return {
    configured: true,
    provider: "openrouter",
    model: process.env.OPENROUTER_MODEL?.trim() || "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "OpenRouter · ücretsiz modeller",
    hint: null,
  };
}

export async function chatJson(opts) {
  if (!isOpenRouterConfigured()) {
    const err = new Error("OPENROUTER_API_KEY tanımlı değil");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  return openrouterChatJson(opts);
}
