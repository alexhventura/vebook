/**
 * Paginação documental da Certidão VEBOOK (A4 lógico).
 *
 * Regras:
 * - Cada atendimento é um bloco indivisível.
 * - Se o bloco não cabe no restante da folha, vai integralmente para a próxima.
 * - Meta: até TARGET_ATTENDANCES_PER_PAGE (3) blocos por folha.
 * - Folha 1 (com capa): até FIRST_PAGE_ATTENDANCES (2) para não estourar o espaço.
 * - Bloco excepcionalmente grande: ocupa a folha sozinho.
 */

import type { CertificateHistoryEntry } from '../types';

/** Meta de blocos de atendimento por folha de conteúdo. */
export const TARGET_ATTENDANCES_PER_PAGE = 3;
/** Folha 1 inclui capa — reserva menos slots de atendimento. */
export const FIRST_PAGE_ATTENDANCES = 2;

/** Compat: capacidade em “unidades” (3 slots × peso base). */
export const PAGE_CAPACITY = TARGET_ATTENDANCES_PER_PAGE;
export const FIRST_PAGE_CAPACITY = FIRST_PAGE_ATTENDANCES;
export const SUMMARY_UNITS = 1;

export type CertificatePageContent =
  | { kind: 'cover' }
  | { kind: 'entry'; entry: CertificateHistoryEntry; attendanceNumber: number }
  | { kind: 'summary' };

export type CertificateDocumentPage = {
  pageNumber: number;
  blocks: CertificatePageContent[];
};

/**
 * Estima “peso” do bloco (1 = cabe junto com outros; ≥3 = folha exclusiva).
 * Usado só para decidir se o bloco cabe com os demais — nunca para partir o conteúdo.
 */
export function estimateEntryUnits(entry: CertificateHistoryEntry): number {
  let weight = 1;
  const productCount = entry.products?.length || 0;
  if (productCount >= 4) weight += 1;
  if (productCount >= 8) weight += 1;
  if ((entry.description || '').length > 280) weight += 1;
  if ((entry.observations || '').length > 180) weight += 1;
  if (entry.laborDetails && entry.laborDetails.length > 120) weight += 1;
  weight += Math.min(entry.rectifications?.length || 0, 2);
  if (entry.contestation?.exists) weight += 1;
  return Math.max(1, Math.min(weight, TARGET_ATTENDANCES_PER_PAGE));
}

function entryCount(blocks: CertificatePageContent[]): number {
  return blocks.filter((b) => b.kind === 'entry').length;
}

function usedWeight(blocks: CertificatePageContent[]): number {
  return blocks.reduce((acc, b) => {
    if (b.kind === 'cover') return acc + 1;
    if (b.kind === 'summary') return acc + SUMMARY_UNITS;
    if (b.kind === 'entry') return acc + estimateEntryUnits(b.entry);
    return acc;
  }, 0);
}

/**
 * Empacota blocos sem partir um atendimento entre páginas.
 * Prioriza até 3 atendimentos por folha; move o bloco inteiro se não couber.
 */
export function paginateCertificateEntries(
  entries: CertificateHistoryEntry[],
  options: { includeSummary?: boolean } = {},
): CertificateDocumentPage[] {
  const includeSummary = options.includeSummary !== false;
  const pages: CertificateDocumentPage[] = [];
  let current: CertificatePageContent[] = [{ kind: 'cover' }];

  const maxAttendancesForCurrent = () =>
    pages.length === 0 && current.some((b) => b.kind === 'cover')
      ? FIRST_PAGE_ATTENDANCES
      : TARGET_ATTENDANCES_PER_PAGE;

  const capacityForCurrent = () => maxAttendancesForCurrent() + (current.some((b) => b.kind === 'cover') ? 1 : 0);

  const flush = () => {
    if (current.length === 0) return;
    pages.push({ pageNumber: pages.length + 1, blocks: current });
    current = [];
  };

  /** O bloco cabe inteiro na folha atual? (nunca parcial) */
  const fitsIntact = (entry: CertificateHistoryEntry): boolean => {
    const count = entryCount(current);
    const max = maxAttendancesForCurrent();
    if (count >= max) return false;

    const weight = estimateEntryUnits(entry);
    // Bloco “pesado”: só cabe sozinho (ou em folha vazia de conteúdo)
    if (weight >= TARGET_ATTENDANCES_PER_PAGE) {
      return count === 0;
    }
    // Espaço restante em peso + contagem
    if (count + 1 > max) return false;
    if (usedWeight(current) + weight > capacityForCurrent()) return false;
    return true;
  };

  entries.forEach((entry, index) => {
    const block: CertificatePageContent = {
      kind: 'entry',
      entry,
      attendanceNumber: index + 1,
    };

    if (!fitsIntact(entry)) {
      flush();
    }

    // Após flush, se ainda não couber (bloco gigante na folha 1 com capa),
    // abre folha só de conteúdo sem misturar com a capa já fechada.
    if (current.length > 0 && !fitsIntact(entry)) {
      flush();
    }

    current.push(block);

    // Fecha folha ao atingir a meta de 3 (ou 2 na 1ª) ou bloco exclusivo
    const count = entryCount(current);
    const weight = estimateEntryUnits(entry);
    if (count >= maxAttendancesForCurrent() || weight >= TARGET_ATTENDANCES_PER_PAGE) {
      flush();
    }
  });

  if (includeSummary) {
    const summary: CertificatePageContent = { kind: 'summary' };
    // Resumo na última folha se ainda houver vaga; senão, folha própria
    const canShare =
      current.length > 0 &&
      entryCount(current) < maxAttendancesForCurrent() &&
      usedWeight(current) + SUMMARY_UNITS <= capacityForCurrent();

    if (!canShare) {
      if (current.length > 0) flush();
      current = [summary];
    } else {
      current.push(summary);
    }
  }

  if (current.length > 0) flush();

  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      blocks: [{ kind: 'cover' }, { kind: 'summary' }],
    });
  }

  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
}

export function pageIdFromDocument(documentNumber: string, pageNumber: number): string {
  return `${documentNumber}-${String(pageNumber).padStart(2, '0')}`;
}

export function pageTrackingCode(
  documentNumber: string,
  authenticityShort: string,
  pageNumber: number,
): string {
  const year = new Date().getFullYear();
  return `VB-${year}-${documentNumber}-P${String(pageNumber).padStart(2, '0')}-${authenticityShort}`;
}
