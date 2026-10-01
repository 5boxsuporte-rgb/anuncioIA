import { TECH_SHEET_LABELS, type AiOutput, type AnalysisResult } from "@/lib/validation/analysis";

const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");

/** Monta a descrição em texto puro (formato aceito pelo Mercado Livre). */
export function composeDescription(d: AiOutput["description"]): string {
  const parts: string[] = [d.intro, "", "BENEFÍCIOS", bullets(d.benefits)];
  if (d.characteristics.length) parts.push("", "CARACTERÍSTICAS", bullets(d.characteristics));
  if (d.specifications.length) parts.push("", "ESPECIFICAÇÕES", bullets(d.specifications));
  parts.push("", "COMO USAR", d.usage, "", "CONTEÚDO DA EMBALAGEM", d.packageContents, "", "INFORMAÇÕES IMPORTANTES", d.importantInfo);
  return parts.join("\n");
}

export function technicalSheetRows(sheet: AiOutput["technicalSheet"]) {
  return (Object.keys(TECH_SHEET_LABELS) as (keyof typeof TECH_SHEET_LABELS)[]).map((k) => ({
    key: k,
    label: TECH_SHEET_LABELS[k],
    value: sheet[k],
  }));
}

export function technicalSheetText(sheet: AiOutput["technicalSheet"]): string {
  return technicalSheetRows(sheet)
    .filter((r) => r.value)
    .map((r) => `${r.label}: ${r.value}`)
    .join("\n");
}

export function benefitsText(b: AiOutput["benefits"]): string {
  return b.map((x, i) => `${i + 1}. ${x.title}\n   ${x.explanation}`).join("\n");
}

export function faqText(f: AiOutput["faq"]): string {
  return f.map((x) => `P: ${x.question}\nR: ${x.answer}`).join("\n\n");
}

export function keywordsText(k: AiOutput["keywords"]): string {
  return [
    `Palavra principal: ${k.primary}`,
    `Secundárias: ${k.secondary.join(", ")}`,
    `Long tail: ${k.longTail.join(", ")}`,
    `Relacionados: ${k.related.join(", ")}`,
    `Intenção de compra: ${k.purchaseIntent.join(", ")}`,
  ].join("\n");
}

export function imagesText(imgs: AiOutput["imageSuggestions"]): string {
  return imgs
    .map(
      (i) =>
        `Imagem ${i.number}: ${i.objective}\n  Mostrar: ${i.whatToShow}\n  Texto sugerido: ${i.suggestedText || "-"}\n  Composição: ${i.composition}`,
    )
    .join("\n\n");
}

export function sponsoredText(s: AiOutput["sponsoredAd"]): string {
  return s.variations.map((v, i) => `Variação ${i + 1}\nTítulo: ${v.headline}\nTexto: ${v.primaryText}\nCTA: ${v.cta}`).join("\n\n");
}

export function videoText(v: AiOutput["videoScript"]): string {
  return [`Duração: ${v.durationSeconds}s`, ...v.scenes.map((s) => `[${s.time}] ${s.visual}${s.narration ? ` — "${s.narration}"` : ""}`)].join("\n");
}

export function recommendationsText(r: AiOutput["recommendations"]): string {
  return r.map((x, i) => `${i + 1}. Problema: ${x.problem}\n   Impacto potencial: ${x.potentialImpact}\n   Recomendação: ${x.recommendation}`).join("\n\n");
}

export function objectionsText(o: AiOutput["objections"]): string {
  return o.map((x) => `- ${x.objection}\n  Como responder: ${x.howToAddress}\n  Base: ${x.basis}`).join("\n");
}

export function crossSellText(c: AiOutput["crossSell"]): string {
  return c.map((x) => `- ${x.category}: ${x.rationale}`).join("\n");
}

/** Anúncio completo, pronto para colar (título, descrição, ficha, FAQ). */
export function fullAdText(r: Pick<AiOutput, "title" | "description" | "benefits" | "technicalSheet" | "faq" | "keywords">): string {
  const sheet = technicalSheetText(r.technicalSheet);
  return [
    "TÍTULO",
    r.title.recommended,
    "",
    "DESCRIÇÃO",
    composeDescription(r.description),
    "",
    "5 BENEFÍCIOS",
    benefitsText(r.benefits),
    ...(sheet ? ["", "FICHA TÉCNICA", sheet] : []),
    "",
    "PERGUNTAS FREQUENTES",
    faqText(r.faq),
    "",
    "PALAVRAS-CHAVE",
    keywordsText(r.keywords),
  ].join("\n");
}

const rule = (t: string) => `\n${"=".repeat(60)}\n${t}\n${"=".repeat(60)}\n`;

/** Relatório completo para download em TXT. */
export function reportText(r: AnalysisResult): string {
  const scoreLines = (rep: AnalysisResult["score"]["before"]) =>
    rep.categories.map((c) => `  ${c.label}: ${c.evaluated ? c.score : "n/a"}/100 — ${c.explanation}`).join("\n");
  return [
    "ANÚNCIOIA — RELATÓRIO DE ANÁLISE",
    `Gerado em: ${new Date(r.meta.createdAt).toLocaleString("pt-BR")}`,
    r.meta.mode === "demo" ? "ATENÇÃO: conteúdo de DEMONSTRAÇÃO (produto fictício)." : "",
    r.meta.listing.url ? `Anúncio: ${r.meta.listing.url}` : "",
    rule("DIAGNÓSTICO"),
    `Nota geral atual: ${r.score.before.overall}/100`,
    `Nota potencial (se aplicar as sugestões): ${r.score.after.overall}/100`,
    "(Notas medem aderência a boas práticas; não garantem aumento de vendas.)",
    "",
    "Notas atuais:",
    scoreLines(r.score.before),
    "",
    r.analysis.summary,
    "",
    "Pontos fortes:",
    bullets(r.analysis.strengths),
    "",
    "Problemas:",
    bullets(r.analysis.problems.map((p) => `${p.area}: ${p.problem}`)),
    "",
    "Dados ausentes:",
    bullets(r.analysis.missingData),
    rule("TÍTULO"),
    `Atual: ${r.title.current}`,
    `Recomendado: ${r.title.recommended}`,
    `Por quê: ${r.title.reasons.join(" | ")}`,
    rule("ANÚNCIO OTIMIZADO COMPLETO"),
    fullAdText(r),
    rule("IMAGENS RECOMENDADAS"),
    imagesText(r.imageSuggestions),
    rule("ANÚNCIO PATROCINADO"),
    sponsoredText(r.sponsoredAd),
    rule("INSTAGRAM"),
    `Legenda:\n${r.instagram.caption}\n\nStory:\n${r.instagram.story}\n\nRoteiro de Reel:\n${r.instagram.reelScript}`,
    rule("WHATSAPP"),
    `Mensagem completa:\n${r.whatsapp.fullMessage}\n\nMensagem curta:\n${r.whatsapp.shortMessage}\n\nCTA: ${r.whatsapp.cta}`,
    rule("ROTEIRO DE VÍDEO"),
    videoText(r.videoScript),
    rule("10 MELHORIAS PRIORITÁRIAS"),
    recommendationsText(r.recommendations),
    rule("OBJEÇÕES DO CLIENTE"),
    objectionsText(r.objections),
    rule("CROSS-SELL (categorias)"),
    crossSellText(r.crossSell),
    "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");
}
