import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, MinusCircle } from 'lucide-react';
import { ValidationStatus } from '../../types';
import { Badge } from './Badge';

const config: Record<
  ValidationStatus,
  { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string; icon: React.ReactNode }
> = {
  validado: {
    tone: 'success',
    label: 'Validado pelo cliente',
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  },
  aguardando: {
    tone: 'warning',
    label: 'Aguardando validação',
    icon: <Clock className="h-3.5 w-3.5" aria-hidden />,
  },
  contestado: {
    tone: 'danger',
    label: 'Contestado pelo cliente',
    icon: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
  },
  sem_validacao: {
    tone: 'neutral',
    label: 'Sem validação',
    icon: <MinusCircle className="h-3.5 w-3.5" aria-hidden />,
  },
};

export const StatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
  const item = config[status];
  return (
    <Badge tone={item.tone}>
      {item.icon}
      <span>{item.label}</span>
    </Badge>
  );
};
