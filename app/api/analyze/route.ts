import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analysis/run";
import { isAiConfigured } from "@/lib/ai/provider";
import { getSessionUser } from "@/lib/auth/session";
import { isError, jsonError } from "@/lib/api";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { BLOCKED_MESSAGE, validateMercadoLivreUrl } from "@/lib/marketplace/mercadolivre";
import { clientIp, rateLimit } from "@/lib/security/rateLimit";
import { analyzeRequestSchema } from "@/lib/validation/input";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const rl = rateLimit(`analyze:${clientIp(request.headers)}`, config.rateLimitPerMinute);
  if (!rl.allowed) {
    return jsonError(429, "RATE_LIMITED", "Muitas tentativas. Aguarde um instante e tente de novo.", { retryAfterSeconds: rl.retryAfterSeconds }, { "Retry-After": String(rl.retryAfterSeconds) });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Requisição inválida.");
  }
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const input = parsed.data;

  // Modo demo: sem login, sem IA, sem créditos.
  if (input.demo) {
    const out = await runAnalysis({ demo: true });
    if (out.kind === "ok") return NextResponse.json({ result: out.result });
  }

  if (!input.manual) {
    const check = validateMercadoLivreUrl(input.url ?? "");
    if (!check.ok) return jsonError(400, "INVALID_URL", check.reason);
  }

  // Análise real: exige login e saldo.
  const user = await getSessionUser();
  if (!user) return jsonError(401, "AUTH_REQUIRED", "Entre ou crie uma conta gratuita para analisar anúncios reais. O modo demonstração não exige login.");
  if (user.creditsRemaining <= 0) return jsonError(402, "NO_CREDITS", "Você usou todos os créditos do seu plano.");
  if (!isAiConfigured()) {
    return jsonError(503, "AI_NOT_CONFIGURED", "A análise com IA ainda não está configurada neste ambiente. Você pode testar a demonstração enquanto isso.");
  }

  try {
    const out = await runAnalysis(input);
    if (out.kind === "needs_manual") {
      // Não consome crédito.
      return jsonError(422, "NEEDS_MANUAL", BLOCKED_MESSAGE);
    }
    await getStore().saveAnalysisAndCharge(user.id, out.result); // desconta 1 crédito só após concluir
    return NextResponse.json({ result: out.result });
  } catch (e) {
    if (isError(e, "InsufficientCreditsError")) return jsonError(402, "NO_CREDITS", e.message);
    if (isError(e, "AiConfigError")) return jsonError(503, "AI_NOT_CONFIGURED", "A análise com IA não está configurada corretamente neste ambiente.");
    if (isError(e, "AiInvalidOutputError")) return jsonError(502, "AI_INVALID", e.message);
    if (isError(e, "AiProviderError")) return jsonError(502, "AI_UNAVAILABLE", "O serviço de IA está indisponível agora. Tente novamente em instantes.");
    console.error("analyze failed", e instanceof Error ? e.message : "unknown");
    return jsonError(500, "INTERNAL", "Algo deu errado. Tente novamente.");
  }
}
