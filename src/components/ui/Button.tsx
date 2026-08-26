import React from 'react';
import type { VebookButtonSize, VebookButtonVariant } from '../../styles/tokens';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: VebookButtonVariant;
  size?: VebookButtonSize;
  fullWidth?: boolean;
};

/**
 * Identidade CTA VEBOOK = mostarda.
 * Primary: fundo marinho + texto/borda mostarda (assinatura).
 * Accent: fundo mostarda sólido.
 * Secondary: superfície clara + contorno/texto mostarda.
 */
const variantClass: Record<VebookButtonVariant, string> = {
  primary:
    'bg-vebook-navy text-vebook-mustard border border-vebook-mustard hover:bg-vebook-mustard hover:text-vebook-navy-deep hover:border-vebook-mustard',
  secondary:
    'bg-vebook-white text-vebook-mustard-deep border border-vebook-mustard hover:bg-vebook-mustard-soft hover:border-vebook-mustard-deep hover:text-vebook-navy',
  ghost:
    'bg-transparent text-vebook-mustard border border-vebook-mustard/50 hover:border-vebook-mustard hover:bg-vebook-mustard/10 hover:text-vebook-mustard',
  accent:
    'bg-vebook-mustard text-vebook-navy-deep border border-vebook-mustard hover:bg-vebook-mustard-deep hover:text-vebook-white hover:border-vebook-mustard-deep',
  inverse:
    'bg-vebook-white text-vebook-mustard-deep border border-vebook-mustard hover:bg-vebook-mustard hover:text-vebook-navy-deep',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40 focus-visible:ring-offset-2',
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
