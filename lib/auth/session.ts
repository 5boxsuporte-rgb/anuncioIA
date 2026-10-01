import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { getStore } from "@/lib/db";
import { remainingCredits, creditLimit } from "@/lib/billing/credits";
import type { PlanId } from "@/lib/billing/plans";

export const SESSION_COOKIE = "anuncioia_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
}

const key = () => new TextEncoder().encode(config.authSecret);

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(key());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = await verifySessionToken(token);
  if (!id) return null;
  const u = await getStore().findUserById(id);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    plan: u.plan,
    creditsUsed: u.creditsUsed,
    creditsLimit: creditLimit(u.plan),
    creditsRemaining: remainingCredits(u),
  };
}
