import React, { useEffect, useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppView } from '../../types';
import { Logo } from './Logo';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onFocusConsulta: () => void;
  onOpenEntrar: () => void;
}

const NAV_ITEMS: { view: AppView; label: string }[] = [
  { view: 'diario', label: 'Consultar veículo' },
  { view: 'oficinas', label: 'Para oficinas' },
  { view: 'como-funciona', label: 'Como funciona' },
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onFocusConsulta,
  onOpenEntrar,
}) => {
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

  const handleNavClick = (view: AppView) => {
    setMobileMenuOpen(false);
    if (view === 'diario') {
      onFocusConsulta();
      return;
    }
    onNavigate(view);
  };

  const isActive = (view: AppView) => {
    if (view === 'diario') return currentView === 'diario' || currentView === 'certidao';
    if (view === 'oficinas') return currentView === 'oficinas' || currentView === 'site-oficina';
    return currentView === view;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="rounded-lg text-left"
          aria-label="VEBOOK, ir para o início"
        >
          <Logo size="md" variant="dark" />
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => handleNavClick(item.view)}
              aria-current={isActive(item.view) ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(item.view)
                  ? 'bg-slate-100 text-[#0B1E36]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B1E36]'
              }`}
            >
              {item.label}
            </button>
          ))}
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
        <div
          id={menuId}
          className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"
        >
          <nav className="space-y-1" aria-label="Principal">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`block w-full rounded-lg px-3 py-3 text-left text-base font-semibold ${
                currentView === 'home' ? 'bg-slate-100 text-[#0B1E36]' : 'text-slate-700'
              }`}
            >
              Início
            </button>
            {NAV_ITEMS.filter((item) => item.view !== 'diario').map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavClick(item.view)}
                aria-current={isActive(item.view) ? 'page' : undefined}
                className={`block w-full rounded-lg px-3 py-3 text-left text-base font-semibold ${
                  isActive(item.view) ? 'bg-slate-100 text-[#0B1E36]' : 'text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <Button fullWidth onClick={() => handleNavClick('diario')}>
              Consultar veículo
            </Button>
            <Button fullWidth variant="secondary" onClick={() => { setMobileMenuOpen(false); onOpenEntrar(); }}>
              Entrar
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
