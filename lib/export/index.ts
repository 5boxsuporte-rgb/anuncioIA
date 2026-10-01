import type { AnalysisResult } from "@/lib/validation/analysis";
import { reportText } from "./format";

/**
 * Registro de formatos de exportação. No MVP: TXT.
 * Para adicionar PDF/DOCX/CSV, implemente um `Exporter` e registre-o aqui.
 */
export interface Exporter {
  id: "txt" | "pdf" | "docx" | "csv";
  label: string;
  mime: string;
  extension: string;
  available: boolean;
  render(result: AnalysisResult): string | Uint8Array;
}

export const exporters: Exporter[] = [
  { id: "txt", label: "Texto (.txt)", mime: "text/plain;charset=utf-8", extension: "txt", available: true, render: reportText },
  { id: "pdf", label: "PDF", mime: "application/pdf", extension: "pdf", available: false, render: unavailable },
  { id: "docx", label: "Word (.docx)", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx", available: false, render: unavailable },
  { id: "csv", label: "CSV", mime: "text/csv;charset=utf-8", extension: "csv", available: false, render: unavailable },
];

function unavailable(): never {
  throw new Error("Formato de exportação ainda não implementado.");
}

export function getExporter(id: Exporter["id"]): Exporter {
  const e = exporters.find((x) => x.id === id);
  if (!e || !e.available) throw new Error("Formato de exportação indisponível.");
  return e;
}
