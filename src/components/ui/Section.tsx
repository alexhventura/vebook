import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: 'default' | 'muted' | 'navy';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  id,
  tone = 'default',
}) => {
  const toneClass =
    tone === 'navy'
      ? 'bg-[#0B1E36] text-white'
      : tone === 'muted'
        ? 'bg-slate-50'
        : 'bg-transparent';

  return (
    <section id={id} className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${toneClass} ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
};

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
}) => (
  <div className={`max-w-2xl space-y-3 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
    {eyebrow && (
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">{eyebrow}</p>
    )}
    <h2 className="text-2xl font-bold tracking-tight text-[#0B1E36] sm:text-3xl">{title}</h2>
    {description && <p className="text-base text-slate-600 leading-relaxed">{description}</p>}
  </div>
);
