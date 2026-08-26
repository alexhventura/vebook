import React, { useEffect, useMemo, useState } from 'react';
import { FileCheck2, Download, Printer, CheckCircle2, Lock, Shield } from 'lucide-react';
import { VEHICLES_MOCK } from '../../data/mockData';
import { CERTIDAO_PRICE } from '../../data/certidaoPricing';
import { formatBRL } from '../../lib/currency';
import { AppView } from '../../types';
import { CertidaoPagamentoModal } from '../modals/CertidaoPagamentoModal';
import { Button } from '../ui/Button';
import { getCertificateHistory } from '../../lib/historyLayers';
import {
  issueCertificate,
  type IssuedCertificate,
  buildCertificatePages,
} from '../../data/certificateStore';
import { CertidaoDocumentPages } from '../certidao/CertidaoDocument';
import { paginateCertificateEntries } from '../../lib/certificatePagination';

interface CertidaoViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
  onValidateCertificate?: (code: string) => void;
}

function maskCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 5) return 'CPF ***.***.***-**';
  return `CPF ${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
}

/**
 * CERTIDÃO VEBOOK — documento formal A4 paginado (não timeline web).
 */
export const CertidaoView: React.FC<CertidaoViewProps> = ({
  initialPlate = 'BRA2E19',
  onNavigate,
  onValidateCertificate,
}) => {
  const [plate, setPlate] = useState(initialPlate);
  const [requesterName, setRequesterName] = useState('João Carlos da Silva');
  const [requesterCpf, setRequesterCpf] = useState('352.981.450-80');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const [issued, setIssued] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    setPlate(initialPlate);
    setIsPaid(false);
    setPaymentOpen(true);
    setIssued(null);
  }, [initialPlate]);

  const vehicle = VEHICLES_MOCK[plate] || VEHICLES_MOCK['BRA2E19'];

  const previewCert = useMemo((): IssuedCertificate => {
    const historyEntries = getCertificateHistory(vehicle.plate);
    return {
      id: 'preview',
      documentNumber: '--------',
      authenticityCode: 'VBK-PREVIEW',
      validationCode: 'VBK-PREVIEW',
      trackingCode: 'VBK-PREV-00000000',
      integrityHash: 'H--------',
      historyAsOf: new Date().toISOString(),
      vehiclePlate: vehicle.plate,
      vehicleModel: `${vehicle.brand} ${vehicle.model} ${vehicle.version}`,
      requesterName,
      requesterDocumentMasked: maskCpf(requesterCpf),
      issuedAt: new Date().toISOString(),
      historyPeriodStart: historyEntries[historyEntries.length - 1]?.serviceDate || '',
      historyPeriodEnd: historyEntries[0]?.serviceDate || '',
      totalServices: historyEntries.length,
      validatedCount: historyEntries.filter((h) => h.validationStatus === 'validado').length,
      contestedCount: historyEntries.filter((h) => h.contestation.exists).length,
      pendingCount: historyEntries.filter((h) => h.validationStatus === 'aguardando').length,
      workshopsCount: new Set(historyEntries.map((h) => h.workshopName)).size,
      rectificationCount: historyEntries.reduce((a, e) => a + e.rectifications.length, 0),
      servicesSnapshot: [],
      historyEntries,
    };
  }, [vehicle, requesterName, requesterCpf]);

  const activeCert = issued || previewCert;
  const pages = useMemo(
    () => (issued ? buildCertificatePages(issued) : paginateCertificateEntries(previewCert.historyEntries)),
    [issued, previewCert],
  );

  const handlePaid = () => {
    const cert = issueCertificate({
      plate: vehicle.plate,
      requesterName,
      requesterDocumentMasked: maskCpf(requesterCpf),
    });
    setIssued(cert);
    setIsPaid(true);
    setPaymentOpen(false);
  };

  return (
    <div className="bg-[#E8EEF4] min-h-screen py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6 print:max-w-none print:space-y-0">
        <div className="text-center max-w-3xl mx-auto space-y-3 print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-900 rounded-md border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Documento de histórico e rastreabilidade</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36] tracking-tight">
            Certidão VEBOOK
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Documento formal paginado (A4), com identificação em todas as páginas — distinto da
            consulta gratuita.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:hidden">
          <h2 className="text-base font-bold text-[#0B1E36] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-700" />
            Emissão da Certidão
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Placa</label>
              <select
                value={plate}
                onChange={(e) => {
                  setPlate(e.target.value);
                  setIsPaid(false);
                  setIssued(null);
                  setPaymentOpen(true);
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-[#0B1E36] bg-slate-50 text-sm"
              >
                <option value="BRA2E19">BRA2E19 — Toyota Corolla</option>
                <option value="ABC1D23">ABC1D23 — Jeep Compass</option>
                <option value="XYZ9K88">XYZ9K88 — VW T-Cross</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Solicitante</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">CPF</label>
              <input
                type="text"
                value={requesterCpf}
                onChange={(e) => setRequesterCpf(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Valor: <strong>{formatBRL(CERTIDAO_PRICE)}</strong> · Pré-visualização: {pages.length}{' '}
            página{pages.length === 1 ? '' : 's'} estimada{pages.length === 1 ? '' : 's'}.
          </p>
          {!isPaid ? (
            <Button type="button" variant="accent" onClick={() => setPaymentOpen(true)}>
              Pagar e emitir Certidão
            </Button>
          ) : (
            <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Emitida · nº {issued?.documentNumber} · {issued?.authenticityCode}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          {isPaid ? (
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-vebook-mustard" />
              Documento oficial · {pages.length} página{pages.length === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="text-xs font-bold text-vebook-navy flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-vebook-mustard" />
              Pré-visualização bloqueada até o pagamento
            </span>
          )}
          <div className="flex items-center gap-2">
            {isPaid && issued ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  onValidateCertificate
                    ? onValidateCertificate(issued.authenticityCode)
                    : onNavigate('validar-certidao')
                }
              >
                Verificar autenticidade
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => isPaid && window.print()}
              disabled={!isPaid}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              type="button"
              disabled={!isPaid}
              onClick={() => isPaid && window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-[#0B1E36] text-white font-bold text-xs disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Gerar PDF
            </button>
          </div>
        </div>

        <div className="relative">
          {!isPaid ? (
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-24 bg-[#E8EEF4]/40 backdrop-blur-[1px] print:hidden">
              <div className="mx-4 max-w-sm rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white px-5 py-4 text-center shadow-lg">
                <Lock className="mx-auto h-6 w-6 text-vebook-mustard" aria-hidden />
                <p className="mt-2 text-sm font-bold text-vebook-navy">Certidão bloqueada</p>
                <p className="mt-1 text-xs text-vebook-muted">
                  Pague {formatBRL(CERTIDAO_PRICE)} para liberar o documento paginado.
                </p>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  className="mt-3"
                  onClick={() => setPaymentOpen(true)}
                >
                  Liberar documento
                </Button>
              </div>
            </div>
          ) : null}

          <div className={!isPaid ? 'select-none blur-[1.5px] print:blur-0' : ''}>
            <CertidaoDocumentPages cert={activeCert} pages={pages} />
          </div>
        </div>

        <div className="flex justify-center print:hidden">
          <button
            type="button"
            onClick={() => onNavigate('diario')}
            className="text-sm font-semibold text-slate-600 hover:text-[#0B1E36] underline cursor-pointer"
          >
            Voltar à consulta gratuita
          </button>
        </div>
      </div>

      <CertidaoPagamentoModal
        open={paymentOpen && !isPaid}
        plate={vehicle.plate}
        onClose={() => setPaymentOpen(false)}
        onPaid={handlePaid}
      />
    </div>
  );
};
