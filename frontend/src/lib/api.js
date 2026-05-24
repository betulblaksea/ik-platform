export async function apiFetch(path, { token, method = "GET", body, timeoutMs } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const signal =
    timeoutMs != null && timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError" || e.name === "TimeoutError") {
      throw new Error("İstek zaman aşımına uğradı. Tekrar deneyin.");
    }
    throw e;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "İstek başarısız");
  }
  return data;
}
