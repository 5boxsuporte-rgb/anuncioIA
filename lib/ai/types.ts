export interface AiRequest {
  system: string;
  user: string;
  /** Máximo de tokens de saída */
  maxTokens?: number;
}

/** Interface que todo provedor de IA deve implementar. */
export interface AiProvider {
  id: "openai" | "anthropic" | "bedrock";
  /** Retorna o texto bruto (esperado: JSON). */
  complete(req: AiRequest): Promise<string>;
}

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

export class AiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiProviderError";
  }
}
