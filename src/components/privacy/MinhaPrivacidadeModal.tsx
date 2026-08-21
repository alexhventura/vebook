import React, { useState } from 'react';
import { LgpdRequest, LgpdRequestType } from '../../types';
import { DATA_CATEGORIES_MATRIX } from '../../data/governanceData';
import {
  ShieldCheck,
  X,
  FileSearch,
  UserCheck,
  Trash2,
  Edit3,
  Share2,
  Lock,
  Download,
  CheckCircle2,
  Send,
  AlertCircle,
  Clock,
  Layers,
  Sliders,
} from 'lucide-react';

interface MinhaPrivacidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCookiesConfig: () => void;
}

export const MinhaPrivacidadeModal: React.FC<MinhaPrivacidadeModalProps> = ({
  isOpen,
  onClose,
  onOpenCookiesConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'mapa' | 'solicitar' | 'protocolos'>('mapa');
  
  // Form State
  const [requestType, setRequestType] = useState<LgpdRequestType>('acesso');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterCpf, setRequesterCpf] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [submittedProtocol, setSubmittedProtocol] = useState<LgpdRequest | null>(null);

  // Lista simulada de protocolos anteriores
  const [protocolsList, setProtocolsList] = useState<LgpdRequest[]>([
    {
      id: 'req-1',
      protocol: 'LGPD-2026-44912',
      requesterName: 'Alex H. Ventura',
      email: 'alex.hventura@gmail.com',
      documentMasked: 'CPF ***.821.908-**',
      type: 'confirmacao',
      details: 'Confirmação de tratamento e vinculação da placa BRA2E19',
      status: 'atendido',
      createdAt: '12/07/2026',
      estimatedDeadline: '15/07/2026 (Concluído)',
    },
  ]);

  if (!isOpen) return null;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName || !requesterEmail || !requesterCpf || !requestDetails) return;

    const protocolNum = `LGPD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReq: LgpdRequest = {
      id: `req-${Date.now()}`,
      protocol: protocolNum,
      requesterName,
      email: requesterEmail,
      documentMasked: `CPF ***.${requesterCpf.slice(3, 6)}.${requesterCpf.slice(6, 9)}-**`,
      type: requestType,
      details: requestDetails,
      status: 'recebido',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      estimatedDeadline: 'Em até 15 dias (Art. 19 da LGPD)',
    };

    setProtocolsList([newReq, ...protocolsList]);
    setSubmittedProtocol(newReq);
  };

  const handleResetForm = () => {
    setSubmittedProtocol(null);
    setRequesterName('');
    setRequesterEmail('');
    setRequesterCpf('');
    setRequestDetails('');
    setActiveTab('protocolos');
  };

  return (
    <div
      id="modal-minha-privacidade"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#0B1E36] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Painel Minha Privacidade</span>
                <span className="text-[10px] font-mono bg-sky-900/80 text-sky-300 px-2 py-0.5 rounded border border-sky-700">
                  LGPD Art. 18
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Governança, transparência e exercício de direitos do titular no VEBOOK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'mapa'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mapa de Tratamento de Dados</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitar')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'solicitar'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Exercer Direitos (Nova Solicitação)</span>
          </button>

          <button
            onClick={() => setActiveTab('protocolos')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'protocolos'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Minhas Solicitações ({protocolsList.length})</span>
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          
          {/* ABA 1: MAPA DE DADOS */}
          {activeTab === 'mapa' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 text-sky-900 leading-relaxed flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Arquitetura de Segregação de Dados:</strong>
                  O VEBOOK distingue rigidamente dados pessoais identificáveis (tutelados pela LGPD) dos dados do prontuário técnico do veículo (manutenções, peças e insumos).
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Categorias de Dados Coletadas e Bases Legais Aplicáveis:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DATA_CATEGORIES_MATRIX.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{cat.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cat.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong>Exemplos:</strong> {cat.examples.join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        <strong>Finalidade:</strong> {cat.purpose}
                      </p>
                      <div className="pt-1 text-[10px] text-slate-400 font-mono">
                        Base: {cat.legalFramework.slice(0, 70)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h5 className="font-bold text-xs">Gerenciamento de Cookies & Rastreamento</h5>
                  <p className="text-[11px] text-slate-400">
                    Ajuste a qualquer momento suas escolhas de cookies opcionais e estatísticas.
                  </p>
                </div>
                <button
                  onClick={onOpenCookiesConfig}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configurar Cookies</span>
                </button>
              </div>

              {/* Contato do DPO */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Encarregado pelo Tratamento de Dados (DPO):</span>
                  <p className="text-[11px] text-slate-500">Canal formal de comunicação: dpo@vebook.com.br</p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  Resolução CD/ANPD nº 18/2024
                </span>
              </div>
            </div>
          )}

          {/* ABA 2: EXERCER DIREITOS (FORMULÁRIO) */}
          {activeTab === 'solicitar' && (
            <div>
              {submittedProtocol ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      Solicitação LGPD Registrada com Sucesso
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Seu pedido foi protocolado junto ao Encarregado de Proteção de Dados do VEBOOK.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block text-left text-xs space-y-1.5 min-w-[280px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Protocolo:</span>
                      <strong className="text-sky-700 font-mono font-bold">{submittedProtocol.protocol}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Tipo:</span>
                      <strong className="text-slate-800 uppercase font-bold">{submittedProtocol.type}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Prazo Estimado:</span>
                      <span className="text-slate-700 font-medium">{submittedProtocol.estimatedDeadline}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleResetForm}
                      className="px-5 py-2 rounded-lg bg-[#0B1E36] hover:bg-[#122b4d] text-white font-bold text-xs cursor-pointer"
                    >
                      Ver no Histórico de Solicitações
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Direito que você deseja exercer (Art. 18 da LGPD): *
                    </label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value as LgpdRequestType)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                    >
                      <option value="acesso">1. Acesso Completo aos meus dados (Extrato de registros)</option>
                      <option value="confirmacao">2. Confirmação da existência de tratamento de dados</option>
                      <option value="correcao">3. Correção de dados incompletos, inexatos ou desatualizados</option>
                      <option value="exclusao">4. Eliminação de dados pessoais tratados com consentimento</option>
                      <option value="revogacao">5. Revogação de consentimento anteriormente concedido</option>
                      <option value="informacao_compartilhamento">6. Informação sobre entidades públicas/privadas com quem compartilhamos dados</option>
                      <option value="portabilidade">7. Portabilidade de dados para outro fornecedor de serviço</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">Nome Completo: *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Ferreira"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">E-mail: *</label>
                      <input
                        type="email"
                        required
                        placeholder="carlos@email.com"
                        value={requesterEmail}
                        onChange={(e) => setRequesterEmail(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">CPF (para validação): *</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={requesterCpf}
                        onChange={(e) => setRequesterCpf(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">
                      Detalhes da sua solicitação: *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Descreva exatamente quais dados, veículos ou situações você gostaria de consultar, retificar ou tratar..."
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                    * Para segurança e prevenção a fraudes de identidade, o VEBOOK poderá solicitar confirmação prévia via e-mail ou SMS antes do envio de relatórios contendo dados sensíveis.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#0B1E36] hover:bg-[#122b4d] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Registrar Solicitação LGPD</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ABA 3: HISTÓRICO DE SOLICITAÇÕES */}
          {activeTab === 'protocolos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Histórico de Solicitações do Titular
                </h4>
                <span className="text-[11px] text-slate-500">
                  Rastreabilidade e cumprimento de prazos legais
                </span>
              </div>

              <div className="space-y-3">
                {protocolsList.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-700 text-xs">{req.protocol}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {req.type}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.status === 'atendido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'atendido' ? 'Concluído' : 'Em Análise'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{req.details}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/80">
                      <span>Solicitante: {req.requesterName} ({req.documentMasked})</span>
                      <span>Data: {req.createdAt} · Prazo: {req.estimatedDeadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            VEBOOK Infraestrutura Tecnológica de Histórico Veicular
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
