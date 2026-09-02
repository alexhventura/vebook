import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { AppView } from '../../types';

interface ServiceExplainerLayoutProps {
  eyebrow: string;
  title: string;
  lead: string;
  meaning: string;
  purpose: string;
  howItWorks: string[];
  onBack: () => void;
  searchSlot: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}

/**
 * Layout compartilhado das páginas de consulta/certidão/autenticidade:
 * explicações + barra de busca em evidência.
 */
export const ServiceExplainerLayout: React.FC<ServiceExplainerLayoutProps> = ({
  eyebrow,
  title,
  lead,
  meaning,
  purpose,
  howItWorks,
  onBack,
  searchSlot,
  children,
  aside,
}) => {
  return (
    <div className="bg-vebook-surface min-h-[70vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-vebook-muted hover:text-vebook-navy transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Voltar ao início
        </button>

        <header className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-vebook-mustard-deep">
            {eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-vebook-navy">
            {title}
          </h1>
          <p className="text-base text-vebook-muted leading-relaxed max-w-2xl">{lead}</p>
        </header>

        <div className="rounded-vebook-lg border-2 border-vebook-mustard/70 bg-vebook-white p-4 sm:p-5 shadow-vebook-md">
          {searchSlot}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <article className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-vebook-mustard-deep">
              O que significa
            </h2>
            <p className="text-sm text-vebook-text leading-relaxed">{meaning}</p>
          </article>
          <article className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-vebook-mustard-deep">
              Para que serve
            </h2>
            <p className="text-sm text-vebook-text leading-relaxed">{purpose}</p>
          </article>
          <article className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-vebook-mustard-deep">
              Como funciona
            </h2>
            <ol className="space-y-2">
              {howItWorks.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-vebook-text leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-vebook bg-vebook-navy text-[11px] font-bold text-vebook-mustard">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
          {aside}
        </div>

        {children}
      </div>
    </div>
  );
};
