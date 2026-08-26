import React from 'react';
import { AppView } from '../../types';
import { Logo } from './Logo';

interface HeaderProps {
  onNavigate: (view: AppView) => void;
}

/**
 * Cabeçalho enxuto: só marca / início.
 * Atalhos de navegação ficam no rodapé, sem duplicar experiências.
 */
export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-vebook-white/95 backdrop-blur-md border-b border-vebook-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 sm:h-[4.5rem]">
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40 rounded-vebook-sm cursor-pointer text-left shrink-0"
            aria-label="VEBOOK Início"
          >
            <Logo size="md" variant="dark" />
          </button>
        </div>
      </div>
    </header>
  );
};
