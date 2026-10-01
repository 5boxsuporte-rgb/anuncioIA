import { createAnthropicProvider } from "./anthropic";
import { createBedrockProvider } from "./bedrock";
import { createOpenAiProvider } from "./openai";
import { AiConfigError, type AiProvider } from "./types";

/**
 * Ponto ÚNICO de escolha do provedor. O restante da aplicação só conhece `AiProvider`.
 * Para adicionar um provedor: crie lib/ai/<nome>.ts e registre-o aqui.
 */
const factories: Record<string, () => AiProvider> = {
  openai: createOpenAiProvider,
  anthropic: createAnthropicProvider,
  bedrock: createBedrockProvider,
};

/** Há algum provedor configurado (sem expor chaves)? */
export function isAiConfigured(): boolean {
  const name = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  if (name === "openai") return !!process.env.OPENAI_API_KEY?.trim();
  if (name === "anthropic") return !!process.env.ANTHROPIC_API_KEY?.trim();
  return false; // bedrock ainda não implementado
}

export function getProvider(): AiProvider {
  const name = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();
  if (!name) throw new AiConfigError("AI_PROVIDER não configurado.");
  const factory = factories[name];
  if (!factory) throw new AiConfigError(`Provedor de IA desconhecido: ${name}.`);
  return factory();
}

export * from "./types";
