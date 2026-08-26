import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildConsultaVeicularUrl, parseHash, toHash } from './navigation';

describe('navegação — consulta gratuita com placa (QR)', () => {
  it('parseHash lê placa no path', () => {
    const state = parseHash('#/diario/BRA2E19');
    assert.equal(state.view, 'diario');
    assert.equal(state.consultaPlate, 'BRA2E19');
  });

  it('parseHash lê placa na query', () => {
    const state = parseHash('#/diario?placa=ABC1D23');
    assert.equal(state.view, 'diario');
    assert.equal(state.consultaPlate, 'ABC1D23');
  });

  it('toHash inclui placa quando informada', () => {
    assert.equal(toHash({ view: 'diario', consultaPlate: 'BRA2E19' }), '#/diario/BRA2E19');
    assert.equal(toHash({ view: 'diario' }), '#/diario');
  });

  it('buildConsultaVeicularUrl monta link para QR', () => {
    assert.equal(buildConsultaVeicularUrl('bra2e19'), '#/diario/BRA2E19');
  });
});
