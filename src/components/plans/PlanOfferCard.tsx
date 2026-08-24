import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatBRL } from '../../lib/currency';
import {
  PLAN_INCLUDED_ITEMS,
  PLAN_OFFERS,
  planLabel,
} from '../../data/officePlans';
import { PlanModality } from '../../types';

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
  actionLabel = 'Cadastrar minha oficina',
  selected = false,
  highlightAnnual = true,
}) => {
  const [includedOpen, setIncludedOpen] = useState(false);
  const isAnnual = modality === 'annual';
  const firstYear = isAnnual ? PLAN_OFFERS.annual.firstYear : PLAN_OFFERS.monthly.firstYear;
  const renewal = isAnnual ? PLAN_OFFERS.annual.renewal : PLAN_OFFERS.monthly.renewal;
  const period = isAnnual ? 'ano' : 'mês';

  const cardClass = selected
    ? 'border-2 border-[#0B1E36] bg-sky-50 ring-2 ring-sky-300/60 shadow-lg'
    : isAnnual && highlightAnnual
      ? 'border-2 border-[#0B1E36]/80 bg-white shadow-md'
      : 'border border-slate-200 bg-white shadow-sm';

  return (
    <article className={`relative rounded-3xl p-7 space-y-5 transition-all ${cardClass}`}>
      {isAnnual && highlightAnnual ? (
        <span className="absolute -top-3 left-6 inline-flex items-center px-3 py-1 rounded-full bg-[#0B1E36] text-white text-[10px] font-bold uppercase tracking-wider">
          Maior economia
        </span>
      ) : null}

      <div className={`flex items-center justify-between gap-3 ${isAnnual && highlightAnnual ? 'pt-1' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-sky-800">{planLabel(modality)}</p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Primeiro ano
        </span>
      </div>

      <div>
        <p className="text-4xl sm:text-5xl font-black text-[#0B1E36] leading-none">{formatBRL(firstYear)}</p>
        <p className="text-base font-bold text-slate-500 mt-1">/{period}</p>
      </div>

      {isAnnual ? (
        <p className="text-sm font-semibold text-[#0B1E36] bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
          Economize {formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => setIncludedOpen((value) => !value)}
          className="w-full flex items-center justify-between gap-2 text-left text-sm font-bold text-sky-900 cursor-pointer"
        >
          <span>Conheça o que está incluído</span>
          {includedOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
        {includedOpen ? (
          <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
            {PLAN_INCLUDED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="w-full py-3.5 rounded-xl bg-[#0B1E36] hover:bg-[#132c4d] text-white font-extrabold text-sm uppercase tracking-wide cursor-pointer transition-colors"
      >
        {actionLabel}
      </button>

      <div className="pt-3 border-t border-slate-100 space-y-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Após o primeiro ano</p>
        <p className="text-sm text-slate-500">
          {formatBRL(renewal)}<span className="text-slate-400">/{period}</span>
        </p>
      </div>
    </article>
  );
};
