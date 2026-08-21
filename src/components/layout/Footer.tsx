import React from 'react';
import { AppView, TransparenciaSection } from '../../types';
import { Logo } from './Logo';
import { ShieldCheck, Info } from 'lucide-react';

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
  onOpenContestacaoModal,
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

  return (
    <footer id="footer-institucional-vebook" className="bg-[#071526] text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main Grid de 4 Grupos Estruturados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Coluna 1: Marca e Síntese Institucional */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Logo size="md" variant="light" />
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              O histórico que acompanha o veículo.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-md text-[10px] text-sky-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Infraestrutura Nacional</span>
            </div>
          </div>

          {/* Coluna 2: VEBOOK */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              VEBOOK
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('como-funciona')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Como funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('como-tratamos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sobre o VEBOOK
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('oficinas')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Para Oficinas
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('diario')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Para Proprietários
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  FAQ Institucional
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: TRANSPARÊNCIA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Transparência
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleTransparencia('termos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('privacidade')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('cookies')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Política de Cookies
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('como-tratamos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Como tratamos informações
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('seguranca')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Segurança da Informação
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('direitos-titular')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Direitos do Titular (LGPD)
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: HISTÓRICO E SERVIÇOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Histórico e Serviços
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('diario')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Histórico Veicular
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('regras-consulta')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Regras de Consulta
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('certidao')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Certidões VEBOOK
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('regras-oficinas')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Regras para Oficinas
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTransparencia('contestações')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Política de Contestações
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 5: SUPORTE & PRIVACIDADE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Suporte & Governança
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleTransparencia('faq')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Central de Ajuda
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContestacaoModal}
                  className="hover:text-white transition-colors cursor-pointer text-left text-amber-400 font-semibold"
                >
                  Solicitar correção de dados
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacidadeModal}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Solicitar acesso aos dados
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacidadeModal}
                  className="hover:text-white transition-colors cursor-pointer text-left text-sky-400 font-semibold"
                >
                  Painel Minha Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContato}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Ressalva Jurídica Obrigatória */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Aviso Legal e Delimitação Institucional</span>
          </div>
          <p>
            A <strong>VEBOOK</strong> é uma plataforma tecnológica de registro, organização e histórico veicular. A VEBOOK não é órgão governamental, cartório ou substituto dos órgãos do Sistema Nacional de Trânsito (SENATRAN/CONTRAN/Detran), não atesta propriedade jurídica ou quitação tributária, não substitui o CRLV/ATPV-e e não substitui laudo de vistoria cautelar veicular. A certidão reproduz as informações disponíveis na base tecnológica do VEBOOK no momento de sua emissão, sem constituir garantia de inexistência de fatos não registrados.
          </p>
        </div>

        {/* Linha Final com Copyright e Links Rápidos */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
          <div>
            © 2026 VEBOOK · Plataforma Nacional de Informações e Histórico Veicular.
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
            <button
              onClick={() => handleTransparencia('termos')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => handleTransparencia('privacidade')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacidade
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => handleTransparencia('cookies')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cookies
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenCookiesConfig}
              className="hover:text-slate-300 transition-colors cursor-pointer text-sky-400"
            >
              Preferências de Cookies
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
