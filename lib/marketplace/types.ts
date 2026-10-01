import type { Listing } from "@/lib/validation/analysis";

export type UrlCheck =
  | { ok: true; url: URL; externalId: string | null }
  | { ok: false; reason: string };

/** Contrato que qualquer marketplace (ou a API oficial futura) deve cumprir. */
export interface ListingFetchResult {
  status: "ok" | "partial" | "blocked";
  listing?: Listing;
  /** Motivo técnico, apenas para logs (não exibido ao usuário). */
  reason?: string;
}

export interface MarketplaceProvider {
  id: string;
  validateUrl(raw: string): UrlCheck;
  fetchListing(raw: string): Promise<ListingFetchResult>;
}
