import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import {
  findClientByCpf,
  findVehicleByPlate,
  getGlobalProduct,
  getUserById,
  officeClients,
  officeReturns,
  officeUsers,
  officeVehicles,
  officeWorkOrders,
  searchProducts,
  upsertClient,
  upsertVehicle,
  upsertWorkOrder,
} from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { formatBrl, formatDate } from '../../office/period';
import { formatCpf, formatPhone } from '../../office/validation';
import { formatPlate } from '../../lib/utils';
import {
  computeWorkOrderTotals,
  OfficeClient,
  OfficeVehicle,
  OfficeWorkOrder,
  PaymentStatus,
  PRODUCT_ORIGIN_LABELS,
  ProductOrigin,
  RETURN_REASON_LABELS,
  ReturnReason,
  SERVICE_CATEGORY_LABELS,
  ServiceCategory,
  WorkOrderProductLine,
  WorkOrderServiceLine,
  WorkOrderStatus,
} from '../../office/types';

type Ctx = { officeId: string };

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  parcial: 'Parcial',
  recebido: 'Recebido',
  cancelado: 'Cancelado',
};

const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function serviceCategoriesSummary(order: OfficeWorkOrder): string {
  const cats = new Set(order.services.map((s) => SERVICE_CATEGORY_LABELS[s.category]));
  return Array.from(cats).join(', ') || '—';
}

export const WorkOrdersModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [query, setQuery] = useState({ plate: '', status: 'all', client: 'all', vehicle: 'all', from: '', to: '' });
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<OfficeWorkOrder | null>(null);
  const clients = officeClients(officeId);
  const vehicles = officeVehicles(officeId);
  const rows = officeWorkOrders(officeId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((item) => {
      const vehicle = vehicles.find((v) => v.id === item.vehicleId);
      if (query.plate && !vehicle?.plate.includes(query.plate.toUpperCase())) return false;
      if (query.status !== 'all' && item.status !== query.status) return false;
      if (query.client !== 'all' && item.clientId !== query.client) return false;
      if (query.vehicle !== 'all' && item.vehicleId !== query.vehicle) return false;
      if (query.from && item.date < `${query.from}T00:00:00`) return false;
      if (query.to && item.date > `${query.to}T23:59:59`) return false;
      return true;
    });

  return (
    <ModuleFrame title="Atendimentos" action={<Button onClick={() => setOpen(true)}>+ Novo atendimento</Button>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Input id="os-from" type="date" label="Período inicial" value={query.from} onChange={(e) => setQuery({ ...query, from: e.target.value })} />
        <Input id="os-to" type="date" label="Período final" value={query.to} onChange={(e) => setQuery({ ...query, to: e.target.value })} />
        <Select id="os-cli" label="Cliente" value={query.client} onChange={(e) => setQuery({ ...query, client: e.target.value })}>
          <option value="all">Todos</option>
          {clients.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select id="os-veh" label="Veículo" value={query.vehicle} onChange={(e) => setQuery({ ...query, vehicle: e.target.value })}>
          <option value="all">Todos</option>
          {vehicles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.plate}
            </option>
          ))}
        </Select>
        <Input id="os-plate" label="Placa" value={query.plate} onChange={(e) => setQuery({ ...query, plate: formatPlate(e.target.value) })} />
        <Select id="os-status" label="Status" value={query.status} onChange={(e) => setQuery({ ...query, status: e.target.value })}>
          <option value="all">Todos</option>
          {Object.entries(WORK_ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <Table
        headers={['Data', 'Cliente', 'Veículo', 'Mão de obra', 'Produtos', 'Total', 'Pagamento', 'Categorias']}
        rows={rows.map((item) => {
          const vehicle = vehicles.find((v) => v.id === item.vehicleId);
          const client = clients.find((c) => c.id === item.clientId);
          return [
            formatDate(item.date),
            client?.name ?? '—',
            vehicle?.plate ?? '—',
            formatBrl(item.laborTotal),
            formatBrl(item.productsRevenue),
            formatBrl(item.amount),
            PAYMENT_STATUS_LABELS[item.paymentStatus],
            serviceCategoriesSummary(item),
          ];
        })}
        onRowClick={(index) => setDetail(rows[index])}
      />
      {open && <WorkOrderWizard officeId={officeId} onClose={() => setOpen(false)} />}
      {detail && (
        <Modal isOpen onClose={() => setDetail(null)} title="Detalhe do atendimento" size="lg">
          <WorkOrderDetail order={detail} clients={clients} vehicles={vehicles} />
        </Modal>
      )}
    </ModuleFrame>
  );
};

const WorkOrderWizard: React.FC<{ officeId: string; onClose: () => void }> = ({ officeId, onClose }) => {
  const employees = officeUsers(officeId).filter((u) => u.active);
  const [step, setStep] = useState(1);

  const [clientMode, setClientMode] = useState<'search' | 'create'>('search');
  const [clientCpf, setClientCpf] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientForm, setClientForm] = useState({ name: '', cpf: '', phone: '', email: '' });

  const [plate, setPlate] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleForm, setVehicleForm] = useState({
    brand: '',
    model: '',
    year: '2020',
    color: '',
    km: '0',
    chassis: '',
    renavam: '',
  });

  const [services, setServices] = useState<WorkOrderServiceLine[]>([]);
  const [serviceDraft, setServiceDraft] = useState({
    category: 'manutencao_preventiva' as ServiceCategory,
    description: '',
    laborAmount: '',
    quantity: '1',
    employeeUserId: employees[0]?.id ?? '',
  });

  const [products, setProducts] = useState<WorkOrderProductLine[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [productDraft, setProductDraft] = useState({
    productId: '',
    origin: 'estoque' as ProductOrigin,
    quantity: '1',
    unitCost: '',
    unitPrice: '',
  });

  const [returnDueDate, setReturnDueDate] = useState('');
  const [returnReason, setReturnReason] = useState<ReturnReason | ''>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileageKm, setMileageKm] = useState('0');
  const [status, setStatus] = useState<WorkOrderStatus>('aberto');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendente');

  const productResults = useMemo(() => searchProducts(productQuery, 8), [productQuery]);
  const totals = computeWorkOrderTotals({ services, products });

  const resolveClient = (): string => {
    if (clientMode === 'search' && clientId) return clientId;
    const found = findClientByCpf(officeId, clientForm.cpf || clientCpf);
    if (found) return found.id;
    const saved = upsertClient(officeId, {
      name: clientForm.name,
      cpf: clientForm.cpf || clientCpf,
      phone: clientForm.phone,
      email: clientForm.email || undefined,
    });
    return saved.id;
  };

  const resolveVehicle = (resolvedClientId: string): string => {
    if (vehicleId) return vehicleId;
    const found = findVehicleByPlate(officeId, plate);
    if (found) return found.id;
    const saved = upsertVehicle(officeId, {
      plate,
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      year: Number(vehicleForm.year),
      color: vehicleForm.color || undefined,
      chassis: vehicleForm.chassis || undefined,
      renavam: vehicleForm.renavam || undefined,
      clientId: resolvedClientId,
      currentMileageKm: Number(mileageKm || vehicleForm.km),
    });
    return saved.id;
  };

  const addService = () => {
    if (!serviceDraft.description) return;
    setServices([
      ...services,
      {
        id: uid('svc'),
        category: serviceDraft.category,
        description: serviceDraft.description,
        laborAmount: Number(serviceDraft.laborAmount) || 0,
        quantity: Number(serviceDraft.quantity) || 1,
        employeeUserId: serviceDraft.employeeUserId || undefined,
      },
    ]);
    setServiceDraft({ ...serviceDraft, description: '', laborAmount: '' });
  };

  const addProduct = () => {
    if (!productDraft.productId) return;
    const origin = productDraft.origin;
    setProducts([
      ...products,
      {
        id: uid('prd'),
        productId: productDraft.productId,
        origin,
        quantity: Number(productDraft.quantity) || 1,
        unitCost: Number(productDraft.unitCost) || 0,
        unitPrice: origin === 'cliente' ? 0 : Number(productDraft.unitPrice) || 0,
      },
    ]);
    setProductDraft({ ...productDraft, productId: '', unitCost: '', unitPrice: '' });
    setProductQuery('');
  };

  const save = () => {
    const resolvedClientId = resolveClient();
    const resolvedVehicleId = resolveVehicle(resolvedClientId);
    const received = Number(amountReceived) || 0;
    upsertWorkOrder(officeId, {
      date: new Date(`${date}T12:00:00`).toISOString(),
      clientId: resolvedClientId,
      vehicleId: resolvedVehicleId,
      mileageKm: Number(mileageKm),
      status,
      services,
      products,
      amountReceived: received,
      paymentStatus,
      returnDueDate: returnDueDate ? new Date(`${returnDueDate}T12:00:00`).toISOString() : undefined,
      returnReason: returnReason || undefined,
    });
    onClose();
  };

  const steps = ['Cliente', 'Veículo', 'Serviços', 'Produtos', 'Retorno', 'Pagamento'];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Novo atendimento"
      size="lg"
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Voltar
          </Button>
          {step < 6 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Próximo</Button>
          ) : (
            <Button onClick={save}>Salvar atendimento</Button>
          )}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              step === index + 1 ? 'bg-[#0B1E36] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant={clientMode === 'search' ? 'primary' : 'secondary'} onClick={() => setClientMode('search')}>
              Buscar CPF
            </Button>
            <Button size="sm" variant={clientMode === 'create' ? 'primary' : 'secondary'} onClick={() => setClientMode('create')}>
              Novo cliente
            </Button>
          </div>
          {clientMode === 'search' ? (
            <>
              <Input id="wo-cpf" label="CPF" value={clientCpf} onChange={(e) => setClientCpf(formatCpf(e.target.value))} />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const found = findClientByCpf(officeId, clientCpf);
                  if (found) setClientId(found.id);
                }}
              >
                Buscar
              </Button>
              {clientId && <p className="text-sm text-emerald-700">Cliente selecionado.</p>}
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input id="c-name" label="Nome" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
              <Input id="c-cpf" label="CPF" value={clientForm.cpf} onChange={(e) => setClientForm({ ...clientForm, cpf: formatCpf(e.target.value) })} />
              <Input id="c-phone" label="Telefone" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: formatPhone(e.target.value) })} />
              <Input id="c-email" label="E-mail" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Input id="wo-plate" label="Placa" value={plate} onChange={(e) => setPlate(formatPlate(e.target.value))} />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const found = findVehicleByPlate(officeId, plate);
              if (found) {
                setVehicleId(found.id);
                setVehicleForm({
                  brand: found.brand,
                  model: found.model,
                  year: String(found.year),
                  color: found.color ?? '',
                  km: String(found.currentMileageKm),
                  chassis: found.chassis ?? '',
                  renavam: found.renavam ?? '',
                });
              }
            }}
          >
            Buscar placa
          </Button>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input id="v-brand" label="Marca" value={vehicleForm.brand} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} />
            <Input id="v-model" label="Modelo" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} />
            <Input id="v-year" label="Ano" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })} />
            <Input id="v-color" label="Cor" value={vehicleForm.color} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} />
            <Input id="v-km" label="Quilometragem" value={mileageKm || vehicleForm.km} onChange={(e) => { setMileageKm(e.target.value); setVehicleForm({ ...vehicleForm, km: e.target.value }); }} />
            <Input id="v-chassis" label="Chassi (opcional)" value={vehicleForm.chassis} onChange={(e) => setVehicleForm({ ...vehicleForm, chassis: e.target.value })} />
            <Input id="v-renavam" label="Renavam (opcional)" value={vehicleForm.renavam} onChange={(e) => setVehicleForm({ ...vehicleForm, renavam: e.target.value })} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select id="svc-cat" label="Categoria" value={serviceDraft.category} onChange={(e) => setServiceDraft({ ...serviceDraft, category: e.target.value as ServiceCategory })}>
              {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <Select id="svc-emp" label="Responsável" value={serviceDraft.employeeUserId} onChange={(e) => setServiceDraft({ ...serviceDraft, employeeUserId: e.target.value })}>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </Select>
            <Input id="svc-desc" label="Descrição" value={serviceDraft.description} onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })} className="sm:col-span-2" />
            <Input id="svc-labor" label="Valor mão de obra" value={serviceDraft.laborAmount} onChange={(e) => setServiceDraft({ ...serviceDraft, laborAmount: e.target.value })} />
            <Input id="svc-qty" label="Quantidade" value={serviceDraft.quantity} onChange={(e) => setServiceDraft({ ...serviceDraft, quantity: e.target.value })} />
          </div>
          <Button size="sm" onClick={addService}>Adicionar serviço</Button>
          <ul className="space-y-1 text-sm">
            {services.map((s) => (
              <li key={s.id} className="rounded-lg bg-slate-50 p-2">
                {SERVICE_CATEGORY_LABELS[s.category]} — {s.description} — {formatBrl(s.laborAmount * s.quantity)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <Input id="prd-q" label="Buscar produto" value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Nome, marca ou código" />
          {productResults.length > 0 && (
            <ul className="rounded-lg border border-slate-200 text-sm">
              {productResults.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-slate-50"
                    onClick={() => setProductDraft({ ...productDraft, productId: p.id })}
                  >
                    {p.name} · {p.brand} · {p.code}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select id="prd-origin" label="Origem" value={productDraft.origin} onChange={(e) => setProductDraft({ ...productDraft, origin: e.target.value as ProductOrigin, unitPrice: e.target.value === 'cliente' ? '0' : productDraft.unitPrice })}>
              {Object.entries(PRODUCT_ORIGIN_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <Input id="prd-qty" label="Quantidade" value={productDraft.quantity} onChange={(e) => setProductDraft({ ...productDraft, quantity: e.target.value })} />
            <Input id="prd-cost" label="Custo unitário" value={productDraft.unitCost} onChange={(e) => setProductDraft({ ...productDraft, unitCost: e.target.value })} />
            <Input id="prd-price" label="Preço unitário" value={productDraft.origin === 'cliente' ? '0' : productDraft.unitPrice} disabled={productDraft.origin === 'cliente'} onChange={(e) => setProductDraft({ ...productDraft, unitPrice: e.target.value })} />
          </div>
          <Button size="sm" onClick={addProduct}>Adicionar produto</Button>
          <ul className="space-y-1 text-sm">
            {products.map((p) => {
              const product = getGlobalProduct(p.productId);
              return (
                <li key={p.id} className="rounded-lg bg-slate-50 p-2">
                  {product?.name ?? p.productId} · {PRODUCT_ORIGIN_LABELS[p.origin]} · qtd {p.quantity}
                </li>
              );
            })}
          </ul>
          <p className="text-sm font-semibold text-[#0B1E36]">
            Totais: mão de obra {formatBrl(totals.laborTotal)} · produtos {formatBrl(totals.productsRevenue)} · total {formatBrl(totals.amount)}
          </p>
          <p className="text-xs text-slate-500">Produto fornecido pelo cliente não entra como receita.</p>
        </div>
      )}

      {step === 5 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input id="ret-date" type="date" label="Data prevista de retorno (opcional)" value={returnDueDate} onChange={(e) => setReturnDueDate(e.target.value)} />
          <Select id="ret-reason" label="Motivo (opcional)" value={returnReason} onChange={(e) => setReturnReason(e.target.value as ReturnReason | '')}>
            <option value="">—</option>
            {Object.entries(RETURN_REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input id="wo-date" type="date" label="Data do atendimento" value={date} onChange={(e) => setDate(e.target.value)} />
            <Select id="wo-st" label="Status" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
              {Object.entries(WORK_ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <Input id="wo-received" label="Valor recebido" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} />
            <Select id="wo-pay" label="Status pagamento" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-sm">
            Total faturado: <strong>{formatBrl(totals.amount)}</strong>
          </p>
        </div>
      )}
    </Modal>
  );
};

const WorkOrderDetail: React.FC<{
  order: OfficeWorkOrder;
  clients: OfficeClient[];
  vehicles: OfficeVehicle[];
}> = ({ order, clients, vehicles }) => {
  const client = clients.find((c) => c.id === order.clientId);
  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
  const creator = getUserById(order.createdBy);
  return (
    <div className="space-y-4 text-sm">
      <p>
        {formatDate(order.date)} · {client?.name} · {vehicle?.plate} · {WORK_ORDER_STATUS_LABELS[order.status]}
      </p>
      <section>
        <h3 className="font-bold text-[#0B1E36]">Serviços</h3>
        <ul className="mt-2 space-y-1">
          {order.services.map((s) => (
            <li key={s.id}>
              {SERVICE_CATEGORY_LABELS[s.category]} — {s.description} — {formatBrl(s.laborAmount * s.quantity)}
              {s.employeeUserId && ` · ${getUserById(s.employeeUserId)?.name ?? ''}`}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-bold text-[#0B1E36]">Produtos</h3>
        <ul className="mt-2 space-y-1">
          {order.products.map((p) => {
            const product = getGlobalProduct(p.productId);
            return (
              <li key={p.id}>
                {product?.name ?? p.productId} · {PRODUCT_ORIGIN_LABELS[p.origin]} · qtd {p.quantity} · {formatBrl(p.unitPrice * p.quantity)}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="rounded-lg bg-slate-50 p-3">
        <p>Mão de obra: {formatBrl(order.laborTotal)}</p>
        <p>Receita produtos: {formatBrl(order.productsRevenue)}</p>
        <p className="font-bold">Total: {formatBrl(order.amount)}</p>
        <p>Pagamento: {PAYMENT_STATUS_LABELS[order.paymentStatus]} · Recebido: {formatBrl(order.amountReceived)}</p>
      </section>
      <p className="text-xs text-slate-500">Registrado por {creator?.name ?? order.createdBy} em {formatDate(order.createdAt)}</p>
    </div>
  );
};

export const ClientsModule: React.FC = () => {
  useOfficeSnapshot();
  const { officeId } = useOutletContext<Ctx>();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeClient | null>(null);
  const [selected, setSelected] = useState<OfficeClient | null>(null);
  const vehicles = officeVehicles(officeId);
  const orders = officeWorkOrders(officeId);
  const returns = officeReturns(officeId);
  const rows = officeClients(officeId).filter((item) => {
    const plate = vehicles.filter((v) => v.clientId === item.id).map((v) => v.plate).join(' ');
    const blob = `${item.name} ${item.cpf} ${item.phone} ${plate}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  const clientOrders = selected ? orders.filter((o) => o.clientId === selected.id && o.status !== 'cancelado') : [];
  const clientFinance = {
    total: clientOrders.reduce((s, o) => s + o.amount, 0),
    count: clientOrders.length,
    ticket: clientOrders.length ? clientOrders.reduce((s, o) => s + o.amount, 0) / clientOrders.length : 0,
    pending: clientOrders.reduce((s, o) => s + Math.max(0, o.amount - o.amountReceived), 0),
  };

  return (
    <ModuleFrame title="Clientes" action={<Button onClick={() => setOpen(true)}>Novo cliente</Button>}>
      <Input id="cli-q" label="Pesquisar por nome, CPF, telefone ou placa" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Table
          headers={['Nome', 'CPF', 'Telefone', 'Veículos']}
          rows={rows.map((item) => [
            item.name,
            formatCpf(item.cpf),
            item.phone,
            vehicles.filter((v) => v.clientId === item.id).map((v) => v.plate).join(', ') || '—',
          ])}
          onRowClick={(index) => setSelected(rows[index])}
        />
        {selected && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-[#0B1E36]">{selected.name}</h2>
              <Button size="sm" variant="secondary" onClick={() => setEditing(selected)}>Editar</Button>
            </div>
            <dl className="mt-3 space-y-1">
              <div><dt className="inline font-semibold">CPF: </dt><dd className="inline">{formatCpf(selected.cpf)}</dd></div>
              <div><dt className="inline font-semibold">Telefone: </dt><dd className="inline">{selected.phone}</dd></div>
              {selected.email && <div><dt className="inline font-semibold">E-mail: </dt><dd className="inline">{selected.email}</dd></div>}
            </dl>
            <h3 className="mt-4 font-semibold">Veículos</h3>
            <ul className="mt-1 list-disc pl-5">
              {vehicles.filter((v) => v.clientId === selected.id).map((v) => (
                <li key={v.id}>{v.plate} · {v.brand} {v.model}</li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Histórico de atendimentos</h3>
            <ul className="mt-1 space-y-1">
              {clientOrders.slice(0, 6).map((o) => (
                <li key={o.id}>{formatDate(o.date)} — {formatBrl(o.amount)}</li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Financeiro</h3>
            <p>Total gasto: {formatBrl(clientFinance.total)} · {clientFinance.count} atendimentos · ticket {formatBrl(clientFinance.ticket)}</p>
            <p>A receber: {formatBrl(clientFinance.pending)}</p>
            <h3 className="mt-4 font-semibold">Retornos relacionados</h3>
            <ul className="mt-1 space-y-1">
              {returns.filter((r) => r.clientId === selected.id).map((r) => (
                <li key={r.id}>{formatDate(r.dueDate)} — {r.serviceLabel}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      {open && <ClientForm officeId={officeId} onClose={() => setOpen(false)} />}
      {editing && <ClientForm officeId={officeId} client={editing} onClose={() => setEditing(null)} />}
    </ModuleFrame>
  );
};

const ClientForm: React.FC<{ officeId: string; client?: OfficeClient; onClose: () => void }> = ({ officeId, client, onClose }) => {
  const [name, setName] = useState(client?.name ?? '');
  const [cpf, setCpf] = useState(client?.cpf ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [notes, setNotes] = useState(client?.notes ?? '');
  return (
    <Modal isOpen onClose={onClose} title={client ? 'Editar cliente' : 'Novo cliente'} footer={
      <Button onClick={() => { upsertClient(officeId, { id: client?.id, name, cpf, phone, whatsapp: phone, email, notes }); onClose(); }}>Salvar</Button>
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
  const [selected, setSelected] = useState<OfficeVehicle | null>(null);
  const clients = officeClients(officeId);
  const orders = officeWorkOrders(officeId);
  const returns = officeReturns(officeId);
  const rows = officeVehicles(officeId);

  const vehicleOrders = selected ? orders.filter((o) => o.vehicleId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <ModuleFrame title="Veículos" action={<Button onClick={() => setOpen(true)}>Novo veículo</Button>}>
      <p className="mb-4 text-sm text-slate-600">O veículo é uma entidade própria. A oficina registra manutenções sobre ele, sem duplicar o cadastro a cada atendimento.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Table
          headers={['Placa', 'Marca', 'Modelo', 'Ano', 'Cor', 'km', 'Cliente']}
          rows={rows.map((item) => [
            item.plate,
            item.brand,
            item.model,
            String(item.year),
            item.color ?? '—',
            item.currentMileageKm.toLocaleString('pt-BR'),
            clients.find((c) => c.id === item.clientId)?.name ?? '—',
          ])}
          onRowClick={(index) => setSelected(rows[index])}
        />
        {selected && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <h2 className="font-bold text-[#0B1E36]">{selected.plate} · {selected.brand} {selected.model}</h2>
            <p className="mt-1 text-slate-600">Proprietário: {clients.find((c) => c.id === selected.clientId)?.name}</p>
            <h3 className="mt-4 font-semibold">Histórico de atendimentos</h3>
            <ul className="mt-2 space-y-3">
              {vehicleOrders.map((o) => (
                <li key={o.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold">{formatDate(o.date)} — {formatBrl(o.amount)}</p>
                  <p className="text-slate-600">{o.services.map((s) => s.description).join(' · ')}</p>
                  {o.products.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Produtos utilizados:{' '}
                      {o.products.map((p) => {
                        const product = getGlobalProduct(p.productId);
                        return `${product?.name ?? p.productId} (${p.quantity})`;
                      }).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Retornos</h3>
            <ul className="mt-1 space-y-1">
              {returns.filter((r) => r.vehicleId === selected.id).map((r) => (
                <li key={r.id}>{formatDate(r.dueDate)} — {r.serviceLabel} {r.reason ? `(${RETURN_REASON_LABELS[r.reason]})` : ''}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
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
  const [color, setColor] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [km, setKm] = useState('0');
  return (
    <Modal isOpen onClose={onClose} title="Novo veículo" footer={
      <Button onClick={() => { upsertVehicle(officeId, { plate, brand, model, year: Number(year), color: color || undefined, clientId, currentMileageKm: Number(km) }); onClose(); }}>Salvar</Button>
    }>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input id="v-plate" label="Placa" value={plate} onChange={(e) => setPlate(formatPlate(e.target.value))} />
        <Input id="v-brand" label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <Input id="v-model" label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} />
        <Input id="v-year" label="Ano" value={year} onChange={(e) => setYear(e.target.value)} />
        <Input id="v-color" label="Cor" value={color} onChange={(e) => setColor(e.target.value)} />
        <Select id="v-cli" label="Proprietário / cliente" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Input id="v-km" label="Quilometragem atual" value={km} onChange={(e) => setKm(e.target.value)} />
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

const Table: React.FC<{
  headers: string[];
  rows: string[][];
  onRowClick?: (index: number) => void;
}> = ({ headers, rows, onRowClick }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          {headers.map((h) => (
            <th key={h} className="p-3 font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <tr
            key={i}
            className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
            onClick={() => onRowClick?.(i)}
          >
            {row.map((cell, j) => (
              <td key={j} className="p-3">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
