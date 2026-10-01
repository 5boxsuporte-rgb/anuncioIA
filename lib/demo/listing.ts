import type { Listing } from "@/lib/validation/analysis";

/** Anúncio FICTÍCIO usado no modo demonstração (nenhum dado real). */
export const DEMO_LISTING: Listing = {
  source: "demo",
  url: null,
  externalId: null,
  title: "Organizador De Maquiagem Acrílico Com 12 Divisórias Transparente Promoção!!",
  description:
    "Organizador de maquiagem em acrílico. Muito bonito e útil. Tem várias divisórias para guardar suas coisas. Produto de ótima qualidade, aproveite o frete grátis!",
  price: "R$ 59,90",
  brand: "OrganizaMais",
  model: "OM-12",
  characteristics: ["Acrílico transparente", "12 divisórias", "Uso em penteadeira ou banheiro"],
  attributes: [
    { name: "Marca", value: "OrganizaMais" },
    { name: "Modelo", value: "OM-12" },
    { name: "Material", value: "Acrílico" },
    { name: "Cor", value: "Transparente" },
    { name: "Dimensões", value: "24 cm x 16 cm x 9 cm" },
    { name: "Quantidade de divisórias", value: "12" },
  ],
  additionalInfo: "Condição: Novo",
  imageUrls: [],
  imageCount: 3,
};
