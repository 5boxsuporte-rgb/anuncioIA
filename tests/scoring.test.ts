import { describe, expect, it } from "vitest";
import { CATEGORY_WEIGHTS, scoreInput, scoreListing } from "@/lib/scoring/score";
import { DEMO_LISTING } from "@/lib/demo/listing";
import type { ScoringInput } from "@/lib/scoring/criteria";

const empty: ScoringInput = { title: "", description: "", attributes: [], brand: null, price: null, imageCount: 0, faqCount: 0 };

describe("pontuação", () => {
  it("pesos somam 100", () => {
    expect(Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it("anúncio vazio tem nota muito baixa e dentro de 0-100", () => {
    const r = scoreInput(empty);
    expect(r.overall).toBeGreaterThanOrEqual(0);
    expect(r.overall).toBeLessThan(25);
  });
  it("cada categoria soma 100 pontos possíveis", () => {
    const r = scoreInput(empty);
    for (const c of r.categories) expect(c.checks.reduce((s, k) => s + k.points, 0)).toBeCloseTo(100, 5);
  });
  it("é determinística", () => {
    expect(scoreListing(DEMO_LISTING)).toEqual(scoreListing(DEMO_LISTING));
  });
  it("penaliza título promocional e longo", () => {
    const r = scoreListing(DEMO_LISTING);
    const t = r.categories.find((c) => c.key === "title")!;
    expect(t.checks.find((c) => c.id === "title.promo")!.earned).toBe(0);
    expect(t.checks.find((c) => c.id === "title.length")!.earned).toBeLessThan(30);
  });
  it("premia título bom", () => {
    const r = scoreInput({ ...empty, title: "Organizador De Maquiagem Acrílico 12 Divisórias OrganizaMais", brand: "OrganizaMais", attributes: [{ name: "Material", value: "Acrílico" }] });
    const t = r.categories.find((c) => c.key === "title")!;
    expect(t.score).toBeGreaterThanOrEqual(85);
  });
  it("detecta contato externo na descrição", () => {
    const r = scoreInput({ ...empty, description: "Chame no whatsapp (11) 91234-5678 ou www.loja.com" });
    const d = r.categories.find((c) => c.key === "description")!;
    expect(d.checks.find((c) => c.id === "desc.contact")!.earned).toBe(0);
  });
  it("imagens desconhecidas ficam fora da nota geral", () => {
    const r = scoreInput({ ...empty, imageCount: null });
    const img = r.categories.find((c) => c.key === "images")!;
    expect(img.evaluated).toBe(false);
    expect(img.weight).toBe(0);
  });
  it("imagens: mais imagens, nota maior", () => {
    const s = (n: number) => scoreInput({ ...empty, imageCount: n }).categories.find((c) => c.key === "images")!.score;
    expect(s(1)).toBeLessThan(s(4));
    expect(s(4)).toBeLessThan(s(8));
    expect(s(8)).toBe(100);
  });
});
