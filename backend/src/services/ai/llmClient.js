import { groqChatJson, isGroqConfigured } from "./groqClient.js";

export async function chatJson(opts) {
  if (!isGroqConfigured()) {
    const err = new Error("GROQ_API_KEY tanımlı değil");
    err.code = "AI_NOT_CONFIGURED";
    throw err;
  }
  return groqChatJson(opts);
}
