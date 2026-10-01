import { describe, expect, it } from "vitest";
import { createDemoResult } from "@/lib/analysis/demo";
import { runAnalysis } from "@/lib/analysis/run";
import { analysisResultSchema } from "@/lib/validation/analysis";
import { fullAdText, reportText } from "@/lib/export/format";

describe("análise demo", () => {
  it("gera resultado completo e válido sem IA", async () => {
    const out = await runAnalysis({ demo: true });
    expect(out.kind).toBe("ok");
    if (out.kind !== "ok") return;
    expect(analysisResultSchema.safeParse(out.result).success).toBe(true);
    expect(out.result.meta.mode).toBe("demo");
    expect(out.result.meta.creditsCharged).toBe(0);
  });
  it("tem todas as seções exigidas", () => {
    const r = createDemoResult();
    expect(r.benefits).toHaveLength(5);
    expect(r.faq.length).toBeGreaterThanOrEqual(8);
    expect(r.recommendations).toHaveLength(10);
    expect(r.sponsoredAd.variations).toHaveLength(3);
    expect(r.title.recommended.length).toBeLessThanOrEqual(60);
  });
  it("nota potencial supera a atual", () => {
    const r = createDemoResult();
    expect(r.score.after.overall).toBeGreaterThan(r.score.before.overall);
  });
  it("exportações contêm o conteúdo principal", () => {
    const r = createDemoResult();
    expect(fullAdText(r)).toContain(r.title.recommended);
    const txt = reportText(r);
    for (const s of ["DIAGNÓSTICO", "INSTAGRAM", "WHATSAPP", "10 MELHORIAS", "ANÚNCIO PATROCINADO"]) expect(txt).toContain(s);
  });
});
