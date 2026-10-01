import type { AiProvider } from "@/lib/ai/types";
import { getDemoOutput } from "@/lib/demo/analysis";

export function mockProvider(responses: (string | Error)[]): AiProvider & { calls: number } {
  const p = {
    id: "openai" as const,
    calls: 0,
    async complete() {
      const r = responses[Math.min(p.calls, responses.length - 1)];
      p.calls++;
      if (r instanceof Error) throw r;
      return r;
    },
  };
  return p;
}

export const validAiJson = () => JSON.stringify(getDemoOutput());
