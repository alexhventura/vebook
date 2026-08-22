import React, { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { PATHS } from '../../lib/paths';

interface HeaderProps {
  onOpenEntrar: () => void;
}

const NAV_ITEMS = [
  { to: PATHS.consultar, label: 'Consultar veículo', prefixes: ['/consultar', '/historico'] },
  { to: PATHS.oficinas, label: 'Para oficinas', prefixes: ['/oficinas', '/oficina'] },
  { to: PATHS.comoFunciona, label: 'Como funciona', prefixes: ['/como-funciona'] },
];

function pathMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export const Header: React.FC<HeaderProps> = ({ onOpenEntrar }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const close = () => setMobileMenuOpen(false);

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      active ? 'bg-slate-100 text-[#0B1E36]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B1E36]'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={PATHS.home} className="rounded-lg" aria-label="VEBOOK, ir para o início" onClick={close}>
          <Logo size="md" variant="dark" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map((item) => {
            const active = item.prefixes.some((prefix) => pathMatches(location.pathname, prefix));
            return (
              <NavLink key={item.to} to={item.to} className={linkClass(active)}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button variant="secondary" size="sm" onClick={onOpenEntrar}>
            Entrar
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 lg:hidden"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls={menuId}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div id={menuId} className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="space-y-1" aria-label="Principal">
            <NavLink
              to={PATHS.home}
              onClick={close}
              end
              className={({ isActive }) =>
                `block w-full rounded-lg px-3 py-3 text-left text-base font-semibold ${
                  isActive ? 'bg-slate-100 text-[#0B1E36]' : 'text-slate-700'
                }`
              }
            >
              Início
            </NavLink>
            {NAV_ITEMS.filter((item) => item.to !== PATHS.consultar).map((item) => {
              const active = item.prefixes.some((prefix) => pathMatches(location.pathname, prefix));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  className={`block w-full rounded-lg px-3 py-3 text-left text-base font-semibold ${
                    active ? 'bg-slate-100 text-[#0B1E36]' : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <Link to={PATHS.consultar} onClick={close}>
              <Button fullWidth>Consultar veículo</Button>
            </Link>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                close();
                onOpenEntrar();
              }}
            >
              Entrar
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
