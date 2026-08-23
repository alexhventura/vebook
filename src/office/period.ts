export type PeriodPreset = 'today' | '7d' | '30d' | 'month' | 'year' | 'all' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  preset: PeriodPreset;
}

export const PERIOD_OPTIONS: Array<{ id: PeriodPreset; label: string }> = [
  { id: 'today', label: 'Hoje' },
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: 'month', label: 'Este mês' },
  { id: 'year', label: 'Este ano' },
  { id: 'all', label: 'Todo o período' },
  { id: 'custom', label: 'Personalizado' },
];

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function rangeForPreset(preset: PeriodPreset, customFrom?: string, customTo?: string, now = new Date()): DateRange {
  const today = startOfDay(now);
  if (preset === 'today') return { preset, from: today, to: endOfDay(now) };
  if (preset === '7d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { preset, from, to: endOfDay(now) };
  }
  if (preset === '30d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 29);
    return { preset, from, to: endOfDay(now) };
  }
  if (preset === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { preset, from, to: endOfDay(now) };
  }
  if (preset === 'year') {
    const from = new Date(now.getFullYear(), 0, 1);
    return { preset, from, to: endOfDay(now) };
  }
  if (preset === 'custom' && customFrom && customTo) {
    return { preset, from: startOfDay(new Date(`${customFrom}T00:00:00`)), to: endOfDay(new Date(`${customTo}T00:00:00`)) };
  }
  return { preset: 'all', from: new Date(2000, 0, 1), to: endOfDay(now) };
}

export function inRange(iso: string, range: DateRange): boolean {
  const time = new Date(iso).getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
