/**
 * Paginação documental da Certidão VEBOOK (A4 lógico).
 *
 * Regras:
 * - Cada atendimento é um bloco indivisível.
 * - Se o bloco não cabe no restante da folha, vai integralmente para a próxima.
 * - Meta: até TARGET_ATTENDANCES_PER_PAGE (2) blocos por folha.
 * - Sem capa nem resumo — identificação fica no cabeçalho de cada página.
 */

import type { CertificateHistoryEntry } from '../types';

/** Meta de blocos de atendimento por folha. */
export const TARGET_ATTENDANCES_PER_PAGE = 2;
/** Compat: todas as folhas usam a mesma meta. */
export const FIRST_PAGE_ATTENDANCES = TARGET_ATTENDANCES_PER_PAGE;
export const PAGE_CAPACITY = TARGET_ATTENDANCES_PER_PAGE;
export const FIRST_PAGE_CAPACITY = FIRST_PAGE_ATTENDANCES;

export type CertificatePageContent = {
  kind: 'entry';
  entry: CertificateHistoryEntry;
  attendanceNumber: number;
};

export type CertificateDocumentPage = {
  pageNumber: number;
  blocks: CertificatePageContent[];
};

/**
 * Estima “peso” do bloco (1 = cabe junto; ≥2 = folha exclusiva).
 * Usado só para decidir se o bloco cabe com os demais — nunca para partir o conteúdo.
 */
export function estimateEntryUnits(entry: CertificateHistoryEntry): number {
  let weight = 1;
  const productCount = entry.products?.length || 0;
  if (productCount >= 5) weight += 1;
  if ((entry.description || '').length > 320) weight += 1;
  if ((entry.observations || '').length > 200) weight += 1;
  if (entry.laborDetails && entry.laborDetails.length > 160) weight += 1;
  weight += Math.min(entry.rectifications?.length || 0, 1);
  if (entry.contestation?.exists && productCount >= 3) weight += 1;
  return Math.max(1, Math.min(weight, TARGET_ATTENDANCES_PER_PAGE));
}

function entryCount(blocks: CertificatePageContent[]): number {
  return blocks.length;
}

function usedWeight(blocks: CertificatePageContent[]): number {
  return blocks.reduce((acc, b) => acc + estimateEntryUnits(b.entry), 0);
}

/**
 * Empacota blocos sem partir um atendimento entre páginas.
 * Prioriza até 2 atendimentos por folha; move o bloco inteiro se não couber.
 */
export function paginateCertificateEntries(
  entries: CertificateHistoryEntry[],
): CertificateDocumentPage[] {
  const pages: CertificateDocumentPage[] = [];
  let current: CertificatePageContent[] = [];

  const flush = () => {
    if (current.length === 0) return;
    pages.push({ pageNumber: pages.length + 1, blocks: current });
    current = [];
  };

  const fitsIntact = (entry: CertificateHistoryEntry): boolean => {
    const count = entryCount(current);
    if (count >= TARGET_ATTENDANCES_PER_PAGE) return false;

    const weight = estimateEntryUnits(entry);
    if (weight >= TARGET_ATTENDANCES_PER_PAGE) {
      return count === 0;
    }
    if (count + 1 > TARGET_ATTENDANCES_PER_PAGE) return false;
    if (usedWeight(current) + weight > TARGET_ATTENDANCES_PER_PAGE) return false;
    return true;
  };

  entries.forEach((entry, index) => {
    const block: CertificatePageContent = {
      kind: 'entry',
      entry,
      attendanceNumber: entry.vehicleAttendanceSeq || index + 1,
    };

    if (!fitsIntact(entry)) {
      flush();
    }

    current.push(block);

    const count = entryCount(current);
    const weight = estimateEntryUnits(entry);
    if (count >= TARGET_ATTENDANCES_PER_PAGE || weight >= TARGET_ATTENDANCES_PER_PAGE) {
      flush();
    }
  });

  if (current.length > 0) flush();

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, blocks: [] });
  }

  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
}
