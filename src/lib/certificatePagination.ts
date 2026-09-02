/**
 * Paginação documental da Certidão VEBOOK (A4 lógico).
 *
 * Regras:
 * - Cada atendimento é um bloco indivisível.
 * - Exatamente TARGET_ATTENDANCES_PER_PAGE (2) blocos por folha,
 *   exceto a última folha quando sobra 1 atendimento.
 */

import type { CertificateHistoryEntry } from '../types';

/** Meta fixa de blocos de atendimento por folha. */
export const TARGET_ATTENDANCES_PER_PAGE = 2;
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
 * Mantido para testes/compat — peso não altera mais a paginação (sempre 2 por folha).
 */
export function estimateEntryUnits(_entry: CertificateHistoryEntry): number {
  void _entry;
  return 1;
}

/**
 * Empacota em grupos de 2 atendimentos por folha.
 * Só a última folha pode ter 1 bloco (quando o total for ímpar).
 */
export function paginateCertificateEntries(
  entries: CertificateHistoryEntry[],
): CertificateDocumentPage[] {
  if (entries.length === 0) {
    return [{ pageNumber: 1, blocks: [] }];
  }

  const pages: CertificateDocumentPage[] = [];
  for (let i = 0; i < entries.length; i += TARGET_ATTENDANCES_PER_PAGE) {
    const slice = entries.slice(i, i + TARGET_ATTENDANCES_PER_PAGE);
    pages.push({
      pageNumber: pages.length + 1,
      blocks: slice.map((entry, offset) => ({
        kind: 'entry' as const,
        entry,
        attendanceNumber: entry.vehicleAttendanceSeq || i + offset + 1,
      })),
    });
  }

  return pages;
}
