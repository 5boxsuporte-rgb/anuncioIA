import type { Listing } from "@/lib/validation/analysis";
import type { ManualListingInput } from "@/lib/validation/input";

const lines = (s: string) =>
  s
    .split(/\n|;/)
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);

/** Converte os dados digitados manualmente para o formato normalizado. */
export function listingFromManual(m: ManualListingInput): Listing {
  const attributes = lines(m.technicalSheet)
    .map((l) => {
      const idx = l.indexOf(":");
      return idx > 0 ? { name: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() } : null;
    })
    .filter((a): a is { name: string; value: string } => !!a && !!a.value);
  if (m.brand) attributes.unshift({ name: "Marca", value: m.brand });
  if (m.model) attributes.unshift({ name: "Modelo", value: m.model });
  return {
    source: "manual",
    url: m.url || null,
    externalId: null,
    title: m.title,
    description: m.description,
    price: m.price || null,
    brand: m.brand || null,
    model: m.model || null,
    characteristics: lines(m.characteristics),
    attributes,
    additionalInfo: m.additionalInfo,
    imageUrls: [],
    imageCount: 0, // desconhecido: não inventamos
  };
}
