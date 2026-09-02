import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileCheck2, Lock, Printer, Search } from 'lucide-react';
import { VEHICLES_MOCK } from '../../data/mockData';
import { CERTIDAO_PRICE } from '../../data/certidaoPricing';
import { formatBRL } from '../../lib/currency';
import { formatPlate, isValidPlateFormat } from '../../lib/utils';
import { AppView } from '../../types';
import { CertidaoPagamentoModal } from '../modals/CertidaoPagamentoModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getCertificateHistory } from '../../lib/historyLayers';
import {
  issueCertificate,
  type IssuedCertificate,
  buildCertificatePages,
} from '../../data/certificateStore';
import { CertidaoDocumentPages } from '../certidao/CertidaoDocument';
import { paginateCertificateEntries } from '../../lib/certificatePagination';
import { printCertidaoDocument } from '../../lib/printCertidao';
import { ServiceExplainerLayout } from './ServiceExplainerLayout';

interface CertidaoViewProps {
  /** Placa pré-carregada (ex.: vinda da consulta básica). Sem valor, começa só com explicações + busca. */
  initialPlate?: string;
  /** Quando true, já busca a placa e abre o fluxo de pagamento. */
  autoStart?: boolean;
  onNavigate: (view: AppView) => void;
  onValidateCertificate?: (code: string) => void;
}

function maskCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 5) return 'CPF ***.***.***-**';
  return `CPF ${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
}

/**
 * Certidão VEBOOK — página explicativa + busca por placa.
 * Após a busca: pré-visualização embaçada e popup de pagamento.
 */
export const CertidaoView: React.FC<CertidaoViewProps> = ({
  initialPlate,
  autoStart = false,
  onNavigate,
  onValidateCertificate,
}) => {
  const seed = formatPlate(initialPlate || '');
  const [inputPlate, setInputPlate] = useState(seed || '');
  const [queriedPlate, setQueriedPlate] = useState<string | null>(() =>
    autoStart && seed ? seed : null,
  );
  const [plateError, setPlateError] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState('João Carlos da Silva');
  const [requesterCpf, setRequesterCpf] = useState('352.981.450-80');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(() => Boolean(autoStart && seed));
  const [issued, setIssued] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    const clean = formatPlate(initialPlate || '');
    if (autoStart && clean) {
      setInputPlate(clean);
      setQueriedPlate(clean);
      setIsPaid(false);
      setIssued(null);
      setPaymentOpen(true);
    }
  }, [initialPlate, autoStart]);

  useEffect(() => {
    document.body.classList.add('vebook-print-certidao');
    return () => {
      document.body.classList.remove('vebook-print-certidao');
    };
  }, []);

  const vehicle = queriedPlate
    ? VEHICLES_MOCK[queriedPlate] || VEHICLES_MOCK['BRA2E19']
    : undefined;

  const previewCert = useMemo((): IssuedCertificate | null => {
    if (!vehicle) return null;
    const historyEntries = getCertificateHistory(vehicle.plate);
    const authenticityCode = 'VBK-2026-AAAA-BBBB-CCCC';
    return {
      id: 'preview',
      documentNumber: '--------',
      authenticityCode,
      validationCode: authenticityCode,
      trackingCode: authenticityCode,
      integrityHash: 'H--------',
      historyAsOf: new Date().toISOString(),
      vehiclePlate: vehicle.plate,
      vehicleBrand: vehicle.brand,
      vehicleModelName: vehicle.model,
      vehicleColor: vehicle.color,
      vehicleYearFabrication: vehicle.yearFabrication,
      vehicleYearModel: vehicle.yearModel,
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
    () =>
      issued
        ? buildCertificatePages(issued)
        : previewCert
          ? paginateCertificateEntries(previewCert.historyEntries)
          : [],
    [issued, previewCert],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = formatPlate(inputPlate);
    if (!clean || !isValidPlateFormat(clean)) {
      setPlateError('Informe uma placa válida (Mercosul ou tradicional).');
      return;
    }
    setPlateError(null);
    setQueriedPlate(clean);
    setIsPaid(false);
    setIssued(null);
    setPaymentOpen(true);
  };

  const handlePaid = () => {
    if (!vehicle) return;
    const cert = issueCertificate({
      plate: vehicle.plate,
      requesterName,
      requesterDocumentMasked: maskCpf(requesterCpf),
    });
    setIssued(cert);
    setIsPaid(true);
    setPaymentOpen(false);
  };

  const handlePrint = () => {
    if (!isPaid || !issued) return;
    const area = document.querySelector('.cert-print-area');
    if (area) {
      printCertidaoDocument(area);
      return;
    }
    window.print();
  };

  const searchSlot = (
    <form onSubmit={handleSearchSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="certidao-plate-input" className="block text-sm font-bold text-vebook-navy">
          Digite a placa para solicitar a Certidão
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="certidao-plate-input"
            value={inputPlate}
            onChange={(e) => {
              setInputPlate(formatPlate(e.target.value));
              if (plateError) setPlateError(null);
            }}
            placeholder="Ex.: BRA2E19 ou ABC1234"
            maxLength={7}
            autoComplete="off"
            invalid={Boolean(plateError)}
            className="h-14 text-center text-lg font-semibold uppercase tracking-widest"
          />
          <Button type="submit" variant="accent" size="lg" className="sm:self-stretch sm:min-w-[10rem]">
            <Search className="w-4 h-4" aria-hidden />
            Buscar
          </Button>
        </div>
        {plateError ? (
          <p className="text-xs text-vebook-error" role="alert">
            {plateError}
          </p>
        ) : (
          <p className="text-xs text-vebook-muted">
            Após a busca, a Certidão aparece embaçada até a confirmação do pagamento de{' '}
            <strong className="text-vebook-navy">{formatBRL(CERTIDAO_PRICE)}</strong>.
          </p>
        )}
      </div>
    </form>
  );

  return (
    <>
      <ServiceExplainerLayout
        eyebrow="Certidão VEBOOK"
        title="Certidão de Histórico Veicular"
        lead="Documento formal, paginado e autenticável, com o histórico completo do veículo registrado na plataforma."
        meaning="A Certidão VEBOOK é o registro oficial do histórico técnico do veículo: um snapshot congelado na data da emissão, com identificação em todas as páginas e QR Code de autenticidade."
        purpose="Serve para apresentação a terceiros — compra e venda, análise de procedência, arquivo pessoal ou qualquer situação em que a formalidade do documento importe."
        howItWorks={[
          'Informe a placa na barra de busca.',
          'O VEBOOK monta a pré-visualização da Certidão (ainda bloqueada/embaçada).',
          `Confirme o pagamento único de ${formatBRL(CERTIDAO_PRICE)} no popup.`,
          'Após o pagamento, o documento completo é liberado para leitura, impressão e PDF.',
        ]}
        onBack={() => onNavigate('home')}
        searchSlot={searchSlot}
        aside={
          <aside className="rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-mustard-soft/50 p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-vebook-mustard-deep">
              Valor da Certidão
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-vebook-navy">
              {formatBRL(CERTIDAO_PRICE)}
            </p>
            <p className="text-sm text-vebook-muted leading-relaxed">
              Pagamento único por emissão. A consulta básica permanece gratuita; o valor vale apenas
              para o documento formal completo.
            </p>
          </aside>
        }
      >
        {queriedPlate && vehicle && activeCert ? (
          <section className="space-y-6 border-t border-vebook-border pt-8">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 vebook-no-print">
              <h2 className="text-base font-bold text-[#0B1E36] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sky-700" />
                Dados da emissão · {vehicle.plate}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                  Emitida · {issued?.authenticityCode}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 vebook-no-print">
              {isPaid ? (
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-vebook-mustard" />
                  Documento oficial · {pages.length} página{pages.length === 1 ? '' : 's'}
                </span>
              ) : (
                <span className="text-xs font-bold text-vebook-navy flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-vebook-mustard" />
                  Pré-visualização embaçada até o pagamento
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
                  onClick={handlePrint}
                  disabled={!isPaid}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                <button
                  type="button"
                  disabled={!isPaid}
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0B1E36] text-white font-bold text-xs disabled:opacity-40 cursor-pointer inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Gerar PDF
                </button>
              </div>
            </div>

            <div className={`relative ${isPaid ? 'cert-print-area' : 'vebook-no-print'}`}>
              {!isPaid ? (
                <div className="absolute inset-0 z-10 flex items-start justify-center pt-24 bg-[#E8EEF4]/40 backdrop-blur-[1px] vebook-no-print">
                  <div className="mx-4 max-w-sm rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white px-5 py-4 text-center shadow-lg">
                    <Lock className="mx-auto h-6 w-6 text-vebook-mustard" aria-hidden />
                    <p className="mt-2 text-sm font-bold text-vebook-navy">Certidão embaçada</p>
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

              <div className={!isPaid ? 'select-none blur-[2.5px]' : undefined}>
                <CertidaoDocumentPages cert={activeCert} pages={pages} />
              </div>
            </div>

            <div className="flex justify-center vebook-no-print">
              <button
                type="button"
                onClick={() => onNavigate('diario')}
                className="text-sm font-semibold text-slate-600 hover:text-[#0B1E36] underline cursor-pointer"
              >
                Voltar à consulta básica
              </button>
            </div>
          </section>
        ) : null}
      </ServiceExplainerLayout>

      <div className="vebook-no-print">
        <CertidaoPagamentoModal
          open={paymentOpen && !isPaid && Boolean(queriedPlate)}
          plate={vehicle?.plate}
          onClose={() => setPaymentOpen(false)}
          onPaid={handlePaid}
        />
      </div>
    </>
  );
};
