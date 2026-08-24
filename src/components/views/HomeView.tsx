import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  FileCheck2, 
  Wrench, 
  Building2, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  Package, 
  Gauge, 
  Calendar, 
  Lock, 
  Globe, 
  QrCode,
  Layers,
  ChevronRight,
  Info,
  Car
} from 'lucide-react';
import { VEHICLES_MOCK, SERVICES_MOCK } from '../../data/mockData';
import { formatPlate } from '../../lib/utils';
import { AppView } from '../../types';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSearchPlate: (plate: string) => void;
  onOpenCredenciamento: () => void;
  onOpenJaCredenciado: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchPlate,
  onOpenCredenciamento,
  onOpenJaCredenciado,
}) => {
  const [inputPlate, setInputPlate] = useState<string>('');

  const sampleVehicle = VEHICLES_MOCK['BRA2E19'];
  const sampleServices = SERVICES_MOCK['BRA2E19'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate) || 'BRA2E19';
    onSearchPlate(clean);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION INSTITUCIONAL DE ALTO IMPACTO */}
      <section className="relative bg-[#071527] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-10 text-center">
          
          {/* Badge Oficial */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Plataforma Nacional de Histórico e Diário Veicular</span>
          </div>

          {/* Título Principal e Proposta de Valor */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              O histórico que acompanha o veículo.
            </h1>
            <p className="text-xl sm:text-2xl font-light text-slate-300 leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white font-semibold">A oficina registra.</strong> O cliente valida.{' '}
              <span className="text-sky-300 font-semibold">A VEBOOK preserva.</span>
            </p>
          </div>

          {/* Campo de Consulta de Placa */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 p-2 sm:p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputPlate}
                    onChange={(e) => setInputPlate(e.target.value)}
                    placeholder="DIGITE A PLACA (EX: BRA2E19)"
                    maxLength={7}
                    className="w-full px-5 py-4 text-lg font-black tracking-widest text-[#0B1E36] uppercase placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-medium bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-400/40"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-black text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0"
                >
                  <Search className="w-5 h-5 text-[#0B1E36]" />
                  <span>Consultar Histórico</span>
                </button>
              </form>
            </div>

            {/* Atalhos Rápidos para Placas Reais de Demonstração */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-slate-400">
              <span>Ou explore veículos reais de demonstração:</span>
              <button
                onClick={() => onSearchPlate('BRA2E19')}
                className="text-white font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md border border-white/10 transition-colors cursor-pointer"
              >
                Corolla (BRA2E19)
              </button>
              <button
                onClick={() => onSearchPlate('ABC1D23')}
                className="text-white font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md border border-white/10 transition-colors cursor-pointer"
              >
                Compass (ABC1D23)
              </button>
              <button
                onClick={() => onSearchPlate('XYZ9K88')}
                className="text-white font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md border border-white/10 transition-colors cursor-pointer"
              >
                T-Cross (XYZ9K88)
              </button>
            </div>
          </div>

          {/* 3 Métricas Objetivas de Infraestrutura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto border-t border-slate-800 text-left">
            <div className="space-y-1">
              <span className="text-3xl font-black text-sky-400">+240.000</span>
              <p className="text-xs text-slate-300">
                Manutenções preservadas com identificação de peças e marcas.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black text-sky-400">100%</span>
              <p className="text-xs text-slate-300">
                Histórico imutável vinculado ao chassi, não à pessoa.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black text-sky-400">4 Estados</span>
              <p className="text-xs text-slate-300">
                Classificação transparente de validação e contestação de serviços.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. O CICLO DE GOVERNANÇA (O VEÍCULO NO CENTRO) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Governança e Transparência
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36]">
            Como o histórico é construído e preservado
          </h2>
          <p className="text-base text-slate-600">
            A VEBOOK conecta oficinas credenciadas e proprietários para criar um registro auditado e de alta fidelidade técnica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-[#0B1E36]">A Oficina Registra</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Centros automotivos e oficinas credenciadas lançam ordens de serviço com quilometragem real, peças, marcas, modelos e especificações técnicas.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4 bg-emerald-50/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-[#0B1E36]">O Cliente Valida</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              O cliente consulta o registro no Diário Veicular e pode <strong>confirmar</strong> as informações ou <strong>contestar divergências</strong> de forma pública e transparente.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#0B1E36] text-white flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-[#0B1E36]">A VEBOOK Preserva</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A linha do tempo histórica é consolidada no Diário Veicular perpétuo, permitindo a emissão de <strong>Certidão Oficial com QR Code</strong> para compra e venda.
            </p>
          </div>

        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('como-funciona')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1E36] hover:text-sky-700 transition-colors cursor-pointer"
          >
            <span>Conhecer todos os detalhes da arquitetura técnica</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. DEMONSTRAÇÃO VISUAL DO DIÁRIO VEICULAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-8 p-6 sm:p-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase text-sky-800 tracking-wider">
                Exemplo Real em Produção
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
                Diário Veicular — Toyota Corolla XEi 2.0
              </h2>
              <p className="text-sm text-slate-600">
                Placa <strong>BRA2E19</strong> · 48.320 KM · 27 serviços registrados · 5 oficinas credenciadas
              </p>
            </div>

            <button
              onClick={() => onSearchPlate('BRA2E19')}
              className="px-6 py-3 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <span>Abrir Diário Completo</span>
              <ChevronRight className="w-4 h-4 text-sky-300" />
            </button>
          </div>

          {/* Prévia de 2 Registros Reais: Um Validado e Um Contestado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Evento 1: Validado */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B1E36] bg-white px-2 py-0.5 rounded border border-slate-200">
                  21 AGO 2026 · 48.320 KM
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Validado pelo Cliente
                </span>
              </div>
              <h4 className="font-bold text-[#0B1E36] text-base">
                Troca de Óleo e Filtros
              </h4>
              <p className="text-xs text-slate-600">
                Oficina: <strong>AutoCenter Paulista Especializado</strong>
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">Peças e Produtos Aplicados:</div>
                <div className="text-slate-600 text-[11px]">• Óleo Mobil Super 3000 0W-20 Sintético (4.2 Litros)</div>
                <div className="text-slate-600 text-[11px]">• Filtro de Óleo Mann-Filter W 68/3</div>
                <div className="text-slate-600 text-[11px]">• Filtro de Cabine Mann-Filter CUK 1919 (Carvão Ativado)</div>
              </div>
            </div>

            {/* Evento 2: Contestado (Preservação da Verdade) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B1E36] bg-white px-2 py-0.5 rounded border border-slate-200">
                  18 MAI 2026 · 44.100 KM
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  ⚠ Contestado pelo Cliente
                </span>
              </div>
              <h4 className="font-bold text-[#0B1E36] text-base">
                Substituição de Pastilhas e Fluido de Freio
              </h4>
              <p className="text-xs text-slate-600">
                Oficina: <strong>TechCar Diagnóstico & Freios</strong>
              </p>
              <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs space-y-1 text-rose-900">
                <div className="font-bold">Divergência apontada pelo cliente:</div>
                <p className="text-[11px] leading-relaxed">
                  "A OS registrou pastilhas cerâmicas Cobreq N-1772, porém foram instaladas pastilhas Fras-le convencionais."
                </p>
              </div>
            </div>

          </div>

          {/* Destaque Filosófico: Sem Notas ou Julgamentos */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-700 space-y-0.5">
              <strong className="text-[#0B1E36] block font-bold">Por que o VEBOOK não atribui notas ou estrelas ao veículo?</strong>
              <span>
                Acreditamos na transparência dos fatos. Não julgamos se um carro é "nota 8" ou "nota 10". Apresentamos os registros exatos, as peças e as validações para que você e seu mecânico de confiança façam a avaliação correta.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. A CERTIDÃO VEBOOK DE HISTÓRICO VEICULAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1E36] text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-900/80 text-sky-300 text-xs font-bold uppercase border border-sky-700">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Documento Oficial Nominal</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Certidão VEBOOK de Histórico Veicular
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Vai comprar ou vender um veículo? Emita uma Certidão oficial com código de autenticidade, histórico congelado até a data da emissão e QR Code para verificação pública.
              </p>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>Nominal ao Solicitante:</strong> qualquer pessoa pode solicitar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>Snapshot Congelado:</strong> retrata exatamente os fatos até a data/hora.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span><strong>QR Code de Autenticidade:</strong> auditável por qualquer smartphone.</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('certidao')}
                  className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-extrabold text-sm transition-all cursor-pointer shadow-lg"
                >
                  Emitir ou Visualizar Certidão
                </button>
              </div>
            </div>

            {/* Mockup do Documento */}
            <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-300 space-y-4 text-xs font-sans">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-[#0B1E36] text-sm block">VEBOOK</span>
                  <span className="text-[10px] text-slate-500">Certidão de Histórico Veicular</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  VBK-2026-BRA2E19-98412
                </span>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>Veículo: <strong>Toyota Corolla XEi 2.0 (BRA2E19)</strong></div>
                <div>Solicitante: <strong>João Carlos da Silva (CPF 352.***.***-80)</strong></div>
                <div>Data de Emissão: <strong>Hoje às 14:30:00</strong></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-slate-100 rounded">
                  <span className="block text-slate-500 text-[9px]">Serviços</span>
                  <strong className="text-sm text-[#0B1E36]">27</strong>
                </div>
                <div className="p-2 bg-emerald-50 rounded text-emerald-800">
                  <span className="block text-emerald-600 text-[9px]">Validados</span>
                  <strong className="text-sm">21</strong>
                </div>
                <div className="p-2 bg-rose-50 rounded text-rose-800">
                  <span className="block text-rose-600 text-[9px]">Contestados</span>
                  <strong className="text-sm">2</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span>Autenticidade verificável via QR Code</span>
                <QrCode className="w-6 h-6 text-[#0B1E36]" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CONVITE INSTITUCIONAL PARA OFICINAS — coexistindo com a home do histórico */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Rede Credenciada Nacional
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36]">
            Sua oficina também pode fazer parte do VEBOOK
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Registre sua oficina, tenha uma página profissional no VEBOOK e mantenha os serviços realizados conectados ao histórico dos veículos atendidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <Globe className="w-8 h-8 text-sky-700" />
            <h3 className="font-bold text-[#0B1E36] text-base">Página profissional no VEBOOK</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Endereço próprio no formato <code>suaoficina.vebook.com.br</code>, com identidade, contato e serviços.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <Wrench className="w-8 h-8 text-sky-700" />
            <h3 className="font-bold text-[#0B1E36] text-base">Painel de gestão da oficina</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clientes, veículos, atendimentos, produtos, retornos e agenda no mesmo ambiente da página pública.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <ShieldCheck className="w-8 h-8 text-sky-700" />
            <h3 className="font-bold text-[#0B1E36] text-base">Histórico conectado ao veículo</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Os serviços registrados pela oficina passam a integrar o Diário Veicular consultado pelo cliente.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h4 className="font-extrabold text-[#0B1E36] text-lg sm:text-xl">
              Cadastro rápido. Personalização depois.
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Valores, condições e benefícios estão descritos com clareza na área Para Oficinas, antes de qualquer pagamento.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0 justify-center">
            <button
              onClick={onOpenCredenciamento}
              className="px-6 py-3 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              Cadastrar minha oficina
            </button>
            <button
              onClick={() => onNavigate('oficinas')}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Conhecer para oficinas
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
