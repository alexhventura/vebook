import React, { useMemo, useState } from 'react';
import { listCustomers, listReturns, listVehicles, upsertReturn } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { Field, inputClass } from '../ui/Field';
import { CommunicationNotice, SectionTitle, daysUntilIso, formatIsoDate, formatKm, returnSituation } from './shared';

export const RetornosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listReturns(officeId);
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const [filter, setFilter] = useState<'proximos' | 'atrasados' | 'concluidos' | 'todos'>('proximos');
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [nextMileageKm, setNextMileageKm] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const customerById = Object.fromEntries(customers.map((row) => [row.id, row]));
  const vehicleById = Object.fromEntries(vehicles.map((row) => [row.id, row]));

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (filter === 'concluidos') return row.status === 'done' || row.status === 'cancelled';
      if (row.status !== 'scheduled') return false;
      const days = daysUntilIso(row.dueDate);
      if (filter === 'atrasados') return days != null && days < 0;
      if (filter === 'proximos') return days == null || days >= 0;
      return true;
    }).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [rows, filter]);

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Retornos"
        subtitle="Controle interno de previsão de retorno do veículo. Não confundir com Agenda. O VEBOOK não avisa o cliente."
      />
      <CommunicationNotice />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!serviceTitle.trim() || (!dueDate && !nextMileageKm)) return;
          upsertReturn(officeId, {
            customerId: customerId || undefined,
            vehicleId: vehicleId || undefined,
            reason: serviceTitle.trim(),
            serviceTitle: serviceTitle.trim(),
            nextMileageKm: nextMileageKm ? Number(nextMileageKm) : undefined,
            dueDate: dueDate || undefined,
            notes,
            status: 'scheduled',
          });
          setCustomerId('');
          setVehicleId('');
          setServiceTitle('');
          setNextMileageKm('');
          setDueDate('');
          setNotes('');
        }}
      >
        <Field label="Cliente">
          <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Selecionar</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </Field>
        <Field label="Veículo">
          <select className={inputClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Selecionar</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plate}</option>)}
          </select>
        </Field>
        <Field label="Serviço"><input className={inputClass} value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} placeholder="Ex.: Troca de óleo" /></Field>
        <Field label="Quilometragem prevista" optional><input className={inputClass} type="number" value={nextMileageKm} onChange={(e) => setNextMileageKm(e.target.value)} /></Field>
        <Field label="Data prevista" optional><input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
        <Field label="Observação" optional><input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Registrar retorno</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {([
          ['proximos', 'Próximos'],
          ['atrasados', 'Atrasados'],
          ['concluidos', 'Concluídos'],
          ['todos', 'Todos'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filter === key ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {filtered.length === 0 ? <p className="p-4 text-sm text-slate-500">Nenhum retorno neste filtro.</p> : null}
        {filtered.map((row) => {
          const customer = row.customerId ? customerById[row.customerId] : undefined;
          const vehicle = row.vehicleId ? vehicleById[row.vehicleId] : undefined;
          return (
            <div key={row.id} className="px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p><strong>{customer?.name || 'Cliente não vinculado'}</strong> · <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{returnSituation(row.status, row.dueDate)}</span></p>
                <p className="text-slate-600">Veículo: {vehicle?.plate || 'não informado'}</p>
                <p className="text-slate-600">Serviço: {row.serviceTitle || row.reason}</p>
                {row.nextMileageKm != null ? <p className="text-slate-600">KM prevista: {formatKm(row.nextMileageKm)}</p> : null}
                <p className="text-slate-600">Data prevista: {row.dueDate ? formatIsoDate(row.dueDate) : '—'}</p>
              </div>
              {row.status === 'scheduled' ? (
                <div className="flex gap-3">
                  <button type="button" onClick={() => upsertReturn(officeId, { ...row, status: 'done' })} className="text-xs font-bold text-sky-800 cursor-pointer">Marcar realizado</button>
                  <button type="button" onClick={() => upsertReturn(officeId, { ...row, status: 'cancelled' })} className="text-xs font-bold text-rose-700 cursor-pointer">Cancelar</button>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-800">{row.status === 'done' ? 'Realizado' : 'Cancelado'}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
