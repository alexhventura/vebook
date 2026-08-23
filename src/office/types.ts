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

export type ServiceCategory = 'manutencao_preventiva' | 'reparo' | 'troca_de_peca';

export type ProductOrigin = 'estoque' | 'comprado_atendimento' | 'cliente' | 'garantia_terceiro';

export type PaymentStatus = 'pendente' | 'parcial' | 'recebido' | 'cancelado';

export type ReturnReason = 'troca_oleo' | 'revisao' | 'inspecao' | 'outro';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'office_created'
  | 'office_context_switched'
  | 'client_created'
  | 'client_updated'
  | 'vehicle_created'
  | 'vehicle_updated'
  | 'work_order_created'
  | 'work_order_updated'
  | 'appointment_created'
  | 'appointment_updated'
  | 'return_created'
  | 'service_created'
  | 'service_updated'
  | 'product_created'
  | 'product_linked'
  | 'site_updated'
  | 'profile_updated'
  | 'membership_created'
  | 'membership_updated'
  | 'membership_removed'
  | 'certificate_viewed';

export interface AuditFields {
  createdBy: UserId;
  updatedBy: UserId;
  createdAt: string;
  updatedAt: string;
}

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

/** Catálogo de serviços oferecidos pela oficina (preço privado). */
export interface OfficeService {
  id: string;
  officeId: OfficeId;
  name: string;
  catalogKey?: string;
  category?: ServiceCategory;
  description?: string;
  price?: number;
  durationMinutes?: number;
  active: boolean;
  custom: boolean;
  createdBy?: UserId;
  updatedBy?: UserId;
  createdAt?: string;
  updatedAt?: string;
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
  lastAccessAt?: string;
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
  lastAccessAt?: string;
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
  whatsapp?: string;
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

/** @deprecated Prefer VebookUser + OfficeMembership. */
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
  createdBy?: UserId;
  updatedBy?: UserId;
  createdAt: string;
  updatedAt?: string;
}

export interface OfficeVehicle {
  id: string;
  officeId: OfficeId;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  chassis?: string;
  renavam?: string;
  clientId: string;
  currentMileageKm: number;
  createdBy?: UserId;
  updatedBy?: UserId;
  createdAt: string;
  updatedAt?: string;
}

/** Produto do catálogo global VEBOOK (compartilhado entre oficinas). */
export interface GlobalProduct {
  id: string;
  name: string;
  brand: string;
  code: string;
  category: string;
  application?: string;
  /** Chave normalizada para reduzir duplicatas. */
  normalizedKey: string;
  createdAt: string;
  createdByUserId?: UserId;
}

/** Dados privados da oficina sobre um produto global (custo/preço/fornecedor). */
export interface OfficeProductContext {
  id: string;
  officeId: OfficeId;
  productId: string;
  defaultCost?: number;
  defaultPrice?: number;
  supplier?: string;
  stockQty?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserId;
  updatedBy?: UserId;
}

export interface WorkOrderServiceLine {
  id: string;
  category: ServiceCategory;
  description: string;
  laborAmount: number;
  quantity: number;
  employeeUserId?: UserId;
  officeServiceId?: string;
}

export interface WorkOrderProductLine {
  id: string;
  productId: string;
  origin: ProductOrigin;
  quantity: number;
  unitCost: number;
  /** Valor cobrado do cliente. Origem "cliente" normalmente 0. */
  unitPrice: number;
  supplier?: string;
  notes?: string;
}

export interface OfficeWorkOrder {
  id: string;
  officeId: OfficeId;
  date: string;
  clientId: string;
  vehicleId: string;
  mileageKm: number;
  status: WorkOrderStatus;
  notes?: string;
  services: WorkOrderServiceLine[];
  products: WorkOrderProductLine[];
  laborTotal: number;
  /** Receita de produtos (exclui origem cliente e preço zero). */
  productsRevenue: number;
  productsCost: number;
  /** Total faturado (mão de obra + produtos cobrados). */
  amount: number;
  amountReceived: number;
  paymentStatus: PaymentStatus;
  returnDueDate?: string;
  returnReason?: ReturnReason;
  returnNotes?: string;
  createdBy: UserId;
  updatedBy: UserId;
  createdAt: string;
  updatedAt: string;
  /** @deprecated Compatibilidade com seed/leituras antigas. */
  serviceId?: string;
}

export interface OfficeAppointment {
  id: string;
  officeId: OfficeId;
  clientId: string;
  vehicleId: string;
  serviceId?: string;
  serviceLabel?: string;
  employeeUserId?: UserId;
  startsAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdBy?: UserId;
  updatedBy?: UserId;
  createdAt: string;
  updatedAt?: string;
}

/** Retorno derivado do prazo registrado no atendimento (não é menu independente). */
export interface OfficeReturn {
  id: string;
  officeId: OfficeId;
  clientId: string;
  vehicleId: string;
  serviceId?: string;
  serviceLabel?: string;
  lastServiceDate: string;
  dueDate: string;
  reason?: ReturnReason;
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
  version: 3;
  nextOfficeSeq: number;
  users: VebookUser[];
  memberships: OfficeMembership[];
  offices: Office[];
  hostnames: OfficeHostname[];
  clients: OfficeClient[];
  vehicles: OfficeVehicle[];
  services: OfficeService[];
  globalProducts: GlobalProduct[];
  officeProductContexts: OfficeProductContext[];
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
  /** @deprecated Prefer account. */
  access?: AccountDraft;
  termsAccepted: boolean;
  skipAccount?: boolean;
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  manutencao_preventiva: 'Manutenção preventiva',
  reparo: 'Reparo',
  troca_de_peca: 'Troca de peça',
};

export const PRODUCT_ORIGIN_LABELS: Record<ProductOrigin, string> = {
  estoque: 'Estoque da oficina',
  comprado_atendimento: 'Comprado para este atendimento',
  cliente: 'Fornecido pelo cliente',
  garantia_terceiro: 'Garantia / terceiro',
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  troca_oleo: 'Troca de óleo',
  revisao: 'Revisão',
  inspecao: 'Inspeção',
  outro: 'Outro',
};

/** Receita de produto: origem cliente ou preço zero não contam como venda. */
export function isProductRevenue(line: WorkOrderProductLine): boolean {
  if (line.origin === 'cliente') return false;
  if (line.unitPrice <= 0) return false;
  return true;
}

export function computeWorkOrderTotals(input: {
  services: WorkOrderServiceLine[];
  products: WorkOrderProductLine[];
}): { laborTotal: number; productsRevenue: number; productsCost: number; amount: number } {
  const laborTotal = input.services.reduce((sum, line) => sum + line.laborAmount * line.quantity, 0);
  const productsRevenue = input.products.reduce((sum, line) => {
    if (!isProductRevenue(line)) return sum;
    return sum + line.unitPrice * line.quantity;
  }, 0);
  const productsCost = input.products.reduce((sum, line) => {
    if (line.origin === 'cliente') return sum;
    return sum + line.unitCost * line.quantity;
  }, 0);
  return { laborTotal, productsRevenue, productsCost, amount: laborTotal + productsRevenue };
}
