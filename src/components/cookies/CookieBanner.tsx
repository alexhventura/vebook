import React, { useState, useEffect } from 'react';
import { CookiePreferences } from '../../types';
import { ShieldCheck, Cookie, Sliders, Check, X, Info } from 'lucide-react';

interface CookieBannerProps {
  isOpenModalExternally?: boolean;
  onCloseExternalModal?: () => void;
}

const COOKIE_STORAGE_KEY = 'vebook_cookie_preferences_v1';

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

  const [hasAnswered, setHasAnswered] = useState<boolean>(true); // Inicia oculto até checar
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
        JSON.stringify({ ...newPrefs, savedAt: new Date().toISOString() })
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
      {/* BANNER INFERIOR INSTITUCIONAL (Só aparece se o usuário ainda não tiver optado) */}
      {!hasAnswered && !isModalOpen && (
        <div
          id="vebook-cookie-banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-[#071526]/95 backdrop-blur-md border-t border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="p-2.5 rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Cookies e privacidade
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Usamos cookies essenciais para o funcionamento do site. Cookies opcionais de desempenho e preferências só são usados se você autorizar.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <button
                id="btn-cookie-configurar"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Configurar</span>
              </button>

              <button
                id="btn-cookie-recusar"
                onClick={handleRejectOptionals}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all cursor-pointer"
              >
                Recusar Opcionais
              </button>

              <button
                id="btn-cookie-aceitar"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#0B1E36] bg-white hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Aceitar Todos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PREFERÊNCIAS DETALHADAS DE COOKIES */}
      {isModalOpen && (
        <div
          id="modal-cookie-preferences"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 bg-[#0B1E36] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Central de Preferências de Cookies</h3>
                  <p className="text-xs text-slate-300">
                    Transparência e controle de privacidade no VEBOOK
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseExternalModal) onCloseExternalModal();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo scrollável */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p>
                  Em consonância com a <strong>LGPD (Lei 13.709/2018)</strong> e o <strong>Guia de Cookies da ANPD</strong>, você tem o direito de escolher livremente quais categorias de tecnologias autoriza em sua navegação.
                </p>
              </div>

              {/* Categorias */}
              <div className="space-y-4">
                {/* 1. Essenciais */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#0B1E36]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Cookies Essenciais e de Segurança</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                      Sempre Ativos (Obrigatórios)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Indispensáveis para a autenticação de oficinas, proteção contra requisições fraudulentas (CSRF), integridade de sessões e cumprimento do Art. 15 do Marco Civil da Internet.
                  </p>
                </div>

                {/* 2. Desempenho */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#0B1E36]">
                      <span>Cookies de Desempenho e Estatísticas Anônimas</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.performance}
                        onChange={(e) =>
                          setPreferences({ ...preferences, performance: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Permitem aferir métricas agregadas de velocidade e uso das páginas para aprimoramento da infraestrutura técnica, sem identificar indivíduos ou placas específicas.
                  </p>
                </div>

                {/* 3. Funcionais */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#0B1E36]">
                      <span>Cookies de Funcionalidade e Preferências</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Armazenam preferências locais de navegação (como filtros recentes de consulta ou tamanho de fonte) para conveniência do usuário durante o uso do Diário Veicular.
                  </p>
                </div>

                {/* 4. Publicidade / Parceiros Homologados */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#0B1E36]">
                      <span>Cookies de Parceiros Homologados do Setor</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.advertising}
                        onChange={(e) =>
                          setPreferences({ ...preferences, advertising: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Utilizados para exibir comunicações institucionais de fabricantes homologados (peças, lubrificantes e filtros) nas áreas periféricas dedicadas sem invasão de privacidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer com botões */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleRejectOptionals}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
              >
                Rejeitar Opcionais
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSavePreferences(preferences)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#0B1E36] hover:bg-[#132c4d] transition-all cursor-pointer"
                >
                  Salvar Minhas Escolhas
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#0B1E36] hover:bg-[#122b4d] transition-all cursor-pointer"
                >
                  Autorizar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
