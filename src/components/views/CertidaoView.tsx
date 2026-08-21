import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  QrCode, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  User, 
  Calendar, 
  Building2, 
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Layers
} from 'lucide-react';
import { Logo } from '../layout/Logo';
import { VEHICLES_MOCK, SERVICES_MOCK } from '../../data/mockData';
import { AppView } from '../../types';

interface CertidaoViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
}

export const CertidaoView: React.FC<CertidaoViewProps> = ({ initialPlate = 'BRA2E19', onNavigate }) => {
  const [plate, setPlate] = useState<string>(initialPlate);
  const [requesterName, setRequesterName] = useState<string>('João Carlos da Silva');
  const [requesterCpf, setRequesterCpf] = useState<string>('352.981.450-80');
  const [isGenerated, setIsGenerated] = useState<boolean>(true);
  const [validationCodeInput, setValidationCodeInput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<'success' | null>(null);

  const vehicle = VEHICLES_MOCK[plate] || VEHICLES_MOCK['BRA2E19'];
  const services = SERVICES_MOCK[plate] || SERVICES_MOCK['BRA2E19'];

  const emissionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const emissionTime = '14:30:00';
  const certificateCode = `VBK-2026-${plate}-98412`;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerated(true);
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationResult('success');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-800 rounded-full border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Documento Nominal e Autenticável</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36] tracking-tight">
            Certidão VEBOOK de Histórico Veicular
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            A Certidão é a consolidação documental oficial de todos os registros existentes no Diário Veicular até o momento exato de sua emissão.
          </p>
        </div>

        {/* 3 Pilares da Certidão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B1E36] text-base">Nominal ao Solicitante</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Qualquer pessoa pode solicitar. A certidão registra o solicitante nominalmente, sem que seja necessário comprovar propriedade.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B1E36] text-base">Fotografia do Histórico</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Snapshot congelado e imutável. Registra todos os eventos, manutenções, peças, marcas, validações e contestações até a data e hora de emissão.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0B1E36] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B1E36] text-base">Código e QR Code Público</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Qualquer terceiro (comprador, seguradora, revenda) pode escanear o QR Code para atestar a autenticidade original emitida pela VEBOOK.
            </p>
          </div>
        </div>

        {/* Formulário de Emissão / Configuração da Demonstração */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-[#0B1E36] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-sky-700" />
              <span>Simulador de Emissão de Certidão</span>
            </h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Demonstração Institucional
            </span>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Placa do Veículo:</label>
              <select
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-[#0B1E36] bg-slate-50 focus:bg-white text-sm"
              >
                <option value="BRA2E19">BRA2E19 - Toyota Corolla (2022/2023)</option>
                <option value="ABC1D23">ABC1D23 - Jeep Compass (2021/2022)</option>
                <option value="XYZ9K88">XYZ9K88 - VW T-Cross (2023/2024)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Nome do Solicitante (Nominal):</label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Nome completo do solicitante"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-[#0B1E36]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Documento do Solicitante (CPF):</label>
              <input
                type="text"
                required
                value={requesterCpf}
                onChange={(e) => setRequesterCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-[#0B1E36]"
              />
            </div>

            <div className="sm:col-span-3 pt-2 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FileCheck2 className="w-4 h-4 text-sky-300" />
                <span>Atualizar Pré-visualização da Certidão</span>
              </button>
            </div>
          </form>
        </div>

        {/* DOCUMENTO OFICIAL DA CERTIDÃO VEBOOK */}
        {isGenerated && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Documento Oficial Gerado com Snapshot Histórico Congelado</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => alert('Download do PDF oficial em alta resolução da Certidão VEBOOK.')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0B1E36] text-white font-bold text-xs hover:bg-[#132c4d] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-sky-300" />
                  <span>Baixar PDF Oficial</span>
                </button>
              </div>
            </div>

            {/* FOLHA DA CERTIDÃO (ESTÉTICA INSTITUCIONAL E NOTARIAL) */}
            <div className="bg-white p-6 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-xl space-y-8 font-sans print:border-none print:shadow-none">
              
              {/* Cabeçalho Oficial do Documento */}
              <div className="border-b-2 border-[#0B1E36] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <Logo size="md" variant="dark" />
                  <p className="text-xs text-slate-500 font-medium">
                    Plataforma Nacional de Histórico Veicular · Sistema Central de Preservação
                  </p>
                </div>

                <div className="text-right space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                    Certidão de Histórico Veicular
                  </span>
                  <span className="font-mono font-bold text-[#0B1E36] text-sm sm:text-base block">
                    {certificateCode}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Emitida em: <strong>{emissionDate} às {emissionTime}</strong>
                  </span>
                </div>
              </div>

              {/* Bloco 1: Identificação do Solicitante e do Veículo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed">
                
                {/* Solicitante Nominal */}
                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                  <span className="font-bold text-[#0B1E36] uppercase text-[11px] block tracking-wider">
                    1. Dados do Solicitante Nominal
                  </span>
                  <p className="text-slate-700">
                    Nome: <strong className="text-slate-900 font-bold">{requesterName}</strong>
                  </p>
                  <p className="text-slate-700">
                    Documento de Identificação: <strong className="text-slate-900 font-bold">{requesterCpf}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 italic">
                    * A emissão não comprova nem atesta propriedade do veículo por parte do solicitante.
                  </p>
                </div>

                {/* Veículo Objeto da Certidão */}
                <div className="space-y-1.5">
                  <span className="font-bold text-[#0B1E36] uppercase text-[11px] block tracking-wider">
                    2. Identificação do Veículo
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-[#0B1E36] bg-white px-2 py-0.5 rounded border border-slate-300">
                      {vehicle.plate}
                    </span>
                    <span className="font-bold text-slate-800">
                      {vehicle.brand} {vehicle.model}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Versão: <strong>{vehicle.version}</strong>
                  </p>
                  <p className="text-slate-700">
                    Ano Fab./Modelo: <strong>{vehicle.yearFabrication}/{vehicle.yearModel}</strong> · Chassi: <strong className="font-mono">{vehicle.chassisMasked}</strong>
                  </p>
                </div>

              </div>

              {/* Bloco 2: Resumo Consolidado do Histórico Registrado */}
              <div className="space-y-3">
                <span className="font-bold text-[#0B1E36] uppercase text-[11px] block tracking-wider">
                  3. Sumário Estatístico de Fatos (Período: {vehicle.firstRegisteredDate} a {emissionDate})
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Total de Serviços</span>
                    <span className="text-xl font-bold text-[#0B1E36]">{vehicle.totalServicesCount}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Validados pelo Cliente</span>
                    <span className="text-xl font-bold text-emerald-800">{vehicle.validatedServicesCount}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <span className="text-[10px] text-rose-700 font-semibold block">Contestados</span>
                    <span className="text-xl font-bold text-rose-800">{vehicle.contestedServicesCount}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-semibold block">Aguardando Validação</span>
                    <span className="text-xl font-bold text-amber-800">{vehicle.pendingServicesCount}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Oficinas Participantes</span>
                    <span className="text-xl font-bold text-[#0B1E36]">{vehicle.participatingWorkshopsCount}</span>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Relação Cronológica dos Serviços no Snapshot */}
              <div className="space-y-3">
                <span className="font-bold text-[#0B1E36] uppercase text-[11px] block tracking-wider">
                  4. Relação Cronológica de Serviços, Peças e Produtos Registrados
                </span>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
                        <th className="p-3">Data / KM</th>
                        <th className="p-3">Serviço Realizado</th>
                        <th className="p-3">Oficina Credenciada</th>
                        <th className="p-3">Produtos / Peças Aplicados</th>
                        <th className="p-3">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {services.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="p-3 align-top font-mono">
                            <strong className="text-[#0B1E36] block">{new Date(s.serviceDate).toLocaleDateString('pt-BR')}</strong>
                            <span className="text-slate-500">{s.mileageKm.toLocaleString('pt-BR')} KM</span>
                          </td>
                          <td className="p-3 align-top">
                            <strong className="text-slate-900 block">{s.description}</strong>
                            <span className="text-slate-500 text-[11px]">{s.serviceType}</span>
                          </td>
                          <td className="p-3 align-top">
                            <span className="font-semibold text-[#0B1E36] block">{s.workshopName}</span>
                            <span className="text-slate-400 text-[10px]">{s.workshopCity} - {s.workshopState}</span>
                          </td>
                          <td className="p-3 align-top text-[11px] space-y-1">
                            {s.products.map((p) => (
                              <div key={p.id}>
                                <strong className="text-slate-800">{p.brand}</strong> {p.commercialName} ({p.quantity} {p.unit})
                              </div>
                            ))}
                          </td>
                          <td className="p-3 align-top">
                            {s.validationStatus === 'validado' ? (
                              <span className="text-emerald-700 font-bold text-[11px] block">✓ Validado</span>
                            ) : s.validationStatus === 'contestado' ? (
                              <div>
                                <span className="text-rose-700 font-bold text-[11px] block">⚠ Contestado</span>
                                <span className="text-[10px] text-rose-600 italic block">{s.contestation?.reasonLabel}</span>
                              </div>
                            ) : (
                              <span className="text-amber-700 font-bold text-[11px] block">◷ Aguardando</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bloco 4: Validação Notarial, QR Code e Ressalva Legal */}
              <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                
                {/* QR Code de Autenticidade */}
                <div className="sm:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-24 h-24 bg-white border border-slate-300 p-2 rounded-lg flex items-center justify-center shadow-2xs">
                    <QrCode className="w-20 h-20 text-[#0B1E36]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    Escanear para Autenticar
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 block break-all">
                    vebook.com.br/validar/{certificateCode}
                  </span>
                </div>

                {/* Ressalva Jurídica Estrita */}
                <div className="sm:col-span-3 text-[11px] text-slate-500 space-y-2 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                    <Shield className="w-4 h-4 text-sky-700" />
                    <span>Declaração e Termos Institucionais de Validade</span>
                  </div>
                  <p>
                    Esta <strong>Certidão VEBOOK de Histórico Veicular</strong> retrata fielmente os registros de serviços e manutenções inseridos pelas oficinas credenciadas e preservados na plataforma até a data e hora exatas de sua emissão.
                  </p>
                  <p className="font-medium text-slate-600">
                    <strong>IMPORTANTE:</strong> Esta certidão não é documento de propriedade, não substitui o Certificado de Registro e Licenciamento de Veículo (CRLV), não substitui laudo cautelar veicular, não constitui perícia mecânica e não afere o estado mecânico atual do veículo.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Validador Público de Certidão por Código */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0B1E36] flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-700" />
              <span>Verificador de Autenticidade de Certidão</span>
            </h2>
            <p className="text-xs text-slate-600">
              Recebeu uma Certidão impressa ou em PDF? Digite o código alfanumérico para checar se ela é autêntica e emitida originalmente pela VEBOOK.
            </p>
          </div>

          <form onSubmit={handleValidateCode} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={validationCodeInput}
              onChange={(e) => setValidationCodeInput(e.target.value)}
              placeholder="Digite o código da certidão (ex: VBK-2026-BRA2E19-98412)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase font-bold focus:ring-2 focus:ring-[#0B1E36]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Verificar Autenticidade
            </button>
          </form>

          {validationResult === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certidão Autêntica Registrada na VEBOOK</span>
              </div>
              <p>
                Documento emitido validamente para o veículo <strong>{vehicle.brand} {vehicle.model} ({vehicle.plate})</strong> com <strong>{vehicle.totalServicesCount} registros</strong> históricos consolidados.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
