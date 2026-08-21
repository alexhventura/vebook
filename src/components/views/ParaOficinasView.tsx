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
import { WORKSHOPS_MOCK, SERVICES_MOCK } from '../../data/mockData';
import { AppView } from '../../types';

interface ParaOficinasViewProps {
  onNavigate: (view: AppView) => void;
  onOpenCredenciamentoModal: () => void;
  onOpenJaCredenciadoModal: () => void;
}

export const ParaOficinasView: React.FC<ParaOficinasViewProps> = ({
  onNavigate,
  onOpenCredenciamentoModal,
  onOpenJaCredenciadoModal,
}) => {
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('ws-01');
  const selectedWorkshop = WORKSHOPS_MOCK.find(w => w.id === selectedWorkshopId) || WORKSHOPS_MOCK[0];

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
              onClick={onOpenCredenciamentoModal}
              className="px-7 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-extrabold text-sm transition-all shadow-md cursor-pointer"
            >
              Credenciar Minha Oficina
            </button>
            <button
              onClick={onOpenJaCredenciadoModal}
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Já sou Credenciado (Acesso)
            </button>
          </div>
        </div>

        {/* OS 4 PILARES DE VALOR PARA A OFICINA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1E36]">1. Sistema de Gestão Completo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ordens de serviço, cadastro de clientes, controle de veículos, estoque de peças e histórico financeiro em uma única plataforma em nuvem.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <Globe className="w-6 h-6 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1E36]">2. Página Pública Própria</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sua oficina ganha um endereço próprio (ex: <code>suaoficina.vebook.com.br</code>) com fotos, serviços, horários e botão de WhatsApp.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1E36]">3. Autoridade e Transparência</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ao alimentar o Diário Veicular com peças e marcas originais, sua oficina se diferencia das amadoras e ganha a confiança do cliente.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6 text-sky-700" />
            </div>
            <h3 className="text-lg font-bold text-[#0B1E36]">4. Fidelização e Retorno</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O cliente recebe o link da OS direto no WhatsApp e valida o serviço. O sistema alerta automaticamente as próximas revisões preventivas.
            </p>
          </div>

        </div>

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
                  onClick={() => onNavigate('site-oficina')}
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
              onClick={onOpenCredenciamentoModal}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-extrabold text-sm transition-all cursor-pointer shadow-lg"
            >
              Iniciar Credenciamento Gratuito
            </button>
            <span className="text-xs text-slate-300">Sem taxa de adesão · Suporte técnico e homologação inclusos</span>
          </div>
        </div>

      </div>
    </div>
  );
};
