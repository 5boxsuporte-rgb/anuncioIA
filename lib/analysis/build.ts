import { randomUUID } from "node:crypto";
import { scoreListing, scoreOptimized } from "@/lib/scoring/score";
import type { AiOutput, AnalysisResult, Listing } from "@/lib/validation/analysis";

/** Junta anúncio original + saída da IA + notas calculadas em um resultado final. */
export function buildResult(listing: Listing, ai: AiOutput, mode: "demo" | "ai", id?: string): AnalysisResult {
  return {
    ...ai,
    score: { before: scoreListing(listing), after: scoreOptimized(ai, listing) },
    meta: {
      id: id ?? (mode === "demo" ? `demo-${randomUUID()}` : randomUUID()),
      mode,
      createdAt: new Date().toISOString(),
      listing,
      creditsCharged: mode === "demo" ? 0 : 1,
    },
  };
}
