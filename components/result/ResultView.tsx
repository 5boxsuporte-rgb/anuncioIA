"use client";
import { Download, FlaskConical } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import {
  benefitsText, crossSellText, faqText, fullAdText, imagesText, keywordsText, objectionsText, composeDescription,
  recommendationsText, reportText, sponsoredText, technicalSheetRows, technicalSheetText, videoText,
} from "@/lib/export/format";
import type { AnalysisResult } from "@/lib/validation/analysis";
import { Block, List, ScoreBadge, ScoreBar, ScoreRing, Section } from "./ui";

const NAV = [
  ["diagnostico", "Diagnóstico"], ["titulo", "Título"], ["descricao", "Descrição"], ["beneficios", "Benefícios"],
  ["ficha", "Ficha técnica"], ["faq", "FAQ"], ["palavras", "Palavras-chave"], ["imagens", "Imagens"],
  ["social", "Anúncios e redes"], ["melhorias", "Melhorias"], ["comparacao", "Antes × Depois"],
] as const;

function downloadTxt(r: AnalysisResult) {
  const blob = new Blob([reportText(r)], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `anuncioia-${r.meta.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export function ResultView({ r }: { r: AnalysisResult }) {
  const before = r.score.before;
  const after = r.score.after;
  const fullAd = fullAdText(r);
  const descriptionText = composeDescription(r.description);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10">
      {/* Barra de ações */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200/70 bg-slate-50/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={fullAd} label="COPIAR ANÚNCIO COMPLETO" className="!bg-brand-600 !text-white !border-brand-600 hover:!bg-brand-700 !px-4 !py-2" />
          <button className="btn-secondary !px-3 !py-2 !text-xs" onClick={() => downloadTxt(r)}><Download size={14} /> Baixar TXT</button>
          <CopyButton text={reportText(r)} label="Copiar tudo" />
          <Link href="/" className="btn-ghost ml-auto !py-2 text-xs">Nova análise</Link>
        </div>
        <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto pb-1 text-xs" aria-label="Seções">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-full px-3 py-1 text-ink-500 hover:bg-white hover:text-brand-700">{label}</a>
          ))}
        </nav>
      </div>

      {r.meta.mode === "demo" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <FlaskConical className="mt-0.5 shrink-0" size={18} />
          <p><strong>Modo demonstração:</strong> este é um produto fictício, gerado sem IA e sem consumir créditos. Serve para conhecer todas as seções.</p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Diagnóstico */}
        <Section id="diagnostico" title="Diagnóstico do anúncio" subtitle="Notas calculadas por critérios objetivos (veja os detalhes em cada categoria).">
          <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-center">
            <div className="mx-auto"><ScoreRing score={before.overall} label="nota geral" /></div>
            <div>
              <p className="text-sm leading-relaxed">{r.analysis.summary}</p>
              <p className="mt-2 text-xs text-ink-500">Nota potencial se as sugestões forem aplicadas: <strong>{after.overall}</strong>. Não é garantia de aumento de vendas.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {before.categories.map((c) => (
              <details key={c.key} className="group rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{c.label}</span>
                    {c.evaluated ? <ScoreBadge score={c.score} /> : <span className="chip">não avaliado</span>}
                  </div>
                  {c.evaluated && <div className="mt-2"><ScoreBar score={c.score} /></div>}
                  <p className="mt-2 text-xs text-ink-500">{c.explanation}</p>
                </summary>
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-ink-700">
                  {c.checks.map((ck) => (
                    <li key={ck.id} className="flex justify-between gap-3">
                      <span>{ck.earned >= ck.points ? "✓" : "✗"} {ck.label}<span className="block text-ink-500">{ck.detail}</span></span>
                      <span className="shrink-0 font-medium">{ck.earned}/{ck.points}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div><h3 className="mb-2 text-sm font-semibold">Pontos fortes</h3><List items={r.analysis.strengths} tone="ok" /></div>
            <div><h3 className="mb-2 text-sm font-semibold">Problemas</h3><List items={r.analysis.problems.map((p) => `${p.area}: ${p.problem}`)} tone="warn" /></div>
            <div><h3 className="mb-2 text-sm font-semibold">Dados ausentes</h3><List items={r.analysis.missingData} tone="warn" /></div>
          </div>
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer font-medium text-brand-700">Fatos × inferências da análise</summary>
            <div className="mt-3 grid gap-6 md:grid-cols-2">
              <div><h4 className="mb-2 font-semibold">Fatos do anúncio</h4><List items={r.analysis.facts} /></div>
              <div><h4 className="mb-2 font-semibold">Inferências (confirmar)</h4><List items={r.analysis.inferences} tone="warn" /></div>
            </div>
          </details>
        </Section>

        {/* Título */}
        <Section id="titulo" title="Título">
          <div className="space-y-3">
            <Block label="Título atual" text={r.title.current} />
            <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">Título recomendado · {r.title.recommended.length} caracteres</span>
                <CopyButton text={r.title.recommended} label="COPIAR TÍTULO" />
              </div>
              <p className="text-lg font-semibold">{r.title.recommended}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div><h3 className="mb-2 text-sm font-semibold">Por que melhorar?</h3><List items={r.title.reasons} /></div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Palavras-chave utilizadas</h3>
                <div className="flex flex-wrap gap-2">{r.title.keywordsUsed.map((k) => <span key={k} className="chip">{k}</span>)}</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Descrição */}
        <Section id="descricao" title="Descrição otimizada" copy={{ text: descriptionText, label: "COPIAR DESCRIÇÃO" }}>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed">{descriptionText}</pre>
        </Section>

        {/* Benefícios */}
        <Section id="beneficios" title="5 benefícios" copy={{ text: benefitsText(r.benefits) }}>
          <div className="grid gap-3 sm:grid-cols-2">
            {r.benefits.map((b, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold"><span className="mr-2 text-brand-600">{i + 1}</span>{b.title}</h3>
                  <CopyButton text={`${b.title}: ${b.explanation}`} />
                </div>
                <p className="mt-1 text-sm text-ink-500">{b.explanation}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Ficha técnica */}
        <Section id="ficha" title="Ficha técnica" subtitle="Só o que consta nos dados do anúncio é preenchido." copy={{ text: technicalSheetText(r.technicalSheet) }}>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {technicalSheetRows(r.technicalSheet).map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-0 odd:bg-slate-50/60">
                    <th className="w-2/5 p-3 text-left font-medium text-ink-700">{row.label}</th>
                    <td className={row.value ? "p-3" : "p-3 text-ink-300"}>{row.value ?? "Não informado"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" title="Perguntas frequentes" copy={{ text: faqText(r.faq) }}>
          <div className="space-y-2">
            {r.faq.map((f, i) => (
              <details key={i} className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-medium">{f.question}</summary>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="text-sm text-ink-700">{f.answer}</p>
                  <CopyButton text={`${f.question}\n${f.answer}`} />
                </div>
              </details>
            ))}
          </div>
        </Section>

        {/* Palavras-chave */}
        <Section id="palavras" title="Palavras-chave" copy={{ text: keywordsText(r.keywords) }}>
          <div className="space-y-4 text-sm">
            <div><h3 className="mb-1.5 font-semibold">Palavra principal</h3><span className="chip !text-sm">{r.keywords.primary}</span></div>
            {([["Secundárias", r.keywords.secondary], ["Long tail", r.keywords.longTail], ["Termos relacionados", r.keywords.related], ["Intenção de compra", r.keywords.purchaseIntent]] as const).map(([label, items]) => (
              <div key={label}>
                <h3 className="mb-1.5 font-semibold">{label}</h3>
                <div className="flex flex-wrap gap-2">{items.map((k) => <span key={k} className="rounded-full border border-slate-200 px-3 py-1 text-xs">{k}</span>)}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Imagens */}
        <Section id="imagens" title="Imagens recomendadas" subtitle={r.meta.listing.source === "manual" ? "As imagens não foram lidas (inserção manual); este é um plano sugerido." : "Plano sugerido para a galeria."} copy={{ text: imagesText(r.imageSuggestions) }}>
          <div className="grid gap-3 md:grid-cols-2">
            {r.imageSuggestions.map((img) => (
              <div key={img.number} className="rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">{img.number}</span>
                  <h3 className="font-semibold">{img.objective}</h3>
                </div>
                <dl className="mt-3 space-y-1.5 text-ink-700">
                  <div><dt className="inline font-medium">O que mostrar: </dt><dd className="inline">{img.whatToShow}</dd></div>
                  {img.suggestedText && <div><dt className="inline font-medium">Texto sugerido: </dt><dd className="inline">“{img.suggestedText}”</dd></div>}
                  <div><dt className="inline font-medium">Composição: </dt><dd className="inline">{img.composition}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </Section>

        {/* Social / anúncios */}
        <div id="social" className="scroll-mt-32 space-y-6">
          <Section id="patrocinado" title="Anúncio patrocinado" subtitle="3 variações" copy={{ text: sponsoredText(r.sponsoredAd) }}>
            <div className="grid gap-3 md:grid-cols-3">
              {r.sponsoredAd.variations.map((v, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <span className="chip">Variação {i + 1}</span>
                  <h3 className="mt-2 font-semibold">{v.headline}</h3>
                  <p className="mt-1 text-ink-700">{v.primaryText}</p>
                  <p className="mt-2 text-xs font-semibold text-brand-700">CTA: {v.cta}</p>
                  <div className="mt-3"><CopyButton text={`${v.headline}\n${v.primaryText}\n${v.cta}`} /></div>
                </div>
              ))}
            </div>
          </Section>
          <Section id="instagram" title="Instagram">
            <div className="space-y-3">
              <Block label="Legenda" text={r.instagram.caption} />
              <Block label="Story" text={r.instagram.story} />
              <Block label="Roteiro de Reel (15–30 s)" text={r.instagram.reelScript} />
            </div>
          </Section>
          <Section id="whatsapp" title="WhatsApp">
            <div className="space-y-3">
              <Block label="Mensagem completa" text={r.whatsapp.fullMessage} />
              <Block label="Mensagem curta" text={r.whatsapp.shortMessage} />
              <Block label="CTA" text={r.whatsapp.cta} />
            </div>
          </Section>
          <Section id="video" title="Roteiro de vídeo" subtitle={`${r.videoScript.durationSeconds} segundos`} copy={{ text: videoText(r.videoScript) }}>
            <ol className="space-y-3">
              {r.videoScript.scenes.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="chip h-fit shrink-0">{s.time}</span>
                  <div><p>{s.visual}</p>{s.narration && <p className="text-ink-500">“{s.narration}”</p>}</div>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        {/* Melhorias */}
        <Section id="melhorias" title="10 melhorias prioritárias" subtitle="Impactos são potenciais; nenhuma mudança garante aumento de vendas." copy={{ text: recommendationsText(r.recommendations) }}>
          <ol className="space-y-3">
            {r.recommendations.map((x, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4 text-sm">
                <div className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">{i + 1}</span>
                  <dl className="space-y-1">
                    <div><dt className="inline font-semibold">Problema: </dt><dd className="inline">{x.problem}</dd></div>
                    <div><dt className="inline font-semibold">Impacto potencial: </dt><dd className="inline">{x.potentialImpact}</dd></div>
                    <div><dt className="inline font-semibold">Recomendação: </dt><dd className="inline">{x.recommendation}</dd></div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          <Section id="objecoes" title="Objeções do cliente" copy={{ text: objectionsText(r.objections) }}>
            {r.objections.length ? (
              <ul className="space-y-3 text-sm">
                {r.objections.map((o, i) => (
                  <li key={i}>
                    <p className="font-semibold">“{o.objection}”</p>
                    <p className="text-ink-700">{o.howToAddress}</p>
                    <p className="text-xs text-ink-500">Base: {o.basis}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-500">Sem base factual suficiente para sugerir objeções.</p>}
          </Section>
          <Section id="crosssell" title="Cross-sell" subtitle="Apenas categorias complementares." copy={{ text: crossSellText(r.crossSell) }}>
            {r.crossSell.length ? (
              <ul className="space-y-3 text-sm">
                {r.crossSell.map((c, i) => (<li key={i}><p className="font-semibold">{c.category}</p><p className="text-ink-700">{c.rationale}</p></li>))}
              </ul>
            ) : <p className="text-sm text-ink-500">Nenhuma sugestão aplicável.</p>}
          </Section>
        </div>

        {/* Antes × Depois */}
        <Section id="comparacao" title="Antes × Depois" subtitle="Nota atual versus nota potencial, pelos mesmos critérios. O “depois” só vale se você aplicar as sugestões (inclusive as imagens).">
          <div className="space-y-3">
            {before.categories.map((b, i) => {
              const a = after.categories[i];
              return (
                <div key={b.key} className="grid items-center gap-2 sm:grid-cols-[8rem,1fr,1fr]">
                  <span className="text-sm font-semibold">{b.label}</span>
                  {b.evaluated ? (
                    <>
                      <div><div className="mb-1 flex justify-between text-xs text-ink-500"><span>Antes</span><b>{b.score}</b></div><ScoreBar score={b.score} /></div>
                      <div><div className="mb-1 flex justify-between text-xs text-ink-500"><span>Depois (potencial)</span><b>{a.score}</b></div><ScoreBar score={a.score} /></div>
                    </>
                  ) : <span className="text-xs text-ink-500 sm:col-span-2">Não avaliado (sem dados de imagens).</span>}
                </div>
              );
            })}
            <div className="mt-4 flex items-center justify-around rounded-xl bg-slate-50 p-4">
              <div className="text-center"><ScoreRing score={before.overall} size={96} label="antes" /></div>
              <span className="text-2xl text-ink-300">→</span>
              <div className="text-center"><ScoreRing score={after.overall} size={96} label="depois" /></div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><h3 className="text-sm font-semibold text-ink-500">ANTES · título</h3><p className="rounded-xl bg-rose-50 p-3 text-sm">{r.meta.listing.title}</p></div>
            <div className="space-y-2"><h3 className="text-sm font-semibold text-brand-700">DEPOIS · título</h3><p className="rounded-xl bg-emerald-50 p-3 text-sm">{r.title.recommended}</p></div>
            <div className="space-y-2"><h3 className="text-sm font-semibold text-ink-500">ANTES · descrição</h3><p className="whitespace-pre-line rounded-xl bg-rose-50 p-3 text-sm">{r.meta.listing.description || "(vazia)"}</p></div>
            <div className="space-y-2"><h3 className="text-sm font-semibold text-brand-700">DEPOIS · descrição</h3><p className="line-clamp-[12] whitespace-pre-line rounded-xl bg-emerald-50 p-3 text-sm">{descriptionText}</p></div>
          </div>
        </Section>
      </div>
    </div>
  );
}
