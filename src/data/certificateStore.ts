/**
 * Emissões de Certidão VEBOOK — documento formal, versionado e rastreável.
 * Cada emissão é uma fotografia imutável do histórico até historyAsOf.
 */

import type { Certificate, CertificateHistoryEntry, CertificatePageIdentity } from '../types';
import { CERTIFICATES_MOCK, VEHICLES_MOCK } from './mockData';
import { getCertificateHistory } from '../lib/historyLayers';
import {
  pageIdFromDocument,
  pageTrackingCode,
  paginateCertificateEntries,
} from '../lib/certificatePagination';

export type IssuedCertificate = Certificate & {
  historyEntries: CertificateHistoryEntry[];
};

const STORAGE_SEQ = 'vebook_cert_seq_v1';
const issued = new Map<string, IssuedCertificate>();
/** Contador em memória — localStorage é complementar (browser). */
let memorySeq: number | null = null;

function readSeq(): number {
  if (memorySeq !== null) return memorySeq;
  try {
    const raw = localStorage.getItem(STORAGE_SEQ);
    const n = raw ? Number(raw) : 1283;
    memorySeq = Number.isFinite(n) && n >= 0 ? n : 1283;
  } catch {
    memorySeq = 1283;
  }
  return memorySeq;
}

function nextDocumentNumber(): string {
  const n = readSeq() + 1;
  memorySeq = n;
  try {
    localStorage.setItem(STORAGE_SEQ, String(n));
  } catch {
    // ambiente sem localStorage (testes Node)
  }
  return String(n).padStart(8, '0');
}

function randomToken(bytes = 4): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Código de autenticidade não previsível (não é só o nº sequencial). */
export function buildAuthenticityCode(): string {
  return `VBK-${randomToken(2)}-${randomToken(2)}-${randomToken(2)}`;
}

export function buildTrackingCode(documentNumber: string, authenticityCode: string): string {
  const short = authenticityCode.replace(/^VBK-/, '').slice(0, 4);
  const year = new Date().getFullYear();
  return `VBK-${short}-${year}-${documentNumber}`;
}

/** Hash simples de integridade do snapshot (protótipo — trocar por HMAC no backend). */
export function buildIntegrityHash(payload: string): string {
  let h = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `H${(h >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

function seedFromMock() {
  if (issued.size > 0) return;
  for (const cert of CERTIFICATES_MOCK) {
    const documentNumber = cert.documentNumber || '00001284';
    const authenticityCode = cert.authenticityCode || cert.validationCode;
    const trackingCode =
      cert.trackingCode || buildTrackingCode(documentNumber, authenticityCode);
    const historyEntries = getCertificateHistory(cert.vehiclePlate);
    const historyAsOf = cert.historyAsOf || cert.issuedAt;
    const integrityHash =
      cert.integrityHash ||
      buildIntegrityHash(
        JSON.stringify({
          documentNumber,
          authenticityCode,
          plate: cert.vehiclePlate,
          historyAsOf,
          entries: historyEntries.map((e) => e.id),
        }),
      );
    const full: IssuedCertificate = {
      ...cert,
      documentNumber,
      authenticityCode,
      validationCode: authenticityCode,
      trackingCode,
      integrityHash,
      historyAsOf,
      qrCodeUrl: `#/validar/${authenticityCode}`,
      rectificationCount:
        cert.rectificationCount ??
        historyEntries.reduce((acc, e) => acc + e.rectifications.length, 0),
      historyEntries,
    };
    issued.set(authenticityCode.toUpperCase(), full);
    issued.set(documentNumber, full);
    issued.set(trackingCode.toUpperCase(), full);
  }
}

seedFromMock();

export function issueCertificate(input: {
  plate: string;
  requesterName: string;
  requesterDocumentMasked: string;
}): IssuedCertificate {
  seedFromMock();
  const vehicle = VEHICLES_MOCK[input.plate] || VEHICLES_MOCK['BRA2E19'];
  const historyEntries = getCertificateHistory(vehicle.plate);
  const documentNumber = nextDocumentNumber();
  const authenticityCode = buildAuthenticityCode();
  const trackingCode = buildTrackingCode(documentNumber, authenticityCode);
  const issuedAt = new Date().toISOString();
  const historyAsOf = issuedAt;
  const dates = historyEntries.map((h) => h.serviceDate).sort();
  const integrityHash = buildIntegrityHash(
    JSON.stringify({
      documentNumber,
      authenticityCode,
      plate: vehicle.plate,
      historyAsOf,
      entries: historyEntries.map((e) => ({
        id: e.id,
        recordedAt: e.recordedAt,
        mileageKm: e.mileageKm,
        validationStatus: e.validationStatus,
      })),
    }),
  );

  const cert: IssuedCertificate = {
    id: `cert-${documentNumber}`,
    documentNumber,
    authenticityCode,
    validationCode: authenticityCode,
    trackingCode,
    integrityHash,
    historyAsOf,
    qrCodeUrl: `#/validar/${authenticityCode}`,
    vehiclePlate: vehicle.plate,
    vehicleModel: `${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.yearFabrication}/${vehicle.yearModel})`,
    requesterName: input.requesterName,
    requesterDocumentMasked: input.requesterDocumentMasked,
    issuedAt,
    historyPeriodStart: dates[0] || vehicle.firstRegisteredDate,
    historyPeriodEnd: dates[dates.length - 1] || issuedAt.slice(0, 10),
    totalServices: historyEntries.length,
    validatedCount: historyEntries.filter((h) => h.validationStatus === 'validado').length,
    contestedCount: historyEntries.filter((h) => h.contestation.exists).length,
    pendingCount: historyEntries.filter((h) => h.validationStatus === 'aguardando').length,
    workshopsCount: new Set(historyEntries.map((h) => h.workshopName)).size,
    rectificationCount: historyEntries.reduce((acc, e) => acc + e.rectifications.length, 0),
    servicesSnapshot: [],
    historyEntries,
  };

  issued.set(authenticityCode.toUpperCase(), cert);
  issued.set(documentNumber, cert);
  issued.set(trackingCode.toUpperCase(), cert);
  return cert;
}

/** Extrai número da Certidão e página de códigos de página / pageId. */
export function parseCertificateLookup(code: string): {
  documentNumber?: string;
  pageNumber?: number;
  raw: string;
} {
  const raw = code.trim().toUpperCase();
  // VB-2026-00001284-P01-8F72
  const pageTrack = raw.match(/^VB-\d{4}-(\d{8})-P(\d{2})-[A-F0-9]+$/i);
  if (pageTrack) {
    return {
      documentNumber: pageTrack[1],
      pageNumber: Number(pageTrack[2]),
      raw,
    };
  }
  // 00001284-01
  const pageId = raw.match(/^(\d{8})-(\d{2})$/);
  if (pageId) {
    return {
      documentNumber: pageId[1],
      pageNumber: Number(pageId[2]),
      raw,
    };
  }
  return { raw };
}

export function findCertificateByCode(code: string): IssuedCertificate | undefined {
  seedFromMock();
  const parsed = parseCertificateLookup(code);
  if (!parsed.raw) return undefined;
  if (parsed.documentNumber) {
    return (
      issued.get(parsed.documentNumber) ||
      [...issued.values()].find((c) => c.documentNumber === parsed.documentNumber)
    );
  }
  return (
    issued.get(parsed.raw) ||
    [...issued.values()].find(
      (c) =>
        c.authenticityCode.toUpperCase() === parsed.raw ||
        c.trackingCode.toUpperCase() === parsed.raw ||
        c.documentNumber === parsed.raw ||
        c.validationCode.toUpperCase() === parsed.raw,
    )
  );
}

export function buildPageIdentity(
  cert: IssuedCertificate,
  pageNumber: number,
  totalPages: number,
): CertificatePageIdentity {
  const authenticityShort = cert.authenticityCode.replace(/^VBK-/, '').slice(0, 4);
  const pageId = pageIdFromDocument(cert.documentNumber, pageNumber);
  const pageTrack = pageTrackingCode(cert.documentNumber, authenticityShort, pageNumber);
  return {
    documentNumber: cert.documentNumber,
    authenticityCode: cert.authenticityCode,
    trackingCode: cert.trackingCode,
    pageTrackingCode: pageTrack,
    pageId,
    pageNumber,
    totalPages,
    vehiclePlate: cert.vehiclePlate,
    issuedAt: cert.issuedAt,
    verifyPath: `#/validar/${encodeURIComponent(cert.authenticityCode)}?p=${pageNumber}`,
    integrityHash: cert.integrityHash,
  };
}

export function buildCertificatePages(cert: IssuedCertificate) {
  return paginateCertificateEntries(cert.historyEntries);
}

export function listIssuedCertificates(): IssuedCertificate[] {
  seedFromMock();
  const seen = new Set<string>();
  const list: IssuedCertificate[] = [];
  for (const c of issued.values()) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    list.push(c);
  }
  return list;
}

/** @deprecated Prefer buildAuthenticityCode */
export function buildValidationCode(plate: string): string {
  void plate;
  return buildAuthenticityCode();
}
