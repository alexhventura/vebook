import React from 'react';
import { Car, CheckCircle2, Package, UserRound, Wrench } from 'lucide-react';
import { formatBRL } from '../../../lib/currency';
import { OfficeCustomer, OfficeVehicleRecord } from '../../../types';
import { formatIsoDate, formatKm } from '../shared';

type ServiceLine = { title: string; quantity: string; unitPrice: string };
type ProductLine = { name: string; brand: string; quantity: string; unit: string; unitPrice: string };

interface AttendancePreviewProps {
  vehicle?: OfficeVehicleRecord;
  customer?: OfficeCustomer;
  date: string;
  mileageKm: string;
  services: ServiceLine[];
  products: ProductLine[];
  laborAmount: string;
  notes: string;
  total: number;
  onEditStep?: (step: 'veiculo' | 'cliente' | 'servico' | 'produtos') => void;
}

const PreviewBlock: React.FC<{
  icon: React.ReactNode;
  label: string;
  filled: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}> = ({ icon, label, filled, onEdit, children }) => (
  <div className={`rounded-lg border p-3 space-y-1.5 transition-colors ${filled ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/80'}`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a8863f]">
        {icon}
        <span>{label}</span>
      </div>
      {filled && onEdit ? (
        <button type="button" onClick={onEdit} className="text-[11px] font-bold text-sky-800 cursor-pointer hover:underline">
          Editar
        </button>
      ) : null}
    </div>
    {children}
  </div>
);

export const AttendancePreview: React.FC<AttendancePreviewProps> = ({
  vehicle,
  customer,
  date,
  mileageKm,
  services,
  products,
  laborAmount,
  notes,
  total,
  onEditStep,
}) => {
  const servicesTotal = services.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0),
    0,
  );
  const productsTotal = products.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0),
    0,
  );
  const labor = Number(laborAmount || 0);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 space-y-3 xl:sticky xl:top-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a8863f]">Pré-visualização</p>
        <h3 className="text-base font-extrabold text-[#0B1E36]">Registro em construção</h3>
      </div>

      <PreviewBlock
        icon={<Car className="h-3.5 w-3.5" aria-hidden />}
        label="Veículo"
        filled={Boolean(vehicle)}
        onEdit={onEditStep ? () => onEditStep('veiculo') : undefined}
      >
        {vehicle ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xl font-black tracking-wider text-[#0B1E36] font-mono">{vehicle.plate}</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Identificado
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
              <div><dt className="text-slate-400">Marca / modelo</dt><dd className="font-semibold text-[#0B1E36]">{[vehicle.brand, vehicle.model].filter(Boolean).join(' ') || '—'}</dd></div>
              <div><dt className="text-slate-400">Ano</dt><dd className="font-semibold text-[#0B1E36]">{vehicle.year || '—'}</dd></div>
              <div><dt className="text-slate-400">KM no atendimento</dt><dd className="font-semibold text-[#0B1E36]">{mileageKm ? formatKm(Number(mileageKm)) : formatKm(vehicle.mileageKm)}</dd></div>
              {vehicle.version ? <div className="col-span-2"><dt className="text-slate-400">Versão</dt><dd className="font-semibold text-[#0B1E36]">{vehicle.version}</dd></div> : null}
            </dl>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Informe ou selecione o veículo na primeira etapa.</p>
        )}
      </PreviewBlock>

      <PreviewBlock
        icon={<UserRound className="h-3.5 w-3.5" aria-hidden />}
        label="Cliente"
        filled={Boolean(customer)}
        onEdit={onEditStep ? () => onEditStep('cliente') : undefined}
      >
        {customer ? (
          <div className="space-y-1 text-sm">
            <p className="font-bold text-[#0B1E36]">{customer.name}</p>
            {customer.phone ? <p className="text-xs text-slate-600">{customer.phone}</p> : null}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Opcional. Vincule um cliente na etapa correspondente.</p>
        )}
      </PreviewBlock>

      <PreviewBlock
        icon={<Wrench className="h-3.5 w-3.5" aria-hidden />}
        label="Serviço"
        filled={services.length > 0}
        onEdit={onEditStep ? () => onEditStep('servico') : undefined}
      >
        {services.length > 0 ? (
          <div className="space-y-2 text-xs">
            <p className="text-slate-600">Data: <strong className="text-[#0B1E36]">{formatIsoDate(date)}</strong></p>
            <ul className="space-y-1.5">
              {services.filter((row) => row.title.trim()).map((row, index) => (
                <li key={`${row.title}-${index}`} className="flex justify-between gap-2">
                  <span className="text-slate-700">{row.title}</span>
                  <span className="font-semibold text-[#0B1E36] shrink-0">{formatBRL(Number(row.quantity || 0) * Number(row.unitPrice || 0))}</span>
                </li>
              ))}
            </ul>
            {labor > 0 ? <p className="flex justify-between text-slate-600"><span>Mão de obra</span><strong>{formatBRL(labor)}</strong></p> : null}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Adicione os serviços realizados na etapa de serviço.</p>
        )}
      </PreviewBlock>

      <PreviewBlock
        icon={<Package className="h-3.5 w-3.5" aria-hidden />}
        label="Produtos"
        filled={products.length > 0}
        onEdit={onEditStep ? () => onEditStep('produtos') : undefined}
      >
        {products.length > 0 ? (
          <ul className="space-y-1.5 text-xs">
            {products.filter((row) => row.name.trim()).map((row, index) => (
              <li key={`${row.name}-${index}`} className="flex justify-between gap-2 text-slate-700">
                <span>{row.quantity} {row.unit || 'un'} · {row.brand ? `${row.brand} ` : ''}{row.name}</span>
                <span className="font-semibold text-[#0B1E36] shrink-0">{formatBRL(Number(row.quantity || 0) * Number(row.unitPrice || 0))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">Produtos são opcionais nesta etapa.</p>
        )}
      </PreviewBlock>

      <div className="rounded-lg border border-[#0B1E36]/15 bg-[#0B1E36]/[0.03] p-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Serviços</span>
          <strong className="text-[#0B1E36]">{formatBRL(servicesTotal)}</strong>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Produtos</span>
          <strong className="text-[#0B1E36]">{formatBRL(productsTotal)}</strong>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Mão de obra</span>
          <strong className="text-[#0B1E36]">{formatBRL(labor)}</strong>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-[#0B1E36]">
          <span>Total</span>
          <span>{formatBRL(total)}</span>
        </div>
        {notes ? <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">Obs.: {notes}</p> : null}
      </div>
    </aside>
  );
};
