import React, { useState } from 'react';
import { Search, Menu, X, FileCheck2, Shield, Wrench, CheckCircle, BookOpen, Layers } from 'lucide-react';
import { AppView } from '../../types';
import { Logo } from './Logo';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onFocusConsulta: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onFocusConsulta }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Institucional */}
      <div className="bg-[#0B1E36] text-slate-300 text-[11px] py-1 px-4 text-center font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline">Plataforma Nacional de Histórico e Diário Veicular</span>
          <span className="mx-auto sm:mx-0 font-semibold text-slate-200">A oficina registra. O cliente valida. A VEBOOK preserva.</span>
          <span className="hidden md:inline text-sky-400">Ambiente de Demonstração Institucional</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo VEBOOK */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group focus:outline-none cursor-pointer text-left"
            aria-label="VEBOOK Início"
          >
            <Logo size="md" variant="dark" />
          </button>

          {/* Menu principal Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[14px] font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('diario')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'diario'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Diário Veicular</span>
            </button>
            <button
              onClick={() => handleNavClick('como-funciona')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'como-funciona'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Como Funciona</span>
            </button>
            <button
              onClick={() => handleNavClick('certidao')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'certidao'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-slate-500" />
              <span>Certidão VEBOOK</span>
            </button>
            <button
              onClick={() => handleNavClick('oficinas')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'oficinas'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <Wrench className="w-4 h-4 text-slate-500" />
              <span>Para Oficinas</span>
            </button>
            <button
              onClick={() => handleNavClick('site-oficina')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'site-oficina'
                  ? 'text-amber-900 bg-amber-100 font-bold'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Site da Oficina (Camada 2)</span>
            </button>
            <button
              onClick={() => handleNavClick('validacao')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'validacao'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Validar Serviço</span>
            </button>
            <button
              onClick={() => handleNavClick('transparencia')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'transparencia'
                  ? 'text-[#0B1E36] bg-slate-100 font-bold'
                  : 'hover:text-[#0B1E36] hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-sky-600" />
              <span>Transparência & LGPD</span>
            </button>
          </nav>

          {/* Botões de Ação Rápida */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                if (currentView !== 'diario') {
                  onNavigate('diario');
                }
                setTimeout(() => onFocusConsulta(), 100);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#0B1E36] text-white hover:bg-[#132c4d] shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-sky-300" />
              <span>Consultar Placa</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0B1E36] focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in duration-150">
          <button
            onClick={() => handleNavClick('home')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'home' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => handleNavClick('diario')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'diario' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Diário Veicular
          </button>
          <button
            onClick={() => handleNavClick('como-funciona')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'como-funciona' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Como Funciona
          </button>
          <button
            onClick={() => handleNavClick('certidao')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'certidao' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Certidão VEBOOK
          </button>
          <button
            onClick={() => handleNavClick('oficinas')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'oficinas' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Para Oficinas
          </button>
          <button
            onClick={() => handleNavClick('site-oficina')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'site-oficina' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Site da Oficina (Camada 2)
          </button>
          <button
            onClick={() => handleNavClick('validacao')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'validacao' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Validar Serviço (Simulador)
          </button>
          <button
            onClick={() => handleNavClick('transparencia')}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold ${
              currentView === 'transparencia' ? 'bg-slate-100 text-[#0B1E36] font-bold' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            Transparência & LGPD
          </button>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('diario');
                setTimeout(() => onFocusConsulta(), 100);
              }}
              className="w-full py-3 rounded-lg text-sm font-bold bg-[#0B1E36] text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-sky-300" />
              <span>Consultar Placa</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
