import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  createAttendance,
  listCustomers,
  listProductCatalog,
  listServiceCatalog,
  listVehicles,
  upsertCustomer,
  upsertVehicle,
} from '../../../data/officeStore';
import { useOfficeStore } from '../../../hooks/useOfficeStore';
import { formatBRL } from '../../../lib/currency';
import { formatPhone } from '../../../lib/phone';
import { onlyDigits } from '../../../lib/cpf';
import { formatPlate } from '../../../lib/utils';
import { Field, inputClass } from '../../ui/Field';
import { CommunicationNotice } from '../shared';
import { AttendancePreview } from './AttendancePreview';
import { ATTENDANCE_STEPS, AttendanceStepper, type AttendanceWizardStep } from './AttendanceStepper';

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

interface NovoAtendimentoWizardProps {
  officeId: string;
  onBack: () => void;
  onFinished: () => void;
}

const stepIndex = (step: AttendanceWizardStep) => ATTENDANCE_STEPS.findIndex((item) => item.id === step);

export const NovoAtendimentoWizard: React.FC<NovoAtendimentoWizardProps> = ({
  officeId,
  onBack,
  onFinished,
}) => {
  useOfficeStore();
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const serviceCatalog = listServiceCatalog(officeId).filter((row) => row.status === 'active');
  const productCatalog = listProductCatalog(officeId).filter((row) => row.status === 'active');

  const [currentStep, setCurrentStep] = useState<AttendanceWizardStep>('veiculo');
  const [completedSteps, setCompletedSteps] = useState<Set<AttendanceWizardStep>>(new Set());
  const [stepError, setStepError] = useState('');

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
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newVehicleMileage, setNewVehicleMileage] = useState('');

  const selectedVehicle = vehicles.find((row) => row.id === vehicleId);
  const selectedCustomer = customers.find((row) => row.id === customerId);
  const customerVehicles = vehicles.filter((row) => !customerId || row.customerId === customerId);

  const servicesTotal = services.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);
  const productsTotal = products.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);
  const labor = Number(laborAmount || 0);
  const total = servicesTotal + productsTotal + labor;

  const knownPlate = useMemo(() => {
    const plate = formatPlate(newPlate);
    if (!plate) return null;
    return vehicles.find((row) => formatPlate(row.plate) === plate) ?? null;
  }, [newPlate, vehicles]);

  const applyKnownVehicle = (vehicle: typeof selectedVehicle) => {
    if (!vehicle) return;
    setVehicleId(vehicle.id);
    setNewPlate(vehicle.plate);
    setNewBrand(vehicle.brand || '');
    setNewModel(vehicle.model || '');
    setNewYear(vehicle.year ? String(vehicle.year) : '');
    setNewVehicleMileage(vehicle.mileageKm ? String(vehicle.mileageKm) : '');
    if (vehicle.customerId) setCustomerId(vehicle.customerId);
    if (vehicle.mileageKm && !mileageKm) setMileageKm(String(vehicle.mileageKm));
    setQuickVehicle(false);
  };

  const validateStep = (step: AttendanceWizardStep): string => {
    if (step === 'veiculo') {
      if (vehicleId) return '';
      if (!newPlate.trim()) return 'Informe a placa ou selecione um veículo cadastrado.';
      return '';
    }
    if (step === 'cliente') return '';
    if (step === 'servico') {
      if (!date) return 'Informe a data do atendimento.';
      if (services.length === 0 || !services.some((row) => row.title.trim())) {
        return 'Adicione ao menos um serviço realizado.';
      }
      return '';
    }
    if (step === 'produtos') return '';
    if (step === 'resumo') {
      if (!date || services.length === 0) return 'Complete as etapas anteriores antes de finalizar.';
      return '';
    }
    return '';
  };

  const persistVehicleIfNeeded = (): boolean => {
    if (vehicleId) return true;
    if (!newPlate.trim()) return false;
    const created = upsertVehicle(officeId, {
      plate: formatPlate(newPlate),
      brand: newBrand,
      model: newModel,
      year: newYear ? Number(newYear) : undefined,
      mileageKm: newVehicleMileage ? Number(newVehicleMileage) : undefined,
      customerId: customerId || undefined,
    });
    setVehicleId(created.id);
    if (created.mileageKm && !mileageKm) setMileageKm(String(created.mileageKm));
    return true;
  };

  const markCompleted = (step: AttendanceWizardStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const goToStep = (step: AttendanceWizardStep) => {
    const target = stepIndex(step);
    const current = stepIndex(currentStep);
    if (target > current && !completedSteps.has(currentStep)) return;
    setStepError('');
    setCurrentStep(step);
  };

  const continueStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError('');

    if (currentStep === 'veiculo') {
      if (!vehicleId && !persistVehicleIfNeeded()) return;
    }

    markCompleted(currentStep);
    const next = ATTENDANCE_STEPS[stepIndex(currentStep) + 1];
    if (next) setCurrentStep(next.id);
  };

  const finish = () => {
    const error = validateStep('resumo');
    if (error) {
      setStepError(error);
      return;
    }
    if (!vehicleId && !persistVehicleIfNeeded()) return;
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
    onFinished();
  };

  const stepNumber = stepIndex(currentStep) + 1;
  const stepMeta = ATTENDANCE_STEPS[stepIndex(currentStep)];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a8863f]">Novo atendimento</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1E36]">Registrar serviço realizado</h2>
          <p className="text-sm text-slate-600">Nenhuma mensagem é enviada ao cliente.</p>
        </div>
        <button type="button" onClick={onBack} className="text-sm font-bold text-sky-800 cursor-pointer">
          Voltar
        </button>
      </div>

      <CommunicationNotice />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <AttendanceStepper current={currentStep} completed={completedSteps} onNavigate={goToStep} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] gap-5 items-start">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 lg:p-7 shadow-sm space-y-5 min-h-[28rem]">
          <header className="space-y-1 border-b border-slate-100 pb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a8863f]">Etapa {stepNumber}</p>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0B1E36]">{stepMeta.label}</h3>
            <p className="text-sm text-slate-600">{stepMeta.hint}</p>
          </header>

          {currentStep === 'veiculo' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Veículo cadastrado">
                  <select
                    className={inputClass}
                    value={vehicleId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setVehicleId(nextId);
                      const vehicle = vehicles.find((row) => row.id === nextId);
                      if (vehicle) {
                        setNewPlate(vehicle.plate);
                        setNewBrand(vehicle.brand || '');
                        setNewModel(vehicle.model || '');
                        setNewYear(vehicle.year ? String(vehicle.year) : '');
                        if (vehicle.mileageKm) setMileageKm(String(vehicle.mileageKm));
                        if (vehicle.customerId) setCustomerId(vehicle.customerId);
                      }
                    }}
                  >
                    <option value="">Selecionar veículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} · {vehicle.model || vehicle.brand || 'modelo'}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setQuickVehicle((value) => !value)}
                    className="text-sm font-bold text-sky-800 cursor-pointer"
                  >
                    + Novo veículo
                  </button>
                </div>
              </div>

              {quickVehicle || !vehicleId ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                  {knownPlate && !vehicleId ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                      <span>Placa já cadastrada: <strong>{knownPlate.plate}</strong> · {[knownPlate.brand, knownPlate.model].filter(Boolean).join(' ')}</span>
                      <button type="button" onClick={() => applyKnownVehicle(knownPlate)} className="text-xs font-bold text-emerald-800 cursor-pointer underline">
                        Usar dados existentes
                      </button>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Placa">
                      <input
                        className={`${inputClass} uppercase`}
                        placeholder="ABC1D23"
                        value={newPlate}
                        onChange={(e) => setNewPlate(e.target.value)}
                        onBlur={() => {
                          if (knownPlate && !vehicleId) applyKnownVehicle(knownPlate);
                        }}
                      />
                    </Field>
                    <Field label="Marca" optional>
                      <input className={inputClass} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
                    </Field>
                    <Field label="Modelo" optional>
                      <input className={inputClass} value={newModel} onChange={(e) => setNewModel(e.target.value)} />
                    </Field>
                    <Field label="Ano" optional>
                      <input className={inputClass} type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
                    </Field>
                    <Field label="Quilometragem atual" optional>
                      <input className={inputClass} type="number" min={0} value={newVehicleMileage} onChange={(e) => setNewVehicleMileage(e.target.value)} />
                    </Field>
                  </div>
                  {quickVehicle ? (
                    <button
                      type="button"
                      className="rounded-xl bg-[#0B1E36] text-white text-sm font-bold px-4 py-2.5 cursor-pointer"
                      onClick={() => {
                        if (!newPlate.trim()) return;
                        const created = upsertVehicle(officeId, {
                          plate: formatPlate(newPlate),
                          brand: newBrand,
                          model: newModel,
                          year: newYear ? Number(newYear) : undefined,
                          mileageKm: newVehicleMileage ? Number(newVehicleMileage) : undefined,
                          customerId: customerId || undefined,
                        });
                        setVehicleId(created.id);
                        if (created.mileageKm) setMileageKm(String(created.mileageKm));
                        setQuickVehicle(false);
                      }}
                    >
                      Salvar veículo
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {currentStep === 'cliente' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Cliente">
                  <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                    <option value="">Selecionar cliente</option>
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </select>
                </Field>
                <div className="flex items-end">
                  <button type="button" onClick={() => setQuickCustomer((value) => !value)} className="text-sm font-bold text-sky-800 cursor-pointer">
                    + Novo cliente
                  </button>
                </div>
              </div>
              {quickCustomer ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input className={inputClass} placeholder="Nome completo" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
                  <input className={inputClass} placeholder="Telefone" value={formatPhone(newCustomerPhone)} onChange={(e) => setNewCustomerPhone(onlyDigits(e.target.value))} />
                  <button
                    type="button"
                    className="rounded-xl bg-[#0B1E36] text-white text-sm font-bold cursor-pointer"
                    onClick={() => {
                      if (!newCustomerName.trim()) return;
                      const created = upsertCustomer(officeId, { name: newCustomerName, phone: newCustomerPhone, whatsapp: newCustomerPhone });
                      setCustomerId(created.id);
                      if (vehicleId) {
                        const vehicle = vehicles.find((row) => row.id === vehicleId);
                        if (vehicle) upsertVehicle(officeId, { ...vehicle, customerId: created.id, id: vehicle.id });
                      }
                      setNewCustomerName('');
                      setNewCustomerPhone('');
                      setQuickCustomer(false);
                    }}
                  >
                    Salvar cliente
                  </button>
                </div>
              ) : null}
              {vehicleId && customerVehicles.length > 0 ? (
                <p className="text-xs text-slate-500">Veículos vinculados ao cliente selecionado aparecem na etapa de veículo.</p>
              ) : null}
            </div>
          ) : null}

          {currentStep === 'servico' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data do atendimento">
                  <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Quilometragem" optional>
                  <input className={inputClass} type="number" min={0} value={mileageKm} onChange={(e) => setMileageKm(e.target.value)} />
                </Field>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-extrabold text-[#0B1E36]">Serviços</h4>
                  <select
                    className={`${inputClass} max-w-xs`}
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
                  <div key={`${row.catalogServiceId || 'svc'}-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input className={inputClass} placeholder="Descrição" value={row.title} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} />
                    <input className={inputClass} type="number" placeholder="Qtd" value={row.quantity} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} />
                    <input className={inputClass} type="number" placeholder="Valor" value={row.unitPrice} onChange={(e) => setServices((prev) => prev.map((item, i) => i === index ? { ...item, unitPrice: e.target.value } : item))} />
                    <button type="button" className="text-xs font-bold text-rose-700 cursor-pointer self-center text-left" onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}>Remover</button>
                  </div>
                ))}
              </div>

              <Field label="Mão de obra">
                <input className={inputClass} type="number" min={0} value={laborAmount} onChange={(e) => setLaborAmount(e.target.value)} />
              </Field>
            </div>
          ) : null}

          {currentStep === 'produtos' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-extrabold text-[#0B1E36]">Produtos</h4>
                <select
                  className={`${inputClass} max-w-xs`}
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
              {products.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum produto adicionado. Esta etapa é opcional — continue quando quiser.</p>
              ) : null}
              {products.map((row, index) => (
                <div key={`${row.catalogProductId || 'prd'}-${index}`} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <input className={inputClass} placeholder="Produto" value={row.name} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                  <input className={inputClass} placeholder="Marca" value={row.brand} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, brand: e.target.value } : item))} />
                  <input className={inputClass} type="number" placeholder="Qtd" value={row.quantity} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, quantity: e.target.value } : item))} />
                  <input className={inputClass} placeholder="Unidade" value={row.unit} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, unit: e.target.value } : item))} />
                  <input className={inputClass} type="number" placeholder="Valor unit." value={row.unitPrice} onChange={(e) => setProducts((prev) => prev.map((item, i) => i === index ? { ...item, unitPrice: e.target.value } : item))} />
                </div>
              ))}
            </div>
          ) : null}

          {currentStep === 'resumo' ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm space-y-2">
                <p><span className="text-slate-500">Veículo:</span> <strong>{selectedVehicle?.plate || formatPlate(newPlate) || '—'}</strong></p>
                <p><span className="text-slate-500">Cliente:</span> <strong>{selectedCustomer?.name || 'Não informado'}</strong></p>
                <p><span className="text-slate-500">Data:</span> <strong>{date}</strong></p>
                <p><span className="text-slate-500">Serviços:</span> <strong>{services.filter((row) => row.title.trim()).map((row) => row.title).join(', ') || '—'}</strong></p>
              </div>

              <Field label="Observações" optional>
                <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="font-extrabold text-[#0B1E36]">Retorno (controle interno)</h4>
                <p className="text-xs text-slate-600">Opcional. O VEBOOK não avisa o cliente.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input className={inputClass} type="date" value={returnDueDate} onChange={(e) => setReturnDueDate(e.target.value)} />
                  <input className={inputClass} type="number" placeholder="Quilometragem prevista" value={returnKm} onChange={(e) => setReturnKm(e.target.value)} />
                  <input className={inputClass} placeholder="Observação do retorno" value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 text-sm space-y-1">
                <p className="flex justify-between"><span>Serviços</span><strong>{formatBRL(servicesTotal)}</strong></p>
                <p className="flex justify-between"><span>Produtos</span><strong>{formatBRL(productsTotal)}</strong></p>
                <p className="flex justify-between"><span>Mão de obra</span><strong>{formatBRL(labor)}</strong></p>
                <p className="flex justify-between border-t border-slate-200 pt-2 text-base"><span>Total</span><strong>{formatBRL(total)}</strong></p>
              </div>
            </div>
          ) : null}

          {stepError ? <p className="text-sm text-rose-700 font-semibold" role="alert">{stepError}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            {stepIndex(currentStep) > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(ATTENDANCE_STEPS[stepIndex(currentStep) - 1].id)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 cursor-pointer hover:text-[#0B1E36]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Etapa anterior
              </button>
            ) : (
              <span />
            )}

            {currentStep === 'resumo' ? (
              <button type="button" onClick={finish} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B1E36] text-white font-extrabold text-sm cursor-pointer hover:bg-[#132c4d]">
                Finalizar atendimento
              </button>
            ) : (
              <button
                type="button"
                onClick={continueStep}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B1E36] text-white font-extrabold text-sm cursor-pointer hover:bg-[#132c4d]"
              >
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        <AttendancePreview
          vehicle={selectedVehicle}
          customer={selectedCustomer}
          date={date}
          mileageKm={mileageKm}
          services={services}
          products={products}
          laborAmount={laborAmount}
          notes={notes}
          total={total}
          currentStep={currentStep}
          onEditStep={(step) => goToStep(step)}
        />
      </div>
    </section>
  );
};
