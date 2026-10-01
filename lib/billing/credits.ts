import { CREDITS_PER_ANALYSIS, PLANS, type PlanId } from "./plans";

export interface CreditState {
  plan: PlanId;
  creditsUsed: number;
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Você usou todos os créditos do seu plano.");
    this.name = "InsufficientCreditsError";
  }
}

export function creditLimit(plan: PlanId): number {
  return PLANS[plan].credits;
}

export function remainingCredits(state: CreditState): number {
  return Math.max(0, creditLimit(state.plan) - state.creditsUsed);
}

export function canConsume(state: CreditState, amount = CREDITS_PER_ANALYSIS): boolean {
  return remainingCredits(state) >= amount;
}

/** Retorna o novo estado após consumir créditos (função pura). */
export function consume(state: CreditState, amount = CREDITS_PER_ANALYSIS): CreditState {
  if (!canConsume(state, amount)) throw new InsufficientCreditsError();
  return { ...state, creditsUsed: state.creditsUsed + amount };
}
