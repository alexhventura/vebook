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

/**
 * Rodapé compacto — navegação completa sem ocupar meia tela.
 */
export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateTransparencia,
  onOpenCookiesConfig,
  onOpenPrivacidadeModal: _onOpenPrivacidadeModal,
  onOpenContestacaoModal: _onOpenContestacaoModal,
  onOpenContato,
}) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransparencia = (section: TransparenciaSection) => {
    onNavigateTransparencia(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkClass =
    'hover:text-vebook-white transition-colors cursor-pointer text-left text-xs text-vebook-subtle leading-snug';

  return (
    <footer
      id="footer-institucional-vebook"
      className="bg-vebook-navy-deep text-vebook-subtle py-7 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-vebook-navy-mid"
    >
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 pb-5 border-b border-vebook-navy-mid">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-2">
            <Logo size="sm" variant="light" />
            <p className="text-[11px] text-vebook-blue-muted leading-snug max-w-[16rem]">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase text-vebook-white tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-1">
              <li>
                <button type="button" onClick={() => handleNav('home')} className={linkClass}>
                  Início
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('diario')} className={linkClass}>
                  Diário Veicular
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('como-funciona')} className={linkClass}>
                  Como Funciona
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('certidao')} className={linkClass}>
                  Certidão VEBOOK
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('oficinas')} className={linkClass}>
                  Para Oficinas
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('site-oficina')} className={linkClass}>
                  Site da Oficina
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('validacao')} className={linkClass}>
                  Validar Serviço
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('transparencia')} className={linkClass}>
                  Transparência
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase text-vebook-white tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-1">
              <li>
                <button type="button" onClick={() => handleTransparencia('termos')} className={linkClass}>
                  Termos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('privacidade')}
                  className={linkClass}
                >
                  Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('seguranca')}
                  className={linkClass}
                >
                  Segurança
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenContato} className={linkClass}>
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase text-vebook-subtle/70 tracking-wider">
              Área restrita
            </h4>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('painel-oficina')}
                  className="text-vebook-subtle/70 hover:text-vebook-subtle transition-colors cursor-pointer text-left text-[11px]"
                >
                  Acesso administrativo
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-vebook-subtle/80">
          <div>© 2026 VEBOOK</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => handleTransparencia('cookies')}
              className="hover:text-vebook-blue-muted transition-colors cursor-pointer"
            >
              Cookies
            </button>
            <button
              type="button"
              onClick={onOpenCookiesConfig}
              className="hover:text-vebook-blue-muted transition-colors cursor-pointer"
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
