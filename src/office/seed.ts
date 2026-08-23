import { defaultOfficeHours, SERVICE_CATALOG } from './constants';
import { productNormalizedKey } from './products';
import {
  AuditEvent,
  computeWorkOrderTotals,
  GlobalProduct,
  Office,
  OfficeAppointment,
  OfficeCertificate,
  OfficeClient,
  OfficeEcosystemState,
  OfficeHostname,
  OfficeMembership,
  OfficeProductContext,
  OfficeReturn,
  OfficeService,
  OfficeVehicle,
  OfficeWorkOrder,
  PaymentStatus,
  ReturnReason,
  ServiceCategory,
  VebookUser,
  WorkOrderProductLine,
  WorkOrderServiceLine,
  WorkOrderStatus,
} from './types';
import { demoFingerprint, formatCpf } from './validation';

const DEMO_SECRET = 'demonstracao';
const NOW = '2026-08-23T10:00:00.000Z';

function pad(n: number, size = 6): string {
  return String(n).padStart(size, '0');
}

function cpfFromIndex(n: number): string {
  const base = String(100000000 + n).slice(-9);
  const calc = (digits: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * (factorStart - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calc(base, 10);
  const d2 = calc(base + d1, 11);
  return formatCpf(`${base}${d1}${d2}`);
}

function cnpjFromIndex(n: number): string {
  const base = `${String(10000000 + n).slice(-8)}0001`;
  const calc = (digits: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = calc(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(base + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const raw = `${base}${d1}${d2}`;
  return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function isoDaysAgo(days: number, hour = 10): string {
  const date = new Date('2026-08-23T00:00:00.000Z');
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 15, 0, 0);
  return date.toISOString();
}

const CATALOG_CATEGORY: Record<string, ServiceCategory> = {
  oleo: 'manutencao_preventiva',
  revisao: 'manutencao_preventiva',
  alinhamento: 'manutencao_preventiva',
  balanceamento: 'manutencao_preventiva',
  pneus: 'manutencao_preventiva',
  freios: 'troca_de_peca',
  suspensao: 'troca_de_peca',
  embreagem: 'troca_de_peca',
  injecao: 'reparo',
  eletrica: 'reparo',
  ar: 'reparo',
  diagnostico: 'reparo',
  motor: 'reparo',
  cambio: 'reparo',
  outros: 'reparo',
};

const CLIENT_NAMES = [
  'João Carlos da Silva',
  'Maria Aparecida Ferreira',
  'Carlos Eduardo Nogueira',
  'Ana Paula Mendes',
  'Ricardo Alves Pinto',
  'Fernanda Costa Lima',
  'Bruno Henrique Souza',
  'Patrícia Gomes Rocha',
  'Lucas Martins Oliveira',
  'Juliana Barbosa Reis',
  'Pedro Henrique Duarte',
  'Camila Santos Teixeira',
  'Rafael Moura Cardoso',
  'Beatriz Almeida Pires',
  'Gustavo Farias Melo',
];

const VEHICLE_DEFS: Array<{ plate: string; brand: string; model: string; year: number; km: number; owner: number; color: string }> = [
  { plate: 'BRA2E19', brand: 'Toyota', model: 'Corolla', year: 2023, km: 48320, owner: 0, color: 'Prata' },
  { plate: 'ABC1D23', brand: 'Jeep', model: 'Compass', year: 2022, km: 31200, owner: 1, color: 'Branco' },
  { plate: 'XYZ9K88', brand: 'Volkswagen', model: 'T-Cross', year: 2021, km: 54110, owner: 2, color: 'Preto' },
  { plate: 'QWE4R56', brand: 'Honda', model: 'Civic', year: 2020, km: 67890, owner: 3, color: 'Vermelho' },
  { plate: 'RTY8U12', brand: 'Chevrolet', model: 'Onix', year: 2024, km: 12340, owner: 4, color: 'Azul' },
  { plate: 'UIO3P90', brand: 'Fiat', model: 'Argo', year: 2021, km: 40120, owner: 5, color: 'Cinza' },
  { plate: 'ASD7F34', brand: 'Hyundai', model: 'HB20', year: 2019, km: 89000, owner: 6, color: 'Branco' },
  { plate: 'FGH2J67', brand: 'Renault', model: 'Kwid', year: 2023, km: 22100, owner: 7, color: 'Verde' },
  { plate: 'JKL5M01', brand: 'Nissan', model: 'Kicks', year: 2022, km: 30550, owner: 8, color: 'Bege' },
  { plate: 'ZXC6V78', brand: 'Ford', model: 'Ka', year: 2018, km: 102300, owner: 9, color: 'Prata' },
  { plate: 'VBN1C45', brand: 'Toyota', model: 'Yaris', year: 2021, km: 38900, owner: 10, color: 'Grafite' },
  { plate: 'NML9K22', brand: 'Volkswagen', model: 'Polo', year: 2020, km: 61200, owner: 11, color: 'Preto' },
  { plate: 'POI8U33', brand: 'Honda', model: 'Fit', year: 2017, km: 118400, owner: 12, color: 'Branco' },
  { plate: 'LKJ4H76', brand: 'Chevrolet', model: 'Tracker', year: 2023, km: 18770, owner: 13, color: 'Vermelho' },
  { plate: 'MNB5G11', brand: 'Jeep', model: 'Renegade', year: 2021, km: 45210, owner: 14, color: 'Azul' },
  { plate: 'GHJ6T88', brand: 'Fiat', model: 'Pulse', year: 2024, km: 9800, owner: 0, color: 'Cinza' },
  { plate: 'TYU7I21', brand: 'Hyundai', model: 'Creta', year: 2022, km: 27450, owner: 3, color: 'Marrom' },
  { plate: 'WER3E54', brand: 'Toyota', model: 'Hilux', year: 2019, km: 98010, owner: 4, color: 'Branco' },
  { plate: 'SDF1A09', brand: 'Volkswagen', model: 'Nivus', year: 2023, km: 15600, owner: 8, color: 'Prata' },
  { plate: 'CVB2S60', brand: 'Honda', model: 'HR-V', year: 2020, km: 54320, owner: 11, color: 'Preto' },
];

const GLOBAL_PRODUCT_DEFS: Array<{
  id: string;
  name: string;
  brand: string;
  code: string;
  category: string;
  application?: string;
}> = [
  { id: 'gprod_001', name: 'Amortecedor Dianteiro', brand: 'Cofap', code: 'GP32310', category: 'Suspensão', application: 'Linha compacta' },
  { id: 'gprod_002', name: 'Amortecedor Dianteiro', brand: 'Monroe', code: 'G7473', category: 'Suspensão', application: 'Sedã médio' },
  { id: 'gprod_003', name: 'Amortecedor Dianteiro', brand: 'Nakata', code: 'HG31109', category: 'Suspensão', application: 'Hatch' },
  { id: 'gprod_004', name: 'Amortecedor Traseiro', brand: 'Cofap', code: 'GP32311', category: 'Suspensão', application: 'Linha compacta' },
  { id: 'gprod_005', name: 'Amortecedor Traseiro', brand: 'Monroe', code: 'G7474', category: 'Suspensão', application: 'Sedã médio' },
  { id: 'gprod_006', name: 'Amortecedor Traseiro', brand: 'Nakata', code: 'HG31110', category: 'Suspensão', application: 'Hatch' },
  { id: 'gprod_007', name: 'Óleo Motor 5W30 Sintético', brand: 'Mobil', code: 'MOB5W30', category: 'Lubrificantes', application: 'Motor flex' },
  { id: 'gprod_008', name: 'Filtro de Óleo', brand: 'Tecfil', code: 'PSL55', category: 'Filtros' },
  { id: 'gprod_009', name: 'Pastilha de Freio Dianteira', brand: 'Fras-le', code: 'PD87', category: 'Freios' },
  { id: 'gprod_010', name: 'Filtro de Ar', brand: 'Mann', code: 'C25114', category: 'Filtros' },
  { id: 'gprod_011', name: 'Velas de Ignição', brand: 'NGK', code: 'BKR6E', category: 'Ignição' },
  { id: 'gprod_012', name: 'Correia Dentada', brand: 'Gates', code: '5471XS', category: 'Motor' },
  { id: 'gprod_013', name: 'Fluido de Freio DOT4', brand: 'Bosch', code: 'BF403', category: 'Freios' },
  { id: 'gprod_014', name: 'Disco de Freio', brand: 'Fremax', code: 'BD5430', category: 'Freios' },
];

function servicesFor(
  officeId: string,
  prefix: string,
  prices: number[],
  createdBy: string,
  createdAt: string,
): OfficeService[] {
  return SERVICE_CATALOG.map((item, index) => ({
    id: `${prefix}-svc-${item.key}`,
    officeId,
    name: item.name,
    catalogKey: item.key,
    category: CATALOG_CATEGORY[item.key] ?? 'reparo',
    description: `${item.name} com registro no histórico do veículo.`,
    price: prices[index] ?? 180 + index * 25,
    durationMinutes: [40, 90, 120, 60, 45, 90, 80, 70, 50, 150, 180, 120, 100, 60, 45][index] ?? 60,
    active: true,
    custom: false,
    createdBy,
    updatedBy: createdBy,
    createdAt,
    updatedAt: createdAt,
  }));
}

function paymentFor(
  status: WorkOrderStatus,
  amount: number,
  index: number,
): { paymentStatus: PaymentStatus; amountReceived: number } {
  if (status === 'cancelado') return { paymentStatus: 'cancelado', amountReceived: 0 };
  if (status === 'aberto') return { paymentStatus: 'pendente', amountReceived: 0 };
  if (status === 'em_andamento') {
    return index % 2 === 0
      ? { paymentStatus: 'parcial', amountReceived: Math.round(amount * 0.45) }
      : { paymentStatus: 'pendente', amountReceived: 0 };
  }
  if (index % 7 === 0) return { paymentStatus: 'parcial', amountReceived: Math.round(amount * 0.65) };
  return { paymentStatus: 'recebido', amountReceived: amount };
}

function buildServiceLines(
  index: number,
  officeServices: OfficeService[],
  prefix: string,
  employeeUserId: string,
): WorkOrderServiceLine[] {
  const primary = officeServices[index % officeServices.length];
  const category = CATALOG_CATEGORY[primary.catalogKey ?? 'outros'] ?? 'reparo';
  const lines: WorkOrderServiceLine[] = [
    {
      id: `${prefix}-wos-${index}-1`,
      category,
      description: primary.name,
      laborAmount: primary.price ?? 200,
      quantity: 1,
      employeeUserId,
      officeServiceId: primary.id,
    },
  ];
  if (index % 4 === 0) {
    const secondary = officeServices[(index + 5) % officeServices.length];
    lines.push({
      id: `${prefix}-wos-${index}-2`,
      category: CATALOG_CATEGORY[secondary.catalogKey ?? 'outros'] ?? 'reparo',
      description: secondary.name,
      laborAmount: Math.round((secondary.price ?? 150) * 0.75),
      quantity: 1,
      employeeUserId: DEMO_USERS.joao.id,
      officeServiceId: secondary.id,
    });
  }
  return lines;
}

function buildProductLines(
  index: number,
  officeId: string,
  prefix: string,
  norteId: string,
): WorkOrderProductLine[] {
  const products: WorkOrderProductLine[] = [];
  const isNorte = officeId === norteId;

  if (index % 2 === 0) {
    products.push({
      id: `${prefix}-wop-${index}-oleo`,
      productId: 'gprod_007',
      origin: 'estoque',
      quantity: index % 3 === 0 ? 2 : 1,
      unitCost: isNorte ? 38 : 42,
      unitPrice: isNorte ? 78 : 85,
    });
    products.push({
      id: `${prefix}-wop-${index}-filtro`,
      productId: 'gprod_008',
      origin: 'estoque',
      quantity: 1,
      unitCost: isNorte ? 18 : 21,
      unitPrice: isNorte ? 42 : 48,
    });
  }

  if (index % 5 === 0) {
    products.push({
      id: `${prefix}-wop-${index}-cliente`,
      productId: 'gprod_011',
      origin: 'cliente',
      quantity: 4,
      unitCost: 0,
      unitPrice: 0,
      notes: 'Cliente trouxe as velas de ignição.',
    });
  }

  if (index % 3 === 1) {
    const shockId = ['gprod_001', 'gprod_002', 'gprod_003'][index % 3];
    products.push({
      id: `${prefix}-wop-${index}-amort`,
      productId: shockId,
      origin: 'comprado_atendimento',
      quantity: 2,
      unitCost: isNorte ? 180 : 195,
      unitPrice: isNorte ? 320 : 340,
      supplier: isNorte ? 'Autopeças Tucuruvi' : 'Distribuidora Vila Mariana',
    });
  }

  if (index % 4 === 2) {
    products.push({
      id: `${prefix}-wop-${index}-pastilha`,
      productId: 'gprod_009',
      origin: 'estoque',
      quantity: 1,
      unitCost: isNorte ? 95 : 102,
      unitPrice: isNorte ? 185 : 198,
    });
  }

  if (index % 7 === 0) {
    products.push({
      id: `${prefix}-wop-${index}-garantia`,
      productId: 'gprod_009',
      origin: 'garantia_terceiro',
      quantity: 1,
      unitCost: 0,
      unitPrice: 0,
      notes: 'Substituição em garantia do fabricante.',
    });
  }

  if (index % 6 === 1) {
    products.push({
      id: `${prefix}-wop-${index}-comprado`,
      productId: 'gprod_010',
      origin: 'comprado_atendimento',
      quantity: 1,
      unitCost: isNorte ? 45 : 52,
      unitPrice: isNorte ? 98 : 108,
      supplier: 'Filtros Express',
    });
  }

  return products;
}

function buildWorkOrder(params: {
  id: string;
  officeId: string;
  date: string;
  clientId: string;
  vehicleId: string;
  mileageKm: number;
  status: WorkOrderStatus;
  services: WorkOrderServiceLine[];
  products: WorkOrderProductLine[];
  paymentStatus: PaymentStatus;
  amountReceived: number;
  returnDueDate?: string;
  returnReason?: ReturnReason;
  returnNotes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  serviceId?: string;
  notes?: string;
}): OfficeWorkOrder {
  const totals = computeWorkOrderTotals({ services: params.services, products: params.products });
  return {
    id: params.id,
    officeId: params.officeId,
    date: params.date,
    clientId: params.clientId,
    vehicleId: params.vehicleId,
    mileageKm: params.mileageKm,
    status: params.status,
    notes: params.notes,
    services: params.services,
    products: params.products,
    laborTotal: totals.laborTotal,
    productsRevenue: totals.productsRevenue,
    productsCost: totals.productsCost,
    amount: totals.amount,
    amountReceived: params.amountReceived,
    paymentStatus: params.paymentStatus,
    returnDueDate: params.returnDueDate,
    returnReason: params.returnReason,
    returnNotes: params.returnNotes,
    createdBy: params.createdBy,
    updatedBy: params.updatedBy,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    serviceId: params.serviceId,
  };
}

/** CPFs fictícios de demonstração (dígitos válidos). */
export const DEMO_USERS = {
  carlos: {
    id: 'usr_carlos',
    name: 'Carlos Almeida',
    cpf: cpfFromIndex(301),
    email: 'carlos.almeida@vebook.exemplo',
    phone: '(11) 99111-2200',
  },
  maria: {
    id: 'usr_maria',
    name: 'Maria Souza',
    cpf: cpfFromIndex(302),
    email: 'maria.souza@vebook.exemplo',
    phone: '(11) 99222-3300',
  },
  joao: {
    id: 'usr_joao',
    name: 'João Pereira',
    cpf: cpfFromIndex(303),
    email: 'joao.pereira@vebook.exemplo',
    phone: '(11) 99333-4400',
  },
} as const;

export const DEMO_LOGIN_HINT = 'demonstracao';

export function createSeedState(): OfficeEcosystemState {
  const norteId = 'office_000001';
  const sulId = 'office_000002';
  const fingerprint = demoFingerprint(DEMO_SECRET);

  const norte: Office = {
    id: norteId,
    legalName: 'Auto Center Norte Ltda',
    tradeName: 'Auto Center Norte',
    cnpj: cnpjFromIndex(1),
    responsibleName: DEMO_USERS.carlos.name,
    responsibleCpf: DEMO_USERS.carlos.cpf,
    email: 'atendimento@autocenternorte.exemplo',
    phone: '(11) 99145-3300',
    secondaryPhone: '(11) 4002-8922',
    address: {
      zipCode: '02345-000',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Santana',
      street: 'Av. Tucuruvi',
      number: '900',
    },
    identity: {
      publicName: 'Auto Center Norte',
      slogan: 'Mecânica geral com histórico VEBOOK.',
      description:
        'Mecânica geral, suspensão e injeção eletrônica. Cada serviço registrado no histórico permanente do veículo.',
      foundedYear: 2014,
    },
    hours: defaultOfficeHours(),
    acceptsOnlineBooking: true,
    minAdvanceHours: 4,
    slotIntervalMinutes: 30,
    currentHostname: 'norte',
    createdAt: '2023-01-15T12:00:00.000Z',
    publishedAt: '2023-01-15T12:00:00.000Z',
  };

  const sul: Office = {
    id: sulId,
    legalName: 'Oficina Sul Mecânica Ltda',
    tradeName: 'Oficina Sul',
    cnpj: cnpjFromIndex(2),
    responsibleName: DEMO_USERS.carlos.name,
    responsibleCpf: DEMO_USERS.carlos.cpf,
    email: 'contato@oficinasul.exemplo',
    phone: '(11) 98765-4321',
    address: {
      zipCode: '04101-000',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Vila Mariana',
      street: 'Rua Domingos de Morais',
      number: '1200',
    },
    identity: {
      publicName: 'Oficina Sul',
      slogan: 'Manutenção que você pode confiar',
      description: 'Atendimento técnico em freios, suspensão e troca de óleo, com registro no VEBOOK.',
      foundedYear: 2008,
    },
    hours: defaultOfficeHours(),
    acceptsOnlineBooking: true,
    minAdvanceHours: 2,
    slotIntervalMinutes: 45,
    currentHostname: 'sul',
    createdAt: '2024-03-10T12:00:00.000Z',
    publishedAt: '2024-03-10T12:00:00.000Z',
  };

  const hostnames: OfficeHostname[] = [
    {
      officeId: norteId,
      hostname: 'norte',
      status: 'active',
      isCurrent: true,
      createdAt: norte.createdAt,
    },
    {
      officeId: sulId,
      hostname: 'sul',
      status: 'active',
      isCurrent: true,
      createdAt: sul.createdAt,
    },
    {
      officeId: sulId,
      hostname: 'oficina-sul',
      status: 'retired',
      isCurrent: false,
      createdAt: '2024-03-10T12:00:00.000Z',
      retiredAt: '2024-06-01T12:00:00.000Z',
      redirectTo: 'sul',
    },
  ];

  const users: VebookUser[] = [
    {
      id: DEMO_USERS.carlos.id,
      name: DEMO_USERS.carlos.name,
      cpf: DEMO_USERS.carlos.cpf,
      email: DEMO_USERS.carlos.email,
      phone: DEMO_USERS.carlos.phone,
      passwordFingerprint: fingerprint,
      lastOfficeId: norteId,
      createdAt: norte.createdAt,
    },
    {
      id: DEMO_USERS.maria.id,
      name: DEMO_USERS.maria.name,
      cpf: DEMO_USERS.maria.cpf,
      email: DEMO_USERS.maria.email,
      phone: DEMO_USERS.maria.phone,
      passwordFingerprint: fingerprint,
      lastOfficeId: norteId,
      createdAt: '2024-05-01T12:00:00.000Z',
    },
    {
      id: DEMO_USERS.joao.id,
      name: DEMO_USERS.joao.name,
      cpf: DEMO_USERS.joao.cpf,
      email: DEMO_USERS.joao.email,
      phone: DEMO_USERS.joao.phone,
      passwordFingerprint: fingerprint,
      lastOfficeId: norteId,
      createdAt: '2024-08-01T12:00:00.000Z',
    },
  ];

  const memberships: OfficeMembership[] = [
    {
      id: 'mem_carlos_norte',
      userId: DEMO_USERS.carlos.id,
      officeId: norteId,
      role: 'OWNER',
      active: true,
      createdAt: norte.createdAt,
    },
    {
      id: 'mem_carlos_sul',
      userId: DEMO_USERS.carlos.id,
      officeId: sulId,
      role: 'OWNER',
      active: true,
      createdAt: sul.createdAt,
    },
    {
      id: 'mem_maria_norte',
      userId: DEMO_USERS.maria.id,
      officeId: norteId,
      role: 'MANAGER',
      active: true,
      createdAt: '2024-05-01T12:00:00.000Z',
    },
    {
      id: 'mem_joao_norte',
      userId: DEMO_USERS.joao.id,
      officeId: norteId,
      role: 'EMPLOYEE',
      active: true,
      createdAt: '2024-08-01T12:00:00.000Z',
    },
  ];

  const norteServices = servicesFor(
    norteId,
    'norte',
    [189, 420, 380, 160, 90, 350, 280, 310, 150, 490, 890, 650, 420, 380, 120],
    DEMO_USERS.carlos.id,
    norte.createdAt,
  );
  const sulServices = servicesFor(
    sulId,
    'sul',
    [170, 390, 350, 150, 80, 320, 250, 290, 140, 450, 820, 600, 390, 350, 110],
    DEMO_USERS.carlos.id,
    sul.createdAt,
  );

  const globalProducts: GlobalProduct[] = GLOBAL_PRODUCT_DEFS.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    code: item.code,
    category: item.category,
    application: item.application,
    normalizedKey: productNormalizedKey(item.name, item.brand, item.code),
    createdAt: norte.createdAt,
    createdByUserId: DEMO_USERS.carlos.id,
  }));

  const officeProductContexts: OfficeProductContext[] = [
  // Norte — custos e preços privados
    {
      id: 'opc_norte_001',
      officeId: norteId,
      productId: 'gprod_001',
      defaultCost: 180,
      defaultPrice: 320,
      supplier: 'Autopeças Tucuruvi',
      stockQty: 4,
      createdAt: norte.createdAt,
      updatedAt: norte.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_norte_002',
      officeId: norteId,
      productId: 'gprod_002',
      defaultCost: 210,
      defaultPrice: 365,
      supplier: 'Monroe Distribuidora',
      stockQty: 2,
      createdAt: norte.createdAt,
      updatedAt: norte.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_norte_003',
      officeId: norteId,
      productId: 'gprod_007',
      defaultCost: 38,
      defaultPrice: 78,
      supplier: 'Lubrificantes SP',
      stockQty: 24,
      createdAt: norte.createdAt,
      updatedAt: isoDaysAgo(5),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.maria.id,
    },
    {
      id: 'opc_norte_004',
      officeId: norteId,
      productId: 'gprod_008',
      defaultCost: 18,
      defaultPrice: 42,
      supplier: 'Tecfil Norte',
      stockQty: 18,
      createdAt: norte.createdAt,
      updatedAt: isoDaysAgo(3),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.maria.id,
    },
    {
      id: 'opc_norte_005',
      officeId: norteId,
      productId: 'gprod_009',
      defaultCost: 95,
      defaultPrice: 185,
      supplier: 'Fras-le Atacado',
      stockQty: 8,
      createdAt: norte.createdAt,
      updatedAt: isoDaysAgo(10),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.maria.id,
    },
    {
      id: 'opc_norte_006',
      officeId: norteId,
      productId: 'gprod_004',
      defaultCost: 165,
      defaultPrice: 295,
      supplier: 'Autopeças Tucuruvi',
      stockQty: 3,
      createdAt: norte.createdAt,
      updatedAt: norte.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_norte_007',
      officeId: norteId,
      productId: 'gprod_010',
      defaultCost: 45,
      defaultPrice: 98,
      supplier: 'Mann Filter',
      stockQty: 12,
      createdAt: isoDaysAgo(60),
      updatedAt: isoDaysAgo(8),
      createdBy: DEMO_USERS.maria.id,
      updatedBy: DEMO_USERS.maria.id,
    },
    // Sul — custos diferentes para agregação de mercado
    {
      id: 'opc_sul_001',
      officeId: sulId,
      productId: 'gprod_001',
      defaultCost: 195,
      defaultPrice: 340,
      supplier: 'Distribuidora Vila Mariana',
      stockQty: 3,
      createdAt: sul.createdAt,
      updatedAt: sul.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_002',
      officeId: sulId,
      productId: 'gprod_003',
      defaultCost: 188,
      defaultPrice: 328,
      supplier: 'Nakata Sul',
      stockQty: 2,
      createdAt: sul.createdAt,
      updatedAt: sul.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_003',
      officeId: sulId,
      productId: 'gprod_007',
      defaultCost: 42,
      defaultPrice: 85,
      supplier: 'Lubrificantes Sul',
      stockQty: 16,
      createdAt: sul.createdAt,
      updatedAt: isoDaysAgo(4),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_004',
      officeId: sulId,
      productId: 'gprod_008',
      defaultCost: 21,
      defaultPrice: 48,
      supplier: 'Tecfil Sul',
      stockQty: 10,
      createdAt: sul.createdAt,
      updatedAt: isoDaysAgo(6),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_005',
      officeId: sulId,
      productId: 'gprod_009',
      defaultCost: 102,
      defaultPrice: 198,
      supplier: 'Fras-le Premium',
      stockQty: 6,
      createdAt: sul.createdAt,
      updatedAt: isoDaysAgo(12),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_006',
      officeId: sulId,
      productId: 'gprod_005',
      defaultCost: 198,
      defaultPrice: 348,
      supplier: 'Monroe Sul',
      stockQty: 2,
      createdAt: sul.createdAt,
      updatedAt: sul.createdAt,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
    {
      id: 'opc_sul_007',
      officeId: sulId,
      productId: 'gprod_010',
      defaultCost: 52,
      defaultPrice: 108,
      supplier: 'Mann Filter Sul',
      stockQty: 8,
      createdAt: isoDaysAgo(45),
      updatedAt: isoDaysAgo(7),
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
    },
  ];

  const clients: OfficeClient[] = CLIENT_NAMES.map((name, index) => ({
    id: `cli_norte_${pad(index + 1, 3)}`,
    officeId: norteId,
    name,
    cpf: cpfFromIndex(100 + index),
    phone: `(11) 9${String(80000000 + index).slice(-8)}`,
    whatsapp: `(11) 9${String(80000000 + index).slice(-8)}`,
    email: `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${index + 1}@email.com`,
    createdBy: DEMO_USERS.maria.id,
    updatedBy: DEMO_USERS.maria.id,
    createdAt: isoDaysAgo(200 - index * 8),
    updatedAt: isoDaysAgo(200 - index * 8),
  }));

  const sulClients: OfficeClient[] = [
    'Helga Schmidt',
    'Otto Barbosa',
    'Liesel Rocha',
    'Klaus Ferreira',
    'Ingrid Nunes',
  ].map((name, index) => ({
    id: `cli_sul_${pad(index + 1, 3)}`,
    officeId: sulId,
    name,
    cpf: cpfFromIndex(200 + index),
    phone: `(11) 9${String(70000000 + index).slice(-8)}`,
    email: `cliente${index + 1}@oficinasul.exemplo`,
    createdBy: DEMO_USERS.carlos.id,
    updatedBy: DEMO_USERS.carlos.id,
    createdAt: isoDaysAgo(90 - index * 7),
    updatedAt: isoDaysAgo(90 - index * 7),
  }));

  const vehicles: OfficeVehicle[] = VEHICLE_DEFS.map((item, index) => ({
    id: `veh_norte_${pad(index + 1, 3)}`,
    officeId: norteId,
    plate: item.plate,
    brand: item.brand,
    model: item.model,
    year: item.year,
    color: item.color,
    clientId: clients[item.owner].id,
    currentMileageKm: item.km,
    createdBy: DEMO_USERS.maria.id,
    updatedBy: DEMO_USERS.maria.id,
    createdAt: isoDaysAgo(180 - index * 4),
    updatedAt: isoDaysAgo(180 - index * 4),
  }));

  const sulVehicles: OfficeVehicle[] = [
    { plate: 'SUL1A23', brand: 'Toyota', model: 'Corolla', year: 2020, km: 72000, owner: 0, color: 'Prata' },
    { plate: 'SUL2B45', brand: 'Honda', model: 'Civic', year: 2019, km: 88000, owner: 1, color: 'Preto' },
    { plate: 'SUL3C67', brand: 'Volkswagen', model: 'Golf', year: 2018, km: 112000, owner: 2, color: 'Branco' },
    { plate: 'SUL4D89', brand: 'Chevrolet', model: 'Onix', year: 2023, km: 22000, owner: 3, color: 'Vermelho' },
    { plate: 'SUL5E01', brand: 'Volkswagen', model: 'Jetta', year: 2021, km: 41000, owner: 4, color: 'Azul' },
    { plate: 'SUL6F12', brand: 'Jeep', model: 'Compass', year: 2022, km: 35500, owner: 0, color: 'Cinza' },
    { plate: 'SUL7G34', brand: 'Hyundai', model: 'HB20', year: 2020, km: 54000, owner: 1, color: 'Grafite' },
  ].map((item, index) => ({
    id: `veh_sul_${pad(index + 1, 3)}`,
    officeId: sulId,
    plate: item.plate,
    brand: item.brand,
    model: item.model,
    year: item.year,
    color: item.color,
    clientId: sulClients[item.owner].id,
    currentMileageKm: item.km,
    createdBy: DEMO_USERS.carlos.id,
    updatedBy: DEMO_USERS.carlos.id,
    createdAt: isoDaysAgo(70 - index * 5),
    updatedAt: isoDaysAgo(70 - index * 5),
  }));

  const statuses: WorkOrderStatus[] = ['concluido', 'concluido', 'concluido', 'em_andamento', 'aberto', 'cancelado'];
  const returnReasons: ReturnReason[] = ['troca_oleo', 'revisao', 'inspecao', 'outro'];

  const norteOrderCount = 34;
  const workOrders: OfficeWorkOrder[] = Array.from({ length: norteOrderCount }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const primaryService = norteServices[index % norteServices.length];
    const daysAgo = index < 3 ? index : index < 10 ? index + 1 : index * 3;
    const date = isoDaysAgo(daysAgo, 9 + (index % 7));
    const createdAt = isoDaysAgo(daysAgo, 8);
    const status = statuses[index % statuses.length];
    const services = buildServiceLines(
      index,
      norteServices,
      'norte',
      index % 3 === 0 ? DEMO_USERS.joao.id : DEMO_USERS.maria.id,
    );
    const products = buildProductLines(index, norteId, 'norte', norteId);
    const totals = computeWorkOrderTotals({ services, products });
    const payment = paymentFor(status, totals.amount, index);

    let returnDueDate: string | undefined;
    let returnReason: ReturnReason | undefined;
    let returnNotes: string | undefined;
    if (status === 'concluido' && index % 3 !== 2) {
      const due = new Date(date);
      due.setUTCMonth(due.getUTCMonth() + (index % 4 === 0 ? 3 : 6));
      returnDueDate = due.toISOString();
      returnReason = returnReasons[index % returnReasons.length];
      returnNotes = index % 2 === 0 ? 'Retorno sugerido conforme fabricante.' : undefined;
    }

    return buildWorkOrder({
      id: `os_norte_${pad(index + 1, 3)}`,
      officeId: norteId,
      date,
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      mileageKm: Math.max(1000, vehicle.currentMileageKm - index * 180),
      status,
      services,
      products,
      ...payment,
      returnDueDate,
      returnReason,
      returnNotes,
      createdBy: index % 5 === 0 ? DEMO_USERS.carlos.id : DEMO_USERS.maria.id,
      updatedBy: index % 4 === 0 ? DEMO_USERS.joao.id : DEMO_USERS.maria.id,
      createdAt,
      updatedAt: date,
      serviceId: primaryService.id,
      notes: index % 7 === 0 ? 'Cliente solicitou registro no histórico VEBOOK.' : undefined,
    });
  });

  const sulOrderCount = 13;
  const sulOrders: OfficeWorkOrder[] = Array.from({ length: sulOrderCount }, (_, index) => {
    const vehicle = sulVehicles[index % sulVehicles.length];
    const primaryService = sulServices[index % sulServices.length];
    const daysAgo = index * 4 + 1;
    const date = isoDaysAgo(daysAgo, 10 + (index % 5));
    const createdAt = isoDaysAgo(daysAgo, 9);
    const status = statuses[index % statuses.length];
    const services = buildServiceLines(
      index + 10,
      sulServices,
      'sul',
      DEMO_USERS.carlos.id,
    );
    const products = buildProductLines(index + 10, sulId, 'sul', norteId);
    const totals = computeWorkOrderTotals({ services, products });
    const payment = paymentFor(status, totals.amount, index);

    let returnDueDate: string | undefined;
    let returnReason: ReturnReason | undefined;
    if (status === 'concluido' && index % 2 === 0) {
      const due = new Date(date);
      due.setUTCMonth(due.getUTCMonth() + 4);
      returnDueDate = due.toISOString();
      returnReason = returnReasons[(index + 1) % returnReasons.length];
    }

    return buildWorkOrder({
      id: `os_sul_${pad(index + 1, 3)}`,
      officeId: sulId,
      date,
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      mileageKm: Math.max(1000, vehicle.currentMileageKm - index * 120),
      status,
      services,
      products,
      ...payment,
      returnDueDate,
      returnReason,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
      createdAt,
      updatedAt: date,
      serviceId: primaryService.id,
      notes: index % 4 === 0 ? 'Veículo importado — peças específicas.' : undefined,
    });
  });

  const allWorkOrders = [...workOrders, ...sulOrders];

  const appointments: OfficeAppointment[] = [
    { offset: 0, hour: 9, status: 'confirmado' as const, employee: DEMO_USERS.joao.id },
    { offset: 0, hour: 11, status: 'agendado' as const, employee: DEMO_USERS.maria.id },
    { offset: 0, hour: 14, status: 'em_atendimento' as const, employee: DEMO_USERS.joao.id },
    { offset: 1, hour: 10, status: 'agendado' as const, employee: DEMO_USERS.joao.id },
    { offset: 2, hour: 8, status: 'confirmado' as const, employee: DEMO_USERS.maria.id },
    { offset: 3, hour: 15, status: 'agendado' as const, employee: DEMO_USERS.joao.id },
    { offset: 5, hour: 9, status: 'agendado' as const, employee: DEMO_USERS.maria.id },
    { offset: -2, hour: 16, status: 'concluido' as const, employee: DEMO_USERS.joao.id },
    { offset: -1, hour: 13, status: 'nao_compareceu' as const, employee: DEMO_USERS.maria.id },
    { offset: 8, hour: 10, status: 'agendado' as const, employee: DEMO_USERS.joao.id },
  ].map((item, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const starts = new Date('2026-08-23T00:00:00.000Z');
    starts.setUTCDate(starts.getUTCDate() + item.offset);
    starts.setUTCHours(item.hour, 0, 0, 0);
    return {
      id: `agd_norte_${pad(index + 1, 3)}`,
      officeId: norteId,
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      serviceId: norteServices[index % norteServices.length].id,
      employeeUserId: item.employee,
      startsAt: starts.toISOString(),
      status: item.status,
      createdBy: DEMO_USERS.maria.id,
      updatedBy: DEMO_USERS.maria.id,
      createdAt: NOW,
      updatedAt: NOW,
    };
  });

  const sulAppointments: OfficeAppointment[] = [
    { offset: 0, hour: 10, employee: DEMO_USERS.carlos.id },
    { offset: 1, hour: 11, employee: DEMO_USERS.carlos.id },
    { offset: 2, hour: 14, employee: DEMO_USERS.carlos.id },
    { offset: 4, hour: 9, employee: DEMO_USERS.carlos.id },
    { offset: 6, hour: 15, employee: DEMO_USERS.carlos.id },
  ].map((item, index) => {
    const vehicle = sulVehicles[index % sulVehicles.length];
    const starts = new Date('2026-08-23T00:00:00.000Z');
    starts.setUTCDate(starts.getUTCDate() + item.offset);
    starts.setUTCHours(item.hour, 0, 0, 0);
    return {
      id: `agd_sul_${pad(index + 1, 3)}`,
      officeId: sulId,
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      serviceId: sulServices[index % sulServices.length].id,
      employeeUserId: item.employee,
      startsAt: starts.toISOString(),
      status: 'agendado' as const,
      createdBy: DEMO_USERS.carlos.id,
      updatedBy: DEMO_USERS.carlos.id,
      createdAt: NOW,
      updatedAt: NOW,
    };
  });

  const returns: OfficeReturn[] = allWorkOrders
    .filter((order) => order.returnDueDate)
    .map((order, index) => ({
      id: `ret_${order.officeId === norteId ? 'norte' : 'sul'}_${pad(index + 1, 3)}`,
      officeId: order.officeId,
      clientId: order.clientId,
      vehicleId: order.vehicleId,
      serviceId: order.serviceId,
      serviceLabel: order.services[0]?.description,
      lastServiceDate: order.date,
      dueDate: order.returnDueDate!,
      reason: order.returnReason,
      workOrderId: order.id,
      createdAt: order.date,
    }));

  const certificates: OfficeCertificate[] = vehicles.slice(0, 8).map((vehicle, index) => ({
    id: `crt_norte_${pad(index + 1, 3)}`,
    officeId: norteId,
    code: `VBK-2026-${vehicle.plate}-${8000 + index}`,
    vehicleId: vehicle.id,
    issuedAt: isoDaysAgo(index * 9, 14),
    requesterName: clients.find((c) => c.id === vehicle.clientId)?.name ?? 'Solicitante',
    status: index % 3 === 0 ? 'verificada' : 'emitida',
  }));

  const sulCertificates: OfficeCertificate[] = sulVehicles.slice(0, 3).map((vehicle, index) => ({
    id: `crt_sul_${pad(index + 1, 3)}`,
    officeId: sulId,
    code: `VBK-2026-${vehicle.plate}-${9000 + index}`,
    vehicleId: vehicle.id,
    issuedAt: isoDaysAgo(12 + index * 5, 15),
    requesterName: sulClients.find((c) => c.id === vehicle.clientId)?.name ?? 'Solicitante',
    status: 'emitida' as const,
  }));

  const audit: AuditEvent[] = [
    {
      id: 'aud_001',
      officeId: norteId,
      actorUserId: DEMO_USERS.carlos.id,
      action: 'login',
      entity: 'session',
      createdAt: isoDaysAgo(0, 8),
    },
    {
      id: 'aud_002',
      officeId: norteId,
      actorUserId: DEMO_USERS.carlos.id,
      action: 'work_order_created',
      entity: 'work_order',
      entityId: workOrders[0].id,
      createdAt: workOrders[0].createdAt,
    },
    {
      id: 'aud_003',
      officeId: norteId,
      actorUserId: DEMO_USERS.maria.id,
      action: 'product_linked',
      entity: 'product',
      entityId: 'gprod_007',
      createdAt: isoDaysAgo(5),
    },
    {
      id: 'aud_004',
      officeId: sulId,
      actorUserId: DEMO_USERS.carlos.id,
      action: 'work_order_created',
      entity: 'work_order',
      entityId: sulOrders[0].id,
      createdAt: sulOrders[0].createdAt,
    },
    {
      id: 'aud_005',
      officeId: norteId,
      actorUserId: DEMO_USERS.joao.id,
      action: 'appointment_created',
      entity: 'appointment',
      entityId: appointments[0].id,
      createdAt: NOW,
    },
  ];

  return {
    version: 3,
    nextOfficeSeq: 3,
    users,
    memberships,
    offices: [norte, sul],
    hostnames,
    clients: [...clients, ...sulClients],
    vehicles: [...vehicles, ...sulVehicles],
    services: [...norteServices, ...sulServices],
    globalProducts,
    officeProductContexts,
    workOrders: allWorkOrders,
    appointments: [...appointments, ...sulAppointments],
    returns,
    certificates: [...certificates, ...sulCertificates],
    audit,
  };
}
