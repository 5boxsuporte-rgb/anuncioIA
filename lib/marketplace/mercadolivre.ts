import { sanitizeText } from "@/lib/security/sanitize";
import type { Listing } from "@/lib/validation/analysis";
import type { ListingFetchResult, MarketplaceProvider, UrlCheck } from "./types";

/**
 * Camada do Mercado Livre.
 *
 * Política: só lemos dados PÚBLICOS, com UMA requisição por fonte, identificando-nos
 * com um User-Agent honesto. Se houver bloqueio (HTTP 401/403/429, CAPTCHA, login),
 * NÃO tentamos contornar: devolvemos `blocked` e a interface oferece a inserção manual.
 *
 * Para integrar a API oficial (OAuth) no futuro, basta implementar `fetchFromOfficialApi`
 * e chamá-la antes de `fetchFromPublicApi` em `fetchListing`.
 */

const ALLOWED_HOST = /(^|\.)(mercadolivre|mercadolibre)\.(com\.br|com|com\.ar|com\.mx|cl|com\.co|com\.uy|com\.pe)$/i;
const ID_REGEX = /\b(ML[A-Z])[-_]?(\d{6,})\b/i;
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = "AnuncioIA/0.1 (+analise de anuncios publicos; contato: suporte)";

export function validateMercadoLivreUrl(raw: string): UrlCheck {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, reason: "Cole o link do anúncio." };
  if (value.length > 600) return { ok: false, reason: "O link é longo demais." };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return { ok: false, reason: "Este link não parece válido." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "Use um link http ou https." };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "O link não pode conter usuário ou senha." };
  }
  if (url.port && url.port !== "443" && url.port !== "80") {
    return { ok: false, reason: "O link possui uma porta não permitida." };
  }
  if (!ALLOWED_HOST.test(url.hostname)) {
    return { ok: false, reason: "Este link não é do Mercado Livre. Use um link como mercadolivre.com.br/..." };
  }
  url.protocol = "https:";
  url.hash = "";
  return { ok: true, url, externalId: extractItemId(url) };
}

/** Extrai o código MLB… (anúncio) do caminho ou da query da URL. */
export function extractItemId(url: URL): string | null {
  const candidates = [decodeURIComponent(url.pathname), url.searchParams.get("wid") ?? "", url.searchParams.get("item_id") ?? ""];
  for (const c of candidates) {
    const m = c.match(ID_REGEX);
    if (m) return `${m[1].toUpperCase()}${m[2]}`;
  }
  return null;
}

async function safeFetch(url: string, accept: string): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept, "accept-language": "pt-BR,pt;q=0.9" },
      redirect: "manual", // nunca seguimos redirecionamentos (evita SSRF e desvio para login)
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

/* ---------------------------- Parsers (puros, testáveis) ---------------------------- */

interface ApiItem {
  id?: string;
  title?: string;
  price?: number;
  currency_id?: string;
  condition?: string;
  warranty?: string | null;
  pictures?: { secure_url?: string; url?: string }[];
  attributes?: { id?: string; name?: string; value_name?: string | null }[];
  permalink?: string;
}

function formatPrice(price?: number, currency?: string): string | null {
  if (typeof price !== "number") return null;
  const prefix = currency === "BRL" || !currency ? "R$ " : `${currency} `;
  return `${prefix}${price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function parseApiItem(item: ApiItem, description: string, url: string | null): Listing | null {
  const title = sanitizeText(item.title, 300);
  if (!title) return null;
  const attrs = (item.attributes ?? [])
    .filter((a) => a.name && a.value_name)
    .map((a) => ({ name: sanitizeText(a.name, 80), value: sanitizeText(a.value_name, 200) }))
    .slice(0, 60);
  const byId = (id: string) => item.attributes?.find((a) => a.id === id)?.value_name ?? null;
  const imageUrls = (item.pictures ?? [])
    .map((p) => p.secure_url ?? p.url ?? "")
    .filter(Boolean)
    .slice(0, 30);
  const extra: string[] = [];
  if (item.condition) extra.push(`Condição: ${item.condition === "new" ? "Novo" : item.condition === "used" ? "Usado" : item.condition}`);
  if (item.warranty) extra.push(`Garantia: ${sanitizeText(item.warranty, 200)}`);
  return {
    source: "url",
    url,
    externalId: item.id ?? null,
    title,
    description: sanitizeText(description, 8000),
    price: formatPrice(item.price, item.currency_id),
    brand: byId("BRAND") ? sanitizeText(byId("BRAND"), 100) : null,
    model: byId("MODEL") ? sanitizeText(byId("MODEL"), 100) : null,
    characteristics: [],
    attributes: attrs,
    additionalInfo: extra.join("\n"),
    imageUrls,
    imageCount: imageUrls.length,
  };
}

interface JsonLdProduct {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[];
  brand?: { name?: string } | string;
  sku?: string;
  offers?: { price?: string | number; priceCurrency?: string } | { price?: string | number; priceCurrency?: string }[];
}

function collectJsonLd(html: string): JsonLdProduct[] {
  const out: JsonLdProduct[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : data?.["@graph"] ? data["@graph"] : [data];
      for (const d of list) if (d && typeof d === "object") out.push(d as JsonLdProduct);
    } catch {
      /* ignora bloco inválido */
    }
  }
  return out;
}

export function looksBlocked(html: string): boolean {
  const lower = html.slice(0, 60_000).toLowerCase();
  return (
    lower.includes("captcha") ||
    lower.includes("recaptcha") ||
    lower.includes("/gz/account-verification") ||
    lower.includes("negative_traffic") ||
    (lower.includes("<title>") && /<title>[^<]*(acesse sua conta|ingres[ae] a tu cuenta|login)/i.test(lower))
  );
}

export function parseProductHtml(html: string, url: string | null, externalId: string | null): Listing | null {
  if (looksBlocked(html)) return null;
  const product = collectJsonLd(html).find((d) => {
    const t = d["@type"];
    return t === "Product" || (Array.isArray(t) && t.includes("Product"));
  });
  const og = (prop: string) =>
    html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']*)["']`, "i"))?.[1] ?? "";
  const title = sanitizeText(product?.name || og("title"), 300);
  if (!title) return null;
  const images = ([] as string[])
    .concat(product?.image ?? [], og("image") || [])
    .filter((s) => typeof s === "string" && s.startsWith("http"))
    .slice(0, 30);
  const offer = Array.isArray(product?.offers) ? product?.offers[0] : product?.offers;
  const brand = typeof product?.brand === "string" ? product.brand : product?.brand?.name;
  const price = offer?.price !== undefined ? formatPrice(Number(offer.price), offer.priceCurrency) : null;
  return {
    source: "url",
    url,
    externalId,
    title,
    description: sanitizeText(product?.description || og("description"), 8000),
    price,
    brand: brand ? sanitizeText(brand, 100) : null,
    model: null,
    characteristics: [],
    attributes: [],
    additionalInfo: "",
    imageUrls: [...new Set(images)],
    imageCount: new Set(images).size,
  };
}

/* ------------------------------- Busca de dados ------------------------------- */

async function fetchFromPublicApi(id: string, url: string): Promise<Listing | null> {
  const res = await safeFetch(`https://api.mercadolibre.com/items/${id}`, "application/json");
  if (!res || !res.ok) return null;
  let item: ApiItem;
  try {
    item = (await res.json()) as ApiItem;
  } catch {
    return null;
  }
  let description = "";
  const dres = await safeFetch(`https://api.mercadolibre.com/items/${id}/description`, "application/json");
  if (dres?.ok) {
    try {
      description = String(((await dres.json()) as { plain_text?: string }).plain_text ?? "");
    } catch {
      /* descrição é opcional */
    }
  }
  return parseApiItem(item, description, url);
}

async function fetchFromPublicPage(url: URL, id: string | null): Promise<Listing | null> {
  const res = await safeFetch(url.toString(), "text/html");
  if (!res || !res.ok) return null;
  const html = (await res.text()).slice(0, 2_000_000);
  return parseProductHtml(html, url.toString(), id);
}

export async function fetchListing(raw: string): Promise<ListingFetchResult> {
  const check = validateMercadoLivreUrl(raw);
  if (!check.ok) return { status: "blocked", reason: check.reason };

  // 1) API pública (se o anúncio tiver código MLB e a API responder sem autenticação)
  if (check.externalId) {
    const fromApi = await fetchFromPublicApi(check.externalId, check.url.toString());
    if (fromApi) return { status: "ok", listing: fromApi };
  }
  // 2) Página pública, uma única requisição, sem seguir redirecionamentos
  const fromPage = await fetchFromPublicPage(check.url, check.externalId);
  if (fromPage) return { status: "partial", listing: fromPage };

  return { status: "blocked", reason: "Dados públicos indisponíveis (bloqueio, login ou erro de rede)." };
}

export const mercadoLivre: MarketplaceProvider = {
  id: "mercadolivre",
  validateUrl: validateMercadoLivreUrl,
  fetchListing,
};

export const BLOCKED_MESSAGE = "Não conseguimos acessar automaticamente todas as informações deste anúncio.";
