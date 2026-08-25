import React, { useState } from 'react';
import {
  Search,
  Car,
  Wrench,
  FileCheck2,
  ArrowRight,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { formatBRL } from '../../lib/currency';
import { PLAN_OFFERS } from '../../data/officePlans';
import { CERTIDAO_PRICE } from '../../data/certidaoPricing';
import { OFFICE_PILLARS, type OfficePillarId } from '../../data/officePillars';
import { GOVERNANCE_PILLARS, type GovernancePillarId } from '../../data/governancePillars';
import { AppView, PlanModality } from '../../types';
import { Button, Input } from '../ui';
import { HomeAtmosphere } from '../home/HomeAtmosphere';
import { HomeFaqAccordion } from '../home/HomeFaqAccordion';
import { OfficePillarModal } from '../modals/OfficePillarModal';
import { GovernancePillarModal } from '../modals/GovernancePillarModal';

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
  const [openPillarId, setOpenPillarId] = useState<OfficePillarId | null>(null);
  const [openGovId, setOpenGovId] = useState<GovernancePillarId | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);

  const openPillar = OFFICE_PILLARS.find((item) => item.id === openPillarId) ?? null;
  const openGovPillar = GOVERNANCE_PILLARS.find((item) => item.id === openGovId) ?? null;

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
            <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] font-bold tracking-[-0.04em] leading-[0.95] text-vebook-white">
              VEBOOK
            </h1>
            <p className="text-base sm:text-xl text-vebook-mustard font-medium max-w-xl mx-auto leading-relaxed">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <p className="text-sm sm:text-base text-vebook-subtle max-w-lg mx-auto leading-relaxed">
              O histórico do seu veículo: Consultável. Imutável. Rastreável.
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
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard-deep">
                  O livro do veículo
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-vebook-navy leading-[1.1]">
                  Vantagens de ter o histórico no VEBOOK
                </h2>
              </div>
              <ul className="space-y-3">
                {[
                  'Continuidade: o registro acompanha o veículo ao longo da vida útil, mesmo com troca de dono ou de oficina.',
                  'Transparência objetiva: a consulta mostra o que há no prontuário antes de você solicitar a certidão.',
                  'Documento formal: a Certidão consolida a informação completa para apresentação a terceiros.',
                  'Origem identificável: serviços entram com oficina, data e descrição preservadas pela plataforma.',
                  'Privacidade: o foco é o histórico técnico do veículo — dados pessoais do cliente permanecem sob responsabilidade da oficina.',
                  'Decisão informada: números na consulta; narrativa completa só na certidão, quando a formalidade importa.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm sm:text-base text-vebook-text leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vebook-mustard" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
                  <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed">
                    A consulta é gratuita e traz os dados numéricos do histórico. A Certidão VEBOOK
                    entrega a informação completa e documentada.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-vebook border border-vebook-mustard/55 bg-vebook-navy-mid/50 p-4 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vebook-mustard">
                      Consulta
                    </p>
                    <p className="text-sm font-bold text-vebook-white">Dados numéricos</p>
                    <p className="text-xs text-vebook-blue-muted leading-relaxed">
                      Visão resumida e gratuita: totais e existência de registros da placa.
                    </p>
                  </div>
                  <div className="rounded-vebook border border-vebook-mustard bg-vebook-mustard/15 p-4 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vebook-mustard">
                      Certidão
                    </p>
                    <p className="text-sm font-bold text-vebook-white">Informação completa</p>
                    <p className="text-xs text-vebook-blue-muted leading-relaxed">
                      Documento formal do histórico detalhado disponível na emissão.
                    </p>
                    <p className="pt-1 text-base font-bold text-vebook-mustard">
                      {formatBRL(CERTIDAO_PRICE)}
                      <span className="ml-1 text-xs font-semibold text-vebook-blue-muted">por certidão</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
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
                  {plateError && (
                    <p id="home-plate-error" className="text-xs text-vebook-error" role="alert">
                      {plateError}
                    </p>
                  )}
                  <p id="home-plate-hint" className="text-xs text-vebook-blue-muted/90">
                    Fluxo real do Diário Veicular. O exemplo é apenas de formato.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Button type="submit" variant="accent" size="lg" fullWidth>
                      <Search className="w-4 h-4" aria-hidden />
                      Consultar veículo
                    </Button>
                    <Button
                      type="button"
                      variant="inverse"
                      size="lg"
                      fullWidth
                      onClick={() => onNavigate('certidao')}
                    >
                      <FileCheck2 className="w-4 h-4" aria-hidden />
                      Solicitar certidão
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARA QUEM CONSULTA — logo abaixo da consulta ===== */}
      <section className="relative bg-vebook-blue-soft border-b border-vebook-border">
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
      <section id="home-oficinas" className="relative isolate z-10 overflow-hidden bg-vebook-navy border-b border-vebook-mustard/30">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
          <div className="max-w-2xl space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard">Para oficinas</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-vebook-white leading-[1.1]">
              A oficina escreve. O VEBOOK preserva.
            </h2>
            <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed">
              Credenciamento, página própria, painel de gestão e registro de atendimentos que alimentam
              o prontuário do veículo.
            </p>
          </div>

          {/* Trilho de valor — cards clicáveis */}
          <div className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-2 sm:p-3 shadow-vebook overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-vebook-mustard/30">
              {OFFICE_PILLARS.map((cell) => (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => setOpenPillarId(cell.id)}
                  className="group w-full text-left p-5 sm:p-6 space-y-3 cursor-pointer transition-colors hover:bg-vebook-mustard-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vebook-mustard/40"
                >
                  <cell.icon className="w-5 h-5 text-vebook-navy transition group-hover:text-vebook-mustard-deep" aria-hidden />
                  <h3 className="text-base font-bold text-vebook-navy">{cell.title}</h3>
                  <p className="text-sm text-vebook-muted leading-relaxed">{cell.summary}</p>
                  <span className="inline-flex text-xs font-semibold text-vebook-mustard-deep">
                    Saiba mais →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Planos — dois cards iguais */}
          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
            <div className="flex h-full flex-col rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-6 sm:p-7 shadow-vebook transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-vebook-mustard-deep">Mensal</p>
              <p className="mt-3 text-3xl font-bold text-vebook-navy">
                {formatBRL(PLAN_OFFERS.monthly.firstYear)}
                <span className="text-sm font-semibold text-vebook-muted">/mês</span>
              </p>
              <p className="mt-3 flex-1 text-sm text-vebook-muted leading-relaxed">
                Primeiro ano. Depois:{' '}
                <strong className="text-vebook-navy">{formatBRL(PLAN_OFFERS.monthly.renewal)}/mês</strong>
              </p>
              <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={() => startCadastro('monthly')}>
                Fazer cadastro
              </Button>
            </div>

            <div className="relative flex h-full flex-col rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-6 sm:p-7 shadow-vebook transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]">
              <span className="absolute -top-2.5 right-5 text-[10px] font-bold uppercase tracking-wider bg-vebook-mustard text-vebook-navy-deep px-2.5 py-1 rounded-vebook-sm border border-vebook-mustard-deep/40">
                Economia no 1º ano
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-vebook-mustard-deep">Anual</p>
              <p className="mt-3 text-3xl font-bold text-vebook-navy">
                {formatBRL(PLAN_OFFERS.annual.firstYear)}
                <span className="text-sm font-semibold text-vebook-muted">/ano</span>
              </p>
              <p className="mt-3 flex-1 text-sm text-vebook-muted leading-relaxed">
                Economia de {formatBRL(PLAN_OFFERS.annual.firstYearSavings)}. Renovação:{' '}
                <strong className="text-vebook-navy">{formatBRL(PLAN_OFFERS.annual.renewal)}/ano</strong>
              </p>
              <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={() => startCadastro('annual')}>
                Fazer cadastro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONFIANÇA / GOVERNANÇA — bloco compacto ===== */}
      <section className="relative bg-vebook-navy-deep text-vebook-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="max-w-xl space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vebook-mustard">
                Governança
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                Tecnologia a serviço da procedência.
              </h2>
              <p className="text-sm text-vebook-blue-muted leading-relaxed">
                Rastreabilidade, segregação de dados e boas práticas de segurança — sem promessas absolutas.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-vebook-mustard/90 max-w-xs sm:text-right leading-relaxed">
              O VEBOOK organiza o histórico técnico do veículo — escrito pelas oficinas, preservado pela
              plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GOVERNANCE_PILLARS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenGovId(item.id)}
                className="group rounded-vebook-lg border border-vebook-mustard/65 bg-vebook-navy/45 p-4 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
              >
                <item.icon className="w-5 h-5 text-vebook-mustard mb-3" aria-hidden />
                <h3 className="text-base font-bold text-vebook-white">{item.title}</h3>
                <p className="mt-1.5 text-xs text-vebook-blue-muted leading-relaxed">{item.summary}</p>
                <span className="mt-3 inline-flex text-xs font-semibold text-vebook-mustard group-hover:text-vebook-mustard-soft">
                  Saiba mais →
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-vebook border border-vebook-mustard/55 bg-vebook-navy/35 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-vebook-navy-mid/30"
              aria-expanded={faqOpen}
              onClick={() => setFaqOpen((v) => !v)}
            >
              <span className="text-sm font-bold text-vebook-white">Perguntas frequentes</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-vebook-mustard transition-transform ${faqOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {faqOpen && (
              <div className="px-3 pb-3 sm:px-4 space-y-3 border-t border-vebook-mustard/30 pt-3">
                <HomeFaqAccordion />
                <button
                  type="button"
                  onClick={() => onNavigate('transparencia')}
                  className="text-xs font-semibold text-vebook-mustard hover:text-vebook-mustard-soft transition-colors cursor-pointer"
                >
                  FAQ e transparência completos →
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-vebook border border-vebook-mustard/55 bg-vebook-navy/40 px-4 py-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Mail className="w-4 h-4 text-vebook-mustard shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs sm:text-sm text-vebook-blue-muted leading-relaxed">
                <strong className="text-vebook-white font-semibold">Contato</strong>
                {' — '}
                canal institucional; informações oficiais serão ampliadas com a homologação operacional.
              </p>
            </div>
            <Button type="button" variant="accent" size="sm" className="shrink-0" onClick={() => onOpenContato?.()}>
              Abrir contato
            </Button>
          </div>
        </div>
      </section>
      <OfficePillarModal
        pillar={openPillar}
        onClose={() => setOpenPillarId(null)}
        onStartCadastro={() => startCadastro('monthly')}
      />
      <GovernancePillarModal
        pillar={openGovPillar}
        onClose={() => setOpenGovId(null)}
        onOpenContato={onOpenContato}
      />
    </div>
  );
};
