"use client";
import { AlertCircle, FlaskConical, Link2, PencilLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingSteps } from "./LoadingSteps";
import { ManualForm, type ManualData } from "./ManualForm";
import { saveResult } from "@/lib/clientStore";

type Phase = "idle" | "loading" | "error";
interface ApiError { code: string; message: string }

const MIN_LOADING_MS = 3500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Analyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<ApiError | null>(null);
  const [showManual, setShowManual] = useState(false);

  async function run(payload: Record<string, unknown>) {
    setPhase("loading");
    setError(null);
    const started = Date.now();
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      const wait = MIN_LOADING_MS - (Date.now() - started);
      if (wait > 0) await sleep(wait);
      if (!res.ok) {
        const err: ApiError = data?.error ?? { code: "INTERNAL", message: "Algo deu errado. Tente novamente." };
        setError(err);
        setPhase("error");
        if (err.code === "NEEDS_MANUAL") setShowManual(true);
        return;
      }
      saveResult(data.result);
      router.push("/resultado");
    } catch {
      setError({ code: "NETWORK", message: "Não foi possível conectar. Verifique sua internet e tente de novo." });
      setPhase("error");
    }
  }

  if (phase === "loading") return <LoadingSteps />;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <form
        className="card space-y-3 !p-3 sm:!p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!url.trim()) {
            setError({ code: "VALIDATION", message: "Cole o link do anúncio do Mercado Livre." });
            setPhase("error");
            return;
          }
          run({ url });
        }}
      >
        <label htmlFor="url" className="sr-only">Link do anúncio</label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" size={20} />
          <input
            id="url"
            className="input !pl-12"
            placeholder="Cole aqui o link do Mercado Livre"
            inputMode="url"
            autoComplete="off"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="submit" className="btn-primary">ANALISAR ANÚNCIO</button>
          <button type="button" className="btn-secondary" onClick={() => run({ demo: true })}>
            <FlaskConical size={16} /> TESTAR DEMONSTRAÇÃO
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div className="space-y-1">
            <p className="font-medium">{error.message}</p>
            {error.code === "AUTH_REQUIRED" && (
              <p>
                <Link href="/cadastro" className="font-semibold underline">Criar conta</Link> ou{" "}
                <Link href="/entrar" className="font-semibold underline">entrar</Link>.
              </p>
            )}
            {error.code === "NEEDS_MANUAL" && <p>Preencha os dados abaixo e a IA fará a análise com o que você informar.</p>}
          </div>
        </div>
      )}

      <div className="text-center">
        <button type="button" className="btn-ghost" onClick={() => setShowManual((v) => !v)}>
          <PencilLine size={16} /> {showManual ? "Ocultar inserção manual" : "Prefiro inserir as informações manualmente"}
        </button>
      </div>

      {showManual && (
        <ManualForm
          initialUrl={url}
          onSubmit={(d: ManualData) => run({ manual: d })}
        />
      )}
    </div>
  );
}
