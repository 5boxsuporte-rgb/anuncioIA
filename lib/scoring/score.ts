import type { AiOutput, Listing, ScoreCategory, ScoreReport } from "@/lib/validation/analysis";
import { composeDescription } from "@/lib/export/format";
import {
  benefitsChecks,
  conversionChecks,
  descriptionChecks,
  imageChecks,
  infoChecks,
  seoChecks,
  titleChecks,
  type CheckResult,
  type ScoringInput,
} from "./criteria";
import { TECH_SHEET_LABELS } from "@/lib/validation/analysis";

export const CATEGORY_WEIGHTS = {
  title: 20,
  description: 20,
  info: 15,
  seo: 15,
  benefits: 10,
  conversion: 10,
  images: 10,
} as const;

const LABELS: Record<ScoreCategory["key"], string> = {
  title: "Título",
  description: "Descrição",
  info: "Informações",
  benefits: "Benefícios",
  seo: "SEO",
  conversion: "Conversão",
  images: "Imagens",
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function buildCategory(key: ScoreCategory["key"], checks: CheckResult[], evaluated = true): ScoreCategory {
  const max = checks.reduce((s, c) => s + c.points, 0);
  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const score = Math.round((earned / max) * 100);
  const failed = checks.filter((c) => c.earned < c.points);
  let explanation: string;
  if (!evaluated) {
    explanation = "Não avaliado: não há dados suficientes (ex.: imagens não são lidas na inserção manual).";
  } else if (!failed.length) {
    explanation = "Todos os critérios desta categoria foram atendidos.";
  } else {
    const ok = checks.length - failed.length;
    explanation = `${ok} de ${checks.length} critérios atendidos. A melhorar: ${failed
      .slice(0, 3)
      .map((c) => c.label.toLowerCase())
      .join("; ")}.`;
  }
  return {
    key,
    label: LABELS[key],
    weight: evaluated ? CATEGORY_WEIGHTS[key] : 0,
    score: evaluated ? score : 0,
    evaluated,
    explanation,
    checks: checks.map((c) => ({ ...c, earned: round1(c.earned) })),
  };
}

/** Calcula as notas a partir de dados normalizados. Função pura e determinística. */
export function scoreInput(input: ScoringInput): ScoreReport {
  const imagesKnown = input.imageCount !== null;
  const categories: ScoreCategory[] = [
    buildCategory("title", titleChecks(input)),
    buildCategory("description", descriptionChecks(input)),
    buildCategory("info", infoChecks(input)),
    buildCategory("benefits", benefitsChecks(input)),
    buildCategory("seo", seoChecks(input)),
    buildCategory("conversion", conversionChecks(input)),
    buildCategory("images", imageChecks(input), imagesKnown),
  ];
  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const overall = totalWeight ? Math.round(categories.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight) : 0;
  return { overall, categories };
}

/** Nota do anúncio ORIGINAL. */
export function scoreListing(listing: Listing): ScoreReport {
  return scoreInput({
    title: listing.title,
    description: [listing.description, ...listing.characteristics, listing.additionalInfo].filter(Boolean).join("\n"),
    attributes: listing.attributes,
    brand: listing.brand,
    price: listing.price,
    imageCount: listing.source === "manual" ? null : listing.imageCount,
    faqCount: 0,
  });
}

/**
 * Nota POTENCIAL do anúncio otimizado, usando exatamente os mesmos critérios.
 * Em imagens, considera o plano sugerido (só vale se o vendedor aplicá-lo).
 */
export function scoreOptimized(ai: AiOutput, listing: Listing): ScoreReport {
  const attributes = (Object.keys(TECH_SHEET_LABELS) as (keyof typeof TECH_SHEET_LABELS)[])
    .filter((k) => ai.technicalSheet[k])
    .map((k) => ({ name: TECH_SHEET_LABELS[k], value: ai.technicalSheet[k] as string }));
  const benefitLines = ai.benefits.map((b) => `- ${b.title}: ${b.explanation}`).join("\n");
  return scoreInput({
    title: ai.title.recommended,
    description: `${composeDescription(ai.description)}\n${benefitLines}`,
    attributes,
    brand: ai.technicalSheet.marca ?? listing.brand,
    price: listing.price,
    imageCount: listing.source === "manual" ? null : ai.imageSuggestions.length,
    faqCount: ai.faq.length,
  });
}
