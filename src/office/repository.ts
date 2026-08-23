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
  OfficeMembership,
  OfficeReturn,
  OfficeRole,
  OfficeService,
  OfficeSession,
  OfficeUser,
  OfficeVehicle,
  OfficeWorkOrder,
  OnboardingDraft,
  UserId,
  VebookUser,
} from './types';
import { demoFingerprint, hostnameError, normalizeHostname, onlyDigits } from './validation';

const STORAGE_KEY = 'vebook.office-ecosystem.v2';
const SESSION_KEY = 'vebook.office-session.demo';
const DRAFT_KEY = 'vebook.office-onboarding.draft';
const LAST_PUBLISHED_KEY = 'vebook.office-onboarding.last-published';

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
    if (parsed?.version !== 2 || !Array.isArray(parsed.offices) || !Array.isArray(parsed.users) || !Array.isArray(parsed.memberships)) {
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

export function getUserById(id: UserId): VebookUser | undefined {
  return state.users.find((item) => item.id === id);
}

export function getUserByCpf(cpf: string): VebookUser | undefined {
  const digits = onlyDigits(cpf);
  return state.users.find((item) => onlyDigits(item.cpf) === digits);
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
export function officeHostnames(officeId: OfficeId): OfficeHostname[] {
  return scoped(state.hostnames, officeId);
}
export function officeAudit(officeId: OfficeId): AuditEvent[] {
  return scoped(state.audit, officeId);
}

/** Memberships ativos da oficina, enriquecidos com a identidade pessoal. */
export function officeUsers(officeId: OfficeId): OfficeUser[] {
  return state.memberships
    .filter((item) => item.officeId === officeId)
    .map((membership) => {
      const user = getUserById(membership.userId);
      if (!user) return null;
      return {
        ...user,
        membershipId: membership.id,
        officeId: membership.officeId,
        role: membership.role,
        active: membership.active,
      };
    })
    .filter((item): item is OfficeUser => Boolean(item));
}

export function getMembership(userId: UserId, officeId: OfficeId): OfficeMembership | undefined {
  return state.memberships.find((item) => item.userId === userId && item.officeId === officeId);
}

/** Valida acesso ativo. Preparado para espelhar RLS futuro. */
export function assertUserCanAccessOffice(userId: UserId, officeId: OfficeId): OfficeMembership | null {
  const membership = getMembership(userId, officeId);
  if (!membership || !membership.active) return null;
  return membership;
}

export function listOfficesForUser(userId: UserId): Array<{ office: Office; membership: OfficeMembership }> {
  return state.memberships
    .filter((item) => item.userId === userId && item.active)
    .map((membership) => {
      const office = getOfficeById(membership.officeId);
      if (!office) return null;
      return { office, membership };
    })
    .filter((item): item is { office: Office; membership: OfficeMembership } => Boolean(item))
    .sort((a, b) => a.office.identity.publicName.localeCompare(b.office.identity.publicName, 'pt-BR'));
}

export function officeHostnamesForUser(userId: UserId): string[] {
  return listOfficesForUser(userId).map((item) => item.office.currentHostname);
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

function createUserRecord(input: {
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  password: string;
}): VebookUser {
  const existing = getUserByCpf(input.cpf);
  if (existing) throw new Error('Já existe uma conta VEBOOK com este CPF.');
  return {
    id: uid('usr'),
    name: input.name.trim(),
    cpf: input.cpf,
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    passwordFingerprint: demoFingerprint(input.password),
    createdAt: nowIso(),
  };
}

export function publishOfficeFromDraft(
  draft: OnboardingDraft,
  options?: { existingUserId?: UserId }
): { office: Office; user: VebookUser; membership: OfficeMembership } {
  const hostCheck = hostnameAvailability(draft.hostname);
  if (!hostCheck.available) {
    throw new Error(hostCheck.reason || 'Subdomínio indisponível.');
  }

  const account = draft.account ?? draft.access;
  let user: VebookUser | undefined = options?.existingUserId ? getUserById(options.existingUserId) : undefined;

  if (!user) {
    if (!account) throw new Error('Conta VEBOOK obrigatória.');
    user = createUserRecord({
      name: account.name || draft.identification.responsibleName,
      cpf: account.cpf,
      email: account.email,
      phone: account.phone || draft.identification.phone,
      password: account.password,
    });
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

  const membership: OfficeMembership = {
    id: uid('mem'),
    userId: user.id,
    officeId,
    role: 'OWNER',
    active: true,
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

  const userExists = Boolean(getUserById(user.id));
  state = {
    ...state,
    nextOfficeSeq: seq + 1,
    users: userExists
      ? state.users.map((item) => (item.id === user!.id ? { ...item, lastOfficeId: officeId } : item))
      : [...state.users, { ...user, lastOfficeId: officeId }],
    memberships: [...state.memberships, membership],
    offices: [...state.offices, office],
    hostnames: [...state.hostnames, hostRecord],
    services: [...state.services, ...services],
  };
  audit(officeId, user.id, 'office_created', 'office', officeId);
  emit();
  return { office, user: getUserById(user.id)!, membership };
}

export type LoginResult =
  | { ok: true; session: OfficeSession; offices: Office[]; needsOfficeSelection: boolean }
  | { ok: false; reason: string };

/**
 * Login definitivo: CPF + senha.
 * O e-mail NÃO é credencial de autenticação.
 */
export function attemptDemoLogin(cpf: string, password: string, preferredOfficeId?: OfficeId): LoginResult {
  const user = getUserByCpf(cpf);
  if (!user) return { ok: false, reason: 'CPF não encontrado no VEBOOK.' };
  if (user.passwordFingerprint !== demoFingerprint(password)) {
    return { ok: false, reason: 'Senha incorreta.' };
  }

  const accessible = listOfficesForUser(user.id);
  if (accessible.length === 0) {
    return { ok: false, reason: 'Nenhuma oficina ativa vinculada a este CPF.' };
  }

  let chosen =
    (preferredOfficeId && accessible.find((item) => item.office.id === preferredOfficeId)) ||
    (user.lastOfficeId && accessible.find((item) => item.office.id === user.lastOfficeId)) ||
    accessible[0];

  if (preferredOfficeId && !assertUserCanAccessOffice(user.id, preferredOfficeId)) {
    return { ok: false, reason: 'Sem permissão para administrar esta oficina.' };
  }

  if (preferredOfficeId) {
    const preferred = accessible.find((item) => item.office.id === preferredOfficeId);
    if (preferred) chosen = preferred;
  }

  const session = activateSession(user.id, chosen.office.id, chosen.membership.role);
  return {
    ok: true,
    session,
    offices: accessible.map((item) => item.office),
    needsOfficeSelection: accessible.length > 1 && !preferredOfficeId && !user.lastOfficeId,
  };
}

function activateSession(userId: UserId, officeId: OfficeId, role: OfficeRole): OfficeSession {
  const membership = assertUserCanAccessOffice(userId, officeId);
  if (!membership) throw new Error('Acesso negado à oficina.');

  const session: OfficeSession = {
    userId,
    officeId,
    role: membership.role,
    startedAt: nowIso(),
    demo: true,
  };
  state = {
    ...state,
    users: state.users.map((item) => (item.id === userId ? { ...item, lastOfficeId: officeId } : item)),
  };
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  audit(officeId, userId, 'login', 'session');
  emit();
  return session;
}

export function switchOfficeContext(officeId: OfficeId): OfficeSession | null {
  const session = getDemoSession();
  if (!session) return null;
  const membership = assertUserCanAccessOffice(session.userId, officeId);
  if (!membership) return null;

  const next: OfficeSession = {
    userId: session.userId,
    officeId,
    role: membership.role,
    startedAt: nowIso(),
    demo: true,
  };
  state = {
    ...state,
    users: state.users.map((item) => (item.id === session.userId ? { ...item, lastOfficeId: officeId } : item)),
  };
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }
  audit(officeId, session.userId, 'office_context_switched', 'session', officeId);
  emit();
  return next;
}

export function getDemoSession(): OfficeSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as OfficeSession;
    if (!session?.userId || !session?.officeId) return null;
    if (!assertUserCanAccessOffice(session.userId, session.officeId)) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
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
  if (!assertUserCanAccessOffice(session.userId, session.officeId)) {
    throw new Error('Sessão inválida: sem membership ativo.');
  }
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  emit();
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (!parsed.account && parsed.access) {
      parsed.account = parsed.access;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return;
  const sanitized: OnboardingDraft = {
    ...draft,
    account: { ...draft.account, password: '', confirmPassword: '' },
    access: draft.access ? { ...draft.access, password: '', confirmPassword: '' } : undefined,
  };
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(sanitized));
}

export function clearOnboardingDraft(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

function actorId(officeId: OfficeId): string {
  const session = getDemoSession();
  if (session && session.officeId === officeId) return session.userId;
  return officeUsers(officeId).find((item) => item.active)?.id ?? 'system';
}

export function upsertClient(officeId: OfficeId, input: Omit<OfficeClient, 'officeId' | 'createdAt' | 'id'> & { id?: string }): OfficeClient {
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
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
  requireActiveContext(officeId);
  const current = getOfficeById(officeId);
  if (!current) throw new Error('Oficina não encontrada.');
  const next = { ...current, ...patch, id: current.id };
  state = { ...state, offices: state.offices.map((item) => (item.id === officeId ? next : item)) };
  audit(officeId, actorId(officeId), action, 'office', officeId);
  emit();
  return next;
}

export function updateVebookUser(userId: UserId, patch: Partial<Pick<VebookUser, 'name' | 'email' | 'phone'>>): VebookUser {
  const current = getUserById(userId);
  if (!current) throw new Error('Usuário não encontrado.');
  const next = { ...current, ...patch, id: current.id, cpf: current.cpf };
  state = { ...state, users: state.users.map((item) => (item.id === userId ? next : item)) };
  const session = getDemoSession();
  if (session) audit(session.officeId, userId, 'profile_updated', 'user', userId);
  emit();
  return next;
}

/** @deprecated Use updateVebookUser */
export function updateUser(userId: string, patch: Partial<VebookUser>): VebookUser {
  return updateVebookUser(userId, patch);
}

export function inviteOfficeMember(
  officeId: OfficeId,
  input: {
    name: string;
    cpf: string;
    email: string;
    phone?: string;
    role: OfficeRole;
    password?: string;
  }
): { user: VebookUser; membership: OfficeMembership } {
  requireActiveContext(officeId);
  const session = getDemoSession();
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Somente OWNER ou ADMIN podem gerenciar usuários.');
  }

  let user = getUserByCpf(input.cpf);
  if (!user) {
    user = createUserRecord({
      name: input.name,
      cpf: input.cpf,
      email: input.email,
      phone: input.phone,
      password: input.password || 'demonstracao',
    });
    state = { ...state, users: [...state.users, user] };
  }

  const existing = getMembership(user.id, officeId);
  if (existing) {
    const membership: OfficeMembership = {
      ...existing,
      role: input.role,
      active: true,
    };
    state = {
      ...state,
      memberships: state.memberships.map((item) => (item.id === existing.id ? membership : item)),
    };
    audit(officeId, session.userId, 'membership_updated', 'membership', membership.id);
    emit();
    return { user, membership };
  }

  const membership: OfficeMembership = {
    id: uid('mem'),
    userId: user.id,
    officeId,
    role: input.role,
    active: true,
    createdAt: nowIso(),
  };
  state = { ...state, memberships: [...state.memberships, membership] };
  audit(officeId, session.userId, 'membership_created', 'membership', membership.id);
  emit();
  return { user, membership };
}

export function updateMembership(
  membershipId: string,
  patch: Partial<Pick<OfficeMembership, 'role' | 'active'>>
): OfficeMembership {
  const current = state.memberships.find((item) => item.id === membershipId);
  if (!current) throw new Error('Vínculo não encontrado.');
  requireActiveContext(current.officeId);
  const session = getDemoSession();
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    throw new Error('Somente OWNER ou ADMIN podem gerenciar usuários.');
  }
  const next = { ...current, ...patch, id: current.id, userId: current.userId, officeId: current.officeId };
  state = {
    ...state,
    memberships: state.memberships.map((item) => (item.id === membershipId ? next : item)),
  };
  audit(current.officeId, session.userId, 'membership_updated', 'membership', membershipId);
  emit();
  return next;
}

export function removeMembership(membershipId: string): void {
  const current = state.memberships.find((item) => item.id === membershipId);
  if (!current) return;
  requireActiveContext(current.officeId);
  const session = getDemoSession();
  if (!session || session.role !== 'OWNER') {
    throw new Error('Somente o OWNER pode remover acesso.');
  }
  if (current.userId === session.userId) {
    throw new Error('Não é possível remover o próprio acesso OWNER nesta demonstração.');
  }
  state = {
    ...state,
    memberships: state.memberships.map((item) =>
      item.id === membershipId ? { ...item, active: false } : item
    ),
  };
  audit(current.officeId, session.userId, 'membership_removed', 'membership', membershipId);
  emit();
}

function requireActiveContext(officeId: OfficeId): void {
  const session = getDemoSession();
  if (!session) throw new Error('Sessão demonstrativa ausente.');
  if (session.officeId !== officeId) {
    throw new Error('Contexto de oficina inválido para esta operação.');
  }
  if (!assertUserCanAccessOffice(session.userId, officeId)) {
    throw new Error('Sem permissão para esta oficina.');
  }
}

export function listPublicOffices(): Office[] {
  return state.offices;
}

export function setLastPublishedHostname(hostname: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LAST_PUBLISHED_KEY, hostname);
}

export function getLastPublishedHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(LAST_PUBLISHED_KEY);
}
