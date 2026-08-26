import React, { useEffect, useState } from 'react';
import { CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { findCertificateByCode } from '../../data/certificateStore';
import { AppView } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ValidarCertidaoViewProps {
  initialCode?: string;
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
  onNavigate,
}) => {
  const [code, setCode] = useState(initialCode);
  const [submitted, setSubmitted] = useState(initialCode);
  const cert = submitted ? findCertificateByCode(submitted) : undefined;

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setSubmitted(initialCode);
    }
  }, [initialCode]);

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
            Informe o código de autenticidade impresso no documento ou obtido via QR Code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VBK-2026-…"
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
                    Este código corresponde a uma emissão autenticada na plataforma.
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Código</dt>
                  <dd className="font-mono font-semibold text-vebook-navy">{cert.validationCode}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Emitida em</dt>
                  <dd className="text-vebook-navy">{formatDateTime(cert.issuedAt)}</dd>
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
                  <dt className="text-xs font-bold uppercase text-vebook-subtle">Solicitante</dt>
                  <dd className="text-vebook-navy">{cert.requesterDocumentMasked}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-vebook-lg border border-rose-200 bg-rose-50/50 p-5 text-sm text-vebook-navy">
              Código não encontrado. Confira o número impresso na Certidão ou no QR Code.
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
