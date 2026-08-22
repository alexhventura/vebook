import React from 'react';
import { Check, CheckCircle2, Clock, AlertTriangle, MinusCircle, X } from 'lucide-react';
import { AppView } from '../../types';
import { PATHS } from '../../lib/paths';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Breadcrumb } from '../ui/Breadcrumb';

interface ComoFuncionaViewProps {
  onNavigate: (view: AppView) => void;
}

export const ComoFuncionaView: React.FC<ComoFuncionaViewProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        <Breadcrumb
          items={[
            { label: 'VEBOOK', to: PATHS.home },
            { label: 'Como funciona' },
          ]}
        />

        <PageHeader
          eyebrow="Como funciona"
          title="Como o histórico é registrado"
          description="A oficina lança o serviço. O cliente confere. A VEBOOK guarda o histórico no veículo — não na pessoa."
        />

        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <p className="text-sm font-semibold text-slate-500">1</p>
            <h2 className="mt-2 text-xl font-bold text-[#0B1E36]">A oficina registra</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Oficinas cadastradas lançam a ordem de serviço com quilometragem, descrição e produtos aplicados.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Produtos identificados por marca</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Quilometragem informada na entrada</li>
            </ul>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-slate-500">2</p>
            <h2 className="mt-2 text-xl font-bold text-[#0B1E36]">O cliente valida</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              O cliente recebe o resumo do registro, confirma os dados ou aponta divergência. A contestação não apaga o registro original.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Confirmação ou contestação</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Identidade do titular protegida</li>
            </ul>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-slate-500">3</p>
            <h2 className="mt-2 text-xl font-bold text-[#0B1E36]">A VEBOOK preserva</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              O histórico fica vinculado ao veículo. Troca de proprietário ou de oficina não apaga os registros já feitos.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Consulta pelo histórico</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Emissão de certidão com código</li>
            </ul>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="text-2xl font-bold text-[#0B1E36]">Situação de cada registro</h2>
          <p className="mt-2 text-sm text-slate-600">
            Cada serviço no histórico aparece com uma situação clara. Discordâncias não são ocultadas.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="h-5 w-5" aria-hidden /> Validado pelo cliente
              </p>
              <p className="mt-2 text-sm text-slate-700">O cliente conferiu e confirmou data, quilometragem, serviço e produtos.</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="flex items-center gap-2 font-semibold text-amber-900">
                <Clock className="h-5 w-5" aria-hidden /> Aguardando validação
              </p>
              <p className="mt-2 text-sm text-slate-700">A oficina registrou o serviço e o cliente ainda não se manifestou.</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="flex items-center gap-2 font-semibold text-rose-900">
                <AlertTriangle className="h-5 w-5" aria-hidden /> Contestado pelo cliente
              </p>
              <p className="mt-2 text-sm text-slate-700">O cliente apontou divergência. O registro original e a contestação ficam visíveis.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 font-semibold text-slate-800">
                <MinusCircle className="h-5 w-5" aria-hidden /> Sem validação
              </p>
              <p className="mt-2 text-sm text-slate-700">O prazo passou sem resposta, ou não havia contato cadastrado. O registro permanece com essa ressalva.</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <h2 className="text-lg font-bold text-[#0B1E36]">O que o VEBOOK é</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Plataforma de histórico de manutenção registrada por oficinas.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Diário vinculado ao veículo, não ao proprietário.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Detalhamento de serviço, quilometragem e produtos aplicados.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Emissão de certidão com código de verificação, quando solicitada.</li>
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-[#0B1E36]">O que o VEBOOK não é</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden /> Não é órgão de trânsito e não consulta SENATRAN ou RENAVAM.</li>
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden /> Não substitui CRLV, DUT ou documento de transferência.</li>
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden /> Não substitui laudo cautelar nem atesta sinistro ou leilão.</li>
              <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden /> Não atribui nota ou ranking ao veículo.</li>
            </ul>
          </Card>
        </div>

        <Card className="bg-[#0B1E36] text-white" padding="lg">
          <h2 className="text-2xl font-bold">Privacidade</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            O objeto do histórico é o veículo. Dados pessoais do titular não aparecem abertos na consulta pública.
            Nomes e documentos, quando necessários, são apresentados de forma mascarada.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="inverse" onClick={() => onNavigate('diario')}>
              Consultar veículo
            </Button>
            <Button variant="onDark" onClick={() => onNavigate('validacao')}>
              Ver validação do cliente
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
