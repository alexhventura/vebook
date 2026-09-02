import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CookiePreferences } from '../../types';
import { ShieldCheck, Cookie, Sliders, Check, X, Info } from 'lucide-react';
import { Button } from '../ui';

interface CookieBannerProps {
  isOpenModalExternally?: boolean;
  onCloseExternalModal?: () => void;
}

const COOKIE_STORAGE_KEY = 'vebook_cookie_preferences_v1';

const toggleTrack =
  "w-10 h-5 bg-vebook-border-strong peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-vebook-blue/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-vebook-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-vebook-white after:border after:border-vebook-border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vebook-navy";

export const CookieBanner: React.FC<CookieBannerProps> = ({
  isOpenModalExternally = false,
  onCloseExternalModal,
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    performance: false,
    functional: false,
    advertising: false,
  });

  const [hasAnswered, setHasAnswered] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const syncBannerOffset = useCallback(() => {
    const banner = bannerRef.current;
    const visible = Boolean(banner) && !hasAnswered && !isModalOpen;
    if (!visible || !banner) {
      document.documentElement.style.removeProperty('--vebook-cookie-banner-h');
      document.documentElement.style.removeProperty('padding-bottom');
      document.body.style.removeProperty('padding-bottom');
      document.documentElement.classList.remove('vebook-cookie-banner-open');
      document.body.classList.remove('vebook-cookie-banner-open');
      return;
    }
    const height = Math.ceil(banner.getBoundingClientRect().height);
    const offset = `${height}px`;
    document.documentElement.style.setProperty('--vebook-cookie-banner-h', offset);
    document.documentElement.style.paddingBottom = offset;
    document.body.style.paddingBottom = offset;
    document.documentElement.classList.add('vebook-cookie-banner-open');
    document.body.classList.add('vebook-cookie-banner-open');
  }, [hasAnswered, isModalOpen]);

  useEffect(() => {
    syncBannerOffset();
    const banner = bannerRef.current;
    if (!banner || hasAnswered || isModalOpen) return undefined;

    const observer = new ResizeObserver(() => syncBannerOffset());
    observer.observe(banner);
    window.addEventListener('resize', syncBannerOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncBannerOffset);
      document.documentElement.style.removeProperty('--vebook-cookie-banner-h');
      document.documentElement.style.removeProperty('padding-bottom');
      document.body.style.removeProperty('padding-bottom');
      document.documentElement.classList.remove('vebook-cookie-banner-open');
      document.body.classList.remove('vebook-cookie-banner-open');
    };
  }, [hasAnswered, isModalOpen, syncBannerOffset]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
        setHasAnswered(true);
      } else {
        setHasAnswered(false);
      }
    } catch {
      setHasAnswered(false);
    }
  }, []);

  useEffect(() => {
    if (isOpenModalExternally) {
      setIsModalOpen(true);
    }
  }, [isOpenModalExternally]);

  const handleSavePreferences = (newPrefs: CookiePreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ ...newPrefs, savedAt: new Date().toISOString() }),
      );
    } catch {
      // safe fallback
    }
    setHasAnswered(true);
    setIsModalOpen(false);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  const handleAcceptAll = () => {
    handleSavePreferences({
      essential: true,
      performance: true,
      functional: true,
      advertising: true,
    });
  };

  const handleRejectOptionals = () => {
    handleSavePreferences({
      essential: true,
      performance: false,
      functional: false,
      advertising: false,
    });
  };

  return (
    <>
      {!hasAnswered && !isModalOpen && (
        <div
          ref={bannerRef}
          id="vebook-cookie-banner"
          role="dialog"
          aria-label="Preferências de cookies"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-vebook-navy-deep/95 backdrop-blur-md border-t border-vebook-navy-mid shadow-vebook-md animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl min-w-0 flex-1">
              <div className="p-2.5 rounded-vebook bg-vebook-navy border border-vebook-navy-mid text-vebook-blue shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" aria-hidden />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-semibold text-vebook-white flex flex-wrap items-center gap-2">
                  <span>Privacidade e cookies</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-vebook-sm bg-vebook-navy text-vebook-blue-muted border border-vebook-navy-mid">
                    LGPD
                  </span>
                </h4>
                <p className="text-xs text-vebook-blue-muted leading-relaxed">
                  O <strong className="text-vebook-white/90">VEBOOK</strong> utiliza cookies necessários
                  para segurança e funcionamento. Cookies opcionais dependem da sua escolha.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <Button
                id="btn-cookie-configurar"
                variant="ghost"
                size="sm"
                className="text-vebook-blue-muted border-vebook-navy-mid hover:border-vebook-blue-muted"
                onClick={() => setIsModalOpen(true)}
              >
                <Sliders className="w-3.5 h-3.5" aria-hidden />
                Configurar
              </Button>

              <Button
                id="btn-cookie-recusar"
                variant="ghost"
                size="sm"
                className="text-vebook-blue-muted border-vebook-navy-mid hover:border-vebook-blue-muted"
                onClick={handleRejectOptionals}
              >
                Recusar opcionais
              </Button>

              <Button id="btn-cookie-aceitar" variant="inverse" size="sm" onClick={handleAcceptAll}>
                <Check className="w-3.5 h-3.5" aria-hidden />
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          id="modal-cookie-preferences"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vebook-ink/70 backdrop-blur-sm"
        >
          <div className="bg-vebook-white rounded-vebook-lg border border-vebook-border shadow-vebook-md max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-vebook-navy text-vebook-white flex items-center justify-between border-b border-vebook-navy-mid">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-vebook bg-vebook-navy-mid border border-vebook-navy-mid text-vebook-blue">
                  <Cookie className="w-5 h-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Preferências de cookies</h3>
                  <p className="text-xs text-vebook-blue-muted">Controle de privacidade no VEBOOK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseExternalModal) onCloseExternalModal();
                }}
                className="p-1.5 rounded-vebook-sm text-vebook-subtle hover:text-vebook-white hover:bg-vebook-navy-mid transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-vebook-text text-sm">
              <div className="p-3.5 rounded-vebook-md bg-vebook-blue-soft border border-vebook-border text-xs text-vebook-muted leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-vebook-blue shrink-0 mt-0.5" aria-hidden />
                <p>
                  Em consonância com a <strong className="text-vebook-navy">LGPD (Lei 13.709/2018)</strong>, você
                  pode escolher quais categorias autoriza na navegação.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-vebook-md border border-vebook-border bg-vebook-gray space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 font-semibold text-vebook-navy">
                      <ShieldCheck className="w-4 h-4 text-vebook-blue" aria-hidden />
                      <span>Cookies essenciais</span>
                    </div>
                    <span className="text-[11px] font-semibold text-vebook-navy bg-vebook-navy-soft px-2 py-0.5 rounded-vebook-sm border border-vebook-border">
                      Sempre ativos
                    </span>
                  </div>
                  <p className="text-xs text-vebook-muted leading-relaxed">
                    Necessários para segurança, autenticação e funcionamento da plataforma.
                  </p>
                </div>

                <div className="p-4 rounded-vebook-md border border-vebook-border bg-vebook-white space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-vebook-navy">Desempenho</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.performance}
                        onChange={(e) =>
                          setPreferences({ ...preferences, performance: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className={toggleTrack} />
                    </label>
                  </div>
                  <p className="text-xs text-vebook-muted leading-relaxed">
                    Métricas agregadas de uso para aprimorar a infraestrutura, sem identificar indivíduos.
                  </p>
                </div>

                <div className="p-4 rounded-vebook-md border border-vebook-border bg-vebook-white space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-vebook-navy">Funcionalidade</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className={toggleTrack} />
                    </label>
                  </div>
                  <p className="text-xs text-vebook-muted leading-relaxed">
                    Preferências locais de navegação para conveniência durante o uso.
                  </p>
                </div>

                <div className="p-4 rounded-vebook-md border border-vebook-border bg-vebook-white space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-vebook-navy">Parceiros do setor</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.advertising}
                        onChange={(e) =>
                          setPreferences({ ...preferences, advertising: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className={toggleTrack} />
                    </label>
                  </div>
                  <p className="text-xs text-vebook-muted leading-relaxed">
                    Comunicações institucionais de parceiros em áreas periféricas da plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-vebook-gray border-t border-vebook-border flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" size="sm" onClick={handleRejectOptionals}>
                Rejeitar opcionais
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleSavePreferences(preferences)}>
                  Salvar escolhas
                </Button>
                <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                  Autorizar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
