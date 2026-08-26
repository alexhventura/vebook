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
 * Verificação pública de autenticidade da Certidão VEBOOK.
 * Exibe apenas dados públicos apropriados — sem PII completa do solicitante.
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

  return (
    <div className="bg-vebook-surface min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 text-vebook-mustard-deep">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Autenticidade</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-vebook-navy">
            Verificar Certidão VEBOOK
          </h1>
          <p className="text-sm text-vebook-muted leading-relaxed">
            Informe o código de autenticidade, o número da Certidão ou o código de página impresso
            no documento / QR Code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VBK-… ou 00001284-01"
            className="font-mono"
          />
          <Button type="submit" variant="primary">
            <Search className="w-4 h-4" aria-hidden />
            Verificar
          </Button>
        </form>

        {submitted ? (
          cert ? (
            <div className="rounded-vebook-lg border border-emerald-200 bg-emerald-50/60 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0" aria-hidden />
                <div>
                  <p className="text-lg font-extrabold text-vebook-navy">Certidão VEBOOK válida</p>
                  <p className="text-sm text-vebook-muted mt-1">
                    Este identificador corresponde a uma emissão autenticada na plataforma.
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Nº da Certidão</dt>
                  <dd className="font-mono font-semibold text-vebook-navy">{cert.documentNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Autenticidade</dt>
                  <dd className="font-mono font-semibold text-vebook-navy text-xs break-all">
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
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Veículo</dt>
                  <dd className="font-mono font-semibold text-vebook-navy">{cert.vehiclePlate}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Modelo</dt>
                  <dd className="text-vebook-navy text-sm">{cert.vehicleModel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Registros no snapshot</dt>
                  <dd className="text-vebook-navy">{cert.totalServices}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Rastreabilidade</dt>
                  <dd className="font-mono text-xs text-vebook-navy break-all">{cert.trackingCode}</dd>
                </div>
                {pageIdentity ? (
                  <>
                    <div>
                      <dt className="text-xs font-bold uppercase text-vebook-subtle">Página</dt>
                      <dd className="font-mono font-semibold text-vebook-navy">
                        {pageIdentity.pageNumber}/{pageIdentity.totalPages}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-vebook-subtle">ID da página</dt>
                      <dd className="font-mono text-xs text-vebook-navy">{pageIdentity.pageId}</dd>
                    </div>
                  </>
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
          )
        ) : null}

        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-sm font-semibold text-vebook-muted hover:text-vebook-navy underline cursor-pointer"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
};
