import React from 'react';
import { AppointmentStatus } from '../../types';

export function formatIsoDate(iso?: string): string {
  if (!iso) return '—';
  const [year, month, day] = iso.slice(0, 10).split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function formatKm(km?: number): string {
  if (km == null || Number.isNaN(km)) return '—';
  return `${km.toLocaleString('pt-BR')} km`;
}

export function daysUntilIso(iso?: string): number | null {
  if (!iso) return null;
  const due = new Date(`${iso.slice(0, 10)}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

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

export type PeriodKey = 'hoje' | '7d' | '30d' | 'mes' | 'mes-anterior' | 'custom';

export function periodRange(key: PeriodKey, customFrom?: string, customTo?: string): { from: Date; to: Date } {
  const now = new Date();
  const to = endOfDay(now);
  if (key === 'hoje') return { from: startOfDay(now), to };
  if (key === '7d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to };
  }
  if (key === '30d') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 29);
    return { from, to };
  }
  if (key === 'mes') {
    return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to };
  }
  if (key === 'mes-anterior') {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
    return { from, to: end };
  }
  const from = customFrom ? startOfDay(new Date(`${customFrom}T00:00:00`)) : startOfDay(now);
  const customEnd = customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : to;
  return { from, to: customEnd };
}

export function inPeriod(isoDate: string | undefined, from: Date, to: Date): boolean {
  if (!isoDate) return false;
  const value = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  return value >= from && value <= to;
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  requested: 'Solicitação recebida',
  confirmed: 'Confirmado',
  reschedule: 'Reagendar',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

export function returnSituation(status: string, dueDate?: string): string {
  if (status === 'done') return 'Realizado';
  if (status === 'cancelled') return 'Cancelado';
  const days = daysUntilIso(dueDate);
  if (days == null) return 'Pendente';
  if (days < 0) return 'Atrasado';
  if (days <= 45) return 'Próximo';
  return 'Pendente';
}

export const CommunicationNotice: React.FC = () => (
  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 space-y-1">
    <p className="font-extrabold text-[#0B1E36]">O VEBOOK registra. A oficina se comunica.</p>
    <p>
      Nesta fase o VEBOOK não envia WhatsApp, SMS, e-mail nem lembretes ao cliente. Os dados de contato ficam no painel para a oficina consultar e usar pelos seus próprios meios.
    </p>
  </div>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="space-y-1">
    <h2 className="text-xl font-extrabold text-[#0B1E36]">{title}</h2>
    {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
  </div>
);
