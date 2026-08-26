import React from 'react';
import type {
  CertificateHistoryEntry,
  CertificatePageIdentity,
} from '../../types';
import type { IssuedCertificate } from '../../data/certificateStore';
import { buildPageIdentity, buildCertificatePages } from '../../data/certificateStore';
import type { CertificateDocumentPage, CertificatePageContent } from '../../lib/certificatePagination';
import { validationLabel } from '../../lib/historyLayers';
import { Logo } from '../layout/Logo';

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

function buildVerifyAbsoluteUrl(verifyPath: string): string {
  if (typeof window === 'undefined') return verifyPath;
  const base = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');
  return `${base}${verifyPath.startsWith('#') ? verifyPath : `#${verifyPath}`}`;
}

function QrBlock({ identity }: { identity: CertificatePageIdentity }) {
  const data = encodeURIComponent(buildVerifyAbsoluteUrl(identity.verifyPath));
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=1&data=${data}`}
      alt="QR Code de verificação da Certidão VEBOOK"
      width={72}
      height={72}
      className="w-16 h-16 border border-white/40 bg-white print:w-[18mm] print:h-[18mm]"
    />
  );
}

function PageHeader({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <header className="cert-page-header px-[14mm] py-3.5 mb-0 bg-vebook-navy text-vebook-white border-b border-vebook-mustard/40 print:bg-[#0B1E36] print:text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <Logo size="sm" variant="light" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-vebook-mustard">
            Certidão de Histórico do Veículo
          </p>
        </div>
        <p className="text-[10px] font-bold tracking-wide text-vebook-white shrink-0">VEBOOK</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1 text-[10px] text-vebook-blue-muted">
        <p>
          <span className="font-semibold text-vebook-subtle">Placa:</span>{' '}
          <span className="font-mono font-bold text-vebook-white text-[11px]">
            {identity.vehiclePlate}
          </span>
        </p>
        <p>
          <span className="font-semibold text-vebook-subtle">Veículo:</span>{' '}
          <span className="text-vebook-white">
            {identity.vehicleBrand} {identity.vehicleModelName} · {identity.vehicleColor} ·{' '}
            {identity.vehicleYearLabel}
          </span>
        </p>
        <p className="pt-0.5">
          <span className="font-semibold text-vebook-mustard">Código de autenticidade:</span>{' '}
          <span className="font-mono font-bold text-vebook-white tracking-wide text-[11px]">
            {identity.authenticityCode}
          </span>
        </p>
      </div>
    </header>
  );
}

function PageFooter({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <footer className="cert-page-footer mt-auto px-[14mm] py-2.5 grid grid-cols-3 items-end gap-2 bg-vebook-navy-deep text-vebook-subtle border-t border-vebook-navy-mid print:bg-[#071527] print:text-[#94a3b8]">
      <div className="min-w-0 text-[8px] space-y-0.5">
        <p className="font-bold text-vebook-mustard">Código de autenticidade</p>
        <p className="font-mono break-all text-vebook-blue-muted text-[9px]">
          {identity.authenticityCode}
        </p>
        <p>
          Emissão: <span className="text-vebook-blue-muted">{formatDateTime(identity.issuedAt)}</span>
        </p>
      </div>

      <div className="flex items-center justify-center self-center">
        <p className="text-[12px] font-bold text-vebook-mustard tabular-nums">
          Página {identity.pageNumber}/{identity.totalPages}
        </p>
      </div>

      <div className="flex justify-end">
        <QrBlock identity={identity} />
      </div>
    </footer>
  );
}

function AttendanceBlock({ entry }: { entry: CertificateHistoryEntry }) {
  return (
    <article className="cert-attendance break-inside-avoid page-break-inside-avoid rounded-md border border-vebook-navy/25 bg-slate-50/60 p-2.5 space-y-2 text-[10px] text-slate-700 shadow-[inset_3px_0_0_0_#0B1E36]">
      <header className="flex flex-wrap items-baseline justify-between gap-1 border-b border-slate-100 pb-1">
        <div className="space-y-0.5">
          <p className="font-extrabold text-[#0B1E36] uppercase tracking-wide text-[11px]">
            Atendimento {entry.vehicleAttendanceId}
          </p>
          <p className="text-[9px] font-mono text-slate-500">
            ID sequencial do veículo · nº {String(entry.vehicleAttendanceSeq).padStart(4, '0')}
          </p>
        </div>
        <p className="font-semibold text-sky-900">{entry.serviceType}</p>
      </header>

      <div className="grid grid-cols-2 gap-1.5">
        <p>
          <span className="font-semibold text-slate-500">Data do serviço:</span>{' '}
          {formatDate(entry.serviceDate)}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Quilometragem:</span>{' '}
          {entry.mileageKm.toLocaleString('pt-BR')} km
        </p>
        <p className="col-span-2">
          <span className="font-semibold text-slate-500">Oficina:</span> {entry.workshopName} —{' '}
          {entry.workshopCity}/{entry.workshopState}
        </p>
        <p className="col-span-2">
          <span className="font-semibold text-slate-500">Registro VEBOOK:</span>{' '}
          {formatDateTime(entry.recordedAt)}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Validação:</span>{' '}
          {validationLabel(entry.validationStatus)}
          {entry.validatedAt ? ` (${formatDateTime(entry.validatedAt)})` : ''}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Contestações:</span>{' '}
          {entry.contestation.exists
            ? `${entry.contestation.statusLabel}${entry.contestation.contestedAt ? ` · ${formatDateTime(entry.contestation.contestedAt)}` : ''}`
            : 'Nenhuma registrada'}
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-500">Detalhes:</p>
        <p className="leading-snug">{entry.description}</p>
        {entry.laborDetails ? (
          <p className="leading-snug mt-1 text-slate-600">{entry.laborDetails}</p>
        ) : null}
        {entry.observations ? (
          <p className="leading-snug mt-1 text-slate-600">
            <span className="font-semibold">Observações:</span> {entry.observations}
          </p>
        ) : null}
        {entry.responsibleName ? (
          <p className="mt-1">
            <span className="font-semibold text-slate-500">Responsável:</span> {entry.responsibleName}
          </p>
        ) : null}
      </div>

      {entry.products.length > 0 ? (
        <div>
          <p className="font-semibold text-slate-500">Produtos e peças:</p>
          <ul className="mt-0.5 space-y-0.5">
            {entry.products.map((p) => (
              <li key={p.id}>
                {p.commercialName} · {p.brand}
                {p.specification ? ` · ${p.specification}` : ''} — {p.quantity} {p.unit}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="font-semibold text-slate-500">Retificações:</p>
        {entry.rectifications.length === 0 ? (
          <p>Nenhuma registrada.</p>
        ) : (
          <ul className="mt-0.5 space-y-1">
            {entry.rectifications.map((r) => (
              <li key={r.id} className="rounded border border-amber-100 bg-amber-50/70 px-1.5 py-1">
                {formatDateTime(r.rectifiedAt)} — {r.fieldLabel}: {r.previousValue} → {r.newValue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function renderBlock(block: CertificatePageContent) {
  return <AttendanceBlock key={block.entry.id} entry={block.entry} />;
}

export function CertidaoDocumentPages({
  cert,
  pages,
}: {
  cert: IssuedCertificate;
  pages?: CertificateDocumentPage[];
}) {
  const docPages = pages || buildCertificatePages(cert);
  const totalPages = docPages.length;

  return (
    <div className="cert-document space-y-6 print:space-y-0">
      {docPages.map((page) => {
        const identity = buildPageIdentity(cert, page.pageNumber, totalPages);
        return (
          <section
            key={`${identity.authenticityCode}-p${identity.pageNumber}`}
            className="cert-a4-page bg-white text-slate-800 shadow-lg border border-slate-300 mx-auto flex flex-col"
            data-cert-page={identity.pageNumber}
            data-cert-code={identity.authenticityCode}
          >
            <PageHeader identity={identity} />
            <div className="cert-page-body flex-1 space-y-2.5 min-h-0">
              {page.blocks.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">
                  Nenhum atendimento registrado neste snapshot.
                </p>
              ) : (
                page.blocks.map((block) => renderBlock(block))
              )}
            </div>
            <PageFooter identity={identity} />
          </section>
        );
      })}
    </div>
  );
}
