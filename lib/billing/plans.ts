export type PlanId = "FREE" | "BASIC" | "PRO" | "AGENCY";

export interface PlanInfo {
  id: PlanId;
  name: string;
  /** Análises (créditos) incluídas por ciclo */
  credits: number;
}

export const PLANS: Record<PlanId, PlanInfo> = {
  FREE: { id: "FREE", name: "Free", credits: 5 },
  BASIC: { id: "BASIC", name: "Basic", credits: 50 },
  PRO: { id: "PRO", name: "Pro", credits: 200 },
  AGENCY: { id: "AGENCY", name: "Agency", credits: 500 },
};

export const PLAN_LIST = Object.values(PLANS);
export const CREDITS_PER_ANALYSIS = 1;
