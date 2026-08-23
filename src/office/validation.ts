import { RESERVED_HOSTNAMES, WEAK_PASSWORDS } from './constants';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, '$1-$2');
}

function cpfCheckDigits(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

function cnpjCheckDigits(digits: string): boolean {
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const calc = (len: number) => {
    const weights = len === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(digits[12]) && calc(13) === Number(digits[13]);
}

export function isValidCpf(value: string): boolean {
  return cpfCheckDigits(onlyDigits(value));
}

export function isValidCnpj(value: string): boolean {
  return cnpjCheckDigits(onlyDigits(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 10 || d.length === 11;
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function normalizeHostname(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

export function hostnameError(value: string): string | null {
  const host = normalizeHostname(value);
  if (host.length < 3) return 'Use no mínimo 3 caracteres.';
  if (host.length > 30) return 'Use no máximo 30 caracteres.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(host)) {
    return 'Use apenas letras minúsculas, números e hífen.';
  }
  if (RESERVED_HOSTNAMES.includes(host as (typeof RESERVED_HOSTNAMES)[number])) {
    return 'Este endereço é reservado pela plataforma.';
  }
  return null;
}

export function passwordError(password: string, confirmation?: string): string | null {
  if (password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) return 'Esta senha é demasiado óbvia para uso administrativo.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Combine letras e números.';
  }
  if (confirmation !== undefined && password !== confirmation) return 'A confirmação não confere.';
  return null;
}

/** Fingerprint de demonstração. Não é autenticação e não deve ser tratado como hash seguro. */
export function demoFingerprint(secret: string): string {
  let h = 2166136261;
  const s = `vebook-demo:${secret}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `demo:${(h >>> 0).toString(16).padStart(8, '0')}`;
}
