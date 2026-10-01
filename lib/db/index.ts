import { config } from "@/lib/config";
import { createMemoryStore } from "./memory";
import { createPrismaStore } from "./prisma";
import type { Store } from "./types";

const g = globalThis as unknown as { __store?: Store };

/** Escolhe PostgreSQL se DATABASE_URL existir; senão usa memória (modo local). */
export function getStore(): Store {
  if (!g.__store) g.__store = config.databaseUrl ? createPrismaStore() : createMemoryStore();
  return g.__store;
}

export * from "./types";
