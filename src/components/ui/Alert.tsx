import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertTone = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const toneClass: Record<AlertTone, string> = {
  info: 'bg-sky-50 border-sky-200 text-sky-950',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
  warning: 'bg-amber-50 border-amber-200 text-amber-950',
  error: 'bg-rose-50 border-rose-200 text-rose-950',
};

const icons: Record<AlertTone, React.ReactNode> = {
  info: <Info className="h-5 w-5 shrink-0" aria-hidden />,
  success: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />,
  error: <XCircle className="h-5 w-5 shrink-0" aria-hidden />,
};

export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, className = '' }) => {
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} className={`flex gap-3 rounded-xl border p-4 ${toneClass[tone]} ${className}`}>
      {icons[tone]}
      <div className="min-w-0 space-y-1 text-sm leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
};
