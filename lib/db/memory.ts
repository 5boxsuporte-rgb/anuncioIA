import { randomUUID } from "node:crypto";
import { canConsume, consume, InsufficientCreditsError } from "@/lib/billing/credits";
import type { PlanId } from "@/lib/billing/plans";
import type { AnalysisResult } from "@/lib/validation/analysis";
import { EmailTakenError, type Store, type StoredAnalysisSummary, type UserRecord } from "./types";

/** Armazenamento em memória: ótimo para desenvolvimento e testes (dados somem ao reiniciar). */
export function createMemoryStore(): Store {
  const users = new Map<string, UserRecord>();
  const analyses = new Map<string, { userId: string; summary: StoredAnalysisSummary }>();

  return {
    kind: "memory",
    async createUser({ email, name, passwordHash }) {
      const e = email.toLowerCase();
      for (const u of users.values()) if (u.email === e) throw new EmailTakenError();
      const user: UserRecord = { id: randomUUID(), email: e, name, passwordHash, plan: "FREE", creditsUsed: 0, createdAt: new Date() };
      users.set(user.id, user);
      return { ...user };
    },
    async findUserByEmail(email) {
      const e = email.toLowerCase();
      for (const u of users.values()) if (u.email === e) return { ...u };
      return null;
    },
    async findUserById(id) {
      const u = users.get(id);
      return u ? { ...u } : null;
    },
    async setPlan(userId: string, plan: PlanId) {
      const u = users.get(userId);
      if (u) u.plan = plan;
    },
    async saveAnalysisAndCharge(userId, result: AnalysisResult) {
      const u = users.get(userId);
      if (!u) throw new Error("Usuário não encontrado.");
      if (!canConsume(u)) throw new InsufficientCreditsError();
      const next = consume(u);
      u.creditsUsed = next.creditsUsed;
      analyses.set(result.meta.id, {
        userId,
        summary: {
          id: result.meta.id,
          title: result.meta.listing.title,
          overallScore: result.score.before.overall,
          createdAt: result.meta.createdAt,
        },
      });
    },
    async listAnalyses(userId, limit = 20) {
      return [...analyses.values()]
        .filter((a) => a.userId === userId)
        .map((a) => a.summary)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },
  };
}
