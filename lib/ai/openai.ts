import { postJson } from "./http";
import { AiConfigError, AiProviderError, type AiProvider, type AiRequest } from "./types";

export function createOpenAiProvider(): AiProvider {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new AiConfigError("OPENAI_API_KEY não configurada.");
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return {
    id: "openai",
    async complete(req: AiRequest) {
      const data = (await postJson(
        `${(process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`,
        { authorization: `Bearer ${apiKey}` },
        {
          model,
          temperature: 0.4,
          max_tokens: req.maxTokens ?? 8000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: req.system },
            { role: "user", content: req.user },
          ],
        },
      )) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new AiProviderError("O provedor de IA não devolveu conteúdo.");
      return text;
    },
  };
}
