import React, { useMemo, useState } from 'react';
import {
  listAttendanceProducts,
  listAttendanceServices,
  listAttendances,
  listCustomers,
  listVehicles,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle, formatIsoDate } from './shared';
import { NovoAtendimentoWizard } from './atendimentos/NovoAtendimentoWizard';

export const AtendimentosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listAttendances(officeId).slice().sort((a, b) => b.date.localeCompare(a.date));
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);

  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      const customer = customers.find((item) => item.id === row.customerId);
      const vehicle = vehicles.find((item) => item.id === row.vehicleId);
      const servicesText = listAttendanceServices(officeId, row.id).map((line) => line.title).join(' ');
      const haystack = [customer?.name, vehicle?.plate, vehicle?.model, servicesText, row.notes].filter(Boolean).join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rows, query, statusFilter, customers, vehicles, officeId]);

  if (mode === 'new') {
    return (
      <NovoAtendimentoWizard
        officeId={officeId}
        onBack={() => setMode('list')}
        onFinished={() => setMode('list')}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Atendimentos" subtitle="Serviços efetivamente realizados pela oficina." />
        <button type="button" onClick={() => setMode('new')} className="px-4 py-2 rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer">
          Novo atendimento
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className={inputClass} placeholder="Buscar por cliente, placa ou serviço" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="completed">Concluído</option>
          <option value="open">Aberto</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <p className="text-sm text-slate-500">Nenhum atendimento encontrado.</p> : null}
        {filtered.map((row) => {
          const customer = customers.find((item) => item.id === row.customerId);
          const vehicle = vehicles.find((item) => item.id === row.vehicleId);
          const serviceLines = listAttendanceServices(officeId, row.id);
          return (
            <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-[#0B1E36]">{formatIsoDate(row.date)} · {customer?.name || 'Cliente não informado'}</p>
                <span className="text-xs font-bold">{row.status === 'completed' ? 'Concluído' : 'Aberto'}</span>
              </div>
              <p className="text-slate-600 font-mono">{vehicle?.plate || '—'} · {vehicle?.model || 'modelo'}</p>
              <p className="text-slate-600">{serviceLines.map((line) => line.title).join(', ') || 'Sem serviços'}</p>
              <p className="font-extrabold text-[#0B1E36]">{formatBRL(row.totalAmount ?? 0)}</p>
              {listAttendanceProducts(officeId, row.id).map((line) => (
                <p key={line.id} className="text-xs text-slate-500">{line.quantity} {line.unit || 'un'} · {line.brand ? `${line.brand} ` : ''}{line.name}</p>
              ))}
            </article>
          );
        })}
      </div>
    </section>
  );
};
