import React from 'react';
import { Check } from 'lucide-react';
import { AppView } from '../../types';
import { WORKSHOPS_MOCK } from '../../data/mockData';
import { PATHS } from '../../lib/paths';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Breadcrumb } from '../ui/Breadcrumb';

interface ParaOficinasViewProps {
  onNavigate: (view: AppView) => void;
  onOpenCredenciamentoModal: () => void;
  onOpenJaCredenciadoModal: () => void;
}

export const ParaOficinasView: React.FC<ParaOficinasViewProps> = ({
  onNavigate,
  onOpenCredenciamentoModal,
  onOpenJaCredenciadoModal,
}) => {
  const workshop = WORKSHOPS_MOCK[0];

  return (
    <div className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        <Breadcrumb
          items={[
            { label: 'VEBOOK', to: PATHS.home },
            { label: 'Para oficinas' },
          ]}
        />

        <PageHeader
          eyebrow="Para oficinas"
          title="Registre o serviço. O cliente acompanha. O histórico fica no veículo."
          description="O VEBOOK organiza o registro de manutenções, o histórico do cliente e a validação do serviço — sem substituir o trabalho da oficina."
          actions={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={onOpenCredenciamentoModal}>Cadastrar oficina</Button>
              <Button variant="secondary" onClick={onOpenJaCredenciadoModal}>Entrar</Button>
            </div>
          }
        />

        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-bold text-[#0B1E36]">Registro de serviços</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Lance data, quilometragem, serviço e produtos aplicados. O registro passa a integrar o histórico do veículo.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-[#0B1E36]">Relacionamento com o cliente</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              O cliente recebe o resumo para validar ou apontar divergência. A situação fica visível no histórico do veículo.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-[#0B1E36]">Histórico profissional</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Cada atendimento fica documentado. A oficina deixa de depender de papel, planilha ou memória do balcão.
            </p>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="text-2xl font-bold text-[#0B1E36]">Como entra no dia a dia</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">1. Identificar o veículo</p>
              <p className="mt-2 text-sm text-slate-600">Informe a placa e a quilometragem. O histórico anterior, quando existir, aparece junto.</p>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">2. Registrar o serviço</p>
              <p className="mt-2 text-sm text-slate-600">Descreva o que foi feito e os produtos aplicados, com marca e quantidade.</p>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">3. Enviar ao cliente</p>
              <p className="mt-2 text-sm text-slate-600">O cliente confere o registro. Validado ou contestado, o histórico permanece.</p>
            </li>
          </ol>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0B1E36]">Página da oficina</h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Oficinas cadastradas podem ter uma página própria com serviços, horário e contato — como a de {workshop.name}.
              </p>
            </div>
            <Button variant="secondary" onClick={() => onNavigate('site-oficina')}>
              Ver página de exemplo
            </Button>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
            {[
              'Endereço, telefone e horário de atendimento em um só lugar',
              'Lista de serviços oferecidos pela oficina',
              'Identificação de oficina cadastrada no VEBOOK',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-2xl bg-[#0B1E36] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-bold">Cadastre sua oficina</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Envie os dados do estabelecimento. O acesso à área da oficina será liberado nas próximas etapas da plataforma.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="inverse" onClick={onOpenCredenciamentoModal}>
              Cadastrar oficina
            </Button>
            <Button variant="onDark" onClick={onOpenJaCredenciadoModal}>
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
