import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { PATHS } from '../../lib/paths';

interface FooterProps {
  onOpenCookiesConfig: () => void;
  onOpenPrivacidadeModal: () => void;
}

const linkClass = 'text-left text-slate-300 hover:text-white';

export const Footer: React.FC<FooterProps> = ({
  onOpenCookiesConfig,
  onOpenPrivacidadeModal,
}) => {
  return (
    <footer className="border-t border-slate-800 bg-[#071526] text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:pr-4">
            <Logo size="md" variant="light" />
            <p className="text-sm leading-relaxed text-slate-300">
              O histórico que acompanha o veículo.
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              A oficina registra. O cliente valida. A VEBOOK preserva.
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={PATHS.sobre} className={linkClass}>Sobre</Link></li>
              <li><Link to={PATHS.comoFunciona} className={linkClass}>Como funciona</Link></li>
              <li><Link to={PATHS.oficinas} className={linkClass}>Para oficinas</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Veículo</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={PATHS.consultar} className={linkClass}>Consultar veículo</Link></li>
              <li><Link to={PATHS.certidao()} className={linkClass}>Certidão</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Transparência</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={PATHS.faq} className={linkClass}>FAQ</Link></li>
              <li><Link to={PATHS.termos} className={linkClass}>Termos de Uso</Link></li>
              <li><Link to={PATHS.privacidade} className={linkClass}>Privacidade</Link></li>
              <li><Link to={PATHS.cookies} className={linkClass}>Cookies</Link></li>
              <li><Link to={PATHS.seguranca} className={linkClass}>Segurança</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Suporte</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button type="button" onClick={onOpenPrivacidadeModal} className={linkClass}>
                  Privacidade do titular
                </button>
              </li>
              <li><Link to={PATHS.contato} className={linkClass}>Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-slate-800 bg-[#0B1E36]/40 px-5 py-4 text-sm leading-relaxed text-slate-400">
          <p>
            A VEBOOK é uma plataforma de registro e organização do histórico de manutenção veicular.
            Não é órgão de trânsito, não consulta bases governamentais e não substitui CRLV, transferência ou laudo cautelar.
            A certidão reproduz os registros disponíveis na plataforma no momento da emissão.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 VEBOOK. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to={PATHS.termos} className="hover:text-slate-300">Termos</Link>
            <Link to={PATHS.privacidade} className="hover:text-slate-300">Privacidade</Link>
            <button type="button" onClick={onOpenCookiesConfig} className="hover:text-slate-300">
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
