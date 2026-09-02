import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { GovernancePillar } from '../../data/governancePillars';
import { Button } from '../ui/Button';

interface GovernancePillarModalProps {
  pillar: GovernancePillar | null;
  onClose: () => void;
  onOpenContato?: () => void;
}

export const GovernancePillarModal: React.FC<GovernancePillarModalProps> = ({
  pillar,
  onClose,
  onOpenContato,
}) => {
  useEffect(() => {
    if (!pillar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pillar, onClose]);

  if (!pillar) return null;

  const Icon = pillar.icon;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-vebook-navy-deep/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="governance-pillar-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white shadow-[0_16px_48px_rgba(11,30,54,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-vebook-mustard/35 bg-vebook-navy px-5 py-4 text-vebook-white">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vebook border border-vebook-mustard/70 text-vebook-mustard">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-vebook-mustard">
                Governança
              </p>
              <h2 id="governance-pillar-title" className="text-lg font-bold tracking-tight">
                {pillar.title}
              </h2>
              <p className="mt-0.5 text-xs text-vebook-blue-muted">{pillar.summary}</p>
            </div>
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
          <p className="text-sm text-vebook-text leading-relaxed">{pillar.lead}</p>
          <ul className="space-y-2.5">
            {pillar.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-vebook-muted leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-vebook-mustard" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            {onOpenContato && (
              <Button
                type="button"
                variant="accent"
                onClick={() => {
                  onClose();
                  onOpenContato();
                }}
              >
                Abrir contato
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
