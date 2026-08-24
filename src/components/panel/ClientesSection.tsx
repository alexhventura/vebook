import React, { useMemo, useState } from 'react';
import {
  lastAttendanceForCustomer,
  listAttendances,
  listCustomers,
  listReturns,
  listVehicles,
  upsertCustomer,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { onlyDigits } from '../../lib/cpf';
import { formatPhone } from '../../lib/phone';
import { Field, inputClass } from '../ui/Field';
import { CommunicationNotice, SectionTitle, formatIsoDate, formatKm, returnSituation } from './shared';

export const ClientesSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const attendances = listAttendances(officeId);
  const returns = listReturns(officeId);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', email: '', notes: '' });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const haystack = [row.name, row.phone, row.whatsapp, row.email].filter(Boolean).join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rows, query]);

  const selected = rows.find((row) => row.id === selectedId);

  if (selected) {
    const customerVehicles = vehicles.filter((row) => row.customerId === selected.id);
    const customerAttendances = attendances
      .filter((row) => row.customerId === selected.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const customerReturns = returns.filter((row) => row.customerId === selected.id);
    return (
      <section className="space-y-4">
        <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-bold text-sky-800 cursor-pointer">← Voltar para clientes</button>
        <SectionTitle title={selected.name} subtitle="Perfil administrativo do cliente. Dados privados ficam só no painel." />
        <CommunicationNotice />
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
          <p>Telefone: {selected.phone ? formatPhone(selected.phone) : 'não informado'}</p>
          <p>WhatsApp: {selected.whatsapp ? formatPhone(selected.whatsapp) : 'não informado'}</p>
          <p>E-mail: {selected.email || 'não informado'}</p>
          {selected.notes ? <p>Observações: {selected.notes}</p> : null}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Veículos</h3>
          {customerVehicles.length === 0 ? <p className="text-sm text-slate-500">Nenhum veículo vinculado.</p> : null}
          {customerVehicles.map((vehicle) => (
            <p key={vehicle.id} className="text-sm"><strong className="font-mono">{vehicle.plate}</strong> · {vehicle.brand} {vehicle.model}</p>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Histórico de atendimentos</h3>
          {customerAttendances.length === 0 ? <p className="text-sm text-slate-500">Nenhum atendimento.</p> : null}
          {customerAttendances.map((row) => (
            <p key={row.id} className="text-sm">{formatIsoDate(row.date)} · {formatBRL(row.totalAmount ?? 0)}</p>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
          <h3 className="font-extrabold text-[#0B1E36]">Retornos</h3>
          {customerReturns.length === 0 ? <p className="text-sm text-slate-500">Nenhum retorno.</p> : null}
          {customerReturns.map((row) => (
            <p key={row.id} className="text-sm">
              {row.serviceTitle || row.reason} · {row.dueDate ? formatIsoDate(row.dueDate) : 'sem data'} · {row.nextMileageKm != null ? formatKm(row.nextMileageKm) : ''} · {returnSituation(row.status, row.dueDate)}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Clientes"
        subtitle="Cadastro administrativo da oficina. Telefone, WhatsApp e e-mail não aparecem na página pública do veículo nem na consulta do Diário."
      />
      <CommunicationNotice />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          upsertCustomer(officeId, form);
          setForm({ name: '', phone: '', whatsapp: '', email: '', notes: '' });
        }}
      >
        <Field label="Nome completo"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Telefone"><input className={inputClass} value={formatPhone(form.phone)} onChange={(e) => setForm({ ...form, phone: onlyDigits(e.target.value) })} /></Field>
        <Field label="WhatsApp" optional><input className={inputClass} value={formatPhone(form.whatsapp)} onChange={(e) => setForm({ ...form, whatsapp: onlyDigits(e.target.value) })} /></Field>
        <Field label="E-mail" optional><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Observações internas" optional>
          <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Cadastrar cliente</button>
      </form>
      <input className={inputClass} placeholder="Buscar por nome, telefone ou e-mail" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {filtered.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum cliente encontrado.</p> : null}
        {filtered.map((row) => {
          const vehicleCount = vehicles.filter((item) => item.customerId === row.id).length;
          const last = lastAttendanceForCustomer(officeId, row.id);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 cursor-pointer"
            >
              <p><strong>{row.name}</strong></p>
              <p className="text-xs text-slate-600">
                {row.phone ? formatPhone(row.phone) : 'sem telefone'}
                {' · '}
                WhatsApp: {row.whatsapp ? formatPhone(row.whatsapp) : '—'}
                {' · '}
                {row.email || 'sem e-mail'}
              </p>
              <p className="text-xs text-slate-500">{vehicleCount} veículo(s) · Último atendimento: {last ? formatIsoDate(last.date) : '—'}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
