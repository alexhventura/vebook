import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DateRange, formatBrl, inRange, rangeForPreset, PeriodPreset } from '../../office/period';
import {
  officeAppointments,
  officeClients,
  officeReturns,
  officeServices,
  officeWorkOrders,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { BarChart, PeriodFilter } from './shared';

export const DashboardModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<{ officeId: string }>();
  const [preset, setPreset] = useState<PeriodPreset>('30d');
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-23');
  const [applied, setApplied] = useState<DateRange>(() => rangeForPreset('30d'));

  const apply = (nextPreset = preset) => {
    setApplied(rangeForPreset(nextPreset, from, to));
    setPreset(nextPreset);
  };

  const orders = officeWorkOrders(officeId).filter((item) => inRange(item.date, applied));
  const appointments = officeAppointments(officeId).filter((item) => inRange(item.startsAt, applied));
  const clients = officeClients(officeId);
  const returns = officeReturns(officeId);
  const services = officeServices(officeId);

  const revenue = orders.filter((item) => item.status !== 'cancelado').reduce((sum, item) => sum + item.amount, 0);
  const done = orders.filter((item) => item.status === 'concluido').length;
  const uniqueClients = new Set(orders.map((item) => item.clientId)).size;
  const pendingReturns = returns.filter((item) => inRange(item.dueDate, applied) && new Date(item.dueDate) <= new Date()).length;

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((item) => {
      const key = new Date(item.date).toLocaleDateString('pt-BR');
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).slice(-8).map(([label, value]) => ({ label, value }));
  }, [orders]);

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((item) => {
      const key = new Date(item.date).toLocaleDateString('pt-BR');
      map.set(key, (map.get(key) ?? 0) + item.amount);
    });
    return Array.from(map.entries()).slice(-8).map(([label, value]) => ({ label, value: Math.round(value) }));
  }, [orders]);

  const topServices = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((item) => {
      const name = services.find((svc) => svc.id === item.serviceId)?.name ?? 'Serviço';
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  }, [orders, services]);

  const upcoming = returns
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  const cards = [
    { label: 'Atendimentos', value: String(orders.length) },
    { label: 'Faturamento', value: formatBrl(revenue) },
    { label: 'Clientes', value: String(uniqueClients) },
    { label: 'Agendamentos', value: String(appointments.length) },
    { label: 'Atendimentos concluídos', value: String(done) },
    { label: 'Retornos pendentes', value: String(pendingReturns) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Dashboard</h1>
        <p className="text-sm text-slate-600">Indicadores da oficina no período selecionado.</p>
      </div>
      <PeriodFilter
        preset={preset}
        from={from}
        to={to}
        onPreset={(next) => apply(next)}
        onFrom={setFrom}
        onTo={setTo}
        onApply={() => apply('custom')}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0B1E36]">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BarChart title="Atendimentos ao longo do tempo" items={byDay} />
        <BarChart title="Faturamento" items={revenueByDay} />
        <BarChart title="Serviços mais realizados" items={topServices} />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0B1E36]">Próximos retornos</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {upcoming.map((item) => {
            const client = clients.find((c) => c.id === item.clientId);
            return (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>{client?.name}</span>
                <span className="text-slate-500">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
