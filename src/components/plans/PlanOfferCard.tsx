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

  return (
    <article
      className={`group relative rounded-vebook-lg border p-7 space-y-5 bg-vebook-white shadow-vebook transition-all duration-200 hover:-translate-y-0.5 hover:border-vebook-mustard-deep hover:bg-vebook-mustard-deep hover:shadow-[0_10px_28px_rgba(168,134,63,0.45)] ${
        selected
          ? 'border-vebook-mustard ring-2 ring-vebook-mustard/35'
          : isAnnual && highlightAnnual
            ? 'border-vebook-mustard'
            : 'border-vebook-mustard/70'
      }`}
    >
      {isAnnual && highlightAnnual ? (
        <span className="absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-vebook-sm text-[10px] font-bold uppercase tracking-wider border bg-vebook-mustard text-vebook-navy-deep border-vebook-mustard-deep/40 group-hover:bg-vebook-navy-deep group-hover:text-vebook-mustard group-hover:border-vebook-navy-deep">
          Maior economia
        </span>
      ) : null}

      <div className={`flex items-center justify-between gap-3 ${isAnnual && highlightAnnual ? 'pt-1' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-vebook-mustard-deep group-hover:text-vebook-navy-deep">
          {planLabel(modality)}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-vebook-sm border text-vebook-muted bg-vebook-gray border-vebook-mustard/40 group-hover:text-vebook-navy-deep group-hover:bg-vebook-mustard/35 group-hover:border-vebook-navy-deep/20">
          Primeiro ano
        </span>
      </div>

      <div>
        <p className="text-4xl sm:text-5xl font-black leading-none text-vebook-navy group-hover:text-vebook-navy-deep">
          {formatBRL(firstYear)}
        </p>
        <p className="text-base font-bold mt-1 text-vebook-muted group-hover:text-vebook-navy-deep/75">/{period}</p>
      </div>

      {isAnnual ? (
        <p className="text-sm font-semibold rounded-vebook px-3 py-2 border text-vebook-navy bg-vebook-mustard-soft border-vebook-mustard/60 group-hover:text-vebook-navy-deep group-hover:bg-vebook-navy-deep/10 group-hover:border-vebook-navy-deep/20">
          Economize {formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setIncludedOpen((value) => !value)}
          className="w-full flex items-center justify-between gap-2 text-left text-sm font-bold cursor-pointer text-vebook-mustard-deep group-hover:text-vebook-navy-deep"
        >
          <span>Conheça o que está incluído</span>
          {includedOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
        {includedOpen ? (
          <ul className="mt-3 space-y-1.5 text-sm text-vebook-text group-hover:text-vebook-navy-deep/90">
            {PLAN_INCLUDED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-vebook-mustard group-hover:text-vebook-navy-deep" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Button
        type="button"
        variant={isAnnual && highlightAnnual ? 'accent' : 'primary'}
        fullWidth
        onClick={onAction}
        className="group-hover:!bg-vebook-navy-deep group-hover:!text-vebook-mustard group-hover:!border-vebook-navy-deep"
      >
        {actionLabel}
      </Button>

      <div className="pt-3 border-t border-vebook-mustard/30 space-y-0.5 group-hover:border-vebook-navy-deep/25">
        <p className="text-[11px] font-medium uppercase tracking-wider text-vebook-subtle group-hover:text-vebook-navy-deep/65">
          Após o primeiro ano
        </p>
        <p className="text-sm text-vebook-muted group-hover:text-vebook-navy-deep/75">
          {formatBRL(renewal)}
          <span className="text-vebook-subtle group-hover:text-vebook-navy-deep/65">/{period}</span>
        </p>
      </div>
    </article>
  );
};
