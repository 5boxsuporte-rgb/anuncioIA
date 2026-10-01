"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadResult } from "@/lib/clientStore";
import type { AnalysisResult } from "@/lib/validation/analysis";
import { ResultView } from "./ResultView";

export function ResultLoader() {
  const [state, setState] = useState<{ ready: boolean; result: AnalysisResult | null }>({ ready: false, result: null });
  useEffect(() => {
    setState({ ready: true, result: loadResult() });
  }, []);

  if (!state.ready) return <div className="p-16 text-center text-ink-500">Carregando…</div>;
  if (!state.result) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Nenhum resultado por aqui</h1>
        <p className="mt-2 text-ink-500">Faça uma análise para ver o resultado.</p>
        <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    );
  }
  return <ResultView r={state.result} />;
}
