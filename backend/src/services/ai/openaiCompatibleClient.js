import { parseModelJson } from "./parseJson.js";

function chatCompletionsUrl(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  if (/\/chat\/completions$/i.test(base)) return base;
  if (base.endsWith("/v1")) return `${base}/chat/completions`;
  if (base.includes("api.deepseek.com")) return `${base}/chat/completions`;
  return `${base}/v1/chat/completions`;
}

function isQuotaError(message, status) {
  return (
    status === 429 ||
    status === 402 ||
    /quota|rate.?limit|insufficient|out of credits|balance|exceeded|too many requests/i.test(
      String(message),
    )
  );
}

function userFacingMessage(status, apiMessage, providerLabel) {
  if (status === 402 || /out of credits|insufficient_quota/i.test(apiMessage)) {
    return (
      `${providerLabel}: Ücretsiz model kotası dolmuş olabilir. ` +
      `OPENROUTER_MODEL=nvidia/nemotron-3-nano-30b-a3b:free deneyin veya openrouter.ai/credits`
    );
  }
  return apiMessage || `${providerLabel} HTTP ${status}`;
}

function extractAssistantText(choice) {
  const message = choice?.message;
  if (!message) return "";

  const content = message.content;
  if (typeof content === "string" && content.trim()) return content.trim();

  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text || part?.content || "";
      })
      .join("")
      .trim();
    if (joined) return joined;
  }

  return "";
}

export async function openaiCompatibleChatJson({
  baseUrl,
  apiKey,
  model,
  system,
  user,
  temperature = 0.7,
  providerLabel = "API",
  extraHeaders = {},
  jsonMode = true,
  timeoutMs = 60_000,
  maxTokens = 4096,
}) {
  if (!apiKey?.trim()) {
    const err = new Error(`${providerLabel} API anahtarı tanımlı değil`);
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }

  const url = chatCompletionsUrl(baseUrl);
  const ms = Math.max(30_000, Number(timeoutMs) || 60_000);
  const signal = AbortSignal.timeout(ms);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
        ...extraHeaders,
      },
      signal,
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (e) {
    if (e.name === "AbortError" || e.name === "TimeoutError") {
      const err = new Error(
        `${providerLabel} yanıt vermedi (${Math.round(ms / 1000)} sn). Ücretsiz model kuyruğu uzun sürebilir; tekrar deneyin.`,
      );
      err.code = "AI_TIMEOUT";
      throw err;
    }
    throw e;
  }

  const data = await res.json().catch(() => ({}));
  const apiMessage =
    data.error?.message ||
    (typeof data.error === "string" ? data.error : "") ||
    data.message ||
    "";

  if (!res.ok) {
    console.error(`[ai] ${providerLabel} HTTP ${res.status}:`, apiMessage || data);
    const err = new Error(userFacingMessage(res.status, apiMessage, providerLabel));
    err.status = res.status;
    if (isQuotaError(apiMessage, res.status)) err.code = "AI_QUOTA";
    else err.code = "AI_PROVIDER_ERROR";
    throw err;
  }

  const choice = data.choices?.[0];
  const text = extractAssistantText(choice);

  if (!text) {
    console.error(`[ai] ${providerLabel} boş içerik (${model}):`, {
      finish_reason: choice?.finish_reason,
      model: data.model,
      choices: data.choices?.length,
    });
    const err = new Error(`${providerLabel} boş yanıt döndü (model: ${data.model || model})`);
    err.code = "AI_EMPTY";
    throw err;
  }

  try {
    return parseModelJson(text);
  } catch {
    const err = new Error(`${providerLabel} yanıtı JSON değil`);
    err.code = "AI_PARSE";
    err.raw = text;
    throw err;
  }
}
