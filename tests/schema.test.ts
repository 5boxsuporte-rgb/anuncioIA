import { describe, expect, it } from "vitest";
import { AiInvalidOutputError, extractJson, generateOptimizedListing } from "@/lib/ai/analyze";
import { getDemoOutput } from "@/lib/demo/analysis";
import { DEMO_LISTING } from "@/lib/demo/listing";
import { aiOutputSchema } from "@/lib/validation/analysis";
import { runAnalysis } from "@/lib/analysis/run";
import { mockProvider, validAiJson } from "./helpers";

describe("aiOutputSchema", () => {
  it("aceita saída válida", () => {
    expect(aiOutputSchema.safeParse(getDemoOutput()).success).toBe(true);
  });
  it("rejeita número errado de benefícios, FAQ curto e campos faltando", () => {
    const o = getDemoOutput();
    expect(aiOutputSchema.safeParse({ ...o, benefits: o.benefits.slice(0, 4) }).success).toBe(false);
    expect(aiOutputSchema.safeParse({ ...o, faq: o.faq.slice(0, 3) }).success).toBe(false);
    const { crossSell: _ignored, ...rest } = o;
    void _ignored;
    expect(aiOutputSchema.safeParse(rest).success).toBe(false);
  });
  it("normaliza strings vazias da ficha para null", () => {
    const o = getDemoOutput();
    const parsed = aiOutputSchema.parse({ ...o, technicalSheet: { ...o.technicalSheet, peso: "  " } });
    expect(parsed.technicalSheet.peso).toBeNull();
  });
});

describe("extractJson", () => {
  it("lê JSON dentro de cercas markdown e com vírgula final", () => {
    expect(extractJson('```json\n{"a":1,}\n```')).toEqual({ a: 1 });
    expect(extractJson('Aqui está: {"a":[1,2,]} fim')).toEqual({ a: [1, 2] });
  });
  it("falha sem JSON", () => {
    expect(() => extractJson("nada")).toThrow();
  });
});

describe("generateOptimizedListing (reparo)", () => {
  it("aceita de primeira", async () => {
    const p = mockProvider([validAiJson()]);
    await generateOptimizedListing(p, DEMO_LISTING);
    expect(p.calls).toBe(1);
  });
  it("tenta corrigir uma vez quando a primeira resposta é inválida", async () => {
    const p = mockProvider(['{"analysis": 1}', validAiJson()]);
    const out = await generateOptimizedListing(p, DEMO_LISTING);
    expect(p.calls).toBe(2);
    expect(out.benefits).toHaveLength(5);
  });
  it("devolve erro amigável se continuar inválido", async () => {
    const p = mockProvider(["lixo", "mais lixo"]);
    await expect(generateOptimizedListing(p, DEMO_LISTING)).rejects.toBeInstanceOf(AiInvalidOutputError);
    expect(p.calls).toBe(2);
  });
});

describe("runAnalysis (real, com mocks)", () => {
  it("usa a IA e calcula notas", async () => {
    const out = await runAnalysis(
      { manual: { title: "Organizador de maquiagem acrílico", description: "", price: "", brand: "", model: "", characteristics: "", technicalSheet: "", additionalInfo: "", url: "" } },
      { provider: () => mockProvider([validAiJson()]) },
    );
    expect(out.kind).toBe("ok");
    if (out.kind === "ok") {
      expect(out.result.meta.mode).toBe("ai");
      expect(out.result.meta.creditsCharged).toBe(1);
      const images = out.result.score.before.categories.find((c) => c.key === "images");
      expect(images?.evaluated).toBe(false); // manual: imagens não avaliadas
    }
  });
  it("pede inserção manual quando o anúncio está bloqueado", async () => {
    const out = await runAnalysis(
      { url: "https://produto.mercadolivre.com.br/MLB-123456789-x" },
      { fetchListing: async () => ({ status: "blocked", reason: "x" }), provider: () => { throw new Error("não deve chamar IA"); } },
    );
    expect(out.kind).toBe("needs_manual");
  });
});
