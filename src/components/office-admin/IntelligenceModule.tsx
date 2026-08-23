import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';
import { queryMarketIntelligence } from '../../office/repository';
import { useOfficeSnapshot } from '../../office/useOfficeSnapshot';
import { IntelligenceQuery } from '../../office/intelligence';
import { PeriodPreset, rangeForPreset } from '../../office/period';
import { SERVICE_CATEGORY_LABELS, ServiceCategory } from '../../office/types';
import { BarChart } from './shared';

export const IntelligenceModule: React.FC = () => {
  useOfficeSnapshot();
  const [form, setForm] = useState<IntelligenceQuery>({});
  const [preset, setPreset] = useState<PeriodPreset>('year');
  const [submitted, setSubmitted] = useState<IntelligenceQuery | null>(null);

  const result = submitted ? queryMarketIntelligence({ ...submitted, range: rangeForPreset(preset) }) : null;

  const search = () => {
    setSubmitted({ ...form });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1E36]">Inteligência de Mercado</h1>
        <p className="text-sm text-slate-600">Agregados anonimizados do ecossistema VEBOOK — sem identificação de oficinas ou clientes.</p>
      </div>

      <Alert tone="info" title="Transparência">
        O VEBOOK apenas apresenta os dados registrados em sua plataforma. Não recomenda, aprova, reprova nem certifica produtos, prazos ou práticas.
      </Alert>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-[#0B1E36]">Filtros de consulta</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input id="iq-brand" label="Marca do veículo" value={form.brand ?? ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <Input id="iq-model" label="Modelo" value={form.model ?? ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <Input id="iq-year" label="Ano" value={form.year != null ? String(form.year) : ''} onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })} />
          <Input id="iq-pq" label="Produto (busca)" value={form.productQuery ?? ''} onChange={(e) => setForm({ ...form, productQuery: e.target.value })} />
          <Input id="iq-pb" label="Marca do produto" value={form.productBrand ?? ''} onChange={(e) => setForm({ ...form, productBrand: e.target.value })} />
          <Input id="iq-cat" label="Categoria do produto" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Select id="iq-svc" label="Categoria de serviço" value={form.serviceCategory ?? ''} onChange={(e) => setForm({ ...form, serviceCategory: (e.target.value || undefined) as ServiceCategory | undefined })}>
            <option value="">Todas</option>
            {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select id="iq-period" label="Período" value={preset} onChange={(e) => setPreset(e.target.value as PeriodPreset)}>
            <option value="30d">Últimos 30 dias</option>
            <option value="year">Este ano</option>
            <option value="all">Todo o período</option>
          </Select>
        </div>
        <Button className="mt-4" onClick={search}>Consultar</Button>
      </section>

      {result && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            Amostra: {result.sampleSize} atendimento(s) · {result.message}
          </p>
          {!result.sufficient ? (
            <Alert tone="warning">Dados insuficientes para exibição consolidada.</Alert>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <ShareChart title="Produtos (participação)" items={result.products} />
              <ShareChart title="Marcas de produto" items={result.productBrands} />
              <ShareChart title="Marcas de veículo" items={result.vehicleBrands} />
              <ShareChart title="Modelos" items={result.vehicleModels} />
              <ShareChart title="Anos" items={result.vehicleYears} />
              <ShareChart title="Serviços" items={result.services} />
              <ShareChart title="Categorias de serviço" items={result.serviceCategories} />
              <ShareChart title="Janelas de retorno" items={result.returnWindows} />
            </div>
          )}
          <p className="text-xs text-slate-500">{result.disclaimer}</p>
        </section>
      )}
    </div>
  );
};

const ShareChart: React.FC<{ title: string; items: Array<{ label: string; count: number; share: number }> }> = ({ title, items }) => (
  <BarChart
    title={title}
    items={items.map((item) => ({
      label: `${item.label} (${(item.share * 100).toFixed(1)}%)`,
      value: item.count,
    }))}
  />
);
