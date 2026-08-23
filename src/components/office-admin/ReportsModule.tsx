import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DateRange, formatBrl, formatDate, inRange, PeriodPreset, rangeForPreset } from '../../office/period';
import { summarizeFinance, workOrdersInRange } from '../../office/finance';
import {
  getGlobalProduct,
  officeClients,
  officeReturns,
  officeVehicles,
  officeWorkOrders,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { isProductRevenue, RETURN_REASON_LABELS, SERVICE_CATEGORY_LABELS } from '../../office/types';
import { PeriodFilter } from './shared';

type Ctx = { officeId: string };
type Tab = 'clientes' | 'veiculos' | 'servicos' | 'produtos' | 'financeiro' | 'retornos';

export const ReportsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [tab, setTab] = useState<Tab>('clientes');
  const [preset, setPreset] = useState<PeriodPreset>('30d');
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-23');
  const [applied, setApplied] = useState<DateRange>(() => rangeForPreset('30d'));

  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const orders = officeWorkOrders(officeId);
  const returns = officeReturns(officeId);
  const now = new Date();

  const ordersInRange = useMemo(() => workOrdersInRange(orders, applied), [orders, applied]);
  const finance = useMemo(() => summarizeFinance(orders, applied), [orders, applied]);

  const apply = (nextPreset = preset) => {
    setApplied(rangeForPreset(nextPreset, from, to));
    setPreset(nextPreset);
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'clientes', label: 'Clientes' },
    { id: 'veiculos', label: 'Veículos' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'retornos', label: 'Retornos' },
  ];

  const clientReports = useMemo(() => {
    const newClients = clients.filter((c) => inRange(c.createdAt, applied));
    const orderCountByClient = new Map<string, number>();
    ordersInRange.forEach((o) => orderCountByClient.set(o.clientId, (orderCountByClient.get(o.clientId) ?? 0) + 1));
    const recurring = Array.from(orderCountByClient.entries()).filter(([, count]) => count >= 2);
    const activeIds = new Set(ordersInRange.map((o) => o.clientId));
    const inactive = clients.filter((c) => !activeIds.has(c.id));
    return { newClients, recurring, inactive };
  }, [clients, ordersInRange, applied]);

  const vehicleReports = useMemo(() => {
    const map = new Map<string, number>();
    ordersInRange.forEach((o) => {
      const v = vehicles.find((veh) => veh.id === o.vehicleId);
      if (!v) return;
      const key = `${v.brand} · ${v.model} · ${v.year}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [ordersInRange, vehicles]);

  const serviceReports = useMemo(() => {
    const map = new Map<string, { count: number; labor: number }>();
    ordersInRange.forEach((o) => {
      o.services.forEach((s) => {
        const key = `${SERVICE_CATEGORY_LABELS[s.category]} — ${s.description}`;
        const current = map.get(key) ?? { count: 0, labor: 0 };
        current.count += s.quantity;
        current.labor += s.laborAmount * s.quantity;
        map.set(key, current);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [ordersInRange]);

  const productReports = useMemo(() => {
    const usage = new Map<string, number>();
    const brands = new Map<string, number>();
    ordersInRange.forEach((o) => {
      o.products.forEach((line) => {
        const product = getGlobalProduct(line.productId);
        if (!product) return;
        const label = `${product.name} · ${product.brand}`;
        usage.set(label, (usage.get(label) ?? 0) + line.quantity);
        brands.set(product.brand, (brands.get(product.brand) ?? 0) + line.quantity);
        if (isProductRevenue(line)) {
          /* revenue tracked in finance tab */
        }
      });
    });
    return {
      usage: Array.from(usage.entries()).sort((a, b) => b[1] - a[1]),
      brands: Array.from(brands.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [ordersInRange]);

  const returnReports = useMemo(() => {
    const inRangeReturns = returns.filter((r) => inRange(r.dueDate, applied));
    const predicted = inRangeReturns.filter((r) => new Date(r.dueDate) >= now);
    const overdue = inRangeReturns.filter((r) => new Date(r.dueDate) < now);
    const byReason = new Map<string, number>();
    inRangeReturns.forEach((r) => {
      const key = r.reason ? RETURN_REASON_LABELS[r.reason] : 'Não informado';
      byReason.set(key, (byReason.get(key) ?? 0) + 1);
    });
    return { predicted, overdue, byReason: Array.from(byReason.entries()) };
  }, [returns, applied, now]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Relatórios</h1>
        <p className="text-sm text-slate-600">Agregados operacionais desta oficina no período selecionado.</p>
      </div>

      <PeriodFilter preset={preset} from={from} to={to} onPreset={(next) => apply(next)} onFrom={setFrom} onTo={setTo} onApply={() => apply('custom')} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === item.id ? 'bg-[#0B1E36] text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'clientes' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <ReportCard title={`Novos (${clientReports.newClients.length})`} rows={clientReports.newClients.map((c) => [c.name, formatDate(c.createdAt)])} />
          <ReportCard title={`Recorrentes (${clientReports.recurring.length})`} rows={clientReports.recurring.map(([id, count]) => [clients.find((c) => c.id === id)?.name ?? id, `${count} atendimentos`])} />
          <ReportCard title={`Inativos no período (${clientReports.inactive.length})`} rows={clientReports.inactive.slice(0, 20).map((c) => [c.name, c.phone])} />
        </div>
      )}

      {tab === 'veiculos' && (
        <ReportCard title="Atendimentos por marca/modelo/ano" rows={vehicleReports.map(([key, count]) => [key, String(count)])} />
      )}

      {tab === 'servicos' && (
        <ReportCard title="Linhas de serviço" rows={serviceReports.map(([key, stats]) => [key, `${stats.count} · ${formatBrl(stats.labor)}`])} />
      )}

      {tab === 'produtos' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportCard title="Uso (quantidade)" rows={productReports.usage.map(([label, qty]) => [label, String(qty)])} />
          <ReportCard title="Marcas" rows={productReports.brands.map(([brand, qty]) => [brand, String(qty)])} />
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Faturado', formatBrl(finance.billed)],
            ['Recebido', formatBrl(finance.received)],
            ['A receber', formatBrl(finance.receivable)],
            ['Margem', formatBrl(finance.margin)],
            ['Ticket', formatBrl(finance.ticketAverage)],
            ['Mão de obra', formatBrl(finance.labor)],
            ['Receita produtos', formatBrl(finance.productsRevenue)],
            ['Atendimentos', String(finance.workOrderCount)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-[#0B1E36]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'retornos' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <ReportCard title={`Previstos (${returnReports.predicted.length})`} rows={returnReports.predicted.map((r) => [clients.find((c) => c.id === r.clientId)?.name ?? '—', formatDate(r.dueDate)])} />
          <ReportCard title={`Atrasados (${returnReports.overdue.length})`} rows={returnReports.overdue.map((r) => [clients.find((c) => c.id === r.clientId)?.name ?? '—', formatDate(r.dueDate)])} />
          <ReportCard title="Por motivo" rows={returnReports.byReason.map(([reason, count]) => [reason, String(count)])} />
        </div>
      )}
    </div>
  );
};

const ReportCard: React.FC<{ title: string; rows: string[][] }> = ({ title, rows }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="font-bold text-[#0B1E36]">{title}</h2>
    <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto text-sm">
      {rows.length === 0 && <li className="text-slate-500">Sem registros.</li>}
      {rows.map((row, i) => (
        <li key={i} className="flex justify-between gap-2 border-b border-slate-50 py-1">
          <span>{row[0]}</span>
          <span className="text-slate-500">{row[1]}</span>
        </li>
      ))}
    </ul>
  </section>
);
