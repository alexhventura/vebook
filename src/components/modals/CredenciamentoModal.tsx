import React, { useState } from 'react';
import { X, CheckCircle2, Store } from 'lucide-react';
import { Logo } from '../layout/Logo';

interface CredenciamentoModalProps {
  mode: 'cadastro' | 'login';
  onClose: () => void;
}

export const CredenciamentoModal: React.FC<CredenciamentoModalProps> = ({ mode, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nomeOficina: '',
    responsavel: '',
    email: '',
    cidadeUf: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0B1E36] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-700">
          <div className="space-y-1">
            <Logo size="sm" variant="light" />
            <p className="text-xs text-slate-300">
              {mode === 'cadastro' ? 'Credenciamento de Oficina' : 'Área para Oficinas Credenciadas'}
            </p>
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
        <div className="p-6">
          {mode === 'login' ? (
            /* Modal Conceitual: Já sou credenciado */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-[#0B1E36] flex items-center justify-center mx-auto border border-slate-200">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-[#0B1E36]">
                  Área para oficinas credenciadas
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  O acesso à área exclusiva para oficinas será disponibilizado posteriormente.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-[#0B1E36] text-white text-xs font-bold hover:bg-[#132c4d] cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : isSubmitted ? (
            /* Confirmação de protótipo de interesse */
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-[#0B1E36] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-sky-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-[#0B1E36]">
                  Solicitação registrada
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Recebemos os dados da oficina. O cadastro e o acesso à área restrita serão tratados nas próximas etapas da plataforma.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-[#0B1E36] text-white text-xs font-bold hover:bg-[#132c4d] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            /* Formulário Provisório de Interesse */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-600">
                Preencha os dados da oficina. Esta solicitação não cria acesso imediato.
              </p>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nome do Estabelecimento / Oficina:</label>
                <input
                  type="text"
                  required
                  value={formData.nomeOficina}
                  onChange={(e) => setFormData({ ...formData, nomeOficina: e.target.value })}
                  placeholder="Nome da oficina"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B1E36] text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Responsável:</label>
                <input
                  type="text"
                  required
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B1E36] text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">E-mail para contato:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@oficina.com.br"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B1E36] text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Cidade / UF:</label>
                <input
                  type="text"
                  required
                  value={formData.cidadeUf}
                  onChange={(e) => setFormData({ ...formData, cidadeUf: e.target.value })}
                  placeholder="Ex: São Paulo / SP"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0B1E36] text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#0B1E36] hover:bg-[#132c4d] text-white font-bold transition-colors cursor-pointer"
                >
                  Enviar solicitação
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
