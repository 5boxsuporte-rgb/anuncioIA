"use client";
import { useState } from "react";

export interface ManualData {
  title: string;
  description: string;
  price: string;
  brand: string;
  model: string;
  characteristics: string;
  technicalSheet: string;
  additionalInfo: string;
  url: string;
}

export const EMPTY_MANUAL: ManualData = {
  title: "", description: "", price: "", brand: "", model: "", characteristics: "", technicalSheet: "", additionalInfo: "", url: "",
};

export function ManualForm({ onSubmit, disabled, initialUrl }: { onSubmit: (d: ManualData) => void; disabled?: boolean; initialUrl?: string }) {
  const [d, setD] = useState<ManualData>({ ...EMPTY_MANUAL, url: initialUrl ?? "" });
  const set = (k: keyof ManualData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });

  return (
    <form
      className="card space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(d);
      }}
    >
      <div>
        <h3 className="text-lg font-semibold">Inserir informações manualmente</h3>
        <p className="text-sm text-ink-500">Copie os dados do seu anúncio. Só o título é obrigatório; quanto mais informação real, melhor o resultado. Não inventamos o que você não informar.</p>
      </div>
      <div>
        <label className="label" htmlFor="m-title">Título *</label>
        <input id="m-title" className="input" required minLength={5} maxLength={300} value={d.title} onChange={set("title")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="m-price">Preço</label>
          <input id="m-price" className="input" placeholder="R$ 59,90" value={d.price} onChange={set("price")} />
        </div>
        <div>
          <label className="label" htmlFor="m-brand">Marca</label>
          <input id="m-brand" className="input" value={d.brand} onChange={set("brand")} />
        </div>
        <div>
          <label className="label" htmlFor="m-model">Modelo</label>
          <input id="m-model" className="input" value={d.model} onChange={set("model")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="m-desc">Descrição</label>
        <textarea id="m-desc" rows={5} className="input" value={d.description} onChange={set("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="m-chars">Características (uma por linha)</label>
          <textarea id="m-chars" rows={4} className="input" value={d.characteristics} onChange={set("characteristics")} />
        </div>
        <div>
          <label className="label" htmlFor="m-sheet">Ficha técnica (uma por linha, “Nome: valor”)</label>
          <textarea id="m-sheet" rows={4} className="input" placeholder={"Material: Acrílico\nCor: Transparente"} value={d.technicalSheet} onChange={set("technicalSheet")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="m-extra">Informações adicionais</label>
        <textarea id="m-extra" rows={2} className="input" value={d.additionalInfo} onChange={set("additionalInfo")} />
      </div>
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={disabled}>Analisar com estas informações</button>
    </form>
  );
}
