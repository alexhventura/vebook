import React, { useEffect, useState } from 'react';
import { FileCheck2, Search } from 'lucide-react';
import { AppView } from '../../types';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { getPublicHistory, getPublicVehicle } from '../../lib/historyLayers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DiarioVeicularViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
  onEmitirCertidaoForPlate?: (plate: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

function formatServiceDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('pt-BR');
}

/**
 * CONSULTA VEBOOK — gratuita.
 * Linha do tempo apenas com: data, serviço, km e oficina.
 * Sem produtos, auditoria, recomendações ou dados da Certidão.
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
    if (clean) setSelectedPlate(getPublicVehicle(clean) ? clean : 'BRA2E19');
  }, [initialPlate]);

  const vehicle = getPublicVehicle(selectedPlate) || getPublicVehicle('BRA2E19')!;
  const history = getPublicHistory(vehicle.plate);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida (Mercosul ou tradicional).');
      return;
    }
    setPlateError(null);
    setSelectedPlate(getPublicVehicle(clean) ? clean : 'BRA2E19');
  };

  const emitCertidao = () => {
    if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(vehicle.plate);
    onNavigate('certidao');
  };

  return (
    <div className="bg-vebook-surface min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-vebook-mustard-deep border border-vebook-mustard/50 rounded-vebook-sm px-2.5 py-1 bg-vebook-mustard-soft/60">
            Consulta gratuita
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-vebook-navy">
            Histórico VEBOOK
          </h1>
          <p className="text-sm sm:text-base text-vebook-muted leading-relaxed max-w-2xl">
            Registros de serviços realizados neste veículo.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="rounded-vebook-lg border border-vebook-mustard/50 bg-vebook-white p-4 flex flex-col sm:flex-row gap-3"
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

        <div className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 sm:p-6 space-y-1">
          <p className="font-mono text-sm font-bold text-vebook-navy tracking-wider">{vehicle.plate}</p>
          <p className="text-base font-semibold text-vebook-navy">
            {vehicle.brand} {vehicle.model}{' '}
            <span className="text-vebook-muted font-normal text-sm">{vehicle.version}</span>
          </p>
          <p className="text-xs text-vebook-muted">
            {vehicle.yearFabrication}/{vehicle.yearModel} · {vehicle.fuel} · {vehicle.color}
          </p>
        </div>

        <section className="space-y-3" aria-label="Histórico de serviços">
          {history.length === 0 ? (
            <p className="text-sm text-vebook-muted rounded-vebook border border-vebook-border bg-vebook-white p-5">
              Nenhum serviço registrado neste veículo na rede VEBOOK.
            </p>
          ) : (
            <ol className="space-y-3">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="rounded-vebook border-2 border-vebook-blue bg-vebook-white px-5 py-4 space-y-1.5"
                >
                  <p className="text-xs font-semibold text-vebook-mustard-deep">
                    {formatServiceDate(item.serviceDate)}
                  </p>
                  <p className="text-base font-bold text-vebook-navy tracking-tight">
                    {item.serviceType}
                  </p>
                  <p className="text-sm text-vebook-muted">
                    {item.mileageKm.toLocaleString('pt-BR')} km
                  </p>
                  <p className="text-sm text-vebook-navy">
                    {item.workshopName}
                    <span className="text-vebook-muted">
                      {' '}
                      · {item.workshopCity}/{item.workshopState}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="rounded-vebook-lg border border-vebook-mustard/55 bg-vebook-mustard-soft/40 p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-bold text-vebook-navy tracking-tight">
            Precisa dos detalhes completos deste histórico?
          </h2>
          <p className="text-sm font-semibold text-vebook-navy">Emita a Certidão VEBOOK</p>
          <p className="text-sm text-vebook-muted leading-relaxed">
            A Certidão apresenta informações adicionais dos registros e sua rastreabilidade, incluindo
            dados registrados pela oficina, produtos utilizados, validações, contestações e eventuais
            retificações.
          </p>
          <Button type="button" variant="accent" onClick={emitCertidao}>
            <FileCheck2 className="w-4 h-4" aria-hidden />
            Emitir Certidão
          </Button>
        </aside>

        <p className="text-[11px] text-vebook-subtle leading-relaxed">
          O VEBOOK registra o que aconteceu. Não determina o que deverá acontecer. A consulta gratuita
          não emite recomendações de manutenção nem previsões mecânicas.
        </p>
      </div>
    </div>
  );
};
