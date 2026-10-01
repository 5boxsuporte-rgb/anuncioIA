import { AiConfigError, type AiProvider } from "./types";

/**
 * AWS Bedrock — interface preparada, ainda NÃO implementada.
 * Para implementar: instale `@aws-sdk/client-bedrock-runtime`, use `ConverseCommand`
 * com BEDROCK_MODEL_ID e AWS_REGION, e devolva o texto da resposta em `complete`.
 * Em produção na AWS, prefira a role IAM da Lambda/ECS em vez de chaves de acesso.
 */
export function createBedrockProvider(): AiProvider {
  throw new AiConfigError(
    "O provedor AWS Bedrock ainda não foi implementado. Use AI_PROVIDER=openai ou anthropic por enquanto.",
  );
}
