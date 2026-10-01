import { NextResponse } from "next/server";

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>, headers?: HeadersInit) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status, headers });
}

/**
 * Compara erros pelo nome (não por instanceof): em desenvolvimento o Next pode carregar
 * o mesmo módulo duas vezes (HMR/bundles separados), quebrando a identidade das classes.
 */
export function isError(e: unknown, name: string): e is Error {
  return e instanceof Error && e.name === name;
}
