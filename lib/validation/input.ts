import { z } from "zod";
import { sanitizeText } from "@/lib/security/sanitize";

const clean = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((v) => sanitizeText(v, max));

/** Dados enviados manualmente quando o anúncio não pode ser lido automaticamente. */
export const manualListingSchema = z.object({
  title: clean(300).pipe(z.string().min(5, "Informe o título do anúncio.")),
  description: clean(8000).default(""),
  price: clean(40).default(""),
  brand: clean(100).default(""),
  model: clean(100).default(""),
  characteristics: clean(4000).default(""),
  technicalSheet: clean(4000).default(""),
  additionalInfo: clean(4000).default(""),
  url: clean(500).default(""),
});

export type ManualListingInput = z.infer<typeof manualListingSchema>;

export const analyzeRequestSchema = z
  .object({
    demo: z.boolean().optional(),
    url: z.string().max(600).optional(),
    manual: manualListingSchema.optional(),
  })
  .refine((v) => v.demo || v.url || v.manual, {
    message: "Informe o link do anúncio ou os dados manualmente.",
  });

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido.").max(200),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(200),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Informe seu nome.").max(100),
});
