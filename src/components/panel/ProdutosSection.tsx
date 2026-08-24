import React, { useState } from 'react';
import { listProductCatalog, upsertProductCatalog } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle } from './shared';

export const ProdutosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listProductCatalog(officeId);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    unit: 'unidade',
    price: '',
    code: '',
    status: 'active' as 'active' | 'inactive',
  });

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Produtos"
        subtitle="Catálogo de produtos utilizados nos atendimentos. Alterações futuras não modificam o histórico já registrado."
      />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          upsertProductCatalog(officeId, {
            name: form.name,
            brand: form.brand,
            category: form.category,
            unit: form.unit || 'unidade',
            price: Number(form.price || 0),
            code: form.code,
            status: form.status,
          });
          setForm({ name: '', brand: '', category: '', unit: 'unidade', price: '', code: '', status: 'active' });
        }}
      >
        <Field label="Produto"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Óleo 5W30" /></Field>
        <Field label="Marca"><input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex.: Mobil" /></Field>
        <Field label="Categoria" optional><input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
        <Field label="Unidade"><input className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="litro, peça..." /></Field>
        <Field label="Preço"><input className={inputClass} type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Código" optional><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })} /> Ativo</label>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Cadastrar produto</button>
      </form>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum produto no catálogo.</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
            <div>
              <p><strong>{row.name}</strong> · {row.brand || 's/ marca'}</p>
              <p className="text-xs text-slate-600">{row.category || 'sem categoria'} · {row.unit} · {formatBRL(row.price)} · {row.status === 'active' ? 'Ativo' : 'Inativo'}</p>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-sky-800 cursor-pointer"
              onClick={() => upsertProductCatalog(officeId, { ...row, status: row.status === 'active' ? 'inactive' : 'active' })}
            >
              {row.status === 'active' ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
