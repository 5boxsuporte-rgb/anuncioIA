import { lineBlocks, meaningfulWords, normalize, words } from "./text";

/**
 * CRITÉRIOS DE PONTUAÇÃO (documentados)
 *
 * Cada categoria soma 100 pontos distribuídos em verificações objetivas e determinísticas
 * (nenhuma nota vem da IA). A nota da categoria = pontos ganhos / pontos possíveis.
 * A nota geral é a média ponderada das categorias avaliadas (pesos em `CATEGORY_WEIGHTS`).
 *
 * As notas medem a aderência a boas práticas observáveis no texto/dados do anúncio.
 * NÃO são previsão de vendas nem garantia de resultado.
 */

export interface ScoringInput {
  title: string;
  description: string;
  attributes: { name: string; value: string }[];
  brand: string | null;
  price: string | null;
  /** null = desconhecido (ex.: inserção manual) */
  imageCount: number | null;
  faqCount: number;
}

export interface CheckResult {
  id: string;
  label: string;
  points: number;
  earned: number;
  detail: string;
}

const check = (id: string, label: string, points: number, earned: number, detail: string): CheckResult => ({
  id,
  label,
  points,
  earned: Math.max(0, Math.min(points, earned)),
  detail,
});

const PROMO_TERMS = /(frete gr[aá]tis|promo[cç][aã]o|oferta|barat[oa]|melhor pre[cç]o|imperd[ií]vel|liquida[cç][aã]o|super desconto|aproveite|\$|!{1,})/i;
const CONTACT = /(https?:\/\/|www\.|\b\w+@\w+\.\w+|\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}|whats\s?app|zap\b|instagram\.com|@\w{3,})/i;

/* --------------------------------- TÍTULO --------------------------------- */
export function titleChecks(i: ScoringInput): CheckResult[] {
  const t = i.title.trim();
  const len = t.length;
  const lenPts = len >= 40 && len <= 60 ? 30 : len >= 25 && len < 40 ? 18 : len > 60 && len <= 70 ? 12 : len > 70 ? 5 : 0;
  const lower = normalize(t);
  const brandName = i.brand ?? i.attributes.find((a) => /^marca$/i.test(normalize(a.name)))?.value ?? null;
  const hasBrand = !!brandName && lower.includes(normalize(brandName));

  const attrValues = i.attributes
    .filter((a) => !/^marca$/i.test(normalize(a.name)))
    .flatMap((a) => meaningfulWords(a.value))
    .filter((w) => w.length > 2);
  const titleWords = new Set(words(t));
  const hasAttr = /\d+\s?(cm|mm|kg|g|ml|l|w|v|un|pcs|pecas|peças|divis)/i.test(t) || attrValues.some((w) => titleWords.has(w));

  const noPromo = !PROMO_TERMS.test(t);
  const letters = t.replace(/[^A-Za-zÀ-ÿ]/g, "");
  const upper = letters.replace(/[^A-ZÀ-Þ]/g, "");
  const capsRatio = letters.length ? upper.length / letters.length : 0;
  const mw = meaningfulWords(t);
  const counts = new Map<string, number>();
  mw.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  const repeated = [...counts.entries()].filter(([, n]) => n > 1).map(([w]) => w);

  return [
    check("title.length", "Tamanho entre 40 e 60 caracteres", 30, lenPts, `${len} caracteres (o Mercado Livre limita a 60).`),
    check("title.brand", "Menciona a marca", 15, hasBrand ? 15 : 0, hasBrand ? "Marca presente no título." : "Marca não encontrada no título."),
    check("title.attributes", "Traz modelo ou atributo-chave (medida, cor, material, quantidade)", 15, hasAttr ? 15 : 0, hasAttr ? "Atributo-chave identificado." : "Nenhum atributo-chave identificado no título."),
    check("title.promo", "Sem termos promocionais ou símbolos", 15, noPromo ? 15 : 0, noPromo ? "Sem termos promocionais." : "Contém termos promocionais/símbolos, não recomendados."),
    check("title.caps", "Sem excesso de letras maiúsculas", 10, capsRatio <= 0.5 ? 10 : capsRatio <= 0.8 ? 4 : 0, `${Math.round(capsRatio * 100)}% das letras em maiúsculas.`),
    check("title.repeat", "Sem palavras repetidas", 15, repeated.length === 0 ? 15 : repeated.length === 1 ? 7 : 0, repeated.length ? `Repetidas: ${repeated.join(", ")}.` : "Nenhuma repetição."),
  ];
}

/* -------------------------------- DESCRIÇÃO -------------------------------- */
export function descriptionChecks(i: ScoringInput): CheckResult[] {
  const d = i.description.trim();
  const len = d.length;
  const lenPts = len >= 500 ? 25 : len >= 250 ? 15 : len >= 100 ? 8 : 0;
  const blocks = lineBlocks(d).length;
  const n = normalize(d);
  const has = (re: RegExp) => re.test(n);
  return [
    check("desc.length", "Tamanho (500+ caracteres)", 25, lenPts, `${len} caracteres.`),
    check("desc.structure", "Texto organizado em blocos/linhas", 15, blocks >= 6 ? 15 : blocks >= 3 ? 10 : blocks === 2 ? 4 : 0, `${blocks} blocos de texto.`),
    check("desc.specs", "Apresenta especificações (medidas, material, ficha)", 15, has(/(especifica|ficha tecnica|dimens|medidas|material|peso|capacidade)/) ? 15 : 0, "Procura por especificações técnicas."),
    check("desc.benefits", "Explica benefícios e usos", 15, has(/(beneficio|vantagem|ideal para|perfeito para|facilita|permite|ajuda|pratic|organiza)/) ? 15 : 0, "Procura por benefícios e situações de uso."),
    check("desc.package", "Informa o conteúdo da embalagem", 15, has(/(acompanha|conteudo da embalagem|itens inclu|inclui|na embalagem|voce recebe)/) ? 15 : 0, "Procura por conteúdo da embalagem."),
    check("desc.contact", "Sem links, telefones ou e-mails (proibido pelo marketplace)", 15, CONTACT.test(d) ? 0 : 15, CONTACT.test(d) ? "Há dados de contato/links." : "Sem dados de contato."),
  ];
}

/* ------------------------------- INFORMAÇÕES ------------------------------- */
const INFO_KEYS: { key: string; label: string; attr: RegExp; text: RegExp }[] = [
  { key: "marca", label: "Marca", attr: /^marca/, text: /marca\s*[:\-–]/ },
  { key: "modelo", label: "Modelo", attr: /^modelo/, text: /modelo\s*[:\-–]/ },
  { key: "material", label: "Material", attr: /material/, text: /material\s*[:\-–]|feito de|fabricad[oa] em/ },
  { key: "cor", label: "Cor", attr: /^cor|cores/, text: /cor(es)?\s*[:\-–]/ },
  { key: "dimensoes", label: "Dimensões", attr: /dimens|altura|largura|comprimento|medida|tamanho/, text: /(dimens|medidas|altura|largura|comprimento|tamanho)\w*\s*[:\-–]|\d+\s?(x|×)\s?\d+/ },
  { key: "quantidade", label: "Quantidade", attr: /quantidade|unidades|pecas|divisorias|compartimentos/, text: /(quantidade|unidades|pecas|divisorias|compartimentos)\s*[:\-–]|\d+\s*(unidades|pecas|divisorias|compartimentos)/ },
  { key: "garantia", label: "Garantia", attr: /garantia/, text: /garantia/ },
  { key: "embalagem", label: "Conteúdo da embalagem", attr: /conteudo|embalagem|itens inclu/, text: /(acompanha|conteudo da embalagem|itens inclu|na embalagem)/ },
];

export function infoChecks(i: ScoringInput): CheckResult[] {
  const attrNames = i.attributes.map((a) => normalize(a.name));
  const text = normalize(`${i.description}\n${i.attributes.map((a) => `${a.name}: ${a.value}`).join("\n")}`);
  return INFO_KEYS.map((k) => {
    const found = attrNames.some((n) => k.attr.test(n)) || k.text.test(text) || (k.key === "marca" && !!i.brand);
    return check(`info.${k.key}`, `${k.label} informado`, 12.5, found ? 12.5 : 0, found ? "Informado." : "Não encontrado no anúncio.");
  });
}

/* -------------------------------- BENEFÍCIOS -------------------------------- */
export function benefitsChecks(i: ScoringInput): CheckResult[] {
  const blocks = lineBlocks(i.description);
  const bullets = blocks.filter((l) => /^[-•*✔✅✓➤►▪●]/.test(l) || /^\d+[.)]\s/.test(l));
  const benefitLines = blocks.filter((l) => /(beneficio|vantagem)/.test(normalize(l)));
  const count = new Set([...bullets, ...benefitLines]).size;
  const countPts = count >= 5 ? 40 : count >= 3 ? 25 : count >= 1 ? 10 : 0;
  const rich = blocks.filter((l) => l.length > 30).length;
  const n = normalize(i.description);
  const useCase = /(ideal para|perfeito para|ajuda a|facilita|evita|permite|para voce|para quem)/.test(n);
  const concrete = /\d+\s?(cm|mm|kg|g|ml|l|w|v|unidades|pecas|divisorias|compartimentos|anos|meses)/.test(n);
  return [
    check("ben.count", "5 ou mais benefícios listados", 40, countPts, `${count} itens de benefício/lista identificados.`),
    check("ben.detail", "Benefícios explicados (3+ linhas descritivas)", 20, rich >= 3 ? 20 : rich >= 1 ? 8 : 0, `${rich} linhas descritivas.`),
    check("ben.usecase", "Mostra situações de uso", 20, useCase ? 20 : 0, useCase ? "Há situações de uso." : "Não há situações de uso claras."),
    check("ben.concrete", "Usa dados concretos (medidas, quantidades)", 20, concrete ? 20 : 0, concrete ? "Dados concretos presentes." : "Sem dados concretos."),
  ];
}

/* ----------------------------------- SEO ----------------------------------- */
export function seoChecks(i: ScoringInput): CheckResult[] {
  const tw = [...new Set(meaningfulWords(i.title))];
  const dWords = meaningfulWords(i.description);
  const dSet = new Set(dWords);
  const coverage = tw.length ? tw.filter((w) => dSet.has(w)).length / tw.length : 0;
  const head = new Set(meaningfulWords(i.description.slice(0, 220)));
  const inHead = tw.slice(0, 3).some((w) => head.has(w));
  const unique = dWords.length ? new Set(dWords).size / dWords.length : 0;
  const freq = new Map<string, number>();
  dWords.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
  const maxShare = dWords.length ? Math.max(...freq.values()) / dWords.length : 0;
  const titleCounts = new Map<string, number>();
  meaningfulWords(i.title).forEach((w) => titleCounts.set(w, (titleCounts.get(w) ?? 0) + 1));
  const titleStuffed = [...titleCounts.values()].some((n) => n > 2);
  return [
    check("seo.titleTerms", "Título com 3+ termos relevantes", 20, tw.length >= 4 ? 20 : tw.length === 3 ? 14 : tw.length === 2 ? 7 : 0, `${tw.length} termos relevantes no título.`),
    check("seo.coverage", "Termos do título presentes na descrição", 20, coverage >= 0.7 ? 20 : coverage >= 0.4 ? 10 : 0, `${Math.round(coverage * 100)}% dos termos do título aparecem na descrição.`),
    check("seo.head", "Termo principal no início da descrição", 15, inHead ? 15 : 0, inHead ? "Presente nos primeiros 220 caracteres." : "Ausente do início da descrição."),
    check("seo.length", "Texto suficiente para indexação (300+ caracteres)", 15, i.description.length >= 300 ? 15 : i.description.length >= 150 ? 7 : 0, `${i.description.length} caracteres.`),
    check("seo.variety", "Vocabulário variado, sem repetição excessiva", 15, dWords.length >= 20 && unique >= 0.5 && maxShare <= 0.08 ? 15 : dWords.length >= 20 && unique >= 0.4 ? 8 : 0, `${Math.round(unique * 100)}% de palavras únicas.`),
    check("seo.stuffing", "Título sem palavras-chave empilhadas", 15, titleStuffed ? 0 : 15, titleStuffed ? "Palavra repetida mais de 2 vezes." : "Sem empilhamento."),
  ];
}

/* -------------------------------- CONVERSÃO -------------------------------- */
export function conversionChecks(i: ScoringInput): CheckResult[] {
  const n = normalize(`${i.description}\n${i.attributes.map((a) => `${a.name} ${a.value}`).join("\n")}`);
  const questions = (i.description.match(/\?/g) ?? []).length;
  const faqOk = i.faqCount >= 5 || questions >= 2 || /perguntas frequentes/.test(n);
  return [
    check("conv.price", "Preço informado", 10, i.price ? 10 : 0, i.price ? `Preço: ${i.price}.` : "Preço não informado."),
    check("conv.warranty", "Garantia mencionada", 15, /garantia/.test(n) ? 15 : 0, "Procura por garantia."),
    check("conv.package", "Conteúdo da embalagem informado", 15, /(acompanha|conteudo da embalagem|itens inclu|inclui|na embalagem|voce recebe)/.test(n) ? 15 : 0, "Procura por conteúdo da embalagem."),
    check("conv.faq", "Responde dúvidas frequentes (FAQ)", 15, faqOk ? 15 : 0, i.faqCount ? `${i.faqCount} perguntas e respostas.` : `${questions} perguntas no texto.`),
    check("conv.trust", "Reduz risco (envio, troca, nota fiscal, procedência)", 15, /(troca|devolu|nota fiscal|envio|entrega|procedencia|original|lacrad)/.test(n) ? 15 : 0, "Procura por elementos de confiança."),
    check("conv.cta", "Convite claro para a compra", 10, /(compre|garanta|adicione ao carrinho|aproveite para comprar|clique em comprar)/.test(n) ? 10 : 0, "Procura por chamada para ação."),
    check("conv.dimensions", "Responde 'cabe no meu espaço?' (medidas informadas)", 20, /(\d+([.,]\d+)?\s?(x|×)\s?\d+|\d+([.,]\d+)?\s?(cm|mm|m\b|kg|g\b|ml|l\b)|dimens|medidas)/.test(n) ? 20 : 0, "Procura por medidas e dimensões."),
  ];
}

/* ---------------------------------- IMAGENS ---------------------------------- */
export function imageChecks(i: ScoringInput): CheckResult[] {
  const c = i.imageCount ?? 0;
  return [
    check("img.main", "Possui imagem principal", 20, c >= 1 ? 20 : 0, `${c} imagem(ns).`),
    check("img.four", "4+ imagens", 30, c >= 4 ? 30 : c >= 2 ? 12 : 0, `${c} imagem(ns).`),
    check("img.six", "6+ imagens", 25, c >= 6 ? 25 : c >= 5 ? 10 : 0, `${c} imagem(ns).`),
    check("img.eight", "8+ imagens (galeria completa)", 25, c >= 8 ? 25 : c === 7 ? 10 : 0, `${c} imagem(ns).`),
  ];
}
