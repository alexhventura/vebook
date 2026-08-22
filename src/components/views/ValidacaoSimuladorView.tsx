import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, Check, Lock } from 'lucide-react';
import { AppView } from '../../types';
import { PATHS } from '../../lib/paths';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Breadcrumb } from '../ui/Breadcrumb';

interface ValidacaoSimuladorViewProps {
  onNavigate: (view: AppView) => void;
}

export const ValidacaoSimuladorView: React.FC<ValidacaoSimuladorViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'pending' | 'validated' | 'contesting' | 'contested'>('pending');
  const [contestationReason, setContestationReason] = useState('produto_divergente');
  const [contestationComment, setContestationComment] = useState(
    'A oficina registrou óleo sintético 0W-20, mas o produto aplicado foi outro.'
  );

  const resetSimulation = () => {
    setStep('pending');
    setContestationReason('produto_divergente');
    setContestationComment('A oficina registrou óleo sintético 0W-20, mas o produto aplicado foi outro.');
  };

  return (
    <div className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Breadcrumb
          items={[
            { label: 'VEBOOK', to: PATHS.home },
            { label: 'Como funciona', to: PATHS.comoFunciona },
            { label: 'Validar registro' },
          ]}
        />

        <PageHeader
          title="Validar registro"
          description="Esta é a tela que o cliente usa para conferir um serviço lançado pela oficina. Os dados abaixo são de exemplo."
        />

        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-[#0B1E36] px-5 py-4 text-white">
            <p className="text-sm font-semibold">Registro para conferência</p>
            <p className="text-sm text-slate-300">OS 8941</p>
          </div>

          <div className="space-y-5 p-5">
            {step === 'pending' && (
              <Alert>Confira os dados do serviço. Você pode validar ou apontar divergência.</Alert>
            )}
            {step === 'validated' && (
              <Alert tone="success" title="Registro validado">
                O serviço passou a constar no histórico do Corolla (BRA2E19) como validado pelo cliente.
              </Alert>
            )}
            {step === 'contested' && (
              <Alert tone="warning" title="Contestação registrada">
                Sua manifestação foi anexada ao registro original. Os dois permanecem visíveis no histórico.
              </Alert>
            )}

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <p className="text-slate-500">Veículo</p>
                  <p className="font-semibold text-[#0B1E36]">Toyota Corolla XEi 2.0</p>
                </div>
                <span className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm">BRA2E19</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-500">Oficina</p>
                  <p className="font-semibold text-[#0B1E36]">AutoCenter Paulista</p>
                </div>
                <div>
                  <p className="text-slate-500">Quilometragem</p>
                  <p className="font-semibold text-[#0B1E36]">48.320 km</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500">Serviço</p>
                <p className="font-semibold text-[#0B1E36]">Troca de óleo e filtros</p>
                <p className="mt-1 text-slate-600">4,2 L óleo 0W-20 · filtro Mann-Filter W 68/3</p>
              </div>
            </div>

            {step === 'pending' && (
              <div className="space-y-2">
                <Button fullWidth onClick={() => setStep('validated')}>
                  <Check className="h-4 w-4" aria-hidden />
                  Validar registro
                </Button>
                <Button fullWidth variant="secondary" onClick={() => setStep('contesting')}>
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  Contestar registro
                </Button>
              </div>
            )}

            {step === 'contesting' && (
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <Select
                  id="motivo-contestacao"
                  label="Tipo de divergência"
                  value={contestationReason}
                  onChange={(e) => setContestationReason(e.target.value)}
                >
                  <option value="produto_divergente">Produto divergente do aplicado</option>
                  <option value="quantidade_incorreta">Quantidade incorreta</option>
                  <option value="km_incorreta">Quilometragem incorreta</option>
                  <option value="servico_nao_realizado">Serviço não realizado</option>
                </Select>
                <div className="space-y-1.5">
                  <label htmlFor="comentario-contestacao" className="block text-sm font-semibold text-slate-800">
                    Descrição
                  </label>
                  <textarea
                    id="comentario-contestacao"
                    rows={3}
                    value={contestationComment}
                    onChange={(e) => setContestationComment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep('pending')}>
                    Voltar
                  </Button>
                  <Button className="flex-[2]" variant="danger" onClick={() => setStep('contested')}>
                    Registrar contestação
                  </Button>
                </div>
              </div>
            )}

            {(step === 'validated' || step === 'contested') && (
              <Button fullWidth variant="tertiary" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Recomeçar
              </Button>
            )}

            <p className="flex items-center justify-center gap-1 text-center text-xs text-slate-500">
              <Lock className="h-3 w-3" aria-hidden />
              Identidade apresentada de forma mascarada (ex.: J* S***).
            </p>
          </div>
        </div>

        <Card>
          <h2 className="font-semibold text-[#0B1E36]">Por que o cliente confere</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Sem validação, o histórico ficaria só com a versão da oficina. Com a conferência do cliente,
            o registro ganha uma situação explícita: validado, aguardando, contestado ou sem validação.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => onNavigate('diario')}>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Ver no histórico
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
