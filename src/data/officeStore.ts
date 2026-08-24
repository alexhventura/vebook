import { WORKSHOPS_MOCK } from './mockData';
import {
  contractedAmountFor,
  currentAmountFor,
  OFFICE_PLAN_ID,
  OFFICE_PRICING,
} from './officePlans';
import { onlyDigits } from '../lib/cpf';
import { hashPassword } from '../lib/password';
import {
  createMockCheckout,
  simulateGatewayEvent,
  statusFromWebhook,
} from '../lib/payments/mockGateway';
import { isValidSlugFormat, normalizeSlug, slugFromWorkshopName, workshopHost } from '../lib/slug';
import {
  AttendanceProductLine,
  AttendanceServiceLine,
  Office,
  OfficeAppointment,
  OfficeAttendance,
  OfficeConsent,
  OfficeCustomer,
  OfficePayment,
  OfficeReturn,
  OfficeSession,
  OfficeSubscription,
  OfficeUser,
  OfficeVehicleRecord,
  PlanModality,
  SignupDraft,
  Workshop,
} from '../types';

const STORAGE_KEY = 'vebook_office_ecosystem_v1';
const SESSION_MS = 1000 * 60 * 60 * 12;

export const DEMO_OWNER = {
  fullName: 'Maria Helena Prado',
  cpf: '52998224725',
  phone: '11991453300',
  email: 'maria.prado@autocenterprisma.com.br',
  password: 'Prisma2026!',
};

type StoreState = {
  offices: Office[];
  users: OfficeUser[];
  subscriptions: OfficeSubscription[];
  payments: OfficePayment[];
  consents: OfficeConsent[];
  customers: OfficeCustomer[];
  vehicles: OfficeVehicleRecord[];
  attendances: OfficeAttendance[];
  attendanceServices: AttendanceServiceLine[];
  attendanceProducts: AttendanceProductLine[];
  returns: OfficeReturn[];
  appointments: OfficeAppointment[];
  session: OfficeSession | null;
};

const listeners = new Set<() => void>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function workshopToOffice(workshop: Workshop): Office {
  const slug = workshop.subdomain.split('.')[0] || slugFromWorkshopName(workshop.name);
  return {
    ...workshop,
    officeId: workshop.id,
    legalName: workshop.name,
    tradeName: workshop.name,
    street: workshop.address,
    streetNumber: '',
    status: 'active',
    publicVisible: true,
    slug,
    createdAt: workshop.certifiedSince,
    activatedAt: workshop.certifiedSince,
    segments: workshop.specialties,
    source: 'seed',
  };
}

function emptyState(): StoreState {
  return {
    offices: WORKSHOPS_MOCK.map(workshopToOffice),
    users: [],
    subscriptions: [],
    payments: [],
    consents: [],
    customers: [],
    vehicles: [],
    attendances: [],
    attendanceServices: [],
    attendanceProducts: [],
    returns: [],
    appointments: [],
    session: null,
  };
}

function loadRaw(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    const base = emptyState();
    const persistedOffices = parsed.offices ?? [];
    const signupOffices = persistedOffices.filter((office) => office.source === 'signup');
    return {
      ...base,
      offices: [...base.offices, ...signupOffices],
      users: parsed.users ?? [],
      subscriptions: parsed.subscriptions ?? [],
      payments: parsed.payments ?? [],
      consents: parsed.consents ?? [],
      customers: parsed.customers ?? [],
      vehicles: parsed.vehicles ?? [],
      attendances: parsed.attendances ?? [],
      attendanceServices: parsed.attendanceServices ?? [],
      attendanceProducts: parsed.attendanceProducts ?? [],
      returns: parsed.returns ?? [],
      appointments: parsed.appointments ?? [],
      session: parsed.session ?? null,
    };
  } catch {
    return emptyState();
  }
}

let state: StoreState = loadRaw();

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

function scoped<T extends { officeId: string }>(rows: T[], officeId: string): T[] {
  return rows.filter((row) => row.officeId === officeId);
}

function assertOfficeScope(officeId: string, rowOfficeId: string): void {
  if (officeId !== rowOfficeId) {
    throw new Error('Isolamento por office_id: operação recusada.');
  }
}

async function ensureDemoOwner(): Promise<void> {
  const prisma = state.offices.find((office) => office.slug === 'prisma');
  if (!prisma) return;
  const existing = state.users.find((user) => user.cpf === DEMO_OWNER.cpf);
  if (existing) return;
  const owner: OfficeUser = {
    id: 'user_demo_prisma',
    officeId: prisma.officeId,
    fullName: DEMO_OWNER.fullName,
    cpf: DEMO_OWNER.cpf,
    phone: DEMO_OWNER.phone,
    email: DEMO_OWNER.email,
    passwordHash: await hashPassword(DEMO_OWNER.cpf, DEMO_OWNER.password),
    role: 'owner',
    createdAt: prisma.createdAt,
  };
  prisma.ownerUserId = owner.id;
  state.users = [...state.users, owner];
  if (!state.customers.some((row) => row.officeId === prisma.officeId)) {
    const customer: OfficeCustomer = {
      id: 'cust_demo_prisma',
      officeId: prisma.officeId,
      name: 'João Carlos da Silva',
      phone: '11988880000',
      whatsapp: '11988880000',
      email: 'joao.silva@email.com',
      createdAt: nowIso(),
    };
    const vehicle: OfficeVehicleRecord = {
      id: 'veh_demo_prisma',
      officeId: prisma.officeId,
      customerId: customer.id,
      plate: 'BRA2E19',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      createdAt: nowIso(),
    };
    const attendance: OfficeAttendance = {
      id: 'att_demo_prisma',
      officeId: prisma.officeId,
      customerId: customer.id,
      vehicleId: vehicle.id,
      date: '2026-08-21',
      mileageKm: 48320,
      notes: 'Troca de óleo e filtros homologados.',
      status: 'completed',
      createdAt: nowIso(),
    };
    state.customers = [...state.customers, customer];
    state.vehicles = [...state.vehicles, vehicle];
    state.attendances = [...state.attendances, attendance];
    state.attendanceServices = [
      ...state.attendanceServices,
      {
        id: 'atts_demo_prisma',
        officeId: prisma.officeId,
        attendanceId: attendance.id,
        title: 'Troca de óleo e filtros',
      },
    ];
    state.attendanceProducts = [
      ...state.attendanceProducts,
      {
        id: 'attp_demo_prisma',
        officeId: prisma.officeId,
        attendanceId: attendance.id,
        name: 'Super 3000 0W-20',
        brand: 'Mobil',
        quantity: 4.2,
      },
    ];
    state.returns = [
      ...state.returns,
      {
        id: 'ret_demo_prisma',
        officeId: prisma.officeId,
        customerId: customer.id,
        vehicleId: vehicle.id,
        dueDate: '2026-09-21',
        reason: 'Próxima troca de óleo',
        serviceTitle: 'Troca de óleo',
        nextMileageKm: 58320,
        status: 'scheduled',
        createdAt: nowIso(),
      },
    ];
  }
  persist();
}

function enrichDemoOperationalRecords(): void {
  state.customers = state.customers.map((row) => {
    if (row.id !== 'cust_demo_prisma') return row;
    return {
      ...row,
      phone: row.phone || '11988880000',
      whatsapp: row.whatsapp || '11988880000',
      email: row.email || 'joao.silva@email.com',
    };
  });
  state.returns = state.returns.map((row) => {
    if (row.id !== 'ret_demo_prisma') return row;
    return {
      ...row,
      serviceTitle: row.serviceTitle || 'Troca de óleo',
      nextMileageKm: row.nextMileageKm ?? 58320,
      reason: row.reason || 'Próxima troca de óleo',
    };
  });
}

export function subscribeOfficeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOfficeStoreSnapshot(): StoreState {
  return state;
}

export async function initOfficeStore(): Promise<void> {
  await ensureDemoOwner();
  enrichDemoOperationalRecords();
  persist();
}

export function listPublicOffices(): Office[] {
  return state.offices.filter((office) => office.status === 'active' && office.publicVisible);
}

export function searchPublicOffices(query: string, city = '', stateUf = ''): Office[] {
  const term = query.trim().toLowerCase();
  const cityTerm = city.trim().toLowerCase();
  const ufTerm = stateUf.trim().toUpperCase();
  return listPublicOffices().filter((office) => {
    const haystack = [
      office.name,
      office.legalName,
      office.tradeName,
      office.city,
      office.state,
      office.neighborhood,
      ...(office.specialties ?? []),
      ...(office.segments ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery = !term || haystack.includes(term);
    const matchesCity = !cityTerm || office.city.toLowerCase().includes(cityTerm);
    const matchesUf = !ufTerm || office.state.toUpperCase() === ufTerm;
    return matchesQuery && matchesCity && matchesUf;
  });
}

export function getOfficeBySlug(slug: string): Office | undefined {
  return state.offices.find((office) => office.slug === normalizeSlug(slug));
}

export function getOfficeById(officeId: string): Office | undefined {
  return state.offices.find((office) => office.officeId === officeId);
}

export function takenSlugs(): Set<string> {
  return new Set(state.offices.map((office) => office.slug));
}

export function isSlugAvailable(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  return isValidSlugFormat(normalized) && !takenSlugs().has(normalized);
}

export function toPublicWorkshop(office: Office): Workshop {
  const {
    officeId: _officeId,
    legalName: _legalName,
    tradeName: _tradeName,
    cnpj: _cnpj,
    street: _street,
    streetNumber: _streetNumber,
    complement: _complement,
    status: _status,
    publicVisible: _publicVisible,
    slug: _slug,
    ownerUserId: _ownerUserId,
    createdAt: _createdAt,
    activatedAt: _activatedAt,
    segments: _segments,
    source: _source,
    ...workshop
  } = office;
  return {
    ...workshop,
    subdomain: workshopHost(office.slug),
  };
}

export function listWorkshopsForPublicSite(): Workshop[] {
  return listPublicOffices().map(toPublicWorkshop);
}

function composeAddress(draft: SignupDraft['office']): string {
  const line = [draft.street, draft.streetNumber].filter(Boolean).join(', ');
  const extra = [draft.complement, draft.neighborhood].filter(Boolean).join(' — ');
  return extra ? `${line} — ${extra}` : line;
}

export async function createPendingOffice(draft: SignupDraft, consent: {
  terms: boolean;
  privacy: boolean;
  commercial: boolean;
  priceChange: boolean;
}): Promise<{ office: Office; user: OfficeUser; payment: OfficePayment }> {
  if (!consent.terms || !consent.privacy || !consent.commercial || !consent.priceChange) {
    throw new Error('Aceite obrigatório incompleto.');
  }
  const slug = normalizeSlug(draft.slug);
  if (!isSlugAvailable(slug)) {
    throw new Error('Endereço digital indisponível.');
  }
  const cpf = onlyDigits(draft.owner.cpf);
  if (state.users.some((user) => user.cpf === cpf)) {
    throw new Error('Já existe um responsável cadastrado com este CPF.');
  }

  const officeId = createId('off');
  const userId = createId('usr');
  const subscriptionId = createId('sub');
  const paymentId = createId('pay');
  const stamp = nowIso();
  const host = workshopHost(slug);

  const office: Office = {
    id: officeId,
    officeId,
    name: draft.office.tradeName.trim() || draft.office.legalName.trim(),
    legalName: draft.office.legalName.trim(),
    tradeName: draft.office.tradeName.trim() || undefined,
    cnpj: onlyDigits(draft.office.cnpj) || undefined,
    subdomain: host,
    slug,
    slogan: draft.extras.shortDescription || undefined,
    themeColor: 'blue',
    city: draft.office.city,
    state: draft.office.state,
    address: composeAddress(draft.office),
    neighborhood: draft.office.neighborhood,
    zipCode: draft.office.zipCode,
    street: draft.office.street,
    streetNumber: draft.office.streetNumber,
    complement: draft.office.complement || undefined,
    phone: draft.office.phone,
    whatsapp: draft.office.whatsapp || draft.office.phone,
    email: draft.owner.email,
    businessHours: 'Horário a completar no painel',
    specialties: draft.extras.segments,
    segments: draft.extras.segments,
    totalServicesRegistered: 0,
    validationRate: 0,
    certifiedSince: stamp.slice(0, 10),
    description: draft.extras.shortDescription || `${draft.office.legalName} no VEBOOK.`,
    socialLinks: {
      instagram: draft.extras.instagram || undefined,
      website: draft.extras.website || undefined,
    },
    status: 'pending',
    publicVisible: false,
    ownerUserId: userId,
    createdAt: stamp,
    source: 'signup',
  };

  const user: OfficeUser = {
    id: userId,
    officeId,
    fullName: draft.owner.fullName.trim(),
    cpf,
    phone: onlyDigits(draft.owner.phone),
    email: draft.owner.email.trim().toLowerCase(),
    passwordHash: await hashPassword(cpf, draft.owner.password),
    role: 'owner',
    createdAt: stamp,
  };

  const subscription: OfficeSubscription = {
    id: subscriptionId,
    officeId,
    planId: OFFICE_PLAN_ID,
    modality: draft.modality,
    year1MonthlyAmount: OFFICE_PRICING.year1Monthly,
    year2MonthlyAmount: OFFICE_PRICING.year2Monthly,
    contractedAmount: contractedAmountFor(draft.modality),
    currentAmount: currentAmountFor(draft.modality),
    currency: 'BRL',
    status: 'pending',
    gateway: 'mock',
    createdAt: stamp,
  };

  const checkout = createMockCheckout({
    paymentId,
    officeId,
    amount: subscription.contractedAmount,
    description: `Assinatura VEBOOK oficina (${draft.modality})`,
  });

  const payment: OfficePayment = {
    id: paymentId,
    officeId,
    subscriptionId,
    amount: subscription.contractedAmount,
    currency: 'BRL',
    status: checkout.status,
    gateway: 'mock',
    externalId: checkout.externalId,
    createdAt: stamp,
  };

  const consentRecord: OfficeConsent = {
    id: createId('cns'),
    officeId,
    userId,
    termsAcceptedAt: stamp,
    privacyAcceptedAt: stamp,
    commercialAcceptedAt: stamp,
    priceChangeAcknowledgedAt: stamp,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'vebook-prototype',
  };

  state.offices = [...state.offices, office];
  state.users = [...state.users, user];
  state.subscriptions = [...state.subscriptions, subscription];
  state.payments = [...state.payments, payment];
  state.consents = [...state.consents, consentRecord];
  persist();
  return { office, user, payment };
}

export function getLatestPayment(officeId: string): OfficePayment | undefined {
  return scoped(state.payments, officeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function getSubscription(officeId: string): OfficeSubscription | undefined {
  return scoped(state.subscriptions, officeId)[0];
}

function activateOffice(officeId: string, paidAt: string): void {
  state.offices = state.offices.map((office) => {
    if (office.officeId !== officeId) return office;
    return {
      ...office,
      status: 'active',
      publicVisible: true,
      activatedAt: paidAt,
      credentialStatus: 'credenciada',
    };
  });
  state.subscriptions = state.subscriptions.map((subscription) => {
    if (subscription.officeId !== officeId) return subscription;
    const start = new Date(paidAt);
    const renew = new Date(start);
    if (subscription.modality === 'annual') {
      renew.setFullYear(renew.getFullYear() + 1);
    } else {
      renew.setMonth(renew.getMonth() + 1);
    }
    return {
      ...subscription,
      status: 'active',
      startsAt: paidAt,
      renewsAt: renew.toISOString(),
    };
  });
}

export function applyPaymentWebhook(externalId: string, event: Parameters<typeof simulateGatewayEvent>[1]): OfficePayment | undefined {
  const payload = simulateGatewayEvent(externalId, event);
  const status = statusFromWebhook(event);
  let updated: OfficePayment | undefined;
  state.payments = state.payments.map((payment) => {
    if (payment.externalId !== externalId) return payment;
    updated = {
      ...payment,
      status,
      webhookReceivedAt: payload.receivedAt,
      paidAt: status === 'paid' ? payload.receivedAt : payment.paidAt,
      failureReason: status === 'failed' ? 'Pagamento recusado pelo gateway de teste.' : payment.failureReason,
    };
    return updated;
  });
  if (updated && status === 'paid') {
    activateOffice(updated.officeId, payload.receivedAt);
  }
  persist();
  return updated;
}

export async function loginWithCpf(cpf: string, password: string): Promise<OfficeSession> {
  const digits = onlyDigits(cpf);
  const user = state.users.find((row) => row.cpf === digits);
  if (!user) {
    throw new Error('CPF ou senha inválidos.');
  }
  const ok = user.passwordHash === (await hashPassword(digits, password));
  if (!ok) {
    throw new Error('CPF ou senha inválidos.');
  }
  const session: OfficeSession = {
    userId: user.id,
    officeId: user.officeId,
    expiresAt: Date.now() + SESSION_MS,
  };
  state.session = session;
  persist();
  return session;
}

export function logoutOffice(): void {
  state.session = null;
  persist();
}

export function getActiveSession(): OfficeSession | null {
  if (!state.session) return null;
  if (Date.now() > state.session.expiresAt) {
    state.session = null;
    persist();
    return null;
  }
  return state.session;
}

export function getSessionUser(): OfficeUser | undefined {
  const session = getActiveSession();
  if (!session) return undefined;
  return state.users.find((user) => user.id === session.userId && user.officeId === session.officeId);
}

export function getSessionOffice(): Office | undefined {
  const session = getActiveSession();
  if (!session) return undefined;
  return getOfficeById(session.officeId);
}

export function requestPasswordReset(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  const exists = state.users.some((user) => user.cpf === digits);
  if (!exists) return false;
  state.users = state.users.map((user) =>
    user.cpf === digits ? { ...user, passwordResetRequestedAt: nowIso() } : user,
  );
  persist();
  return true;
}

export function updateOfficeProfile(officeId: string, patch: Partial<Office>): Office {
  const current = getOfficeById(officeId);
  if (!current) throw new Error('Oficina não encontrada.');
  const next: Office = {
    ...current,
    ...patch,
    officeId: current.officeId,
    id: current.id,
    slug: current.slug,
    source: current.source,
    status: current.status,
    publicVisible: current.publicVisible,
  };
  if (patch.street || patch.streetNumber || patch.complement || patch.neighborhood) {
    const line = [next.street, next.streetNumber].filter(Boolean).join(', ');
    const extra = [next.complement, next.neighborhood].filter(Boolean).join(' — ');
    next.address = extra ? `${line} — ${extra}` : line;
  }
  if (next.slug) {
    next.subdomain = workshopHost(next.slug);
  }
  state.offices = state.offices.map((office) => (office.officeId === officeId ? next : office));
  persist();
  return next;
}

export function listCustomers(officeId: string): OfficeCustomer[] {
  return scoped(state.customers, officeId);
}

export function upsertCustomer(officeId: string, input: Omit<OfficeCustomer, 'id' | 'officeId' | 'createdAt'> & { id?: string }): OfficeCustomer {
  if (input.id) {
    const existing = state.customers.find((row) => row.id === input.id);
    if (!existing) throw new Error('Cliente não encontrado.');
    assertOfficeScope(officeId, existing.officeId);
    const next = { ...existing, ...input, officeId, id: existing.id };
    state.customers = state.customers.map((row) => (row.id === existing.id ? next : row));
    persist();
    return next;
  }
  const next: OfficeCustomer = {
    id: createId('cust'),
    officeId,
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    notes: input.notes,
    createdAt: nowIso(),
  };
  state.customers = [...state.customers, next];
  persist();
  return next;
}

export function listVehicles(officeId: string): OfficeVehicleRecord[] {
  return scoped(state.vehicles, officeId);
}

export function upsertVehicle(
  officeId: string,
  input: Omit<OfficeVehicleRecord, 'id' | 'officeId' | 'createdAt'> & { id?: string },
): OfficeVehicleRecord {
  if (input.id) {
    const existing = state.vehicles.find((row) => row.id === input.id);
    if (!existing) throw new Error('Veículo não encontrado.');
    assertOfficeScope(officeId, existing.officeId);
    const next = { ...existing, ...input, officeId, id: existing.id };
    state.vehicles = state.vehicles.map((row) => (row.id === existing.id ? next : row));
    persist();
    return next;
  }
  const next: OfficeVehicleRecord = {
    id: createId('veh'),
    officeId,
    customerId: input.customerId,
    plate: input.plate,
    brand: input.brand,
    model: input.model,
    year: input.year,
    createdAt: nowIso(),
  };
  state.vehicles = [...state.vehicles, next];
  persist();
  return next;
}

export function listAttendances(officeId: string): OfficeAttendance[] {
  return scoped(state.attendances, officeId);
}

export function createAttendance(
  officeId: string,
  input: Omit<OfficeAttendance, 'id' | 'officeId' | 'createdAt'> & {
    services?: string[];
    products?: Array<{ name: string; brand?: string; quantity?: number }>;
  },
): OfficeAttendance {
  const attendance: OfficeAttendance = {
    id: createId('att'),
    officeId,
    customerId: input.customerId,
    vehicleId: input.vehicleId,
    date: input.date,
    mileageKm: input.mileageKm,
    notes: input.notes,
    status: input.status,
    createdAt: nowIso(),
  };
  state.attendances = [...state.attendances, attendance];
  for (const title of input.services ?? []) {
    if (!title.trim()) continue;
    state.attendanceServices = [
      ...state.attendanceServices,
      { id: createId('atts'), officeId, attendanceId: attendance.id, title: title.trim() },
    ];
  }
  for (const product of input.products ?? []) {
    if (!product.name.trim()) continue;
    state.attendanceProducts = [
      ...state.attendanceProducts,
      {
        id: createId('attp'),
        officeId,
        attendanceId: attendance.id,
        name: product.name.trim(),
        brand: product.brand,
        quantity: product.quantity,
      },
    ];
  }
  persist();
  return attendance;
}

export function listAttendanceServices(officeId: string, attendanceId: string): AttendanceServiceLine[] {
  return scoped(state.attendanceServices, officeId).filter((row) => row.attendanceId === attendanceId);
}

export function listAttendanceProducts(officeId: string, attendanceId: string): AttendanceProductLine[] {
  return scoped(state.attendanceProducts, officeId).filter((row) => row.attendanceId === attendanceId);
}

export function listReturns(officeId: string): OfficeReturn[] {
  return scoped(state.returns, officeId);
}

export function upsertReturn(
  officeId: string,
  input: Omit<OfficeReturn, 'id' | 'officeId' | 'createdAt'> & { id?: string },
): OfficeReturn {
  if (input.id) {
    const existing = state.returns.find((row) => row.id === input.id);
    if (!existing) throw new Error('Retorno não encontrado.');
    assertOfficeScope(officeId, existing.officeId);
    const next = { ...existing, ...input, officeId, id: existing.id };
    state.returns = state.returns.map((row) => (row.id === existing.id ? next : row));
    persist();
    return next;
  }
  const next: OfficeReturn = {
    id: createId('ret'),
    officeId,
    vehicleId: input.vehicleId,
    customerId: input.customerId,
    dueDate: input.dueDate,
    reason: input.reason,
    serviceTitle: input.serviceTitle,
    nextMileageKm: input.nextMileageKm,
    status: input.status,
    createdAt: nowIso(),
  };
  state.returns = [...state.returns, next];
  persist();
  return next;
}

export function listAppointments(officeId: string): OfficeAppointment[] {
  return scoped(state.appointments, officeId);
}

export function createAppointment(
  officeId: string,
  input: Omit<OfficeAppointment, 'id' | 'officeId' | 'createdAt' | 'status'> & { status?: OfficeAppointment['status'] },
): OfficeAppointment {
  const next: OfficeAppointment = {
    id: createId('apt'),
    officeId,
    customerName: input.customerName,
    phone: input.phone,
    plate: input.plate,
    service: input.service,
    date: input.date,
    period: input.period,
    notes: input.notes,
    status: input.status ?? 'requested',
    createdAt: nowIso(),
  };
  state.appointments = [...state.appointments, next];
  persist();
  return next;
}

export function updateAppointmentStatus(officeId: string, appointmentId: string, status: OfficeAppointment['status']): void {
  const existing = state.appointments.find((row) => row.id === appointmentId);
  if (!existing) throw new Error('Agendamento não encontrado.');
  assertOfficeScope(officeId, existing.officeId);
  state.appointments = state.appointments.map((row) => (row.id === appointmentId ? { ...row, status } : row));
  persist();
}

export function onboardingProgress(officeId: string): { items: Array<{ id: string; label: string; done: boolean }>; percent: number } {
  const office = getOfficeById(officeId);
  const customers = listCustomers(officeId);
  const vehicles = listVehicles(officeId);
  const attendances = listAttendances(officeId);
  const items = [
    { id: 'dados', label: 'Dados da oficina', done: Boolean(office?.address && office.city && office.phone) },
    { id: 'logo', label: 'Logo', done: Boolean(office?.logoUrl) },
    { id: 'descricao', label: 'Descrição', done: Boolean(office?.description && office.description.length > 40) },
    { id: 'horarios', label: 'Horários', done: Boolean(office?.businessHoursDetail) },
    { id: 'servicos', label: 'Serviços', done: Boolean(office?.servicesList && office.servicesList.length > 0) },
    { id: 'contato', label: 'Contato', done: Boolean(office?.whatsapp && office.phone) },
    { id: 'cliente', label: 'Primeiro cliente', done: customers.length > 0 },
    { id: 'veiculo', label: 'Primeiro veículo', done: vehicles.length > 0 },
    { id: 'atendimento', label: 'Primeiro atendimento', done: attendances.length > 0 },
  ];
  const done = items.filter((item) => item.done).length;
  return { items, percent: Math.round((done / items.length) * 100) };
}

export function defaultSignupDraft(modality: PlanModality = 'monthly'): SignupDraft {
  return {
    owner: { fullName: '', cpf: '', phone: '', email: '', password: '' },
    office: {
      legalName: '',
      tradeName: '',
      cnpj: '',
      phone: '',
      whatsapp: '',
      zipCode: '',
      street: '',
      streetNumber: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
    slug: '',
    extras: { segments: [], instagram: '', website: '', shortDescription: '' },
    modality,
  };
}
