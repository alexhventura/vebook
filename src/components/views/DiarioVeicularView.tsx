import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  Gauge,
  Building2,
  FileCheck2,
  Filter,
  Info,
  ExternalLink,
  SearchX,
} from 'lucide-react';
import { VEHICLES_MOCK, SERVICES_MOCK, WORKSHOPS_MOCK } from '../../data/mockData';
import { AppView, ServiceRecord, TransparenciaSection, ValidationStatus } from '../../types';
import { PATHS } from '../../lib/paths';
import { SAMPLE_PLATES } from '../../lib/copy';
import { useConsulta } from '../../hooks/useConsulta';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Breadcrumb } from '../ui/Breadcrumb';

interface DiarioVeicularViewProps {
  onNavigate: (view: AppView) => void;
  onEmitirCertidaoForPlate?: (plate: string) => void;
  onOpenContestacaoModalForRecord?: (record: ServiceRecord) => void;
  onNavigateTransparencia?: (section: TransparenciaSection) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  initialPlate?: string;
  onPlateFound?: (plate: string) => void;
}

export const DiarioVeicularView: React.FC<DiarioVeicularViewProps> = ({
  onNavigate,
  onEmitirCertidaoForPlate,
  onOpenContestacaoModalForRecord,
  searchInputRef,
  initialPlate,
  onPlateFound,
}) => {
  const consulta = useConsulta(initialPlate ?? '');
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ValidationStatus | 'all'>('all');
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialPlate) {
      consulta.runLookup(initialPlate, (clean) => {
        setSelectedPlate(clean);
        setFilterStatus('all');
        onPlateFound?.(clean);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consulta inicial apenas quando a placa de origem muda
  }, [initialPlate]);

  const currentVehicle = selectedPlate ? VEHICLES_MOCK[selectedPlate] : undefined;
  const allServices = selectedPlate ? SERVICES_MOCK[selectedPlate] ?? [] : [];

  const toggleExpand = (id: string) => {
    setExpandedRecordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredServices = allServices.filter((service) =>
    filterStatus === 'all' ? true : service.validationStatus === filterStatus
  );

  const emitCertidao = () => {
    if (!currentVehicle) return;
    if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(currentVehicle.plate);
    else onNavigate('certidao');
  };

  return (
    <div className="bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Breadcrumb
          items={[
            { label: 'VEBOOK', to: PATHS.home },
            { label: 'Consultar veículo', to: PATHS.consultar },
            ...(selectedPlate ? [{ label: selectedPlate }] : []),
          ]}
        />

        <Card>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1E36] sm:text-3xl">
              Consultar veículo
            </h1>
            <p className="text-base text-slate-600">
              Informe a placa para ver identificação, histórico de manutenção e ações disponíveis.
            </p>
          </div>

          <form
            onSubmit={(e) =>
              consulta.handleSubmit(e, (clean) => {
                setSelectedPlate(clean);
                setFilterStatus('all');
                onPlateFound?.(clean);
              })
            }
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <Input
              ref={searchInputRef}
              id="consulta-placa"
              name="placa"
              label="Placa"
              value={consulta.plate}
              onChange={(e) => consulta.handlePlateChange(e.target.value)}
              placeholder="ABC1D23"
              maxLength={7}
              autoComplete="off"
              spellCheck={false}
              className="font-mono uppercase tracking-widest"
              error={consulta.errorMessage || undefined}
              hint={!consulta.errorMessage ? 'Mercosul (ABC1D23) ou tradicional (ABC1234).' : undefined}
            />
            <Button type="submit" size="lg" loading={consulta.isLoading} className="sm:mb-0.5">
              <Search className="h-4 w-4" aria-hidden />
              Consultar veículo
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>Placas de exemplo:</span>
            {SAMPLE_PLATES.map((item) => (
              <button
                key={item.plate}
                type="button"
                onClick={() => {
                  consulta.handlePlateChange(item.plate);
                  consulta.runLookup(item.plate, (clean) => {
                    setSelectedPlate(clean);
                    setFilterStatus('all');
                    onPlateFound?.(clean);
                  });
                }}
                className={`rounded-md border px-2.5 py-1 font-medium ${
                  selectedPlate === item.plate
                    ? 'border-[#0B1E36] bg-[#0B1E36] text-white'
                    : 'border-slate-200 bg-slate-50 text-[#0B1E36] hover:border-slate-400'
                }`}
              >
                {item.label} · {item.plate}
              </button>
            ))}
          </div>
        </Card>

        {consulta.isLoading && <LoadingState label="Carregando informações..." />}

        {consulta.outcome === 'not_found' && (
          <EmptyState
            icon={<SearchX className="h-6 w-6" aria-hidden />}
            title="Não encontramos um veículo correspondente à consulta."
            description="Confira a placa e tente novamente. Nesta versão, apenas as placas de exemplo possuem histórico disponível."
          />
        )}

        {currentVehicle && consulta.outcome === 'found' && (
          <Card padding="none">
            <div className="space-y-8 p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Veículo</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-sm font-bold tracking-wider text-[#0B1E36]">
                      {currentVehicle.plate}
                    </span>
                    <span className="text-sm text-slate-500">
                      {currentVehicle.yearFabrication}/{currentVehicle.yearModel}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B1E36]">
                    {currentVehicle.brand} {currentVehicle.model}
                  </h2>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Versão</dt>
                      <dd className="font-medium text-[#0B1E36]">{currentVehicle.version}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Ano</dt>
                      <dd className="font-medium text-[#0B1E36]">
                        {currentVehicle.yearFabrication}/{currentVehicle.yearModel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Identificação</dt>
                      <dd className="font-mono font-medium text-[#0B1E36]">{currentVehicle.chassisMasked}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Combustível</dt>
                      <dd className="font-medium text-[#0B1E36]">{currentVehicle.fuel}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Cor</dt>
                      <dd className="font-medium text-[#0B1E36]">{currentVehicle.color}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Quilometragem</dt>
                      <dd className="font-medium text-[#0B1E36]">
                        {currentVehicle.currentMileageKm.toLocaleString('pt-BR')} km
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="shrink-0 space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ações</p>
                  <Button onClick={emitCertidao}>
                    <FileCheck2 className="h-4 w-4" aria-hidden />
                    Emitir certidão
                  </Button>
                  <p className="max-w-xs text-sm text-slate-500">
                    A certidão consolida o histórico disponível até o momento da emissão.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryStat label="Registros" value={currentVehicle.totalServicesCount} />
                <SummaryStat label="Validados" value={currentVehicle.validatedServicesCount} />
                <SummaryStat label="Contestados" value={currentVehicle.contestedServicesCount} />
                <SummaryStat label="Oficinas" value={currentVehicle.participatingWorkshopsCount} />
              </div>

              <Alert>
                A VEBOOK apresenta os registros informados pelas oficinas e a situação de validação pelo cliente.
                Não atribui nota ao veículo e não consulta bases de trânsito.
              </Alert>
            </div>

            <div className="border-t border-slate-200 p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B1E36]">Histórico</h3>
                  <p className="text-sm text-slate-500">
                    Data, serviço, quilometragem, oficina, situação e origem.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por situação">
                  <span className="mr-1 flex items-center gap-1 text-sm font-semibold text-slate-500">
                    <Filter className="h-3.5 w-3.5" aria-hidden /> Situação
                  </span>
                  {(
                    [
                      ['all', `Todos (${allServices.length})`],
                      ['validado', 'Validados'],
                      ['contestado', 'Contestados'],
                      ['aguardando', 'Aguardando'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilterStatus(value)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        filterStatus === value
                          ? 'bg-[#0B1E36] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredServices.length === 0 ? (
                <EmptyState
                  title="Nenhum registro de manutenção encontrado."
                  description="Não há registros para os filtros selecionados."
                  action={
                    <Button variant="secondary" onClick={() => setFilterStatus('all')}>
                      Limpar filtros
                    </Button>
                  }
                />
              ) : (
                <ol className="relative space-y-6 border-l border-slate-200 pl-6 sm:ml-2">
                  {filteredServices.map((record) => {
                    const isExpanded = expandedRecordIds[record.id] ?? false;
                    return (
                      <li key={record.id} className="relative">
                        <span
                          className={`absolute -left-[31px] top-2 h-3.5 w-3.5 rounded-full border-2 border-white ${
                            record.validationStatus === 'validado'
                              ? 'bg-emerald-600'
                              : record.validationStatus === 'contestado'
                                ? 'bg-rose-600'
                                : record.validationStatus === 'aguardando'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                          }`}
                          aria-hidden
                        />
                        <article className="rounded-xl border border-slate-200 bg-white">
                          <header className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-1 font-medium text-[#0B1E36]">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                                  {new Date(record.serviceDate).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Gauge className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                                  {record.mileageKm.toLocaleString('pt-BR')} km
                                </span>
                                <span>{record.serviceType}</span>
                              </div>
                              <h4 className="text-base font-semibold text-[#0B1E36]">{record.description}</h4>
                              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                                <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                                <WorkshopName workshopId={record.workshopId} name={record.workshopName} />
                                <span className="text-slate-400">
                                  {record.workshopCity} — {record.workshopState}
                                </span>
                                {record.internalOsNumber && (
                                  <span className="font-mono text-xs text-slate-500">{record.internalOsNumber}</span>
                                )}
                              </p>
                              <p className="text-sm text-slate-500">
                                Origem: registro da oficina
                                {record.maskedValidatorName ? ` · validado por ${record.maskedValidatorName}` : ''}
                              </p>
                            </div>
                            <StatusBadge status={record.validationStatus} />
                          </header>

                          <div className="space-y-4 p-4 sm:p-5">
                            {record.contestation && (
                              <Alert tone="warning" title={record.contestation.reasonLabel}>
                                <p>“{record.contestation.comment}”</p>
                                <p className="mt-1 text-slate-600">
                                  Registrado por {record.contestation.maskedClientIdentifier} em{' '}
                                  {new Date(record.contestation.contestedAt).toLocaleDateString('pt-BR')}.
                                </p>
                              </Alert>
                            )}

                            <div>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                  <Package className="h-4 w-4 text-slate-400" aria-hidden />
                                  {record.products.length} produto{record.products.length === 1 ? '' : 's'} aplicado{record.products.length === 1 ? '' : 's'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(record.id)}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0B1E36]"
                                  aria-expanded={isExpanded}
                                >
                                  {isExpanded ? 'Recolher' : 'Ver detalhes'}
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                              </div>
                              {isExpanded && (
                                <ul className="grid gap-2 md:grid-cols-2">
                                  {record.products.map((prod) => (
                                    <li key={prod.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-[#0B1E36]">{prod.brand}</span>
                                        <span className="text-slate-500">
                                          {prod.quantity} {prod.unit}
                                        </span>
                                      </div>
                                      <p className="mt-1 font-medium">{prod.commercialName}</p>
                                      {prod.specification && (
                                        <p className="mt-1 text-slate-600">{prod.specification}</p>
                                      )}
                                      {prod.productCode && (
                                        <p className="mt-1 font-mono text-xs text-slate-500">{prod.productCode}</p>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {record.observations && (
                              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                <span className="font-semibold text-slate-700">Observações: </span>
                                {record.observations}
                              </p>
                            )}

                            <div className="flex justify-end border-t border-slate-100 pt-3">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onOpenContestacaoModalForRecord?.(record)}
                              >
                                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                                Contestar registro
                              </Button>
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </Card>
        )}

        {!selectedPlate && consulta.outcome === 'idle' && (
          <Alert>
            <span className="inline-flex items-center gap-2">
              <Info className="h-4 w-4" aria-hidden />
              Consulte uma placa para ver o histórico. Use uma das placas de exemplo para percorrer o fluxo completo.
            </span>
          </Alert>
        )}
      </div>
    </div>
  );
};

const SummaryStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-[#0B1E36]">{value}</p>
  </div>
);

function workshopHref(workshopId: string): string | null {
  const workshop = WORKSHOPS_MOCK.find((item) => item.id === workshopId);
  if (!workshop) return null;
  return PATHS.oficina(workshop.subdomain.split('.')[0]);
}

const WorkshopName: React.FC<{ workshopId: string; name: string }> = ({ workshopId, name }) => {
  const href = workshopHref(workshopId);
  if (!href) {
    return <span className="font-semibold text-[#0B1E36]">{name}</span>;
  }
  return (
    <Link to={href} className="inline-flex items-center gap-1 font-semibold text-[#0B1E36] hover:underline">
      {name}
      <ExternalLink className="h-3 w-3" aria-hidden />
    </Link>
  );
};
