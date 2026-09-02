import React, { useMemo, useState } from 'react';
import { listProductCatalog, upsertProductCatalog } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { Field, inputClass } from '../ui/Field';
import { AutocompleteField } from './AutocompleteField';
import { SectionTitle } from './shared';

export const ProdutosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listProductCatalog(officeId);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    unit: 'unidade',
    price: '',
    code: '',
    status: 'active' as 'active' | 'inactive',
  });

  const nameOptions = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        label: row.name,
        description: `${row.brand || 's/ marca'} · ${formatBRL(row.price)}`,
        keywords: `${row.name} ${row.brand || ''} ${row.category || ''}`,
      })),
    [rows],
  );

  const brandOptions = useMemo(() => {
    const brands = [...new Set(rows.map((row) => row.brand).filter(Boolean) as string[])];
    return brands.map((brand) => ({ id: brand, label: brand }));
  }, [rows]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(rows.map((row) => row.category).filter(Boolean) as string[])];
    return categories.map((category) => ({ id: category, label: category }));
  }, [rows]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const haystack = [row.name, row.brand, row.category, row.code].filter(Boolean).join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rows, query]);

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
        <Field label="Produto">
          <AutocompleteField
            value={form.name}
            options={nameOptions}
            placeholder="Ex.: Óleo 5W30"
            onChange={(next) => setForm({ ...form, name: next })}
            onSelect={(option) => {
              const item = rows.find((row) => row.id === option.id);
              if (!item) return;
              setForm({
                name: item.name,
                brand: item.brand || '',
                category: item.category || '',
                unit: item.unit || 'unidade',
                price: String(item.price),
                code: item.code || '',
                status: item.status,
              });
            }}
          />
        </Field>
        <Field label="Marca">
          <AutocompleteField
            value={form.brand}
            options={brandOptions}
            placeholder="Ex.: Mobil"
            onChange={(next) => setForm({ ...form, brand: next })}
          />
        </Field>
        <Field label="Categoria" optional>
          <AutocompleteField
            value={form.category}
            options={categoryOptions}
            onChange={(next) => setForm({ ...form, category: next })}
          />
        </Field>
        <Field label="Unidade"><input className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="litro, peça..." /></Field>
        <Field label="Preço"><input className={inputClass} type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
        <Field label="Código" optional><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })} /> Ativo</label>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Cadastrar produto</button>
      </form>
      <AutocompleteField
        value={query}
        options={nameOptions}
        placeholder="Buscar produto no catálogo"
        onChange={setQuery}
        showEmptyMessage={false}
      />
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {filtered.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum produto no catálogo.</p> : null}
        {filtered.map((row) => (
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
