import React, { useMemo, useState } from 'react';
import {
  lastAttendanceForVehicle,
  listAttendanceProducts,
  listAttendanceServices,
  listAttendances,
  listCustomers,
  listReturns,
  listVehicles,
  upsertVehicle,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { formatPlate } from '../../lib/utils';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle, formatIsoDate, formatKm, returnSituation } from './shared';

export const VeiculosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listVehicles(officeId);
  const customers = listCustomers(officeId);
  const attendances = listAttendances(officeId);
  const returns = listReturns(officeId);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    plate: '',
    brand: '',
    model: '',
    version: '',
    year: '',
    mileageKm: '',
    notes: '',
    customerId: '',
  });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const customer = customers.find((item) => item.id === row.customerId);
      const haystack = [row.plate, row.brand, row.model, customer?.name].filter(Boolean).join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rows, query, customers]);

  const selected = rows.find((row) => row.id === selectedId);

  if (selected) {
    const customer = customers.find((item) => item.id === selected.customerId);
    const history = attendances
      .filter((row) => row.vehicleId === selected.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const upcoming = returns.filter((row) => row.vehicleId === selected.id && row.status === 'scheduled');
    return (
      <section className="space-y-4">
        <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-bold text-sky-800 cursor-pointer">← Voltar para veículos</button>
        <SectionTitle title={selected.plate} subtitle="Perfil privado do veículo na oficina." />
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
          <p><strong>{selected.brand} {selected.model}</strong> {selected.version || ''}</p>
          <p>Ano: {selected.year || '—'}</p>
          <p>KM: {formatKm(selected.mileageKm)}</p>
          <p>Cliente vinculado (somente painel): {customer?.name || 'não informado'}</p>
          {selected.notes ? <p>Observações: {selected.notes}</p> : null}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-extrabold text-[#0B1E36]">Histórico</h3>
          {history.length === 0 ? <p className="text-sm text-slate-500">Sem atendimentos.</p> : null}
          {history.map((row) => (
            <article key={row.id} className="text-sm border-b border-slate-100 pb-3 last:border-0">
              <p className="font-bold">{formatIsoDate(row.date)} · {formatBRL(row.totalAmount ?? 0)}</p>
              {listAttendanceServices(officeId, row.id).map((line) => <p key={line.id}>{line.title}</p>)}
              {listAttendanceProducts(officeId, row.id).map((line) => (
                <p key={line.id} className="text-slate-600">{line.quantity} {line.unit || 'un'} {line.brand} {line.name}</p>
              ))}
            </article>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Próximos retornos</h3>
          {upcoming.length === 0 ? <p className="text-sm text-slate-500">Nenhum retorno pendente.</p> : null}
          {upcoming.map((row) => (
            <p key={row.id} className="text-sm">
              {row.serviceTitle || row.reason} · {row.dueDate ? formatIsoDate(row.dueDate) : '—'} · {row.nextMileageKm != null ? formatKm(row.nextMileageKm) : ''} · {returnSituation(row.status, row.dueDate)}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionTitle title="Veículos" subtitle="Veículos cadastrados pela oficina. O vínculo com o cliente permanece privado." />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.plate.trim()) return;
          upsertVehicle(officeId, {
            plate: formatPlate(form.plate),
            brand: form.brand,
            model: form.model,
            version: form.version,
            year: form.year ? Number(form.year) : undefined,
            mileageKm: form.mileageKm ? Number(form.mileageKm) : undefined,
            notes: form.notes,
            customerId: form.customerId || undefined,
          });
          setForm({ plate: '', brand: '', model: '', version: '', year: '', mileageKm: '', notes: '', customerId: '' });
        }}
      >
        <Field label="Placa"><input className={`${inputClass} uppercase`} value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} /></Field>
        <Field label="Cliente"><select className={inputClass} value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Selecionar</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
        <Field label="Marca"><input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
        <Field label="Modelo"><input className={inputClass} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
        <Field label="Versão" optional><input className={inputClass} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></Field>
        <Field label="Ano" optional><input className={inputClass} type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
        <Field label="Quilometragem" optional><input className={inputClass} type="number" value={form.mileageKm} onChange={(e) => setForm({ ...form, mileageKm: e.target.value })} /></Field>
        <Field label="Observações" optional><input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Cadastrar veículo</button>
      </form>
      <input className={inputClass} placeholder="Buscar por placa, modelo ou cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {filtered.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum veículo encontrado.</p> : null}
        {filtered.map((row) => {
          const customer = customers.find((item) => item.id === row.customerId);
          const last = lastAttendanceForVehicle(officeId, row.id);
          const count = attendances.filter((item) => item.vehicleId === row.id).length;
          return (
            <button key={row.id} type="button" onClick={() => setSelectedId(row.id)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 cursor-pointer">
              <p><strong className="font-mono">{row.plate}</strong> · {row.brand} {row.model} {row.year || ''}</p>
              <p className="text-xs text-slate-600">Cliente: {customer?.name || '—'} · Atendimentos: {count} · Último: {last ? formatIsoDate(last.date) : '—'}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
