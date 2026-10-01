import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const user = await getSessionUser().catch(() => null);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Sparkles size={18} />
          </span>
          <span>Anúncio<span className="text-brand-600">IA</span></span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <span className="chip hidden sm:inline-flex" title={`Plano ${user.plan}`}>
                {user.creditsRemaining} de {user.creditsLimit} créditos
              </span>
              <span className="hidden text-ink-500 sm:inline">{user.name.split(" ")[0]}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-ghost">Entrar</Link>
              <Link href="/cadastro" className="btn-secondary !py-2">Criar conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
