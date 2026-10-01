import { generateOptimizedListing } from "@/lib/ai/analyze";
import { getProvider } from "@/lib/ai/provider";
import type { AiProvider } from "@/lib/ai/types";
import { fetchListing } from "@/lib/marketplace/mercadolivre";
import { listingFromManual } from "@/lib/marketplace/manual";
import type { AnalyzeRequest } from "@/lib/validation/input";
import type { AnalysisResult, Listing } from "@/lib/validation/analysis";
import { buildResult } from "./build";
import { createDemoResult } from "./demo";

export type AnalyzeOutcome =
  | { kind: "ok"; result: AnalysisResult }
  | { kind: "needs_manual"; reason: string };

export interface AnalyzeDeps {
  provider?: () => AiProvider;
  fetchListing?: typeof fetchListing;
}

/** Orquestra: obter dados → IA → validar → notas. Não toca em créditos nem banco. */
export async function runAnalysis(req: AnalyzeRequest, deps: AnalyzeDeps = {}): Promise<AnalyzeOutcome> {
  if (req.demo) return { kind: "ok", result: createDemoResult() };

  let listing: Listing;
  if (req.manual) {
    listing = listingFromManual(req.manual);
  } else {
    const fetched = await (deps.fetchListing ?? fetchListing)(req.url ?? "");
    if (fetched.status === "blocked" || !fetched.listing) {
      return { kind: "needs_manual", reason: fetched.reason ?? "" };
    }
    listing = fetched.listing;
  }

  const provider = (deps.provider ?? getProvider)();
  const ai = await generateOptimizedListing(provider, listing);
  return { kind: "ok", result: buildResult(listing, ai, "ai") };
}
