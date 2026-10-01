import { buildRepairPrompt, buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompts/analyzeListing";
import { aiOutputSchema, type AiOutput, type Listing } from "@/lib/validation/analysis";
import { AiProviderError, type AiProvider } from "./types";

/** Extrai o objeto JSON de uma resposta que pode ter cercas de markdown ou texto extra. */
export function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Nenhum objeto JSON encontrado.");
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    // reparo simples: vírgulas finais antes de } ou ]
    return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1"));
  }
}

function tryParse(raw: string): { ok: true; data: AiOutput } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = extractJson(raw);
  } catch (e) {
    return { ok: false, error: `JSON inválido: ${(e as Error).message}` };
  }
  const parsed = aiOutputSchema.safeParse(json);
  if (parsed.success) return { ok: true, data: parsed.data };
  const errors = parsed.error.issues
    .slice(0, 25)
    .map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`)
    .join("\n");
  return { ok: false, error: errors };
}

export class AiInvalidOutputError extends Error {
  constructor() {
    super("A IA devolveu um resultado fora do formato esperado. Tente novamente em instantes.");
    this.name = "AiInvalidOutputError";
  }
}

/**
 * Fluxo: gerar → validar → (se inválido) pedir correção → validar de novo → erro amigável.
 */
export async function generateOptimizedListing(provider: AiProvider, listing: Listing): Promise<AiOutput> {
  const first = await provider.complete({ system: SYSTEM_PROMPT, user: buildUserPrompt(listing) });
  const r1 = tryParse(first);
  if (r1.ok) return r1.data;

  let second: string;
  try {
    second = await provider.complete({ system: SYSTEM_PROMPT, user: buildRepairPrompt(first, r1.error) });
  } catch (e) {
    if (e instanceof AiProviderError) throw e;
    throw new AiInvalidOutputError();
  }
  const r2 = tryParse(second);
  if (r2.ok) return r2.data;
  throw new AiInvalidOutputError();
}
