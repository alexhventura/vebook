import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

type PopoverPos = { top: number; left: number; width: number };

/**
 * Badge discreto do Índice VEBOOK.
 * O painel abre ao clicar, fica em portal (fora de overflow do layout) e
 * permanece até clique fora, Escape ou “Como calculamos”.
 */
export const OfficeIndexBadge: React.FC<OfficeIndexBadgeProps> = ({
  snapshot,
  variant = 'compact',
  onOpenHowItWorks,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const tipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const line = formatOfficeIndexLine(snapshot);

  const updatePosition = () => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(320, Math.max(240, window.innerWidth - 32));
    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - width - 16);
    }
    setPos({
      top: rect.bottom + 8,
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onReposition = () => updatePosition();

    // capture: evita conflito com overlays; ignora o mesmo gesto que abriu
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointerDown, true);
      document.addEventListener('touchstart', onPointerDown, true);
    }, 0);

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  const panel =
    open && pos
      ? createPortal(
          <div
            ref={panelRef}
            id={tipId}
            role="dialog"
            aria-label={OFFICE_INDEX_EXPLAINER.title}
            className="fixed z-[70] rounded-vebook-lg border border-vebook-mustard/60 bg-vebook-white p-3.5 shadow-[0_12px_32px_rgba(11,30,54,0.2)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
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
                onClick={() => {
                  setOpen(false);
                  onOpenHowItWorks();
                }}
              >
                {OFFICE_INDEX_EXPLAINER.howWeCalculateLabel} →
              </button>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        className="group inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-vebook-sm border border-vebook-mustard/50 bg-vebook-white/95 px-2.5 py-1.5 text-left shadow-sm transition-colors hover:border-vebook-mustard cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? tipId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
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

      {panel}

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
