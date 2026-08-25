import React, { useState } from 'react';
import {
  Search,
  Car,
  Wrench,
  History,
  RefreshCw,
  Eye,
  Link2,
  FileCheck2,
  Lock,
  Building2,
  LayoutDashboard,
  Globe2,
  Users,
  Sparkles,
  Shield,
  Fingerprint,
  Layers,
  Mail,
  ArrowDown,
} from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { formatBRL } from '../../lib/currency';
import { PLAN_OFFERS, planPricingFootnote } from '../../data/officePlans';
import { AppView, PlanModality } from '../../types';
import { Button, Card, Input } from '../ui';
import { Logo } from '../layout/Logo';
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

const ProntuarioDemo: React.FC = () => (
  <div
    className="vebook-card-lift bg-vebook-white/95 backdrop-blur-sm rounded-vebook-lg border border-vebook-border shadow-vebook-md overflow-hidden"
    aria-hidden="true"
  >
    <div className="bg-gradient-to-r from-vebook-navy to-vebook-navy-mid px-5 py-4 flex items-center justify-between gap-3">
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-vebook-blue-muted font-semibold">Prontuário veicular</p>
        <p className="text-sm font-semibold text-vebook-white">Identificação do veículo</p>
      </div>
      <span className="shrink-0 px-2.5 py-1 rounded-vebook-sm bg-vebook-navy-deep/60 border border-vebook-blue/30 text-[10px] font-mono text-vebook-blue-muted">
        PLACA
      </span>
    </div>
    <div className="px-5 py-5 space-y-4">
      <p className="text-[10px] uppercase tracking-wider text-vebook-subtle font-semibold">Linha do tempo</p>
      {[
        { title: 'Atendimento registrado', tag: 'Atendimento' },
        { title: 'Manutenção registrada', tag: 'Manutenção' },
        { title: 'Atendimento registrado', tag: 'Atendimento' },
        { title: 'Manutenção registrada', tag: 'Manutenção' },
      ].map((row, i) => (
        <div key={`${row.title}-${i}`} className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-vebook-blue" />
            {i < 3 && <span className="w-px flex-1 min-h-7 bg-vebook-border mt-1" />}
          </div>
          <div className="flex-1 space-y-1.5 pb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-vebook-navy">{row.title}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-vebook-sm bg-vebook-blue-soft text-vebook-navy">
                {row.tag}
              </span>
            </div>
            <p className="text-[11px] text-vebook-subtle uppercase tracking-wide">Data</p>
            <div className="h-2 rounded-vebook-sm bg-vebook-gray w-[75%]" />
          </div>
        </div>
      ))}
      <p className="text-[10px] text-vebook-subtle pt-1 border-t border-vebook-border">
        Representação conceitual da interface — sem dados reais.
      </p>
    </div>
  </div>
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

  const scrollToConsulta = () => {
    document.getElementById('home-consulta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('home-plate-input')?.focus(), 400);
  };

  const scrollToOficinas = () => {
    document.getElementById('home-oficinas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="relative isolate overflow-x-hidden pb-0">
      <HomeAtmosphere />

      {/* ========== 01 ENTRADA ========== */}
      <section className="relative bg-gradient-to-b from-vebook-navy-deep via-vebook-navy to-vebook-navy-mid text-vebook-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 space-y-12">
          <div className="vebook-reveal text-center space-y-5 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <Logo size="lg" variant="light" />
            </div>
            <p className="text-base sm:text-lg text-vebook-blue-muted font-medium leading-relaxed">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-vebook-white leading-snug pt-2">
              Você quer fazer uma consulta ou você é uma oficina?
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
            <article className="vebook-reveal vebook-reveal-delay-1 vebook-card-lift rounded-vebook-lg border border-vebook-blue/25 bg-gradient-to-br from-vebook-white to-vebook-blue-soft p-6 sm:p-8 space-y-5 shadow-vebook-md text-vebook-navy">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-vebook bg-vebook-navy text-vebook-white flex items-center justify-center">
                  <Car className="w-5 h-5" aria-hidden />
                </span>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">Quero consultar</h2>
              </div>
              <p className="text-sm text-vebook-muted leading-relaxed">
                Consulte o histórico disponível de um veículo.
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={scrollToConsulta}>
                Consultar veículo
              </Button>
            </article>

            <article className="vebook-reveal vebook-reveal-delay-2 vebook-card-lift rounded-vebook-lg border border-vebook-mustard/40 bg-gradient-to-br from-vebook-white to-vebook-mustard-soft p-6 sm:p-8 space-y-5 shadow-vebook-md text-vebook-navy">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-vebook bg-vebook-navy text-vebook-mustard flex items-center justify-center">
                  <Wrench className="w-5 h-5" aria-hidden />
                </span>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">Sou uma oficina</h2>
              </div>
              <p className="text-sm text-vebook-muted leading-relaxed">
                Conheça o sistema e torne sua oficina credenciada.
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={scrollToOficinas}>
                Sou oficina
              </Button>
            </article>
          </div>

          <div className="flex justify-center text-vebook-blue-muted/70">
            <ArrowDown className="w-5 h-5 animate-bounce" aria-hidden />
          </div>
        </div>
      </section>

      {/* ========== 02 MOTORISTA / USUÁRIO ========== */}
      <section className="relative bg-gradient-to-b from-vebook-blue-soft via-vebook-surface to-vebook-blue-soft/40 border-y border-vebook-border">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12 sm:space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-vebook-blue">Para quem consulta</p>
            <h2 className="vebook-section-title">O histórico do veículo também conta a sua história.</h2>
            <p className="vebook-section-lead">
              O VEBOOK organiza registros técnicos de manutenção e atendimento associados ao veículo —
              com consulta clara e continuidade ao longo do tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: History, title: 'Histórico', text: 'O veículo pode acumular registros de manutenções e atendimentos realizados por oficinas participantes.' },
              { icon: RefreshCw, title: 'Continuidade', text: 'O histórico acompanha o veículo ao longo de sua vida útil.' },
              { icon: Eye, title: 'Transparência', text: 'A consulta permite verificar a existência de registros antes de solicitar uma certidão.' },
              { icon: Link2, title: 'Rastreabilidade', text: 'Os registros possuem origem e identificação dentro da plataforma.' },
              { icon: FileCheck2, title: 'Certidão', text: 'Quando necessário, o usuário pode solicitar uma Certidão VEBOOK com o histórico disponível.' },
              { icon: Lock, title: 'Privacidade', text: 'Dados pessoais do cliente não fazem parte do prontuário público.' },
            ].map((card) => (
              <Card key={card.title} as="article" className="vebook-card-lift space-y-3 h-full bg-gradient-to-b from-vebook-white to-vebook-blue-soft/30">
                <card.icon className="w-5 h-5 text-vebook-blue" aria-hidden />
                <h3 className="text-base font-semibold text-vebook-navy">{card.title}</h3>
                <p className="text-sm text-vebook-muted leading-relaxed">{card.text}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <ProntuarioDemo />

            <div id="home-consulta" className="vebook-card-lift rounded-vebook-lg border border-vebook-border bg-vebook-white shadow-vebook-md p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-vebook-navy tracking-tight">Consulte um veículo</h3>
                <p className="text-sm text-vebook-muted leading-relaxed">
                  Informe a placa para verificar o histórico disponível no VEBOOK. A consulta inicial é gratuita.
                </p>
              </div>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <label htmlFor="home-plate-input" className="vebook-label">
                  Digite a placa
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
                    Consultar
                  </Button>
                </div>
                <p id="home-plate-hint" className="vebook-hint">
                  A consulta utiliza o fluxo real do Diário Veicular. O exemplo no campo é apenas de formato.
                </p>
                {plateError && (
                  <p id="home-plate-error" className="vebook-error-text" role="alert">
                    {plateError}
                  </p>
                )}
              </form>
              <button
                type="button"
                onClick={() => onNavigate('certidao')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-vebook-navy hover:text-vebook-blue transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" aria-hidden />
                Conhecer a Certidão VEBOOK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 03 OFICINAS ========== */}
      <section id="home-oficinas" className="relative bg-vebook-gray border-b border-vebook-border">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-12 sm:space-y-14">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-vebook-muted">Para oficinas</p>
            <h2 className="vebook-section-title">O VEBOOK também é infraestrutura para a sua oficina.</h2>
            <p className="vebook-section-lead">
              Organize atendimentos, registre o histórico dos veículos, fortaleça a credibilidade e
              participe da rede VEBOOK.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: Building2, title: 'Oficina credenciada', text: 'Faça parte da rede VEBOOK.' },
              { icon: History, title: 'Histórico', text: 'Registre os atendimentos realizados e contribua para a continuidade do prontuário do veículo.' },
              { icon: LayoutDashboard, title: 'Gestão', text: 'Tenha ferramentas para organizar clientes, veículos, serviços, agenda e retornos.' },
              { icon: Globe2, title: 'Visibilidade', text: 'Tenha uma presença própria dentro do ecossistema VEBOOK.' },
              { icon: Users, title: 'Relacionamento', text: 'Acompanhe clientes e veículos atendidos pela oficina.' },
              { icon: Sparkles, title: 'Oportunidades', text: 'Faça parte de uma infraestrutura que conecta oficinas e usuários de veículos.' },
            ].map((card) => (
              <Card key={card.title} as="article" className="vebook-card-lift space-y-3 h-full bg-gradient-to-b from-vebook-white to-vebook-gray">
                <card.icon className="w-5 h-5 text-vebook-navy" aria-hidden />
                <h3 className="text-base font-semibold text-vebook-navy">{card.title}</h3>
                <p className="text-sm text-vebook-muted leading-relaxed">{card.text}</p>
              </Card>
            ))}
          </div>

          {/* Fluxo visual oficina → prontuário */}
          <div className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 sm:p-8 shadow-vebook">
            <p className="text-xs font-semibold uppercase tracking-wider text-vebook-muted mb-5">
              Participação da oficina no histórico
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-3 sm:gap-2">
              {['Oficina', 'Atendimento', 'Registro', 'Prontuário', 'Cliente / Veículo'].map((label, i, arr) => (
                <React.Fragment key={label}>
                  <div className="flex-1 min-w-[7rem] rounded-vebook bg-vebook-navy text-vebook-white text-center px-3 py-3 text-xs sm:text-sm font-semibold">
                    {label}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="hidden sm:block text-vebook-blue font-bold px-1" aria-hidden>
                      →
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Valores reais */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-vebook-navy tracking-tight">
                Seja uma oficina credenciada
              </h3>
              <p className="text-sm text-vebook-muted">{planPricingFootnote()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="vebook-card-lift space-y-4 bg-gradient-to-b from-vebook-white to-vebook-surface">
                <p className="text-xs font-semibold uppercase tracking-wider text-vebook-blue">Plano mensal</p>
                <div>
                  <p className="text-sm text-vebook-muted">Primeiro ano</p>
                  <p className="text-3xl font-bold text-vebook-navy">
                    {formatBRL(PLAN_OFFERS.monthly.firstYear)}
                    <span className="text-base font-semibold text-vebook-muted">/mês</span>
                  </p>
                </div>
                <div className="rounded-vebook bg-vebook-gray px-3 py-2 text-sm text-vebook-muted">
                  A partir do segundo ano:{' '}
                  <strong className="text-vebook-navy">{formatBRL(PLAN_OFFERS.monthly.renewal)}/mês</strong>
                </div>
                <Button variant="primary" fullWidth onClick={() => startCadastro('monthly')}>
                  Cadastrar — plano mensal
                </Button>
              </Card>

              <Card className="vebook-card-lift space-y-4 border-vebook-navy/20 bg-gradient-to-b from-vebook-white to-vebook-mustard-soft/40 relative">
                <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-wider bg-vebook-mustard text-vebook-navy-deep px-2.5 py-1 rounded-vebook-sm">
                  Destaque
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-vebook-blue pt-1">Plano anual</p>
                <div>
                  <p className="text-sm text-vebook-muted">Primeiro ano</p>
                  <p className="text-3xl font-bold text-vebook-navy">
                    {formatBRL(PLAN_OFFERS.annual.firstYear)}
                    <span className="text-base font-semibold text-vebook-muted">/ano</span>
                  </p>
                </div>
                <div className="rounded-vebook bg-vebook-mustard-soft border border-vebook-mustard/30 px-3 py-2 text-sm text-vebook-navy">
                  Economia de {formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano. Renovação:{' '}
                  <strong>{formatBRL(PLAN_OFFERS.annual.renewal)}/ano</strong>
                </div>
                <Button variant="primary" fullWidth onClick={() => startCadastro('annual')}>
                  Cadastrar — plano anual
                </Button>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => onNavigate('oficinas')}>
                Conhecer o VEBOOK para oficinas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 04 TECNOLOGIA / CONFIANÇA ========== */}
      <section className="relative bg-gradient-to-b from-vebook-navy-deep via-vebook-navy to-vebook-navy-deep text-vebook-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-14 sm:space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-vebook-blue">Tecnologia e confiança</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-vebook-white">
              Infraestrutura para organizar o histórico veicular.
            </h2>
            <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed">
              Oficinas, atendimentos e registros convergem em um prontuário consultável — e, quando
              necessário, em certidão.
            </p>
          </div>

          {/* Pipeline tecnológico */}
          <div className="rounded-vebook-lg border border-vebook-navy-mid bg-vebook-navy/50 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch gap-2 sm:gap-2">
              {['Oficinas', 'Atendimentos', 'Registros', 'Histórico', 'Certidões'].map((label, i, arr) => (
                <React.Fragment key={label}>
                  <div className="flex-1 min-w-[6.5rem] rounded-vebook bg-vebook-navy-mid border border-vebook-blue/20 text-center px-3 py-3 text-xs sm:text-sm font-semibold text-vebook-white">
                    {label}
                  </div>
                  {i < arr.length - 1 && (
                    <span className="hidden sm:flex items-center text-vebook-blue px-0.5" aria-hidden>
                      ↓
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Segurança */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-vebook-white">Segurança e organização</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Link2, title: 'Rastreabilidade', text: 'Os registros possuem identificação própria.' },
                { icon: Layers, title: 'Integridade', text: 'Estrutura preparada para controle e auditoria.' },
                { icon: Fingerprint, title: 'Segregação', text: 'Dados de controle das oficinas não fazem parte do prontuário público.' },
                { icon: Shield, title: 'Segurança', text: 'Aplicação de boas práticas de proteção de dados e acesso.' },
              ].map((card) => (
                <div
                  key={card.title}
                  className="vebook-card-lift rounded-vebook-md border border-vebook-navy-mid bg-gradient-to-b from-vebook-navy-mid/80 to-vebook-navy/60 p-5 space-y-3"
                >
                  <card.icon className="w-5 h-5 text-vebook-blue" aria-hidden />
                  <h4 className="text-sm font-semibold text-vebook-white">{card.title}</h4>
                  <p className="text-sm text-vebook-blue-muted leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacidade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-vebook-white">Privacidade</h3>
              <p className="text-sm text-vebook-blue-muted leading-relaxed">
                O prontuário é sobre o veículo e seus registros técnicos. Dados pessoais dos clientes
                permanecem no ambiente de controle da oficina e não são exibidos no prontuário público.
              </p>
              <p className="text-sm text-vebook-blue-muted leading-relaxed">
                <strong className="text-vebook-white">Cliente ≠ proprietário.</strong> O cliente existe
                no ambiente da oficina para controle interno. O prontuário VEBOOK acompanha o veículo.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('transparencia')}
                className="text-sm font-semibold text-vebook-blue hover:text-vebook-white transition-colors cursor-pointer"
              >
                Transparência e LGPD →
              </button>
            </div>

            <div className="rounded-vebook-lg border border-vebook-navy-mid bg-vebook-navy/50 p-5 sm:p-6 space-y-4">
              <h3 className="text-lg font-bold text-vebook-white">
                Um veículo pode passar por muitas oficinas ao longo da vida.
              </h3>
              <div className="space-y-3 text-sm">
                {['Oficina A', 'Oficina B', 'Oficina C'].map((label) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 font-semibold text-vebook-blue-muted">{label}</span>
                    <span className="text-vebook-blue" aria-hidden>
                      ↓
                    </span>
                    <span className="rounded-vebook-sm bg-vebook-navy-mid px-3 py-1.5 text-vebook-white border border-vebook-blue/20">
                      Registro
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-vebook-navy-mid flex items-center gap-3">
                  <span className="w-24 shrink-0 font-semibold text-vebook-mustard">Todos</span>
                  <span className="text-vebook-mustard" aria-hidden>
                    ↓
                  </span>
                  <span className="rounded-vebook-sm bg-vebook-mustard/20 border border-vebook-mustard/40 px-3 py-1.5 text-vebook-mustard font-semibold">
                    Prontuário do veículo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-vebook-white">Perguntas frequentes</h3>
              <p className="text-sm text-vebook-blue-muted">
                Conteúdo institucional já publicado no VEBOOK — reunido aqui para consulta rápida.
              </p>
            </div>
            <HomeFaqAccordion />
            <button
              type="button"
              onClick={() => onNavigate('transparencia')}
              className="text-sm font-semibold text-vebook-blue hover:text-vebook-white transition-colors cursor-pointer"
            >
              Ver FAQ completo →
            </button>
          </div>

          {/* Contato */}
          <div className="rounded-vebook-lg border border-vebook-navy-mid bg-vebook-navy/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-vebook-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-vebook-blue" aria-hidden />
                Contato institucional
              </h3>
              <p className="text-sm text-vebook-blue-muted max-w-lg leading-relaxed">
                Canais oficiais de atendimento serão disponibilizados com a homologação operacional da
                plataforma. Use o formulário institucional já existente no VEBOOK.
              </p>
            </div>
            <Button
              variant="inverse"
              size="lg"
              className="shrink-0"
              onClick={() => {
                if (onOpenContato) onOpenContato();
              }}
            >
              Abrir contato
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
