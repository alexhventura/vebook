import React, { useEffect, useState } from 'react';
import { FileCheck2, Gauge, Search } from 'lucide-react';
import { AppView } from '../../types';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { getPublicHistory, getPublicVehicle } from '../../lib/historyLayers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ServiceExplainerLayout } from './ServiceExplainerLayout';

interface DiarioVeicularViewProps {
  /** Placa já conhecida (QR ou busca prévia). Sem valor, a página começa só com explicações + busca. */
  initialPlate?: string;
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
 * Consulta básica (gratuita): explicações + barra de busca; resultados só após a consulta.
 */
export const DiarioVeicularView: React.FC<DiarioVeicularViewProps> = ({
  initialPlate,
  fromQrLink = false,
  onNavigate,
  onEmitirCertidaoForPlate,
  onConsultaPlate,
  searchInputRef,
}) => {
  const seed = formatPlate(initialPlate || '');
  const [queriedPlate, setQueriedPlate] = useState<string | null>(() =>
    seed && (fromQrLink || Boolean(initialPlate)) ? (getPublicVehicle(seed) ? seed : seed) : null,
  );
  const [inputPlate, setInputPlate] = useState(seed || '');
  const [plateError, setPlateError] = useState<string | null>(null);

  useEffect(() => {
    const clean = formatPlate(initialPlate || '');
    if (!clean) return;
    if (fromQrLink || initialPlate) {
      setQueriedPlate(clean);
      setInputPlate(clean);
    }
  }, [initialPlate, fromQrLink]);

  const vehicle = queriedPlate ? getPublicVehicle(queriedPlate) : undefined;
  const history = vehicle ? getPublicHistory(vehicle.plate) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida (Mercosul ou tradicional).');
      return;
    }
    setPlateError(null);
    setQueriedPlate(clean);
    onConsultaPlate?.(clean);
  };

  const emitCertidao = () => {
    if (!vehicle) return;
    if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(vehicle.plate);
    onNavigate('certidao');
  };

  const searchSlot = (
    <form onSubmit={handleSearchSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="diario-plate-input" className="block text-sm font-bold text-vebook-navy">
          Digite a placa do veículo
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="diario-plate-input"
            ref={searchInputRef}
            value={inputPlate}
            onChange={(e) => {
              setInputPlate(formatPlate(e.target.value));
              if (plateError) setPlateError(null);
            }}
            placeholder="Ex.: BRA2E19 ou ABC1234"
            maxLength={7}
            autoComplete="off"
            invalid={Boolean(plateError)}
            className="h-14 text-center text-lg font-semibold uppercase tracking-widest"
          />
          <Button type="submit" variant="primary" size="lg" className="sm:self-stretch sm:min-w-[10rem]">
            <Search className="w-4 h-4" aria-hidden />
            Consultar
          </Button>
        </div>
        {plateError ? (
          <p className="text-xs text-vebook-error" role="alert">
            {plateError}
          </p>
        ) : (
          <p className="text-xs text-vebook-muted">Aceita placa Mercosul ou tradicional.</p>
        )}
      </div>
    </form>
  );

  return (
    <ServiceExplainerLayout
      eyebrow="Consulta básica · gratuita"
      title="Consulta básica do veículo"
      lead="Veja se o veículo possui histórico registrado no VEBOOK. A consulta mostra o essencial — sem emitir documento formal."
      meaning="É a leitura pública e gratuita do Diário Veicular: data, km, tipo de serviço e oficina dos registros vinculados à placa."
      purpose="Serve para conferir, de forma rápida, se existe histórico na rede VEBOOK antes de comprar, negociar ou solicitar a Certidão completa."
      howItWorks={[
        'Informe a placa na barra de busca acima.',
        'O VEBOOK localiza os atendimentos registrados por oficinas da rede.',
        'Você visualiza os registros essenciais (data, km, serviço e oficina).',
        'Se precisar do documento formal completo, solicite a Certidão VEBOOK.',
      ]}
      onBack={() => onNavigate('home')}
      searchSlot={searchSlot}
      aside={
        <aside className="rounded-vebook-lg border border-vebook-mustard/55 bg-vebook-mustard-soft/40 p-5 space-y-2">
          <h2 className="text-sm font-bold text-vebook-navy">Diferença da Certidão</h2>
          <p className="text-sm text-vebook-muted leading-relaxed">
            A consulta básica não substitui a Certidão. A Certidão é o documento formal, paginado e
            autenticável, com o histórico detalhado.
          </p>
        </aside>
      }
    >
      {queriedPlate ? (
        <section className="space-y-5 border-t border-vebook-border pt-8" aria-label="Resultado da consulta">
          <div className="rounded-vebook-lg border border-vebook-border bg-vebook-white px-4 py-4 sm:p-6">
            <p className="font-mono text-lg font-extrabold text-vebook-navy tracking-wider">
              {queriedPlate}
            </p>
            {vehicle ? (
              <>
                <p className="text-sm sm:text-base font-semibold text-vebook-navy mt-0.5">
                  {vehicle.brand} {vehicle.model}{' '}
                  <span className="text-vebook-muted font-normal">{vehicle.version}</span>
                </p>
                <p className="text-xs text-vebook-muted mt-0.5">
                  {vehicle.yearFabrication}/{vehicle.yearModel} · {vehicle.fuel} · {vehicle.color}
                </p>
              </>
            ) : (
              <p className="text-sm text-vebook-muted mt-2">
                Placa consultada. Nenhum veículo correspondente foi encontrado na base de demonstração.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-vebook-navy">Histórico encontrado</h2>
            {!vehicle || history.length === 0 ? (
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
          </div>

          {vehicle ? (
            <aside className="rounded-vebook-lg border border-vebook-mustard/55 bg-vebook-mustard-soft/40 p-4 sm:p-6 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-vebook-navy tracking-tight">
                Precisa dos detalhes completos?
              </h2>
              <p className="text-sm text-vebook-muted leading-relaxed">
                A Certidão apresenta o histórico formal com rastreabilidade, produtos, validações e
                QR Code de autenticidade.
              </p>
              <Button type="button" variant="accent" fullWidth className="sm:w-auto" onClick={emitCertidao}>
                <FileCheck2 className="w-4 h-4" aria-hidden />
                Ir para a Certidão
              </Button>
            </aside>
          ) : null}
        </section>
      ) : null}
    </ServiceExplainerLayout>
  );
};
