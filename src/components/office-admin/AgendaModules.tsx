import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  officeAppointments,
  officeClients,
  officeReturns,
  officeServices,
  officeUsers,
  officeVehicles,
  upsertAppointment,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { AppointmentStatus, RETURN_REASON_LABELS } from '../../office/types';

type Ctx = { officeId: string };

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_atendimento: 'Em atendimento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  nao_compareceu: 'Não compareceu',
};

function statusTone(status: AppointmentStatus) {
  if (status === 'cancelado' || status === 'nao_compareceu') return 'danger' as const;
  if (status === 'concluido') return 'success' as const;
  return 'info' as const;
}

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date | null; key: string }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ date: null, key: `pad-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), key: `day-${d}` });
  }
  return cells;
}

export const AppointmentsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const appointments = officeAppointments(officeId);
  const returns = officeReturns(officeId);
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthGrid(year, month), [year, month]);

  const countByDay = useMemo(() => {
    const map = new Map<string, { appointments: number; returns: number }>();
    appointments.forEach((a) => {
      const key = new Date(a.startsAt).toDateString();
      const current = map.get(key) ?? { appointments: 0, returns: 0 };
      current.appointments += 1;
      map.set(key, current);
    });
    returns.forEach((r) => {
      const key = new Date(r.dueDate).toDateString();
      const current = map.get(key) ?? { appointments: 0, returns: 0 };
      current.returns += 1;
      map.set(key, current);
    });
    return map;
  }, [appointments, returns]);

  const dayAppointments = selectedDay
    ? appointments
        .filter((a) => new Date(a.startsAt).toDateString() === selectedDay.toDateString())
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    : [];

  const dayReturns = selectedDay
    ? returns.filter((r) => new Date(r.dueDate).toDateString() === selectedDay.toDateString())
    : [];

  const monthLabel = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0B1E36]">Agenda</h1>
        <Button onClick={() => setOpen(true)}>+ Agendar</Button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="text-sm font-semibold text-[#0B1E36]" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            ← Anterior
          </button>
          <h2 className="font-bold capitalize text-[#0B1E36]">{monthLabel}</h2>
          <button type="button" className="text-sm font-semibold text-[#0B1E36]" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            Próximo →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            if (!cell.date) return <div key={cell.key} className="min-h-16" />;
            const key = cell.date.toDateString();
            const counts = countByDay.get(key);
            const isSelected = selectedDay?.toDateString() === key;
            const isToday = new Date().toDateString() === key;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelectedDay(cell.date)}
                className={`min-h-16 rounded-lg border p-1 text-left text-sm ${
                  isSelected ? 'border-[#0B1E36] bg-slate-50' : 'border-slate-100 hover:border-slate-300'
                } ${isToday ? 'ring-1 ring-[#0B1E36]' : ''}`}
              >
                <span className="font-semibold">{cell.date.getDate()}</span>
                {counts && (
                  <div className="mt-1 space-y-0.5 text-[10px]">
                    {counts.appointments > 0 && <span className="block rounded bg-sky-100 px-1 text-sky-900">{counts.appointments} ag.</span>}
                    {counts.returns > 0 && <span className="block rounded bg-amber-100 px-1 text-amber-900">{counts.returns} ret.</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selectedDay && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-[#0B1E36]">
            {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <div className="mt-4 space-y-2">
            {HOURS.map((hour) => {
              const slotStart = new Date(selectedDay);
              slotStart.setHours(hour, 0, 0, 0);
              const slotEnd = new Date(selectedDay);
              slotEnd.setHours(hour + 1, 0, 0, 0);
              const inSlot = dayAppointments.filter((a) => {
                const t = new Date(a.startsAt);
                return t >= slotStart && t < slotEnd;
              });
              return (
                <div key={hour} className="flex gap-3 border-b border-slate-100 py-2 text-sm">
                  <span className="w-14 shrink-0 font-mono text-slate-500">{String(hour).padStart(2, '0')}:00</span>
                  <div className="flex-1">
                    {inSlot.length === 0 ? (
                      <span className="text-slate-400">disponível</span>
                    ) : (
                      inSlot.map((item) => {
                        const client = clients.find((c) => c.id === item.clientId);
                        const vehicle = vehicles.find((v) => v.id === item.vehicleId);
                        return (
                          <div key={item.id} className="mb-1 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-2">
                            <span>
                              {new Date(item.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              {' · '}
                              {client?.name} · {vehicle?.plate} · {item.serviceLabel ?? 'Serviço'}
                            </span>
                            <StatusPill status={item.status} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {dayReturns.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-[#0B1E36]">Retornos previstos neste dia</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {dayReturns.map((item) => {
                  const client = clients.find((c) => c.id === item.clientId);
                  const vehicle = vehicles.find((v) => v.id === item.vehicleId);
                  return (
                    <li key={item.id} className="rounded-lg bg-amber-50 p-2">
                      {client?.name} · {vehicle?.plate} · {item.serviceLabel}
                      {item.reason && ` · ${RETURN_REASON_LABELS[item.reason]}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {open && <AppointmentForm officeId={officeId} defaultDate={selectedDay ?? new Date()} onClose={() => setOpen(false)} />}
    </div>
  );
};

const AppointmentForm: React.FC<{ officeId: string; defaultDate: Date; onClose: () => void }> = ({ officeId, defaultDate, onClose }) => {
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId).filter((s) => s.active);
  const employees = officeUsers(officeId).filter((u) => u.active);
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [vehicleId, setVehicleId] = useState(vehicles.find((v) => v.clientId === clients[0]?.id)?.id ?? '');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [serviceLabel, setServiceLabel] = useState(services[0]?.name ?? '');
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [employeeUserId, setEmployeeUserId] = useState(employees[0]?.id ?? '');
  const [status, setStatus] = useState<AppointmentStatus>('agendado');
  const [notes, setNotes] = useState('');

  return (
    <Modal isOpen onClose={onClose} title="Agendar" footer={
      <Button onClick={() => {
        upsertAppointment(officeId, {
          clientId,
          vehicleId,
          serviceId: serviceId || undefined,
          serviceLabel: serviceLabel || services.find((s) => s.id === serviceId)?.name,
          employeeUserId: employeeUserId || undefined,
          startsAt: new Date(`${date}T${time}:00`).toISOString(),
          status,
          notes: notes || undefined,
        });
        onClose();
      }}>Salvar</Button>
    }>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select id="a-cli" label="Cliente" value={clientId} onChange={(e) => {
          setClientId(e.target.value);
          const next = vehicles.find((v) => v.clientId === e.target.value);
          if (next) setVehicleId(next.id);
        }}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="a-veh" label="Veículo" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.filter((v) => v.clientId === clientId).map((item) => <option key={item.id} value={item.id}>{item.plate}</option>)}
        </Select>
        <Select id="a-svc" label="Serviço (catálogo)" value={serviceId} onChange={(e) => {
          setServiceId(e.target.value);
          const svc = services.find((s) => s.id === e.target.value);
          if (svc) setServiceLabel(svc.name);
        }}>
          <option value="">Personalizado</option>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="a-label" label="Descrição do serviço" value={serviceLabel} onChange={(e) => setServiceLabel(e.target.value)} />
        <Input id="a-date" type="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input id="a-time" type="time" label="Horário" value={time} onChange={(e) => setTime(e.target.value)} />
        <Select id="a-emp" label="Responsável" value={employeeUserId} onChange={(e) => setEmployeeUserId(e.target.value)}>
          <option value="">—</option>
          {employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="a-st" label="Status" value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Input id="a-notes" label="Observação" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

function StatusPill({ status }: { status: AppointmentStatus }) {
  return <Badge tone={statusTone(status)}>{APPOINTMENT_STATUS_LABELS[status]}</Badge>;
}
