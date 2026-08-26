import React, { useEffect, useMemo, useState } from 'react';
import {
  FileCheck2,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Shield,
} from 'lucide-react';
import { Logo } from '../layout/Logo';
import { VEHICLES_MOCK } from '../../data/mockData';
import { CERTIDAO_PRICE } from '../../data/certidaoPricing';
import { formatBRL } from '../../lib/currency';
import { AppView, CertificateHistoryEntry } from '../../types';
import { CertidaoPagamentoModal } from '../modals/CertidaoPagamentoModal';
import { Button } from '../ui/Button';
import { getCertificateHistory, validationLabel } from '../../lib/historyLayers';
import { issueCertificate, type IssuedCertificate } from '../../data/certificateStore';

interface CertidaoViewProps {
  initialPlate?: string;
  onNavigate: (view: AppView) => void;
  onValidateCertificate?: (code: string) => void;
}

function formatDate(iso: string): string {
  const d = iso.includes('T') ? new Date(iso) : new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('pt-BR');
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

function maskCpf(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 5) return 'CPF ***.***.***-**';
  return `CPF ${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
}

function HistoryEntryBlock({ entry }: { entry: CertificateHistoryEntry }) {
  return (
    <article className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white break-inside-avoid">
      <header className="space-y-1 border-b border-slate-100 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-800">{entry.serviceType}</p>
        <p className="text-sm font-extrabold text-[#0B1E36]">
          {entry.workshopName}{' '}
          <span className="font-normal text-slate-500">
            · {entry.workshopCity}/{entry.workshopState}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Data do serviço</p>
          <p className="font-semibold text-[#0B1E36]">{formatDate(entry.serviceDate)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">
            Registro realizado no VEBOOK
          </p>
          <p className="font-semibold text-[#0B1E36]">{formatDateTime(entry.recordedAt)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Quilometragem</p>
          <p className="font-semibold text-[#0B1E36]">{entry.mileageKm.toLocaleString('pt-BR')} km</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">
            Validação do atendimento
          </p>
          <p className="font-semibold text-[#0B1E36]">{validationLabel(entry.validationStatus)}</p>
          {entry.validatedAt ? (
            <p className="text-slate-500">em {formatDateTime(entry.validatedAt)}</p>
          ) : null}
          {entry.validationStatus === 'sem_validacao' || entry.validationStatus === 'aguardando' ? (
            <p className="text-[10px] text-slate-500 pt-1">
              Não validado não significa serviço irregular.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-700">
        <p className="font-bold text-[#0B1E36] text-[11px] uppercase tracking-wide">Dados do serviço</p>
        <p className="leading-relaxed">{entry.description}</p>
        {entry.laborDetails ? (
          <p className="leading-relaxed text-slate-600">
            <strong className="text-slate-800">Mão de obra / procedimentos:</strong> {entry.laborDetails}
          </p>
        ) : null}
        {entry.observations ? (
          <p className="leading-relaxed text-slate-600">
            <strong className="text-slate-800">Observações:</strong> {entry.observations}
          </p>
        ) : null}
        {entry.responsibleName ? (
          <p className="text-slate-600">
            <strong className="text-slate-800">Responsável:</strong> {entry.responsibleName}
          </p>
        ) : null}
      </div>

      {entry.products.length > 0 ? (
        <div className="space-y-2">
          <p className="font-bold text-[#0B1E36] text-[11px] uppercase tracking-wide">
            Produtos e peças
          </p>
          <ul className="space-y-2">
            {entry.products.map((p) => (
              <li
                key={p.id}
                className="text-xs text-slate-700 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <span className="font-semibold text-[#0B1E36]">{p.commercialName}</span>
                <span className="text-slate-500"> · {p.brand}</span>
                {p.specification ? (
                  <span className="block text-slate-500 mt-0.5">{p.specification}</span>
                ) : null}
                <span className="block text-slate-600 mt-0.5">
                  {p.quantity} {p.unit}
                  {p.category ? ` · ${p.category}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
        <p className="font-bold text-[#0B1E36] text-[11px] uppercase tracking-wide">
          Histórico de alterações
        </p>
        {entry.rectifications.length === 0 ? (
          <div className="text-slate-600 space-y-1">
            <p>
              <strong className="text-slate-800">Registro original</strong> — criado em{' '}
              {formatDateTime(entry.recordedAt)}.
            </p>
            <p>
              <strong className="text-slate-800">Retificações:</strong> nenhuma.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            <li className="text-slate-600">
              <strong className="text-slate-800">Registro original</strong> — criado em{' '}
              {formatDateTime(entry.recordedAt)}.
            </li>
            {entry.rectifications.map((r) => (
              <li key={r.id} className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 space-y-0.5">
                <p className="font-semibold text-[#0B1E36]">
                  Retificação registrada — {formatDateTime(r.rectifiedAt)}
                </p>
                <p>Campo alterado: {r.fieldLabel}</p>
                <p>Valor anterior: {r.previousValue}</p>
                <p>Novo valor: {r.newValue}</p>
                {r.note ? <p className="text-slate-500">{r.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
        <p className="font-bold text-[#0B1E36] text-[11px] uppercase tracking-wide">Contestação</p>
        {entry.contestation.exists ? (
          <div className="text-slate-700 space-y-0.5">
            <p>Existe contestação registrada.</p>
            <p>
              Status: <strong>{entry.contestation.statusLabel}</strong>.
            </p>
            {entry.contestation.contestedAt ? (
              <p>Data: {formatDateTime(entry.contestation.contestedAt)}.</p>
            ) : null}
            <p className="text-[10px] text-slate-500 pt-1">
              O conteúdo da comunicação entre cliente e oficina não é exibido neste documento.
            </p>
          </div>
        ) : (
          <p className="text-slate-600">Contestações: nenhuma registrada.</p>
        )}
      </div>
    </article>
  );
}

/**
 * CERTIDÃO VEBOOK — documento pago, formal, com rastreabilidade.
 * Consome CertificateHistoryEntry (não a projeção pública).
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
  const previewHistory = useMemo(() => getCertificateHistory(vehicle.plate), [vehicle.plate]);
  const history = issued?.historyEntries || previewHistory;
  const certificateCode = issued?.validationCode || `VBK-2026-${vehicle.plate}-PREVIEW`;

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
    <div className="bg-[#F8FAFC] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-900 rounded-md border border-sky-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Documento de histórico e rastreabilidade</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1E36] tracking-tight">
            Certidão VEBOOK
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Camada documental do histórico completo disponível e da rastreabilidade de cada registro.
            Distinta da consulta gratuita.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#0B1E36] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-700" />
            Emissão da Certidão
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Solicitante</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">CPF do solicitante</label>
              <input
                type="text"
                value={requesterCpf}
                onChange={(e) => setRequesterCpf(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Valor: <strong className="text-[#0B1E36]">{formatBRL(CERTIDAO_PRICE)}</strong>. O documento
            completo libera após o pagamento.
          </p>
          {!isPaid ? (
            <Button type="button" variant="accent" onClick={() => setPaymentOpen(true)}>
              Pagar e emitir Certidão
            </Button>
          ) : null}
        </div>

        <div className="space-y-4 relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isPaid ? (
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-vebook-mustard" />
                Documento oficial emitido
              </span>
            ) : (
              <span className="text-xs font-bold text-vebook-navy flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-vebook-mustard" />
                Pré-visualização bloqueada
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => isPaid && window.print()}
                disabled={!isPaid}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 inline mr-1" />
                Imprimir
              </button>
              <button
                type="button"
                disabled={!isPaid}
                onClick={() => isPaid && alert('Download do PDF oficial da Certidão VEBOOK (simulação).')}
                className="px-3.5 py-1.5 rounded-lg bg-[#0B1E36] text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 inline mr-1" />
                Baixar PDF
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden">
            {!isPaid ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-vebook-navy/20 backdrop-blur-[1.5px]">
                <div className="mx-4 max-w-sm rounded-vebook-lg border border-vebook-mustard/70 bg-vebook-white/95 px-5 py-4 text-center shadow-lg">
                  <Lock className="mx-auto h-6 w-6 text-vebook-mustard" aria-hidden />
                  <p className="mt-2 text-sm font-bold text-vebook-navy">Certidão bloqueada</p>
                  <p className="mt-1 text-xs text-vebook-muted">
                    Pague {formatBRL(CERTIDAO_PRICE)} para liberar o documento completo.
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

            <div
              className={`bg-white border border-slate-300 shadow-lg ${!isPaid ? 'select-none blur-[2px]' : ''}`}
              aria-hidden={!isPaid}
            >
              <div className="bg-[#0B1E36] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3">
                  <Logo size="md" variant="light" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                      Documento de histórico e rastreabilidade
                    </p>
                    <h2 className="text-2xl font-black tracking-tight">Certidão VEBOOK</h2>
                  </div>
                  <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                    Snapshot documental dos registros disponíveis na plataforma até a emissão. O VEBOOK
                    registra o que aconteceu — não determina o que deverá acontecer.
                  </p>
                </div>
                <div className="shrink-0 space-y-2 text-right">
                  <div className="inline-flex flex-col items-center gap-1 rounded-xl border border-sky-700 bg-sky-950/40 p-3">
                    <QrCode className="w-14 h-14 text-sky-300" aria-hidden />
                    <span className="text-[10px] font-mono text-sky-200">{certificateCode}</span>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-sky-300 underline cursor-pointer"
                    onClick={() => {
                      if (onValidateCertificate) onValidateCertificate(certificateCode);
                      else onNavigate('validar-certidao');
                    }}
                  >
                    Verificar autenticidade
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4">
                  <div>
                    <p className="text-slate-500 font-bold uppercase text-[10px]">Veículo</p>
                    <p className="font-bold text-[#0B1E36] font-mono text-base">{vehicle.plate}</p>
                    <p className="text-slate-700">
                      {vehicle.brand} {vehicle.model} {vehicle.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold uppercase text-[10px]">Emissão</p>
                    <p className="text-slate-800">
                      {issued ? formatDateTime(issued.issuedAt) : '— após pagamento'}
                    </p>
                    <p className="text-slate-600 mt-1">
                      Solicitante: {requesterName} · {maskCpf(requesterCpf)}
                    </p>
                    <p className="text-slate-600">Código: {certificateCode}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#0B1E36]">
                    Histórico completo e rastreabilidade
                  </h3>
                  {history.map((entry) => (
                    <HistoryEntryBlock key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
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
