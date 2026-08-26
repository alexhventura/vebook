import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { OFFICE_INDEX_EXPLAINER } from '../../data/officeIndexExplainer';
import { OFFICE_INDEX_WEIGHTS } from '../../lib/officeRegularityIndex';

interface OfficeIndexExplainerModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateTransparency?: () => void;
}

export const OfficeIndexExplainerModal: React.FC<OfficeIndexExplainerModalProps> = ({
  open,
  onClose,
  onNavigateTransparency,
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-vebook-navy-deep/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="office-index-explainer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white shadow-[0_16px_48px_rgba(11,30,54,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-vebook-mustard/35 bg-vebook-navy px-5 py-4 text-vebook-white sticky top-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-vebook-mustard">
              Transparência
            </p>
            <h2 id="office-index-explainer-title" className="text-lg font-bold tracking-tight">
              Como funciona o Índice VEBOOK
            </h2>
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

        <div className="space-y-5 px-5 py-6 sm:px-6">
          <p className="text-sm text-vebook-text leading-relaxed">{OFFICE_INDEX_EXPLAINER.summary}</p>
          <p className="text-sm text-vebook-muted leading-relaxed">{OFFICE_INDEX_EXPLAINER.disclaimer}</p>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-vebook-mustard-deep">
              Quatro pilares
            </p>
            <ul className="space-y-3">
              {OFFICE_INDEX_EXPLAINER.pillars.map((p) => {
                const weight =
                  p.id === 'regularidade'
                    ? OFFICE_INDEX_WEIGHTS.regularity
                    : p.id === 'validacao'
                      ? OFFICE_INDEX_WEIGHTS.validation
                      : p.id === 'contestacoes'
                        ? OFFICE_INDEX_WEIGHTS.contestationResponsibility
                        : OFFICE_INDEX_WEIGHTS.completeness;
                return (
                  <li key={p.id} className="rounded-vebook border border-vebook-border bg-vebook-blue-soft/40 p-3">
                    <p className="text-sm font-bold text-vebook-navy">
                      {p.title}{' '}
                      <span className="font-semibold text-vebook-mustard-deep">
                        ({Math.round(weight * 100)}%)
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-vebook-muted leading-relaxed">{p.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="space-y-2">
            {OFFICE_INDEX_EXPLAINER.principles.map((item) => (
              <li key={item} className="flex gap-2.5 text-xs text-vebook-muted leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-vebook-mustard" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end pt-1">
            {onNavigateTransparency ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onClose();
                  onNavigateTransparency();
                }}
              >
                Ver página completa
              </Button>
            ) : null}
            <Button type="button" variant="primary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
