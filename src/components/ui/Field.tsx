import React from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, error, optional, children }) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="vebook-label">
        {label}
        {optional ? <span className="ml-1 font-medium text-vebook-subtle">(opcional)</span> : null}
      </label>
      {children}
      {error ? <p className="vebook-error-text">{error}</p> : null}
      {!error && hint ? <p className="vebook-hint">{hint}</p> : null}
    </div>
  );
};

/** Classe canônica de input — preferir o componente `Input` em telas novas. */
export const inputClass = [
  'w-full px-3.5 py-2.5 rounded-vebook border border-vebook-border bg-vebook-white',
  'text-sm text-vebook-text placeholder:text-vebook-subtle',
  'focus:outline-none focus:ring-2 focus:ring-vebook-blue/30 focus:border-vebook-navy',
].join(' ');
