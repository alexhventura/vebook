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
          'focus:outline-none focus:ring-2 focus:ring-vebook-blue/30 focus:border-vebook-navy',
          invalid
            ? 'border-vebook-error focus:ring-vebook-error/20 focus:border-vebook-error'
            : 'border-vebook-border',
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
