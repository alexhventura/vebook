import React from 'react';

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'section';
  padding?: 'none' | 'md' | 'lg';
  tone?: 'white' | 'muted' | 'navy';
  /** Elevação no hover (borda mostarda mais intensa + lift). Default: true. */
  interactive?: boolean;
};

const paddingClass = {
  none: '',
  md: 'p-6 sm:p-7',
  lg: 'p-6 sm:p-8 lg:p-10',
} as const;

const toneClass = {
  white: 'bg-vebook-white',
  muted: 'bg-vebook-gray',
  navy: 'bg-vebook-navy text-vebook-white',
} as const;

/**
 * Todo card VEBOOK leva contorno mostarda (assinatura visual).
 */
export const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  padding = 'md',
  tone = 'white',
  interactive = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <Tag
      className={[
        toneClass[tone],
        'border border-vebook-mustard/70 rounded-vebook-md shadow-vebook',
        interactive
          ? 'transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_8px_24px_rgba(196,163,90,0.18)]'
          : '',
        paddingClass[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
};
