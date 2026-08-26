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
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=1&data=${data}`}
        alt={`QR Code de verificação — página ${identity.pageNumber}`}
        width={72}
        height={72}
        className="w-16 h-16 border border-white/40 bg-white print:w-[18mm] print:h-[18mm]"
      />
      <span className="text-[7px] font-mono text-vebook-blue-muted leading-none max-w-[4.5rem] text-center break-all">
        {identity.pageId}
      </span>
    </div>
  );
}

function PageHeader({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <header className="cert-page-header px-[14mm] py-2.5 mb-0 flex items-start justify-between gap-3 bg-vebook-navy text-vebook-white border-b border-vebook-mustard/40 print:bg-[#0B1E36] print:text-white">
      <div className="min-w-0 space-y-1">
        <Logo size="sm" variant="light" />
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-vebook-mustard">
          Certidão de Histórico do Veículo
        </p>
        <div className="text-[10px] text-vebook-blue-muted space-y-0.5">
          <p>
            <span className="font-semibold text-vebook-subtle">Placa:</span>{' '}
            <span className="font-mono font-bold text-vebook-white">{identity.vehiclePlate}</span>
          </p>
          <p>
            <span className="font-semibold text-vebook-subtle">Certidão nº:</span>{' '}
            <span className="font-mono font-bold text-vebook-white">{identity.documentNumber}</span>
          </p>
          <p className="truncate">
            <span className="font-semibold text-vebook-subtle">Autenticidade:</span>{' '}
            <span className="font-mono text-[9px] text-vebook-blue-muted">{identity.authenticityCode}</span>
          </p>
        </div>
      </div>
      <div className="text-right text-[9px] text-vebook-blue-muted space-y-1 shrink-0">
        <p className="font-bold text-vebook-white tracking-wide">VEBOOK</p>
        <p className="text-vebook-mustard">
          Página {identity.pageNumber}/{identity.totalPages}
        </p>
        <p className="font-mono text-[8px] text-vebook-subtle">{identity.pageId}</p>
      </div>
    </header>
  );
}

function PageFooter({ identity }: { identity: CertificatePageIdentity }) {
  return (
    <footer className="cert-page-footer mt-auto px-[14mm] py-2.5 flex items-end justify-between gap-3 bg-vebook-navy-deep text-vebook-subtle border-t border-vebook-navy-mid print:bg-[#071527] print:text-[#94a3b8]">
      <div className="min-w-0 text-[8px] space-y-0.5">
        <p className="font-bold text-vebook-mustard">Código de rastreabilidade</p>
        <p className="font-mono break-all text-vebook-blue-muted">{identity.pageTrackingCode}</p>
        <p>
          Emissão: {formatDateTime(identity.issuedAt)} · Integridade: {identity.integrityHash}
        </p>
        <p className="text-vebook-subtle/80">VEBOOK — documento formal de histórico e rastreabilidade</p>
      </div>
      <div className="flex items-end gap-2 shrink-0">
        <p className="text-[10px] font-bold text-vebook-mustard">
          {identity.pageNumber}/{identity.totalPages}
        </p>
        <QrBlock identity={identity} />
      </div>
    </footer>
  );
}

function AttendanceBlock({
  entry,
  attendanceNumber,
}: {
  entry: CertificateHistoryEntry;
  attendanceNumber: number;
}) {
  return (
    <article className="cert-attendance border border-slate-200 rounded-md p-2.5 space-y-2 text-[10px] text-slate-700 break-inside-avoid">
      <header className="flex flex-wrap items-baseline justify-between gap-1 border-b border-slate-100 pb-1">
        <p className="font-extrabold text-[#0B1E36] uppercase tracking-wide text-[11px]">
          Atendimento nº {String(attendanceNumber).padStart(2, '0')}
        </p>
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

function CoverBlock({ cert }: { cert: IssuedCertificate }) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50/80 p-3 space-y-2 text-[10px] mb-3">
      <p className="text-[11px] font-black tracking-tight text-[#0B1E36]">
        CERTIDÃO DE HISTÓRICO DO VEÍCULO
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <p>
          <span className="font-semibold text-slate-500">Placa:</span>{' '}
          <span className="font-mono font-bold">{cert.vehiclePlate}</span>
        </p>
        <p>
          <span className="font-semibold text-slate-500">Número da Certidão:</span>{' '}
          <span className="font-mono font-bold">{cert.documentNumber}</span>
        </p>
        <p className="col-span-2">
          <span className="font-semibold text-slate-500">Veículo:</span> {cert.vehicleModel}
        </p>
        <p className="col-span-2">
          <span className="font-semibold text-slate-500">Código de autenticidade:</span>{' '}
          <span className="font-mono">{cert.authenticityCode}</span>
        </p>
        <p>
          <span className="font-semibold text-slate-500">Data de emissão:</span>{' '}
          {formatDateTime(cert.issuedAt)}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Histórico até:</span>{' '}
          {formatDateTime(cert.historyAsOf)}
        </p>
        <p className="col-span-2 text-slate-600 leading-snug">
          Fotografia documental dos registros disponíveis na plataforma até o momento da emissão. O
          VEBOOK registra o que aconteceu; não determina o que deverá acontecer.
        </p>
      </div>
    </section>
  );
}

function SummaryBlock({ cert }: { cert: IssuedCertificate }) {
  return (
    <section className="rounded-md border border-[#0B1E36]/30 bg-[#0B1E36]/[0.03] p-3 space-y-2 text-[10px]">
      <p className="font-extrabold text-[#0B1E36] uppercase tracking-wide text-[11px]">
        Resumo da rastreabilidade
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <p>Registros: <strong>{cert.totalServices}</strong></p>
        <p>Validações: <strong>{cert.validatedCount}</strong></p>
        <p>Contestações: <strong>{cert.contestedCount}</strong></p>
        <p>Retificações: <strong>{cert.rectificationCount}</strong></p>
        <p className="col-span-2">
          Data de emissão: <strong>{formatDateTime(cert.issuedAt)}</strong>
        </p>
        <p className="col-span-2">
          Código de autenticidade: <strong className="font-mono">{cert.authenticityCode}</strong>
        </p>
        <p className="col-span-2">
          Rastreabilidade: <strong className="font-mono">{cert.trackingCode}</strong>
        </p>
        <p className="col-span-2 text-slate-600">
          Emissão independente — novas atualizações do histórico geram nova Certidão, sem alterar
          este documento.
        </p>
      </div>
    </section>
  );
}

function renderBlock(block: CertificatePageContent, cert: IssuedCertificate) {
  if (block.kind === 'cover') return <CoverBlock key="cover" cert={cert} />;
  if (block.kind === 'summary') return <SummaryBlock key="summary" cert={cert} />;
  return (
    <AttendanceBlock
      key={block.entry.id}
      entry={block.entry}
      attendanceNumber={block.attendanceNumber}
    />
  );
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
            key={identity.pageId}
            className="cert-a4-page bg-white text-slate-800 shadow-lg border border-slate-300 mx-auto flex flex-col"
            data-cert-page={identity.pageNumber}
            data-cert-id={identity.documentNumber}
            data-page-id={identity.pageId}
          >
            <PageHeader identity={identity} />
            <div className="cert-page-body flex-1 space-y-2.5 min-h-0">
              {page.blocks.map((block) => renderBlock(block, cert))}
            </div>
            <PageFooter identity={identity} />
          </section>
        );
      })}
    </div>
  );
}
