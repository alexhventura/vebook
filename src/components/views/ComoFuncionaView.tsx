import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MinusCircle, 
  Lock, 
  EyeOff, 
  FileText, 
  ArrowRight, 
  Check, 
  X,
  Layers,
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';
import { AppView } from '../../types';

interface ComoFuncionaViewProps {
  onNavigate: (view: AppView) => void;
}

export const ComoFuncionaView: React.FC<ComoFuncionaViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Institucional */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-50 text-sky-900 rounded-full border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Arquitetura do Ecossistema VEBOOK</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B1E36] tracking-tight">
            Como Funciona o Histórico Veicular
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Uma infraestrutura de governança técnica que transforma registros isolados de oficinas em um <strong>Diário Veicular auditado, transparente e imutável</strong>.
          </p>
        </div>

        {/* O CICLO CENTRAL: 3 PASSOS DE GOVERNANÇA */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0B1E36]">
              A Tríade Fundamental
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Como cada ator do ecossistema garante a veracidade do histórico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Passo 1: A Oficina Registra */}
            <div className="bg-white p-7 rounded-2xl border-2 border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0B1E36] flex items-center justify-center font-black text-lg border border-sky-100">
                1
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-sky-800 tracking-wider block">Origem Técnica</span>
                <h3 className="text-xl font-bold text-[#0B1E36]">A Oficina Registra</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Oficinas credenciadas alimentam o sistema com a OS detalhada: quilometragem do painel, serviços executados, peças, marcas, modelos e especificações técnicas.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  <span>Produtos identificados por marca</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  <span>Quilometragem aferida na entrada</span>
                </li>
              </ul>
            </div>

            {/* Passo 2: O Cliente Valida ou Contesta */}
            <div className="bg-white p-7 rounded-2xl border-2 border-emerald-200 shadow-sm relative space-y-4 bg-gradient-to-b from-emerald-50/20 to-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200">
                2
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider block">Auditoria do Proprietário</span>
                <h3 className="text-xl font-bold text-[#0B1E36]">O Cliente Valida</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  O cliente recebe o link da OS no celular. Ele pode <strong>validar</strong> o serviço ou <strong>contestar divergências</strong> (como peça diferente da combinada).
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-emerald-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contestação registrada sem apagar a OS</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Identidade do validador mascarada (LGPD)</span>
                </li>
              </ul>
            </div>

            {/* Passo 3: A VEBOOK Preserva */}
            <div className="bg-white p-7 rounded-2xl border-2 border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B1E36] text-white flex items-center justify-center font-black text-lg">
                3
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block">Imutabilidade e Guarda</span>
                <h3 className="text-xl font-bold text-[#0B1E36]">A VEBOOK Preserva</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  O registro é consolidado no Diário Veicular. O histórico permanece vinculado ao veículo para sempre, independente de troca de dono ou de oficina.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  <span>Emissão de Certidão Oficial com QR Code</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600" />
                  <span>Histórico pertence ao veículo, não à pessoa</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* OS 4 ESTADOS DE UM REGISTRO NA VEBOOK */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-sky-800 tracking-wider block">Transparência de Estados</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
              Como cada registro é classificado no Diário Veicular
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Diferente de sistemas fechados, a VEBOOK não esconde discordâncias. A verdade histórica é preservada em 4 situações claras:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Estado 1: Validado */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>✓ Serviço Validado</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                A oficina lançou a ordem de serviço e o cliente que realizou o serviço conferiu e confirmou formalmente que os dados (km, peças e serviços) estão corretos.
              </p>
            </div>

            {/* Estado 2: Aguardando Validação */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>◷ Aguardando Validação</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                O serviço foi registrado pela oficina credenciada e a notificação foi enviada ao cliente. Está dentro da janela temporal de resposta do proprietário.
              </p>
            </div>

            {/* Estado 3: Contestado */}
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>⚠ Serviço Contestado</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                O cliente apontou alguma divergência (ex: peça cobrada diferente da instalada). A contestação é anexada publicamente ao registro, garantindo total auditoria.
              </p>
            </div>

            {/* Estado 4: Sem Validação */}
            <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <MinusCircle className="w-5 h-5 text-slate-500" />
                <span>— Sem Validação</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                O prazo de validação expirou sem manifestação do cliente, ou o cliente não possuía contato cadastrado. O registro permanece no histórico com essa ressalva explícita.
              </p>
            </div>

          </div>
        </div>

        {/* COMPARATIVO: O QUE O VEBOOK É VS O QUE NÃO É */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">
              Clareza de Escopo e Papel Institucional
            </h2>
            <p className="text-sm text-slate-600">
              Entenda com precisão os limites técnicos e legais da nossa atuação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* O QUE O VEBOOK É */}
            <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-4">
              <div className="flex items-center gap-2 text-[#0B1E36] font-bold text-lg">
                <CheckCircle2 className="w-5 h-5 text-sky-700" />
                <span>O que o VEBOOK É</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-3">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span><strong>Plataforma de histórico veicular:</strong> guarda o diário de manutenções realizadas em oficinas credenciadas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span><strong>Diário centrado no veículo:</strong> os registros acompanham o chassi/placa, independentemente de trocas de dono.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span><strong>Detalhamento técnico:</strong> registra produtos, marcas, modelos, especificações e quilometragens.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span><strong>Emissor da Certidão VEBOOK:</strong> documento oficial nominal com código de autenticidade e QR Code.</span>
                </li>
              </ul>
            </div>

            {/* O QUE O VEBOOK NÃO É */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <X className="w-5 h-5 text-rose-500" />
                <span>O que o VEBOOK NÃO É</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-3">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Não é órgão de trânsito ou governo:</strong> não atesta propriedade, multas, gravames ou débitos fiscais.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Não substitui o CRLV ou DUT:</strong> não é documento de porte obrigatório ou transferência.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Não substitui laudo cautelar ou perícia:</strong> não afere sinistros estruturais, leilões ou estado físico atual.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Não dá nota ou score para o veículo:</strong> não avalia se o carro é "bom" ou "ruim", apenas apresenta os fatos registrados.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* PRIVACIDADE, SEGURANÇA E LGPD */}
        <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Privacidade Absoluta e Conformidade LGPD
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            A VEBOOK foi concebida sob o princípio de <strong>Privacy by Design</strong>. O objeto do histórico é a máquina (o veículo), e não a pessoa física.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <EyeOff className="w-5 h-5 text-sky-300" />
              <h4 className="font-bold text-sm">Dados Pessoais Mascarados</h4>
              <p className="text-xs text-slate-300">
                Nomes e CPFs dos proprietários anteriores nunca aparecem abertos na consulta pública do veículo (ex: J* S*** · CPF 35*******).
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <Database className="w-5 h-5 text-sky-300" />
              <h4 className="font-bold text-sm">Desacoplamento de Entidades</h4>
              <p className="text-xs text-slate-300">
                Veículo, Pessoa, Oficina e Auditoria são entidades separadas. Trocar de proprietário não afeta os registros mecânicos do veículo.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <Lock className="w-5 h-5 text-sky-300" />
              <h4 className="font-bold text-sm">Trilha de Auditoria Criptográfica</h4>
              <p className="text-xs text-slate-300">
                Toda criação, validação ou contestação gera logs com hash criptográfico, carimbo de tempo e rastreabilidade total.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('diario')}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-bold text-sm transition-colors cursor-pointer"
            >
              Ver Diário Veicular na Prática
            </button>
            <button
              onClick={() => onNavigate('validacao')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-colors cursor-pointer"
            >
              Simular Validação de Serviço
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
