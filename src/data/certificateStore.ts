/**
 * Emissões de Certidão VEBOOK (snapshot imutável + código de autenticidade).
 * Camada de protótipo — equivalente a persistência futura de certidões.
 */

import type { Certificate, CertificateHistoryEntry } from '../types';
import { CERTIFICATES_MOCK, VEHICLES_MOCK } from './mockData';
import { getCertificateHistory } from '../lib/historyLayers';

type IssuedCertificate = Certificate & {
  historyEntries: CertificateHistoryEntry[];
};

const issued = new Map<string, IssuedCertificate>();

function seedFromMock() {
  if (issued.size > 0) return;
  for (const cert of CERTIFICATES_MOCK) {
    issued.set(cert.validationCode.toUpperCase(), {
      ...cert,
      qrCodeUrl: `#/validar/${cert.validationCode}`,
      historyEntries: getCertificateHistory(cert.vehiclePlate),
    });
  }
}

seedFromMock();

export function buildValidationCode(plate: string): string {
  const suffix = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7);
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `VBK-2026-${suffix}-${rand}`;
}

export function issueCertificate(input: {
  plate: string;
  requesterName: string;
  requesterDocumentMasked: string;
}): IssuedCertificate {
  seedFromMock();
  const vehicle = VEHICLES_MOCK[input.plate] || VEHICLES_MOCK['BRA2E19'];
  const historyEntries = getCertificateHistory(vehicle.plate);
  const code = buildValidationCode(vehicle.plate);
  const issuedAt = new Date().toISOString();
  const dates = historyEntries.map((h) => h.serviceDate).sort();
  const cert: IssuedCertificate = {
    id: `cert-${Date.now()}`,
    validationCode: code,
    qrCodeUrl: `#/validar/${code}`,
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
    servicesSnapshot: [], // snapshot legado — preferir historyEntries
    historyEntries,
  };
  issued.set(code.toUpperCase(), cert);
  return cert;
}

export function findCertificateByCode(code: string): IssuedCertificate | undefined {
  seedFromMock();
  return issued.get(code.trim().toUpperCase());
}

export function listIssuedCertificates(): IssuedCertificate[] {
  seedFromMock();
  return [...issued.values()];
}

export type { IssuedCertificate };
