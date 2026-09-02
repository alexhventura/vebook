import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  listAppointments,
  listCustomers,
  listReturns,
  listServiceCatalog,
  listVehicles,
  updateAppointment,
  upsertReturn,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { AppointmentStatus } from '../../types';
import { formatPhone } from '../../lib/phone';
import { Field, inputClass } from '../ui/Field';
import { AutocompleteField } from './AutocompleteField';
import { APPOINTMENT_STATUS_LABEL, SectionTitle, formatIsoDate, formatKm, returnSituation } from './shared';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const APPOINTMENT_ACTIONS: AppointmentStatus[] = ['requested', 'confirmed', 'reschedule', 'cancelled', 'completed'];

type DayEntry =
  | { kind: 'appointment'; id: string; data: ReturnType<typeof listAppointments>[number] }
  | { kind: 'return'; id: string; data: ReturnType<typeof listReturns>[number] };

function isoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthCells(viewMonth: Date): Array<{ iso: string; inMonth: boolean; date: Date }> {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const leading = mondayIndex(first);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean; date: Date }> = [];

  for (let i = leading; i > 0; i -= 1) {
    const date = new Date(year, month, 1 - i);
    cells.push({ iso: isoDay(date), inMonth: false, date });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ iso: isoDay(date), inMonth: true, date });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]?.date ?? new Date(year, month, daysInMonth);
    const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push({ iso: isoDay(date), inMonth: false, date });
  }
  return cells;
}

function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type AgendaTab = 'agendamentos' | 'retornos';

export const AgendaSection: React.FC<{ officeId: string; initialTab?: AgendaTab }> = ({
  officeId,
  initialTab = 'agendamentos',
}) => {
  useOfficeStore();
  const appointments = listAppointments(officeId);
  const returns = listReturns(officeId);
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [nextMileageKm, setNextMileageKm] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const serviceCatalog = listServiceCatalog(officeId);
  const customerById = useMemo(() => Object.fromEntries(customers.map((row) => [row.id, row])), [customers]);
  const vehicleById = useMemo(() => Object.fromEntries(vehicles.map((row) => [row.id, row])), [vehicles]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        label: customer.name,
        description: customer.phone || undefined,
      })),
    [customers],
  );

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plate,
        description: [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || undefined,
        keywords: `${vehicle.plate} ${vehicle.brand || ''} ${vehicle.model || ''}`,
      })),
    [vehicles],
  );

  const serviceOptions = useMemo(() => {
    const fromCatalog = serviceCatalog.map((item) => ({
      id: item.id,
      label: item.name,
      description: item.category || 'Catálogo',
    }));
    const fromReturns = returns
      .map((row) => row.serviceTitle || row.reason)
      .filter(Boolean)
      .map((title, index) => ({ id: `ret-svc-${index}-${title}`, label: title as string }));
    const seen = new Set<string>();
    return [...fromCatalog, ...fromReturns].filter((option) => {
      const key = option.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [serviceCatalog, returns]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();

    const push = (iso: string | undefined, entry: DayEntry) => {
      if (!iso) return;
      const key = iso.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    };

    appointments.forEach((row) => {
      if (row.status === 'cancelled') return;
      push(row.date, { kind: 'appointment', id: row.id, data: row });
    });

    returns.forEach((row) => {
      if (row.status === 'cancelled') return;
      push(row.dueDate, { kind: 'return', id: row.id, data: row });
    });

    return map;
  }, [appointments, returns]);

  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const todayIso = isoDay(new Date());

  const selectedEntries = selectedDay ? entriesByDay.get(selectedDay) ?? [] : [];

  useEffect(() => {
    if (initialTab !== 'retornos') return;
    const firstReturn = returns
      .filter((row) => row.dueDate && row.status === 'scheduled')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
    if (!firstReturn?.dueDate) return;
    const iso = firstReturn.dueDate.slice(0, 10);
    setViewMonth(startOfMonth(new Date(`${iso}T12:00:00`)));
    setSelectedDay(iso);
  }, [initialTab, returns]);

  const resetReturnForm = () => {
    setCustomerId('');
    setVehicleId('');
    setCustomerQuery('');
    setVehicleQuery('');
    setServiceTitle('');
    setNextMileageKm('');
    setDueDate('');
    setNotes('');
  };

  return (
    <section className="space-y-4">
      <SectionTitle title="Agenda" subtitle="Calendário mensal com agendamentos e retornos da oficina." />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewMonth((current) => addMonths(current, -1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[#0B1E36] cursor-pointer hover:bg-slate-50"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Anterior
          </button>

          <div className="text-center">
            <p className="text-lg font-extrabold text-[#0B1E36]">
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewMonth(startOfMonth(today));
                setSelectedDay(isoDay(today));
              }}
              className="text-xs font-bold text-sky-800 cursor-pointer hover:underline"
            >
              Ir para hoje
            </button>
          </div>

          <button
            type="button"
            onClick={() => setViewMonth((current) => addMonths(current, 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[#0B1E36] cursor-pointer hover:bg-slate-50"
            aria-label="Próximo mês"
          >
            Próximo
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {WEEKDAYS.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthCells.map((cell) => {
            const dayEntries = entriesByDay.get(cell.iso) ?? [];
            const appointmentCount = dayEntries.filter((entry) => entry.kind === 'appointment').length;
            const returnCount = dayEntries.filter((entry) => entry.kind === 'return').length;
            const isToday = cell.iso === todayIso;
            const isSelected = cell.iso === selectedDay;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedDay(cell.iso)}
                className={`min-h-[5.5rem] rounded-xl border p-2 text-left transition-colors cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-[#0B1E36] bg-[#0B1E36]/5 ring-1 ring-[#0B1E36]/20'
                    : isToday
                      ? 'border-[#c4a35a] bg-[#c4a35a]/10'
                      : cell.inMonth
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        : 'border-slate-100 bg-slate-50/80 text-slate-400'
                }`}
              >
                <span
                  className={`text-sm font-extrabold ${
                    cell.inMonth ? 'text-[#0B1E36]' : 'text-slate-400'
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                <div className="mt-auto space-y-1">
                  {appointmentCount > 0 ? (
                    <span className="block rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-900 leading-tight">
                      {appointmentCount} agend.
                    </span>
                  ) : null}
                  {returnCount > 0 ? (
                    <span className="block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 leading-tight">
                      {returnCount} retorno{returnCount > 1 ? 's' : ''}
                    </span>
                  ) : null}
                  {appointmentCount === 0 && returnCount === 0 && cell.inMonth ? (
                    <span className="block text-[10px] text-slate-400">Livre</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-200 border border-sky-300" />
            Agendamentos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-200 border border-amber-300" />
            Retornos
          </span>
        </div>
      </div>

      {selectedDay ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#a8863f]">Dia selecionado</p>
              <h3 className="text-lg font-extrabold text-[#0B1E36] capitalize">{formatLongDate(selectedDay)}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-xs font-bold text-slate-600 cursor-pointer hover:text-[#0B1E36]"
            >
              Fechar
            </button>
          </div>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum agendamento ou retorno marcado para este dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedEntries.map((entry) => {
                if (entry.kind === 'appointment') {
                  const row = entry.data;
                  return (
                    <article key={entry.id} className="rounded-xl border border-slate-200 p-4 text-sm space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Agendamento</p>
                          <p className="font-bold text-[#0B1E36]">{row.customerName}</p>
                          <p className="text-slate-600">{row.service || 'Serviço não informado'}</p>
                          <p className="text-slate-500">
                            {row.time ? `${row.time}` : row.period ? row.period : 'Horário não informado'}
                            {row.plate ? ` · ${row.plate}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">Contato: {formatPhone(row.phone)}</p>
                          {row.notes ? <p className="text-xs text-slate-500">{row.notes}</p> : null}
                        </div>
                        <span className="text-xs font-bold">{APPOINTMENT_STATUS_LABEL[row.status]}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {APPOINTMENT_ACTIONS.filter((status) => status !== row.status).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateAppointment(officeId, row.id, { status })}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold cursor-pointer hover:bg-slate-200"
                          >
                            {APPOINTMENT_STATUS_LABEL[status]}
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                }

                const row = entry.data;
                const customer = row.customerId ? customerById[row.customerId] : undefined;
                const vehicle = row.vehicleId ? vehicleById[row.vehicleId] : undefined;
                return (
                  <article key={entry.id} className="rounded-xl border border-slate-200 p-4 text-sm space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Retorno</p>
                        <p className="font-bold text-[#0B1E36]">{customer?.name || 'Cliente não vinculado'}</p>
                        <p className="text-slate-600">Veículo: {vehicle?.plate || 'não informado'}</p>
                        <p className="text-slate-600">Serviço: {row.serviceTitle || row.reason}</p>
                        {row.nextMileageKm != null ? (
                          <p className="text-slate-600">KM prevista: {formatKm(row.nextMileageKm)}</p>
                        ) : null}
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {returnSituation(row.status, row.dueDate)}
                        </p>
                      </div>
                      {row.status === 'scheduled' ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => upsertReturn(officeId, { ...row, status: 'done' })}
                            className="text-xs font-bold text-sky-800 cursor-pointer hover:underline"
                          >
                            Marcar realizado
                          </button>
                          <button
                            type="button"
                            onClick={() => upsertReturn(officeId, { ...row, status: 'cancelled' })}
                            className="text-xs font-bold text-rose-700 cursor-pointer hover:underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800">
                          {row.status === 'done' ? 'Realizado' : 'Encerrado'}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowReturnForm((value) => !value)}
          className="text-sm font-bold text-[#0B1E36] cursor-pointer hover:text-sky-800"
        >
          {showReturnForm ? '− Ocultar formulário de retorno' : '+ Registrar retorno manual'}
        </button>

        {showReturnForm ? (
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
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
              resetReturnForm();
              if (dueDate) {
                setViewMonth(startOfMonth(new Date(`${dueDate}T12:00:00`)));
                setSelectedDay(dueDate.slice(0, 10));
              }
            }}
          >
            <Field label="Cliente">
              <AutocompleteField
                value={customerQuery}
                options={customerOptions}
                placeholder="Digite o nome do cliente"
                onChange={(next) => {
                  setCustomerQuery(next);
                  if (!next.trim()) setCustomerId('');
                }}
                onSelect={(option) => {
                  setCustomerId(option.id);
                  setCustomerQuery(option.label);
                }}
              />
            </Field>
            <Field label="Veículo">
              <AutocompleteField
                value={vehicleQuery}
                options={vehicleOptions}
                placeholder="Digite a placa"
                inputClassName="uppercase"
                onChange={(next) => {
                  setVehicleQuery(next);
                  if (!next.trim()) setVehicleId('');
                }}
                onSelect={(option) => {
                  setVehicleId(option.id);
                  setVehicleQuery(option.label);
                  const vehicle = vehicles.find((row) => row.id === option.id);
                  if (vehicle?.customerId) {
                    const customer = customers.find((row) => row.id === vehicle.customerId);
                    if (customer) {
                      setCustomerId(customer.id);
                      setCustomerQuery(customer.name);
                    }
                  }
                }}
              />
            </Field>
            <Field label="Serviço">
              <AutocompleteField
                value={serviceTitle}
                options={serviceOptions}
                onChange={setServiceTitle}
                placeholder="Ex.: Troca de óleo"
              />
            </Field>
            <Field label="Quilometragem prevista" optional>
              <input
                className={inputClass}
                type="number"
                value={nextMileageKm}
                onChange={(e) => setNextMileageKm(e.target.value)}
              />
            </Field>
            <Field label="Data prevista" optional>
              <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <Field label="Observação" optional>
              <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            <button
              type="submit"
              className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer"
            >
              Registrar retorno
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
};
