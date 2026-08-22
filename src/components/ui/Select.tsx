import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  hint,
  error,
  id,
  className = '',
  children,
  ...props
}) => {
  const selectId = id || props.name;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-[#071A33] ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-300 focus:border-[#0B1E36] focus:ring-2 focus:ring-[#0B1E36]/15'
        } disabled:bg-slate-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${selectId}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
};
