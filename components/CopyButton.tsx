"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores/contextos sem Clipboard API
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = "Copiar", className }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <button
      type="button"
      className={clsx("btn-secondary !px-3 !py-1.5 !text-xs", className)}
      onClick={async () => {
        setState((await copyToClipboard(text)) ? "ok" : "fail");
        setTimeout(() => setState("idle"), 1800);
      }}
      aria-live="polite"
    >
      {state === "ok" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      {state === "ok" ? "Copiado!" : state === "fail" ? "Não foi possível copiar" : label}
    </button>
  );
}
