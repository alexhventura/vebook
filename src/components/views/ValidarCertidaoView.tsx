import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldCheck, XCircle } from 'lucide-react';
import {
  findCertificateByCode,
  parseCertificateLookup,
  buildCertificatePages,
  buildPageIdentity,
} from '../../data/certificateStore';
import { AppView } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ServiceExplainerLayout } from './ServiceExplainerLayout';

interface ValidarCertidaoViewProps {
  initialCode?: string;
  initialPage?: number;
  onNavigate: (view: AppView) => void;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Autenticidade: explicações + busca pelo código da Certidão.
 */
export const ValidarCertidaoView: React.FC<ValidarCertidaoViewProps> = ({
  initialCode = '',
  initialPage,
  onNavigate,
}) => {
  const [code, setCode] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setSubmitted(initialCode);
    }
  }, [initialCode]);

  const lookup = useMemo(
    () => (submitted ? parseCertificateLookup(submitted) : null),
    [submitted],
  );
  const cert = submitted ? findCertificateByCode(submitted) : undefined;
  const pageFromCode = lookup?.pageNumber;
  const pageNumber = pageFromCode || initialPage;

  const pageIdentity =
    cert && pageNumber
      ? buildPageIdentity(cert, pageNumber, buildCertificatePages(cert).length)
      : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(code.trim());
  };

  const searchSlot = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="auth-code-input" className="block text-sm font-bold text-vebook-navy">
          Informe o código da Certidão
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="auth-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VBK-2026-… ou código do QR"
            className="h-14 font-mono text-center sm:text-left"
          />
          <Button type="submit" variant="primary" size="lg" className="sm:self-stretch sm:min-w-[10rem]">
            <Search className="w-4 h-4" aria-hidden />
            Verificar
          </Button>
        </div>
        <p className="text-xs text-vebook-muted">
          Use o código alfanumérico impresso no documento ou obtido pela leitura do QR Code.
        </p>
      </div>
    </form>
  );

  return (
    <ServiceExplainerLayout
      eyebrow="Autenticidade"
      title="Verificar autenticidade da Certidão"
      lead="Confirme se uma Certidão VEBOOK recebida em papel ou PDF é autêntica e corresponde a uma emissão registrada na plataforma."
      meaning="A verificação de autenticidade consulta o código único da Certidão (impresso e no QR Code) e informa se aquele documento foi realmente emitido pelo VEBOOK."
      purpose="Serve para quem recebeu uma Certidão e precisa validar a procedência do documento antes de confiar nas informações — sem reabrir o histórico completo pago."
      howItWorks={[
        'Localize o código de autenticidade na Certidão ou leia o QR Code.',
        'Cole ou digite o código na barra de busca acima.',
        'O VEBOOK confirma se a emissão existe e mostra dados públicos de validação.',
        'Códigos inexistentes ou adulterados não são reconhecidos.',
      ]}
      onBack={() => onNavigate('home')}
      searchSlot={searchSlot}
      aside={
        <aside className="rounded-vebook-lg border border-vebook-border bg-vebook-white p-5 space-y-2">
          <div className="flex items-center gap-2 text-vebook-mustard-deep">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            <h2 className="text-sm font-bold">O que esta página não faz</h2>
          </div>
          <p className="text-sm text-vebook-muted leading-relaxed">
            A autenticação não emite nova Certidão e não substitui a consulta básica pela placa. Ela
            apenas valida um documento já emitido.
          </p>
        </aside>
      }
    >
      {submitted ? (
        <section className="space-y-4 border-t border-vebook-border pt-8" aria-label="Resultado da verificação">
          {cert ? (
            <div className="rounded-vebook-lg border border-emerald-200 bg-emerald-50/60 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0" aria-hidden />
                <div>
                  <p className="text-lg font-extrabold text-vebook-navy">Certidão VEBOOK válida</p>
                  <p className="text-sm text-vebook-muted mt-1">
                    Este código corresponde a uma emissão autenticada na plataforma.
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">
                    Código de autenticidade
                  </dt>
                  <dd className="font-mono font-semibold text-vebook-navy text-sm break-all">
                    {cert.authenticityCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Emitida em</dt>
                  <dd className="text-vebook-navy">{formatDateTime(cert.issuedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Histórico até</dt>
                  <dd className="text-vebook-navy">{formatDateTime(cert.historyAsOf)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Placa</dt>
                  <dd className="font-mono font-semibold text-vebook-navy">{cert.vehiclePlate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Veículo</dt>
                  <dd className="text-vebook-navy text-sm">
                    {cert.vehicleBrand} {cert.vehicleModelName} · {cert.vehicleColor} ·{' '}
                    {cert.vehicleYearFabrication}/{cert.vehicleYearModel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Registros no snapshot</dt>
                  <dd className="text-vebook-navy">{cert.totalServices}</dd>
                </div>
                {pageIdentity ? (
                  <div>
                    <dt className="text-xs font-bold uppercase text-vebook-subtle">Página consultada</dt>
                    <dd className="font-mono font-semibold text-vebook-navy">
                      {pageIdentity.pageNumber}/{pageIdentity.totalPages}
                    </dd>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Solicitante</dt>
                  <dd className="text-vebook-navy">{cert.requesterDocumentMasked}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-vebook-lg border border-rose-200 bg-rose-50/50 p-5 flex items-start gap-3">
              <XCircle className="h-6 w-6 text-rose-700 shrink-0" aria-hidden />
              <div>
                <p className="text-base font-extrabold text-vebook-navy">
                  Certidão não localizada ou inválida.
                </p>
                <p className="text-sm text-vebook-muted mt-1">
                  Confira o código impresso na Certidão ou no QR Code. Identificadores inexistentes
                  ou adulterados não são reconhecidos.
                </p>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </ServiceExplainerLayout>
  );
};
