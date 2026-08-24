import React, { useState } from 'react';
import { 
  Wrench, 
  Globe, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Building2, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  ExternalLink, 
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  Star,
  FileSpreadsheet
} from 'lucide-react';
import { WORKSHOPS_MOCK } from '../../data/mockData';
import { OFFICE_BENEFITS } from '../../data/commercialTerms';
import { OFFICE_ANNUAL, OFFICE_PRICING } from '../../data/officePlans';
import { formatBRL } from '../../lib/currency';
import { searchPublicOffices } from '../../data/officeStore';
import { useOfficeStore } from '../../hooks/useOfficeStore';
import { workshopHost } from '../../lib/slug';
import { AppView, PlanModality } from '../../types';

interface ParaOficinasViewProps {
  onNavigate: (view: AppView) => void;
  onStartCadastro: (modality: PlanModality) => void;
  onOpenPainel: () => void;
  onOpenWorkshop: (slug: string) => void;
}

export const ParaOficinasView: React.FC<ParaOficinasViewProps> = ({
  onNavigate,
  onStartCadastro,
  onOpenPainel,
  onOpenWorkshop,
}) => {
  useOfficeStore();
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('ws-01');
  const [modality, setModality] = useState<PlanModality>('monthly');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const selectedWorkshop = WORKSHOPS_MOCK.find(w => w.id === selectedWorkshopId) || WORKSHOPS_MOCK[0];
  const publicOffices = searchPublicOffices(query, city, uf);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header Hero Oficinas */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-50 text-sky-900 rounded-full border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Rede de Oficinas Credenciadas VEBOOK</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B1E36] tracking-tight">
            Tecnologia de Gestão e Autoridade Técnica para a sua Oficina
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Mais do que um software de gestão: sua oficina passa a emitir registros oficiais no Diário Veicular Nacional e ganha um <strong>endereço digital exclusivo</strong> para atrair e reter clientes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onStartCadastro(modality)}
              className="px-7 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer"
            >
              Cadastrar minha oficina
            </button>
            <button
              onClick={onOpenPainel}
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Já sou credenciado (acessar painel)
            </button>
          </div>
        </div>

        {/* O QUE A OFICINA RECEBE — apenas recursos desta etapa */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0B1E36]">O que a oficina recebe</h2>
            <p className="text-sm text-slate-600">Recursos disponíveis nesta etapa do ecossistema. Sem promessas de módulos ainda não implementados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICE_BENEFITS.map((item) => (
              <div key={item.title} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
                <h3 className="font-bold text-[#0B1E36] text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PREÇO E CONDIÇÕES — visíveis antes de iniciar o cadastro */}
        <section id="precos-oficinas" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">Preço e condições</h2>
            <p className="text-sm text-slate-600">
              Primeiro ano: {formatBRL(OFFICE_PRICING.year1Monthly)}/mês. A partir do segundo ano: {formatBRL(OFFICE_PRICING.year2Monthly)}/mês.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => setModality('monthly')}
              className={`text-left bg-white rounded-3xl border p-6 space-y-3 cursor-pointer ${
                modality === 'monthly' ? 'border-[#0B1E36] ring-2 ring-[#0B1E36]/15' : 'border-slate-200'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Plano mensal</p>
              <p className="text-3xl font-black text-[#0B1E36]">{formatBRL(OFFICE_PRICING.year1Monthly)}<span className="text-base font-bold text-slate-500">/mês</span></p>
              <p className="text-sm text-slate-600">Cobrança recorrente no cartão no primeiro ano.</p>
              <p className="text-sm font-bold text-slate-800">A partir do segundo ano: {formatBRL(OFFICE_PRICING.year2Monthly)}/mês.</p>
            </button>
            <button
              type="button"
              onClick={() => setModality('annual')}
              className={`text-left bg-white rounded-3xl border p-6 space-y-3 cursor-pointer ${
                modality === 'annual' ? 'border-[#0B1E36] ring-2 ring-[#0B1E36]/15' : 'border-slate-200'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Plano anual · 10% de desconto</p>
              <p className="text-3xl font-black text-[#0B1E36]">{formatBRL(OFFICE_ANNUAL.year1Net)}<span className="text-base font-bold text-slate-500">/ano</span></p>
              <p className="text-sm text-slate-600">
                {formatBRL(OFFICE_PRICING.year1Monthly)} × 12 = {formatBRL(OFFICE_ANNUAL.year1Gross)}. Com 10% de desconto: {formatBRL(OFFICE_ANNUAL.year1Net)}.
              </p>
              <p className="text-sm font-bold text-slate-800">
                Segundo ano: {formatBRL(OFFICE_PRICING.year2Monthly)} × 12 = {formatBRL(OFFICE_ANNUAL.year2Gross)}; com 10% = {formatBRL(OFFICE_ANNUAL.year2Net)}/ano.
              </p>
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Plano anual com 10% de desconto sobre o valor vigente. A alteração de preço do segundo ano permanece visível antes da contratação.
          </p>
          <div className="text-center">
            <button
              onClick={() => onStartCadastro(modality)}
              className="px-8 py-3.5 rounded-xl bg-[#0B1E36] text-white font-extrabold text-sm cursor-pointer"
            >
              Cadastrar minha oficina
            </button>
          </div>
        </section>

        {/* BUSCA PÚBLICA DE OFICINAS ATIVAS */}
        <section id="rede-oficinas" className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0B1E36]">Encontre oficinas da rede VEBOOK</h2>
            <p className="text-sm text-slate-600">Somente oficinas ativas, com pagamento confirmado e autorização para publicação. Dados privados do responsável não são exibidos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome ou serviço"
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade ou região"
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm"
            />
            <input
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="UF"
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm uppercase"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicOffices.map((office) => (
              <article key={office.officeId} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div>
                  <h3 className="font-extrabold text-[#0B1E36]">{office.name}</h3>
                  <p className="text-xs text-slate-600">{office.city} — {office.state}</p>
                  <p className="text-xs text-slate-500 mt-1">{(office.specialties || office.segments || []).slice(0, 4).join(' · ')}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-500">{workshopHost(office.slug)}</span>
                  <button
                    type="button"
                    onClick={() => onOpenWorkshop(office.slug)}
                    className="px-3 py-2 rounded-lg bg-[#0B1E36] text-white text-xs font-bold cursor-pointer"
                  >
                    Ver oficina
                  </button>
                </div>
              </article>
            ))}
            {publicOffices.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma oficina ativa encontrada com esses filtros.</p>
            ) : null}
          </div>
        </section>

        {/* DEMONSTRAÇÃO INTERATIVA: A PÁGINA PÚBLICA DA OFICINA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase text-sky-800 tracking-wider block">Recurso Exclusivo para Credenciados</span>
              <h2 className="text-2xl font-extrabold text-[#0B1E36]">
                Simulador do Perfil Público da Oficina Parceira
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Veja como os clientes e motoristas da sua região encontram a sua oficina na web.
              </p>
            </div>

              {/* Alternador de oficinas */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Selecionar oficina:</span>
                  <select
                    value={selectedWorkshopId}
                    onChange={(e) => setSelectedWorkshopId(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 font-bold text-xs text-[#0B1E36] bg-slate-50 cursor-pointer"
                  >
                    {WORKSHOPS_MOCK.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => onOpenWorkshop(selectedWorkshop.subdomain.split('.')[0])}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>Abrir Site Oficial Completo da Oficina</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
          </div>

          {/* MOCKUP DO PERFIL PÚBLICO DA OFICINA */}
          <div className="bg-slate-50 rounded-2xl border border-slate-300 overflow-hidden shadow-inner">
            
            {/* Barra de Navegador do Perfil */}
            <div className="bg-slate-200 px-4 py-2.5 flex items-center gap-2 text-xs text-slate-600 border-b border-slate-300">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white py-1 px-3 rounded-md text-[11px] font-mono text-slate-700 flex items-center justify-between border border-slate-300">
                <span>https://{selectedWorkshop.subdomain}</span>
                <span className="text-[10px] text-emerald-700 font-bold">● Certificado SSL VEBOOK</span>
              </div>
            </div>

            {/* Conteúdo da Página da Oficina */}
            <div className="p-6 sm:p-8 bg-white space-y-8">
              
              {/* Header do Perfil */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Oficina Credenciada VEBOOK desde {new Date(selectedWorkshop.certifiedSince).getFullYear()}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
                    {selectedWorkshop.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                    {selectedWorkshop.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Simulação: Abrir conversa com ${selectedWorkshop.name} no WhatsApp (${selectedWorkshop.whatsapp})`)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </button>
                  <button
                    onClick={() => alert(`Simulação: Ligar para ${selectedWorkshop.phone}`)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{selectedWorkshop.phone}</span>
                  </button>
                </div>
              </div>

              {/* Informações e Métricas da Oficina */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Localização e Horários */}
                <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#0B1E36] uppercase text-[11px] block">
                    Localização & Horário
                  </span>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedWorkshop.address} · {selectedWorkshop.city} - {selectedWorkshop.state}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedWorkshop.businessHours}</span>
                  </div>
                </div>

                {/* Especialidades */}
                <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#0B1E36] uppercase text-[11px] block">
                    Especialidades Atendidas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWorkshop.specialties.map((spec, i) => (
                      <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-800 font-semibold text-[11px]">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Métricas de Transparência no VEBOOK */}
                <div className="space-y-3 text-xs text-slate-600 bg-sky-50/60 p-4 rounded-xl border border-sky-200">
                  <span className="font-bold text-sky-900 uppercase text-[11px] block">
                    Auditoria e Atividade no VEBOOK
                  </span>
                  <div className="flex justify-between items-center">
                    <span>Serviços Registrados:</span>
                    <strong className="text-[#0B1E36] font-bold text-sm">+{selectedWorkshop.totalServicesRegistered}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Índice de Validação dos Clientes:</span>
                    <strong className="text-emerald-700 font-bold text-sm">{selectedWorkshop.validationRate}%</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    * Todos os serviços lançados por esta oficina geram registros com marcas e peças auditáveis.
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* COMO A OFICINA LANÇA UMA ORDEM DE SERVIÇO */}
        <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-3xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase text-sky-400 tracking-wider block">Fluxo Operacional Rápido</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Lançar uma OS no VEBOOK leva menos de 2 minutos
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              O sistema foi construído para o dia a dia real da oficina. Rápido, sem burocracia e integrado à emissão de nota e WhatsApp do cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <span className="font-mono text-sky-400 font-bold text-sm">01. Identificar Veículo</span>
              <h4 className="font-bold text-base">Digitar Placa e KM</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ao digitar a placa, o sistema puxa marca, modelo, ano e os serviços feitos anteriormente na sua ou em outras oficinas.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <span className="font-mono text-sky-400 font-bold text-sm">02. Selecionar Peças</span>
              <h4 className="font-bold text-base">Produtos e Marcas</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adicione o óleo aplicado (ex: Mobil 0W-20), filtros (Mann-Filter), pastilhas ou serviços de mão de obra em poucos cliques.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <span className="font-mono text-sky-400 font-bold text-sm">03. Enviar ao Cliente</span>
              <h4 className="font-bold text-base">Disparo Automático</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                O cliente recebe no WhatsApp o resumo para validar. O registro passa a integrar o Diário Veicular oficial do carro.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onStartCadastro(modality)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-extrabold text-sm transition-all cursor-pointer shadow-lg"
            >
              Cadastrar minha oficina
            </button>
            <span className="text-xs text-slate-300">Valores visíveis antes do cadastro · Ativação após confirmação de pagamento</span>
          </div>
        </div>

      </div>
    </div>
  );
};
