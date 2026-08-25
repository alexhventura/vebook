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
    ? 'border-vebook-mustard-deep bg-vebook-mustard-deep shadow-[0_10px_28px_rgba(168,134,63,0.45)] ring-2 ring-vebook-mustard-deep/40'
    : isAnnual && highlightAnnual
      ? 'border-vebook-mustard bg-gradient-to-b from-vebook-white to-vebook-mustard-soft shadow-vebook-md'
      : 'border-vebook-mustard/70 bg-vebook-white shadow-vebook';

  const labelClass = selected
    ? 'text-vebook-navy-deep'
    : 'text-vebook-mustard-deep';
  const priceClass = selected ? 'text-vebook-navy-deep' : 'text-vebook-navy';
  const periodClass = selected ? 'text-vebook-navy-deep/75' : 'text-vebook-muted';
  const bodyClass = selected ? 'text-vebook-navy-deep/90' : 'text-vebook-text';
  const mutedClass = selected ? 'text-vebook-navy-deep/75' : 'text-vebook-muted';
  const subtleClass = selected ? 'text-vebook-navy-deep/65' : 'text-vebook-subtle';
  const dividerClass = selected ? 'border-vebook-navy-deep/25' : 'border-vebook-mustard/30';

  return (
    <article
      className={`relative rounded-vebook-lg border p-7 space-y-5 transition-all duration-200 hover:-translate-y-0.5 ${
        selected ? '' : 'hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]'
      } ${cardClass}`}
    >
      {isAnnual && highlightAnnual ? (
        <span
          className={`absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-vebook-sm text-[10px] font-bold uppercase tracking-wider border ${
            selected
              ? 'bg-vebook-navy-deep text-vebook-mustard border-vebook-navy-deep'
              : 'bg-vebook-mustard text-vebook-navy-deep border-vebook-mustard-deep/40'
          }`}
        >
          Maior economia
        </span>
      ) : null}

      <div className={`flex items-center justify-between gap-3 ${isAnnual && highlightAnnual ? 'pt-1' : ''}`}>
        <p className={`text-xs font-bold uppercase tracking-wider ${labelClass}`}>{planLabel(modality)}</p>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-vebook-sm border ${
            selected
              ? 'text-vebook-navy-deep bg-vebook-mustard/40 border-vebook-navy-deep/20'
              : 'text-vebook-muted bg-vebook-gray border-vebook-mustard/40'
          }`}
        >
          Primeiro ano
        </span>
      </div>

      <div>
        <p className={`text-4xl sm:text-5xl font-black leading-none ${priceClass}`}>{formatBRL(firstYear)}</p>
        <p className={`text-base font-bold mt-1 ${periodClass}`}>/{period}</p>
      </div>

      {isAnnual ? (
        <p
          className={`text-sm font-semibold rounded-vebook px-3 py-2 border ${
            selected
              ? 'text-vebook-navy-deep bg-vebook-navy-deep/10 border-vebook-navy-deep/20'
              : 'text-vebook-navy bg-vebook-mustard-soft border-vebook-mustard/60'
          }`}
        >
          Economize {formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setIncludedOpen((value) => !value)}
          className={`w-full flex items-center justify-between gap-2 text-left text-sm font-bold cursor-pointer ${labelClass}`}
        >
          <span>Conheça o que está incluído</span>
          {includedOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
        {includedOpen ? (
          <ul className={`mt-3 space-y-1.5 text-sm ${bodyClass}`}>
            {PLAN_INCLUDED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${selected ? 'text-vebook-navy-deep' : 'text-vebook-mustard'}`}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Button
        type="button"
        variant={selected ? 'primary' : isAnnual && highlightAnnual ? 'accent' : 'primary'}
        fullWidth
        onClick={onAction}
        className={
          selected
            ? '!bg-vebook-navy-deep !text-vebook-mustard !border-vebook-navy-deep hover:!bg-vebook-navy hover:!text-vebook-white'
            : undefined
        }
      >
        {actionLabel}
      </Button>

      <div className={`pt-3 border-t space-y-0.5 ${dividerClass}`}>
        <p className={`text-[11px] font-medium uppercase tracking-wider ${subtleClass}`}>Após o primeiro ano</p>
        <p className={`text-sm ${mutedClass}`}>
          {formatBRL(renewal)}
          <span className={subtleClass}>/{period}</span>
        </p>
      </div>
    </article>
  );
};
