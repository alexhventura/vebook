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
  | 'site-oficina'
  | 'validacao'
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
}

export interface ServiceRecord {
  id: string;
  vehiclePlate: string;
  serviceDate: string;
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
  products: ProductItem[];
  validationStatus: ValidationStatus;
  validatedAt?: string;
  maskedValidatorName?: string; // Ex: J* S*** (CPF: 35*******)
  contestation?: ContestationDetail;
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
  themeColor: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
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
  workshopResponse?: string;
  resolvedAt?: string;
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
  | 'faq'
  | 'minha-privacidade';

