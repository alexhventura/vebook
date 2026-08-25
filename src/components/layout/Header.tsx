import React, { useState } from 'react';
import { Search, Menu, X, FileCheck2, Shield, Wrench, CheckCircle, BookOpen, Layers } from 'lucide-react';
import { AppView } from '../../types';
import { Logo } from './Logo';
import { Button } from '../ui';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onFocusConsulta: () => void;
}

const navItems: Array<{ view: AppView; label: string; icon: React.ReactNode }> = [
  { view: 'diario', label: 'Diário Veicular', icon: <BookOpen className="w-4 h-4" aria-hidden /> },
  { view: 'como-funciona', label: 'Como Funciona', icon: <Layers className="w-4 h-4" aria-hidden /> },
  { view: 'certidao', label: 'Certidão VEBOOK', icon: <FileCheck2 className="w-4 h-4" aria-hidden /> },
  { view: 'oficinas', label: 'Para Oficinas', icon: <Wrench className="w-4 h-4" aria-hidden /> },
  { view: 'site-oficina', label: 'Site da Oficina', icon: <span className="w-1.5 h-1.5 rounded-full bg-vebook-mustard" aria-hidden /> },
  { view: 'validacao', label: 'Validar Serviço', icon: <CheckCircle className="w-4 h-4" aria-hidden /> },
  { view: 'transparencia', label: 'Transparência', icon: <Shield className="w-4 h-4" aria-hidden /> },
];

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onFocusConsulta }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navClass = (active: boolean) =>
    [
      'px-2.5 xl:px-3 py-2 rounded-vebook-sm text-[13px] xl:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5',
      active
        ? 'text-vebook-navy bg-vebook-navy-soft font-semibold'
        : 'text-vebook-muted hover:text-vebook-navy hover:bg-vebook-gray',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 bg-vebook-white/95 backdrop-blur-md border-b border-vebook-border">
      <div className="bg-vebook-navy text-vebook-blue-muted text-[11px] py-1.5 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="hidden sm:inline">Plataforma de histórico veicular</span>
          <span className="mx-auto sm:mx-0 font-medium text-vebook-white/90">
            A oficina registra. O cliente valida. A VEBOOK preserva.
          </span>
          <span className="hidden md:inline text-vebook-blue">Demonstração</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem] gap-3">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-vebook-blue/40 rounded-vebook-sm cursor-pointer text-left shrink-0"
            aria-label="VEBOOK Início"
          >
            <Logo size="md" variant="dark" />
          </button>

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0" aria-label="Principal">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={navClass(currentView === 'home')}
            >
              Início
            </button>
            {navItems.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavClick(item.view)}
                className={navClass(currentView === item.view)}
              >
                <span className="text-vebook-subtle">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (currentView !== 'diario') {
                  onNavigate('diario');
                }
                setTimeout(() => onFocusConsulta(), 100);
              }}
            >
              <Search className="w-3.5 h-3.5 text-vebook-blue-muted" aria-hidden />
              Consultar
            </Button>
          </div>

          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-vebook-text hover:text-vebook-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-vebook-blue/40 rounded-vebook-sm cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-vebook-border bg-vebook-white px-4 pt-3 pb-5 space-y-1 shadow-vebook-md">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left py-2.5 px-3 rounded-vebook-sm text-sm font-medium ${
              currentView === 'home'
                ? 'bg-vebook-navy-soft text-vebook-navy font-semibold'
                : 'text-vebook-text hover:bg-vebook-gray'
            }`}
          >
            Início
          </button>
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => handleNavClick(item.view)}
              className={`block w-full text-left py-2.5 px-3 rounded-vebook-sm text-sm font-medium ${
                currentView === item.view
                  ? 'bg-vebook-navy-soft text-vebook-navy font-semibold'
                  : 'text-vebook-text hover:bg-vebook-gray'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-vebook-border">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('diario');
                setTimeout(() => onFocusConsulta(), 100);
              }}
            >
              <Search className="w-4 h-4 text-vebook-blue-muted" aria-hidden />
              Consultar veículo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
