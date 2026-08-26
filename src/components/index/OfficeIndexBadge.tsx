import React, { useId, useState } from 'react';
import type { OfficeReputationSnapshot } from '../../types';
import { formatOfficeIndexLine } from '../../lib/officeRegularityIndex';
import { OFFICE_INDEX_EXPLAINER } from '../../data/officeIndexExplainer';

type OfficeIndexBadgeProps = {
  snapshot: OfficeReputationSnapshot;
  /** compact = chip no header; detailed = bloco com agregados */
  variant?: 'compact' | 'detailed';
  onOpenHowItWorks?: () => void;
  className?: string;
};

/**
 * Badge discreto do Índice VEBOOK — confiança institucional, não review/estrelas.
 */
export const OfficeIndexBadge: React.FC<OfficeIndexBadgeProps> = ({
  snapshot,
  variant = 'compact',
  onOpenHowItWorks,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const line = formatOfficeIndexLine(snapshot);

  return (
    <div className={`relative inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        className="group inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-vebook-sm border border-vebook-mustard/50 bg-vebook-white/95 px-2.5 py-1.5 text-left shadow-sm transition-colors hover:border-vebook-mustard cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
        aria-describedby={tipId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="text-[11px] sm:text-xs font-bold tracking-wide text-vebook-navy">
          {line}
        </span>
        {!snapshot.inFormation ? (
          <span className="text-[10px] sm:text-[11px] font-semibold text-vebook-mustard-deep">
            {snapshot.classificationLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={tipId}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-[min(100vw-2rem,20rem)] rounded-vebook-lg border border-vebook-mustard/60 bg-vebook-white p-3.5 shadow-[0_12px_32px_rgba(11,30,54,0.2)]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-vebook-mustard-deep">
            {OFFICE_INDEX_EXPLAINER.title}
          </p>
          <p className="mt-1.5 text-xs text-vebook-text leading-relaxed">
            {OFFICE_INDEX_EXPLAINER.summary}
          </p>
          <p className="mt-2 text-xs text-vebook-muted leading-relaxed">
            {OFFICE_INDEX_EXPLAINER.disclaimer}
          </p>
          {onOpenHowItWorks ? (
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-vebook-mustard-deep underline underline-offset-2 cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onOpenHowItWorks();
              }}
            >
              {OFFICE_INDEX_EXPLAINER.howWeCalculateLabel} →
            </button>
          ) : null}
        </div>
      ) : null}

      {variant === 'detailed' ? (
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-vebook-muted sm:grid-cols-4">
          <div>
            <dt className="font-semibold text-vebook-navy">Atendimentos</dt>
            <dd>{snapshot.totalAttendances.toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt className="font-semibold text-vebook-navy">Validados</dt>
            <dd>
              {snapshot.totalAttendances > 0
                ? `${Math.round((snapshot.validatedAttendances / snapshot.totalAttendances) * 100)}%`
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-vebook-navy">Respostas</dt>
            <dd>
              {snapshot.answeredContestations + snapshot.unansweredContestations > 0
                ? `${Math.round(
                    (snapshot.answeredContestations /
                      (snapshot.answeredContestations + snapshot.unansweredContestations)) *
                      100,
                  )}% no prazo/respondidas`
                : 'Sem pendências'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-vebook-navy">Completude</dt>
            <dd>{Math.round(snapshot.recordCompleteness)}%</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
};
