/**
 * VEBOOK - Tipos do Modelo Conceitual e Operacional Expandido
 */

/** Visões da aplicação (navegação institucional). */
export type AppView =
  | 'home'
  | 'diario'
  | 'como-funciona'
  | 'certidao'
  | 'oficinas'
  | 'cadastro-oficina'
  | 'painel-oficina'
  | 'site-oficina'
  | 'validacao'
  | 'validar-certidao'
  | 'transparencia';

export type ValidationStatus = 'validado' | 'aguardando' | 'contestado' | 'sem_validacao';

export type ServiceCategory = 
  | 'Troca de Óleo e Filtros'
  | 'Sistema de Freios'
  | 'Suspensão e Direção'
  | 'Motor e Transmissão'
  | 'Arrefecimento'
  | 'Injeção e Ignição'
  | 'Elétrica e Eletrônica'
  | 'Revisão Preventiva'
  | 'Pneus e Geometria'
  | 'Outros Serviços';

export interface ProductItem {
  id: string;
  category: string;
  brand: string;
  commercialName: string;
  specification?: string;
  quantity: number;
  unit: string;
  productCode?: string;
}

export interface ContestationDetail {
  contestedAt: string;
  reason: 'produto_divergente' | 'quantidade_incorreta' | 'km_incorreta' | 'servico_nao_realizado' | 'outro';
  reasonLabel: string;
  comment: string;
  maskedClientIdentifier: string; // Ex: J* S*** (CPF: 35*******)
  /** Status operacional da contestação (rastreabilidade pública na Certidão). */
  status?: 'aberta' | 'em_analise' | 'respondida' | 'encerrada';
  respondedAt?: string;
}

/** Retificação auditável — nunca sobrescreve o valor anterior em silêncio. */
export interface ServiceRectification {
  id: string;
  rectifiedAt: string;
  field: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
  note?: string;
}

export interface ServiceRecord {
  id: string;
  vehiclePlate: string;
  /** Data do serviço realizado (fato no veículo). */
  serviceDate: string;
  /**
   * Data/hora em que o registro entrou no VEBOOK.
   * Distinto de serviceDate — rastreabilidade da Certidão.
   */
  recordedAt: string;
  mileageKm: number;
  serviceType: ServiceCategory;
  description: string;
  laborDetails?: string;
  observations?: string;
  workshopId: string;
  workshopName: string;
  workshopCity: string;
  workshopState: string;
  internalOsNumber?: string;
  /** Responsável pelo atendimento na oficina (quando informado). */
  responsibleName?: string;
  products: ProductItem[];
  validationStatus: ValidationStatus;
  validatedAt?: string;
  maskedValidatorName?: string;
  contestation?: ContestationDetail;
  rectifications?: ServiceRectification[];
}

/**
 * Camada CONSULTA GRATUITA — somente o que foi feito (sem produtos, PII ou auditoria).
 * Gerada por projeção; nunca “esconder via CSS” campos da Certidão.
 */
export interface PublicHistoryItem {
  id: string;
  serviceDate: string;
  serviceType: string;
  mileageKm: number;
  workshopName: string;
  workshopCity: string;
  workshopState: string;
}

/** Resumo público de contestação na Certidão (sem conteúdo privado). */
export interface CertificateContestationSummary {
  exists: boolean;
  statusLabel: string;
  contestedAt?: string;
  respondedAt?: string;
}

/**
 * Camada CERTIDÃO — histórico completo + rastreabilidade permitida.
 */
export interface CertificateHistoryEntry {
  id: string;
  serviceDate: string;
  recordedAt: string;
  mileageKm: number;
  serviceType: string;
  description: string;
  laborDetails?: string;
  observations?: string;
  workshopName: string;
  workshopCity: string;
  workshopState: string;
  responsibleName?: string;
  products: ProductItem[];
  validationStatus: ValidationStatus;
  validatedAt?: string;
  rectifications: ServiceRectification[];
  contestation: CertificateContestationSummary;
}

export interface PublicVehicleIdentity {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearFabrication: number;
  yearModel: number;
  color: string;
  fuel: string;
  chassisMasked?: string;
  currentMileageKm: number;
}

export interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearFabrication: number;
  yearModel: number;
  color: string;
  fuel: string;
  chassisMasked?: string;
  currentMileageKm: number;
  totalServicesCount: number;
  validatedServicesCount: number;
  contestedServicesCount: number;
  pendingServicesCount: number;
  withoutValidationCount: number;
  identifiedProductsCount: number;
  identifiedBrandsCount: number;
  participatingWorkshopsCount: number;
  firstRegisteredDate: string;
  lastServiceDate: string;
}

export interface WorkshopServiceItem {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  detailedDescription?: string;
  estimatedTime?: string;
  warrantyPeriod?: string;
  tags?: string[];
  featured?: boolean;
}

export interface WorkshopSocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface WorkshopHoursDetail {
  weekdays: string;
  saturday: string;
  sunday: string;
  notes?: string;
}

export interface Workshop {
  id: string;
  name: string;
  subdomain: string; // Ex: prisma.vebook.com.br
  logoUrl?: string;
  slogan?: string;
  /** Cor de personalização da página pública (hex, ex.: `#F59E0B`). */
  themeColor: string;
  coverImageUrl?: string;
  city: string;
  state: string;
  address: string;
  neighborhood?: string;
  zipCode?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  businessHours: string;
  businessHoursDetail?: WorkshopHoursDetail;
  socialLinks?: WorkshopSocialLinks;
  specialties: string[];
  servicesList?: WorkshopServiceItem[];
  aboutHistory?: string;
  infrastructure?: string[];
  totalServicesRegistered: number;
  validationRate: number; // Porcentagem de serviços validados pelos clientes
  certifiedSince: string;
  description: string;
  credentialStatus?: 'credenciada' | 'verificada' | 'parceira_premium';
}

/**
 * ECOSSISTEMA DE OFICINAS — cadastro, assinatura, painel e isolamento por office_id
 */

export type OfficeStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired';

export type PlanModality = 'monthly' | 'annual';

export type OfficeUserRole = 'owner' | 'staff';

/** Função operacional do membro da equipe (distinta de role de autenticação). */
export type TeamJobRole = 'owner' | 'manager' | 'attendant' | 'mechanic' | 'custom';

export type TeamMemberStatus = 'active' | 'inactive';

/** Módulos do painel para permissões granulares. */
export type PanelModule =
  | 'inicio'
  | 'atendimentos'
  | 'agenda'
  | 'clientes'
  | 'veiculos'
  | 'servicos'
  | 'produtos'
  | 'financeiro'
  | 'minha-oficina'
  | 'perfil'
  | 'configuracoes';

export type ModulePermissions = Partial<Record<PanelModule, boolean>>;

export type AttendanceStatus = 'open' | 'completed';

export type ReturnStatus = 'scheduled' | 'done' | 'cancelled';

/** Status operacionais da Agenda (solicitações/agendamentos). */
export type AppointmentStatus =
  | 'requested'
  | 'confirmed'
  | 'reschedule'
  | 'cancelled'
  | 'completed';

export type CatalogStatus = 'active' | 'inactive';

export type PaymentGatewayId = 'mock' | 'unset';

/** Registro operacional da oficina. Estende o perfil público `Workshop`. */
export interface Office extends Workshop {
  officeId: string;
  legalName: string;
  tradeName?: string;
  cnpj?: string;
  street: string;
  streetNumber: string;
  complement?: string;
  status: OfficeStatus;
  publicVisible: boolean;
  slug: string;
  ownerUserId?: string;
  createdAt: string;
  activatedAt?: string;
  segments?: string[];
  source: 'seed' | 'signup';
}

export interface OfficeUser {
  id: string;
  officeId: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: OfficeUserRole;
  /** Função exibida na equipe (gerente, atendente, etc.). */
  jobRole?: TeamJobRole;
  jobTitle?: string;
  status?: TeamMemberStatus;
  permissions?: ModulePermissions;
  createdAt: string;
  passwordResetRequestedAt?: string;
}

export interface OfficeSubscription {
  id: string;
  officeId: string;
  planId: 'vebook-oficina';
  modality: PlanModality;
  year1MonthlyAmount: number;
  year2MonthlyAmount: number;
  contractedAmount: number;
  currentAmount: number;
  currency: 'BRL';
  status: SubscriptionStatus;
  startsAt?: string;
  renewsAt?: string;
  gateway: PaymentGatewayId;
  externalId?: string;
  createdAt: string;
}

export interface OfficePayment {
  id: string;
  officeId: string;
  subscriptionId: string;
  amount: number;
  currency: 'BRL';
  status: PaymentStatus;
  gateway: PaymentGatewayId;
  externalId?: string;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
  webhookReceivedAt?: string;
}

export interface OfficeConsent {
  id: string;
  officeId: string;
  userId: string;
  termsAcceptedAt: string;
  privacyAcceptedAt: string;
  commercialAcceptedAt: string;
  priceChangeAcknowledgedAt: string;
  userAgent: string;
}

export interface OfficeCustomer {
  id: string;
  officeId: string;
  name: string;
  phone?: string;
  /** WhatsApp informado pela oficina, quando distinto do telefone. Uso administrativo interno. */
  whatsapp?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface OfficeVehicleRecord {
  id: string;
  officeId: string;
  customerId?: string;
  plate: string;
  brand?: string;
  model?: string;
  version?: string;
  year?: number;
  mileageKm?: number;
  notes?: string;
  createdAt: string;
}

/** Catálogo de serviços da oficina (não confundir com atendimentos realizados). */
export interface OfficeServiceCatalogItem {
  id: string;
  officeId: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  durationMinutes?: number;
  status: CatalogStatus;
  publicVisible: boolean;
  createdAt: string;
}

/** Catálogo de produtos utilizados pela oficina. */
export interface OfficeProductCatalogItem {
  id: string;
  officeId: string;
  name: string;
  brand?: string;
  category?: string;
  unit: string;
  price: number;
  code?: string;
  status: CatalogStatus;
  createdAt: string;
}

export interface OfficeAttendance {
  id: string;
  officeId: string;
  customerId?: string;
  vehicleId?: string;
  date: string;
  mileageKm?: number;
  notes?: string;
  laborAmount?: number;
  servicesAmount?: number;
  productsAmount?: number;
  totalAmount?: number;
  status: AttendanceStatus;
  createdAt: string;
}

export interface AttendanceServiceLine {
  id: string;
  officeId: string;
  attendanceId: string;
  catalogServiceId?: string;
  title: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  notes?: string;
}

export interface AttendanceProductLine {
  id: string;
  officeId: string;
  attendanceId: string;
  catalogProductId?: string;
  name: string;
  brand?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount?: number;
  notes?: string;
}

export interface OfficeReturn {
  id: string;
  officeId: string;
  vehicleId?: string;
  customerId?: string;
  attendanceId?: string;
  dueDate?: string;
  reason: string;
  /** Serviço de origem do retorno, quando informado. */
  serviceTitle?: string;
  /** Quilometragem prevista para o próximo retorno. */
  nextMileageKm?: number;
  notes?: string;
  status: ReturnStatus;
  createdAt: string;
}

export interface OfficeAppointment {
  id: string;
  officeId: string;
  customerName: string;
  phone: string;
  plate?: string;
  service?: string;
  date?: string;
  period?: string;
  time?: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface OfficeSession {
  userId: string;
  officeId: string;
  expiresAt: number;
}

export interface SignupDraft {
  owner: {
    fullName: string;
    cpf: string;
    phone: string;
    email: string;
    password: string;
  };
  office: {
    legalName: string;
    tradeName: string;
    cnpj: string;
    phone: string;
    whatsapp: string;
    zipCode: string;
    street: string;
    streetNumber: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  slug: string;
  extras: {
    segments: string[];
    instagram: string;
    website: string;
    shortDescription: string;
    /** Cor da página pública (espectro / hex). */
    themeColor: string;
  };
  modality: PlanModality;
}

export interface Certificate {
  id: string;
  validationCode: string;
  qrCodeUrl?: string;
  vehiclePlate: string;
  vehicleModel: string;
  requesterName: string;
  requesterDocumentMasked: string; // Ex: CPF 123.***.***-00
  issuedAt: string;
  historyPeriodStart: string;
  historyPeriodEnd: string;
  totalServices: number;
  validatedCount: number;
  contestedCount: number;
  pendingCount: number;
  workshopsCount: number;
  servicesSnapshot: ServiceRecord[];
}

/**
 * GOVERNANÇA, LGPD, TRANSPARÊNCIA E CONTESTAÇÕES
 */

export type DataCategoryType = 
  | 'dados_pessoais' 
  | 'dados_veiculo' 
  | 'dados_manutencao' 
  | 'dados_operacionais' 
  | 'dados_estatisticos';

export interface DataCategoryDefinition {
  category: DataCategoryType;
  title: string;
  examples: string[];
  legalFramework: string;
  purpose: string;
  accessLevel: 'publico_restrito' | 'apenas_oficina_proprietario' | 'interno_seguranca' | 'estatistico_agregado' | 'titular_protegido';
  retentionRule: string;
}

export type LgpdRequestType = 
  | 'acesso' 
  | 'confirmacao' 
  | 'correcao' 
  | 'exclusao' 
  | 'revogacao' 
  | 'informacao_compartilhamento' 
  | 'portabilidade';

export interface LgpdRequest {
  id: string;
  protocol: string;
  requesterName: string;
  email: string;
  documentMasked: string;
  type: LgpdRequestType;
  details: string;
  status: 'recebido' | 'em_analise' | 'atendido' | 'esclarecimento_necessario';
  createdAt: string;
  estimatedDeadline: string;
}

export type ContestationReason = 
  | 'servico_nao_realizado' 
  | 'km_incorreta' 
  | 'veiculo_incorreto' 
  | 'dado_pessoal_incorreto' 
  | 'peca_produto_divergente' 
  | 'registro_duplicado' 
  | 'outro';

export interface ContestationSubmission {
  id: string;
  protocol: string;
  serviceRecordId: string;
  vehiclePlate: string;
  requesterName: string;
  requesterContact: string;
  reason: ContestationReason;
  detailedDescription: string;
  evidenceNotes?: string;
  status: 'aberta' | 'em_analise' | 'acolhida_corrigida' | 'mantida_justificada';
  createdAt: string;
  /** Prazo de resposta da oficina (SLA institucional). */
  responseDueAt?: string;
  workshopResponse?: string;
  resolvedAt?: string;
  officeId?: string;
}

export interface CookiePreferences {
  essential: boolean; // Sempre true
  performance: boolean;
  functional: boolean;
  advertising: boolean;
  savedAt?: string;
}

export type TransparenciaSection = 
  | 'como-tratamos'
  | 'termos'
  | 'privacidade'
  | 'cookies'
  | 'seguranca'
  | 'direitos-titular'
  | 'regras-historico'
  | 'regras-consulta'
  | 'certidoes'
  | 'regras-oficinas'
  | 'contestações'
  | 'indice-vebook'
  | 'faq'
  | 'minha-privacidade';

/**
 * Índice VEBOOK de Regularidade das Oficinas (0–100).
 * Não é avaliação técnica, satisfação nem ranking comercial.
 */
export type OfficeIndexClassification =
  | 'excelente'
  | 'muito_bom'
  | 'regular'
  | 'atencao'
  | 'baixa_regularidade'
  | 'em_formacao';

export type OfficeIndexRegularityStatus = 'regular' | 'pending';

export interface OfficeIndexCompletenessFlags {
  hasVehicle: boolean;
  hasService: boolean;
  hasDate: boolean;
  hasMileage: boolean;
  hasProductsOrNotes: boolean;
  hasResponsible: boolean;
}

/** Fato agregado de atendimento usado no cálculo oficial do índice. */
export interface OfficeIndexAttendanceFact {
  id: string;
  officeId: string;
  date: string;
  regularityStatus: OfficeIndexRegularityStatus;
  validationStatus: ValidationStatus;
  completeness: OfficeIndexCompletenessFlags;
}

/** Fato de contestação para o pilar de responsabilidade (sem dados de cliente). */
export interface OfficeIndexContestationFact {
  id: string;
  officeId: string;
  attendanceId: string;
  contestedAt: string;
  responseDueAt: string;
  respondedAt?: string;
}

export interface OfficeIndexInput {
  officeId: string;
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
}

export interface OfficeIndexComponents {
  regularity: number;
  validation: number;
  contestationResponsibility: number;
  completeness: number;
}

/** Snapshot oficial persistido/cacheado (equivalente a office_reputation). */
export interface OfficeReputationSnapshot {
  officeId: string;
  score: number;
  classification: OfficeIndexClassification;
  classificationLabel: string;
  inFormation: boolean;
  totalAttendances: number;
  validatedAttendances: number;
  unvalidatedAttendances: number;
  contestedAttendances: number;
  answeredContestations: number;
  unansweredContestations: number;
  averageResponseHours: number | null;
  recordCompleteness: number;
  components: OfficeIndexComponents;
  calculatedAt: string;
}

export type OfficeSearchSort = 'relevance' | 'name' | 'location';

