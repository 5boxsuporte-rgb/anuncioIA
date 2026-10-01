import { describe, expect, it } from "vitest";
import { extractItemId, validateMercadoLivreUrl } from "@/lib/marketplace/mercadolivre";

describe("validateMercadoLivreUrl", () => {
  it("aceita URLs do Mercado Livre e extrai o código", () => {
    const r = validateMercadoLivreUrl("https://produto.mercadolivre.com.br/MLB-1234567890-organizador-de-maquiagem-_JM");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.externalId).toBe("MLB1234567890");
  });
  it("aceita sem protocolo e normaliza para https", () => {
    const r = validateMercadoLivreUrl("www.mercadolivre.com.br/p/MLB19876543");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url.protocol).toBe("https:");
  });
  it("aceita URL sem código MLB (id nulo)", () => {
    const r = validateMercadoLivreUrl("https://www.mercadolivre.com.br/ofertas");
    expect(r.ok && r.externalId).toBe(null);
  });
  it.each([
    ["", "vazio"],
    ["não é url", "texto"],
    ["https://www.google.com/MLB-123456789", "outro domínio"],
    ["https://mercadolivre.com.br.evil.com/MLB-123456789", "subdomínio falso"],
    ["https://evilmercadolivre.com.br/MLB-123456789", "sufixo falso"],
    ["ftp://produto.mercadolivre.com.br/x", "protocolo"],
    ["https://user:pass@produto.mercadolivre.com.br/x", "credenciais"],
    ["https://produto.mercadolivre.com.br:8080/x", "porta"],
    ["http://localhost/MLB-123456789", "localhost"],
    ["http://169.254.169.254/latest/meta-data", "SSRF metadata"],
  ])("rejeita %s (%s)", (input) => {
    expect(validateMercadoLivreUrl(input).ok).toBe(false);
  });
});

describe("extractItemId", () => {
  it("lê wid da query", () => {
    expect(extractItemId(new URL("https://www.mercadolivre.com.br/p/MLB1?wid=MLB555555555"))).toBe("MLB555555555");
  });
});
