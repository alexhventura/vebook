import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MinusCircle, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Wrench, 
  FileText, 
  Calendar, 
  Gauge, 
  ShieldCheck, 
  Building2, 
  FileCheck2, 
  Filter,
  Info,
  ExternalLink,
  Tag
} from 'lucide-react';
import { VEHICLES_MOCK, SERVICES_MOCK, WORKSHOPS_MOCK } from '../../data/mockData';
import { AppView, ServiceRecord, TransparenciaSection, ValidationStatus, ServiceCategory } from '../../types';
import { formatPlate } from '../../lib/utils';

interface DiarioVeicularViewProps {
  onNavigate: (view: AppView) => void;
  onOpenWorkshopModal?: (workshopId: string) => void;
  onEmitirCertidaoForPlate?: (plate: string) => void;
  onOpenContestacaoModalForRecord?: (record: ServiceRecord) => void;
  onNavigateTransparencia?: (section: TransparenciaSection) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const DiarioVeicularView: React.FC<DiarioVeicularViewProps> = ({
  onNavigate,
  onEmitirCertidaoForPlate,
  onOpenContestacaoModalForRecord,
  onNavigateTransparencia,
  searchInputRef,
}) => {
  const [selectedPlate, setSelectedPlate] = useState<string>('BRA2E19');
  const [inputPlate, setInputPlate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<ValidationStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<string, boolean>>({
    'srv-01': true,
    'srv-02': true,
  });

  const currentVehicle = VEHICLES_MOCK[selectedPlate] || VEHICLES_MOCK['BRA2E19'];
  const allServices = SERVICES_MOCK[selectedPlate] || SERVICES_MOCK['BRA2E19'];

  const toggleExpand = (id: string) => {
    setExpandedRecordIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (VEHICLES_MOCK[clean]) {
      setSelectedPlate(clean);
    } else {
      // Para demonstração, se a placa não for uma das 3 mockadas, mantém a principal com aviso amigável
      setSelectedPlate('BRA2E19');
    }
  };

  // Filtragem dos registros
  const filteredServices = allServices.filter(service => {
    if (filterStatus !== 'all' && service.validationStatus !== filterStatus) {
      return false;
    }
    if (filterCategory !== 'all' && service.serviceType !== filterCategory) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'validado':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>✓ Serviço validado</span>
          </span>
        );
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>◷ Aguardando validação</span>
          </span>
        );
      case 'contestado':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>⚠ Serviço contestado</span>
          </span>
        );
      case 'sem_validacao':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>— Sem validação</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Barra Superior de Busca e Seleção de Veículos de Demonstração */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-sky-800 uppercase bg-sky-50 px-2.5 py-1 rounded border border-sky-100">
                Diário Veicular Digital
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36] mt-1.5">
                Histórico Técnico do Veículo
              </h1>
              <p className="text-sm text-slate-600">
                Linha do tempo oficial dos serviços registrados por oficinas credenciadas e preservados na VEBOOK.
              </p>
            </div>

            {/* Quick Demo Placas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Exemplos reais:</span>
              <button
                onClick={() => setSelectedPlate('BRA2E19')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedPlate === 'BRA2E19'
                    ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Corolla · BRA2E19
              </button>
              <button
                onClick={() => setSelectedPlate('ABC1D23')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedPlate === 'ABC1D23'
                    ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Compass · ABC1D23
              </button>
              <button
                onClick={() => setSelectedPlate('XYZ9K88')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedPlate === 'XYZ9K88'
                    ? 'bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                T-Cross · XYZ9K88
              </button>
            </div>
          </div>

          {/* Form de Consulta por Placa */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value)}
                placeholder="Digitar outra placa para consultar (ex: BRA2E19)"
                maxLength={7}
                className="w-full px-4 py-3 text-base font-bold uppercase tracking-wider text-[#0B1E36] placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1E36]/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4 text-sky-300" />
              <span>Consultar Histórico</span>
            </button>
          </form>
        </div>

        {/* Card do Veículo e Resumo Objetivo (SEM NOTA / SEM SCORE) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header com dados do veículo */}
          <div className="bg-[#0B1E36] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-white text-[#0B1E36] font-mono font-black text-sm tracking-wider rounded-md border border-slate-300 shadow-xs">
                  {currentVehicle.plate}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded">
                  Ano {currentVehicle.yearFabrication}/{currentVehicle.yearModel}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded">
                  {currentVehicle.fuel}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {currentVehicle.brand} {currentVehicle.model} <span className="text-slate-300 text-lg sm:text-xl font-normal block sm:inline">{currentVehicle.version}</span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span>Cor: <strong className="text-white">{currentVehicle.color}</strong></span>
                <span>•</span>
                <span>Chassi: <strong className="text-white font-mono">{currentVehicle.chassisMasked}</strong></span>
                <span>•</span>
                <span>Histórico ativo desde: <strong className="text-white">{new Date(currentVehicle.firstRegisteredDate).toLocaleDateString('pt-BR')}</strong></span>
              </div>
            </div>

            {/* Ação de Emissão de Certidão */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <button
                onClick={() => {
                  if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(currentVehicle.plate);
                  onNavigate('certidao');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileCheck2 className="w-4 h-4 text-[#0B1E36]" />
                <span>Emitir Certidão deste Veículo</span>
              </button>
              <span className="text-[11px] text-slate-300">Documento nominal com QR Code e autenticidade</span>
            </div>
          </div>

          {/* Resumo Objetivo do Histórico (Fatos e Contagens) */}
          <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B1E36] uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-sky-700" />
                <span>Resumo Objetivo do Diário Veicular</span>
              </div>
              <div className="text-xs text-slate-500">
                Última quilometragem registrada: <strong className="text-[#0B1E36]">{currentVehicle.currentMileageKm.toLocaleString('pt-BR')} KM</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Total Registrado</span>
                <span className="text-2xl font-extrabold text-[#0B1E36]">{currentVehicle.totalServicesCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">serviços no histórico</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] text-emerald-700 font-medium block">Validados</span>
                <span className="text-2xl font-extrabold text-emerald-700">{currentVehicle.validatedServicesCount}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">confirmados por cliente</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                <span className="text-[11px] text-rose-700 font-medium block">Contestados</span>
                <span className="text-2xl font-extrabold text-rose-700">{currentVehicle.contestedServicesCount}</span>
                <span className="text-[10px] text-rose-600 block mt-0.5">divergência apontada</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] text-amber-700 font-medium block">Aguardando</span>
                <span className="text-2xl font-extrabold text-amber-700">{currentVehicle.pendingServicesCount}</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">em prazo de validação</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Produtos Cat.</span>
                <span className="text-2xl font-extrabold text-[#0B1E36]">{currentVehicle.identifiedProductsCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{currentVehicle.identifiedBrandsCount} marcas catalogadas</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium block">Oficinas</span>
                <span className="text-2xl font-extrabold text-[#0B1E36]">{currentVehicle.participatingWorkshopsCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">estabelecimentos credenciados</span>
              </div>

            </div>

            {/* Filosofia dos Fatos Nota Informativa */}
            <div className="mt-4 p-3 rounded-lg bg-sky-50/70 border border-sky-100 flex items-start gap-2.5 text-xs text-slate-600">
              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <span>
                <strong>A VEBOOK não atribui notas ou julgamentos ao veículo.</strong> Apresentamos fatos técnicos e objetivos (datas, peças, marcas, quantidades, oficinas e validações) para que você e seu mecânico tomem decisões informadas.
              </span>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="p-4 sm:p-6 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100">
            
            {/* Filtro por Situação de Validação */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Situação:
              </span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#0B1E36] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({allServices.length})
              </button>
              <button
                onClick={() => setFilterStatus('validado')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'validado'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                ✓ Validados
              </button>
              <button
                onClick={() => setFilterStatus('contestado')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'contestado'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                ⚠ Contestados
              </button>
              <button
                onClick={() => setFilterStatus('aguardando')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'aguardando'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                ◷ Aguardando
              </button>
            </div>

            {/* Contador de resultados */}
            <span className="text-xs text-slate-500">
              Exibindo <strong>{filteredServices.length}</strong> de {allServices.length} eventos cronológicos
            </span>
          </div>

          {/* LINHA DO TEMPO CRONOLÓGICA DETALHADA */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">
                  Nenhum registro encontrado para os filtros selecionados.
                </p>
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  className="text-xs font-bold text-[#0B1E36] hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 sm:ml-6 space-y-8 pl-6 sm:pl-8">
                
                {filteredServices.map((record) => {
                  const isExpanded = expandedRecordIds[record.id] ?? false;

                  return (
                    <div key={record.id} className="relative group">
                      
                      {/* Marcador do nó na Timeline */}
                      <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-xs flex items-center justify-center ${
                        record.validationStatus === 'validado'
                          ? 'bg-emerald-600 ring-2 ring-emerald-200'
                          : record.validationStatus === 'contestado'
                          ? 'bg-rose-600 ring-2 ring-rose-200'
                          : record.validationStatus === 'aguardando'
                          ? 'bg-amber-500 ring-2 ring-amber-200'
                          : 'bg-slate-400'
                      }`} />

                      {/* Card do Evento de Serviço */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden">
                        
                        {/* Topo do Evento */}
                        <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-[#0B1E36] flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs font-mono">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                {new Date(record.serviceDate).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                }).toUpperCase()}
                              </span>

                              <span className="text-xs font-extrabold text-[#0B1E36] flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                                {record.mileageKm.toLocaleString('pt-BR')} KM
                              </span>

                              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {record.serviceType}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-[#0B1E36] pt-1">
                              {record.description}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {getStatusBadge(record.validationStatus)}
                          </div>
                        </div>

                        {/* Corpo do Evento */}
                        <div className="p-5 sm:p-6 space-y-5">
                          
                          {/* Oficina Responsável e OS */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-sky-700" />
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-slate-500 font-medium">Oficina Credenciada: </span>
                                <button
                                  onClick={() => onNavigate('site-oficina')}
                                  className="text-[#0B1E36] hover:text-sky-700 font-bold underline decoration-slate-300 hover:decoration-sky-500 cursor-pointer flex items-center gap-1"
                                  title="Ver site oficial da oficina no ecossistema VEBOOK"
                                >
                                  <span>{record.workshopName}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 inline" />
                                </button>
                                <span className="text-slate-400 ml-1">({record.workshopCity} - {record.workshopState})</span>
                              </div>
                            </div>

                            {record.internalOsNumber && (
                              <div className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Ref: {record.internalOsNumber}
                              </div>
                            )}
                          </div>

                          {/* Se houver Contestação: Caixa de Contestação Preservada */}
                          {record.contestation && (
                            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs space-y-2">
                              <div className="flex items-center justify-between text-rose-800 font-bold">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                                  <span>Contestação Registrada pelo Cliente — {record.contestation.reasonLabel}</span>
                                </div>
                                <span className="text-[11px] text-rose-600 font-normal">
                                  {new Date(record.contestation.contestedAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-rose-900 leading-relaxed bg-white/80 p-2.5 rounded border border-rose-100 font-medium">
                                "{record.contestation.comment}"
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-rose-700">
                                <span>Manifestação registrada por: <strong>{record.contestation.maskedClientIdentifier}</strong></span>
                                <span className="italic text-[10px]">A VEBOOK preserva tanto o registro original quanto a contestação.</span>
                              </div>
                            </div>
                          )}

                          {/* Produtos e Peças Utilizados (Seção Rica) */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1E36] uppercase tracking-wider">
                                <Package className="w-4 h-4 text-sky-700" />
                                <span>Produtos e Peças Aplicados ({record.products.length})</span>
                              </div>

                              <button
                                onClick={() => toggleExpand(record.id)}
                                className="text-xs font-bold text-[#0B1E36] hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Recolher detalhes' : 'Ver especificações completas'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Grid de Produtos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {record.products.map((prod) => (
                                <div
                                  key={prod.id}
                                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-1.5 hover:bg-white hover:border-slate-300 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded text-[11px] border border-sky-100">
                                      {prod.brand}
                                    </span>
                                    <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                      {prod.quantity} {prod.unit}
                                    </span>
                                  </div>

                                  <div className="font-bold text-[#0B1E36] text-sm">
                                    {prod.commercialName}
                                  </div>

                                  {prod.specification && (
                                    <div className="text-slate-600 text-[11px] leading-tight">
                                      <span className="text-slate-400">Especificação: </span>
                                      {prod.specification}
                                    </div>
                                  )}

                                  {isExpanded && prod.productCode && (
                                    <div className="text-slate-500 font-mono text-[10px] pt-1 border-t border-slate-200/60">
                                      Cód. Fabricante: {prod.productCode}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Observações e Mão de Obra */}
                          {record.observations && (
                            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                              <strong className="text-slate-700">Observações Técnicas: </strong>
                              {record.observations}
                            </div>
                          )}

                          {/* Rodapé do Evento com Validação Mascarada, Proveniência e Botão de Contestação */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {record.maskedValidatorName ? (
                                <div className="flex items-center gap-1.5 text-emerald-800">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Registro validado por <strong>{record.maskedValidatorName}</strong></span>
                                </div>
                              ) : record.validationStatus === 'aguardando' ? (
                                <div className="flex items-center gap-1.5 text-amber-700">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Notificação enviada ao cliente · Prazo de validação aberto</span>
                                </div>
                              ) : (
                                <span>Origem: Registro realizado pela oficina credenciada</span>
                              )}

                              <span className="text-slate-300">|</span>
                              <span className="font-mono text-slate-400">ID: {record.id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (onOpenContestacaoModalForRecord) {
                                    onOpenContestacaoModalForRecord(record);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Abrir procedimento formal de contestação para este registro"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-700" />
                                <span>Contestar este registro</span>
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>
            )}

          </div>

          {/* CTA de Rodapé: Emissão de Certidão */}
          <div className="p-8 bg-[#0B1E36] text-white text-center space-y-4">
            <div className="max-w-2xl mx-auto space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">
                Precisa comprovar este histórico para venda ou avaliação?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Emita a <strong>Certidão VEBOOK de Histórico Veicular</strong>. Um documento oficial com número único, snapshot cronológico até a data de hoje e QR Code para validação pública de autenticidade.
              </p>
            </div>
            <button
              onClick={() => {
                if (onEmitirCertidaoForPlate) onEmitirCertidaoForPlate(currentVehicle.plate);
                onNavigate('certidao');
              }}
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1E36] font-extrabold text-sm sm:text-base transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <FileCheck2 className="w-5 h-5 text-[#0B1E36]" />
              <span>Emitir Certidão Oficial deste Veículo</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
