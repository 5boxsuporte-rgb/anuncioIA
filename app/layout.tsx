import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AnúncioIA — Otimize seus anúncios do Mercado Livre com IA",
  description: "Cole o link do seu anúncio e receba análise, nota, título, descrição, palavras-chave e textos otimizados.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10 text-center text-xs text-ink-500">
          AnúncioIA • As notas medem boas práticas e não garantem aumento de vendas. Não somos afiliados ao Mercado Livre.
        </footer>
      </body>
    </html>
  );
}
