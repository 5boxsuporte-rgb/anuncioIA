import { describe, expect, it } from "vitest";
import { looksBlocked, parseApiItem, parseProductHtml } from "@/lib/marketplace/mercadolivre";
import { listingFromManual } from "@/lib/marketplace/manual";
import { manualListingSchema } from "@/lib/validation/input";

describe("parseApiItem", () => {
  it("normaliza item da API pública", () => {
    const l = parseApiItem(
      { id: "MLB1", title: "Organizador <b>Acrílico</b>", price: 59.9, currency_id: "BRL", pictures: [{ secure_url: "https://x/1.jpg" }, { url: "https://x/2.jpg" }], attributes: [{ id: "BRAND", name: "Marca", value_name: "Acme" }, { id: "COLOR", name: "Cor", value_name: "Azul" }] },
      "Descrição <script>alert(1)</script> boa",
      "https://produto.mercadolivre.com.br/x",
    );
    expect(l?.title).toBe("Organizador Acrílico");
    expect(l?.brand).toBe("Acme");
    expect(l?.imageCount).toBe(2);
    expect(l?.description).not.toContain("script");
    expect(l?.price).toContain("59,90");
  });
  it("retorna null sem título", () => {
    expect(parseApiItem({}, "", null)).toBeNull();
  });
});

describe("parseProductHtml", () => {
  const html = `<html><head><meta property="og:title" content="Fallback"><script type="application/ld+json">{"@type":"Product","name":"Produto X","description":"Desc","image":["https://i/1.jpg"],"brand":{"name":"Marca Y"},"offers":{"price":"10.5","priceCurrency":"BRL"}}</script></head></html>`;
  it("lê JSON-LD", () => {
    const l = parseProductHtml(html, "https://u", "MLB1");
    expect(l?.title).toBe("Produto X");
    expect(l?.brand).toBe("Marca Y");
    expect(l?.imageCount).toBe(1);
  });
  it("detecta bloqueio/captcha e não tenta contornar", () => {
    const blocked = "<html><title>Verificação</title><div class='g-recaptcha'>captcha</div></html>";
    expect(looksBlocked(blocked)).toBe(true);
    expect(parseProductHtml(blocked, null, null)).toBeNull();
  });
});

describe("manual", () => {
  it("valida, sanitiza e converte", () => {
    const input = manualListingSchema.parse({ title: "Meu <i>produto</i> legal", brand: "Acme", technicalSheet: "Material: Aço\nCor: Preto", characteristics: "- Leve\n- Forte" });
    const l = listingFromManual(input);
    expect(l.title).toBe("Meu produto legal");
    expect(l.attributes.map((a) => a.name)).toEqual(expect.arrayContaining(["Marca", "Material", "Cor"]));
    expect(l.characteristics).toEqual(["Leve", "Forte"]);
    expect(l.imageCount).toBe(0);
    expect(l.source).toBe("manual");
  });
  it("exige título", () => {
    expect(manualListingSchema.safeParse({ title: "a" }).success).toBe(false);
  });
});
