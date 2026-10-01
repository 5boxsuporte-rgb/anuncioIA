"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  return (
    <form
      className="card mx-auto mt-12 max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fd) });
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) return setError(data?.error?.message ?? "Algo deu errado.");
        router.push("/");
        router.refresh();
      }}
    >
      <h1 className="text-2xl font-bold">{isRegister ? "Criar conta grátis" : "Entrar"}</h1>
      {isRegister && <p className="text-sm text-ink-500">Plano Free: 5 análises. A demonstração não consome créditos.</p>}
      {isRegister && (
        <div>
          <label className="label" htmlFor="name">Nome</label>
          <input id="name" name="name" className="input" required minLength={2} autoComplete="name" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete={isRegister ? "new-password" : "current-password"} />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Aguarde…" : isRegister ? "Criar conta" : "Entrar"}</button>
      <p className="text-center text-sm text-ink-500">
        {isRegister ? <>Já tem conta? <Link className="font-semibold text-brand-600" href="/entrar">Entrar</Link></> : <>Novo por aqui? <Link className="font-semibold text-brand-600" href="/cadastro">Criar conta</Link></>}
      </p>
    </form>
  );
}
