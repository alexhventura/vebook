import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  officeAppointments,
  officeCertificates,
  officeClients,
  officeReturns,
  officeServices,
  officeVehicles,
  upsertAppointment,
  upsertReturn,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { AppointmentStatus } from '../../office/types';
import { DateRange, formatDate, inRange, rangeForPreset, PeriodPreset } from '../../office/period';
import { PeriodFilter } from './shared';

type Ctx = { officeId: string };

export const AppointmentsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [view, setView] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [open, setOpen] = useState(false);
  const items = officeAppointments(officeId).slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId);
  const reference = new Date();

  const visible = items.filter((item) => {
    const date = new Date(item.startsAt);
    if (view === 'dia') {
      return date.toDateString() === reference.toDateString();
    }
    if (view === 'semana') {
      const start = new Date(reference);
      start.setDate(reference.getDate() - reference.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    }
    return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof visible>();
    visible.forEach((item) => {
      const key = new Date(item.startsAt).toLocaleDateString('pt-BR');
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [visible]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0B1E36]">Agendamentos</h1>
        <div className="flex gap-2">
          {(['dia', 'semana', 'mes'] as const).map((id) => (
            <button key={id} type="button" onClick={() => setView(id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${view === id ? 'bg-[#0B1E36] text-white' : 'bg-slate-100'}`}>
              {id}
            </button>
          ))}
          <Button onClick={() => setOpen(true)}>Novo agendamento</Button>
        </div>
      </div>
      <div className="space-y-4">
        {grouped.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Nenhum agendamento nesta visão.</p>
        )}
        {grouped.map(([day, rows]) => (
          <section key={day} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-bold text-[#0B1E36]">{day}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {rows.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
                  <span>{new Date(item.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {clients.find((c) => c.id === item.clientId)?.name} · {vehicles.find((v) => v.id === item.vehicleId)?.plate} · {services.find((s) => s.id === item.serviceId)?.name}</span>
                  <StatusPill status={item.status} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {open && <AppointmentForm officeId={officeId} onClose={() => setOpen(false)} />}
    </div>
  );
};

const AppointmentForm: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId).filter((s) => s.active);
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [vehicleId, setVehicleId] = useState(vehicles.find((v) => v.clientId === clients[0]?.id)?.id ?? '');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [date, setDate] = useState('2026-08-24');
  const [time, setTime] = useState('09:00');
  const [status, setStatus] = useState<AppointmentStatus>('agendado');
  const [notes, setNotes] = useState('');
  return (
    <Modal isOpen onClose={onClose} title="Novo agendamento" footer={
      <Button onClick={() => {
        upsertAppointment(officeId, {
          clientId,
          vehicleId,
          serviceId,
          startsAt: new Date(`${date}T${time}:00`).toISOString(),
          status,
          notes,
        });
        onClose();
      }}>Salvar</Button>
    }>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select id="a-cli" label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="a-veh" label="Veículo" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.filter((v) => v.clientId === clientId).map((item) => <option key={item.id} value={item.id}>{item.plate}</option>)}
        </Select>
        <Select id="a-svc" label="Serviço" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="a-date" type="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input id="a-time" type="time" label="Horário" value={time} onChange={(e) => setTime(e.target.value)} />
        <Select id="a-st" label="Status" value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="em_atendimento">Em atendimento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
          <option value="nao_compareceu">Não compareceu</option>
        </Select>
        <div className="sm:col-span-2">
          <Input id="a-notes" label="Observação" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

function StatusPill({ status }: { status: string }) {
  const tone = status.includes('cancel') || status === 'nao_compareceu' ? 'danger' : status.includes('conclu') ? 'success' : 'info';
  return <Badge tone={tone}>{status.replace('_', ' ')}</Badge>;
}

export const ReturnsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PeriodPreset>('all');
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-23');
  const [applied, setApplied] = useState<DateRange>(() => rangeForPreset('all'));
  const now = new Date();
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId);
  const items = officeReturns(officeId).filter((item) => inRange(item.dueDate, applied));

  const bucket = (due: string) => {
    const d = new Date(due);
    const diff = (d.getTime() - now.getTime()) / 86400000;
    if (diff < 0) return 'Atrasado';
    if (diff <= 15) return 'Próximo';
    return 'Futuro';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0B1E36]">Retornos</h1>
        <Button onClick={() => setOpen(true)}>Novo retorno</Button>
      </div>
      <PeriodFilter
        preset={preset}
        from={from}
        to={to}
        onPreset={(next) => { setPreset(next); setApplied(rangeForPreset(next, from, to)); }}
        onFrom={setFrom}
        onTo={setTo}
        onApply={() => { setPreset('custom'); setApplied(rangeForPreset('custom', from, to)); }}
      />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50"><tr>{['Cliente', 'Veículo', 'Serviço', 'Último serviço', 'Próximo retorno', 'Situação'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-3">{clients.find((c) => c.id === item.clientId)?.name}</td>
                <td className="p-3">{vehicles.find((v) => v.id === item.vehicleId)?.plate}</td>
                <td className="p-3">{services.find((s) => s.id === item.serviceId)?.name}</td>
                <td className="p-3">{formatDate(item.lastServiceDate)}</td>
                <td className="p-3">{formatDate(item.dueDate)}</td>
                <td className="p-3">{bucket(item.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <ReturnForm officeId={officeId} onClose={() => setOpen(false)} />}
    </div>
  );
};

const ReturnForm: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId);
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [last, setLast] = useState('2026-08-15');
  const [due, setDue] = useState('2027-02-15');
  return (
    <Modal isOpen onClose={onClose} title="Novo retorno" footer={
      <Button onClick={() => {
        upsertReturn(officeId, {
          clientId,
          vehicleId,
          serviceId,
          lastServiceDate: new Date(`${last}T12:00:00`).toISOString(),
          dueDate: new Date(`${due}T12:00:00`).toISOString(),
        });
        onClose();
      }}>Salvar</Button>
    }>
      <div className="grid gap-3">
        <Select id="r-cli" label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="r-veh" label="Veículo" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.map((item) => <option key={item.id} value={item.id}>{item.plate} · {item.model}</option>)}
        </Select>
        <Select id="r-svc" label="Serviço" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="r-last" type="date" label="Data do serviço" value={last} onChange={(e) => setLast(e.target.value)} />
        <Input id="r-due" type="date" label="Próximo retorno" value={due} onChange={(e) => setDue(e.target.value)} />
      </div>
    </Modal>
  );
};

export const CertificatesModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const vehicles = officeVehicles(officeId);
  const items = officeCertificates(officeId);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0B1E36]">Certidões</h1>
      <p className="text-sm text-slate-600">Interface de consulta. A emissão de PDF real fica para o backend.</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50"><tr>{['Código', 'Veículo', 'Data', 'Solicitante', 'Status'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const vehicle = vehicles.find((v) => v.id === item.vehicleId);
              return (
                <tr key={item.id}>
                  <td className="p-3 font-mono">{item.code}</td>
                  <td className="p-3">{vehicle?.plate}</td>
                  <td className="p-3">{formatDate(item.issuedAt)}</td>
                  <td className="p-3">{item.requesterName}</td>
                  <td className="p-3">{item.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
