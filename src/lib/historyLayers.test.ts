/**
 * Testes da separação CONSULTA GRATUITA × CERTIDÃO e regras do Índice.
 * Executar: npm test
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertPublicHistoryShape,
  getCertificateHistory,
  getPublicHistory,
  toPublicHistoryItem,
} from './historyLayers';
import { SERVICES_MOCK } from '../data/mockData';
import {
  computeOfficeRegularityIndex,
  OFFICE_INDEX_MIN_ATTENDANCES,
} from './officeRegularityIndex';
import { OFFICE_INDEX_SEED } from '../data/officeIndexExplainer';
import { findCertificateByCode, issueCertificate } from '../data/certificateStore';

describe('Camada PUBLIC_HISTORY (consulta gratuita)', () => {
  it('retorna apenas data, serviço, km e oficina', () => {
    const items = getPublicHistory('BRA2E19');
    assert.ok(items.length > 0);
    for (const item of items) {
      const keys = Object.keys(item).sort();
      assert.deepEqual(keys, [
        'id',
        'mileageKm',
        'serviceDate',
        'serviceType',
        'workshopCity',
        'workshopName',
        'workshopState',
      ]);
      assert.equal(assertPublicHistoryShape(item as unknown as Record<string, unknown>).length, 0);
    }
  });

  it('não inclui produtos, descrição, recordedAt nem contestação', () => {
    const full = SERVICES_MOCK['BRA2E19'][0];
    const pub = toPublicHistoryItem(full) as unknown as Record<string, unknown>;
    assert.equal('products' in pub, false);
    assert.equal('description' in pub, false);
    assert.equal('recordedAt' in pub, false);
    assert.equal('contestation' in pub, false);
    assert.equal('rectifications' in pub, false);
    assert.equal('observations' in pub, false);
  });

  it('não gera campos de recomendação futura', () => {
    const items = getPublicHistory('BRA2E19');
    const blob = JSON.stringify(items).toLowerCase();
    assert.equal(blob.includes('próxima manutenção'), false);
    assert.equal(blob.includes('recomend'), false);
  });
});

describe('Camada CERTIFICATE_HISTORY', () => {
  it('apresenta dados completos permitidos e distingue datas', () => {
    const entries = getCertificateHistory('BRA2E19');
    assert.ok(entries.length > 0);
    const withDiff = entries.find(
      (e) => e.recordedAt.slice(0, 10) === e.serviceDate || e.recordedAt.includes('T'),
    );
    assert.ok(withDiff);
    assert.ok(withDiff!.recordedAt.includes('T') || withDiff!.recordedAt.length >= 10);
    assert.notEqual(withDiff!.serviceDate, withDiff!.recordedAt);
  });

  it('preserva retificações sem sobrescrita silenciosa', () => {
    const entries = getCertificateHistory('BRA2E19');
    const withRect = entries.find((e) => e.rectifications.length > 0);
    assert.ok(withRect, 'esperado ao menos um registro com retificação no mock');
    const r = withRect!.rectifications[0];
    assert.ok(r.previousValue);
    assert.ok(r.newValue);
    assert.notEqual(r.previousValue, r.newValue);
  });

  it('preserva contestação sem conteúdo privado', () => {
    const entries = getCertificateHistory('BRA2E19');
    const contested = entries.find((e) => e.contestation.exists);
    assert.ok(contested);
    assert.ok(contested!.contestation.statusLabel);
    const raw = JSON.stringify(contested);
    assert.equal(raw.includes('maskedClientIdentifier'), false);
    assert.equal(raw.toLowerCase().includes('fras-le'), false);
  });

  it('preserva validação', () => {
    const entries = getCertificateHistory('BRA2E19');
    assert.ok(entries.some((e) => e.validationStatus === 'validado'));
    assert.ok(entries.some((e) => e.validatedAt));
  });
});

describe('Autenticidade da Certidão', () => {
  it('emite código próprio e permite verificação', () => {
    const cert = issueCertificate({
      plate: 'BRA2E19',
      requesterName: 'Teste',
      requesterDocumentMasked: 'CPF 000.***.***-00',
    });
    assert.ok(cert.authenticityCode.startsWith('VBK-'));
    assert.ok(cert.documentNumber.match(/^\d{8}$/));
    assert.ok(cert.qrCodeUrl?.includes(cert.authenticityCode));
    const found = findCertificateByCode(cert.authenticityCode);
    assert.ok(found);
    assert.equal(found!.vehiclePlate, 'BRA2E19');
    assert.equal(found!.documentNumber, cert.documentNumber);
  });
});

describe('Índice VEBOOK — regras estruturais', () => {
  it('oficina com poucos registros fica em formação', () => {
    const seed = OFFICE_INDEX_SEED['ws-04'];
    const snap = computeOfficeRegularityIndex({
      officeId: 'ws-04',
      attendances: seed.attendances,
      contestations: seed.contestations,
    });
    assert.ok(seed.attendances.length < OFFICE_INDEX_MIN_ATTENDANCES);
    assert.equal(snap.inFormation, true);
  });

  it('cenário intermediário Prisma fica entre 70 e 85', () => {
    const seed = OFFICE_INDEX_SEED['ws-prisma'];
    const snap = computeOfficeRegularityIndex({
      officeId: 'ws-prisma',
      attendances: seed.attendances,
      contestations: seed.contestations,
    });
    assert.ok(snap.score >= 70 && snap.score <= 85, `score=${snap.score}`);
  });

  it('um único erro não colapsa a reputação madura', () => {
    const seed = OFFICE_INDEX_SEED['ws-01'];
    const snap = computeOfficeRegularityIndex({
      officeId: 'ws-01',
      attendances: seed.attendances,
      contestations: seed.contestations,
    });
    assert.ok(snap.score >= 80, `score=${snap.score}`);
  });
});
