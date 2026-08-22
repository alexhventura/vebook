import React, { useState } from 'react';
import { FileCheck2, Printer, Download, Search, User, Clock, QrCode } from 'lucide-react';
import { Logo } from '../layout/Logo';
import { VEHICLES_MOCK, SERVICES_MOCK } from '../../data/mockData';
import { AppView } from '../../types';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { StatusBadge } from '../ui/StatusBadge';
import { Breadcrumb } from '../ui/Breadcrumb';

interface CertidaoViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
}

export const CertidaoView: React.FC<CertidaoViewProps> = ({ initialPlate = 'BRA2E19', onNavigate }) => {
  const [plate, setPlate] = useState<string>(VEHICLES_MOCK[initialPlate] ? initialPlate : 'BRA2E19');
  const [requesterName, setRequesterName] = useState('João Carlos da Silva');
  const [requesterCpf, setRequesterCpf] = useState('352.***.***-80');
  const [isGenerated, setIsGenerated] = useState(true);
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [validationResult, setValidationResult] = useState<'idle' | 'success' | 'error'>('idle');

  const vehicle = VEHICLES_MOCK[plate] || VEHICLES_MOCK['BRA2E19'];
  const services = SERVICES_MOCK[plate] || SERVICES_MOCK['BRA2E19'];
  const emissionDate = new Date().toLocaleDateString('pt-BR');
  const certificateCode = `VBK-2026-${plate}-98412`;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerated(true);
  };

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = validationCodeInput.trim().toUpperCase();
    setValidationResult(clean === certificateCode ? 'success' : 'error');
  };

  return (
    <div className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Breadcrumb
          items={[
            { label: 'VEBOOK', onClick: () => onNavigate('home') },
            { label: 'Consultar veículo', onClick: () => onNavigate('diario') },
            { label: 'Certidão' },
          ]}
        />

        <PageHeader
          title="Certidão de histórico"
          description="Documento emitido pela VEBOOK com o retrato dos registros de manutenção disponíveis até a data e a hora da emissão. Qualquer pessoa pode solicitar. A emissão não comprova propriedade."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <User className="h-5 w-5 text-slate-500" aria-hidden />
            <h2 className="mt-3 font-semibold text-[#0B1E36]">Nominal ao solicitante</h2>
            <p className="mt-1 text-sm text-slate-600">A certidão identifica quem pediu o documento. Não é necessário ser o proprietário.</p>
          </Card>
          <Card>
            <Clock className="h-5 w-5 text-slate-500" aria-hidden />
            <h2 className="mt-3 font-semibold text-[#0B1E36]">Retrato na data da emissão</h2>
            <p className="mt-1 text-sm text-slate-600">Registros, validações e contestações existentes até o momento da emissão.</p>
          </Card>
          <Card>
            <QrCode className="h-5 w-5 text-slate-500" aria-hidden />
            <h2 className="mt-3 font-semibold text-[#0B1E36]">Código de verificação</h2>
            <p className="mt-1 text-sm text-slate-600">O destinatário confere a autenticidade pelo código impresso no documento.</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-lg font-bold text-[#0B1E36]">Emitir certidão</h2>
          <form onSubmit={handleGenerate} className="mt-5 grid gap-4 sm:grid-cols-3">
            <Select
              id="certidao-placa"
              label="Veículo"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            >
              <option value="BRA2E19">BRA2E19 — Toyota Corolla</option>
              <option value="ABC1D23">ABC1D23 — Jeep Compass</option>
              <option value="XYZ9K88">XYZ9K88 — VW T-Cross</option>
            </Select>
            <Input
              id="solicitante-nome"
              label="Nome do solicitante"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              required
            />
            <Input
              id="solicitante-cpf"
              label="Documento do solicitante"
              value={requesterCpf}
              onChange={(e) => setRequesterCpf(e.target.value)}
              required
            />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit">
                <FileCheck2 className="h-4 w-4" aria-hidden />
                Atualizar certidão
              </Button>
            </div>
          </form>
        </Card>

        {isGenerated && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3" data-print-hide>
              <p className="text-sm font-medium text-slate-600">Prévia da certidão</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" aria-hidden />
                  Imprimir
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.alert('O download em PDF estará disponível quando a emissão estiver integrada.')}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Baixar PDF
                </Button>
              </div>
            </div>

            <div className="space-y-8 rounded-2xl border border-slate-300 bg-white p-6 sm:p-10">
              <div className="flex flex-col gap-4 border-b border-[#0B1E36] pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Logo size="md" variant="dark" />
                  <p className="mt-1 text-sm text-slate-500">Certidão de histórico de manutenção</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Código</p>
                  <p className="font-mono font-semibold text-[#0B1E36]">{certificateCode}</p>
                  <p className="text-slate-500">Emitida em {emissionDate}</p>
                </div>
              </div>

              <div className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm md:grid-cols-2">
                <div>
                  <h3 className="font-semibold uppercase tracking-wide text-[#0B1E36]">Solicitante</h3>
                  <p className="mt-2">Nome: <strong>{requesterName}</strong></p>
                  <p>Documento: <strong>{requesterCpf}</strong></p>
                  <p className="mt-2 text-slate-500">A emissão não comprova propriedade do veículo.</p>
                </div>
                <div>
                  <h3 className="font-semibold uppercase tracking-wide text-[#0B1E36]">Veículo</h3>
                  <p className="mt-2 font-mono font-semibold">{vehicle.plate}</p>
                  <p>{vehicle.brand} {vehicle.model} · {vehicle.version}</p>
                  <p>Ano {vehicle.yearFabrication}/{vehicle.yearModel} · {vehicle.chassisMasked}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0B1E36]">Resumo</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 p-3 text-center">
                    <p className="text-sm text-slate-500">Registros</p>
                    <p className="text-xl font-bold text-[#0B1E36]">{vehicle.totalServicesCount}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-sm text-emerald-700">Validados</p>
                    <p className="text-xl font-bold text-emerald-800">{vehicle.validatedServicesCount}</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center">
                    <p className="text-sm text-rose-700">Contestados</p>
                    <p className="text-xl font-bold text-rose-800">{vehicle.contestedServicesCount}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-center">
                    <p className="text-sm text-slate-500">Oficinas</p>
                    <p className="text-xl font-bold text-[#0B1E36]">{vehicle.participatingWorkshopsCount}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0B1E36]">Histórico</h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="p-3 font-semibold">Data / km</th>
                        <th className="p-3 font-semibold">Serviço</th>
                        <th className="p-3 font-semibold">Oficina</th>
                        <th className="p-3 font-semibold">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {services.map((s) => (
                        <tr key={s.id}>
                          <td className="p-3 align-top">
                            <strong className="block">{new Date(s.serviceDate).toLocaleDateString('pt-BR')}</strong>
                            <span className="text-slate-500">{s.mileageKm.toLocaleString('pt-BR')} km</span>
                          </td>
                          <td className="p-3 align-top">
                            <strong className="block">{s.description}</strong>
                            <span className="text-slate-500">{s.serviceType}</span>
                          </td>
                          <td className="p-3 align-top">
                            {s.workshopName}
                            <span className="block text-slate-500">{s.workshopCity} — {s.workshopState}</span>
                          </td>
                          <td className="p-3 align-top">
                            <StatusBadge status={s.validationStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Alert>
                Esta certidão reproduz os registros inseridos por oficinas na VEBOOK até a emissão.
                Não substitui CRLV, não é laudo cautelar e não atesta o estado atual do veículo.
              </Alert>
            </div>
          </div>
        )}

        <Card>
          <h2 className="text-lg font-bold text-[#0B1E36]">Verificar autenticidade</h2>
          <p className="mt-1 text-sm text-slate-600">
            Informe o código impresso na certidão para conferir se o documento corresponde a uma emissão desta plataforma.
          </p>
          <form onSubmit={handleValidateCode} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                id="codigo-certidao"
                label="Código da certidão"
                value={validationCodeInput}
                onChange={(e) => {
                  setValidationCodeInput(e.target.value);
                  setValidationResult('idle');
                }}
                placeholder={certificateCode}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4" aria-hidden />
              Verificar
            </Button>
          </form>
          {validationResult === 'success' && (
            <Alert tone="success" title="Certidão autenticada" className="mt-4">
              Documento correspondente ao veículo {vehicle.brand} {vehicle.model} ({vehicle.plate}).
            </Alert>
          )}
          {validationResult === 'error' && (
            <Alert tone="error" title="Não foi possível validar o código" className="mt-4">
              Confira o código e tente novamente. Use o código da prévia acima para testar esta tela.
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
};
