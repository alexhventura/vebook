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
    'hover:text-vebook-white transition-colors cursor-pointer text-left text-sm text-vebook-subtle';

  return (
    <footer
      id="footer-institucional-vebook"
      className="bg-vebook-navy-deep text-vebook-subtle py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-vebook-navy-mid"
    >
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 border-b border-vebook-navy-mid">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo size="md" variant="light" />
            <p className="text-sm text-vebook-blue-muted leading-relaxed">
              O histórico do veículo em um só lugar.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-vebook-white tracking-wider">
              VEBOOK
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('como-tratamos')}
                  className={linkClass}
                >
                  Sobre
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('como-funciona')} className={linkClass}>
                  Como funciona
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('oficinas')} className={linkClass}>
                  Oficinas
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-vebook-white tracking-wider">
              Consultas
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button type="button" onClick={() => handleNav('diario')} className={linkClass}>
                  Consultar veículo
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('certidao')} className={linkClass}>
                  Certidão
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-vebook-white tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2.5">
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

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-vebook-subtle/70 tracking-wider">
              Área restrita
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('painel-oficina')}
                  className="text-vebook-subtle/70 hover:text-vebook-subtle transition-colors cursor-pointer text-left text-xs"
                >
                  Acesso administrativo
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-vebook-subtle/80 pt-1">
          <div>© 2026 VEBOOK</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleTransparencia('privacidade')}
              className="hover:text-vebook-blue-muted transition-colors cursor-pointer"
            >
              Privacidade
            </button>
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
