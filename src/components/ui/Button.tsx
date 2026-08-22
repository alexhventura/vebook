import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'inverse' | 'onDark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0B1E36] text-white hover:bg-[#132c4d] disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'bg-white text-[#0B1E36] border border-slate-300 hover:bg-slate-50 disabled:text-slate-400',
  tertiary:
    'bg-slate-100 text-[#0B1E36] hover:bg-slate-200 disabled:text-slate-400',
  danger:
    'bg-rose-700 text-white hover:bg-rose-800 disabled:bg-slate-300',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  inverse:
    'bg-white text-[#0B1E36] hover:bg-slate-100 disabled:bg-slate-300 disabled:text-slate-500',
  onDark:
    'bg-transparent text-white border border-white/30 hover:bg-white/10 disabled:text-slate-400',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-10',
  md: 'px-4 py-2.5 text-sm min-h-11',
  lg: 'px-6 py-3.5 text-base min-h-12',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
};
