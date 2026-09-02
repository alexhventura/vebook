import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  attendanceTotal,
  getSubscription,
  listAppointments,
  listAttendanceProducts,
  listAttendanceServices,
  listAttendances,
  listCustomers,
  listReturns,
  listVehicles,
  onboardingProgress,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { PanelSection } from '../../lib/navigation';
import { planLabel, planSummaryLines } from '../../data/officePlans';
import { Office } from '../../types';
import {
  APPOINTMENT_STATUS_LABEL,
  PeriodKey,
  formatIsoDate,
  formatKm,
  inPeriod,
  periodRange,
  returnSituation,
} from './shared';

export const DashboardSection: React.FC<{
  office: Office;
  onSectionChange: (section: PanelSection, tab?: string) => void;
}> = ({
  office,
  onSectionChange,
}) => {
  useOfficeStore();
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { from, to } = periodRange(period, customFrom, customTo);

  const progress = onboardingProgress(office.officeId);
  const subscription = getSubscription(office.officeId);
  const customers = listCustomers(office.officeId);
  const vehicles = listVehicles(office.officeId);
  const attendances = listAttendances(office.officeId);
  const returns = listReturns(office.officeId);
  const appointments = listAppointments(office.officeId);

  const periodAttendances = attendances.filter((row) => inPeriod(row.date, from, to));
  const periodAppointments = appointments.filter((row) => inPeriod(row.date || row.createdAt, from, to));
  const revenue = periodAttendances.reduce((sum, row) => sum + attendanceTotal(row), 0);
  const pendingReturns = returns.filter((row) => row.status === 'scheduled');
  const upcomingReturns = pendingReturns
    .slice()
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  const serviceRank = useMemo(() => {
    const counts = new Map<string, number>();
    for (const attendance of periodAttendances) {
      for (const line of listAttendanceServices(office.officeId, attendance.id)) {
        counts.set(line.title, (counts.get(line.title) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [office.officeId, periodAttendances]);

  const productRank = useMemo(() => {
    const counts = new Map<string, number>();
    for (const attendance of periodAttendances) {
      for (const line of listAttendanceProducts(office.officeId, attendance.id)) {
        const key = line.brand ? `${line.name} (${line.brand})` : line.name;
        counts.set(key, (counts.get(key) || 0) + (line.quantity || 1));
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [office.officeId, periodAttendances]);

  const ticket = periodAttendances.length ? revenue / periodAttendances.length : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1E36]">Início</h2>
          <p className="text-sm text-slate-600">Visão rápida da operação da oficina no período selecionado.</p>
        </div>
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
                period === key ? 'bg-[#0B1E36] text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' ? (
        <div className="flex flex-wrap gap-3">
          <input type="date" className="px-3 py-2 rounded-xl border border-slate-300 text-sm" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <input type="date" className="px-3 py-2 rounded-xl border border-slate-300 text-sm" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: 'Atendimentos', value: String(periodAttendances.length), go: 'atendimentos' as PanelSection },
          { label: 'Faturamento', value: formatBRL(revenue), go: 'financeiro' as PanelSection },
          { label: 'Clientes', value: String(customers.length), go: 'clientes' as PanelSection },
          { label: 'Veículos', value: String(vehicles.length), go: 'veiculos' as PanelSection },
          { label: 'Retornos', value: String(pendingReturns.length), go: 'agenda' as PanelSection, tab: 'retornos' },
          { label: 'Agendamentos', value: String(periodAppointments.length), go: 'agenda' as PanelSection },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onSectionChange(card.go, 'tab' in card ? card.tab : undefined)}
            className="bg-white rounded-2xl border border-slate-200 p-4 text-left cursor-pointer"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-[#0B1E36]">{card.value}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-extrabold text-[#0B1E36]">Resumo de atendimentos</h3>
          <p className="text-sm text-slate-600">Ticket médio no período: <strong>{formatBRL(ticket)}</strong></p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Serviços mais realizados</p>
            {serviceRank.length === 0 ? <p className="text-sm text-slate-500">Sem dados no período.</p> : null}
            <ul className="space-y-1 text-sm">
              {serviceRank.map(([name, count]) => (
                <li key={name} className="flex justify-between gap-3"><span>{name}</span><strong>{count}</strong></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Produtos mais utilizados</p>
            {productRank.length === 0 ? <p className="text-sm text-slate-500">Sem dados no período.</p> : null}
            <ul className="space-y-1 text-sm">
              {productRank.map(([name, count]) => (
                <li key={name} className="flex justify-between gap-3"><span>{name}</span><strong>{count}</strong></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-[#0B1E36]">Próximos retornos</h3>
            <button type="button" onClick={() => onSectionChange('agenda', 'retornos')} className="text-xs font-bold text-sky-800 cursor-pointer">Ver retornos</button>
          </div>
          {upcomingReturns.length === 0 ? <p className="text-sm text-slate-500">Nenhum retorno pendente.</p> : null}
          <ul className="space-y-3">
            {upcomingReturns.map((row) => {
              const customer = customers.find((item) => item.id === row.customerId);
              const vehicle = vehicles.find((item) => item.id === row.vehicleId);
              return (
                <li key={row.id} className="text-sm border-b border-slate-100 pb-3 last:border-0">
                  <p className="font-bold text-[#0B1E36]">{customer?.name || 'Cliente não vinculado'}</p>
                  <p className="text-slate-600 font-mono">{vehicle?.plate || '—'}</p>
                  <p className="text-slate-600">{row.serviceTitle || row.reason}</p>
                  <p className="text-slate-500">
                    {row.nextMileageKm != null ? `Retorno previsto: ${formatKm(row.nextMileageKm)}` : null}
                    {row.dueDate ? ` · ${formatIsoDate(row.dueDate)}` : null}
                    {' · '}
                    {returnSituation(row.status, row.dueDate)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[#0B1E36]">Agendamentos</h3>
          <button type="button" onClick={() => onSectionChange('agenda')} className="text-xs font-bold text-sky-800 cursor-pointer">Ver agenda</button>
        </div>
        {appointments.slice(0, 4).length === 0 ? <p className="text-sm text-slate-500">Nenhuma solicitação ainda.</p> : null}
        <ul className="space-y-3">
          {appointments.slice(0, 4).map((row) => (
            <li key={row.id} className="text-sm flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0">
              <div>
                <p className="font-bold text-[#0B1E36]">{row.customerName}</p>
                <p className="text-slate-600">{row.service || 'Serviço não informado'}</p>
                <p className="text-slate-500">{formatIsoDate(row.date)}{row.time ? ` — ${row.time}` : row.period ? ` — ${row.period}` : ''}</p>
              </div>
              <span className="text-xs font-bold text-slate-700">{APPOINTMENT_STATUS_LABEL[row.status]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
        <h3 className="text-lg font-extrabold text-[#0B1E36]">Complete sua oficina</h3>
        <p className="text-sm text-slate-600">O onboarding não bloqueia nenhuma funcionalidade. Complete no seu ritmo.</p>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-[#0B1E36]" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="text-xs font-bold text-slate-600">{progress.percent}% concluído</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {progress.items.map((item) => (
            <li key={item.id} className={`flex items-center gap-2 ${item.done ? 'text-emerald-700' : 'text-slate-600'}`}>
              <CheckCircle2 className={`w-4 h-4 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {subscription ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-sm space-y-1">
          <p className="font-bold text-[#0B1E36]">{planLabel(subscription.modality)}</p>
          {planSummaryLines(subscription.modality).map((line) => <p key={line} className="text-slate-600 text-xs">{line}</p>)}
          <p className="text-xs text-slate-500">Status: {subscription.status}. Valores comerciais não são alterados pelo painel.</p>
        </div>
      ) : null}
    </div>
  );
};
