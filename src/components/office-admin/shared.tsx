import React from 'react';
import { PERIOD_OPTIONS, PeriodPreset } from '../../office/period';
import { Button } from '../ui/Button';

export const DemoBanner: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
    {children ?? 'Demonstração — dados locais, sem autenticação real nem banco de dados.'}
  </p>
);

export const PeriodFilter: React.FC<{
  preset: PeriodPreset;
  from: string;
  to: string;
  onPreset: (preset: PeriodPreset) => void;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onApply: () => void;
}> = ({ preset, from, to, onPreset, onFrom, onTo, onApply }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-end">
    <div className="flex flex-wrap gap-1.5">
      {PERIOD_OPTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPreset(item.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            preset === item.id ? 'bg-[#0B1E36] text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
    {preset === 'custom' && (
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          Data inicial
          <input type="date" value={from} onChange={(e) => onFrom(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-2 py-1.5" />
        </label>
        <label className="text-sm">
          Data final
          <input type="date" value={to} onChange={(e) => onTo(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-2 py-1.5" />
        </label>
        <Button size="sm" onClick={onApply}>Aplicar filtro</Button>
      </div>
    )}
  </div>
);

export const BarChart: React.FC<{ title: string; items: Array<{ label: string; value: number }> }> = ({ title, items }) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-bold text-[#0B1E36]">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#0B1E36]" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
