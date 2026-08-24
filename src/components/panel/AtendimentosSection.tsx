import React, { useMemo, useState } from 'react';
import {
  createAttendance,
  listAttendanceProducts,
  listAttendanceServices,
  listAttendances,
  listCustomers,
  listProductCatalog,
  listServiceCatalog,
  listVehicles,
  upsertCustomer,
  upsertVehicle,
} from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { formatBRL } from '../../lib/currency';
import { formatPhone } from '../../lib/phone';
import { onlyDigits } from '../../lib/cpf';
import { formatPlate } from '../../lib/utils';
import { Field, inputClass } from '../ui/Field';
import { CommunicationNotice, SectionTitle, formatIsoDate } from './shared';

type ServiceDraft = {
  catalogServiceId?: string;
  title: string;
  quantity: string;
  unitPrice: string;
  notes: string;
};

type ProductDraft = {
  catalogProductId?: string;
  name: string;
  brand: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

export const AtendimentosSection: React.FC<{ officeId: string }> = ({ officeId }) => {
  useOfficeStore();
  const rows = listAttendances(officeId).slice().sort((a, b) => b.date.localeCompare(a.date));
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const serviceCatalog = listServiceCatalog(officeId).filter((row) => row.status === 'active');
  const productCatalog = listProductCatalog(officeId).filter((row) => row.status === 'active');

  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileageKm, setMileageKm] = useState('');
  const [laborAmount, setLaborAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [returnDueDate, setReturnDueDate] = useState('');
  const [returnKm, setReturnKm] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [quickCustomer, setQuickCustomer] = useState(false);
  const [quickVehicle, setQuickVehicle] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');

  const customerVehicles = vehicles.filter((row) => !customerId || row.customerId === customerId);

  const servicesTotal = services.reduce((sum, row) => sum + (Number(row.quantity || 0) * Number(row.unitPrice || 0)), 0);
  const productsTotal = products.reduce((sum, row) => sum + (Number(row.quantity || 0) * Number(row.unitPrice || 0)), 0);
  const labor = Number(laborAmount || 0);
  const total = servicesTotal + productsTotal + labor;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      const customer = customers.find((item) => item.id === row.customerId);
      const vehicle = vehicles.find((item) => item.id === row.vehicleId);
      const servicesText = listAttendanceServices(officeId, row.id).map((line) => line.title).join(' ');
      const haystack = [customer?.name, vehicle?.plate, vehicle?.model, servicesText, row.notes].filter(Boolean).join(' ').toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [rows, query, statusFilter, customers, vehicles, officeId]);

  const resetForm = () => {
    setCustomerId('');
    setVehicleId('');
    setDate(new Date().toISOString().slice(0, 10));
    setMileageKm('');
    setLaborAmount('0');
    setNotes('');
    setServices([]);
    setProducts([]);
    setReturnDueDate('');
    setReturnKm('');
    setReturnNotes('');
  };

  const finish = () => {
    if (!date || services.length === 0) return;
    createAttendance(officeId, {
      customerId: customerId || undefined,
      vehicleId: vehicleId || undefined,
      date,
      mileageKm: mileageKm ? Number(mileageKm) : undefined,
      notes,
      laborAmount: labor,
      servicesAmount: servicesTotal,
      productsAmount: productsTotal,
      totalAmount: total,
      status: 'completed',
      services: services.map((row) => ({
        catalogServiceId: row.catalogServiceId,
        title: row.title,
        quantity: Number(row.quantity || 1),
        unitPrice: Number(row.unitPrice || 0),
        amount: Number(row.quantity || 0) * Number(row.unitPrice || 0),
        notes: row.notes,
      })),
      products: products.map((row) => ({
        catalogProductId: row.catalogProductId,
        name: row.name,
        brand: row.brand,
        quantity: Number(row.quantity || 1),
        unit: row.unit,
        unitPrice: Number(row.unitPrice || 0),
        amount: Number(row.quantity || 0) * Number(row.unitPrice || 0),
      })),
      returnPlan: (returnDueDate || returnKm)
        ? {
            dueDate: returnDueDate || undefined,
            nextMileageKm: returnKm ? Number(returnKm) : undefined,
            serviceTitle: services[0]?.title,
            reason: services[0]?.title || 'Retorno previsto',
            notes: returnNotes,
          }
        : undefined,
    });
    resetForm();
    setMode('list');
  };

  if (mode === 'new') {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle title="Novo atendimento" subtitle="Registrar serviço realizado. Nenhuma mensagem é enviada ao cliente." />
          <button type="button" onClick={() => setMode('list')} className="text-sm font-bold text-sky-800 cursor-pointer">Voltar</button>
        </div>
        <CommunicationNotice />

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Cliente">
              <select className={inputClass} value={customerId} onChange={(e) => { setCustomerId(e.target.value); setVehicleId(''); }}>
                <option value="">Selecionar cliente</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </Field>
            <div className="flex items-end">
              <button type="button" onClick={() => setQuickCustomer((value) => !value)} className="text-sm font-bold text-sky-800 cursor-pointer">+ Novo cliente</button>
            </div>
          </div>
          {quickCustomer ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className={inputClass} placeholder="Nome completo" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
              <input className={inputClass} placeholder="Telefone" value={formatPhone(newCustomerPhone)} onChange={(e) => setNewCustomerPhone(onlyDigits(e.target.value))} />
              <button
                type="button"
                className="rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer"
                onClick={() => {
                  if (!newCustomerName.trim()) return;
                  const created = upsertCustomer(officeId, { name: newCustomerName, phone: newCustomerPhone, whatsapp: newCustomerPhone });
                  setCustomerId(created.id);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                  setQuickCustomer(false);
                }}
              >
                Salvar cliente
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Veículo">
              <select className={inputClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                <option value="">Selecionar veículo</option>
                {customerVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} · {vehicle.model || 'modelo'}</option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <button type="button" onClick={() => setQuickVehicle((value) => !value)} className="text-sm font-bold text-sky-800 cursor-pointer">+ Novo veículo</button>
            </div>
          </div>
          {quickVehicle ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className={`${inputClass} uppercase`} placeholder="Placa" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} />
              <input className={inputClass} placeholder="Modelo" value={newModel} onChange={(e) => setNewModel(e.target.value)} />
              <button
                type="button"
                className="rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer"
                onClick={() => {
                  if (!newPlate.trim()) return;
                  const created = upsertVehicle(officeId, {
                    plate: formatPlate(newPlate),
                    model: newModel,
                    customerId: customerId || undefined,
                  });
                  setVehicleId(created.id);
                  setNewPlate('');
                  setNewModel('');
                  setQuickVehicle(false);
                }}
              >
                Salvar veículo
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Data do atendimento">
              <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Quilometragem" optional>
              <input className={inputClass} type="number" min={0} value={mileageKm} onChange={(e) => setMileageKm(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#0B1E36]">Serviços</h3>
            <select
              className={inputClass + ' max-w-xs'}
              defaultValue=""
              onChange={(e) => {
                const item = serviceCatalog.find((row) => row.id === e.target.value);
                if (!item) return;
                setServices((prev) => [...prev, {
                  catalogServiceId: item.id,
                  title: item.name,
                  quantity: '1',
                  unitPrice: String(item.price),
                  notes: '',
                }]);
                e.target.value = '';
              }}
            >
              <option value="">Adicionar do catálogo</option>
              {serviceCatalog.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatBRL(item.price)}</option>)}
            </select>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-sky-800 cursor-pointer"
            onClick={() => setServices((prev) => [...prev, { title: '', quantity: '1', unitPrice: '0', notes: '' }])}
          >
            + Serviço avulso
          </button>
          {services.map((row, index) => (
            <div key={`${row.catalogServiceId || 'svc'}-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input className={inputClass} placeholder="Descrição" value={row.title} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} />
              <input className={inputClass} type="number" placeholder="Qtd" value={row.quantity} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} />
              <input className={inputClass} type="number" placeholder="Valor" value={row.unitPrice} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, unitPrice: e.target.value } : item))} />
              <button type="button" className="text-xs font-bold text-rose-700 cursor-pointer" onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}>Remover</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#0B1E36]">Produtos</h3>
            <select
              className={inputClass + ' max-w-xs'}
              defaultValue=""
              onChange={(e) => {
                const item = productCatalog.find((row) => row.id === e.target.value);
                if (!item) return;
                setProducts((prev) => [...prev, {
                  catalogProductId: item.id,
                  name: item.name,
                  brand: item.brand || '',
                  quantity: '1',
                  unit: item.unit,
                  unitPrice: String(item.price),
                }]);
                e.target.value = '';
              }}
            >
              <option value="">Adicionar do catálogo</option>
              {productCatalog.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.brand || 's/ marca'}</option>)}
            </select>
          </div>
          {products.map((row, index) => (
            <div key={`${row.catalogProductId || 'prd'}-${index}`} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input className={inputClass} placeholder="Produto" value={row.name} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
              <input className={inputClass} placeholder="Marca" value={row.brand} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, brand: e.target.value } : item))} />
              <input className={inputClass} type="number" placeholder="Qtd" value={row.quantity} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} />
              <input className={inputClass} placeholder="Unidade" value={row.unit} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, unit: e.target.value } : item))} />
              <input className={inputClass} type="number" placeholder="Valor unit." value={row.unitPrice} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, unitPrice: e.target.value } : item))} />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Mão de obra">
            <input className={inputClass} type="number" min={0} value={laborAmount} onChange={(e) => setLaborAmount(e.target.value)} />
          </Field>
          <Field label="Observações" optional>
            <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-extrabold text-[#0B1E36]">Retorno (controle interno)</h3>
          <p className="text-xs text-slate-600">Opcional. O VEBOOK não avisa o cliente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className={inputClass} type="date" value={returnDueDate} onChange={(e) => setReturnDueDate(e.target.value)} />
            <input className={inputClass} type="number" placeholder="Quilometragem prevista" value={returnKm} onChange={(e) => setReturnKm(e.target.value)} />
            <input className={inputClass} placeholder="Observação do retorno" value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
          <p className="flex justify-between"><span>Serviços</span><strong>{formatBRL(servicesTotal)}</strong></p>
          <p className="flex justify-between"><span>Produtos</span><strong>{formatBRL(productsTotal)}</strong></p>
          <p className="flex justify-between"><span>Mão de obra</span><strong>{formatBRL(labor)}</strong></p>
          <p className="flex justify-between border-t border-slate-200 pt-2 text-base"><span>Total</span><strong>{formatBRL(total)}</strong></p>
          <button type="button" onClick={finish} className="mt-3 w-full py-3 rounded-xl bg-[#0B1E36] text-white font-extrabold cursor-pointer">
            Finalizar atendimento
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Atendimentos" subtitle="Serviços efetivamente realizados pela oficina." />
        <button type="button" onClick={() => setMode('new')} className="px-4 py-2 rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer">
          Novo atendimento
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className={inputClass} placeholder="Buscar por cliente, placa ou serviço" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="completed">Concluído</option>
          <option value="open">Aberto</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <p className="text-sm text-slate-500">Nenhum atendimento encontrado.</p> : null}
        {filtered.map((row) => {
          const customer = customers.find((item) => item.id === row.customerId);
          const vehicle = vehicles.find((item) => item.id === row.vehicleId);
          const serviceLines = listAttendanceServices(officeId, row.id);
          return (
            <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-[#0B1E36]">{formatIsoDate(row.date)} · {customer?.name || 'Cliente não informado'}</p>
                <span className="text-xs font-bold">{row.status === 'completed' ? 'Concluído' : 'Aberto'}</span>
              </div>
              <p className="text-slate-600 font-mono">{vehicle?.plate || '—'} · {vehicle?.model || 'modelo'}</p>
              <p className="text-slate-600">{serviceLines.map((line) => line.title).join(', ') || 'Sem serviços'}</p>
              <p className="font-extrabold text-[#0B1E36]">{formatBRL(row.totalAmount ?? 0)}</p>
              {listAttendanceProducts(officeId, row.id).map((line) => (
                <p key={line.id} className="text-xs text-slate-500">{line.quantity} {line.unit || 'un'} · {line.brand ? `${line.brand} ` : ''}{line.name}</p>
              ))}
            </article>
          );
        })}
      </div>
    </section>
  );
};
