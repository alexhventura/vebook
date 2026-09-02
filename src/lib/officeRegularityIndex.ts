/**
 * Índice VEBOOK de Regularidade das Oficinas
 *
 * Camada centralizada de regra de negócio (pura). O frontend apenas apresenta
 * o resultado oficial — a pontuação não é inventada nos componentes React.
 */

import type {
  OfficeIndexAttendanceFact,
  OfficeIndexClassification,
  OfficeIndexComponents,
  OfficeIndexContestationFact,
  OfficeIndexInput,
  OfficeReputationSnapshot,
} from '../types';

/** Volume mínimo para exibir classificação definitiva (não “em formação”). */
export const OFFICE_INDEX_MIN_ATTENDANCES = 8;

/** Pseudocontagens Bayesianas — protege oficinas novas contra distorção. */
export const OFFICE_INDEX_SMOOTHING_K = 18;

/** Prior neutro-institucional (antes de haver histórico suficiente). */
export const OFFICE_INDEX_PRIOR_SCORE = 72;

/** Prazo padrão de resposta a contestação (dias). */
export const CONTESTATION_RESPONSE_DAYS = 15;

export const OFFICE_INDEX_WEIGHTS = {
  regularity: 0.3,
  validation: 0.25,
  contestationResponsibility: 0.25,
  completeness: 0.2,
} as const;

export const OFFICE_INDEX_CLASSIFICATION_BANDS: {
  min: number;
  max: number;
  id: OfficeIndexClassification;
  label: string;
}[] = [
  { min: 90, max: 100, id: 'excelente', label: 'Excelente' },
  { min: 80, max: 89, id: 'muito_bom', label: 'Muito bom' },
  { min: 70, max: 79, id: 'regular', label: 'Regular' },
  { min: 60, max: 69, id: 'atencao', label: 'Atenção' },
  { min: 0, max: 59, id: 'baixa_regularidade', label: 'Baixa regularidade' },
];

const MS_DAY = 86_400_000;

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function monthsBetween(fromIso: string, to: Date): number {
  const from = new Date(fromIso);
  if (Number.isNaN(from.getTime())) return 0;
  const ms = Math.max(0, to.getTime() - from.getTime());
  return ms / (MS_DAY * 30.4375);
}

/** Decaimento temporal: histórico antigo pesa menos. */
export function temporalWeight(eventDateIso: string, asOf: Date = new Date()): number {
  const months = monthsBetween(eventDateIso, asOf);
  if (months <= 12) return 1;
  if (months <= 24) return 0.6;
  if (months <= 36) return 0.3;
  return 0.1;
}

export function classifyOfficeIndex(
  score: number,
  inFormation: boolean,
): { id: OfficeIndexClassification; label: string } {
  if (inFormation) {
    return { id: 'em_formacao', label: 'Índice VEBOOK em formação' };
  }
  const band =
    OFFICE_INDEX_CLASSIFICATION_BANDS.find((b) => score >= b.min && score <= b.max) ||
    OFFICE_INDEX_CLASSIFICATION_BANDS[OFFICE_INDEX_CLASSIFICATION_BANDS.length - 1];
  return { id: band.id, label: band.label };
}

function weightedMean(pairs: { value: number; weight: number }[]): number {
  let sumW = 0;
  let sum = 0;
  for (const p of pairs) {
    if (p.weight <= 0) continue;
    sumW += p.weight;
    sum += p.value * p.weight;
  }
  if (sumW <= 0) return OFFICE_INDEX_PRIOR_SCORE;
  return sum / sumW;
}

/**
 * Regularidade (30%): registros em dia vs pendências, com reincidência progressiva.
 */
function scoreRegularity(facts: OfficeIndexAttendanceFact[], asOf: Date): number {
  if (facts.length === 0) return OFFICE_INDEX_PRIOR_SCORE;

  let pendingWeight = 0;
  let totalWeight = 0;
  let recentPendingCount = 0;

  for (const f of facts) {
    const w = temporalWeight(f.date, asOf);
    totalWeight += w;
    if (f.regularityStatus === 'pending') {
      pendingWeight += w;
      if (w >= 0.6) recentPendingCount += 1;
    }
  }

  if (totalWeight <= 0) return OFFICE_INDEX_PRIOR_SCORE;

  const pendingRatio = pendingWeight / totalWeight;
  // Reincidência: a partir do 2º pendente recente, o impacto cresce.
  const recurrenceFactor = 1 + Math.max(0, recentPendingCount - 1) * 0.35;
  const penalty = pendingRatio * 55 * recurrenceFactor;
  return clamp(100 - penalty);
}

/**
 * Validação (25%): validado é positivo; sem validação / aguardando ≈ neutro (não é erro).
 */
function scoreValidation(facts: OfficeIndexAttendanceFact[], asOf: Date): number {
  if (facts.length === 0) return OFFICE_INDEX_PRIOR_SCORE;

  const pairs = facts.map((f) => {
    const w = temporalWeight(f.date, asOf);
    let value = 95; // sem_validacao / aguardando — impacto mínimo
    if (f.validationStatus === 'validado') value = 100;
    else if (f.validationStatus === 'contestado') value = 90; // impacto principal no pilar de contestação
    return { value, weight: w };
  });

  return clamp(weightedMean(pairs));
}

/**
 * Responsabilidade em contestações (25%).
 * REGRA: aberta no prazo NÃO reduz; respondida no prazo NÃO reduz.
 * Só impacta ausência de resposta / atraso / reincidência.
 */
function scoreContestationResponsibility(
  facts: OfficeIndexContestationFact[],
  asOf: Date,
): number {
  if (facts.length === 0) return 100;

  let score = 100;
  let unansweredStreak = 0;

  const ordered = [...facts].sort(
    (a, b) => new Date(a.contestedAt).getTime() - new Date(b.contestedAt).getTime(),
  );

  for (const c of ordered) {
    const w = temporalWeight(c.contestedAt, asOf);
    const due = new Date(c.responseDueAt);
    const responded = c.respondedAt ? new Date(c.respondedAt) : null;

    if (!responded) {
      if (asOf.getTime() <= due.getTime()) {
        // Aberta dentro do prazo — sem impacto.
        continue;
      }
      unansweredStreak += 1;
      const progressive = 1 + Math.max(0, unansweredStreak - 1) * 0.45;
      score -= 14 * w * progressive;
      continue;
    }

    unansweredStreak = 0;
    if (responded.getTime() <= due.getTime()) {
      // Respondida no prazo — sem impacto.
      continue;
    }
    // Respondida com atraso — impacto leve.
    score -= 5 * w;
  }

  return clamp(score);
}

/**
 * Completude documental (20%).
 */
function scoreCompleteness(facts: OfficeIndexAttendanceFact[], asOf: Date): number {
  if (facts.length === 0) return OFFICE_INDEX_PRIOR_SCORE;

  const pairs = facts.map((f) => {
    const fields = [
      f.completeness.hasVehicle,
      f.completeness.hasService,
      f.completeness.hasDate,
      f.completeness.hasMileage,
      f.completeness.hasProductsOrNotes,
      f.completeness.hasResponsible,
    ];
    const ratio = fields.filter(Boolean).length / fields.length;
    return { value: ratio * 100, weight: temporalWeight(f.date, asOf) };
  });

  return clamp(weightedMean(pairs));
}

/** Suavização por volume: converge ao comportamento real conforme n cresce. */
export function smoothByVolume(rawScore: number, attendanceCount: number): number {
  const n = Math.max(0, attendanceCount);
  const k = OFFICE_INDEX_SMOOTHING_K;
  const smoothed =
    (n / (n + k)) * rawScore + (k / (n + k)) * OFFICE_INDEX_PRIOR_SCORE;
  return clamp(Math.round(smoothed));
}

function averageResponseHours(facts: OfficeIndexContestationFact[]): number | null {
  const durations: number[] = [];
  for (const c of facts) {
    if (!c.respondedAt) continue;
    const ms = new Date(c.respondedAt).getTime() - new Date(c.contestedAt).getTime();
    if (ms >= 0) durations.push(ms / 3_600_000);
  }
  if (durations.length === 0) return null;
  return Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10;
}

/**
 * Cálculo oficial do Índice VEBOOK para uma oficina.
 */
export function computeOfficeRegularityIndex(
  input: OfficeIndexInput,
  asOf: Date = new Date(),
): OfficeReputationSnapshot {
  const attendances = input.attendances ?? [];
  const contestations = input.contestations ?? [];

  const components: OfficeIndexComponents = {
    regularity: Math.round(scoreRegularity(attendances, asOf) * 10) / 10,
    validation: Math.round(scoreValidation(attendances, asOf) * 10) / 10,
    contestationResponsibility:
      Math.round(scoreContestationResponsibility(contestations, asOf) * 10) / 10,
    completeness: Math.round(scoreCompleteness(attendances, asOf) * 10) / 10,
  };

  const raw =
    components.regularity * OFFICE_INDEX_WEIGHTS.regularity +
    components.validation * OFFICE_INDEX_WEIGHTS.validation +
    components.contestationResponsibility * OFFICE_INDEX_WEIGHTS.contestationResponsibility +
    components.completeness * OFFICE_INDEX_WEIGHTS.completeness;

  const score = smoothByVolume(raw, attendances.length);
  const inFormation = attendances.length < OFFICE_INDEX_MIN_ATTENDANCES;
  const { id: classification, label: classificationLabel } = classifyOfficeIndex(
    score,
    inFormation,
  );

  const validatedAttendances = attendances.filter((a) => a.validationStatus === 'validado').length;
  const unvalidatedAttendances = attendances.filter(
    (a) => a.validationStatus === 'sem_validacao' || a.validationStatus === 'aguardando',
  ).length;
  const contestedAttendances = attendances.filter((a) => a.validationStatus === 'contestado').length;

  let answered = 0;
  let unanswered = 0;
  for (const c of contestations) {
    const due = new Date(c.responseDueAt);
    if (c.respondedAt) {
      answered += 1;
    } else if (asOf.getTime() > due.getTime()) {
      unanswered += 1;
    }
  }

  return {
    officeId: input.officeId,
    score,
    classification,
    classificationLabel,
    inFormation,
    totalAttendances: attendances.length,
    validatedAttendances,
    unvalidatedAttendances,
    contestedAttendances,
    answeredContestations: answered,
    unansweredContestations: unanswered,
    averageResponseHours: averageResponseHours(contestations),
    recordCompleteness: components.completeness,
    components,
    calculatedAt: asOf.toISOString(),
  };
}

export function formatOfficeIndexLine(snapshot: OfficeReputationSnapshot): string {
  if (snapshot.inFormation) return 'Índice VEBOOK em formação';
  return `Índice VEBOOK · ${snapshot.score}/100`;
}

export function validatedPercent(snapshot: OfficeReputationSnapshot): number | null {
  if (snapshot.totalAttendances <= 0) return null;
  return Math.round((snapshot.validatedAttendances / snapshot.totalAttendances) * 1000) / 10;
}

export function responseRegularityPercent(snapshot: OfficeReputationSnapshot): number | null {
  const totalClosedOrDue =
    snapshot.answeredContestations + snapshot.unansweredContestations;
  if (totalClosedOrDue <= 0) return 100;
  return Math.round((snapshot.answeredContestations / totalClosedOrDue) * 1000) / 10;
}

export function dueDateFromContestedAt(
  contestedAtIso: string,
  days = CONTESTATION_RESPONSE_DAYS,
): string {
  const d = new Date(contestedAtIso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}
