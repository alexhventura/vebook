import React, { forwardRef } from 'react';
import { AppView, TransparenciaSection } from '../../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onNavigateTransparencia: (section: TransparenciaSection) => void;
  onOpenCookiesConfig: () => void;
  onOpenPrivacidadeModal: () => void;
  onOpenContestacaoModal: () => void;
  onOpenContato: () => void;
  /** Atalhos de protótipo: site e painel sem senha */
  onOpenDemoWorkshopSite?: () => void;
  onOpenDemoPanel?: () => void | Promise<void>;
}

/**
 * Rodapé institucional fixo na base da viewport (páginas não imersivas).
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  {
    onNavigate,
    onNavigateTransparencia,
    onOpenCookiesConfig,
    onOpenPrivacidadeModal: _onOpenPrivacidadeModal,
    onOpenContestacaoModal: _onOpenContestacaoModal,
    onOpenContato: _onOpenContato,
    onOpenDemoWorkshopSite,
    onOpenDemoPanel,
  },
  ref,
) {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransparencia = (section: TransparenciaSection) => {
    onNavigateTransparencia(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkClass =
    'hover:text-vebook-white transition-colors cursor-pointer text-left text-[11px] sm:text-xs text-vebook-subtle whitespace-nowrap';

  return (
    <footer
      ref={ref}
      id="footer-institucional-vebook"
      className="fixed inset-x-0 bottom-0 z-40 bg-vebook-navy-deep text-vebook-subtle py-4 sm:py-5 px-4 sm:px-6 lg:px-8 border-t border-vebook-navy-mid"
    >
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => handleTransparencia('como-tratamos')}
              className={linkClass}
            >
              Portal de governança
            </button>
            <button
              type="button"
              onClick={() => handleNav('painel-oficina')}
              className="text-vebook-subtle/60 hover:text-vebook-subtle transition-colors cursor-pointer text-left text-[10px] sm:text-[11px] whitespace-nowrap"
            >
              Acesso administrativo
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-vebook-subtle/75">
            <span>© 2026 VEBOOK</span>
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
              Preferências
            </button>
          </div>
        </div>

        {(onOpenDemoWorkshopSite || onOpenDemoPanel) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-dashed border-vebook-mustard/35 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-vebook-mustard/90">
              Atalhos de teste · sem senha
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {onOpenDemoWorkshopSite ? (
                <button
                  type="button"
                  onClick={onOpenDemoWorkshopSite}
                  className="inline-flex items-center rounded-vebook-sm border border-vebook-mustard/60 bg-vebook-mustard/15 px-2.5 py-1 text-[11px] font-semibold text-vebook-mustard hover:bg-vebook-mustard hover:text-vebook-navy-deep transition-colors cursor-pointer"
                >
                  Teste · Site da oficina
                </button>
              ) : null}
              {onOpenDemoPanel ? (
                <button
                  type="button"
                  onClick={() => {
                    void onOpenDemoPanel();
                  }}
                  className="inline-flex items-center rounded-vebook-sm border border-vebook-mustard/60 bg-vebook-mustard/15 px-2.5 py-1 text-[11px] font-semibold text-vebook-mustard hover:bg-vebook-mustard hover:text-vebook-navy-deep transition-colors cursor-pointer"
                >
                  Teste · Painel de gestão
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
});
