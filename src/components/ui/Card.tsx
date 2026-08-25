import React from 'react';

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'section';
  padding?: 'none' | 'md' | 'lg';
  tone?: 'white' | 'muted';
};

const paddingClass = {
  none: '',
  md: 'p-6 sm:p-7',
  lg: 'p-6 sm:p-8 lg:p-10',
} as const;

const toneClass = {
  white: 'bg-vebook-white',
  muted: 'bg-vebook-gray',
} as const;

export const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  padding = 'md',
  tone = 'white',
  className = '',
  children,
  ...props
}) => {
  return (
    <Tag
      className={[
        toneClass[tone],
        'border border-vebook-border rounded-vebook-md shadow-vebook',
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
