import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { AppView } from '../../types';

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
    <div className="pb-24">
      {/* 1. HERO */}
      <section className="relative bg-[#071527] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto py-24 sm:py-32 lg:py-40 text-center space-y-8">
          <div className="space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              O histórico do veículo em um só lugar.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
              Registros de serviços e manutenção organizados para acompanhar a vida do veículo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={scrollToConsulta}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-[#0B1E36] font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Consultar veículo
            </button>
            <button
              type="button"
              onClick={() => onNavigate('oficinas')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-transparent text-slate-300 font-medium text-sm border border-slate-600 hover:border-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Sou uma oficina
            </button>
          </div>
        </div>
      </section>

      {/* 2. O QUE É O VEBOOK */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E36] tracking-tight">
            O que é o VEBOOK?
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            O VEBOOK é uma plataforma para registro e consulta do histórico de serviços e manutenção de veículos.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Cada registro fica associado ao veículo, formando uma linha do tempo clara e consultável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-3">
            <h3 className="text-lg font-semibold text-[#0B1E36]">Histórico</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Registros organizados para acompanhar a trajetória de manutenção do veículo.
            </p>
          </article>

          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-3">
            <h3 className="text-lg font-semibold text-[#0B1E36]">Transparência</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Informações reunidas de forma clara para facilitar a consulta do histórico.
            </p>
          </article>

          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-3">
            <h3 className="text-lg font-semibold text-[#0B1E36]">Registro</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Serviços realizados podem ser registrados e associados ao veículo.
            </p>
          </article>
        </div>
      </section>

      {/* 3. CONSULTA */}
      <section
        id="home-consulta"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.05)] px-6 py-10 sm:px-10 sm:py-14 space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E36] tracking-tight">
              Consulte um veículo
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Consulte as informações disponíveis sobre o histórico registrado no VEBOOK.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto space-y-4">
            <label htmlFor="home-plate-input" className="block text-sm font-medium text-slate-700">
              Digite a placa do veículo
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
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
                aria-invalid={Boolean(plateError)}
                aria-describedby={plateError ? 'home-plate-error' : 'home-plate-hint'}
                className="w-full px-4 py-3.5 text-base font-semibold tracking-widest text-[#0B1E36] uppercase placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1E36]/15 focus:border-slate-400"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 text-sky-300" />
                <span>Consultar veículo</span>
              </button>
            </div>
            <p id="home-plate-hint" className="text-xs text-slate-500">
              Use o formato Mercosul ou tradicional. O exemplo no campo é apenas de preenchimento.
            </p>
            {plateError && (
              <p id="home-plate-error" className="text-xs text-rose-700" role="alert">
                {plateError}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* 4. COMO FUNCIONA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E36] tracking-tight">
            Como funciona
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            O histórico é construído a partir dos serviços registrados no veículo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4">
            <span className="text-xs font-semibold tracking-widest text-slate-400">01</span>
            <h3 className="text-lg font-semibold text-[#0B1E36]">O serviço é realizado</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A oficina realiza o serviço no veículo.
            </p>
          </article>

          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4">
            <span className="text-xs font-semibold tracking-widest text-slate-400">02</span>
            <h3 className="text-lg font-semibold text-[#0B1E36]">O serviço é registrado</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              As informações do atendimento são registradas no VEBOOK.
            </p>
          </article>

          <article className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-4">
            <span className="text-xs font-semibold tracking-widest text-slate-400">03</span>
            <h3 className="text-lg font-semibold text-[#0B1E36]">O histórico fica organizado</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              O registro passa a fazer parte do histórico disponível do veículo.
            </p>
          </article>
        </div>
      </section>

      {/* 5. PARA OFICINAS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-10 sm:px-10 sm:py-12 space-y-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E36] tracking-tight">
              Sua oficina pode fazer parte do VEBOOK.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Registre os serviços realizados e ofereça aos seus clientes uma forma organizada de acompanhar o histórico do veículo.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('oficinas')}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Conhecer o VEBOOK para oficinas
            </button>
          </div>
        </div>
      </section>

      {/* 6. CONFIANÇA / INSTITUCIONAL */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="max-w-2xl mx-auto text-center space-y-4 border-t border-slate-200 pt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E36] tracking-tight">
            Informação organizada. Consulta simples.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            O VEBOOK trabalha com registros vinculados ao veículo, reunindo informações de serviços e manutenção para consulta de forma clara e responsável.
          </p>
        </div>
      </section>

      {/* Métricas reais — renderiza somente quando houver dados comprovados */}
      {hasRealMetrics(platformMetrics) && (
        <section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28"
          aria-label="Indicadores da plataforma"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeof platformMetrics.vehiclesRegistered === 'number' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-1">
                <p className="text-2xl font-bold text-[#0B1E36]">
                  {platformMetrics.vehiclesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">Veículos registrados</p>
              </div>
            )}
            {typeof platformMetrics.participatingOffices === 'number' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-1">
                <p className="text-2xl font-bold text-[#0B1E36]">
                  {platformMetrics.participatingOffices.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">Oficinas participantes</p>
              </div>
            )}
            {typeof platformMetrics.servicesRegistered === 'number' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-1">
                <p className="text-2xl font-bold text-[#0B1E36]">
                  {platformMetrics.servicesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">Serviços registrados</p>
              </div>
            )}
            {typeof platformMetrics.consultations === 'number' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-1">
                <p className="text-2xl font-bold text-[#0B1E36]">
                  {platformMetrics.consultations.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-500">Consultas realizadas</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
