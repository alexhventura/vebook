import React, { useMemo, useState } from 'react';
import {
  attendanceTotal,
  financialSummary,
  listAttendanceProducts,
  listAttendanceServices,
  listCustomers,
  listVehicles,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { PeriodKey, SectionTitle, formatIsoDate, periodRange } from './shared';

export const FinanceiroSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { from, to } = periodRange(period, customFrom, customTo);

  const summary = useMemo(() => financialSummary(officeId, from, to), [officeId, from, to]);
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const customerById = Object.fromEntries(customers.map((row) => [row.id, row]));
  const vehicleById = Object.fromEntries(vehicles.map((row) => [row.id, row]));

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Financeiro"
        subtitle="Análise detalhada das receitas originadas dos atendimentos. O Início apresenta apenas resumos."
      />

      <div className="flex flex-wrap gap-2">
        {([
          ['hoje', 'Hoje'],
          ['7d', '7 dias'],
          ['30d', '30 dias'],
          ['mes', 'Este mês'],
          ['mes-anterior', 'Mês anterior'],
          ['custom', 'Personalizado'],
        ] as Array<[PeriodKey, string]>).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              period === key ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {period === 'custom' ? (
        <div className="flex flex-wrap gap-3">
          <input type="date" className="px-3 py-2 rounded-xl border border-slate-300 text-sm" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <input type="date" className="px-3 py-2 rounded-xl border border-slate-300 text-sm" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Faturamento', value: formatBRL(summary.revenue) },
          { label: 'Serviços', value: formatBRL(summary.servicesAmount) },
          { label: 'Produtos', value: formatBRL(summary.productsAmount) },
          { label: 'Mão de obra', value: formatBRL(summary.laborAmount) },
          { label: 'Ticket médio', value: formatBRL(summary.ticketAverage) },
          { label: 'Atendimentos', value: String(summary.attendanceCount) },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-[#0B1E36]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="font-extrabold text-[#0B1E36]">Detalhamento por atendimento</h3>
          <p className="text-xs text-slate-500">Valores praticados no momento do registro, preservados historicamente.</p>
        </div>
        {summary.attendances.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Nenhum atendimento no período selecionado.</p>
        ) : null}
        {summary.attendances.map((row) => {
          const customer = row.customerId ? customerById[row.customerId] : undefined;
          const vehicle = row.vehicleId ? vehicleById[row.vehicleId] : undefined;
          const services = listAttendanceServices(officeId, row.id);
          const products = listAttendanceProducts(officeId, row.id);
          return (
            <article key={row.id} className="px-4 py-4 text-sm space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#0B1E36]">{formatIsoDate(row.date)}</p>
                  <p className="text-slate-600">{customer?.name || 'Cliente não vinculado'} · {vehicle?.plate || '—'}</p>
                </div>
                <p className="text-lg font-black text-[#0B1E36]">{formatBRL(attendanceTotal(row))}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <p>Serviços: <strong>{formatBRL(row.servicesAmount ?? 0)}</strong></p>
                <p>Produtos: <strong>{formatBRL(row.productsAmount ?? 0)}</strong></p>
                <p>Mão de obra: <strong>{formatBRL(row.laborAmount ?? 0)}</strong></p>
              </div>
              {services.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {services.map((line) => (
                    <li key={line.id}>• {line.title}{line.amount != null ? ` — ${formatBRL(line.amount)}` : ''}</li>
                  ))}
                </ul>
              ) : null}
              {products.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {products.map((line) => (
                    <li key={line.id}>
                      • {line.name}{line.brand ? ` (${line.brand})` : ''}
                      {line.quantity != null ? ` × ${line.quantity}` : ''}
                      {line.amount != null ? ` — ${formatBRL(line.amount)}` : ''}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};
