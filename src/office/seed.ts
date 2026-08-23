import { defaultOfficeHours, SERVICE_CATALOG } from './constants';
import {
  AuditEvent,
  Office,
  OfficeAppointment,
  OfficeCertificate,
  OfficeClient,
  OfficeEcosystemState,
  OfficeHostname,
  OfficeMembership,
  OfficeReturn,
  OfficeService,
  OfficeVehicle,
  OfficeWorkOrder,
  VebookUser,
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

const VEHICLE_DEFS: Array<{ plate: string; brand: string; model: string; year: number; km: number; owner: number }> = [
  { plate: 'BRA2E19', brand: 'Toyota', model: 'Corolla', year: 2023, km: 48320, owner: 0 },
  { plate: 'ABC1D23', brand: 'Jeep', model: 'Compass', year: 2022, km: 31200, owner: 1 },
  { plate: 'XYZ9K88', brand: 'Volkswagen', model: 'T-Cross', year: 2021, km: 54110, owner: 2 },
  { plate: 'QWE4R56', brand: 'Honda', model: 'Civic', year: 2020, km: 67890, owner: 3 },
  { plate: 'RTY8U12', brand: 'Chevrolet', model: 'Onix', year: 2024, km: 12340, owner: 4 },
  { plate: 'UIO3P90', brand: 'Fiat', model: 'Argo', year: 2021, km: 40120, owner: 5 },
  { plate: 'ASD7F34', brand: 'Hyundai', model: 'HB20', year: 2019, km: 89000, owner: 6 },
  { plate: 'FGH2J67', brand: 'Renault', model: 'Kwid', year: 2023, km: 22100, owner: 7 },
  { plate: 'JKL5M01', brand: 'Nissan', model: 'Kicks', year: 2022, km: 30550, owner: 8 },
  { plate: 'ZXC6V78', brand: 'Ford', model: 'Ka', year: 2018, km: 102300, owner: 9 },
  { plate: 'VBN1C45', brand: 'Toyota', model: 'Yaris', year: 2021, km: 38900, owner: 10 },
  { plate: 'NML9K22', brand: 'Volkswagen', model: 'Polo', year: 2020, km: 61200, owner: 11 },
  { plate: 'POI8U33', brand: 'Honda', model: 'Fit', year: 2017, km: 118400, owner: 12 },
  { plate: 'LKJ4H76', brand: 'Chevrolet', model: 'Tracker', year: 2023, km: 18770, owner: 13 },
  { plate: 'MNB5G11', brand: 'Jeep', model: 'Renegade', year: 2021, km: 45210, owner: 14 },
  { plate: 'GHJ6T88', brand: 'Fiat', model: 'Pulse', year: 2024, km: 9800, owner: 0 },
  { plate: 'TYU7I21', brand: 'Hyundai', model: 'Creta', year: 2022, km: 27450, owner: 3 },
  { plate: 'WER3E54', brand: 'Toyota', model: 'Hilux', year: 2019, km: 98010, owner: 4 },
  { plate: 'SDF1A09', brand: 'Volkswagen', model: 'Nivus', year: 2023, km: 15600, owner: 8 },
  { plate: 'CVB2S60', brand: 'Honda', model: 'HR-V', year: 2020, km: 54320, owner: 11 },
];

function servicesFor(officeId: string, prefix: string, prices: number[]): OfficeService[] {
  return SERVICE_CATALOG.slice(0, 10).map((item, index) => ({
    id: `${prefix}-svc-${item.key}`,
    officeId,
    name: item.name,
    catalogKey: item.key,
    description: `${item.name} com registro no histórico do veículo.`,
    price: prices[index] ?? 180 + index * 40,
    durationMinutes: [40, 90, 120, 60, 45, 90, 80, 70, 50, 150][index],
    active: true,
    custom: false,
  }));
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

  const norteServices = servicesFor(norteId, 'norte', [189, 420, 380, 160, 90, 350, 280, 310, 150, 490]);
  const sulServices = servicesFor(sulId, 'sul', [170, 390, 350, 150, 80, 320, 250, 290, 140, 450]);

  const clients: OfficeClient[] = CLIENT_NAMES.map((name, index) => ({
    id: `cli_norte_${pad(index + 1, 3)}`,
    officeId: norteId,
    name,
    cpf: cpfFromIndex(100 + index),
    phone: `(11) 9${String(80000000 + index).slice(-8)}`,
    whatsapp: `(11) 9${String(80000000 + index).slice(-8)}`,
    email: `${name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${index + 1}@email.com`,
    createdAt: isoDaysAgo(200 - index * 8),
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
    createdAt: isoDaysAgo(90 - index * 7),
  }));

  const vehicles: OfficeVehicle[] = VEHICLE_DEFS.map((item, index) => ({
    id: `veh_norte_${pad(index + 1, 3)}`,
    officeId: norteId,
    plate: item.plate,
    brand: item.brand,
    model: item.model,
    year: item.year,
    clientId: clients[item.owner].id,
    currentMileageKm: item.km,
    createdAt: isoDaysAgo(180 - index * 4),
  }));

  const sulVehicles: OfficeVehicle[] = [
    { plate: 'SUL1A23', brand: 'Volkswagen', model: 'Golf', year: 2018, km: 112000, owner: 0 },
    { plate: 'SUL2B45', brand: 'BMW', model: '320i', year: 2016, km: 98000, owner: 1 },
    { plate: 'SUL3C67', brand: 'Audi', model: 'A3', year: 2019, km: 67000, owner: 2 },
    { plate: 'SUL4D89', brand: 'Mercedes-Benz', model: 'C180', year: 2015, km: 140200, owner: 3 },
    { plate: 'SUL5E01', brand: 'Volkswagen', model: 'Jetta', year: 2021, km: 41000, owner: 4 },
    { plate: 'SUL6F12', brand: 'Porsche', model: 'Macan', year: 2020, km: 35500, owner: 0 },
  ].map((item, index) => ({
    id: `veh_sul_${pad(index + 1, 3)}`,
    officeId: sulId,
    plate: item.plate,
    brand: item.brand,
    model: item.model,
    year: item.year,
    clientId: sulClients[item.owner].id,
    currentMileageKm: item.km,
    createdAt: isoDaysAgo(70 - index * 5),
  }));

  const statuses: OfficeWorkOrder['status'][] = ['concluido', 'concluido', 'concluido', 'em_andamento', 'aberto', 'cancelado'];
  const workOrders: OfficeWorkOrder[] = Array.from({ length: 50 }, (_, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const service = norteServices[index % norteServices.length];
    const daysAgo = index < 3 ? index : index < 10 ? index + 1 : index * 3;
    return {
      id: `os_norte_${pad(index + 1, 3)}`,
      officeId: norteId,
      date: isoDaysAgo(daysAgo, 9 + (index % 7)),
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      serviceId: service.id,
      mileageKm: Math.max(1000, vehicle.currentMileageKm - index * 180),
      amount: (service.price ?? 200) + (index % 5) * 25,
      status: statuses[index % statuses.length],
      notes: index % 7 === 0 ? 'Cliente solicitou registro no histórico VEBOOK.' : undefined,
      createdAt: isoDaysAgo(daysAgo, 8),
    };
  });

  const sulOrders: OfficeWorkOrder[] = Array.from({ length: 12 }, (_, index) => {
    const vehicle = sulVehicles[index % sulVehicles.length];
    const service = sulServices[index % sulServices.length];
    return {
      id: `os_sul_${pad(index + 1, 3)}`,
      officeId: sulId,
      date: isoDaysAgo(index * 4 + 1, 10),
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      serviceId: service.id,
      mileageKm: vehicle.currentMileageKm - index * 120,
      amount: (service.price ?? 180) + index * 15,
      status: statuses[index % statuses.length],
      createdAt: isoDaysAgo(index * 4 + 1, 9),
    };
  });

  const appointments: OfficeAppointment[] = [
    { offset: 0, hour: 9, status: 'confirmado' as const },
    { offset: 0, hour: 11, status: 'agendado' as const },
    { offset: 0, hour: 14, status: 'em_atendimento' as const },
    { offset: 1, hour: 10, status: 'agendado' as const },
    { offset: 2, hour: 8, status: 'confirmado' as const },
    { offset: 3, hour: 15, status: 'agendado' as const },
    { offset: 5, hour: 9, status: 'agendado' as const },
    { offset: -2, hour: 16, status: 'concluido' as const },
    { offset: -1, hour: 13, status: 'nao_compareceu' as const },
    { offset: 8, hour: 10, status: 'agendado' as const },
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
      startsAt: starts.toISOString(),
      status: item.status,
      createdAt: NOW,
    };
  });

  const sulAppointments: OfficeAppointment[] = sulVehicles.slice(0, 4).map((vehicle, index) => {
    const starts = new Date('2026-08-23T00:00:00.000Z');
    starts.setUTCDate(starts.getUTCDate() + index);
    starts.setUTCHours(10 + index, 0, 0, 0);
    return {
      id: `agd_sul_${pad(index + 1, 3)}`,
      officeId: sulId,
      clientId: vehicle.clientId,
      vehicleId: vehicle.id,
      serviceId: sulServices[index].id,
      startsAt: starts.toISOString(),
      status: 'agendado' as const,
      createdAt: NOW,
    };
  });

  const returns: OfficeReturn[] = workOrders
    .filter((item) => item.status === 'concluido')
    .slice(0, 12)
    .map((item, index) => {
      const last = new Date(item.date);
      const due = new Date(last);
      due.setMonth(due.getMonth() + 6);
      return {
        id: `ret_norte_${pad(index + 1, 3)}`,
        officeId: norteId,
        clientId: item.clientId,
        vehicleId: item.vehicleId,
        serviceId: item.serviceId,
        lastServiceDate: item.date,
        dueDate: due.toISOString(),
        workOrderId: item.id,
        createdAt: item.date,
      };
    });

  const sulReturns: OfficeReturn[] = sulOrders
    .filter((item) => item.status === 'concluido')
    .slice(0, 4)
    .map((item, index) => {
      const due = new Date(item.date);
      due.setMonth(due.getMonth() + 6);
      return {
        id: `ret_sul_${pad(index + 1, 3)}`,
        officeId: sulId,
        clientId: item.clientId,
        vehicleId: item.vehicleId,
        serviceId: item.serviceId,
        lastServiceDate: item.date,
        dueDate: due.toISOString(),
        workOrderId: item.id,
        createdAt: item.date,
      };
    });

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
  ];

  return {
    version: 2,
    nextOfficeSeq: 3,
    users,
    memberships,
    offices: [norte, sul],
    hostnames,
    clients: [...clients, ...sulClients],
    vehicles: [...vehicles, ...sulVehicles],
    services: [...norteServices, ...sulServices],
    workOrders: [...workOrders, ...sulOrders],
    appointments: [...appointments, ...sulAppointments],
    returns: [...returns, ...sulReturns],
    certificates: [...certificates, ...sulCertificates],
    audit,
  };
}

export const DEMO_LOGIN_HINT = 'demonstracao';
