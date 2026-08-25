import React from 'react';
import type { VebookButtonSize, VebookButtonVariant } from '../../styles/tokens';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: VebookButtonVariant;
  size?: VebookButtonSize;
  fullWidth?: boolean;
};

const variantClass: Record<VebookButtonVariant, string> = {
  primary:
    'bg-vebook-navy text-vebook-white hover:bg-vebook-navy-mid border border-transparent',
  secondary:
    'bg-vebook-white text-vebook-navy border border-vebook-border hover:bg-vebook-gray hover:border-vebook-border-strong',
  ghost:
    'bg-transparent text-vebook-muted border border-vebook-border-strong/60 hover:border-vebook-subtle hover:text-vebook-white',
  accent:
    'bg-vebook-mustard text-vebook-navy-deep hover:bg-vebook-mustard-deep hover:text-vebook-white border border-transparent',
  inverse:
    'bg-vebook-white text-vebook-navy hover:bg-vebook-gray border border-transparent',
};

const sizeClass: Record<VebookButtonSize, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-vebook font-semibold transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-blue/40 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};
