"use client";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  "Lendo informações do anúncio",
  "Identificando características",
  "Analisando título",
  "Analisando descrição",
  "Identificando palavras-chave",
  "Analisando oportunidades",
  "Criando recomendações",
  "Gerando anúncio otimizado",
];

/** Indicador de progresso visual. As etapas avançam por tempo; a última aguarda a conclusão real. */
export function LoadingSteps({ intervalMs = 1800 }: { intervalMs?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => Math.min(c + 1, STEPS.length - 1)), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  const pct = Math.round(((current + 1) / STEPS.length) * 100);

  return (
    <div className="card mx-auto max-w-lg" role="status" aria-live="polite">
      <h2 className="text-lg font-semibold">Analisando seu anúncio…</h2>
      <p className="mt-1 text-sm text-ink-500">Isso leva só alguns instantes.</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-5 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 text-sm transition ${i > current ? "text-ink-300" : "text-ink-900"}`}>
            {i < current ? (
              <Check size={18} className="text-emerald-600" />
            ) : i === current ? (
              <Loader2 size={18} className="animate-spin text-brand-600" />
            ) : (
              <span className="h-[18px] w-[18px] rounded-full border border-slate-200" />
            )}
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
