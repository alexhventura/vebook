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

function VebookSymbolMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="22" cy="22" r="16.5" stroke="#0B1E36" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M 13.5 21.5 L 20 28.5 L 31.5 13"
        stroke="#0B1E36"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31.5" cy="13" r="1.8" fill="#6B9EC4" />
    </svg>
  );
}

function PageWatermark() {
  return (
    <div
      className="cert-page-watermark pointer-events-none absolute inset-0 flex items-center justify-center z-20"
      aria-hidden
    >
      <VebookSymbolMark className="w-[42%] max-w-[160mm] h-auto opacity-[0.035] print:opacity-[0.04]" />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-slate-800">{children}</strong>;
}

function QrBlock({ identity }: { identity: CertificatePageIdentity }) {
  const data = encodeURIComponent(buildVerifyAbsoluteUrl(identity.verifyPath));
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=1&data=${data}`}
      alt="QR Code de verificação da Certidão VEBOOK"
      width={72}
      height={72}
      className="w-14 h-14 sm:w-16 sm:h-16 border border-white/40 bg-white print:w-[18mm] print:h-[18mm]"
    />
  );
}

function PageHeader({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <header className="cert-page-header px-[12mm] sm:px-[14mm] py-3.5 mb-0 bg-vebook-navy text-vebook-white border-b border-vebook-mustard/40 print:bg-[#0B1E36] print:text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5 text-[10px] sm:text-[11px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-vebook-mustard">
            Certidão de Histórico do Veículo
          </p>
          <p>
            <strong className="font-bold text-vebook-subtle">Placa:</strong>{' '}
            <span className="font-mono font-bold text-vebook-white">{identity.vehiclePlate}</span>
          </p>
          <p>
            <strong className="font-bold text-vebook-subtle">Veículo:</strong>{' '}
            <span className="text-vebook-white">
              {identity.vehicleBrand} {identity.vehicleModelName} · {identity.vehicleColor} ·{' '}
              {identity.vehicleYearLabel}
            </span>
          </p>
          <p>
            <strong className="font-bold text-vebook-mustard">Código de autenticidade:</strong>{' '}
            <span className="font-mono font-bold text-vebook-white tracking-wide">
              {identity.authenticityCode}
            </span>
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center self-center">
          <Logo size="md" variant="light" />
        </div>
      </div>
    </header>
  );
}

function PageFooter({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <footer className="cert-page-footer mt-auto px-[12mm] sm:px-[14mm] py-3 grid grid-cols-3 items-center gap-3 bg-vebook-navy-deep text-vebook-subtle border-t border-vebook-navy-mid print:bg-[#071527] print:text-[#94a3b8]">
      <div className="min-w-0 text-left text-[8px] sm:text-[9px] space-y-1 leading-snug">
        <p>
          <strong className="font-bold text-vebook-mustard">Código de autenticidade</strong>
        </p>
        <p className="font-mono break-all text-vebook-blue-muted">{identity.authenticityCode}</p>
        <p>
          <strong className="font-bold text-vebook-subtle">Emissão:</strong>{' '}
          <span className="text-vebook-blue-muted">{formatDateTime(identity.issuedAt)}</span>
        </p>
      </div>

      <div className="flex items-center justify-center text-center">
        <p className="text-[11px] sm:text-[12px] font-bold text-vebook-mustard tabular-nums">
          Página {identity.pageNumber}/{identity.totalPages}
        </p>
      </div>

      <div className="flex items-center justify-end">
        <QrBlock identity={identity} />
      </div>
    </footer>
  );
}

function AttendanceBlock({ entry }: { entry: CertificateHistoryEntry }) {
  return (
    <article className="cert-attendance flex-1 break-inside-avoid page-break-inside-avoid rounded-md border-2 border-vebook-mustard-deep bg-white p-3 sm:p-3.5 space-y-2.5 text-[10px] sm:text-[11px] text-slate-700">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-vebook-mustard/40 pb-1.5">
        <p className="font-extrabold text-[#0B1E36] tracking-wide text-[11px] sm:text-[12px] font-mono">
          {entry.vehicleAttendanceId}
        </p>
        <p className="font-bold text-sky-900">{entry.serviceType}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
        <p>
          <FieldLabel>Data do serviço:</FieldLabel> {formatDate(entry.serviceDate)}
        </p>
        <p>
          <FieldLabel>Quilometragem:</FieldLabel> {entry.mileageKm.toLocaleString('pt-BR')} km
        </p>
        <p className="sm:col-span-2">
          <FieldLabel>Oficina:</FieldLabel> {entry.workshopName} ({entry.workshopCity}/
          {entry.workshopState})
        </p>
        <p className="sm:col-span-2">
          <FieldLabel>Registro:</FieldLabel> {formatDateTime(entry.recordedAt)}
        </p>
        <p>
          <FieldLabel>Validação:</FieldLabel> {validationLabel(entry.validationStatus)}
          {entry.validatedAt ? ` (${formatDateTime(entry.validatedAt)})` : ''}
        </p>
        <p>
          <FieldLabel>Contestações:</FieldLabel>{' '}
          {entry.contestation.exists
            ? `${entry.contestation.statusLabel}${entry.contestation.contestedAt ? ` · ${formatDateTime(entry.contestation.contestedAt)}` : ''}`
            : 'Nenhuma registrada'}
        </p>
      </div>

      <div>
        <p>
          <FieldLabel>Detalhes:</FieldLabel>
        </p>
        <p className="leading-snug mt-0.5">{entry.description}</p>
        {entry.laborDetails ? (
          <p className="leading-snug mt-1 text-slate-600">{entry.laborDetails}</p>
        ) : null}
        {entry.observations ? (
          <p className="leading-snug mt-1 text-slate-600">
            <FieldLabel>Observações:</FieldLabel> {entry.observations}
          </p>
        ) : null}
        {entry.responsibleName ? (
          <p className="mt-1">
            <FieldLabel>Responsável:</FieldLabel> {entry.responsibleName}
          </p>
        ) : null}
      </div>

      {entry.products.length > 0 ? (
        <div>
          <p>
            <FieldLabel>Produtos e peças:</FieldLabel>
          </p>
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
        <p>
          <FieldLabel>Retificações:</FieldLabel>
        </p>
        {entry.rectifications.length === 0 ? (
          <p className="mt-0.5">Nenhuma registrada.</p>
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
            className="cert-a4-page relative bg-white text-slate-800 shadow-lg border border-slate-300 mx-auto flex flex-col overflow-hidden"
            data-cert-page={identity.pageNumber}
            data-cert-code={identity.authenticityCode}
          >
            <PageWatermark />
            <div className="relative z-10 flex flex-col flex-1 min-h-0">
              <PageHeader identity={identity} />
              <div className="cert-page-body flex-1 flex flex-col gap-3 sm:gap-4 min-h-0 justify-stretch">
                {page.blocks.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">
                    Nenhum atendimento registrado neste snapshot.
                  </p>
                ) : (
                  page.blocks.map((block) => renderBlock(block))
                )}
              </div>
              <PageFooter identity={identity} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
