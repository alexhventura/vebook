/**
 * Camada de reputação das oficinas (equivalente conceitual a office_reputation).
 * Calcula via lib centralizada e cacheia o snapshot — não recalcula a cada render.
 */

import type {
  Office,
  OfficeIndexAttendanceFact,
  OfficeIndexContestationFact,
  OfficeReputationSnapshot,
  OfficeSearchSort,
  Workshop,
} from '../types';
import {
  computeOfficeRegularityIndex,
  dueDateFromContestedAt,
} from '../lib/officeRegularityIndex';
import { OFFICE_INDEX_SEED } from './officeIndexExplainer';
import { listPublicOffices, searchPublicOffices } from './officeStore';

type ReputationState = {
  attendancesByOffice: Record<string, OfficeIndexAttendanceFact[]>;
  contestationsByOffice: Record<string, OfficeIndexContestationFact[]>;
  snapshots: Record<string, OfficeReputationSnapshot>;
  version: number;
};

const listeners = new Set<() => void>();

function emptyState(): ReputationState {
  return {
    attendancesByOffice: {},
    contestationsByOffice: {},
    snapshots: {},
    version: 0,
  };
}

let state: ReputationState = emptyState();
let initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

function recalcOffice(officeId: string, asOf = new Date()): OfficeReputationSnapshot {
  const snapshot = computeOfficeRegularityIndex(
    {
      officeId,
      attendances: state.attendancesByOffice[officeId] || [],
      contestations: state.contestationsByOffice[officeId] || [],
    },
    asOf,
  );
  state.snapshots[officeId] = snapshot;
  state.version += 1;
  return snapshot;
}

function ensureSeedFor(officeId: string) {
  if (state.attendancesByOffice[officeId]) return;
  const seed = OFFICE_INDEX_SEED[officeId];
  if (seed) {
    state.attendancesByOffice[officeId] = seed.attendances.map((a) => ({ ...a }));
    state.contestationsByOffice[officeId] = seed.contestations.map((c) => ({ ...c }));
  } else {
    state.attendancesByOffice[officeId] = [];
    state.contestationsByOffice[officeId] = [];
  }
}

/** Inicializa seeds e snapshots oficiais. Idempotente. */
export function initOfficeReputationStore(): void {
  if (initialized) return;
  state = emptyState();
  for (const officeId of Object.keys(OFFICE_INDEX_SEED)) {
    ensureSeedFor(officeId);
    recalcOffice(officeId);
  }
  // Oficinas públicas sem seed explícito (cadastros novos) começam vazias / em formação
  for (const office of listPublicOffices()) {
    const id = office.id || office.officeId;
    if (!state.snapshots[id]) {
      ensureSeedFor(id);
      recalcOffice(id);
    }
  }
  initialized = true;
  notify();
}

export function subscribeOfficeReputation(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficeReputationVersion(): number {
  return state.version;
}

export function getOfficeReputation(officeId: string): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  if (!state.snapshots[officeId]) {
    ensureSeedFor(officeId);
    return recalcOffice(officeId);
  }
  return state.snapshots[officeId];
}

export function getOfficeReputationByWorkshop(workshop: Pick<Workshop, 'id'>): OfficeReputationSnapshot {
  return getOfficeReputation(workshop.id);
}

/** Recalcula após eventos relevantes (atendimento, validação, contestação…). */
export function recalculateOfficeReputation(officeId: string): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  ensureSeedFor(officeId);
  const snap = recalcOffice(officeId);
  notify();
  return snap;
}

export function ingestAttendanceFact(fact: OfficeIndexAttendanceFact): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  ensureSeedFor(fact.officeId);
  const list = state.attendancesByOffice[fact.officeId];
  const idx = list.findIndex((a) => a.id === fact.id);
  if (idx >= 0) list[idx] = fact;
  else list.push(fact);
  return recalculateOfficeReputation(fact.officeId);
}

export function ingestContestationFact(fact: OfficeIndexContestationFact): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  ensureSeedFor(fact.officeId);
  const list = state.contestationsByOffice[fact.officeId];
  const idx = list.findIndex((c) => c.id === fact.id);
  if (idx >= 0) list[idx] = fact;
  else list.push(fact);
  return recalculateOfficeReputation(fact.officeId);
}

export function respondToContestationFact(
  officeId: string,
  contestationId: string,
  respondedAt = new Date().toISOString(),
): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  ensureSeedFor(officeId);
  const list = state.contestationsByOffice[officeId] || [];
  const item = list.find((c) => c.id === contestationId);
  if (item) {
    item.respondedAt = respondedAt;
  }
  return recalculateOfficeReputation(officeId);
}

export function resolvePendingAttendance(
  officeId: string,
  attendanceId: string,
): OfficeReputationSnapshot {
  if (!initialized) initOfficeReputationStore();
  ensureSeedFor(officeId);
  const list = state.attendancesByOffice[officeId] || [];
  const item = list.find((a) => a.id === attendanceId);
  if (item) {
    item.regularityStatus = 'regular';
    if (item.validationStatus === 'aguardando') {
      item.validationStatus = 'validado';
    }
    item.completeness = {
      hasVehicle: true,
      hasService: true,
      hasDate: true,
      hasMileage: true,
      hasProductsOrNotes: true,
      hasResponsible: true,
    };
  }
  return recalculateOfficeReputation(officeId);
}

export type PublicOfficeSearchHit = {
  office: Office;
  reputation: OfficeReputationSnapshot;
};

/**
 * Busca pública de oficinas (nome, cidade, bairro, região) com índice oficial.
 * Ordenação padrão: relevância — NÃO por maior índice.
 */
export function searchOfficesWithReputation(
  query: string,
  options: { sort?: OfficeSearchSort } = {},
): PublicOfficeSearchHit[] {
  if (!initialized) initOfficeReputationStore();

  const q = query.trim();
  // searchPublicOffices já cobre nome, bairro, cidade, UF, especialidades
  let offices = searchPublicOffices(q, '', '');

  // Se a query parece cidade/UF isolada, reforça filtro de localização
  if (q && offices.length === 0) {
    offices = searchPublicOffices('', q, '');
  }

  const hits: PublicOfficeSearchHit[] = offices.map((office) => ({
    office,
    reputation: getOfficeReputation(office.id || office.officeId),
  }));

  const sort = options.sort || 'relevance';
  if (sort === 'name') {
    hits.sort((a, b) => a.office.name.localeCompare(b.office.name, 'pt-BR'));
  } else if (sort === 'location') {
    hits.sort((a, b) => {
      const locA = `${a.office.city} ${a.office.state} ${a.office.neighborhood || ''}`;
      const locB = `${b.office.city} ${b.office.state} ${b.office.neighborhood || ''}`;
      return locA.localeCompare(locB, 'pt-BR');
    });
  }
  // relevance: ordem do searchPublicOffices

  return hits;
}

/** Helpers de simulação para testes de comportamento do índice. */
export function __debugListFacts(officeId: string) {
  ensureSeedFor(officeId);
  return {
    attendances: state.attendancesByOffice[officeId] || [],
    contestations: state.contestationsByOffice[officeId] || [],
    snapshot: getOfficeReputation(officeId),
  };
}

export function __debugResetReputationStore() {
  initialized = false;
  state = emptyState();
  initOfficeReputationStore();
}

export { dueDateFromContestedAt };
