/**
 * Limitador de requisições em memória (janela deslizante).
 * Suficiente para uma instância. Em produção na AWS com várias instâncias/Lambdas,
 * troque o `store` por Redis (ElastiCache) ou DynamoDB mantendo a mesma função.
 */
const store = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs = 60_000, now = Date.now()): RateLimitResult {
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(key, hits);
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
  hits.push(now);
  store.set(key, hits);
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.every((t) => now - t >= windowMs)) store.delete(k);
  }
  return { allowed: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

export function resetRateLimit() {
  store.clear();
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? headers.get("x-real-ip") ?? "local").trim();
}
