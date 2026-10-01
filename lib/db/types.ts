import type { PlanId } from "@/lib/billing/plans";
import type { AnalysisResult } from "@/lib/validation/analysis";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: PlanId;
  creditsUsed: number;
  createdAt: Date;
}

export interface StoredAnalysisSummary {
  id: string;
  title: string;
  overallScore: number;
  createdAt: string;
}

/** Contrato de persistência. Há implementações em memória (dev) e Prisma/PostgreSQL. */
export interface Store {
  readonly kind: "memory" | "postgres";
  createUser(input: { email: string; name: string; passwordHash: string }): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  setPlan(userId: string, plan: PlanId): Promise<void>;
  /**
   * Salva a análise REAL concluída e desconta 1 crédito de forma atômica.
   * Lança InsufficientCreditsError se não houver saldo. (Demo nunca chama isto.)
   */
  saveAnalysisAndCharge(userId: string, result: AnalysisResult): Promise<void>;
  listAnalyses(userId: string, limit?: number): Promise<StoredAnalysisSummary[]>;
}

export class EmailTakenError extends Error {
  constructor() {
    super("Este e-mail já está cadastrado.");
    this.name = "EmailTakenError";
  }
}
