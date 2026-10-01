import { z } from "zod";

/**
 * Schema Zod da resposta da IA (e do resultado final).
 * A nota (`score`) NÃO vem da IA: é calculada por lib/scoring (critérios documentados).
 */

const str = (max = 2000) => z.string().trim().min(1).max(max);
const nullableStr = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .transform((v) => (v === null || v === "" ? null : v));

export const technicalSheetSchema = z.object({
  marca: nullableStr,
  modelo: nullableStr,
  material: nullableStr,
  cor: nullableStr,
  dimensoes: nullableStr,
  peso: nullableStr,
  capacidade: nullableStr,
  voltagem: nullableStr,
  potencia: nullableStr,
  compatibilidade: nullableStr,
  quantidade: nullableStr,
  garantia: nullableStr,
  conteudoEmbalagem: nullableStr,
});

export const TECH_SHEET_LABELS: Record<keyof z.infer<typeof technicalSheetSchema>, string> = {
  marca: "Marca",
  modelo: "Modelo",
  material: "Material",
  cor: "Cor",
  dimensoes: "Dimensões",
  peso: "Peso",
  capacidade: "Capacidade",
  voltagem: "Voltagem",
  potencia: "Potência",
  compatibilidade: "Compatibilidade",
  quantidade: "Quantidade",
  garantia: "Garantia",
  conteudoEmbalagem: "Conteúdo da embalagem",
};

const sceneSchema = z.object({
  time: str(40),
  visual: str(500),
  narration: z.string().trim().max(500).default(""),
});

export const aiOutputSchema = z.object({
  analysis: z.object({
    summary: str(1500),
    strengths: z.array(str(400)).max(10),
    problems: z.array(z.object({ area: str(60), problem: str(500) })).max(15),
    /** Dados que não estavam disponíveis no anúncio */
    missingData: z.array(str(300)).max(20),
    /** Fatos extraídos do anúncio */
    facts: z.array(str(400)).max(30),
    /** Inferências feitas pela IA (marcadas como tal) */
    inferences: z.array(str(400)).max(20),
  }),
  title: z.object({
    current: str(300),
    recommended: str(120),
    reasons: z.array(str(400)).min(1).max(8),
    keywordsUsed: z.array(str(80)).max(15),
  }),
  description: z.object({
    intro: str(1500),
    benefits: z.array(str(400)).min(1).max(10),
    characteristics: z.array(str(300)).max(20),
    specifications: z.array(str(300)).max(20),
    usage: str(1200),
    packageContents: str(600),
    importantInfo: str(1200),
  }),
  benefits: z.array(z.object({ title: str(100), explanation: str(400) })).length(5),
  technicalSheet: technicalSheetSchema,
  faq: z.array(z.object({ question: str(300), answer: str(800) })).min(8).max(10),
  keywords: z.object({
    primary: str(80),
    secondary: z.array(str(80)).min(1).max(15),
    longTail: z.array(str(120)).min(1).max(15),
    related: z.array(str(80)).max(15),
    purchaseIntent: z.array(str(80)).max(15),
  }),
  imageSuggestions: z
    .array(
      z.object({
        number: z.number().int().min(1).max(20),
        objective: str(200),
        whatToShow: str(500),
        suggestedText: z.string().trim().max(200).default(""),
        composition: str(500),
      }),
    )
    .min(5)
    .max(10),
  sponsoredAd: z.object({
    variations: z
      .array(z.object({ headline: str(120), primaryText: str(600), cta: str(60) }))
      .length(3),
  }),
  instagram: z.object({
    caption: str(2200),
    story: str(800),
    reelScript: str(1500),
  }),
  whatsapp: z.object({
    fullMessage: str(1500),
    shortMessage: str(400),
    cta: str(200),
  }),
  videoScript: z.object({
    durationSeconds: z.number().int().min(10).max(180),
    scenes: z.array(sceneSchema).min(3).max(12),
  }),
  recommendations: z
    .array(
      z.object({
        problem: str(400),
        potentialImpact: str(400),
        recommendation: str(600),
      }),
    )
    .length(10),
  objections: z
    .array(
      z.object({
        objection: str(300),
        howToAddress: str(600),
        /** Base factual da objeção (qual informação do anúncio sustenta) */
        basis: str(400),
      }),
    )
    .max(10),
  crossSell: z.array(z.object({ category: str(150), rationale: str(400) })).max(6),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;
export type TechnicalSheet = z.infer<typeof technicalSheetSchema>;

export const scoreCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  points: z.number(),
  earned: z.number(),
  detail: z.string(),
});

export const scoreCategorySchema = z.object({
  key: z.enum(["title", "description", "info", "benefits", "seo", "conversion", "images"]),
  label: z.string(),
  weight: z.number(),
  score: z.number().min(0).max(100),
  /** false quando não há dados para avaliar (ex.: imagens em inserção manual) */
  evaluated: z.boolean(),
  explanation: z.string(),
  checks: z.array(scoreCheckSchema),
});

export const scoreReportSchema = z.object({
  overall: z.number().min(0).max(100),
  categories: z.array(scoreCategorySchema),
});

export const listingSchema = z.object({
  source: z.enum(["url", "manual", "demo"]),
  url: z.string().nullable(),
  externalId: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  price: z.string().nullable(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  characteristics: z.array(z.string()),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })),
  additionalInfo: z.string(),
  imageUrls: z.array(z.string()),
  imageCount: z.number().int().min(0),
});

export const analysisResultSchema = aiOutputSchema.extend({
  score: z.object({ before: scoreReportSchema, after: scoreReportSchema }),
  meta: z.object({
    id: z.string(),
    mode: z.enum(["demo", "ai"]),
    createdAt: z.string(),
    listing: listingSchema,
    creditsCharged: z.number().int().min(0),
  }),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type ScoreReport = z.infer<typeof scoreReportSchema>;
export type ScoreCategory = z.infer<typeof scoreCategorySchema>;
