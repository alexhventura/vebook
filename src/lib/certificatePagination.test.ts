/**
 * Testes da paginação documental e identificação da Certidão VEBOOK.
 * Executar: npm test
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CertificateHistoryEntry } from '../types';
import {
  FIRST_PAGE_ATTENDANCES,
  FIRST_PAGE_CAPACITY,
  PAGE_CAPACITY,
  TARGET_ATTENDANCES_PER_PAGE,
  estimateEntryUnits,
  pageIdFromDocument,
  pageTrackingCode,
  paginateCertificateEntries,
} from './certificatePagination';
import {
  buildIntegrityHash,
  buildPageIdentity,
  findCertificateByCode,
  issueCertificate,
  parseCertificateLookup,
} from '../data/certificateStore';
import { getCertificateHistory } from './historyLayers';

function makeEntry(
  id: string,
  overrides: Partial<CertificateHistoryEntry> = {},
): CertificateHistoryEntry {
  return {
    id,
    serviceDate: '2026-08-15',
    serviceType: 'Troca de óleo',
    mileageKm: 80000,
    workshopName: 'Oficina Teste',
    workshopCity: 'São Paulo',
    workshopState: 'SP',
    description: 'Serviço de teste.',
    laborDetails: undefined,
    observations: undefined,
    responsibleName: undefined,
    products: [],
    recordedAt: '2026-08-15T16:42:00',
    validationStatus: 'validado',
    validatedAt: '2026-08-16T10:00:00',
    rectifications: [],
    contestation: { exists: false, statusLabel: 'Nenhuma' },
    ...overrides,
  };
}

describe('Paginação da Certidão', () => {
  it('gera 1 página para histórico vazio (capa + resumo)', () => {
    const pages = paginateCertificateEntries([]);
    assert.equal(pages.length, 1);
    assert.ok(pages[0].blocks.some((b) => b.kind === 'cover'));
    assert.ok(pages[0].blocks.some((b) => b.kind === 'summary'));
  });

  it('gera 2 páginas quando há poucos atendimentos', () => {
    const entries = [makeEntry('e1'), makeEntry('e2')];
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 1 && pages.length <= 2);
    const entryBlocks = pages.flatMap((p) => p.blocks.filter((b) => b.kind === 'entry'));
    assert.equal(entryBlocks.length, 2);
  });

  it('gera 3+ páginas com múltiplos atendimentos', () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry(`e${i}`, {
        description: 'x'.repeat(200),
        products: [
          {
            id: `p${i}`,
            category: 'Lubrificante',
            commercialName: 'Óleo',
            brand: 'X',
            specification: '5W30',
            quantity: 4,
            unit: 'L',
          },
          {
            id: `p${i}b`,
            category: 'Filtro',
            commercialName: 'Filtro',
            brand: 'Y',
            quantity: 1,
            unit: 'un',
          },
        ],
        rectifications: [
          {
            id: `r${i}`,
            field: 'mileageKm',
            fieldLabel: 'KM',
            previousValue: '1',
            newValue: '2',
            rectifiedAt: '2026-08-16T12:00:00',
          },
        ],
        contestation: {
          exists: true,
          statusLabel: 'Em análise',
          contestedAt: '2026-08-17T09:00:00',
        },
      }),
    );
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 3, `esperado ≥3 páginas, obteve ${pages.length}`);
    pages.forEach((p, i) => assert.equal(p.pageNumber, i + 1));
  });

  it('gera muitas páginas sem fixar quantidade', () => {
    const entries = Array.from({ length: 40 }, (_, i) =>
      makeEntry(`many-${i}`, {
        description: 'Detalhe longo '.repeat(20),
        products: Array.from({ length: 4 }, (_, j) => ({
          id: `mp-${i}-${j}`,
          category: 'Peça',
          commercialName: `Peça ${j}`,
          brand: 'Marca',
          quantity: 1,
          unit: 'un',
        })),
      }),
    );
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 8, `esperado muitas páginas, obteve ${pages.length}`);
    const last = pages[pages.length - 1];
    assert.ok(last.blocks.some((b) => b.kind === 'summary'));
  });

  it('não parte um atendimento entre páginas (bloco íntegro)', () => {
    const small = makeEntry('s1');
    const large = makeEntry('s2', {
      description: 'y'.repeat(320),
      laborDetails: 'mão de obra '.repeat(20),
      observations: 'obs '.repeat(50),
      products: Array.from({ length: 8 }, (_, j) => ({
        id: `lp-${j}`,
        category: 'Peça',
        commercialName: `Item ${j}`,
        brand: 'B',
        quantity: 1,
        unit: 'un',
      })),
      rectifications: [
        {
          id: 'rr1',
          field: 'description',
          fieldLabel: 'Campo',
          previousValue: 'A',
          newValue: 'B',
          rectifiedAt: '2026-08-16T12:00:00',
        },
        {
          id: 'rr2',
          field: 'mileageKm',
          fieldLabel: 'KM',
          previousValue: '1',
          newValue: '2',
          rectifiedAt: '2026-08-16T13:00:00',
        },
      ],
      contestation: { exists: true, statusLabel: 'Aberta', contestedAt: '2026-08-17T09:00:00' },
    });
    assert.ok(estimateEntryUnits(large) >= 2);
    const pages = paginateCertificateEntries([small, large]);
    for (const page of pages) {
      const entriesOnPage = page.blocks.filter((b) => b.kind === 'entry');
      const ids = entriesOnPage.map((b) => (b.kind === 'entry' ? b.entry.id : ''));
      assert.equal(new Set(ids).size, ids.length);
    }
    const allIds = pages
      .flatMap((p) => p.blocks)
      .filter((b) => b.kind === 'entry')
      .map((b) => (b.kind === 'entry' ? b.entry.id : ''));
    assert.deepEqual(allIds.sort(), ['s1', 's2'].sort());
    // bloco pesado não compartilha folha com outro atendimento
    const pageWithLarge = pages.find((p) =>
      p.blocks.some((b) => b.kind === 'entry' && b.entry.id === 's2'),
    );
    assert.ok(pageWithLarge);
    assert.equal(
      pageWithLarge!.blocks.filter((b) => b.kind === 'entry').length,
      1,
    );
  });

  it('capa só na primeira página; resumo na última', () => {
    const entries = Array.from({ length: 12 }, (_, i) => makeEntry(`c${i}`));
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 2);
    assert.ok(pages[0].blocks.some((b) => b.kind === 'cover'));
    for (let i = 1; i < pages.length; i += 1) {
      assert.equal(
        pages[i].blocks.some((b) => b.kind === 'cover'),
        false,
      );
    }
    const last = pages[pages.length - 1];
    assert.ok(last.blocks.some((b) => b.kind === 'summary'));
  });

  it('meta de até 3 blocos de atendimento por folha', () => {
    assert.equal(TARGET_ATTENDANCES_PER_PAGE, 3);
    assert.equal(FIRST_PAGE_ATTENDANCES, 2);
    assert.equal(PAGE_CAPACITY, 3);
    assert.equal(FIRST_PAGE_CAPACITY, 2);

    const entries = Array.from({ length: 9 }, (_, i) => makeEntry(`t${i}`));
    const pages = paginateCertificateEntries(entries);
    for (const page of pages) {
      const n = page.blocks.filter((b) => b.kind === 'entry').length;
      assert.ok(n <= TARGET_ATTENDANCES_PER_PAGE, `página ${page.pageNumber} tem ${n} blocos`);
    }
    const firstEntries = pages[0].blocks.filter((b) => b.kind === 'entry').length;
    assert.ok(firstEntries <= FIRST_PAGE_ATTENDANCES);
    // folhas intermediárias de conteúdo tendem a 3
    const middle = pages.filter(
      (p) =>
        !p.blocks.some((b) => b.kind === 'cover') &&
        !p.blocks.some((b) => b.kind === 'summary') &&
        p.blocks.some((b) => b.kind === 'entry'),
    );
    assert.ok(middle.length >= 1);
    for (const p of middle) {
      assert.equal(p.blocks.filter((b) => b.kind === 'entry').length, 3);
    }
  });
});

describe('Identificação e autenticidade por página', () => {
  it('pageId e rastreabilidade derivam do número documental', () => {
    assert.equal(pageIdFromDocument('00001284', 1), '00001284-01');
    assert.equal(pageIdFromDocument('00001284', 3), '00001284-03');
    const track = pageTrackingCode('00001284', '8F72', 2);
    assert.match(track, /^VB-\d{4}-00001284-P02-8F72$/);
  });

  it('cada página tem identidade auto-contida', () => {
    const cert = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'Teste',
      requesterDocumentMasked: 'CPF 000.***.***-00',
    });
    const pages = paginateCertificateEntries(cert.historyEntries);
    const total = pages.length;
    for (let i = 1; i <= total; i += 1) {
      const id = buildPageIdentity(cert, i, total);
      assert.equal(id.documentNumber, cert.documentNumber);
      assert.equal(id.vehiclePlate, cert.vehiclePlate);
      assert.equal(id.authenticityCode, cert.authenticityCode);
      assert.equal(id.pageNumber, i);
      assert.equal(id.totalPages, total);
      assert.equal(id.pageId, `${cert.documentNumber}-${String(i).padStart(2, '0')}`);
      assert.ok(id.pageTrackingCode.includes(cert.documentNumber));
      assert.ok(id.verifyPath.includes(cert.authenticityCode));
      assert.ok(id.verifyPath.includes(`p=${i}`));
      assert.ok(id.integrityHash.startsWith('H'));
      assert.ok(id.trackingCode.length > 0);
    }
  });

  it('número sequencial é documental; autenticidade é código seguro separado', () => {
    const a = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'A',
      requesterDocumentMasked: 'CPF 111.***.***-11',
    });
    const b = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'B',
      requesterDocumentMasked: 'CPF 222.***.***-22',
    });
    assert.notEqual(a.documentNumber, b.documentNumber);
    assert.notEqual(a.authenticityCode, b.authenticityCode);
    assert.match(a.documentNumber, /^\d{8}$/);
    assert.match(a.authenticityCode, /^VBK-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i);
    assert.notEqual(a.historyAsOf, undefined);
  });

  it('emissão é snapshot independente (versionamento)', () => {
    const first = issueCertificate({
      plate: 'ABC1D23',
      requesterName: 'V1',
      requesterDocumentMasked: 'CPF 333.***.***-33',
    });
    const second = issueCertificate({
      plate: 'ABC1D23',
      requesterName: 'V2',
      requesterDocumentMasked: 'CPF 444.***.***-44',
    });
    assert.notEqual(first.id, second.id);
    assert.equal(findCertificateByCode(first.authenticityCode)?.documentNumber, first.documentNumber);
    assert.equal(findCertificateByCode(second.authenticityCode)?.documentNumber, second.documentNumber);
  });

  it('lookup por código de página e pageId', () => {
    const cert = findCertificateByCode('00001284');
    assert.ok(cert);
    const id = buildPageIdentity(cert!, 2, 3);
    const byPageTrack = findCertificateByCode(id.pageTrackingCode);
    assert.ok(byPageTrack);
    assert.equal(byPageTrack!.documentNumber, cert!.documentNumber);
    const byPageId = findCertificateByCode(id.pageId);
    assert.ok(byPageId);
    assert.equal(parseCertificateLookup(id.pageId).pageNumber, 2);
  });

  it('código inexistente não localiza certidão', () => {
    assert.equal(findCertificateByCode('VBK-DEAD-BEEF-0000'), undefined);
    assert.equal(findCertificateByCode('99999999'), undefined);
  });

  it('hash de integridade muda com o conteúdo', () => {
    const h1 = buildIntegrityHash('a');
    const h2 = buildIntegrityHash('b');
    assert.notEqual(h1, h2);
  });

  it('histórico real do mock pagina e cobre casos de dados', () => {
    const entries = getCertificateHistory('BRA2E19');
    assert.ok(entries.some((e) => e.products.length > 0));
    assert.ok(entries.some((e) => e.contestation.exists));
    assert.ok(entries.some((e) => e.rectifications.length > 0));
    assert.ok(entries.some((e) => e.validationStatus === 'validado'));
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 1);
    const flat = pages.flatMap((p) => p.blocks.filter((b) => b.kind === 'entry'));
    assert.equal(flat.length, entries.length);
  });
});
