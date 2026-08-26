import React, { useEffect, useState } from 'react';
import { ChevronDown, FileCheck2, Gauge, Search } from 'lucide-react';
import { AppView } from '../../types';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { getPublicHistory, getPublicVehicle } from '../../lib/historyLayers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DiarioVeicularViewProps {
  initialPlate?: string;
  /** Entrada via QR no vidro (#/diario/PLACA) — layout compacto, serviços em destaque */
  fromQrLink?: boolean;
  onNavigate: (view: AppView) => void;
  onEmitirCertidaoForPlate?: (plate: string) => void;
  onConsultaPlate?: (plate: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

function formatServiceDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatKm(km: number): string {
  return `${km.toLocaleString('pt-BR')} km`;
}

function ConsultaServiceCard({
  serviceDate,
  serviceType,
  mileageKm,
  workshopName,
  workshopCity,
  workshopState,
}: {
  serviceDate: string;
  serviceType: string;
  mileageKm: number;
  workshopName: string;
  workshopCity: string;
  workshopState: string;
}) {
  return (
    <article className="consulta-service-card rounded-vebook border-2 border-vebook-blue bg-vebook-white px-4 py-4 sm:px-5 sm:py-4">
      <div className="flex items-end justify-between gap-3 mb-2">
        <p className="text-xl sm:text-2xl font-extrabold text-vebook-navy tabular-nums leading-none">
          {formatServiceDate(serviceDate)}
        </p>
        <p className="flex items-center gap-1 text-lg sm:text-xl font-extrabold text-vebook-blue tabular-nums leading-none shrink-0">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" aria-hidden />
          {formatKm(mileageKm)}
        </p>
      </div>
      <p className="text-base sm:text-lg font-bold text-vebook-navy tracking-tight leading-snug">
        {serviceType}
      </p>
      <p className="mt-1.5 text-xs sm:text-sm text-vebook-muted leading-relaxed">
        {workshopName}
        <span className="text-vebook-subtle">
          {' '}
          · {workshopCity}/{workshopState}
        </span>
      </p>
    </article>
  );
}

/**
 * CONSULTA VEBOOK — gratuita, mobile-first.
 * Uso típico: QR no vidro (troca de óleo) → data e km visíveis de imediato.
 */
export const DiarioVeicularView: React.FC<DiarioVeicularViewProps> = ({
  initialPlate = 'BRA2E19',
  fromQrLink = false,
  onNavigate,
  onEmitirCertidaoForPlate,
  onConsultaPlate,
  searchInputRef,
}) => {
  const [selectedPlate, setSelectedPlate] = useState(formatPlate(initialPlate) || 'BRA2E19');
  const [inputPlate, setInputPlate] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(!fromQrLink);

  useEffect(() => {
    const clean = formatPlate(initialPlate);
    if (clean) setSelectedPlate(getPublicVehicle(clean) ? clean : 'BRA2E19');
  }, [initialPlate]);

  useEffect(() => {
    setSearchOpen(!fromQrLink);
  }, [fromQrLink]);

  const vehicle = getPublicVehicle(selectedPlate) || getPublicVehicle('BRA2E19')!;
  const history = getPublicHistory(vehicle.plate);

  const applyPlate = (clean: string) => {
    const resolved = getPublicVehicle(clean) ? clean : 'BRA2E19';
    setSelectedPlate(resolved);
    onConsultaPlate?.(resolved);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida (Mercosul ou tradicional).');
      return;
    }
    setPlateError(null);
    applyPlate(clean);
    setSearchOpen(false);
  };

  const emitCertidao = () => {
    if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(vehicle.plate);
    onNavigate('certidao');
  };

  return (
    <div className="bg-vebook-surface min-h-screen pb-8 sm:py-10 sm:px-6 lg:px-8">
      {/* Cabeçalho fixo no mobile — placa e veículo sempre visíveis ao rolar */}
      <div className="sticky top-0 z-20 border-b border-vebook-border bg-vebook-surface/95 backdrop-blur-sm sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-3 sm:px-0 sm:pt-0 sm:pb-0 space-y-3">
          {!fromQrLink ? (
            <div className="space-y-2 sm:space-y-3 text-left">
              <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-vebook-mustard-deep border border-vebook-mustard/50 rounded-vebook-sm px-2.5 py-1 bg-vebook-mustard-soft/60">
                Consulta gratuita
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-vebook-navy">
                Histórico VEBOOK
              </h1>
              <p className="text-sm text-vebook-muted leading-relaxed max-w-2xl hidden sm:block">
                Registros de serviços realizados neste veículo.
              </p>
            </div>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-vebook-blue">
              Consulta VEBOOK · QR
            </p>
          )}

          <div className="rounded-vebook-lg border border-vebook-border bg-vebook-white px-4 py-3 sm:p-6">
            <p className="font-mono text-lg sm:text-sm font-extrabold text-vebook-navy tracking-wider">
              {vehicle.plate}
            </p>
            <p className="text-sm sm:text-base font-semibold text-vebook-navy mt-0.5">
              {vehicle.brand} {vehicle.model}{' '}
              <span className="text-vebook-muted font-normal">{vehicle.version}</span>
            </p>
            <p className="text-xs text-vebook-muted mt-0.5 hidden sm:block">
              {vehicle.yearFabrication}/{vehicle.yearModel} · {vehicle.fuel} · {vehicle.color}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-5 sm:space-y-8 mt-4 sm:mt-0">
        {/* Busca recolhível no mobile (QR) — não compete com data/km */}
        <div className="sm:block">
          {fromQrLink ? (
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="w-full flex items-center justify-between gap-2 rounded-vebook border border-vebook-border bg-vebook-white px-4 py-3 text-sm font-semibold text-vebook-navy cursor-pointer sm:hidden"
              aria-expanded={searchOpen}
            >
              Consultar outra placa
              <ChevronDown
                className={`w-4 h-4 text-vebook-muted transition-transform ${searchOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          ) : null}

          {(searchOpen || !fromQrLink) && (
            <form
              onSubmit={handleSearchSubmit}
              className={`rounded-vebook-lg border border-vebook-mustard/50 bg-vebook-white p-4 flex flex-col sm:flex-row gap-3 ${
                fromQrLink ? 'mt-2 sm:mt-0' : ''
              }`}
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
                  placeholder="Outra placa (ex.: BRA2E19)"
                  maxLength={7}
                  autoComplete="off"
                  invalid={Boolean(plateError)}
                  className="h-12 text-center font-semibold uppercase tracking-widest"
                />
                {plateError ? (
                  <p className="text-xs text-vebook-error" role="alert">
                    {plateError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" variant="primary" size="lg" className="sm:self-start">
                <Search className="w-4 h-4" aria-hidden />
                Consultar
              </Button>
            </form>
          )}
        </div>

        <section className="space-y-3" aria-label="Histórico de serviços">
          {history.length === 0 ? (
            <p className="text-sm text-vebook-muted rounded-vebook border border-vebook-border bg-vebook-white p-5">
              Nenhum serviço registrado neste veículo na rede VEBOOK.
            </p>
          ) : (
            <ol className="space-y-3">
              {history.map((item) => (
                <li key={item.id}>
                  <ConsultaServiceCard
                    serviceDate={item.serviceDate}
                    serviceType={item.serviceType}
                    mileageKm={item.mileageKm}
                    workshopName={item.workshopName}
                    workshopCity={item.workshopCity}
                    workshopState={item.workshopState}
                  />
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="rounded-vebook-lg border border-vebook-mustard/55 bg-vebook-mustard-soft/40 p-4 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-vebook-navy tracking-tight">
            Precisa dos detalhes completos?
          </h2>
          <p className="text-sm text-vebook-muted leading-relaxed hidden sm:block">
            A Certidão apresenta informações adicionais dos registros e sua rastreabilidade, incluindo
            dados registrados pela oficina, produtos utilizados, validações, contestações e eventuais
            retificações.
          </p>
          <Button type="button" variant="accent" fullWidth className="sm:w-auto" onClick={emitCertidao}>
            <FileCheck2 className="w-4 h-4" aria-hidden />
            Emitir Certidão
          </Button>
        </aside>

        <p className="text-[11px] text-vebook-subtle leading-relaxed pb-4">
          O VEBOOK registra o que aconteceu. Não determina o que deverá acontecer. A consulta gratuita
          não emite recomendações de manutenção nem previsões mecânicas.
        </p>
      </div>
    </div>
  );
};
