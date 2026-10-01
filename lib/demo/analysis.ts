import { randomUUID } from "node:crypto";
import { aiOutputSchema, type AiOutput } from "@/lib/validation/analysis";
import { DEMO_LISTING } from "./listing";

/**
 * Resultado de demonstração pré-escrito, baseado SOMENTE nos fatos de DEMO_LISTING.
 * Não chama nenhuma IA e não consome créditos.
 */
const demoOutput: AiOutput = {
  analysis: {
    summary:
      "O anúncio tem um bom produto base (acrílico transparente, 12 divisórias, medidas informadas na ficha), mas o título usa termos promocionais, a descrição é curta e genérica, e há poucas imagens para mostrar medidas e uso.",
    strengths: [
      "Ficha técnica com marca, modelo, material, cor e dimensões preenchidos.",
      "Produto com apelo claro (organização de maquiagem) e quantidade de divisórias informada.",
      "Preço informado.",
    ],
    problems: [
      { area: "Título", problem: "Usa 'Promoção!!' e 'frete grátis' na descrição, termos promocionais não recomendados, e passa de 60 caracteres." },
      { area: "Descrição", problem: "Texto muito curto, sem benefícios, medidas, uso, conteúdo da embalagem ou garantia." },
      { area: "Imagens", problem: "Apenas 3 imagens; faltam fotos de medidas, uso e conteúdo da embalagem." },
      { area: "Conversão", problem: "Não responde dúvidas comuns, como 'cabe na minha penteadeira?' ou 'quais itens cabem?'." },
    ],
    missingData: [
      "Peso do produto",
      "Garantia",
      "Conteúdo exato da embalagem (quantidade de peças)",
      "Capacidade de peso por divisória",
      "Instruções de limpeza e cuidados",
    ],
    facts: [
      "Marca OrganizaMais, modelo OM-12.",
      "Material acrílico, cor transparente.",
      "12 divisórias.",
      "Dimensões: 24 cm x 16 cm x 9 cm.",
      "Indicado para penteadeira ou banheiro.",
      "Preço R$ 59,90, condição novo.",
    ],
    inferences: [
      "Inferência: por ser transparente, o conteúdo provavelmente fica visível sem abrir gavetas.",
      "Inferência: as divisórias servem para separar itens como batons, pincéis e esmaltes (confirmar tamanhos com o vendedor).",
    ],
  },
  title: {
    current: DEMO_LISTING.title,
    recommended: "Organizador De Maquiagem Acrílico 12 Divisórias OrganizaMais",
    reasons: [
      "Remove 'Promoção!!', que não é recomendado em títulos.",
      "Inclui a marca e a quantidade de divisórias, que são fatos do anúncio.",
      "Fica dentro de 60 caracteres e sem palavras repetidas.",
    ],
    keywordsUsed: ["organizador de maquiagem", "acrílico", "12 divisórias", "OrganizaMais"],
  },
  description: {
    intro:
      "O Organizador de Maquiagem OrganizaMais OM-12 é feito em acrílico transparente e possui 12 divisórias para separar e guardar seus produtos de maquiagem de forma visível e organizada.",
    benefits: [
      "Acrílico transparente: facilita ver o que está guardado.",
      "12 divisórias: ajudam a separar os itens por tipo.",
      "Medidas compactas (24 x 16 x 9 cm): podem se adequar a penteadeiras e bancadas de banheiro.",
    ],
    characteristics: ["Marca: OrganizaMais", "Modelo: OM-12", "Material: acrílico", "Cor: transparente", "Quantidade de divisórias: 12"],
    specifications: ["Dimensões: 24 cm x 16 cm x 9 cm", "Condição: novo"],
    usage:
      "Posicione o organizador em uma penteadeira ou bancada de banheiro e distribua seus itens de maquiagem nas divisórias.",
    packageContents: "1 organizador de maquiagem em acrílico com 12 divisórias (confirmar demais itens com o vendedor).",
    importantInfo:
      "Confira as medidas (24 x 16 x 9 cm) antes de comprar para garantir que cabe no espaço desejado. Informações sobre garantia e peso devem ser confirmadas com o vendedor.",
  },
  benefits: [
    { title: "Visualização rápida", explanation: "O acrílico transparente permite enxergar os itens guardados." },
    { title: "12 divisórias", explanation: "Espaços separados para organizar produtos por tipo." },
    { title: "Tamanho compacto", explanation: "Mede 24 x 16 x 9 cm, ocupando pouco espaço na bancada." },
    { title: "Uso versátil", explanation: "Indicado para penteadeira ou banheiro, segundo o anúncio." },
    { title: "Visual limpo", explanation: "A cor transparente combina com diferentes ambientes." },
  ],
  technicalSheet: {
    marca: "OrganizaMais",
    modelo: "OM-12",
    material: "Acrílico",
    cor: "Transparente",
    dimensoes: "24 cm x 16 cm x 9 cm",
    peso: null,
    capacidade: null,
    voltagem: null,
    potencia: null,
    compatibilidade: null,
    quantidade: "12 divisórias",
    garantia: null,
    conteudoEmbalagem: "1 organizador (confirmar demais itens com o vendedor)",
  },
  faq: [
    { question: "De que material é feito o organizador?", answer: "Ele é feito de acrílico transparente." },
    { question: "Quantas divisórias ele possui?", answer: "Possui 12 divisórias." },
    { question: "Quais são as medidas?", answer: "24 cm de comprimento, 16 cm de largura e 9 cm de altura." },
    { question: "Cabe na minha penteadeira?", answer: "Ele mede 24 x 16 x 9 cm. Compare com o espaço disponível antes de comprar." },
    { question: "Qual é a marca e o modelo?", answer: "A marca é OrganizaMais e o modelo é OM-12." },
    { question: "Posso usar no banheiro?", answer: "O anúncio indica uso em penteadeira ou banheiro." },
    { question: "Qual o peso suportado?", answer: "Esta informação não consta no anúncio. Recomendamos confirmar com o vendedor." },
    { question: "Tem garantia?", answer: "A garantia não está informada no anúncio. Confirme com o vendedor." },
    { question: "O produto é novo?", answer: "Sim, a condição informada é novo." },
    { question: "O que vem na embalagem?", answer: "Um organizador com 12 divisórias. Confirme com o vendedor se há itens adicionais." },
  ],
  keywords: {
    primary: "organizador de maquiagem",
    secondary: ["organizador acrílico", "porta maquiagem", "organizador de cosméticos", "organizador de penteadeira"],
    longTail: ["organizador de maquiagem acrílico com divisórias", "organizador transparente para penteadeira", "organizador 12 divisórias acrílico"],
    related: ["porta batom", "porta pincel", "organizador de bancada", "organizador de banheiro"],
    purchaseIntent: ["comprar organizador de maquiagem", "organizador de maquiagem com divisórias", "organizador acrílico transparente"],
  },
  imageSuggestions: [
    { number: 1, objective: "Foto principal", whatToShow: "O organizador inteiro, vazio, em fundo branco, bem iluminado.", suggestedText: "", composition: "Produto centralizado ocupando ~85% do quadro, sem adereços." },
    { number: 2, objective: "Principais benefícios", whatToShow: "Organizador com ícones destacando transparência e 12 divisórias.", suggestedText: "12 divisórias • Acrílico transparente", composition: "Produto à esquerda, 3 tópicos curtos à direita." },
    { number: 3, objective: "Dimensões", whatToShow: "Produto com cotas indicando 24 cm, 16 cm e 9 cm.", suggestedText: "24 x 16 x 9 cm", composition: "Fundo claro, setas de medida legíveis." },
    { number: 4, objective: "Produto em utilização", whatToShow: "Organizador cheio de itens de maquiagem em uma penteadeira.", suggestedText: "Tudo à vista e no lugar", composition: "Ambiente real, luz natural, produto em destaque." },
    { number: 5, objective: "Conteúdo da embalagem", whatToShow: "Organizador ao lado da embalagem, mostrando o que será recebido.", suggestedText: "O que você recebe", composition: "Vista de cima, itens alinhados." },
    { number: 6, objective: "Detalhe do acabamento", whatToShow: "Close nas divisórias e nas bordas do acrílico.", suggestedText: "", composition: "Macro com fundo desfocado." },
  ],
  sponsoredAd: {
    variations: [
      { headline: "Maquiagem organizada em 12 divisórias", primaryText: "Acrílico transparente para ver tudo de uma vez. Medidas: 24 x 16 x 9 cm.", cta: "Ver detalhes" },
      { headline: "Organizador de maquiagem acrílico", primaryText: "Separe seus itens por tipo em 12 divisórias. Indicado para penteadeira ou banheiro.", cta: "Conhecer o produto" },
      { headline: "Compacto e transparente", primaryText: "Confira se cabe no seu espaço: 24 x 16 x 9 cm. Marca OrganizaMais.", cta: "Ver no Mercado Livre" },
    ],
  },
  instagram: {
    caption:
      "Tudo à vista, tudo no lugar ✨\nO organizador de maquiagem OrganizaMais OM-12 tem 12 divisórias em acrílico transparente, com 24 x 16 x 9 cm.\nLink na bio para ver os detalhes.\n#organizacao #maquiagem #penteadeira #acrilico",
    story: "Enquete: você organiza sua maquiagem por tipo? 👀 Deslize para ver o organizador de 12 divisórias.",
    reelScript:
      "0-3s: close no organizador vazio, texto 'Maquiagem bagunçada?'. 3-12s: mãos distribuindo os itens nas 12 divisórias. 12-20s: mostrar a medida 24x16x9 cm na tela. 20-25s: 'Link na bio'.",
  },
  whatsapp: {
    fullMessage:
      "Olá! Conheça o Organizador de Maquiagem OrganizaMais OM-12: acrílico transparente, 12 divisórias e 24 x 16 x 9 cm. Indicado para penteadeira ou banheiro. Posso te enviar o link?",
    shortMessage: "Organizador de maquiagem acrílico, 12 divisórias, 24x16x9 cm. Quer o link?",
    cta: "Responda 'quero' que envio o link do anúncio.",
  },
  videoScript: {
    durationSeconds: 25,
    scenes: [
      { time: "0-4s", visual: "Penteadeira com maquiagem espalhada.", narration: "Maquiagem espalhada por todo lado?" },
      { time: "4-12s", visual: "Mãos colocando itens nas divisórias do organizador.", narration: "São 12 divisórias para separar seus itens." },
      { time: "12-19s", visual: "Fita métrica mostrando 24 cm, 16 cm e 9 cm.", narration: "Mede 24 por 16 por 9 centímetros." },
      { time: "19-25s", visual: "Produto finalizado com logo e link.", narration: "Confira os detalhes no anúncio." },
    ],
  },
  recommendations: [
    { problem: "Título com termos promocionais ('Promoção!!').", potentialImpact: "Pode melhorar clareza e aderência às boas práticas do marketplace.", recommendation: "Usar o título sugerido, sem símbolos e com marca e quantidade de divisórias." },
    { problem: "Descrição muito curta.", potentialImpact: "Mais informação pode ajudar o comprador a decidir.", recommendation: "Publicar a descrição estruturada com benefícios, especificações e uso." },
    { problem: "Apenas 3 imagens.", potentialImpact: "Galeria completa pode reduzir dúvidas visuais.", recommendation: "Criar 6 imagens seguindo o plano sugerido, incluindo medidas e uso." },
    { problem: "Medidas só aparecem na ficha.", potentialImpact: "Pode reduzir a dúvida 'cabe no meu espaço?'.", recommendation: "Repetir as medidas no texto e em uma imagem com cotas." },
    { problem: "Garantia não informada.", potentialImpact: "Pode aumentar a confiança do comprador.", recommendation: "Informar o prazo de garantia, se existir." },
    { problem: "Peso e capacidade não informados.", potentialImpact: "Reduz perguntas repetidas.", recommendation: "Medir e informar o peso do produto." },
    { problem: "Conteúdo da embalagem incompleto.", potentialImpact: "Evita expectativas erradas.", recommendation: "Listar exatamente o que acompanha o produto." },
    { problem: "Sem perguntas frequentes.", potentialImpact: "Pode antecipar dúvidas comuns.", recommendation: "Incluir o FAQ sugerido e atualizá-lo com perguntas reais." },
    { problem: "Frete grátis citado na descrição.", potentialImpact: "Condições de envio mudam e podem gerar inconsistência.", recommendation: "Remover a menção e deixar o marketplace exibir as condições." },
    { problem: "Sem uso em redes sociais.", potentialImpact: "Pode ampliar o alcance do produto.", recommendation: "Usar os textos de Instagram e WhatsApp sugeridos." },
  ],
  objections: [
    { objection: "Será que cabe na minha penteadeira?", howToAddress: "Destacar as medidas 24 x 16 x 9 cm no título da imagem 3 e na descrição.", basis: "Dimensões informadas na ficha técnica." },
    { objection: "Qual o tamanho de cada divisória?", howToAddress: "Medir as divisórias e incluir na descrição e em uma imagem.", basis: "Há 12 divisórias, mas o tamanho de cada uma não consta." },
    { objection: "É resistente?", howToAddress: "Informar espessura do acrílico e peso suportado, se medidos.", basis: "Material acrílico informado; espessura não consta." },
  ],
  crossSell: [
    { category: "Organizadores de bancada e penteadeira", rationale: "Combinam com o uso do produto em penteadeira." },
    { category: "Acessórios de maquiagem", rationale: "Público-alvo semelhante ao do organizador." },
  ],
};

export function getDemoOutput(): AiOutput {
  // Valida a própria fixture: garante que o demo sempre respeita o schema.
  return aiOutputSchema.parse(structuredClone(demoOutput));
}

export function newDemoId() {
  return `demo-${randomUUID()}`;
}
