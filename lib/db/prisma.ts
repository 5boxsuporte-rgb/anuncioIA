import { PrismaClient, Prisma } from "@prisma/client";
import { canConsume, InsufficientCreditsError } from "@/lib/billing/credits";
import type { PlanId } from "@/lib/billing/plans";
import type { AnalysisResult } from "@/lib/validation/analysis";
import { EmailTakenError, type Store, type UserRecord } from "./types";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function client(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = new PrismaClient();
  return globalForPrisma.prisma;
}

const toUser = (u: { id: string; email: string; name: string; passwordHash: string; plan: string; creditsUsed: number; createdAt: Date }): UserRecord => ({
  ...u,
  plan: u.plan as PlanId,
});

/** Armazenamento PostgreSQL via Prisma (requer DATABASE_URL e `npm run db:push`). */
export function createPrismaStore(): Store {
  const db = client();
  return {
    kind: "postgres",
    async createUser({ email, name, passwordHash }) {
      try {
        return toUser(await db.user.create({ data: { email: email.toLowerCase(), name, passwordHash } }));
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new EmailTakenError();
        throw e;
      }
    },
    async findUserByEmail(email) {
      const u = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      return u ? toUser(u) : null;
    },
    async findUserById(id) {
      const u = await db.user.findUnique({ where: { id } });
      return u ? toUser(u) : null;
    },
    async setPlan(userId, plan) {
      await db.user.update({ where: { id: userId }, data: { plan } });
    },
    async saveAnalysisAndCharge(userId, result: AnalysisResult) {
      await db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("Usuário não encontrado.");
        if (!canConsume({ plan: user.plan as PlanId, creditsUsed: user.creditsUsed })) throw new InsufficientCreditsError();
        // Concorrência otimista: só incrementa se o contador não mudou
        const upd = await tx.user.updateMany({
          where: { id: userId, creditsUsed: user.creditsUsed },
          data: { creditsUsed: { increment: 1 } },
        });
        if (upd.count !== 1) throw new InsufficientCreditsError();

        const l = result.meta.listing;
        const product = await tx.product.create({
          data: { userId, externalId: l.externalId, url: l.url, title: l.title, data: l as unknown as Prisma.InputJsonValue },
        });
        const analysis = await tx.analysis.create({
          data: {
            id: result.meta.id,
            userId,
            productId: product.id,
            mode: result.meta.mode,
            overallScore: result.score.before.overall,
            creditsCharged: 1,
            result: result as unknown as Prisma.InputJsonValue,
          },
        });
        const kinds = ["title", "description", "benefits", "technicalSheet", "faq", "keywords", "imageSuggestions", "sponsoredAd", "instagram", "whatsapp", "videoScript", "recommendations", "objections", "crossSell"] as const;
        await tx.generatedContent.createMany({
          data: kinds.map((kind) => ({ analysisId: analysis.id, kind, content: result[kind] as unknown as Prisma.InputJsonValue })),
        });
        await tx.usageRecord.create({ data: { userId, analysisId: analysis.id, credits: 1, reason: "analysis" } });
      });
    },
    async listAnalyses(userId, limit = 20) {
      const rows = await db.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { product: { select: { title: true } } },
      });
      return rows.map((r) => ({ id: r.id, title: r.product?.title ?? "Anúncio", overallScore: r.overallScore, createdAt: r.createdAt.toISOString() }));
    },
  };
}
