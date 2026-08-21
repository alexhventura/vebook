import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  Wrench, 
  Calendar, 
  Gauge, 
  Building2, 
  Package, 
  ArrowRight, 
  RotateCcw,
  Check,
  X,
  Info,
  Layers,
  Lock
} from 'lucide-react';
import { AppView } from '../../types';

interface ValidacaoSimuladorViewProps {
  onNavigate: (view: AppView) => void;
}

export const ValidacaoSimuladorView: React.FC<ValidacaoSimuladorViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'pending' | 'validated' | 'contesting' | 'contested'>('pending');
  const [contestationReason, setContestationReason] = useState<string>('produto_divergente');
  const [contestationComment, setContestationComment] = useState<string>(
    'A oficina registrou óleo sintético 0W-20 Mobil, mas no balcão e na nota fiscal foi cobrado e instalado óleo mineral 15W-40.'
  );

  const resetSimulation = () => {
    setStep('pending');
    setContestationReason('produto_divergente');
    setContestationComment('A oficina registrou óleo sintético 0W-20 Mobil, mas no balcão e na nota fiscal foi cobrado e instalado óleo mineral 15W-40.');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Explicativo */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Simulador Interativo do Cliente</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36] tracking-tight">
            Validação e Contestação de Serviço
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Experimente a interface que o cliente recebe em seu smartphone após realizar a manutenção em uma oficina credenciada.
          </p>
        </div>

        {/* MOCKUP DO SMARTPHONE / TELA DO CLIENTE */}
        <div className="max-w-md mx-auto bg-white rounded-3xl border-4 border-slate-300 shadow-2xl overflow-hidden">
          
          {/* Top Notch do Smartphone */}
          <div className="bg-[#0B1E36] px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500 text-[#0B1E36] flex items-center justify-center font-black text-xs">
                V
              </div>
              <span className="font-bold text-sm tracking-wide">VEBOOK Notificações</span>
            </div>
            <span className="text-[11px] text-slate-300">OS #8941</span>
          </div>

          {/* Conteúdo do Card de Notificação */}
          <div className="p-6 space-y-6 text-slate-800">
            
            {/* Status Atual do Fluxo */}
            {step === 'pending' && (
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2.5 text-xs text-sky-900">
                <Info className="w-4 h-4 text-sky-700 shrink-0" />
                <span>Confira os dados da ordem de serviço abaixo para validar ou contestar:</span>
              </div>
            )}

            {step === 'validated' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-[#0B1E36] text-base">Serviço Validado com Sucesso!</h3>
                <p className="text-xs text-emerald-800">
                  O registro foi gravado no <strong>Diário Veicular do Corolla (BRA2E19)</strong> com status <strong>✓ Validado</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetSimulation}
                    className="text-xs font-bold text-[#0B1E36] hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Simulação</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'contested' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2 animate-in fade-in">
                <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
                <h3 className="font-extrabold text-[#0B1E36] text-base">Contestação Registrada</h3>
                <p className="text-xs text-rose-800">
                  Sua manifestação foi anexada ao registro original do veículo. A VEBOOK preserva ambas as visões com transparência total.
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetSimulation}
                    className="text-xs font-bold text-[#0B1E36] hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar Simulação</span>
                  </button>
                </div>
              </div>
            )}

            {/* Detalhes do Serviço Lançado pela Oficina */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              
              {/* Veículo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Veículo Atendido</span>
                  <div className="font-extrabold text-sm text-[#0B1E36]">Toyota Corolla XEi 2.0</div>
                </div>
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-300 text-xs">
                  BRA2E19
                </span>
              </div>

              {/* Oficina e KM */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Oficina</span>
                  <div className="font-bold text-[#0B1E36]">AutoCenter Paulista</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">KM Informada</span>
                  <div className="font-bold text-[#0B1E36]">48.320 KM</div>
                </div>
              </div>

              {/* Serviço e Peças Lançadas */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Itens da Ordem de Serviço</span>
                
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Troca de Óleo e Filtros</div>
                  <div className="text-slate-600 text-[11px]">• 4.2L Óleo Mobil Super 3000 0W-20 Sintético</div>
                  <div className="text-slate-600 text-[11px]">• 1x Filtro de Óleo Mann-Filter W 68/3</div>
                </div>
              </div>

            </div>

            {/* Painel de Ações: Validar ou Contestar */}
            {step === 'pending' && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setStep('validated')}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar e Validar Serviço</span>
                </button>

                <button
                  onClick={() => setStep('contesting')}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Apontar Divergência (Contestar)</span>
                </button>
              </div>
            )}

            {/* Formulário de Contestação */}
            {step === 'contesting' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in">
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Contestar Registro de Serviço</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Aponte com clareza o que diverge da realidade executada:
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700 block">Tipo de Divergência:</label>
                  <select
                    value={contestationReason}
                    onChange={(e) => setContestationReason(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50"
                  >
                    <option value="produto_divergente">Produto ou Peça Divergente da Aplicada</option>
                    <option value="quantidade_incorreta">Quantidade Informada Incorreta</option>
                    <option value="km_incorreta">Quilometragem Incorreta</option>
                    <option value="servico_nao_realizado">Serviço Consta mas Não foi Executado</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700 block">Seu Comentário de Auditoria:</label>
                  <textarea
                    rows={3}
                    value={contestationComment}
                    onChange={(e) => setContestationComment(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('pending')}
                    className="w-1/3 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep('contested')}
                    className="w-2/3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Gravar Contestação
                  </button>
                </div>
              </div>
            )}

            {/* Aviso de Privacidade */}
            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Sua identidade será protegida conforme LGPD (J* S*** · CPF 35*******)</span>
            </div>

          </div>

        </div>

        {/* EXPLICAÇÃO TÉCNICA DO FLUXO */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0B1E36] flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            <span>Por que a validação do cliente é essencial?</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Em sistemas tradicionais, a oficina pode lançar qualquer informação sem nenhum contraponto do proprietário. No VEBOOK, o cliente tem o poder soberano de conferir e apontar divergências. Quando um serviço é validado ou contestado, <strong>a verdade histórica é preservada sem manipulações</strong>.
          </p>
        </div>

      </div>
    </div>
  );
};
