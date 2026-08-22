import React from 'react';
import { X, Shield, FileText, Mail } from 'lucide-react';
import { Logo } from '../layout/Logo';

interface LegalModalProps {
  type: 'termos' | 'privacidade' | 'contato';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0B1E36] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <span className="text-slate-400">|</span>
            <span className="text-sm font-bold text-slate-200">
              {type === 'termos' && 'Termos de Uso'}
              {type === 'privacidade' && 'Política de Privacidade'}
              {type === 'contato' && 'Contato Institucional'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-600 leading-relaxed">
          {type === 'termos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-[#0B1E36]">Termos de Uso da Plataforma VEBOOK</h3>
                <span className="text-xs font-semibold text-slate-500">
                  Versão preliminar
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Texto sujeito a revisão jurídica antes do lançamento.
              </p>
              <p>
                O VEBOOK é uma plataforma tecnológica destinada à organização, registro e consulta de informações relacionadas ao histórico de manutenção e serviços em veículos.
              </p>
              <h4 className="font-bold text-[#0B1E36]">1. Natureza das Informações</h4>
              <p>
                As informações e registros disponibilizados na plataforma refletem os dados cadastrados pelos estabelecimentos credenciados e usuários autorizados no exercício de suas atividades.
              </p>
              <h4 className="font-bold text-[#0B1E36]">2. Responsabilidade pelos Registros</h4>
              <p>
                Cada estabelecimento credenciado é responsável pela veracidade e exatidão das informações lançadas no sistema relativas aos serviços efetuados.
              </p>
              <h4 className="font-bold text-[#0B1E36]">3. Utilização da Consulta</h4>
              <p>
                A consulta é disponibilizada para visualização dos registros existentes e informações disponíveis vinculadas à identificação do veículo.
              </p>
            </div>
          )}

          {type === 'privacidade' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-[#0B1E36]">Política de Privacidade e Proteção de Dados</h3>
                <span className="text-xs font-semibold text-slate-500">
                  Versão preliminar
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Texto sujeito a revisão jurídica antes do lançamento.
              </p>
              <p>
                O VEBOOK preza pela privacidade e segurança no tratamento de dados relacionados a veículos e estabelecimentos cadastrados.
              </p>
              <h4 className="font-bold text-[#0B1E36]">1. Foco no Histórico do Veículo</h4>
              <p>
                A estrutura do VEBOOK é focada no histórico técnico do veículo (manutenções, quilometragem, peças substituídas e datas de realização), sem exposição indevida de dados pessoais.
              </p>
              <h4 className="font-bold text-[#0B1E36]">2. Segurança e Controle de Acesso</h4>
              <p>
                O acesso às operações de registro é restrito a estabelecimentos identificados e usuários com permissões específicas de acesso.
              </p>
              <h4 className="font-bold text-[#0B1E36]">3. Rastreabilidade e Auditoria</h4>
              <p>
                Ações operacionais na plataforma são registradas para viabilizar auditoria interna e assegurar a integridade dos registros.
              </p>
            </div>
          )}

          {type === 'contato' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-bold text-[#0B1E36]">Contato Institucional</h3>
              </div>
              <p>
                Para dúvidas institucionais, esclarecimentos sobre o credenciamento de oficinas ou informações sobre a plataforma:
              </p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-[#0B1E36] font-semibold text-sm">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Canal de contato a definir</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Os canais oficiais de atendimento institucional e suporte serão disponibilizados com a homologação operacional da plataforma.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0B1E36] hover:bg-[#132c4d] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
