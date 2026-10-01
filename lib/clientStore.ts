import type { AnalysisResult } from "@/lib/validation/analysis";

const KEY = "anuncioia:result";

/** Guarda o resultado no navegador (sessionStorage) para a página de resultado. */
export function saveResult(result: AnalysisResult) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* armazenamento indisponível */
  }
}

export function loadResult(): AnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}
