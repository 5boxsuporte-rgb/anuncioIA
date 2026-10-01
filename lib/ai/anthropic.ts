import { postJson } from "./http";
import { AiConfigError, AiProviderError, type AiProvider, type AiRequest } from "./types";

export function createAnthropicProvider(): AiProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new AiConfigError("ANTHROPIC_API_KEY não configurada.");
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-5-5";
  return {
    id: "anthropic",
    async complete(req: AiRequest) {
      const data = (await postJson(
        "https://api.anthropic.com/v1/messages",
        { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        {
          model,
          max_tokens: req.maxTokens ?? 8000,
          system: req.system,
          messages: [{ role: "user", content: req.user }],
        },
      )) as { content?: { type: string; text?: string }[] };
      const text = data.content?.find((c) => c.type === "text")?.text;
      if (!text) throw new AiProviderError("O provedor de IA não devolveu conteúdo.");
      return text;
    },
  };
}
