import React, { useEffect } from 'react';
import { X, Calendar, CalendarDays } from 'lucide-react';
import { PLAN_OFFERS } from '../../data/officePlans';
import { formatBRL } from '../../lib/currency';
import { PlanModality } from '../../types';
import { Button } from '../ui/Button';

interface PlanChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (modality: PlanModality) => void;
}

/**
 * Pop-up de escolha de plano para CTAs de cadastro
 * que não estão atrelados aos banners com valor.
 */
export const PlanChoiceModal: React.FC<PlanChoiceModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-vebook-navy-deep/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-choice-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white shadow-[0_16px_48px_rgba(11,30,54,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-vebook-mustard/35 bg-vebook-navy px-5 py-4 text-vebook-white">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-vebook-mustard">
              Cadastro da oficina
            </p>
            <h2 id="plan-choice-title" className="text-lg font-bold tracking-tight">
              Qual plano deseja escolher?
            </h2>
            <p className="mt-0.5 text-xs text-vebook-blue-muted">
              Selecione a modalidade antes de continuar o cadastro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-vebook-sm p-1.5 text-vebook-blue-muted hover:bg-vebook-navy-mid hover:text-vebook-white cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => onSelect('monthly')}
            className="group w-full text-left rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vebook border border-vebook-mustard/70 bg-vebook-navy text-vebook-mustard">
                <Calendar className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vebook-mustard-deep">
                  Mensal
                </p>
                <p className="mt-1 text-2xl font-bold text-vebook-navy">
                  {formatBRL(PLAN_OFFERS.monthly.firstYear)}
                  <span className="ml-1 text-sm font-semibold text-vebook-muted">/mês</span>
                </p>
                <p className="mt-1 text-xs text-vebook-muted leading-relaxed">
                  Primeiro ano. Depois: {formatBRL(PLAN_OFFERS.monthly.renewal)}/mês.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect('annual')}
            className="group w-full text-left rounded-vebook-lg border border-vebook-mustard bg-vebook-mustard-soft/40 p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-vebook-mustard-deep hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vebook border border-vebook-mustard/70 bg-vebook-navy text-vebook-mustard">
                <CalendarDays className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-vebook-mustard-deep">
                    Anual
                  </p>
                  <span className="inline-flex rounded-vebook-sm bg-vebook-mustard px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vebook-navy-deep">
                    Economia no 1º ano
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold text-vebook-navy">
                  {formatBRL(PLAN_OFFERS.annual.firstYear)}
                  <span className="ml-1 text-sm font-semibold text-vebook-muted">/ano</span>
                </p>
                <p className="mt-1 text-xs text-vebook-muted leading-relaxed">
                  Economia de {formatBRL(PLAN_OFFERS.annual.firstYearSavings)}. Renovação:{' '}
                  {formatBRL(PLAN_OFFERS.annual.renewal)}/ano.
                </p>
              </div>
            </div>
          </button>

          <div className="pt-1 flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
