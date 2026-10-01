import type { PlanId } from "./plans";

/**
 * Interface de pagamento. Nenhum gateway está integrado ainda.
 * Para integrar Stripe ou Mercado Pago: implemente `PaymentGateway`, registre em
 * `getGateway()` e chame `applyPlan` (lib/db) quando o webhook confirmar o pagamento.
 */
export interface CheckoutSession {
  url: string;
}

export interface PaymentGateway {
  id: "stripe" | "mercadopago" | "none";
  createCheckout(input: { userId: string; plan: PlanId; successUrl: string; cancelUrl: string }): Promise<CheckoutSession>;
  /** Valida e interpreta um webhook; devolve o usuário/plano a ativar. */
  handleWebhook(rawBody: string, signature: string | null): Promise<{ userId: string; plan: PlanId } | null>;
}

export const noGateway: PaymentGateway = {
  id: "none",
  async createCheckout() {
    throw new Error("Pagamentos ainda não estão disponíveis.");
  },
  async handleWebhook() {
    return null;
  },
};

export function getGateway(): PaymentGateway {
  return noGateway;
}
