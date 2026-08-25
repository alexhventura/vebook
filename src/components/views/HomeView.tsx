import React, { useState } from 'react';
import {
  Search,
  Car,
  Wrench,
  FileCheck2,
  Shield,
  Lock,
  Building2,
  ArrowRight,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { formatBRL } from '../../lib/currency';
import { PLAN_OFFERS, planPricingFootnote } from '../../data/officePlans';
import { AppView, PlanModality } from '../../types';
import { Button, Input } from '../ui';
import { HomeAtmosphere } from '../home/HomeAtmosphere';
import { HomeFaqAccordion } from '../home/HomeFaqAccordion';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
  onStartCadastro?: (modality: PlanModality) => void;
  onOpenContato?: () => void;
}

/** Spine vertical — metáfora do “fio” que une o histórico do veículo */
const Spine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-vebook-mustard/40 to-transparent ${className}`}
    aria-hidden
  />
);

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchPlate,
  onOpenCredenciamento,
  onOpenJaCredenciado: _onOpenJaCredenciado,
  onStartCadastro,
  onOpenContato,
}) => {
  const [inputPlate, setInputPlate] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);

  const startCadastro = (modality: PlanModality) => {
    if (onStartCadastro) onStartCadastro(modality);
    else onOpenCredenciamento();
  };

  const scrollTo = (id: string, focusInput = false) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focusInput) {
      setTimeout(() => document.getElementById('home-plate-input')?.focus(), 420);
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
    <div className="relative isolate overflow-x-hidden">
      <HomeAtmosphere />

      {/* ===== ABERTURA: identidade + portal dual ===== */}
      <section className="relative min-h-[88vh] flex flex-col justify-center bg-vebook-navy-deep text-vebook-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(19,44,77,0.9),rgba(7,21,39,1)_70%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="vebook-reveal max-w-3xl mx-auto text-center space-y-6">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-vebook-mustard">
              Infraestrutura de histórico veicular
            </p>
            <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-vebook-white">
              VEBOOK
            </h1>
            <p className="text-base sm:text-xl text-vebook-blue-muted font-medium max-w-xl mx-auto leading-relaxed">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <p className="text-sm sm:text-base text-vebook-subtle max-w-lg mx-auto leading-relaxed">
              O histórico técnico do veículo — organizado, consultável e contínuo ao longo da vida útil.
            </p>
          </div>

          {/* Portal dual — duas portas, um eixo */}
          <div className="vebook-reveal vebook-reveal-delay-1 mt-12 sm:mt-16 relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-vebook-mustard/35" aria-hidden />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => scrollTo('home-ledger', true)}
                className="group text-left rounded-vebook-lg border border-vebook-mustard/70 bg-gradient-to-br from-vebook-white to-vebook-blue-soft p-6 sm:p-8 shadow-vebook-md transition-all duration-300 hover:-translate-y-1 hover:border-vebook-mustard hover:shadow-[0_10px_28px_rgba(196,163,90,0.22)] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-vebook-navy">
                  <span className="w-10 h-10 rounded-vebook border border-vebook-mustard/70 bg-vebook-navy text-vebook-mustard flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vebook-mustard-deep">Consulta</span>
                </div>
                <h2 className="mt-5 text-xl sm:text-2xl font-bold text-vebook-navy tracking-tight">
                  Consultar veículo
                </h2>
                <p className="mt-2 text-sm text-vebook-muted leading-relaxed">
                  Verifique se existe histórico registrado e, se precisar, solicite a Certidão VEBOOK.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vebook-mustard-deep">
                  Ir para a consulta
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </button>

              <button
                type="button"
                onClick={() => scrollTo('home-oficinas')}
                className="group text-left rounded-vebook-lg border border-vebook-mustard/70 bg-gradient-to-br from-vebook-white to-vebook-mustard-soft p-6 sm:p-8 shadow-vebook-md transition-all duration-300 hover:-translate-y-1 hover:border-vebook-mustard hover:shadow-[0_10px_28px_rgba(196,163,90,0.22)] cursor-pointer"
              >
                <div className="flex items-center gap-3 text-vebook-navy">
                  <span className="w-10 h-10 rounded-vebook border border-vebook-mustard/70 bg-vebook-navy text-vebook-mustard flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wrench className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vebook-mustard-deep">Oficina</span>
                </div>
                <h2 className="mt-5 text-xl sm:text-2xl font-bold text-vebook-navy tracking-tight">
                  Sou uma oficina
                </h2>
                <p className="mt-2 text-sm text-vebook-muted leading-relaxed">
                  Credencie-se, registre atendimentos e participe da construção do prontuário veicular.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vebook-mustard-deep">
                  Conhecer o VEBOOK
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== LEDGER: produto em cena ===== */}
      <section id="home-ledger" className="relative bg-vebook-surface border-b border-vebook-border">
        <Spine />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard-deep">O livro do veículo</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-vebook-navy leading-[1.1]">
                Cada atendimento pode se tornar memória.
              </h2>
              <p className="text-sm sm:text-base text-vebook-muted leading-relaxed">
                Oficinas participantes registram serviços. O VEBOOK organiza esses registros em um
                histórico associado ao veículo — consultável e, quando necessário, documentável.
              </p>
              <ol className="space-y-3 pt-2">
                {[
                  'Oficina realiza o atendimento',
                  'Registro entra no prontuário',
                  'Histórico acompanha o veículo',
                  'Certidão documenta o disponível',
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-vebook-text">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-vebook-navy text-vebook-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-7">
              <form
                id="home-consulta"
                onSubmit={handleSearchSubmit}
                className="h-full rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-navy text-vebook-white p-6 sm:p-8 lg:p-10 space-y-6 shadow-vebook-md transition-[transform,box-shadow,border-color] duration-200 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]"
              >
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vebook-mustard">Consulta</p>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Informe a placa</h3>
                  <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed max-w-xl">
                    Consulta inicial gratuita. A Certidão apresenta os registros disponíveis no momento da emissão.
                  </p>
                </div>
                <div className="space-y-4 max-w-xl">
                  <label htmlFor="home-plate-input" className="block text-sm font-medium text-vebook-blue-muted">
                    Digite a placa
                  </label>
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
                    className="bg-vebook-white h-14 text-center text-lg font-semibold tracking-widest uppercase placeholder:tracking-normal"
                  />
                  <Button type="submit" variant="accent" size="lg" fullWidth>
                    <Search className="w-4 h-4" aria-hidden />
                    Consultar veículo
                  </Button>
                  <p id="home-plate-hint" className="text-xs text-vebook-blue-muted/90">
                    Fluxo real do Diário Veicular. O exemplo é apenas de formato.
                  </p>
                  {plateError && (
                    <p id="home-plate-error" className="text-xs text-vebook-error" role="alert">
                      {plateError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('certidao')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-vebook-mustard hover:text-vebook-mustard-soft transition-colors cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" aria-hidden />
                  Solicitar certidão
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== O QUE ENTRA NO HISTÓRICO — fita editorial ===== */}
      <section className="relative bg-vebook-blue-soft/50 border-b border-vebook-border">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div className="max-w-xl space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard-deep">Para quem consulta</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-vebook-navy leading-[1.1]">
                Clareza antes da certidão.
              </h2>
            </div>
            <p className="text-sm text-vebook-muted max-w-sm leading-relaxed lg:text-right">
              O prontuário é sobre o veículo e seus registros técnicos — não um cadastro público de proprietários.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: 'Histórico', d: 'Registros de manutenções e atendimentos de oficinas participantes.' },
              { t: 'Continuidade', d: 'O histórico acompanha o veículo ao longo da vida útil.' },
              { t: 'Transparência', d: 'Verifique a existência de registros antes de documentar.' },
              { t: 'Privacidade', d: 'Dados pessoais do cliente ficam no controle da oficina.' },
            ].map((item, i) => (
              <article
                key={item.t}
                className="group rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white/90 p-5 sm:p-6 shadow-vebook transition-all duration-300 hover:-translate-y-1 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]"
              >
                <span className="text-[11px] font-mono font-semibold text-vebook-mustard-deep">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-vebook-navy">{item.t}</h3>
                <p className="mt-2 text-sm text-vebook-muted leading-relaxed">{item.d}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => onNavigate('como-funciona')}>
              Como o histórico é construído
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('transparencia')}>
              Transparência e LGPD
            </Button>
          </div>
        </div>
      </section>

      {/* ===== OFICINAS — infraestrutura, não pitch ===== */}
      <section id="home-oficinas" className="relative bg-vebook-gray border-b border-vebook-border">
        <Spine />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard-deep">Para oficinas</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-vebook-navy leading-[1.1]">
              A oficina escreve. O VEBOOK preserva.
            </h2>
            <p className="text-sm sm:text-base text-vebook-muted leading-relaxed">
              Credenciamento, página própria, painel de gestão e registro de atendimentos que alimentam
              o prontuário do veículo.
            </p>
          </div>

          {/* Trilho de valor — composição horizontal densa */}
          <div className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-2 sm:p-3 shadow-vebook overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.14)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-vebook-mustard/30">
              {[
                { icon: Building2, t: 'Rede', d: 'Presença na infraestrutura VEBOOK.' },
                { icon: Wrench, t: 'Registro', d: 'Atendimentos no prontuário do veículo.' },
                { icon: Car, t: 'Gestão', d: 'Clientes, veículos, agenda e retornos.' },
                { icon: Shield, t: 'Credibilidade', d: 'Histórico com origem identificável.' },
              ].map((cell) => (
                <div key={cell.t} className="p-5 sm:p-6 space-y-3">
                  <cell.icon className="w-5 h-5 text-vebook-navy" aria-hidden />
                  <h3 className="text-base font-bold text-vebook-navy">{cell.t}</h3>
                  <p className="text-sm text-vebook-muted leading-relaxed">{cell.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tarifas reais */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xl font-bold text-vebook-navy">Credenciamento</h3>
              <p className="text-sm text-vebook-muted leading-relaxed">{planPricingFootnote()}</p>
              <Button variant="secondary" onClick={() => onNavigate('oficinas')}>
                Ver área completa para oficinas
              </Button>
            </div>

            <div className="lg:col-span-4 rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-6 space-y-4 shadow-vebook transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-vebook-mustard-deep">Mensal</p>
              <p className="text-3xl font-bold text-vebook-navy">
                {formatBRL(PLAN_OFFERS.monthly.firstYear)}
                <span className="text-sm font-semibold text-vebook-muted">/mês</span>
              </p>
              <p className="text-sm text-vebook-muted">
                Primeiro ano. Depois: <strong className="text-vebook-navy">{formatBRL(PLAN_OFFERS.monthly.renewal)}/mês</strong>
              </p>
              <Button variant="primary" fullWidth onClick={() => startCadastro('monthly')}>
                Fazer cadastro
              </Button>
            </div>

            <div className="lg:col-span-4 rounded-vebook-lg border border-vebook-mustard bg-gradient-to-b from-vebook-white to-vebook-mustard-soft p-6 space-y-4 shadow-vebook-md relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(196,163,90,0.22)]">
              <span className="absolute -top-2.5 right-5 text-[10px] font-bold uppercase tracking-wider bg-vebook-mustard text-vebook-navy-deep px-2.5 py-1 rounded-vebook-sm border border-vebook-mustard-deep/40">
                Economia no 1º ano
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-vebook-mustard-deep">Anual</p>
              <p className="text-3xl font-bold text-vebook-navy">
                {formatBRL(PLAN_OFFERS.annual.firstYear)}
                <span className="text-sm font-semibold text-vebook-muted">/ano</span>
              </p>
              <p className="text-sm text-vebook-muted">
                Economia de {formatBRL(PLAN_OFFERS.annual.firstYearSavings)}. Renovação:{' '}
                <strong className="text-vebook-navy">{formatBRL(PLAN_OFFERS.annual.renewal)}/ano</strong>
              </p>
              <Button variant="accent" fullWidth onClick={() => startCadastro('annual')}>
                Fazer cadastro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONFIANÇA / GOVERNANÇA ===== */}
      <section className="relative bg-vebook-navy-deep text-vebook-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(107,158,196,0.12),transparent_50%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-14">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard">Governança</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1]">
              Tecnologia a serviço da procedência.
            </h2>
            <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed">
              Rastreabilidade, segregação de dados e boas práticas de segurança — sem promessas absolutas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, t: 'Origem', d: 'Registros com identificação dentro da plataforma.' },
              { icon: Lock, t: 'Separação', d: 'Prontuário técnico do veículo ≠ dados pessoais do cliente.' },
              { icon: FileCheck2, t: 'Documento', d: 'A Certidão retrata o disponível no momento da emissão.' },
            ].map((item) => (
              <div
                key={item.t}
                className="rounded-vebook-lg border border-vebook-mustard/65 bg-vebook-navy/50 p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.16)]"
              >
                <item.icon className="w-5 h-5 text-vebook-mustard" aria-hidden />
                <h3 className="text-base font-bold text-vebook-white">{item.t}</h3>
                <p className="text-sm text-vebook-blue-muted leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xl font-bold text-vebook-white">Perguntas frequentes</h3>
              <HomeFaqAccordion />
              <button
                type="button"
                onClick={() => onNavigate('transparencia')}
                className="text-sm font-semibold text-vebook-mustard hover:text-vebook-mustard-soft transition-colors cursor-pointer"
              >
                FAQ e transparência completos →
              </button>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-vebook-lg border border-vebook-mustard/65 bg-vebook-navy/40 p-6 space-y-4 transition-all duration-200 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.16)]">
                <h3 className="text-lg font-bold text-vebook-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-vebook-mustard" aria-hidden />
                  Contato
                </h3>
                <p className="text-sm text-vebook-blue-muted leading-relaxed">
                  Canal institucional existente no VEBOOK. Informações oficiais serão ampliadas com a
                  homologação operacional.
                </p>
                <Button variant="accent" onClick={() => onOpenContato?.()}>
                  Abrir contato
                </Button>
              </div>

              <div className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-mustard/10 p-6 space-y-3 transition-all duration-200 hover:border-vebook-mustard">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-vebook-mustard">
                  Em uma frase
                </p>
                <p className="text-lg font-semibold text-vebook-white leading-snug">
                  O VEBOOK organiza o histórico técnico do veículo — escrito pelas oficinas, preservado
                  pela plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
