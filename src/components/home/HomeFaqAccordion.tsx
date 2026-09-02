import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_DATA, FaqItem } from '../../data/governanceData';

/** Subconjunto enxuto do FAQ institucional — sem duplicar conteúdo. */
const HOME_FAQ_IDS = [
  'faq-g1',
  'faq-g3',
  'faq-p1',
  'faq-h2',
  'faq-c1',
] as const;

function homeFaqItems(): FaqItem[] {
  const byId = new Map(FAQ_DATA.map((item) => [item.id, item]));
  return HOME_FAQ_IDS.map((id) => byId.get(id)).filter((item): item is FaqItem => Boolean(item));
}

type HomeFaqAccordionProps = {
  /** Inicia tudo fechado (padrão). */
  startClosed?: boolean;
};

export const HomeFaqAccordion: React.FC<HomeFaqAccordionProps> = ({ startClosed = true }) => {
  const items = homeFaqItems();
  const [openId, setOpenId] = useState<string | null>(startClosed ? null : items[0]?.id ?? null);

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-vebook border border-vebook-mustard/55 bg-vebook-navy/35 overflow-hidden transition-colors hover:border-vebook-mustard"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left cursor-pointer"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="text-xs sm:text-sm font-semibold text-vebook-white leading-snug">
                {item.question}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 text-vebook-mustard transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {open && (
              <div className="px-3.5 pb-3 text-xs sm:text-sm text-vebook-blue-muted leading-relaxed border-t border-vebook-mustard/30 pt-2.5">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
