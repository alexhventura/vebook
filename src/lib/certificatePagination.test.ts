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
    vehicleAttendanceId: `TST-${id}`,
    vehicleAttendanceSeq: 1,
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
  it('gera 1 página vazia quando não há atendimentos', () => {
    const pages = paginateCertificateEntries([]);
    assert.equal(pages.length, 1);
    assert.equal(pages[0].blocks.length, 0);
  });

  it('gera páginas com poucos atendimentos', () => {
    const entries = [makeEntry('e1'), makeEntry('e2')];
    const pages = paginateCertificateEntries(entries);
    assert.equal(pages.length, 1);
    assert.equal(pages[0].blocks.length, 2);
  });

  it('gera 3+ páginas com múltiplos atendimentos', () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry(`e${i}`, {
        vehicleAttendanceId: `BRA2E19-${String(i + 1).padStart(4, '0')}`,
        vehicleAttendanceSeq: i + 1,
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
      const ids = page.blocks.map((b) => b.entry.id);
      assert.equal(new Set(ids).size, ids.length);
    }
    const allIds = pages.flatMap((p) => p.blocks.map((b) => b.entry.id));
    assert.deepEqual(allIds.sort(), ['s1', 's2'].sort());
    const pageWithLarge = pages.find((p) => p.blocks.some((b) => b.entry.id === 's2'));
    assert.ok(pageWithLarge);
    assert.equal(pageWithLarge!.blocks.length, 1);
  });

  it('sem capa nem resumo — só blocos de atendimento', () => {
    const entries = Array.from({ length: 6 }, (_, i) => makeEntry(`c${i}`));
    const pages = paginateCertificateEntries(entries);
    for (const page of pages) {
      assert.ok(page.blocks.every((b) => b.kind === 'entry'));
    }
  });

  it('meta de até 2 blocos de atendimento por folha', () => {
    assert.equal(TARGET_ATTENDANCES_PER_PAGE, 2);
    assert.equal(FIRST_PAGE_ATTENDANCES, 2);
    assert.equal(PAGE_CAPACITY, 2);
    assert.equal(FIRST_PAGE_CAPACITY, 2);

    const entries = Array.from({ length: 6 }, (_, i) => makeEntry(`t${i}`));
    const pages = paginateCertificateEntries(entries);
    assert.equal(pages.length, 3);
    for (const page of pages) {
      assert.ok(page.blocks.length <= TARGET_ATTENDANCES_PER_PAGE);
      assert.equal(page.blocks.length, 2);
    }
  });
});

describe('Identificação e autenticidade por página', () => {
  it('código único de autenticidade/rastreabilidade', () => {
    const cert = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'Teste',
      requesterDocumentMasked: 'CPF 000.***.***-00',
    });
    assert.match(cert.authenticityCode, /^VBK-\d{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i);
    assert.equal(cert.trackingCode, cert.authenticityCode);
    assert.equal(cert.validationCode, cert.authenticityCode);
  });

  it('cada página tem identidade auto-contida com o mesmo código', () => {
    const cert = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'Teste',
      requesterDocumentMasked: 'CPF 000.***.***-00',
    });
    const pages = paginateCertificateEntries(cert.historyEntries);
    const total = pages.length;
    for (let i = 1; i <= total; i += 1) {
      const id = buildPageIdentity(cert, i, total);
      assert.equal(id.authenticityCode, cert.authenticityCode);
      assert.equal(id.vehiclePlate, cert.vehiclePlate);
      assert.equal(id.vehicleBrand, cert.vehicleBrand);
      assert.equal(id.pageNumber, i);
      assert.equal(id.totalPages, total);
      assert.ok(id.verifyPath.includes(cert.authenticityCode));
      assert.ok(id.verifyPath.includes(`p=${i}`));
      assert.ok(id.integrityHash.startsWith('H'));
    }
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
    assert.notEqual(first.authenticityCode, second.authenticityCode);
    assert.equal(findCertificateByCode(first.authenticityCode)?.id, first.id);
    assert.equal(findCertificateByCode(second.authenticityCode)?.id, second.id);
  });

  it('lookup pelo código único e legado de página', () => {
    const cert = findCertificateByCode('VBK-2026-8F72-A3C1-9D2E');
    assert.ok(cert);
    assert.equal(cert!.vehiclePlate, 'BRA2E19');
    const legacy = findCertificateByCode('VB-2026-00001284-P01-8F72');
    assert.ok(legacy);
    assert.equal(legacy!.documentNumber, '00001284');
    assert.equal(parseCertificateLookup(cert!.authenticityCode).authenticityCode, cert!.authenticityCode);
  });

  it('código inexistente não localiza certidão', () => {
    assert.equal(findCertificateByCode('VBK-2099-DEAD-BEEF-0000'), undefined);
    assert.equal(findCertificateByCode('99999999'), undefined);
  });

  it('hash de integridade muda com o conteúdo', () => {
    const h1 = buildIntegrityHash('a');
    const h2 = buildIntegrityHash('b');
    assert.notEqual(h1, h2);
  });

  it('histórico real do mock pagina e IDs sequenciais por veículo (antigo → recente)', () => {
    const entries = getCertificateHistory('BRA2E19');
    assert.ok(entries.length > 0);
    assert.ok(entries.every((e) => /^BRA2E19-\d{4}$/.test(e.vehicleAttendanceId)));
    for (let i = 1; i < entries.length; i += 1) {
      assert.ok(
        entries[i].vehicleAttendanceSeq > entries[i - 1].vehicleAttendanceSeq,
        'ordem deve ser do mais antigo para o mais recente',
      );
      assert.ok(
        entries[i].serviceDate >= entries[i - 1].serviceDate ||
          entries[i].recordedAt >= entries[i - 1].recordedAt,
      );
    }
    const pages = paginateCertificateEntries(entries);
    assert.ok(pages.length >= 1);
    const flat = pages.flatMap((p) => p.blocks);
    assert.equal(flat.length, entries.length);
    for (const page of pages) {
      assert.ok(page.blocks.length <= 2);
    }
  });
});
