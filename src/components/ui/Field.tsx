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
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-700">
        {label}
        {optional ? <span className="ml-1 font-medium text-slate-400">(opcional)</span> : null}
      </label>
      {children}
      {error ? <p className="text-[11px] font-medium text-rose-700">{error}</p> : null}
      {!error && hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
};

export const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1E36]/20 focus:border-[#0B1E36]';
