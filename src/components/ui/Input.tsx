import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={[
          'w-full px-4 py-3 text-base text-vebook-navy bg-vebook-surface',
          'border rounded-vebook transition-colors',
          'placeholder:text-vebook-subtle placeholder:font-normal',
          'focus:outline-none focus:ring-2 focus:ring-vebook-mustard/25 focus:border-vebook-mustard',
          invalid
            ? 'border-vebook-error focus:ring-vebook-error/20 focus:border-vebook-error'
            : 'border-vebook-mustard/55',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
