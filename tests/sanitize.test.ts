import { describe, expect, it } from "vitest";
import { sanitizeText } from "@/lib/security/sanitize";

describe("sanitizeText", () => {
  it("remove tags, scripts e controles", () => {
    expect(sanitizeText("<b>oi</b><script>x()</script>\u0000 tudo")).toBe("oi tudo");
  });
  it("limita tamanho e trata não-string", () => {
    expect(sanitizeText("a".repeat(50), 10)).toHaveLength(10);
    expect(sanitizeText(undefined)).toBe("");
  });
});
