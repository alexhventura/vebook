import React from 'react';
import { Wrench, ShieldCheck, Store, ClipboardList, CheckCircle2 } from 'lucide-react';

interface Etapa3ParaOficinasProps {
  onCredenciarClick: () => void;
  onJaCredenciadoClick: () => void;
}

export const Etapa3ParaOficinas: React.FC<Etapa3ParaOficinasProps> = ({
  onCredenciarClick,
  onJaCredenciadoClick,
}) => {
  return (
    <section id="etapa-3" className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-[#0B1E36] text-xs font-bold tracking-wider uppercase border border-slate-200">
            Oficinas e Estabelecimentos
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0B1E36] tracking-tight">
            Sua oficina também faz parte da história.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
            Oficinas credenciadas podem registrar os serviços realizados e contribuir para a construção do histórico dos veículos atendidos.
          </p>
        </div>

        {/* 2-Column: Visual System Mockup (left) + Vantagens & CTAs (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Visual System Mockup: Interface Conceitual de Registro de Serviço */}
          <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B1E36] text-white flex items-center justify-center font-bold text-xs">
                  VB
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B1E36] block">
                    Registro de Serviço no VEBOOK
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Interface Conceitual de Lançamento
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Oficina Credenciada</span>
              </div>
            </div>

            {/* Conceptual Fields: Veículo, Serviço realizado, Data, Quilometragem, Peças utilizadas, Observações */}
            <div className="space-y-3.5 text-xs">
              
              {/* Field 1: Veículo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Veículo
                </label>
                <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-[#0B1E36] text-sm flex items-center justify-between">
                  <span>Placa / Identificador</span>
                  <span className="text-[11px] font-sans font-normal text-slate-400">Identificação</span>
                </div>
              </div>

              {/* Field 2: Serviço realizado */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Serviço realizado
                </label>
                <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-medium text-slate-800">
                  Descrição do procedimento técnico efetuado
                </div>
              </div>

              {/* Fields 3 & 4: Data & Quilometragem */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Data
                  </label>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-mono font-medium text-slate-800 text-xs">
                    DD/MM/AAAA
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Quilometragem
                  </label>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-300 font-mono font-medium text-slate-800 text-xs">
                    000.000 km
                  </div>
                </div>
              </div>

              {/* Field 5: Peças utilizadas */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Peças utilizadas
                </label>
                <div className="p-2.5 bg-white rounded-lg border border-slate-300 text-slate-700">
                  Relação de peças, filtros e componentes aplicados
                </div>
              </div>

              {/* Field 6: Observações */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Observações
                </label>
                <div className="p-2.5 bg-white rounded-lg border border-slate-300 text-slate-500">
                  Anotações técnicas adicionais sobre o atendimento
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Vinculação ao histórico do veículo</span>
                <span className="font-semibold text-[#0B1E36]">Registro Estruturado</span>
              </div>

            </div>

          </div>

          {/* Vantagens do Credenciamento + CTAs */}
          <div className="lg:col-span-6 space-y-8">
            
            <div className="space-y-6">
              
              {/* Vantagem 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36] shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1E36]">
                    Registre os serviços realizados
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Associe os serviços efetuados ao histórico do veículo atendido.
                  </p>
                </div>
              </div>

              {/* Vantagem 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1E36]">
                    Contribua para o histórico do veículo
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Participe ativamente da construção organizada da trajetória do veículo.
                  </p>
                </div>
              </div>

              {/* Vantagem 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36] shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1E36]">
                    Tenha seus serviços identificados no histórico
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Reconhecimento do seu estabelecimento nos registros de manutenção.
                  </p>
                </div>
              </div>

              {/* Vantagem 4 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36] shrink-0 mt-0.5">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1E36]">
                    Faça parte da rede de oficinas credenciadas ao VEBOOK
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Integração da sua oficina ao ecossistema institucional do VEBOOK.
                  </p>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="pt-4 space-y-3">
              <button
                onClick={onCredenciarClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-base transition-all shadow-md cursor-pointer block text-center"
              >
                Quero credenciar minha oficina
              </button>

              <div>
                <button
                  onClick={onJaCredenciadoClick}
                  className="text-sm font-semibold text-slate-600 hover:text-[#0B1E36] transition-colors cursor-pointer inline-flex items-center gap-1 underline underline-offset-4"
                >
                  Já sou credenciado
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
