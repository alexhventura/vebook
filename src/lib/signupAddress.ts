import { SignupDraft } from '../types';

export function composeSignupOfficeAddress(office: SignupDraft['office']): string {
  const line = [office.street.trim(), office.streetNumber.trim()].filter(Boolean).join(', ');
  const extra = [office.complement.trim(), office.neighborhood.trim()].filter(Boolean).join(' — ');
  const locality = [office.city.trim(), office.state.trim()].filter(Boolean).join('/');
  const parts = [line, extra, locality].filter(Boolean);
  const base = parts.join(' — ');
  return office.zipCode ? `${base}${base ? ' · ' : ''}CEP ${office.zipCode}` : base;
}
