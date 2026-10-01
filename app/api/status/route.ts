import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/provider";
import { config } from "@/lib/config";

/** Informa ao frontend apenas booleanos (nunca chaves). */
export async function GET() {
  return NextResponse.json({ aiConfigured: isAiConfigured(), database: config.databaseUrl ? "postgres" : "memory" });
}
