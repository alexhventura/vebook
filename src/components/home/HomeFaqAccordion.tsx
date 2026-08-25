import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_DATA, FaqItem } from '../../data/governanceData';

/** Subconjunto do FAQ institucional já existente — sem duplicar conteúdo. */
const HOME_FAQ_IDS = [
  'faq-g1',
  'faq-g3',
  'faq-p1',
  'faq-p2',
  'faq-h2',
  'faq-lg3',
  'faq-o1',
  'faq-s1',
  'faq-lg1',
  'faq-c1',
] as const;

function homeFaqItems(): FaqItem[] {
  const byId = new Map(FAQ_DATA.map((item) => [item.id, item]));
  return HOME_FAQ_IDS.map((id) => byId.get(id)).filter((item): item is FaqItem => Boolean(item));
}

export const HomeFaqAccordion: React.FC = () => {
  const items = homeFaqItems();
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-vebook-md border border-vebook-mustard/65 bg-vebook-navy/40 overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:border-vebook-mustard hover:shadow-[0_6px_18px_rgba(196,163,90,0.14)]"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left cursor-pointer"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="text-sm font-semibold text-vebook-white">{item.question}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-vebook-mustard transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {open && (
              <div className="px-4 sm:px-5 pb-4 text-sm text-vebook-blue-muted leading-relaxed border-t border-vebook-mustard/35 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
