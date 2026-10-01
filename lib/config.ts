/** Configuração centralizada. Nenhuma chave é lida fora do servidor. */
export const config = {
  get databaseUrl() {
    return process.env.DATABASE_URL?.trim() || "";
  },
  get authSecret() {
    const s = process.env.AUTH_SECRET?.trim();
    if (s) return s;
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET é obrigatório em produção.");
    }
    return "dev-only-insecure-secret-change-me-0123456789";
  },
  get rateLimitPerMinute() {
    const n = Number(process.env.RATE_LIMIT_PER_MINUTE);
    return Number.isFinite(n) && n > 0 ? n : 10;
  },
};
