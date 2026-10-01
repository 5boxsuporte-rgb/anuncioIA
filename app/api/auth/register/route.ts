import { NextResponse } from "next/server";
import { isError, jsonError } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/security/rateLimit";
import { registerSchema } from "@/lib/validation/input";

export async function POST(request: Request) {
  if (!rateLimit(`register:${clientIp(request.headers)}`, 5, 60_000).allowed) {
    return jsonError(429, "RATE_LIMITED", "Muitas tentativas. Aguarde um minuto.");
  }
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "VALIDATION", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  try {
    const user = await getStore().createUser({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
    });
    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isError(e, "EmailTakenError")) return jsonError(409, "EMAIL_TAKEN", e.message);
    console.error("register failed", e instanceof Error ? e.message : "unknown");
    return jsonError(500, "INTERNAL", "Não foi possível criar a conta agora.");
  }
}
