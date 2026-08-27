import { composeSignupOfficeAddress } from './signupAddress';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('composeSignupOfficeAddress', () => {
  it('monta endereço com CEP, número e complemento', () => {
    const formatted = composeSignupOfficeAddress({
      name: 'Oficina',
      cnpj: '',
      zipCode: '01310-100',
      street: 'Avenida Paulista',
      streetNumber: '120',
      complement: 'Sala 5',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      mapUrl: '',
      phone: '',
    });

    assert.match(formatted, /Avenida Paulista, 120/);
    assert.match(formatted, /Sala 5/);
    assert.match(formatted, /CEP 01310-100/);
  });
});
