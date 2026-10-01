import { ClipboardPaste, Cpu, FileText, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Analyzer } from "@/components/Analyzer";

const STEPS = [
  { icon: ClipboardPaste, title: "1. Cole o anúncio", text: "Informe o link do seu produto." },
  { icon: Cpu, title: "2. A IA analisa", text: "Identificamos oportunidades e pontos que podem ser melhorados." },
  { icon: FileText, title: "3. Receba uma versão otimizada", text: "Título, descrição, benefícios, FAQ, palavras-chave e muito mais." },
];

const FEATURES = [
  { icon: Target, title: "Nota com critérios claros", text: "Pontuação de 0 a 100 baseada em regras objetivas, não em palpite." },
  { icon: ShieldCheck, title: "Sem inventar informações", text: "A IA usa apenas os fatos do seu anúncio e avisa o que está faltando." },
  { icon: Sparkles, title: "Tudo pronto para copiar", text: "Título, descrição, anúncio patrocinado, Instagram, WhatsApp e roteiro de vídeo." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50 via-white to-slate-50" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:pt-20">
          <span className="chip mb-5">Para vendedores do Mercado Livre</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-6xl">
            Otimize seus anúncios <span className="text-brand-600">com IA</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink-500 sm:text-lg">
            Cole o link do seu anúncio e descubra como melhorar título, descrição, palavras-chave, imagens e argumentos de venda.
          </p>
          <div className="mt-10">
            <Analyzer />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={22} /></span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl p-4">
              <Icon className="mt-1 shrink-0 text-brand-600" size={22} />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-ink-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
