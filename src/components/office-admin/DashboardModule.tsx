import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DateRange, formatBrl, formatDate, formatDateTime, PeriodPreset, rangeForPreset } from '../../office/period';
import { dashboardMetrics } from '../../office/finance';
import {
  getGlobalProduct,
  getUserById,
  officeAppointments,
  officeClients,
  officeReturns,
  officeVehicles,
  officeWorkOrders,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import {
  AppointmentStatus,
  OfficeAppointment,
  OfficeClient,
  OfficeReturn,
  OfficeVehicle,
  RETURN_REASON_LABELS,
} from '../../office/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { PeriodFilter } from './shared';

type Drilldown =
  | 'attendances'
  | 'newClients'
  | 'servedClients'
  | 'servedVehicles'
  | 'billing'
  | 'received'
  | 'receivable'
  | 'ticket'
  | 'returnsDue'
  | 'returnsOverdue'
  | null;

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_atendimento: 'Em atendimento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  nao_compareceu: 'Não compareceu',
};

function appointmentTone(status: AppointmentStatus) {
  if (status === 'cancelado' || status === 'nao_compareceu') return 'danger' as const;
  if (status === 'concluido') return 'success' as const;
  return 'info' as const;
}

function ComparisonBadge({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-slate-400">— vs período anterior</span>;
  const positive = value >= 0;
  return (
    <span className={`text-xs font-semibold ${positive ? 'text-emerald-700' : 'text-rose-700'}`}>
      {positive ? '+' : ''}
      {value.toFixed(1)}% vs período anterior
    </span>
  );
}

export const DashboardModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<{ officeId: string; base: string }>();
  const [preset, setPreset] = useState<PeriodPreset>('30d');
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-23');
  const [applied, setApplied] = useState<DateRange>(() => rangeForPreset('30d'));
  const [drilldown, setDrilldown] = useState<Drilldown>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<OfficeAppointment | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<OfficeReturn | null>(null);

  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const returns = officeReturns(officeId);
  const appointments = officeAppointments(officeId);
  const orders = officeWorkOrders(officeId);

  const metrics = useMemo(
    () =>
      dashboardMetrics({
        orders,
        clients,
        vehicles,
        returns,
        appointments,
        range: applied,
      }),
    [orders, clients, vehicles, returns, appointments, applied]
  );

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  const apply = (nextPreset = preset) => {
    setApplied(rangeForPreset(nextPreset, from, to));
    setPreset(nextPreset);
    setDrilldown(null);
  };

  const kpis: Array<{
    id: Drilldown;
    label: string;
    value: string;
    comparison?: number;
  }> = [
    { id: 'attendances', label: 'Atendimentos', value: String(metrics.orders.length), comparison: metrics.comparisons.attendances },
    { id: 'newClients', label: 'Clientes novos', value: String(metrics.newClients.length) },
    { id: 'servedClients', label: 'Clientes atendidos', value: String(metrics.servedClientIds.size) },
    { id: 'servedVehicles', label: 'Veículos atendidos', value: String(metrics.servedVehicleIds.size) },
    { id: 'billing', label: 'Faturamento', value: formatBrl(metrics.finance.billed), comparison: metrics.comparisons.billing },
    { id: 'received', label: 'Recebido', value: formatBrl(metrics.finance.received) },
    { id: 'receivable', label: 'A receber', value: formatBrl(metrics.finance.receivable) },
    { id: 'ticket', label: 'Ticket médio', value: formatBrl(metrics.finance.ticketAverage) },
    { id: 'returnsDue', label: 'Retornos previstos', value: String(metrics.returnsDueSoon.next30.length) },
    { id: 'returnsOverdue', label: 'Retornos atrasados', value: String(metrics.returnsOverdue.length) },
  ];

  const drilldownTitle: Record<Exclude<Drilldown, null>, string> = {
    attendances: 'Atendimentos no período',
    newClients: 'Clientes novos',
    servedClients: 'Clientes atendidos',
    servedVehicles: 'Veículos atendidos',
    billing: 'Faturamento — atendimentos',
    received: 'Recebimentos — atendimentos',
    receivable: 'Valores a receber',
    ticket: 'Atendimentos (ticket médio)',
    returnsDue: 'Retornos previstos (30 dias)',
    returnsOverdue: 'Retornos atrasados',
  };

  const drilldownRows = useMemo(() => {
    if (!drilldown) return [];
    switch (drilldown) {
      case 'attendances':
      case 'billing':
      case 'received':
      case 'receivable':
      case 'ticket':
        return metrics.orders.map((order) => ({
          key: order.id,
          primary: clientMap.get(order.clientId)?.name ?? '—',
          secondary: `${vehicleMap.get(order.vehicleId)?.plate ?? '—'} · ${formatDate(order.date)}`,
          meta: formatBrl(order.amount),
        }));
      case 'newClients':
        return metrics.newClients.map((client) => ({
          key: client.id,
          primary: client.name,
          secondary: client.cpf,
          meta: formatDate(client.createdAt),
        }));
      case 'servedClients':
        return Array.from(metrics.servedClientIds).map((id) => {
          const client = clientMap.get(id);
          const count = metrics.orders.filter((o) => o.clientId === id).length;
          return {
            key: id,
            primary: client?.name ?? id,
            secondary: client?.phone ?? '—',
            meta: `${count} atendimento(s)`,
          };
        });
      case 'servedVehicles':
        return Array.from(metrics.servedVehicleIds).map((id) => {
          const vehicle = vehicleMap.get(id);
          const count = metrics.orders.filter((o) => o.vehicleId === id).length;
          return {
            key: id,
            primary: vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : id,
            secondary: clientMap.get(vehicle?.clientId ?? '')?.name ?? '—',
            meta: `${count} atendimento(s)`,
          };
        });
      case 'returnsDue':
        return metrics.returnsDueSoon.next30.map((item) => ({
          key: item.id,
          primary: clientMap.get(item.clientId)?.name ?? '—',
          secondary: vehicleMap.get(item.vehicleId)?.plate ?? '—',
          meta: formatDate(item.dueDate),
        }));
      case 'returnsOverdue':
        return metrics.returnsOverdue.map((item) => ({
          key: item.id,
          primary: clientMap.get(item.clientId)?.name ?? '—',
          secondary: vehicleMap.get(item.vehicleId)?.plate ?? '—',
          meta: formatDate(item.dueDate),
        }));
      default:
        return [];
    }
  }, [drilldown, metrics, clientMap, vehicleMap]);

  const renderReturnItem = (item: OfficeReturn) => {
    const client = clientMap.get(item.clientId);
    const vehicle = vehicleMap.get(item.vehicleId);
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setSelectedReturn(item)}
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50"
      >
        <span>
          {client?.name} · {vehicle?.plate}
        </span>
        <span className="text-slate-500">{formatDate(item.dueDate)}</span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Dashboard</h1>
        <p className="text-sm text-slate-600">Indicadores operacionais e financeiros da oficina no período selecionado.</p>
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setDrilldown(card.id)}
            className={`rounded-2xl border bg-white p-4 text-left transition hover:border-[#0B1E36] ${
              drilldown === card.id ? 'border-[#0B1E36] ring-1 ring-[#0B1E36]' : 'border-slate-200'
            }`}
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-[#0B1E36]">{card.value}</p>
            {card.comparison !== undefined && <ComparisonBadge value={card.comparison} />}
          </button>
        ))}
      </div>

      {drilldown && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-[#0B1E36]">{drilldownTitle[drilldown]}</h2>
            <button type="button" onClick={() => setDrilldown(null)} className="text-sm font-semibold text-slate-500 hover:text-[#0B1E36]">
              Fechar
            </button>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {drilldownRows.length === 0 && <li className="py-3 text-sm text-slate-500">Nenhum registro neste indicador.</li>}
            {drilldownRows.map((row) => (
              <li key={row.key}>
                <button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 py-2 text-left text-sm hover:text-[#0B1E36]">
                  <span>
                    <span className="font-semibold">{row.primary}</span>
                    <span className="ml-2 text-slate-500">{row.secondary}</span>
                  </span>
                  <span className="text-slate-600">{row.meta}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0B1E36]">Agenda de hoje</h2>
        {metrics.todayAgenda.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nenhum agendamento para hoje.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {metrics.todayAgenda.map((item) => {
              const client = clientMap.get(item.clientId);
              const vehicle = vehicleMap.get(item.vehicleId);
              const employee = item.employeeUserId ? getUserById(item.employeeUserId) : undefined;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(item)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-slate-50"
                  >
                    <span>
                      <span className="font-semibold">
                        {new Date(item.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {' · '}
                      {client?.name} · {vehicle?.plate} · {item.serviceLabel ?? 'Serviço'} · {employee?.name ?? '—'}
                    </span>
                    <Badge tone={appointmentTone(item.status)}>{APPOINTMENT_STATUS_LABELS[item.status]}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-[#0B1E36]">Retornos próximos</h2>
          <div className="mt-3 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700">Hoje ({metrics.returnsDueSoon.today.length})</p>
              <div className="mt-1">{metrics.returnsDueSoon.today.map(renderReturnItem)}</div>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Próximos 7 dias ({metrics.returnsDueSoon.next7.length})</p>
              <div className="mt-1">{metrics.returnsDueSoon.next7.map(renderReturnItem)}</div>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Próximos 30 dias ({metrics.returnsDueSoon.next30.length})</p>
              <div className="mt-1">{metrics.returnsDueSoon.next30.map(renderReturnItem)}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-[#0B1E36]">Retornos atrasados ({metrics.returnsOverdue.length})</h2>
          <div className="mt-3">{metrics.returnsOverdue.map(renderReturnItem)}</div>
        </section>
      </div>

      {selectedAppointment && (
        <Modal isOpen onClose={() => setSelectedAppointment(null)} title="Detalhe do agendamento">
          <AppointmentDetail
            appointment={selectedAppointment}
            client={clientMap.get(selectedAppointment.clientId)}
            vehicle={vehicleMap.get(selectedAppointment.vehicleId)}
          />
        </Modal>
      )}

      {selectedReturn && (
        <Modal isOpen onClose={() => setSelectedReturn(null)} title="Detalhe do retorno">
          <ReturnDetail
            item={selectedReturn}
            client={clientMap.get(selectedReturn.clientId)}
            vehicle={vehicleMap.get(selectedReturn.vehicleId)}
          />
        </Modal>
      )}
    </div>
  );
};

const AppointmentDetail: React.FC<{
  appointment: OfficeAppointment;
  client?: OfficeClient;
  vehicle?: OfficeVehicle;
}> = ({ appointment, client, vehicle }) => {
  const employee = appointment.employeeUserId ? getUserById(appointment.employeeUserId) : undefined;
  return (
    <dl className="space-y-2 text-sm">
      <div><dt className="font-semibold">Horário</dt><dd>{formatDateTime(appointment.startsAt)}</dd></div>
      <div><dt className="font-semibold">Cliente</dt><dd>{client?.name ?? '—'}</dd></div>
      <div><dt className="font-semibold">Veículo</dt><dd>{vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : '—'}</dd></div>
      <div><dt className="font-semibold">Serviço</dt><dd>{appointment.serviceLabel ?? '—'}</dd></div>
      <div><dt className="font-semibold">Responsável</dt><dd>{employee?.name ?? '—'}</dd></div>
      <div><dt className="font-semibold">Status</dt><dd>{APPOINTMENT_STATUS_LABELS[appointment.status]}</dd></div>
      {appointment.notes && <div><dt className="font-semibold">Observações</dt><dd>{appointment.notes}</dd></div>}
    </dl>
  );
};

const ReturnDetail: React.FC<{
  item: OfficeReturn;
  client?: OfficeClient;
  vehicle?: OfficeVehicle;
}> = ({ item, client, vehicle }) => (
  <dl className="space-y-2 text-sm">
    <div><dt className="font-semibold">Cliente</dt><dd>{client?.name ?? '—'}</dd></div>
    <div><dt className="font-semibold">Veículo</dt><dd>{vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : '—'}</dd></div>
    <div><dt className="font-semibold">Último serviço</dt><dd>{formatDate(item.lastServiceDate)} — {item.serviceLabel ?? '—'}</dd></div>
    <div><dt className="font-semibold">Motivo</dt><dd>{item.reason ? RETURN_REASON_LABELS[item.reason] : '—'}</dd></div>
    <div><dt className="font-semibold">Vencimento</dt><dd>{formatDate(item.dueDate)}</dd></div>
  </dl>
);
