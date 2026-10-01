"use client";
import clsx from "clsx";
import { CopyButton } from "@/components/CopyButton";

export function Section({ id, title, subtitle, copy, children }: { id: string; title: string; subtitle?: string; copy?: { text: string; label?: string }; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-32">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {copy && <CopyButton text={copy.text} label={copy.label} />}
      </div>
      {children}
    </section>
  );
}

export function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink-900">{text}</p>
    </div>
  );
}

export function scoreTone(score: number) {
  return score >= 75 ? "emerald" : score >= 50 ? "amber" : "rose";
}

const TONE: Record<string, string> = {
  emerald: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  amber: "text-amber-700 bg-amber-50 ring-amber-200",
  rose: "text-rose-700 bg-rose-50 ring-rose-200",
};
const BAR: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return <span className={clsx("inline-flex min-w-[3rem] justify-center rounded-lg px-2 py-1 text-sm font-bold ring-1", TONE[scoreTone(score)], className)}>{score}</span>;
}

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <div className={clsx("h-full rounded-full", BAR[scoreTone(score)])} style={{ width: `${score}%` }} />
    </div>
  );
}

export function ScoreRing({ score, size = 140, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const color = { emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e" }[scoreTone(score)];
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f7" strokeWidth={12} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-extrabold leading-none">{score}</div>
        <div className="mt-1 text-xs text-ink-500">{label ?? "de 100"}</div>
      </div>
    </div>
  );
}

export function List({ items, tone }: { items: string[]; tone?: "ok" | "warn" }) {
  if (!items.length) return <p className="text-sm text-ink-500">Nada a destacar.</p>;
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className={clsx("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", tone === "warn" ? "bg-amber-500" : tone === "ok" ? "bg-emerald-500" : "bg-brand-500")} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
