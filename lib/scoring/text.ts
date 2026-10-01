const STOPWORDS = new Set(
  "de da do das dos para com sem em e ou a o as os um uma uns umas por no na nos nas ao aos que se seu sua kit cada mais muito até entre sobre como".split(" "),
);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function words(s: string): string[] {
  return normalize(s).match(/[a-z0-9]+/g) ?? [];
}

export function meaningfulWords(s: string): string[] {
  return words(s).filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function lineBlocks(s: string): string[] {
  return s
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}
