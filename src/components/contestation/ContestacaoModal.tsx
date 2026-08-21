import React, { useState } from 'react';
import { ContestationReason, ContestationSubmission, ServiceRecord } from '../../types';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, FileText, Send, Info } from 'lucide-react';

interface ContestacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRecord?: ServiceRecord | null;
  onSuccessContestation?: (submission: ContestationSubmission) => void;
}

export const ContestacaoModal: React.FC<ContestacaoModalProps> = ({
  isOpen,
  onClose,
  targetRecord,
  onSuccessContestation,
}) => {
  const [reason, setReason] = useState<ContestationReason>('km_incorreta');
  const [requesterName, setRequesterName] = useState('');
  const [requesterContact, setRequesterContact] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName || !requesterContact || !detailedDescription) return;

    const protocolNumber = `CONT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedProtocol(protocolNumber);

    const submission: ContestationSubmission = {
      id: `sub-${Date.now()}`,
      protocol: protocolNumber,
      serviceRecordId: targetRecord ? targetRecord.id : 'registro-geral',
      vehiclePlate: targetRecord ? targetRecord.vehiclePlate : 'BRA2E19',
      requesterName,
      requesterContact,
      reason,
      detailedDescription,
      evidenceNotes,
      status: 'aberta',
      createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    if (onSuccessContestation) {
      onSuccessContestation(submission);
    }
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setRequesterName('');
    setRequesterContact('');
    setDetailedDescription('');
    setEvidenceNotes('');
    onClose();
  };

  return (
    <div
      id="modal-contestacao-registro"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#0B1E36] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Contestação Formal de Registro de Serviço</h3>
              <p className="text-xs text-slate-300">
                Auditoria, governança e integridade do prontuário veicular
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-[#0B1E36]">
                  Contestação Registrada com Sucesso
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  O protocolo formal foi instaurado no VEBOOK e associado ao registro. O status do serviço foi atualizado para <strong>"Contestado / Em Análise"</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block text-left text-xs space-y-1.5 min-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Protocolo:</span>
                  <strong className="text-sky-700 font-mono font-bold">{generatedProtocol}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Veículo:</span>
                  <strong className="text-slate-800 font-bold">{targetRecord?.vehiclePlate || 'BRA2E19'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Situação:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Em Análise Técnica
                  </span>
                </div>
              </div>

              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-left text-xs text-sky-900 leading-relaxed">
                <strong className="block font-bold text-sky-950 mb-1">Princípio da Não Eliminação Arbitrária:</strong>
                A oficina emissora será notificada para apresentação de comprovantes e/ou retificação. O histórico de alterações permanecerá registrado para garantir auditoria mútua entre as partes.
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1E36] hover:bg-[#122b4d] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Concluir e Voltar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Informação do Registro alvo */}
              {targetRecord ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#0B1E36]">
                    <span>Registro a ser Contestado:</span>
                    <span className="text-sky-700 font-mono">OS #{targetRecord.internalOsNumber || targetRecord.id.slice(0, 6)}</span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Serviço:</strong> {targetRecord.serviceType} · <strong>Oficina:</strong> {targetRecord.workshopName} ({targetRecord.workshopCity}/{targetRecord.workshopState})
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Data: {targetRecord.serviceDate} · KM registrado: {targetRecord.mileageKm.toLocaleString('pt-BR')} km · Placa: {targetRecord.vehiclePlate}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <span className="font-bold text-[#0B1E36]">Contestação de Registro de Manutenção</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Informe os dados abaixo para contestar qualquer lançamento de serviço, quilometragem ou peça.
                  </p>
                </div>
              )}

              {/* Princípio de Governança */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  O VEBOOK mantém a integridade do histórico veicular. Registros contestados passam por procedimento técnico de verificação e não são apagados sumariamente sem contraditório com a oficina responsável.
                </p>
              </div>

              {/* Motivo da Contestação */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo Principal da Contestação: *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ContestationReason)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                >
                  <option value="km_incorreta">Quilometragem incorreta ou erro de digitação de hodômetro</option>
                  <option value="servico_nao_realizado">Serviço/mão de obra não realizado neste veículo</option>
                  <option value="peca_produto_divergente">Peça, produto, filtro ou lubrificante divergente do aplicado</option>
                  <option value="veiculo_incorreto">Veículo ou placa incorreta no lançamento da oficina</option>
                  <option value="dado_pessoal_incorreto">Dado pessoal do cliente inserido indevidamente</option>
                  <option value="registro_duplicado">Registro em duplicidade</option>
                  <option value="outro">Outra divergência técnica ou cadastral</option>
                </select>
              </div>

              {/* Identificação do Solicitante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Seu Nome Completo: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Silva"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    WhatsApp ou E-mail para Contato: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (11) 98765-4321 ou roberto@email.com"
                    value={requesterContact}
                    onChange={(e) => setRequesterContact(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Descreva o que ocorreu e o que deve ser retificado: *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique com clareza o motivo da contestação (ex: o carro estava com 48.000 km na data do serviço e não 84.000 km; ou o filtro de combustível não foi substituído)..."
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Evidências / Notas */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Comprovantes ou Referência da Nota Fiscal (Opcional):</span>
                  <span className="text-[10px] text-slate-400 font-normal">NF-e, foto da OS ou do painel</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: NF-e nº 1408 emitida em 15/07/2026 com discriminação das peças"
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 -mx-6 -mb-6 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#0B1E36] hover:bg-[#122b4d] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Contestação</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
