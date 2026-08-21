import React from 'react';
import { Shield, FileCheck, Wrench, Calendar, CheckCircle2 } from 'lucide-react';

export const Etapa1OQueE: React.FC = () => {
  return (
    <section id="etapa-1" className="bg-[#0B1E36] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
      
      {/* Subtle architectural background structure */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-6xl mx-auto relative space-y-16">
        
        {/* Main Institutional Header Block */}
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-slate-300 text-xs font-semibold tracking-wider uppercase border border-white/10">
            Plataforma de Histórico Veicular
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            VEBOOK
          </h1>

          <p className="text-2xl sm:text-3xl font-bold text-slate-200 tracking-tight leading-snug">
            O histórico do veículo em um só lugar.
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl pt-2 font-normal">
            O VEBOOK é uma plataforma criada para organizar e acompanhar informações e registros relacionados à história de um veículo.
          </p>
        </div>

        {/* Visual Representation: Veículo associado à ideia de histórico */}
        <div className="bg-[#071526] rounded-2xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl relative space-y-8">
          
          {/* Top Context Indicator: VEÍCULO -> HISTÓRIA -> REGISTROS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400 block mb-1">
                Conceito Central
              </span>
              <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-200">
                <span className="text-white">VEÍCULO</span>
                <span className="text-sky-400">→</span>
                <span className="text-white">HISTÓRIA</span>
                <span className="text-sky-400">→</span>
                <span className="text-white">REGISTROS</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-slate-300 font-medium bg-slate-900/80 px-3.5 py-2 rounded-lg border border-slate-800 shrink-0">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>O histórico acompanha o veículo ao longo do tempo</span>
            </div>
          </div>

          {/* Conceptual Historical Timeline */}
          <div className="relative pt-4 pb-2">
            
            {/* Horizontal Connecting Guide Line on md+ */}
            <div className="hidden md:block absolute top-[44px] left-8 right-8 h-0.5 bg-slate-700/80" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              
              {/* Point 1: Origem */}
              <div className="space-y-3 bg-slate-900/50 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-800 md:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] border-2 border-sky-400 flex items-center justify-center text-white shadow-md z-10 shrink-0">
                    <FileCheck className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-sky-300">
                    Origem
                  </span>
                </div>
                <div className="space-y-1 md:pt-1">
                  <h4 className="text-sm font-bold text-white">Identificação Inicial</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identificação e estrutura de dados do veículo.
                  </p>
                </div>
              </div>

              {/* Point 2: Trajetória */}
              <div className="space-y-3 bg-slate-900/50 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-800 md:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] border-2 border-slate-500 flex items-center justify-center text-white shadow-md z-10 shrink-0">
                    <Wrench className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Trajetória
                  </span>
                </div>
                <div className="space-y-1 md:pt-1">
                  <h4 className="text-sm font-bold text-white">Serviços e Manutenções</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Intervenções e manutenções efetuadas ao longo do uso.
                  </p>
                </div>
              </div>

              {/* Point 3: Evolução */}
              <div className="space-y-3 bg-slate-900/50 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-800 md:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] border-2 border-slate-500 flex items-center justify-center text-white shadow-md z-10 shrink-0">
                    <Calendar className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Evolução
                  </span>
                </div>
                <div className="space-y-1 md:pt-1">
                  <h4 className="text-sm font-bold text-white">Acontecimentos Relevantes</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Acompanhamento cronológico de datas e quilometragens.
                  </p>
                </div>
              </div>

              {/* Point 4: Histórico Unificado */}
              <div className="space-y-3 bg-slate-900/50 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-800 md:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] border-2 border-emerald-400 flex items-center justify-center text-white shadow-md z-10 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    Histórico Unificado
                  </span>
                </div>
                <div className="space-y-1 md:pt-1">
                  <h4 className="text-sm font-bold text-white">História Organizada</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Registros disponíveis consolidados em um só lugar.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
