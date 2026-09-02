import React from 'react';
import { Check } from 'lucide-react';

export type AttendanceWizardStep = 'veiculo' | 'cliente' | 'servico' | 'produtos' | 'resumo';

export const ATTENDANCE_STEPS: Array<{ id: AttendanceWizardStep; label: string; hint: string }> = [
  { id: 'veiculo', label: 'Veículo', hint: 'Dados do veículo' },
  { id: 'cliente', label: 'Cliente', hint: 'Vínculo com o cliente' },
  { id: 'servico', label: 'Serviço', hint: 'Serviços realizados' },
  { id: 'produtos', label: 'Produtos', hint: 'Peças e itens' },
  { id: 'resumo', label: 'Resumo', hint: 'Conferência final' },
];

interface AttendanceStepperProps {
  current: AttendanceWizardStep;
  completed: Set<AttendanceWizardStep>;
  onNavigate: (step: AttendanceWizardStep) => void;
}

export const AttendanceStepper: React.FC<AttendanceStepperProps> = ({
  current,
  completed,
  onNavigate,
}) => {
  const currentIndex = ATTENDANCE_STEPS.findIndex((step) => step.id === current);
  const progressPercent = Math.round(((currentIndex + 1) / ATTENDANCE_STEPS.length) * 100);

  return (
    <div className="space-y-2 sm:space-y-2.5" aria-label="Progresso do cadastro">
      <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
        <p className="font-semibold text-[#0B1E36]">
          Etapa {currentIndex + 1} de {ATTENDANCE_STEPS.length}
        </p>
        <p className="font-bold text-[#a8863f]">{progressPercent}%</p>
      </div>

      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#c4a35a] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <ol className="grid grid-cols-5 gap-1 sm:flex sm:items-start sm:gap-0">
        {ATTENDANCE_STEPS.map((step, index) => {
          const isCurrent = step.id === current;
          const isDone = completed.has(step.id) && !isCurrent;
          const isFuture = index > currentIndex && !isDone;
          const canNavigate = isDone || isCurrent;

          return (
            <li key={step.id} className="sm:flex sm:flex-1 sm:items-start sm:min-w-0">
              <div className="flex sm:flex-1 sm:flex-col sm:items-center gap-1.5 sm:gap-1 min-w-0">
                <button
                  type="button"
                  disabled={!canNavigate}
                  onClick={() => canNavigate && onNavigate(step.id)}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#0B1E36] text-white ring-2 ring-[#c4a35a]/50 ring-offset-2'
                      : isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                        : 'bg-white text-slate-400 border border-slate-200'
                  } ${canNavigate && !isCurrent ? 'cursor-pointer' : ''} ${!canNavigate ? 'cursor-default' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isDone ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </button>
                <div className="min-w-0 flex-1 sm:text-center sm:px-0.5">
                  <p
                    className={`text-[10px] sm:text-xs font-bold truncate leading-tight ${
                      isCurrent ? 'text-[#0B1E36]' : isDone ? 'text-emerald-800' : isFuture ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="hidden md:block text-[10px] text-slate-500 truncate">{step.hint}</p>
                </div>
              </div>
              {index < ATTENDANCE_STEPS.length - 1 ? (
                <div
                  className={`hidden sm:block h-0.5 w-full max-w-[2rem] mt-3.5 mx-0.5 rounded-full ${
                    index < currentIndex || completed.has(step.id) ? 'bg-[#c4a35a]/70' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
