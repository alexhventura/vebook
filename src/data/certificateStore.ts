/**
 * Emissões de Certidão VEBOOK — documento formal, versionado e rastreável.
 * Cada emissão é uma fotografia imutável do histórico até historyAsOf.
 * Um único código de autenticidade/rastreabilidade por Certidão.
 */

import type { Certificate, CertificateHistoryEntry, CertificatePageIdentity } from '../types';
import { CERTIFICATES_MOCK, VEHICLES_MOCK } from './mockData';
import { getCertificateHistory } from '../lib/historyLayers';
import { paginateCertificateEntries } from '../lib/certificatePagination';

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

function randomToken(bytes = 2): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Código único de autenticidade/rastreabilidade.
 * Ex.: VBK-2026-F05F-4F6C-21AE
 * Substitui os códigos separados de autenticidade e rastreio de página.
 */
export function buildAuthenticityCode(issuedAt = new Date()): string {
  const year = issuedAt.getFullYear();
  return `VBK-${year}-${randomToken(2)}-${randomToken(2)}-${randomToken(2)}`;
}

/** Alias — tracking = autenticidade (código único). */
export function buildTrackingCode(authenticityCode: string): string {
  return authenticityCode;
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

function vehicleFields(plate: string) {
  const vehicle = VEHICLES_MOCK[plate] || VEHICLES_MOCK['BRA2E19'];
  return {
    vehiclePlate: vehicle.plate,
    vehicleBrand: vehicle.brand,
    vehicleModelName: vehicle.model,
    vehicleColor: vehicle.color,
    vehicleYearFabrication: vehicle.yearFabrication,
    vehicleYearModel: vehicle.yearModel,
    vehicleModel: `${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.yearFabrication}/${vehicle.yearModel})`,
  };
}

function seedFromMock() {
  if (issued.size > 0) return;
  for (const cert of CERTIFICATES_MOCK) {
    const documentNumber = cert.documentNumber || '00001284';
    const authenticityCode = cert.authenticityCode || cert.validationCode;
    const trackingCode = authenticityCode;
    const historyEntries = getCertificateHistory(cert.vehiclePlate);
    const historyAsOf = cert.historyAsOf || cert.issuedAt;
    const vf = vehicleFields(cert.vehiclePlate);
    const integrityHash =
      cert.integrityHash ||
      buildIntegrityHash(
        JSON.stringify({
          authenticityCode,
          plate: cert.vehiclePlate,
          historyAsOf,
          entries: historyEntries.map((e) => e.vehicleAttendanceId),
        }),
      );
    const full: IssuedCertificate = {
      ...cert,
      ...vf,
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
  const issuedAt = new Date().toISOString();
  const authenticityCode = buildAuthenticityCode(new Date(issuedAt));
  const trackingCode = buildTrackingCode(authenticityCode);
  const historyAsOf = issuedAt;
  const dates = historyEntries.map((h) => h.serviceDate).sort();
  const vf = vehicleFields(vehicle.plate);
  const integrityHash = buildIntegrityHash(
    JSON.stringify({
      authenticityCode,
      plate: vehicle.plate,
      historyAsOf,
      entries: historyEntries.map((e) => ({
        attendanceId: e.vehicleAttendanceId,
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
    ...vf,
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
  return cert;
}

/** Extrai código e, se presente, página (?p= ou legado). */
export function parseCertificateLookup(code: string): {
  authenticityCode?: string;
  documentNumber?: string;
  pageNumber?: number;
  raw: string;
} {
  const raw = code.trim().toUpperCase();
  // Legado: VB-2026-00001284-P01-8F72
  const pageTrack = raw.match(/^VB-\d{4}-(\d{8})-P(\d{2})-[A-F0-9]+$/i);
  if (pageTrack) {
    return {
      documentNumber: pageTrack[1],
      pageNumber: Number(pageTrack[2]),
      raw,
    };
  }
  // Legado: 00001284-01
  const pageId = raw.match(/^(\d{8})-(\d{2})$/);
  if (pageId) {
    return {
      documentNumber: pageId[1],
      pageNumber: Number(pageId[2]),
      raw,
    };
  }
  // Código único: VBK-2026-F05F-4F6C-21AE (ou formato anterior VBK-F05F-…)
  if (/^VBK-/.test(raw)) {
    return { authenticityCode: raw, raw };
  }
  return { raw };
}

export function findCertificateByCode(code: string): IssuedCertificate | undefined {
  seedFromMock();
  const parsed = parseCertificateLookup(code);
  if (!parsed.raw) return undefined;
  if (parsed.authenticityCode) {
    return issued.get(parsed.authenticityCode);
  }
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
  return {
    authenticityCode: cert.authenticityCode,
    pageNumber,
    totalPages,
    vehiclePlate: cert.vehiclePlate,
    vehicleBrand: cert.vehicleBrand,
    vehicleModelName: cert.vehicleModelName,
    vehicleColor: cert.vehicleColor,
    vehicleYearLabel: `${cert.vehicleYearFabrication}/${cert.vehicleYearModel}`,
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
