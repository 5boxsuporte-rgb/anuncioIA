import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/security/rateLimit";
import { credentialsSchema } from "@/lib/validation/input";

export async function POST(request: Request) {
  if (!rateLimit(`login:${clientIp(request.headers)}`, 10, 60_000).allowed) {
    return jsonError(429, "RATE_LIMITED", "Muitas tentativas. Aguarde um minuto.");
  }
  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "VALIDATION", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const user = await getStore().findUserByEmail(parsed.data.email);
  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) return jsonError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
