import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { AppView } from '../../types';
import { Button, Card, Input } from '../ui';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
}

/**
 * Reservado para métricas reais da plataforma.
 * Enquanto não houver dados comprovados, permanece nulo e a seção não é renderizada.
 */
type HomePlatformMetrics = {
  vehiclesRegistered?: number;
  participatingOffices?: number;
  servicesRegistered?: number;
  consultations?: number;
};

/** Fonte futura de indicadores reais. Retorna null enquanto não houver dados comprovados. */
function loadHomePlatformMetrics(): HomePlatformMetrics | null {
  return null;
}

const hasRealMetrics = (metrics: HomePlatformMetrics | null): metrics is HomePlatformMetrics => {
  if (!metrics) return false;
  return (
    typeof metrics.vehiclesRegistered === 'number' ||
    typeof metrics.participatingOffices === 'number' ||
    typeof metrics.servicesRegistered === 'number' ||
    typeof metrics.consultations === 'number'
  );
};

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchPlate,
  onOpenCredenciamento: _onOpenCredenciamento,
  onOpenJaCredenciado: _onOpenJaCredenciado,
}) => {
  const [inputPlate, setInputPlate] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);
  const platformMetrics = loadHomePlatformMetrics();

  const scrollToConsulta = () => {
    const el = document.getElementById('home-consulta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = el.querySelector('input');
      input?.focus();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida no formato Mercosul (ABC1D23) ou tradicional (ABC1234).');
      return;
    }
    setPlateError(null);
    onSearchPlate(clean);
  };

  return (
    <div className="pb-20 sm:pb-24">
      {/* 1. HERO */}
      <section className="relative bg-vebook-navy-deep text-vebook-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto py-20 sm:py-28 lg:py-36 text-center space-y-8">
          <div className="space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-vebook-white leading-tight">
              O histórico do veículo em um só lugar.
            </h1>
            <p className="text-base sm:text-lg text-vebook-blue-muted leading-relaxed max-w-xl mx-auto">
              Registros de serviços e manutenção organizados para acompanhar a vida do veículo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-1">
            <Button variant="inverse" size="lg" fullWidth className="sm:w-auto" onClick={scrollToConsulta}>
              Consultar veículo
            </Button>
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              className="sm:w-auto text-vebook-blue-muted border-vebook-navy-mid hover:border-vebook-blue-muted"
              onClick={() => onNavigate('oficinas')}
            >
              Sou uma oficina
            </Button>
          </div>
        </div>
      </section>

      {/* 2. O QUE É O VEBOOK */}
      <section className="vebook-container vebook-section space-y-10 sm:space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="vebook-section-title">O que é o VEBOOK?</h2>
          <p className="vebook-section-lead">
            O VEBOOK é uma plataforma para registro e consulta do histórico de serviços e manutenção de veículos.
          </p>
          <p className="text-sm text-vebook-subtle leading-relaxed">
            Cada registro fica associado ao veículo, formando uma linha do tempo clara e consultável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <Card as="article" className="space-y-3">
            <h3 className="text-lg font-semibold text-vebook-navy">Histórico</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              Registros organizados para acompanhar a trajetória de manutenção do veículo.
            </p>
          </Card>

          <Card as="article" className="space-y-3">
            <h3 className="text-lg font-semibold text-vebook-navy">Transparência</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              Informações reunidas de forma clara para facilitar a consulta do histórico.
            </p>
          </Card>

          <Card as="article" className="space-y-3">
            <h3 className="text-lg font-semibold text-vebook-navy">Registro</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              Serviços realizados podem ser registrados e associados ao veículo.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. CONSULTA — ação principal */}
      <section id="home-consulta" className="vebook-container vebook-section">
        <Card padding="lg" className="space-y-8 border-vebook-border">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <h2 className="vebook-section-title">Consulte um veículo</h2>
            <p className="vebook-section-lead">
              Consulte as informações disponíveis sobre o histórico registrado no VEBOOK.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto space-y-4">
            <label htmlFor="home-plate-input" className="vebook-label">
              Digite a placa do veículo
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="home-plate-input"
                type="text"
                value={inputPlate}
                onChange={(e) => {
                  setInputPlate(formatPlate(e.target.value));
                  if (plateError) setPlateError(null);
                }}
                placeholder="Ex.: ABC1D23"
                maxLength={7}
                autoComplete="off"
                invalid={Boolean(plateError)}
                aria-describedby={plateError ? 'home-plate-error' : 'home-plate-hint'}
                className="font-semibold tracking-widest uppercase placeholder:tracking-normal"
              />
              <Button type="submit" variant="primary" size="lg" className="shrink-0">
                <Search className="w-4 h-4 text-vebook-blue-muted" aria-hidden />
                Consultar veículo
              </Button>
            </div>
            <p id="home-plate-hint" className="vebook-hint">
              Use o formato Mercosul ou tradicional. O exemplo no campo é apenas de preenchimento.
            </p>
            {plateError && (
              <p id="home-plate-error" className="vebook-error-text" role="alert">
                {plateError}
              </p>
            )}
          </form>
        </Card>
      </section>

      {/* 4. COMO FUNCIONA */}
      <section className="vebook-container vebook-section space-y-10 sm:space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="vebook-section-title">Como funciona</h2>
          <p className="vebook-section-lead">
            O histórico é construído a partir dos serviços registrados no veículo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <Card as="article" className="space-y-3">
            <span className="text-xs font-semibold tracking-widest text-vebook-blue">01</span>
            <h3 className="text-lg font-semibold text-vebook-navy">O serviço é realizado</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              A oficina realiza o serviço no veículo.
            </p>
          </Card>

          <Card as="article" className="space-y-3">
            <span className="text-xs font-semibold tracking-widest text-vebook-blue">02</span>
            <h3 className="text-lg font-semibold text-vebook-navy">O serviço é registrado</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              As informações do atendimento são registradas no VEBOOK.
            </p>
          </Card>

          <Card as="article" className="space-y-3">
            <span className="text-xs font-semibold tracking-widest text-vebook-blue">03</span>
            <h3 className="text-lg font-semibold text-vebook-navy">O histórico fica organizado</h3>
            <p className="text-sm text-vebook-muted leading-relaxed">
              O registro passa a fazer parte do histórico disponível do veículo.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. PARA OFICINAS */}
      <section className="vebook-container vebook-section">
        <Card tone="muted" padding="lg" className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="vebook-section-title">Sua oficina pode fazer parte do VEBOOK.</h2>
            <p className="vebook-section-lead">
              Registre os serviços realizados e ofereça aos seus clientes uma forma organizada de acompanhar o histórico do veículo.
            </p>
          </div>
          <div>
            <Button variant="primary" size="lg" onClick={() => onNavigate('oficinas')}>
              Conhecer o VEBOOK para oficinas
            </Button>
          </div>
        </Card>
      </section>

      {/* 6. CONFIANÇA / INSTITUCIONAL */}
      <section className="vebook-container vebook-section">
        <div className="max-w-2xl mx-auto text-center space-y-4 border-t border-vebook-border pt-14 sm:pt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-vebook-navy tracking-tight">
            Informação organizada. Consulta simples.
          </h2>
          <p className="text-sm text-vebook-muted leading-relaxed">
            O VEBOOK trabalha com registros vinculados ao veículo, reunindo informações de serviços e manutenção para consulta de forma clara e responsável.
          </p>
        </div>
      </section>

      {/* Métricas reais — renderiza somente quando houver dados comprovados */}
      {hasRealMetrics(platformMetrics) && (
        <section className="vebook-container vebook-section" aria-label="Indicadores da plataforma">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeof platformMetrics.vehiclesRegistered === 'number' && (
              <Card className="text-center space-y-1" padding="md">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.vehiclesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Veículos registrados</p>
              </Card>
            )}
            {typeof platformMetrics.participatingOffices === 'number' && (
              <Card className="text-center space-y-1" padding="md">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.participatingOffices.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Oficinas participantes</p>
              </Card>
            )}
            {typeof platformMetrics.servicesRegistered === 'number' && (
              <Card className="text-center space-y-1" padding="md">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.servicesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Serviços registrados</p>
              </Card>
            )}
            {typeof platformMetrics.consultations === 'number' && (
              <Card className="text-center space-y-1" padding="md">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.consultations.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Consultas realizadas</p>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
