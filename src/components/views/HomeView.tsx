import React, { useState } from 'react';
import {
  Search,
  FileCheck2,
  Shield,
  Link2,
  Fingerprint,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { AppView } from '../../types';
import { Button, Card, Input } from '../ui';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
}

type HomePlatformMetrics = {
  vehiclesRegistered?: number;
  participatingOffices?: number;
  servicesRegistered?: number;
  consultations?: number;
};

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

/** Painel abstrato — ilustra o prontuário sem dados reais */
const ProntuarioPreview: React.FC = () => (
  <div
    className="bg-vebook-white rounded-vebook-lg border border-vebook-border shadow-vebook-md overflow-hidden"
    aria-hidden="true"
  >
    <div className="bg-vebook-navy px-5 py-4 flex items-center justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-vebook-blue-muted font-semibold">
          Prontuário veicular
        </p>
        <p className="text-sm font-semibold text-vebook-white truncate">Identificação do veículo</p>
      </div>
      <div className="shrink-0 px-2.5 py-1 rounded-vebook-sm bg-vebook-navy-mid border border-vebook-navy-mid text-[10px] font-mono text-vebook-blue-muted">
        PLACA
      </div>
    </div>

    <div className="px-5 py-4 border-b border-vebook-border grid grid-cols-3 gap-3">
      {[
        { label: 'Quilometragem', value: '—' },
        { label: 'Registros', value: '—' },
        { label: 'Oficinas', value: '—' },
      ].map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-vebook-subtle">{item.label}</p>
          <p className="text-sm font-semibold text-vebook-navy font-mono">{item.value}</p>
        </div>
      ))}
    </div>

    <div className="px-5 py-5 space-y-4">
      <p className="text-[10px] uppercase tracking-wider text-vebook-subtle font-semibold">
        Linha do tempo
      </p>
      {[
        { type: 'Atendimento', tone: 'bg-vebook-blue-soft text-vebook-navy' },
        { type: 'Manutenção', tone: 'bg-vebook-navy-soft text-vebook-navy' },
        { type: 'Atendimento', tone: 'bg-vebook-blue-soft text-vebook-navy' },
      ].map((row, i) => (
        <div key={`${row.type}-${i}`} className="flex gap-3 items-start">
          <div className="flex flex-col items-center pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-vebook-blue" />
            {i < 2 && <span className="w-px flex-1 min-h-8 bg-vebook-border mt-1" />}
          </div>
          <div className="flex-1 pb-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-vebook-subtle">
                Data
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-vebook-sm ${row.tone}`}>
                {row.type}
              </span>
            </div>
            <div className="h-2.5 rounded-vebook-sm bg-vebook-gray w-[88%]" />
            <div className="h-2 rounded-vebook-sm bg-vebook-gray/70 w-[55%]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CertidaoPreview: React.FC = () => (
  <div
    className="bg-vebook-white rounded-vebook-lg border border-vebook-border shadow-vebook-md p-5 sm:p-6 space-y-4"
    aria-hidden="true"
  >
    <div className="flex items-start justify-between gap-3 border-b border-vebook-border pb-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-tight text-vebook-navy">VEBOOK</p>
        <p className="text-[11px] text-vebook-muted">Certidão de Histórico Veicular</p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-[10px] uppercase tracking-wide text-vebook-subtle">Número</p>
        <p className="text-[11px] font-mono font-semibold text-vebook-navy">VBK — — — —</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      {[
        { label: 'Veículo', value: 'Identificação no documento' },
        { label: 'Emissor', value: 'Plataforma VEBOOK' },
        { label: 'Registros', value: 'Conforme disponibilidade' },
        { label: 'Autenticação', value: 'Código verificável' },
      ].map((row) => (
        <div
          key={row.label}
          className="rounded-vebook bg-vebook-gray/80 border border-vebook-border px-3 py-2.5 space-y-0.5"
        >
          <p className="text-[10px] uppercase tracking-wide text-vebook-subtle">{row.label}</p>
          <p className="text-vebook-navy font-medium">{row.value}</p>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between pt-1 border-t border-vebook-border">
      <p className="text-[10px] text-vebook-subtle">Representação visual do documento</p>
      <FileCheck2 className="w-5 h-5 text-vebook-blue" />
    </div>
  </div>
);

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchPlate,
  onOpenCredenciamento,
  onOpenJaCredenciado: _onOpenJaCredenciado,
}) => {
  const [inputPlate, setInputPlate] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);
  const platformMetrics = loadHomePlatformMetrics();

  const scrollToConsulta = () => {
    const el = document.getElementById('home-consulta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.querySelector('input')?.focus();
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
      {/* 1. HERO — composição em duas colunas */}
      <section className="relative bg-vebook-white border-b border-vebook-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-7 text-center lg:text-left">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-vebook-blue">
                  Plataforma de histórico veicular
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-vebook-navy leading-[1.15]">
                  O histórico do veículo em um só lugar.
                </h1>
                <p className="text-base sm:text-lg text-vebook-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Registros de serviços e manutenção organizados para acompanhar a vida do veículo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <Button variant="primary" size="lg" fullWidth className="sm:w-auto" onClick={scrollToConsulta}>
                  Consultar veículo
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto"
                  onClick={() => onNavigate('oficinas')}
                >
                  Sou uma oficina
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 sm:-inset-4 rounded-vebook-lg bg-vebook-blue-soft/60 -z-10" />
              <ProntuarioPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 2. O QUE É O VEBOOK */}
      <section className="bg-vebook-gray/60 border-b border-vebook-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="vebook-section-title">O prontuário histórico do veículo.</h2>
            <p className="vebook-section-lead">
              O VEBOOK organiza registros de serviços e manutenção associados ao veículo, com origem
              identificável e consulta clara.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                n: '01',
                title: 'Histórico',
                text: 'Registros de serviços e manutenções realizados por oficinas participantes.',
              },
              {
                n: '02',
                title: 'Rastreabilidade',
                text: 'Cada registro possui origem e identificação própria dentro da plataforma.',
              },
              {
                n: '03',
                title: 'Continuidade',
                text: 'O histórico acompanha o veículo ao longo de sua vida útil.',
              },
            ].map((card) => (
              <Card as="article" key={card.n} className="space-y-4 h-full">
                <span className="text-xs font-semibold tracking-widest text-vebook-blue">{card.n}</span>
                <h3 className="text-lg font-semibold text-vebook-navy uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-sm text-vebook-muted leading-relaxed">{card.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CONSULTA — bloco de destaque */}
      <section id="home-consulta" className="bg-vebook-navy">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-vebook-white">
                Consulte o histórico de um veículo
              </h2>
              <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed">
                A consulta inicial é gratuita e apresenta a existência de histórico registrado no
                VEBOOK.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-vebook-white rounded-vebook-lg border border-vebook-navy-mid/20 p-5 sm:p-7 space-y-4 shadow-vebook-md"
              >
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
                  A consulta inicial apresenta apenas a existência do histórico. A Certidão VEBOOK
                  apresenta os registros disponíveis.
                </p>
                {plateError && (
                  <p id="home-plate-error" className="vebook-error-text" role="alert">
                    {plateError}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMO CONSULTAR — 3 etapas */}
      <section className="bg-vebook-white border-b border-vebook-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="vebook-section-title">Como funciona a consulta</h2>
            <p className="vebook-section-lead">
              Três passos para verificar e, se necessário, documentar o histórico disponível.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                n: '01',
                title: 'Consulte',
                text: 'Informe a placa do veículo.',
              },
              {
                n: '02',
                title: 'Verifique',
                text: 'Veja se existem registros no VEBOOK.',
              },
              {
                n: '03',
                title: 'Emita',
                text: 'Caso precise do histórico documentado, solicite a Certidão VEBOOK.',
              },
            ].map((step) => (
              <Card as="article" key={step.n} className="space-y-3 h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-vebook-blue" />
                <span className="text-xs font-semibold tracking-widest text-vebook-blue">{step.n}</span>
                <h3 className="text-lg font-semibold text-vebook-navy">{step.title}</h3>
                <p className="text-sm text-vebook-muted leading-relaxed">{step.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OFICINAS */}
      <section className="bg-vebook-gray/60 border-b border-vebook-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Card tone="white" padding="lg" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-vebook-blue">
                <Building2 className="w-5 h-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider">Oficinas</span>
              </div>
              <h2 className="vebook-section-title">Oficinas participantes</h2>
              <p className="vebook-section-lead max-w-xl">
                As oficinas participantes registram atendimentos realizados em seus sistemas,
                formando uma linha histórica do veículo.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button variant="primary" size="lg" fullWidth onClick={() => onNavigate('oficinas')}>
                Conheça as oficinas
              </Button>
              <Button variant="secondary" size="lg" fullWidth onClick={onOpenCredenciamento}>
                Cadastre sua oficina
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* 6. CONCEITO DO PRONTUÁRIO — timeline abstrata */}
      <section className="bg-vebook-navy-deep text-vebook-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-vebook-white">
                Uma linha do tempo do veículo
              </h2>
              <p className="text-sm sm:text-base text-vebook-blue-muted leading-relaxed max-w-md">
                Cada atendimento registrado passa a integrar o prontuário. A estrutura abaixo é uma
                representação do conceito — sem dados de veículos reais.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('como-funciona')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-vebook-blue hover:text-vebook-white transition-colors cursor-pointer"
              >
                Como o histórico é construído
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-0 border border-vebook-navy-mid rounded-vebook-lg overflow-hidden bg-vebook-navy/40">
              {[
                { label: 'Data', title: 'Atendimento registrado' },
                { label: 'Data', title: 'Manutenção registrada' },
                { label: 'Data', title: 'Atendimento registrado' },
              ].map((item, i) => (
                <div
                  key={`${item.title}-${i}`}
                  className={`px-5 py-4 flex gap-4 items-start ${
                    i < 2 ? 'border-b border-vebook-navy-mid' : ''
                  }`}
                >
                  <div className="shrink-0 w-16 pt-0.5">
                    <p className="text-[10px] uppercase tracking-wider text-vebook-subtle font-semibold">
                      {item.label}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-vebook-white">{item.title}</p>
                    <div className="h-2 rounded-vebook-sm bg-vebook-navy-mid w-[70%]" />
                    <div className="h-1.5 rounded-vebook-sm bg-vebook-navy-mid/70 w-[40%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CERTIDÃO */}
      <section className="bg-vebook-white border-b border-vebook-border">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-5 order-2 lg:order-1">
              <CertidaoPreview />
            </div>
            <div className="space-y-5 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-vebook-blue">
                <FileCheck2 className="w-5 h-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider">Documento</span>
              </div>
              <h2 className="vebook-section-title">Certidão VEBOOK</h2>
              <p className="vebook-section-lead">
                Quando você precisa documentar o histórico disponível, pode solicitar uma Certidão
                VEBOOK.
              </p>
              <ul className="space-y-2.5 text-sm text-vebook-muted">
                <li className="flex gap-2">
                  <span className="text-vebook-blue font-semibold">·</span>
                  Representação dos registros disponíveis no momento da emissão
                </li>
                <li className="flex gap-2">
                  <span className="text-vebook-blue font-semibold">·</span>
                  Identificação do veículo e código de autenticação
                </li>
                <li className="flex gap-2">
                  <span className="text-vebook-blue font-semibold">·</span>
                  Documento para consulta e conferência
                </li>
              </ul>
              <Button variant="primary" size="lg" onClick={() => onNavigate('certidao')}>
                Conhecer a Certidão
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONFIANÇA E SEGURANÇA */}
      <section className="bg-vebook-gray/60">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="vebook-section-title">Organização e rastreabilidade</h2>
            <p className="vebook-section-lead">
              O VEBOOK trata informações com responsabilidade, priorizando origem clara dos registros
              e distinção entre dados técnicos do veículo e dados pessoais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Building2,
                title: 'Origem dos registros',
                text: 'Registros originados em oficinas participantes.',
              },
              {
                icon: Link2,
                title: 'Identificação',
                text: 'Cada registro possui identificação da origem na plataforma.',
              },
              {
                icon: Fingerprint,
                title: 'Separação de dados',
                text: 'Dados técnicos do veículo e dados pessoais tratados de forma distinta.',
              },
              {
                icon: Shield,
                title: 'Segurança',
                text: 'Práticas de segurança da informação aplicadas à plataforma.',
              },
            ].map((item) => (
              <Card as="article" key={item.title} className="space-y-3 h-full">
                <item.icon className="w-5 h-5 text-vebook-blue" aria-hidden />
                <h3 className="text-sm font-semibold text-vebook-navy">{item.title}</h3>
                <p className="text-sm text-vebook-muted leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('transparencia')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-vebook-navy hover:text-vebook-blue transition-colors cursor-pointer"
            >
              Transparência e privacidade
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      {/* Métricas reais — só quando houver dados comprovados */}
      {hasRealMetrics(platformMetrics) && (
        <section
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-14"
          aria-label="Indicadores da plataforma"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {typeof platformMetrics.vehiclesRegistered === 'number' && (
              <Card className="text-center space-y-1">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.vehiclesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Veículos registrados</p>
              </Card>
            )}
            {typeof platformMetrics.participatingOffices === 'number' && (
              <Card className="text-center space-y-1">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.participatingOffices.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Oficinas participantes</p>
              </Card>
            )}
            {typeof platformMetrics.servicesRegistered === 'number' && (
              <Card className="text-center space-y-1">
                <p className="text-2xl font-bold text-vebook-navy">
                  {platformMetrics.servicesRegistered.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-vebook-muted">Serviços registrados</p>
              </Card>
            )}
            {typeof platformMetrics.consultations === 'number' && (
              <Card className="text-center space-y-1">
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
