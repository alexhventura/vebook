import React from 'react';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Carregando informações...',
}) => (
  <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
    <div
      className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0B1E36]"
      aria-hidden
    />
    <p className="text-sm font-medium text-slate-700">{label}</p>
  </div>
);
