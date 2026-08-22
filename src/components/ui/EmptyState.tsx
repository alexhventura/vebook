import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200">
      {icon ?? <FileText className="h-6 w-6" aria-hidden />}
    </div>
    <h2 className="text-base font-semibold text-[#0B1E36]">{title}</h2>
    {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
