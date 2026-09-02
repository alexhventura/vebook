/**
 * Textos de entrada e texto institucional do Índice VEBOOK.
 * Sem dados pessoais de clientes — apenas agregados e fatos técnicos.
 */

import type {
  OfficeIndexAttendanceFact,
  OfficeIndexContestationFact,
} from '../types';
import { dueDateFromContestedAt } from '../lib/officeRegularityIndex';

const complete = {
  hasVehicle: true,
  hasService: true,
  hasDate: true,
  hasMileage: true,
  hasProductsOrNotes: true,
  hasResponsible: true,
} as const;

const mostlyComplete = {
  ...complete,
  hasProductsOrNotes: false,
} as const;

const incomplete = {
  hasVehicle: true,
  hasService: true,
  hasDate: true,
  hasMileage: false,
  hasProductsOrNotes: false,
  hasResponsible: false,
} as const;

function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/**
 * Cenário de aceitação (ws-prisma / Auto Center Prisma):
 * ~10 atendimentos, 8 regulares, 2 pendências, 1 contestação ainda no prazo,
 * registros majoritariamente completos → faixa intermediária ~70–85.
 */
function buildPrismaFacts(): {
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
} {
  const officeId = 'ws-prisma';
  const attendances: OfficeIndexAttendanceFact[] = [
    { id: 'att-p-01', officeId, date: daysAgo(20), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...complete } },
    { id: 'att-p-02', officeId, date: daysAgo(35), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...complete } },
    { id: 'att-p-03', officeId, date: daysAgo(48), regularityStatus: 'regular', validationStatus: 'sem_validacao', completeness: { ...complete } },
    { id: 'att-p-04', officeId, date: daysAgo(60), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...mostlyComplete } },
    { id: 'att-p-05', officeId, date: daysAgo(75), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...complete } },
    { id: 'att-p-06', officeId, date: daysAgo(90), regularityStatus: 'regular', validationStatus: 'aguardando', completeness: { ...complete } },
    { id: 'att-p-07', officeId, date: daysAgo(110), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...complete } },
    { id: 'att-p-08', officeId, date: daysAgo(130), regularityStatus: 'regular', validationStatus: 'validado', completeness: { ...mostlyComplete } },
    { id: 'att-p-09', officeId, date: daysAgo(25), regularityStatus: 'pending', validationStatus: 'aguardando', completeness: { ...mostlyComplete } },
    { id: 'att-p-10', officeId, date: daysAgo(12), regularityStatus: 'pending', validationStatus: 'contestado', completeness: { ...incomplete } },
  ];

  const contestedAt = daysAgo(5);
  const contestations: OfficeIndexContestationFact[] = [
    {
      id: 'ctx-p-01',
      officeId,
      attendanceId: 'att-p-10',
      contestedAt,
      responseDueAt: dueDateFromContestedAt(contestedAt),
      // ainda dentro do prazo — NÃO deve reduzir o índice
    },
  ];

  return { attendances, contestations };
}

/** Oficina madura com alto volume e boa regularidade. */
function buildPaulistaFacts(): {
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
} {
  const officeId = 'ws-01';
  const attendances: OfficeIndexAttendanceFact[] = Array.from({ length: 48 }, (_, i) => {
    const pending = i === 7 || i === 22;
    const noVal = i % 9 === 0;
    return {
      id: `att-pa-${i + 1}`,
      officeId,
      date: daysAgo(10 + i * 12),
      regularityStatus: pending ? 'pending' : 'regular',
      validationStatus: pending ? 'aguardando' : noVal ? 'sem_validacao' : 'validado',
      completeness: i % 11 === 0 ? { ...mostlyComplete } : { ...complete },
    } as OfficeIndexAttendanceFact;
  });

  const c1 = daysAgo(40);
  const c2 = daysAgo(200);
  const contestations: OfficeIndexContestationFact[] = [
    {
      id: 'ctx-pa-01',
      officeId,
      attendanceId: 'att-pa-8',
      contestedAt: c1,
      responseDueAt: dueDateFromContestedAt(c1),
      respondedAt: daysAgo(36),
    },
    {
      id: 'ctx-pa-02',
      officeId,
      attendanceId: 'att-pa-23',
      contestedAt: c2,
      responseDueAt: dueDateFromContestedAt(c2),
      respondedAt: daysAgo(195),
    },
  ];

  return { attendances, contestations };
}

/** Oficina com volume médio e boa prática. */
function buildWs02Facts(): {
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
} {
  const officeId = 'ws-02';
  const attendances: OfficeIndexAttendanceFact[] = Array.from({ length: 22 }, (_, i) => ({
    id: `att-02-${i + 1}`,
    officeId,
    date: daysAgo(8 + i * 18),
    regularityStatus: i === 3 ? 'pending' : 'regular',
    validationStatus: i % 5 === 0 ? 'sem_validacao' : 'validado',
    completeness: { ...complete },
  }));
  return { attendances, contestations: [] };
}

/** Oficina com contestações sem resposta e pendências — índice mais baixo. */
function buildWs03Facts(): {
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
} {
  const officeId = 'ws-03';
  const attendances: OfficeIndexAttendanceFact[] = Array.from({ length: 16 }, (_, i) => ({
    id: `att-03-${i + 1}`,
    officeId,
    date: daysAgo(5 + i * 20),
    regularityStatus: i % 4 === 0 ? 'pending' : 'regular',
    validationStatus: i % 3 === 0 ? 'contestado' : i % 2 === 0 ? 'sem_validacao' : 'validado',
    completeness: i % 3 === 0 ? { ...incomplete } : { ...mostlyComplete },
  }));

  const older = daysAgo(45);
  const older2 = daysAgo(70);
  const older3 = daysAgo(95);
  const contestations: OfficeIndexContestationFact[] = [
    {
      id: 'ctx-03-01',
      officeId,
      attendanceId: 'att-03-1',
      contestedAt: older,
      responseDueAt: dueDateFromContestedAt(older),
      // sem resposta, prazo expirado
    },
    {
      id: 'ctx-03-02',
      officeId,
      attendanceId: 'att-03-4',
      contestedAt: older2,
      responseDueAt: dueDateFromContestedAt(older2),
    },
    {
      id: 'ctx-03-03',
      officeId,
      attendanceId: 'att-03-7',
      contestedAt: older3,
      responseDueAt: dueDateFromContestedAt(older3),
    },
  ];

  return { attendances, contestations };
}

/** Oficina nova — índice em formação. */
function buildWs04Facts(): {
  attendances: OfficeIndexAttendanceFact[];
  contestations: OfficeIndexContestationFact[];
} {
  const officeId = 'ws-04';
  const attendances: OfficeIndexAttendanceFact[] = [
    {
      id: 'att-04-1',
      officeId,
      date: daysAgo(14),
      regularityStatus: 'regular',
      validationStatus: 'validado',
      completeness: { ...complete },
    },
    {
      id: 'att-04-2',
      officeId,
      date: daysAgo(28),
      regularityStatus: 'regular',
      validationStatus: 'sem_validacao',
      completeness: { ...complete },
    },
    {
      id: 'att-04-3',
      officeId,
      date: daysAgo(40),
      regularityStatus: 'regular',
      validationStatus: 'validado',
      completeness: { ...mostlyComplete },
    },
  ];
  return { attendances, contestations: [] };
}

export const OFFICE_INDEX_SEED: Record<
  string,
  { attendances: OfficeIndexAttendanceFact[]; contestations: OfficeIndexContestationFact[] }
> = {
  'ws-prisma': buildPrismaFacts(),
  'ws-01': buildPaulistaFacts(),
  'ws-02': buildWs02Facts(),
  'ws-03': buildWs03Facts(),
  'ws-04': buildWs04Facts(),
};

export const OFFICE_INDEX_EXPLAINER = {
  title: 'O que é o Índice VEBOOK?',
  summary:
    'O Índice VEBOOK representa a regularidade da oficina no uso da plataforma, considerando aspectos como registros realizados, validações, contestações e cumprimento das responsabilidades de atendimento.',
  disclaimer:
    'Ele não representa uma avaliação técnica dos serviços mecânicos realizados pela oficina.',
  howWeCalculateLabel: 'Como calculamos este índice',
  pillars: [
    {
      id: 'regularidade',
      title: 'Regularidade',
      text: 'Como a oficina mantém seus registros e responsabilidades em dia.',
    },
    {
      id: 'validacao',
      title: 'Validação',
      text: 'Como os registros são confirmados pelos clientes. Atendimento sem validação não significa, por si só, atendimento irregular.',
    },
    {
      id: 'contestacoes',
      title: 'Contestações',
      text: 'Como a oficina responde às solicitações relacionadas aos registros. Uma contestação, por si só, não reduz o índice.',
    },
    {
      id: 'completude',
      title: 'Completude',
      text: 'Como a qualidade documental dos registros contribui para a confiabilidade do histórico.',
    },
  ],
  principles: [
    'Uma contestação, por si só, não reduz o índice.',
    'Uma contestação respondida dentro do prazo não gera penalização.',
    'Um atendimento sem validação não significa necessariamente um atendimento irregular.',
    'Pequenas ocorrências não eliminam a reputação construída ao longo do tempo.',
    'A reputação pode ser recuperada com regularidade contínua.',
    'O índice é informativo — não bloqueia automaticamente a oficina.',
  ],
} as const;
