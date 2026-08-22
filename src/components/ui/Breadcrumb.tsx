import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  to?: string;
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
            {isLast ? (
              <span className="font-semibold text-[#0B1E36]" aria-current="page">
                {item.label}
              </span>
            ) : item.to ? (
              <Link to={item.to} className="hover:text-[#0B1E36] hover:underline">
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className="hover:text-[#0B1E36] hover:underline">
                {item.label}
              </button>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
