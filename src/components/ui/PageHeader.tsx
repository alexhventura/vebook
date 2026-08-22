import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
}) => (
  <header className="space-y-4">
    {eyebrow && (
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">{eyebrow}</p>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B1E36] sm:text-4xl">{title}</h1>
        {description && <p className="text-base text-slate-600 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  </header>
);
