import React from 'react';
import { AppView, TransparenciaSection } from '../../types';
import { Logo } from './Logo';
import { Info } from 'lucide-react';

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
  onOpenContato: _onOpenContato,
}) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransparencia = (section: TransparenciaSection) => {
    onNavigateTransparencia(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConsultar = () => {
    handleNav('diario');
  };

  return (
    <footer id="footer-institucional-vebook" className="bg-[#071526] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo size="md" variant="light" />
            <p className="text-sm text-slate-300 leading-relaxed">
              O histórico do veículo em um só lugar.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-white tracking-wider">
              VEBOOK
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={handleConsultar}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Consultar veículo
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('oficinas')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Oficinas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('como-funciona')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Como funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-white tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('como-tratamos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('seguranca')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Segurança
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('privacidade')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('termos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Termos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleTransparencia('cookies')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cookies
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Área restrita
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('painel-oficina')}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-left text-xs"
                >
                  Acesso administrativo
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Aviso legal</span>
          </div>
          <p>
            A <strong>VEBOOK</strong> é uma plataforma tecnológica de registro, organização e histórico veicular. A VEBOOK não é órgão governamental, cartório ou substituto dos órgãos do Sistema Nacional de Trânsito (SENATRAN/CONTRAN/Detran), não atesta propriedade jurídica ou quitação tributária, não substitui o CRLV/ATPV-e e não substitui laudo de vistoria cautelar veicular. A certidão reproduz as informações disponíveis na base tecnológica do VEBOOK no momento de sua emissão, sem constituir garantia de inexistência de fatos não registrados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
          <div>
            © 2026 VEBOOK
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleTransparencia('privacidade')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacidade
            </button>
            <button
              type="button"
              onClick={() => handleTransparencia('cookies')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cookies
            </button>
            <button
              type="button"
              onClick={onOpenCookiesConfig}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
