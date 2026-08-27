import React from 'react';
import {
  Search,
  BookOpen,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { AppView } from '../../types';
import { Button } from '../ui';

interface ConsultaVeiculoViewProps {
  onNavigate: (view: AppView) => void;
}

const OPTIONS: Array<{
  view: AppView;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    view: 'diario',
    title: 'Consulta simples',
    description:
      'Consulte o Diário Veicular pela placa e visualize o histórico de manutenções, peças e status de validação.',
    icon: <BookOpen className="w-5 h-5" aria-hidden />,
  },
  {
    view: 'certidao',
    title: 'Certidão',
    description:
      'Emita ou visualize a Certidão VEBOOK de Histórico Veicular, documento nominal com snapshot congelado e QR Code.',
    icon: <FileCheck2 className="w-5 h-5" aria-hidden />,
  },
  {
    view: 'validar-certidao',
    title: 'Pesquisa de autenticidade da certidão',
    description:
      'Verifique se uma Certidão impressa ou em PDF é autêntica, informando o código alfanumérico de emissão.',
    icon: <ShieldCheck className="w-5 h-5" aria-hidden />,
  },
];

export const ConsultaVeiculoView: React.FC<ConsultaVeiculoViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-vebook-surface min-h-[70vh] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vebook-muted hover:text-vebook-navy transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
            <span>Voltar ao início</span>
          </button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-vebook-mustard-deep">
              <Search className="w-4 h-4" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">
                Consulta de veículo
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-vebook-navy">
              Consultar veículo
            </h1>
            <p className="text-base text-vebook-muted leading-relaxed max-w-xl mx-auto">
              Escolha o tipo de consulta. A VEBOOK disponibiliza o Diário Veicular, a emissão de
              Certidão e a verificação pública de autenticidade.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {OPTIONS.map((option) => (
            <button
              key={option.view}
              type="button"
              onClick={() => onNavigate(option.view)}
              className="group w-full text-left rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white p-5 sm:p-6 shadow-vebook transition-all duration-300 hover:-translate-y-0.5 hover:border-vebook-mustard hover:shadow-[0_10px_28px_rgba(196,163,90,0.22)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vebook-mustard/40"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-vebook border border-vebook-mustard/70 bg-vebook-navy text-vebook-mustard flex items-center justify-center shrink-0">
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-vebook-navy tracking-tight group-hover:text-vebook-mustard-deep transition-colors">
                      {option.title}
                    </h2>
                    <ArrowRight
                      className="w-5 h-5 text-vebook-mustard-deep shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                  <p className="text-sm text-vebook-muted leading-relaxed">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onNavigate('home')}>
            Voltar à página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};
