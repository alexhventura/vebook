import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import {
  officeClients,
  officeReturns,
  officeServices,
  officeVehicles,
  officeWorkOrders,
  upsertClient,
  upsertService,
  upsertVehicle,
  upsertWorkOrder,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatBrl, formatDate } from '../../office/period';
import { formatCpf, formatPhone } from '../../office/validation';
import { formatPlate } from '../../lib/utils';
import { WorkOrderStatus } from '../../office/types';

type Ctx = { officeId: string };

export const WorkOrdersModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [query, setQuery] = useState({ plate: '', status: 'all', service: 'all', client: 'all', vehicle: 'all', from: '', to: '' });
  const [open, setOpen] = useState(false);
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId);
  const rows = officeWorkOrders(officeId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((item) => {
      const vehicle = vehicles.find((v) => v.id === item.vehicleId);
      if (query.plate && !vehicle?.plate.includes(query.plate.toUpperCase())) return false;
      if (query.status !== 'all' && item.status !== query.status) return false;
      if (query.service !== 'all' && item.serviceId !== query.service) return false;
      if (query.client !== 'all' && item.clientId !== query.client) return false;
      if (query.vehicle !== 'all' && item.vehicleId !== query.vehicle) return false;
      if (query.from && item.date < `${query.from}T00:00:00`) return false;
      if (query.to && item.date > `${query.to}T23:59:59`) return false;
      return true;
    });

  return (
    <ModuleFrame
      title="Atendimentos"
      action={<Button onClick={() => setOpen(true)}>Novo atendimento</Button>}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Input id="os-from" type="date" label="Período inicial" value={query.from} onChange={(e) => setQuery({ ...query, from: e.target.value })} />
        <Input id="os-to" type="date" label="Período final" value={query.to} onChange={(e) => setQuery({ ...query, to: e.target.value })} />
        <Select id="os-cli" label="Cliente" value={query.client} onChange={(e) => setQuery({ ...query, client: e.target.value })}>
          <option value="all">Todos</option>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="os-veh" label="Veículo" value={query.vehicle} onChange={(e) => setQuery({ ...query, vehicle: e.target.value })}>
          <option value="all">Todos</option>
          {vehicles.map((item) => <option key={item.id} value={item.id}>{item.plate}</option>)}
        </Select>
        <Input id="os-plate" label="Placa" value={query.plate} onChange={(e) => setQuery({ ...query, plate: formatPlate(e.target.value) })} />
        <Select id="os-status" label="Status" value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value })}>
          <option value="all">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </Select>
        <Select id="os-svc" label="Serviço" value={query.service} onChange={(e) => setQuery({ ...query, service: e.target.value })}>
          <option value="all">Todos</option>
          {services.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </Select>
      </div>
      <Table
        headers={['Data', 'Cliente', 'Veículo', 'Placa', 'Serviço', 'km', 'Valor', 'Status']}
        rows={rows.map((item) => {
          const vehicle = vehicles.find((v) => v.id === item.vehicleId);
          const client = clients.find((c) => c.id === item.clientId);
          const service = services.find((s) => s.id === item.serviceId);
          return [
            formatDate(item.date),
            client?.name ?? '—',
            vehicle ? `${vehicle.brand} ${vehicle.model}` : '—',
            vehicle?.plate ?? '—',
            service?.name ?? '—',
            item.mileageKm.toLocaleString('pt-BR'),
            formatBrl(item.amount),
            item.status,
          ];
        })}
      />
      {open && (
        <WorkOrderForm
          officeId={officeId}
          onClose={() => setOpen(false)}
        />
      )}
    </ModuleFrame>
  );
};

const WorkOrderForm: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const services = officeServices(officeId).filter((item) => item.active);
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const clientVehicles = vehicles.filter((item) => item.clientId === clientId);
  const [vehicleId, setVehicleId] = useState(clientVehicles[0]?.id ?? '');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [date, setDate] = useState('2026-08-23');
  const [km, setKm] = useState(String(clientVehicles[0]?.currentMileageKm ?? 0));
  const [amount, setAmount] = useState(String(services[0]?.price ?? 0));
  const [status, setStatus] = useState<WorkOrderStatus>('aberto');

  return (
    <Modal isOpen onClose={onClose} title="Novo atendimento" footer={
      <Button onClick={() => {
        upsertWorkOrder(officeId, {
          date: new Date(`${date}T12:00:00`).toISOString(),
          clientId,
          vehicleId,
          serviceId,
          mileageKm: Number(km),
          amount: Number(amount),
          status,
        });
        onClose();
      }}>Salvar</Button>
    }>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select id="wo-cli" label="Cliente" value={clientId} onChange={(e) => { setClientId(e.target.value); const next = vehicles.find((v) => v.clientId === e.target.value); if (next) setVehicleId(next.id); }}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select id="wo-veh" label="Veículo" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {clientVehicles.map((item) => <option key={item.id} value={item.id}>{item.plate} · {item.model}</option>)}
        </Select>
        <Select id="wo-svc" label="Serviço" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="wo-date" type="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input id="wo-km" label="Quilometragem" value={km} onChange={(e) => setKm(e.target.value)} />
        <Input id="wo-val" label="Valor" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select id="wo-st" label="Status" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </Select>
      </div>
    </Modal>
  );
};

export const ClientsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const vehicles = officeVehicles(officeId);
  const orders = officeWorkOrders(officeId);
  const returns = officeReturns(officeId);
  const rows = officeClients(officeId).filter((item) => {
    const plate = vehicles.filter((v) => v.clientId === item.id).map((v) => v.plate).join(' ');
    const blob = `${item.name} ${item.cpf} ${item.phone} ${plate}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <ModuleFrame title="Clientes" action={<Button onClick={() => setOpen(true)}>Novo cliente</Button>}>
      <Input id="cli-q" label="Pesquisar por nome, CPF, telefone ou placa" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4">
        <Table
          headers={['Nome', 'CPF', 'Telefone', 'Veículos', 'Último atendimento', 'Próximo retorno', 'Atendimentos']}
          rows={rows.map((item) => {
            const last = orders.filter((o) => o.clientId === item.id).sort((a, b) => b.date.localeCompare(a.date))[0];
            const next = returns.filter((r) => r.clientId === item.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
            return [
              item.name,
              item.cpf,
              item.phone,
              vehicles.filter((v) => v.clientId === item.id).map((v) => v.plate).join(', ') || '—',
              last ? formatDate(last.date) : '—',
              next ? formatDate(next.dueDate) : '—',
              String(orders.filter((o) => o.clientId === item.id).length),
            ];
          })}
        />
      </div>
      {open && (
        <ClientForm officeId={officeId} onClose={() => setOpen(false)} />
      )}
    </ModuleFrame>
  );
};

const ClientForm: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <Modal isOpen onClose={onClose} title="Novo cliente" footer={
      <Button onClick={() => { upsertClient(officeId, { name, cpf, phone, whatsapp: phone, email, notes }); onClose(); }}>Salvar</Button>
    }>
      <div className="grid gap-3">
        <Input id="c-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="c-cpf" label="CPF" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} required />
        <Input id="c-phone" label="Telefone / WhatsApp" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} required />
        <Input id="c-email" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input id="c-notes" label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
};

export const VehiclesModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [open, setOpen] = useState(false);
  const clients = officeClients(officeId);
  const orders = officeWorkOrders(officeId);
  const rows = officeVehicles(officeId);

  return (
    <ModuleFrame title="Veículos" action={<Button onClick={() => setOpen(true)}>Novo veículo</Button>}>
      <p className="mb-4 text-sm text-slate-600">O veículo é uma entidade própria. A oficina registra manutenções sobre ele, sem duplicar o cadastro a cada atendimento.</p>
      <Table
        headers={['Placa', 'Marca', 'Modelo', 'Ano', 'Cliente', 'km', 'Atendimentos']}
        rows={rows.map((item) => [
          item.plate,
          item.brand,
          item.model,
          String(item.year),
          clients.find((c) => c.id === item.clientId)?.name ?? '—',
          item.currentMileageKm.toLocaleString('pt-BR'),
          String(orders.filter((o) => o.vehicleId === item.id).length),
        ])}
      />
      {open && <VehicleForm officeId={officeId} onClose={() => setOpen(false)} />}
    </ModuleFrame>
  );
};

const VehicleForm: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const clients = officeClients(officeId);
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [km, setKm] = useState('0');
  return (
    <Modal isOpen onClose={onClose} title="Novo veículo" footer={
      <Button onClick={() => { upsertVehicle(officeId, { plate, brand, model, year: Number(year), clientId, currentMileageKm: Number(km) }); onClose(); }}>Salvar</Button>
    }>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="v-plate" label="Placa" value={plate} onChange={(e) => setPlate(formatPlate(e.target.value))} />
        <Input id="v-brand" label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <Input id="v-model" label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} />
        <Input id="v-year" label="Ano" value={year} onChange={(e) => setYear(e.target.value)} />
        <Select id="v-cli" label="Proprietário / cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="v-km" label="Quilometragem atual" value={km} onChange={(e) => setKm(e.target.value)} />
      </div>
    </Modal>
  );
};

export const ServicesModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const rows = officeServices(officeId);

  return (
    <ModuleFrame title="Serviços" action={<Button onClick={() => setOpen(true)}>Novo serviço</Button>}>
      <Table
        headers={['Serviço', 'Preço', 'Duração', 'Situação']}
        rows={rows.map((item) => [
          item.name,
          item.price != null ? formatBrl(item.price) : '—',
          item.durationMinutes ? `${item.durationMinutes} min` : '—',
          item.active ? 'Ativo' : 'Inativo',
        ])}
        actions={rows.map((item) => (
          <div key={item.id} className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(item.id)}>Editar</Button>
            <Button size="sm" variant="secondary" onClick={() => upsertService(officeId, { ...item, active: !item.active })}>
              {item.active ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        ))}
      />
      {open && <ServiceForm officeId={officeId} onClose={() => setOpen(false)} />}
      {editing && <ServiceForm officeId={officeId} serviceId={editing} onClose={() => setEditing(null)} />}
    </ModuleFrame>
  );
};

const ServiceForm: React.FC<{ officeId: string; serviceId?: string; onClose: () => void }> = ({ officeId, serviceId, onClose }) => {
  const existing = serviceId ? officeServices(officeId).find((item) => item.id === serviceId) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '');
  const [duration, setDuration] = useState(String(existing?.durationMinutes ?? 60));
  const [description, setDescription] = useState(existing?.description ?? '');
  return (
    <Modal isOpen onClose={onClose} title={existing ? 'Editar serviço' : 'Novo serviço'} footer={
      <Button onClick={() => { upsertService(officeId, { id: existing?.id, name, price: price ? Number(price) : undefined, durationMinutes: Number(duration), description, active: existing?.active ?? true, custom: existing?.custom ?? true, catalogKey: existing?.catalogKey }); onClose(); }}>Salvar</Button>
    }>
      <div className="grid gap-3">
        <Input id="s-name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="s-price" label="Preço" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input id="s-dur" label="Duração (min)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <Input id="s-desc" label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
    </Modal>
  );
};

const ModuleFrame: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-[#0B1E36]">{title}</h1>
      {action}
    </div>
    {children}
  </div>
);

const Table: React.FC<{ headers: string[]; rows: string[][]; actions?: React.ReactNode[] }> = ({ headers, rows, actions }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          {headers.map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}
          {actions && <th className="p-3" />}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
            {actions && <td className="p-3">{actions[i]}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
