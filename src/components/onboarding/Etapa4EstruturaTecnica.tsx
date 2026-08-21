import React from 'react';
import {
  Shield,
  FileSearch,
  GitBranch,
  CheckCircle,
  KeyRound,
  Layers,
  Lock,
} from 'lucide-react';

export const Etapa4EstruturaTecnica: React.FC = () => {
  const conceitosTecnicos = [
    {
      title: 'SEGURANÇA',
      desc: 'Proteção dos dados e dos acessos.',
      icon: Shield,
    },
    {
      title: 'AUDITORIA',
      desc: 'Registro das ações realizadas no sistema.',
      icon: FileSearch,
    },
    {
      title: 'RASTREABILIDADE',
      desc: 'Capacidade de acompanhar a origem e o histórico dos registros.',
      icon: GitBranch,
    },
    {
      title: 'INTEGRIDADE',
      desc: 'Preservação da consistência das informações.',
      icon: CheckCircle,
    },
    {
      title: 'CONTROLE DE ACESSO',
      desc: 'Permissões adequadas para cada tipo de usuário.',
      icon: KeyRound,
    },
    {
      title: 'CONFORMIDADE',
      desc: 'Estrutura preparada para atender requisitos e políticas aplicáveis ao funcionamento da plataforma.',
      icon: Layers,
    },
  ];

  return (
    <section id="etapa-4" className="bg-[#071526] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
      
      {/* Subtle technical background grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-6xl mx-auto relative space-y-16 sm:space-y-20">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 text-sky-300 text-xs font-semibold tracking-wider uppercase border border-slate-700">
            Arquitetura e Confiabilidade
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Tecnologia, segurança e rastreabilidade.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            O VEBOOK é concebido com uma estrutura voltada à segurança, integridade, rastreabilidade e auditoria dos registros.
          </p>
        </div>

        {/* 6 Technical Concepts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conceitosTecnicos.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#0B1E36] p-7 rounded-2xl border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col justify-between space-y-6 shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-sky-400">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black tracking-wider uppercase text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-8 h-full bg-sky-400/80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Architecture Concept */}
        <div className="bg-[#0B1E36]/90 rounded-2xl p-6 sm:p-10 border border-slate-700 shadow-xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/80">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>Estrutura de Governança e Integridade</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                A plataforma é construída com foco permanente em segurança, auditoria, rastreabilidade e conformidade.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Controle Rigoroso de Registros</span>
            </div>
          </div>

          {/* Conceptual Flow Diagram */}
          <div className="p-5 sm:p-6 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Fluxo Conceitual de Registro e Auditoria
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  1. Entrada Autenticada
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Identificação do estabelecimento emissor e validação de permissões de acesso.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  2. Vinculação Histórica
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Associação do serviço à linha cronológica do veículo com registro de data e quilometragem.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  3. Trilha de Auditoria
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Preservação da integridade para consulta transparente e controle contínuo.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
