/**
 * Separação estrutural CONSULTA GRATUITA × CERTIDÃO.
 * A API/camada pública só devolve PublicHistoryItem — nunca o ServiceRecord completo.
 */

import type {
  CertificateContestationSummary,
  CertificateHistoryEntry,
  PublicHistoryItem,
  PublicVehicleIdentity,
  ServiceRecord,
  Vehicle,
} from '../types';
import { SERVICES_MOCK, VEHICLES_MOCK } from '../data/mockData';

const PUBLIC_KEYS = [
  'id',
  'serviceDate',
  'serviceType',
  'mileageKm',
  'workshopName',
  'workshopCity',
  'workshopState',
] as const satisfies readonly (keyof PublicHistoryItem)[];

/** Projeta um registro interno para a camada pública (consulta gratuita). */
export function toPublicHistoryItem(record: ServiceRecord): PublicHistoryItem {
  return {
    id: record.id,
    serviceDate: record.serviceDate,
    serviceType: record.serviceType,
    mileageKm: record.mileageKm,
    workshopName: record.workshopName,
    workshopCity: record.workshopCity,
    workshopState: record.workshopState,
  };
}

function contestationSummary(record: ServiceRecord): CertificateContestationSummary {
  const c = record.contestation;
  if (!c) {
    return { exists: false, statusLabel: 'Nenhuma registrada' };
  }
  const status = c.status || 'aberta';
  const statusLabel =
    status === 'respondida' || status === 'encerrada'
      ? 'Respondida'
      : status === 'em_analise'
        ? 'Em análise'
        : 'Aberta';
  return {
    exists: true,
    statusLabel,
    contestedAt: c.contestedAt,
    respondedAt: c.respondedAt,
  };
}

function recordChronologyKey(record: ServiceRecord): string {
  return record.recordedAt || `${record.serviceDate}T12:00:00`;
}

/**
 * ID do atendimento: placa + id da oficina + sequência no veículo.
 * Ex.: BRA2E19-ws-01-0008
 */
export function buildVehicleAttendanceId(
  plate: string,
  workshopId: string,
  seq: number,
): string {
  const platePart = plate.toUpperCase().replace(/\s+/g, '');
  const officePart = (workshopId || 'oficina').trim().toLowerCase();
  return `${platePart}-${officePart}-${String(seq).padStart(4, '0')}`;
}

/** Projeta registro completo para a Certidão (sem PII de cliente / comentários privados). */
export function toCertificateHistoryEntry(
  record: ServiceRecord,
  vehicleAttendanceSeq: number,
): CertificateHistoryEntry {
  const plate = record.vehiclePlate.toUpperCase();
  return {
    id: record.id,
    vehicleAttendanceId: buildVehicleAttendanceId(
      plate,
      record.workshopId,
      vehicleAttendanceSeq,
    ),
    vehicleAttendanceSeq,
    serviceDate: record.serviceDate,
    recordedAt: record.recordedAt || `${record.serviceDate}T12:00:00`,
    mileageKm: record.mileageKm,
    serviceType: record.serviceType,
    description: record.description,
    laborDetails: record.laborDetails,
    observations: record.observations,
    workshopId: record.workshopId,
    workshopName: record.workshopName,
    workshopCity: record.workshopCity,
    workshopState: record.workshopState,
    responsibleName: record.responsibleName,
    products: record.products.map((p) => ({ ...p })),
    validationStatus: record.validationStatus,
    validatedAt: record.validatedAt,
    rectifications: (record.rectifications || []).map((r) => ({ ...r })),
    contestation: contestationSummary(record),
  };
}

export function toPublicVehicleIdentity(vehicle: Vehicle): PublicVehicleIdentity {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    yearFabrication: vehicle.yearFabrication,
    yearModel: vehicle.yearModel,
    color: vehicle.color,
    fuel: vehicle.fuel,
    chassisMasked: vehicle.chassisMasked,
    currentMileageKm: vehicle.currentMileageKm,
  };
}

/** Consulta gratuita: apenas itens públicos, ordenados do mais recente. */
export function getPublicHistory(plate: string): PublicHistoryItem[] {
  const records = SERVICES_MOCK[plate] || [];
  return records
    .map(toPublicHistoryItem)
    .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate));
}

/** Certidão: histórico completo + ID sequencial por veículo (mais antigo → mais recente). */
export function getCertificateHistory(plate: string): CertificateHistoryEntry[] {
  const records = SERVICES_MOCK[plate] || [];
  const chronological = [...records].sort((a, b) =>
    recordChronologyKey(a).localeCompare(recordChronologyKey(b)),
  );
  return chronological.map((r, index) => toCertificateHistoryEntry(r, index + 1));
}

export function getPublicVehicle(plate: string): PublicVehicleIdentity | null {
  const v = VEHICLES_MOCK[plate];
  return v ? toPublicVehicleIdentity(v) : null;
}

/**
 * Garante que um objeto da camada pública não carrega chaves da Certidão.
 * Usado em testes e como barreira defensiva.
 */
export function assertPublicHistoryShape(item: Record<string, unknown>): string[] {
  const forbidden = [
    'products',
    'description',
    'laborDetails',
    'observations',
    'recordedAt',
    'validatedAt',
    'validationStatus',
    'contestation',
    'rectifications',
    'maskedValidatorName',
    'internalOsNumber',
    'responsibleName',
    'workshopId',
    'comment',
    'maskedClientIdentifier',
    'requesterName',
    'cpf',
    'email',
    'phone',
    'vehicleAttendanceId',
    'vehicleAttendanceSeq',
  ];
  return forbidden.filter((key) => key in item);
}

export function publicHistoryKeys(): readonly string[] {
  return PUBLIC_KEYS;
}

export function validationLabel(status: CertificateHistoryEntry['validationStatus']): string {
  switch (status) {
    case 'validado':
      return 'Validado';
    case 'aguardando':
      return 'Em processo';
    case 'contestado':
      return 'Contestado';
    case 'sem_validacao':
      return 'Não validado';
    default:
      return 'Não validado';
  }
}
