import { displayOfficeHost } from './constants';
import { createSeedState } from './seed';
import {
  AuditAction,
  AuditEvent,
  Office,
  OfficeAppointment,
  OfficeCertificate,
  OfficeClient,
  OfficeEcosystemState,
  OfficeHostname,
  OfficeId,
  OfficeReturn,
  OfficeService,
  OfficeSession,
  OfficeUser,
  OfficeVehicle,
  OfficeWorkOrder,
  OnboardingDraft,
} from './types';
import { demoFingerprint, hostnameError, normalizeHostname } from './validation';

const STORAGE_KEY = 'vebook.office-ecosystem.v1';
const SESSION_KEY = 'vebook.office-session.demo';
const DRAFT_KEY = 'vebook.office-onboarding.draft';

let state: OfficeEcosystemState = loadState();
const listeners = new Set<() => void>();

function loadState(): OfficeEcosystemState {
  if (typeof window === 'undefined') return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as OfficeEcosystemState;
    if (parsed?.version !== 1 || !Array.isArray(parsed.offices)) {
      const seed = createSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    const seed = createSeedState();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    } catch {
      /* quota */
    }
    return seed;
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function audit(officeId: OfficeId, actorUserId: string, action: AuditAction, entity: string, entityId?: string) {
  const event: AuditEvent = {
    id: uid('aud'),
    officeId,
    actorUserId,
    action,
    entity,
    entityId,
    createdAt: nowIso(),
  };
  state = { ...state, audit: [event, ...state.audit].slice(0, 400) };
}

export function subscribeOfficeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficeSnapshot(): OfficeEcosystemState {
  return state;
}

export function resetOfficeStoreToSeed(): void {
  state = createSeedState();
  emit();
}

export function getOfficeById(id: OfficeId): Office | undefined {
  return state.offices.find((item) => item.id === id);
}

export function getOfficeByHostname(hostname: string): Office | undefined {
  const record = resolveHostnameRecord(hostname);
  if (!record) return undefined;
  const target = record.redirectTo && !record.isCurrent ? record.redirectTo : record.hostname;
  const current = state.hostnames.find((item) => item.hostname === target && item.isCurrent);
  const officeId = current?.officeId ?? record.officeId;
  return getOfficeById(officeId);
}

export function resolveHostnameRecord(hostname: string): OfficeHostname | undefined {
  const slug = normalizeHostname(hostname);
  return state.hostnames.find((item) => item.hostname === slug);
}

export function hostnameAvailability(hostname: string): {
  normalized: string;
  available: boolean;
  reason?: string;
  redirectTo?: string;
} {
  const normalized = normalizeHostname(hostname);
  const format = hostnameError(normalized);
  if (format) return { normalized, available: false, reason: format };
  const record = state.hostnames.find((item) => item.hostname === normalized);
  if (!record) return { normalized, available: true };
  if (record.status === 'retired' && record.redirectTo) {
    return {
      normalized,
      available: false,
      reason: `Este endereço permanece reservado e aponta para ${displayOfficeHost(record.redirectTo)}.`,
      redirectTo: record.redirectTo,
    };
  }
  return { normalized, available: false, reason: 'Este endereço já está sendo utilizado.' };
}

export function listOccupiedHostnames(): string[] {
  return state.hostnames.map((item) => item.hostname);
}

function scoped<T extends { officeId: OfficeId }>(items: T[], officeId: OfficeId): T[] {
  return items.filter((item) => item.officeId === officeId);
}

export function officeServices(officeId: OfficeId): OfficeService[] {
  return scoped(state.services, officeId);
}
export function officeClients(officeId: OfficeId): OfficeClient[] {
  return scoped(state.clients, officeId);
}
export function officeVehicles(officeId: OfficeId): OfficeVehicle[] {
  return scoped(state.vehicles, officeId);
}
export function officeWorkOrders(officeId: OfficeId): OfficeWorkOrder[] {
  return scoped(state.workOrders, officeId);
}
export function officeAppointments(officeId: OfficeId): OfficeAppointment[] {
  return scoped(state.appointments, officeId);
}
export function officeReturns(officeId: OfficeId): OfficeReturn[] {
  return scoped(state.returns, officeId);
}
export function officeCertificates(officeId: OfficeId): OfficeCertificate[] {
  return scoped(state.certificates, officeId);
}
export function officeUsers(officeId: OfficeId): OfficeUser[] {
  return scoped(state.users, officeId);
}
export function officeAudit(officeId: OfficeId): AuditEvent[] {
  return scoped(state.audit, officeId);
}
export function officeHostnames(officeId: OfficeId): OfficeHostname[] {
  return scoped(state.hostnames, officeId);
}

export function changeOfficeHostname(officeId: OfficeId, nextHostname: string): Office {
  const office = getOfficeById(officeId);
  if (!office) throw new Error('Oficina não encontrada.');
  const check = hostnameAvailability(nextHostname);
  if (!check.available) throw new Error(check.reason || 'Endereço indisponível.');
  const createdAt = nowIso();
  const previous = office.currentHostname;
  state = {
    ...state,
    offices: state.offices.map((item) =>
      item.id === officeId ? { ...item, currentHostname: check.normalized } : item
    ),
    hostnames: [
      ...state.hostnames.map((item) =>
        item.officeId === officeId && item.isCurrent
          ? {
              ...item,
              status: 'retired' as const,
              isCurrent: false,
              retiredAt: createdAt,
              redirectTo: check.normalized,
            }
          : item
      ),
      {
        officeId,
        hostname: check.normalized,
        status: 'active',
        isCurrent: true,
        createdAt,
      },
    ],
  };
  audit(officeId, actorId(officeId), 'site_updated', 'hostname', previous);
  emit();
  return getOfficeById(officeId)!;
}

export function publishOfficeFromDraft(draft: OnboardingDraft, actorName?: string): { office: Office; user: OfficeUser } {
  const hostCheck = hostnameAvailability(draft.hostname);
  if (!hostCheck.available) {
    throw new Error(hostCheck.reason || 'Subdomínio indisponível.');
  }

  const seq = state.nextOfficeSeq;
  const officeId = `office_${String(seq).padStart(6, '0')}`;
  const createdAt = nowIso();
  const hostname = hostCheck.normalized;

  const office: Office = {
    id: officeId,
    legalName: draft.identification.legalName.trim(),
    tradeName: draft.identification.tradeName.trim() || undefined,
    cnpj: draft.identification.cnpj,
    responsibleName: draft.identification.responsibleName.trim(),
    responsibleCpf: draft.identification.responsibleCpf,
    email: draft.identification.email.trim().toLowerCase(),
    phone: draft.identification.phone,
    secondaryPhone: draft.identification.secondaryPhone || undefined,
    address: draft.address,
    identity: {
      ...draft.identity,
      publicName: draft.identity.publicName.trim(),
    },
    hours: draft.hours,
    acceptsOnlineBooking: draft.acceptsOnlineBooking,
    minAdvanceHours: draft.minAdvanceHours,
    slotIntervalMinutes: draft.slotIntervalMinutes,
    currentHostname: hostname,
    createdAt,
    publishedAt: createdAt,
  };

  const user: OfficeUser = {
    id: uid('usr'),
    officeId,
    name: actorName || draft.identification.responsibleName,
    email: draft.access.email.trim().toLowerCase(),
    cpf: draft.access.cpf,
    phone: draft.identification.phone,
    role: 'OWNER',
    passwordFingerprint: demoFingerprint(draft.access.password),
    createdAt,
  };

  const services: OfficeService[] = draft.services
    .filter((item) => item.name.trim())
    .map((item) => ({
      id: uid('svc'),
      officeId,
      name: item.name.trim(),
      catalogKey: item.catalogKey,
      description: item.description.trim() || undefined,
      price: item.price ? Number(item.price) : undefined,
      durationMinutes: item.durationMinutes ? Number(item.durationMinutes) : undefined,
      active: item.active,
      custom: item.custom,
    }));

  const hostRecord: OfficeHostname = {
    officeId,
    hostname,
    status: 'active',
    isCurrent: true,
    createdAt,
  };

  state = {
    ...state,
    nextOfficeSeq: seq + 1,
    offices: [...state.offices, office],
    hostnames: [...state.hostnames, hostRecord],
    users: [...state.users, user],
    services: [...state.services, ...services],
  };
  audit(officeId, user.id, 'office_created', 'office', officeId);
  emit();
  return { office, user };
}

export function attemptDemoLogin(officeId: OfficeId, identifier: string, password: string): OfficeSession | null {
  const id = identifier.trim().toLowerCase();
  const cpfDigits = identifier.replace(/\D/g, '');
  const users = officeUsers(officeId);
  const user = users.find((item) => item.email.toLowerCase() === id || item.cpf.replace(/\D/g, '') === cpfDigits);
  if (!user) return null;
  if (user.passwordFingerprint !== demoFingerprint(password)) return null;
  const session: OfficeSession = {
    officeId,
    userId: user.id,
    role: user.role,
    startedAt: nowIso(),
    demo: true,
  };
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  audit(officeId, user.id, 'login', 'session');
  emit();
  return session;
}

export function getDemoSession(): OfficeSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfficeSession;
  } catch {
    return null;
  }
}

export function clearDemoSession(): void {
  const session = getDemoSession();
  if (session) audit(session.officeId, session.userId, 'logout', 'session');
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
  emit();
}

export function setDemoSession(session: OfficeSession): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  emit();
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return;
  const sanitized: OnboardingDraft = {
    ...draft,
    access: { ...draft.access, password: '', confirmPassword: '' },
  };
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(sanitized));
}

export function clearOnboardingDraft(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

function actorId(officeId: OfficeId): string {
  return getDemoSession()?.userId ?? officeUsers(officeId)[0]?.id ?? 'system';
}

export function upsertClient(officeId: OfficeId, input: Omit<OfficeClient, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeClient {
  const existing = input.id ? state.clients.find((item) => item.id === input.id) : undefined;
  const record: OfficeClient = {
    id: existing?.id ?? uid('cli'),
    officeId,
    name: input.name,
    cpf: input.cpf,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    notes: input.notes,
    createdAt: existing?.createdAt ?? nowIso(),
  };
  state = {
    ...state,
    clients: existing
      ? state.clients.map((item) => (item.id === record.id ? record : item))
      : [...state.clients, record],
  };
  audit(officeId, actorId(officeId), existing ? 'client_updated' : 'client_created', 'client', record.id);
  emit();
  return record;
}

export function upsertVehicle(officeId: OfficeId, input: Omit<OfficeVehicle, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeVehicle {
  const existing = input.id ? state.vehicles.find((item) => item.id === input.id) : undefined;
  const record: OfficeVehicle = {
    id: existing?.id ?? uid('veh'),
    officeId,
    plate: input.plate.toUpperCase(),
    brand: input.brand,
    model: input.model,
    year: input.year,
    clientId: input.clientId,
    currentMileageKm: input.currentMileageKm,
    createdAt: existing?.createdAt ?? nowIso(),
  };
  state = {
    ...state,
    vehicles: existing
      ? state.vehicles.map((item) => (item.id === record.id ? record : item))
      : [...state.vehicles, record],
  };
  emit();
  return record;
}

export function upsertService(officeId: OfficeId, input: Omit<OfficeService, 'officeId' | 'id'> & { id?: string }): OfficeService {
  const existing = input.id ? state.services.find((item) => item.id === input.id) : undefined;
  const record: OfficeService = {
    id: existing?.id ?? uid('svc'),
    officeId,
    name: input.name,
    catalogKey: input.catalogKey,
    description: input.description,
    price: input.price,
    durationMinutes: input.durationMinutes,
    active: input.active,
    custom: input.custom,
  };
  state = {
    ...state,
    services: existing
      ? state.services.map((item) => (item.id === record.id ? record : item))
      : [...state.services, record],
  };
  audit(officeId, actorId(officeId), existing ? 'service_updated' : 'service_created', 'service', record.id);
  emit();
  return record;
}

export function upsertWorkOrder(officeId: OfficeId, input: Omit<OfficeWorkOrder, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeWorkOrder {
  const existing = input.id ? state.workOrders.find((item) => item.id === input.id) : undefined;
  const record: OfficeWorkOrder = {
    id: existing?.id ?? uid('os'),
    officeId,
    date: input.date,
    clientId: input.clientId,
    vehicleId: input.vehicleId,
    serviceId: input.serviceId,
    mileageKm: input.mileageKm,
    amount: input.amount,
    status: input.status,
    notes: input.notes,
    createdAt: existing?.createdAt ?? nowIso(),
  };
  state = {
    ...state,
    workOrders: existing
      ? state.workOrders.map((item) => (item.id === record.id ? record : item))
      : [...state.workOrders, record],
  };
  audit(officeId, actorId(officeId), existing ? 'work_order_updated' : 'work_order_created', 'work_order', record.id);
  emit();
  return record;
}

export function upsertAppointment(officeId: OfficeId, input: Omit<OfficeAppointment, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeAppointment {
  const existing = input.id ? state.appointments.find((item) => item.id === input.id) : undefined;
  const record: OfficeAppointment = {
    id: existing?.id ?? uid('agd'),
    officeId,
    clientId: input.clientId,
    vehicleId: input.vehicleId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    status: input.status,
    notes: input.notes,
    createdAt: existing?.createdAt ?? nowIso(),
  };
  state = {
    ...state,
    appointments: existing
      ? state.appointments.map((item) => (item.id === record.id ? record : item))
      : [...state.appointments, record],
  };
  audit(officeId, actorId(officeId), existing ? 'appointment_updated' : 'appointment_created', 'appointment', record.id);
  emit();
  return record;
}

export function upsertReturn(officeId: OfficeId, input: Omit<OfficeReturn, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeReturn {
  const existing = input.id ? state.returns.find((item) => item.id === input.id) : undefined;
  const record: OfficeReturn = {
    id: existing?.id ?? uid('ret'),
    officeId,
    clientId: input.clientId,
    vehicleId: input.vehicleId,
    serviceId: input.serviceId,
    lastServiceDate: input.lastServiceDate,
    dueDate: input.dueDate,
    workOrderId: input.workOrderId,
    createdAt: existing?.createdAt ?? nowIso(),
  };
  state = {
    ...state,
    returns: existing
      ? state.returns.map((item) => (item.id === record.id ? record : item))
      : [...state.returns, record],
  };
  audit(officeId, actorId(officeId), 'return_created', 'return', record.id);
  emit();
  return record;
}

export function updateOffice(officeId: OfficeId, patch: Partial<Office>, action: AuditAction = 'site_updated'): Office {
  const current = getOfficeById(officeId);
  if (!current) throw new Error('Oficina não encontrada.');
  const next = { ...current, ...patch, id: current.id };
  state = { ...state, offices: state.offices.map((item) => (item.id === officeId ? next : item)) };
  audit(officeId, actorId(officeId), action, 'office', officeId);
  emit();
  return next;
}

export function updateUser(userId: string, patch: Partial<OfficeUser>): OfficeUser {
  const current = state.users.find((item) => item.id === userId);
  if (!current) throw new Error('Usuário não encontrado.');
  const next = { ...current, ...patch, id: current.id, officeId: current.officeId };
  state = { ...state, users: state.users.map((item) => (item.id === userId ? next : item)) };
  audit(current.officeId, userId, 'profile_updated', 'user', userId);
  emit();
  return next;
}

export function listPublicOffices(): Office[] {
  return state.offices;
}

const LAST_PUBLISHED_KEY = 'vebook.office-onboarding.last-published';

export function setLastPublishedHostname(hostname: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LAST_PUBLISHED_KEY, hostname);
}

export function getLastPublishedHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(LAST_PUBLISHED_KEY);
}
