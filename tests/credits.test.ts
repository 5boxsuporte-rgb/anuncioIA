import { beforeEach, describe, expect, it } from "vitest";
import { canConsume, consume, InsufficientCreditsError, remainingCredits, type CreditState } from "@/lib/billing/credits";
import { PLANS } from "@/lib/billing/plans";
import { createMemoryStore } from "@/lib/db/memory";
import { EmailTakenError } from "@/lib/db/types";
import { createDemoResult } from "@/lib/analysis/demo";
import { buildResult } from "@/lib/analysis/build";
import { getDemoOutput } from "@/lib/demo/analysis";
import { DEMO_LISTING } from "@/lib/demo/listing";
import { rateLimit, resetRateLimit } from "@/lib/security/rateLimit";

describe("planos e créditos", () => {
  it("define os limites de cada plano", () => {
    expect([PLANS.FREE.credits, PLANS.BASIC.credits, PLANS.PRO.credits, PLANS.AGENCY.credits]).toEqual([5, 50, 200, 500]);
  });
  it("consome e bloqueia ao esgotar", () => {
    let s: CreditState = { plan: "FREE", creditsUsed: 0 };
    for (let i = 0; i < 5; i++) s = consume(s);
    expect(remainingCredits(s)).toBe(0);
    expect(canConsume(s)).toBe(false);
    expect(() => consume(s)).toThrow(InsufficientCreditsError);
  });
  it("não muta o estado original", () => {
    const s = { plan: "PRO" as const, creditsUsed: 1 };
    consume(s);
    expect(s.creditsUsed).toBe(1);
  });
});

describe("store em memória", () => {
  let store: ReturnType<typeof createMemoryStore>;
  beforeEach(() => {
    store = createMemoryStore();
  });
  it("cria usuário Free com 0 créditos usados e impede e-mail duplicado", async () => {
    const u = await store.createUser({ email: "A@b.com", name: "A", passwordHash: "h" });
    expect(u.plan).toBe("FREE");
    expect(u.creditsUsed).toBe(0);
    await expect(store.createUser({ email: "a@b.com", name: "A", passwordHash: "h" })).rejects.toBeInstanceOf(EmailTakenError);
  });
  it("desconta 1 crédito por análise real até acabar", async () => {
    const u = await store.createUser({ email: "x@y.com", name: "X", passwordHash: "h" });
    for (let i = 0; i < 5; i++) await store.saveAnalysisAndCharge(u.id, buildResult(DEMO_LISTING, getDemoOutput(), "ai"));
    expect((await store.findUserById(u.id))!.creditsUsed).toBe(5);
    await expect(store.saveAnalysisAndCharge(u.id, buildResult(DEMO_LISTING, getDemoOutput(), "ai"))).rejects.toBeInstanceOf(InsufficientCreditsError);
    expect((await store.listAnalyses(u.id)).length).toBe(5);
  });
  it("demo não desconta créditos (resultado demo tem creditsCharged 0)", async () => {
    expect(createDemoResult().meta.creditsCharged).toBe(0);
  });
  it("trocar de plano aumenta o saldo", async () => {
    const u = await store.createUser({ email: "p@q.com", name: "P", passwordHash: "h" });
    await store.setPlan(u.id, "PRO");
    const again = (await store.findUserById(u.id))!;
    expect(remainingCredits(again)).toBe(200);
  });
});

describe("rate limit", () => {
  beforeEach(resetRateLimit);
  it("bloqueia após o limite e libera depois da janela", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, 1000 + i).allowed).toBe(true);
    const blocked = rateLimit("k", 3, 1000, 1500);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(rateLimit("k", 3, 1000, 2500).allowed).toBe(true);
  });
  it("isola chaves", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("b", 1, 1000, 0).allowed).toBe(true);
  });
});
