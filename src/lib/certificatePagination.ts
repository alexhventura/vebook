/**
 * Paginação documental da Certidão VEBOOK (A4 lógico).
 * Prefere manter cada atendimento íntegro em uma única página.
 */

import type { CertificateHistoryEntry } from '../types';

export const FIRST_PAGE_CAPACITY = 7;
export const PAGE_CAPACITY = 11;
export const SUMMARY_UNITS = 3;

export type CertificatePageContent =
  | { kind: 'cover' }
  | { kind: 'entry'; entry: CertificateHistoryEntry; attendanceNumber: number }
  | { kind: 'summary' };

export type CertificateDocumentPage = {
  pageNumber: number;
  blocks: CertificatePageContent[];
};

/** Estima unidades de altura de um atendimento (conteúdo real). */
export function estimateEntryUnits(entry: CertificateHistoryEntry): number {
  let units = 3;
  units += Math.ceil((entry.products?.length || 0) / 2);
  if ((entry.description || '').length > 180) units += 1;
  if ((entry.observations || '').length > 120) units += 1;
  if (entry.laborDetails) units += 1;
  units += entry.rectifications?.length || 0;
  if (entry.contestation?.exists) units += 1;
  return Math.max(3, Math.min(units, PAGE_CAPACITY));
}

/**
 * Empacota blocos sem partir um atendimento entre páginas.
 * Se o bloco não cabe no restante, abre página nova.
 */
export function paginateCertificateEntries(
  entries: CertificateHistoryEntry[],
  options: { includeSummary?: boolean } = {},
): CertificateDocumentPage[] {
  const includeSummary = options.includeSummary !== false;
  const pages: CertificateDocumentPage[] = [];
  let current: CertificatePageContent[] = [{ kind: 'cover' }];
  let capacity = FIRST_PAGE_CAPACITY;
  let used = 2; // capa ocupa espaço

  const flush = () => {
    if (current.length === 0) return;
    pages.push({ pageNumber: pages.length + 1, blocks: current });
    current = [];
    capacity = PAGE_CAPACITY;
    used = 0;
  };

  entries.forEach((entry, index) => {
    const units = estimateEntryUnits(entry);
    const block: CertificatePageContent = {
      kind: 'entry',
      entry,
      attendanceNumber: index + 1,
    };
    if (used > 0 && used + units > capacity) {
      flush();
    }
    // Atendimento excepcional maior que a página: ocupa página inteira sozinho
    if (units >= capacity && used > 0) {
      flush();
    }
    current.push(block);
    used += Math.min(units, capacity);
    if (used >= capacity) flush();
  });

  if (includeSummary) {
    if (used > 0 && used + SUMMARY_UNITS > capacity) {
      flush();
    }
    if (current.length === 0) {
      current = [];
      used = 0;
      capacity = PAGE_CAPACITY;
    }
    current.push({ kind: 'summary' });
  }

  if (current.length > 0) flush();

  // Garante ao menos 1 página
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
