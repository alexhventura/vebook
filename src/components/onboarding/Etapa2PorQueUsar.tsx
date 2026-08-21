import React from 'react';
import { Search, BookOpen, Clock, FileText, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useConsulta } from '../../hooks/useConsulta';

interface Etapa2PorQueUsarProps {
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const Etapa2PorQueUsar: React.FC<Etapa2PorQueUsarProps> = ({
  searchInputRef,
}) => {
  const {
    plate,
    searchedPlate,
    hasError,
    errorMessage,
    isLoading,
    plateStandard,
    handlePlateChange,
    handleSubmit,
  } = useConsulta();

  return (
    <section id="etapa-2" className="bg-[#F8FAFC] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header & Main Consulta Area */}
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0B1E36] tracking-tight">
            Conheça a história do veículo.
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Consulte as informações e registros disponíveis para o veículo e tenha uma visão organizada de sua história.
          </p>

          {/* Central Search Form */}
          <div className="pt-4 max-w-xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-lg border border-slate-300 flex flex-col sm:flex-row items-stretch gap-2 transition-all focus-within:border-[#0B1E36] focus-within:ring-2 focus-within:ring-[#0B1E36]/10"
            >
              <div className="relative flex-1 flex items-center">
                <input
                  ref={searchInputRef}
                  id="consulta-plate-input"
                  type="text"
                  value={plate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  placeholder="Digite a placa do veículo"
                  maxLength={7}
                  className="w-full px-4 py-3.5 text-base sm:text-lg font-bold tracking-wider text-[#0B1E36] placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal uppercase bg-transparent rounded-xl focus:outline-none"
                  aria-label="Placa do Veículo"
                />

                {plate.length >= 3 && (
                  <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2 border border-slate-200 shrink-0">
                    {plateStandard === 'Mercosul' ? 'Mercosul' : plateStandard === 'Tradicional' ? 'Padrão BR' : 'BR'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 disabled:opacity-80"
              >
                <Search className="w-4 h-4 text-sky-300" />
                <span>{isLoading ? 'Consultando...' : 'Consultar veículo'}</span>
              </button>
            </form>

            {hasError && (
              <p className="text-red-600 text-xs font-semibold mt-2 text-left px-2">
                {errorMessage}
              </p>
            )}

            {searchedPlate && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-slate-300 shadow-sm text-left animate-in fade-in duration-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B1E36]">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>Interface de Consulta — Placa {searchedPlate}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Identificador Ativo
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Módulo de consulta preparado para integração aos registros disponíveis na plataforma.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium border-t border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registros vinculados de forma definitiva à identidade do veículo.</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-3">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Consulta a registros existentes e informações disponíveis vinculadas ao veículo.</span>
            </div>
          </div>
        </div>

        {/* 3 Structured Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Benefit 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B1E36]">
                Histórico organizado
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Visualização dos registros disponíveis relacionados ao veículo.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36]">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B1E36]">
                Mais informação
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Consulte informações que podem ajudar a compreender a história do veículo.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0B1E36]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0B1E36]">
                Mais segurança para decidir
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Informações históricas podem auxiliar decisões relacionadas ao veículo.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
