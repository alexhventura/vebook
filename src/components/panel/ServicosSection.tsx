import React, { useState } from 'react';
import { listServiceCatalog, upsertServiceCatalog } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle } from './shared';

export const ServicosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listServiceCatalog(officeId);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    durationMinutes: '',
    status: 'active' as 'active' | 'inactive',
    publicVisible: true,
  });

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Serviços"
        subtitle="Catálogo da oficina. Diferente de Atendimentos: aqui você cadastra o que pode ser oferecido; o atendimento registra o que foi realizado."
      />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          upsertServiceCatalog(officeId, {
            name: form.name,
            description: form.description,
            category: form.category,
            price: Number(form.price || 0),
            durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
            status: form.status,
            publicVisible: form.publicVisible,
          });
          setForm({ name: '', description: '', category: '', price: '', durationMinutes: '', status: 'active', publicVisible: true });
        }}
      >
        <Field label="Nome"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Categoria"><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex.: Freios" /></Field>
        <Field label="Preço"><input className={inputClass} type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Duração estimada (min)" optional><input className={inputClass} type="number" min={0} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></Field>
        <Field label="Descrição" optional>
          <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })} /> Ativo</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.publicVisible} onChange={(e) => setForm({ ...form, publicVisible: e.target.checked })} /> Exibir na página pública</label>
        </div>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Cadastrar serviço</button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum serviço no catálogo.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
            <div>
              <p><strong>{row.name}</strong> · {row.category || 'sem categoria'}</p>
              <p className="text-xs text-slate-600">{formatBRL(row.price)}{row.durationMinutes ? ` · ${row.durationMinutes} min` : ''} · {row.status === 'active' ? 'Ativo' : 'Inativo'}{row.publicVisible ? ' · Público' : ''}</p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-sky-800 cursor-pointer"
              onClick={() => upsertServiceCatalog(officeId, { ...row, status: row.status === 'active' ? 'inactive' : 'active' })}
            >
              {row.status === 'active' ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
