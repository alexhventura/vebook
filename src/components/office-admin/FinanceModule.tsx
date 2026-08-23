import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DateRange, formatBrl, PeriodPreset, rangeForPreset } from '../../office/period';
import { summarizeFinance } from '../../office/finance';
import { officeUsers, officeWorkOrders } from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { Alert } from '../ui/Alert';
import { Select } from '../ui/Select';
import { PeriodFilter } from './shared';

type Ctx = { officeId: string };

export const FinanceModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [preset, setPreset] = useState<PeriodPreset>('30d');
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-23');
  const [applied, setApplied] = useState<DateRange>(() => rangeForPreset('30d'));
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const employees = officeUsers(officeId).filter((u) => u.active);
  const allOrders = officeWorkOrders(officeId);

  const filteredOrders = useMemo(() => {
    if (employeeFilter === 'all') return allOrders;
    return allOrders.filter((order) => order.services.some((s) => s.employeeUserId === employeeFilter));
  }, [allOrders, employeeFilter]);

  const summary = useMemo(() => summarizeFinance(filteredOrders, applied), [filteredOrders, applied]);

  const apply = (nextPreset = preset) => {
    setApplied(rangeForPreset(nextPreset, from, to));
    setPreset(nextPreset);
  };

  const cards = [
    { label: 'Faturado', value: formatBrl(summary.billed) },
    { label: 'Recebido', value: formatBrl(summary.received) },
    { label: 'A receber', value: formatBrl(summary.receivable) },
    { label: 'Custos (produtos)', value: formatBrl(summary.productsCost) },
    { label: 'Margem', value: formatBrl(summary.margin) },
    { label: 'Ticket médio', value: formatBrl(summary.ticketAverage) },
    { label: 'Mão de obra', value: formatBrl(summary.labor) },
    { label: 'Receita produtos', value: formatBrl(summary.productsRevenue) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Financeiro</h1>
        <p className="text-sm text-slate-600">Resumo financeiro dos atendimentos no período.</p>
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

      <Select id="fin-emp" label="Filtrar por responsável (serviços)" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
        <option value="all">Todos</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.name}</option>
        ))}
      </Select>

      <Alert tone="info">
        Produto fornecido pelo cliente não é contabilizado como venda nem como receita de produtos.
      </Alert>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-[#0B1E36]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceTable title="Por origem do produto" headers={['Origem', 'Qtd', 'Receita', 'Custo']} rows={summary.byOrigin.map((row) => [row.origin, String(row.quantity), formatBrl(row.revenue), formatBrl(row.cost)])} />
        <FinanceTable title="Por serviço" headers={['Serviço', 'Qtd', 'Mão de obra', 'Receita']} rows={summary.byService.map((row) => [row.label, String(row.count), formatBrl(row.labor), formatBrl(row.revenue)])} />
      </div>
    </div>
  );
};

const FinanceTable: React.FC<{ title: string; headers: string[]; rows: string[][] }> = ({ title, headers, rows }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="font-bold text-[#0B1E36]">{title}</h2>
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {headers.map((h) => <th key={h} className="p-2 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="p-3 text-slate-500">Sem dados no período.</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
