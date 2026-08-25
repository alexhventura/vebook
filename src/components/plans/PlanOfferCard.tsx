import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatBRL } from '../../lib/currency';
import {
  PLAN_INCLUDED_ITEMS,
  PLAN_OFFERS,
  planLabel,
} from '../../data/officePlans';
import { PlanModality } from '../../types';
import { Button } from '../ui/Button';

interface PlanOfferCardProps {
  modality: PlanModality;
  onAction: () => void;
  actionLabel?: string;
  selected?: boolean;
  highlightAnnual?: boolean;
}

export const PlanOfferCard: React.FC<PlanOfferCardProps> = ({
  modality,
  onAction,
  actionLabel = 'Fazer cadastro',
  selected = false,
  highlightAnnual = true,
}) => {
  const [includedOpen, setIncludedOpen] = useState(false);
  const isAnnual = modality === 'annual';
  const firstYear = isAnnual ? PLAN_OFFERS.annual.firstYear : PLAN_OFFERS.monthly.firstYear;
  const renewal = isAnnual ? PLAN_OFFERS.annual.renewal : PLAN_OFFERS.monthly.renewal;
  const period = isAnnual ? 'ano' : 'mês';

  const cardClass = selected
    ? 'border-vebook-mustard bg-vebook-mustard-soft shadow-[0_8px_24px_rgba(196,163,90,0.18)]'
    : isAnnual && highlightAnnual
      ? 'border-vebook-mustard bg-gradient-to-b from-vebook-white to-vebook-mustard-soft shadow-vebook-md'
      : 'border-vebook-mustard/70 bg-vebook-white shadow-vebook';

  return (
    <article
      className={`relative rounded-vebook-lg border p-7 space-y-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)] ${cardClass}`}
    >
      {isAnnual && highlightAnnual ? (
        <span className="absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-vebook-sm bg-vebook-mustard text-vebook-navy-deep text-[10px] font-bold uppercase tracking-wider border border-vebook-mustard-deep/40">
          Maior economia
        </span>
      ) : null}

      <div className={`flex items-center justify-between gap-3 ${isAnnual && highlightAnnual ? 'pt-1' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-vebook-mustard-deep">{planLabel(modality)}</p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-vebook-muted bg-vebook-gray px-2 py-1 rounded-vebook-sm border border-vebook-mustard/40">
          Primeiro ano
        </span>
      </div>

      <div>
        <p className="text-4xl sm:text-5xl font-black text-vebook-navy leading-none">{formatBRL(firstYear)}</p>
        <p className="text-base font-bold text-vebook-muted mt-1">/{period}</p>
      </div>

      {isAnnual ? (
        <p className="text-sm font-semibold text-vebook-navy bg-vebook-mustard-soft border border-vebook-mustard/60 rounded-vebook px-3 py-2">
          Economize {formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setIncludedOpen((value) => !value)}
          className="w-full flex items-center justify-between gap-2 text-left text-sm font-bold text-vebook-mustard-deep cursor-pointer"
        >
          <span>Conheça o que está incluído</span>
          {includedOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
        {includedOpen ? (
          <ul className="mt-3 space-y-1.5 text-sm text-vebook-text">
            {PLAN_INCLUDED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-vebook-mustard shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Button type="button" variant={isAnnual && highlightAnnual ? 'accent' : 'primary'} fullWidth onClick={onAction}>
        {actionLabel}
      </Button>

      <div className="pt-3 border-t border-vebook-mustard/30 space-y-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-vebook-subtle">Após o primeiro ano</p>
        <p className="text-sm text-vebook-muted">
          {formatBRL(renewal)}
          <span className="text-vebook-subtle">/{period}</span>
        </p>
      </div>
    </article>
  );
};
