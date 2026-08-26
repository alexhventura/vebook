import React, { useEffect, useState } from 'react';
import { FileCheck2, Gauge, Search } from 'lucide-react';
import { VEHICLES_MOCK } from '../../data/mockData';
import { AppView, TransparenciaSection, ServiceRecord } from '../../types';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DiarioVeicularViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
  onOpenWorkshopModal?: (workshopId: string) => void;
  onEmitirCertidaoForPlate?: (plate: string) => void;
  onOpenContestacaoModalForRecord?: (record: ServiceRecord) => void;
  onNavigateTransparencia?: (section: TransparenciaSection) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Consulta pública: apenas identificação do veículo + resumo numérico objetivo.
 * O detalhamento completo fica na Certidão (após pagamento).
 */
export const DiarioVeicularView: React.FC<DiarioVeicularViewProps> = ({
  initialPlate = 'BRA2E19',
  onNavigate,
  onEmitirCertidaoForPlate,
  searchInputRef,
}) => {
  const [selectedPlate, setSelectedPlate] = useState(formatPlate(initialPlate) || 'BRA2E19');
  const [inputPlate, setInputPlate] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);

  useEffect(() => {
    const clean = formatPlate(initialPlate);
    if (clean) setSelectedPlate(VEHICLES_MOCK[clean] ? clean : 'BRA2E19');
  }, [initialPlate]);

  const currentVehicle = VEHICLES_MOCK[selectedPlate] || VEHICLES_MOCK['BRA2E19'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida (Mercosul ou tradicional).');
      return;
    }
    setPlateError(null);
    setSelectedPlate(VEHICLES_MOCK[clean] ? clean : 'BRA2E19');
  };

  const emitCertidao = () => {
    if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(currentVehicle.plate);
    onNavigate('certidao');
  };

  const summaryCards = [
    {
      label: 'Total Registrado',
      value: currentVehicle.totalServicesCount,
      hint: 'serviços no histórico',
    },
    {
      label: 'Validados',
      value: currentVehicle.validatedServicesCount,
      hint: 'confirmados por cliente',
    },
    {
      label: 'Contestados',
      value: currentVehicle.contestedServicesCount,
      hint: 'divergência apontada',
    },
    {
      label: 'Aguardando',
      value: currentVehicle.pendingServicesCount,
      hint: 'em prazo de validação',
    },
    {
      label: 'Produtos Cat.',
      value: currentVehicle.identifiedProductsCount,
      hint: `${currentVehicle.identifiedBrandsCount} marcas catalogadas`,
    },
    {
      label: 'Oficinas',
      value: currentVehicle.participatingWorkshopsCount,
      hint: 'estabelecimentos credenciados',
    },
  ] as const;

  return (
    <div className="bg-vebook-surface min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <form
          onSubmit={handleSearchSubmit}
          className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-4 sm:p-5 shadow-vebook flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 space-y-1.5">
            <label htmlFor="diario-plate-input" className="sr-only">
              Placa do veículo
            </label>
            <Input
              id="diario-plate-input"
              ref={searchInputRef}
              value={inputPlate}
              onChange={(e) => {
                setInputPlate(formatPlate(e.target.value));
                if (plateError) setPlateError(null);
              }}
              placeholder="Consultar outra placa (ex.: BRA2E19)"
              maxLength={7}
              autoComplete="off"
              invalid={Boolean(plateError)}
              className="h-12 text-center font-semibold uppercase tracking-widest"
            />
            {plateError && (
              <p className="text-xs text-vebook-error" role="alert">
                {plateError}
              </p>
            )}
          </div>
          <Button type="submit" variant="primary" size="lg" className="sm:self-start">
            <Search className="w-4 h-4" aria-hidden />
            Consultar veículo
          </Button>
        </form>

        <div className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white shadow-vebook overflow-hidden">
          <div className="bg-vebook-navy text-vebook-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-vebook-white text-vebook-navy font-mono font-black text-sm tracking-wider rounded-vebook-sm border border-vebook-mustard/50">
                  {currentVehicle.plate}
                </span>
                <span className="text-xs font-semibold text-vebook-blue-muted bg-vebook-navy-mid px-2.5 py-1 rounded-vebook-sm border border-vebook-mustard/30">
                  Ano {currentVehicle.yearFabrication}/{currentVehicle.yearModel}
                </span>
                <span className="text-xs font-semibold text-vebook-blue-muted bg-vebook-navy-mid px-2.5 py-1 rounded-vebook-sm border border-vebook-mustard/30">
                  {currentVehicle.fuel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-vebook-white">
                {currentVehicle.brand} {currentVehicle.model}{' '}
                <span className="text-vebook-blue-muted text-lg sm:text-xl font-normal block sm:inline">
                  {currentVehicle.version}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-vebook-blue-muted">
                <span>
                  Cor: <strong className="text-vebook-white">{currentVehicle.color}</strong>
                </span>
                <span aria-hidden>•</span>
                <span>
                  Chassi:{' '}
                  <strong className="text-vebook-white font-mono">{currentVehicle.chassisMasked}</strong>
                </span>
                <span aria-hidden>•</span>
                <span>
                  Histórico ativo desde:{' '}
                  <strong className="text-vebook-white">
                    {new Date(currentVehicle.firstRegisteredDate).toLocaleDateString('pt-BR')}
                  </strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <Button type="button" variant="accent" size="lg" onClick={emitCertidao}>
                <FileCheck2 className="w-4 h-4" aria-hidden />
                Emitir Certidão deste Veículo
              </Button>
              <span className="text-[11px] text-vebook-blue-muted">
                Documento nominal com QR Code e autenticidade
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-vebook-surface/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-vebook-mustard/30">
              <div className="flex items-center gap-2 text-xs font-bold text-vebook-navy uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-vebook-mustard-deep" aria-hidden />
                <span>Resumo Objetivo do Diário Veicular</span>
              </div>
              <p className="text-xs text-vebook-muted">
                Última quilometragem registrada:{' '}
                <strong className="text-vebook-navy">
                  {currentVehicle.currentMileageKm.toLocaleString('pt-BR')} KM
                </strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-vebook border border-vebook-mustard/65 bg-vebook-white p-3.5 shadow-vebook transition-all duration-200 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.14)]"
                >
                  <span className="text-[11px] text-vebook-muted font-medium block">{card.label}</span>
                  <span className="text-2xl font-extrabold text-vebook-navy">{card.value}</span>
                  <span className="text-[10px] text-vebook-subtle block mt-0.5">{card.hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
