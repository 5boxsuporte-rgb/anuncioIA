import { AiProviderError } from "./types";

/** POST JSON com timeout. Mensagens de erro nunca incluem chaves nem payload. */
export async function postJson(url: string, headers: Record<string, string>, body: unknown, timeoutMs = 90_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new AiProviderError(`O provedor de IA respondeu com erro ${res.status}.`);
    }
    return (await res.json()) as unknown;
  } catch (e) {
    if (e instanceof AiProviderError) throw e;
    throw new AiProviderError("Não foi possível falar com o provedor de IA.");
  } finally {
    clearTimeout(timer);
  }
}
