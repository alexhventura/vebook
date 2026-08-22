import React from 'react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav aria-label="Trilha de navegação" className="text-sm text-slate-500">
    <ol className="flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-slate-300">
                /
              </span>
            )}
            {isLast || !item.onClick ? (
              <span className={isLast ? 'font-semibold text-[#0B1E36]' : ''} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <button type="button" onClick={item.onClick} className="hover:text-[#0B1E36] hover:underline">
                {item.label}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
