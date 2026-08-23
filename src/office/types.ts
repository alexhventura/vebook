/** Ecossistema de oficinas: identidade pessoal (CPF) distinta da oficina (officeId) e do hostname. */

export type OfficeId = string;
export type UserId = string;

export type OfficeRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type HostnameStatus = 'active' | 'retired' | 'reserved';

export type WorkOrderStatus = 'aberto' | 'em_andamento' | 'concluido' | 'cancelado';

export type AppointmentStatus =
  | 'agendado'
  | 'confirmado'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu';

export type CertificateStatus = 'emitida' | 'verificada';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'office_created'
  | 'office_context_switched'
  | 'client_created'
  | 'client_updated'
  | 'work_order_created'
  | 'work_order_updated'
  | 'appointment_created'
  | 'appointment_updated'
  | 'return_created'
  | 'service_created'
  | 'service_updated'
  | 'site_updated'
  | 'profile_updated'
  | 'membership_created'
  | 'membership_updated'
  | 'membership_removed'
  | 'certificate_viewed';

export interface OfficeHostname {
  officeId: OfficeId;
  hostname: string;
  status: HostnameStatus;
  isCurrent: boolean;
  createdAt: string;
  retiredAt?: string;
  redirectTo?: string;
}

export interface OfficeAddress {
  zipCode: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement?: string;
  reference?: string;
}

export interface OfficeIdentity {
  publicName: string;
  logoDataUrl?: string;
  coverDataUrl?: string;
  slogan?: string;
  description?: string;
  foundedYear?: number;
}

export interface OfficeHoursDay {
  enabled: boolean;
  open: string;
  close: string;
}

export interface OfficeHours {
  monday: OfficeHoursDay;
  tuesday: OfficeHoursDay;
  wednesday: OfficeHoursDay;
  thursday: OfficeHoursDay;
  friday: OfficeHoursDay;
  saturday: OfficeHoursDay;
  sunday: OfficeHoursDay;
}

export interface OfficeService {
  id: string;
  officeId: OfficeId;
  name: string;
  catalogKey?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  active: boolean;
  custom: boolean;
}

export interface OfficeSocial {
  instagram?: string;
  facebook?: string;
  website?: string;
}

/** Identidade pessoal única no VEBOOK. CPF é o identificador de login. */
export interface VebookUser {
  id: UserId;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  /** Fingerprint de demonstração. Não constitui autenticação real. */
  passwordFingerprint: string;
  /** Última oficina usada (preferência de UX; sempre revalidada em office_users). */
  lastOfficeId?: OfficeId;
  createdAt: string;
}

/**
 * Relação usuário ↔ oficina (office_users).
 * Papel e ativação vivem aqui — não na identidade pessoal.
 */
export interface OfficeMembership {
  id: string;
  userId: UserId;
  officeId: OfficeId;
  role: OfficeRole;
  active: boolean;
  createdAt: string;
}

export interface Office {
  id: OfficeId;
  legalName: string;
  tradeName?: string;
  cnpj: string;
  responsibleName: string;
  responsibleCpf: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: OfficeAddress;
  identity: OfficeIdentity;
  hours: OfficeHours;
  acceptsOnlineBooking: boolean;
  minAdvanceHours: number;
  slotIntervalMinutes: number;
  social?: OfficeSocial;
  currentHostname: string;
  createdAt: string;
  publishedAt: string;
}

/** @deprecated Prefer VebookUser + OfficeMembership. Mantido só como alias de leitura enriquecida. */
export type OfficeUser = VebookUser & { membershipId: string; officeId: OfficeId; role: OfficeRole; active: boolean };

export interface OfficeClient {
  id: string;
  officeId: OfficeId;
  name: string;
  cpf: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface OfficeVehicle {
  id: string;
  officeId: OfficeId;
  plate: string;
  brand: string;
  model: string;
  year: number;
  clientId: string;
  currentMileageKm: number;
  createdAt: string;
}

export interface OfficeWorkOrder {
  id: string;
  officeId: OfficeId;
  date: string;
  clientId: string;
  vehicleId: string;
  serviceId: string;
  mileageKm: number;
  amount: number;
  status: WorkOrderStatus;
  notes?: string;
  createdAt: string;
}

export interface OfficeAppointment {
  id: string;
  officeId: OfficeId;
  clientId: string;
  vehicleId: string;
  serviceId: string;
  startsAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface OfficeReturn {
  id: string;
  officeId: OfficeId;
  clientId: string;
  vehicleId: string;
  serviceId: string;
  lastServiceDate: string;
  dueDate: string;
  workOrderId?: string;
  createdAt: string;
}

export interface OfficeCertificate {
  id: string;
  officeId: OfficeId;
  code: string;
  vehicleId: string;
  issuedAt: string;
  requesterName: string;
  status: CertificateStatus;
}

export interface AuditEvent {
  id: string;
  officeId: OfficeId;
  actorUserId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  createdAt: string;
}

export interface OfficeSession {
  userId: UserId;
  officeId: OfficeId;
  role: OfficeRole;
  startedAt: string;
  demo: true;
}

export interface OfficeEcosystemState {
  version: 2;
  nextOfficeSeq: number;
  users: VebookUser[];
  memberships: OfficeMembership[];
  offices: Office[];
  hostnames: OfficeHostname[];
  clients: OfficeClient[];
  vehicles: OfficeVehicle[];
  services: OfficeService[];
  workOrders: OfficeWorkOrder[];
  appointments: OfficeAppointment[];
  returns: OfficeReturn[];
  certificates: OfficeCertificate[];
  audit: AuditEvent[];
}

export interface AccountDraft {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface OnboardingDraft {
  account: AccountDraft;
  identification: {
    legalName: string;
    tradeName: string;
    cnpj: string;
    responsibleName: string;
    responsibleCpf: string;
    email: string;
    phone: string;
    secondaryPhone: string;
  };
  address: OfficeAddress;
  identity: OfficeIdentity;
  services: Array<{
    catalogKey?: string;
    name: string;
    description: string;
    price: string;
    durationMinutes: string;
    active: boolean;
    custom: boolean;
  }>;
  hours: OfficeHours;
  acceptsOnlineBooking: boolean;
  minAdvanceHours: number;
  slotIntervalMinutes: number;
  hostname: string;
  /** @deprecated Prefer account. Mantido para rascunhos antigos. */
  access?: AccountDraft;
  termsAccepted: boolean;
  /** Quando true, o cadastro de conta é omitido (usuário já autenticado). */
  skipAccount?: boolean;
}
