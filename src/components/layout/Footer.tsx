import React from 'react';
import { AppView, TransparenciaSection } from '../../types';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onNavigateTransparencia: (section: TransparenciaSection) => void;
  onOpenCookiesConfig: () => void;
  onOpenPrivacidadeModal: () => void;
  onOpenContestacaoModal: () => void;
  onOpenContato: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateTransparencia,
  onOpenCookiesConfig,
  onOpenPrivacidadeModal,
  onOpenContestacaoModal: _onOpenContestacaoModal,
  onOpenContato,
}) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
  };

  return (
    <footer className="border-t border-slate-800 bg-[#071526] text-slate-300">
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-sm leading-relaxed text-slate-300">
              O histórico que acompanha o veículo.
            </p>
            <p className="text-sm text-slate-400">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('como-tratamos')} className="hover:text-white">
                  Sobre
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('como-funciona')} className="hover:text-white">
                  Como funciona
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('oficinas')} className="hover:text-white">
                  Para oficinas
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Veículo</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => handleNav('diario')} className="hover:text-white">
                  Consultar veículo
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('diario')} className="hover:text-white">
                  Histórico
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('certidao')} className="hover:text-white">
                  Certidões
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Transparência</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('faq')} className="hover:text-white">
                  FAQ
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('termos')} className="hover:text-white">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('privacidade')} className="hover:text-white">
                  Privacidade
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('cookies')} className="hover:text-white">
                  Cookies
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('seguranca')} className="hover:text-white">
                  Segurança
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Suporte</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onNavigateTransparencia('faq')} className="hover:text-white">
                  Central de Ajuda
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenPrivacidadeModal} className="hover:text-white">
                  Privacidade do titular
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenContato} className="hover:text-white">
                  Contato
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm leading-relaxed text-slate-400">
          <p>
            A VEBOOK é uma plataforma de registro e organização do histórico de manutenção veicular.
            Não é órgão de trânsito, não consulta bases governamentais e não substitui CRLV, transferência ou laudo cautelar.
            A certidão reproduz os registros disponíveis na plataforma no momento da emissão.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 VEBOOK. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <button type="button" onClick={() => onNavigateTransparencia('termos')} className="hover:text-slate-300">
              Termos
            </button>
            <button type="button" onClick={() => onNavigateTransparencia('privacidade')} className="hover:text-slate-300">
              Privacidade
            </button>
            <button type="button" onClick={onOpenCookiesConfig} className="hover:text-slate-300">
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
