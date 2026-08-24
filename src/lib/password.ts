export interface PasswordRequirement {
  id: string;
  label: string;
  ok: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: 'len', label: 'Mínimo de 8 caracteres', ok: password.length >= 8 },
    { id: 'letter', label: 'Pelo menos uma letra', ok: /[A-Za-zÀ-ÿ]/.test(password) },
    { id: 'number', label: 'Pelo menos um número', ok: /\d/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return getPasswordRequirements(password).every((item) => item.ok);
}

export async function hashSecret(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash de senha com sal simples por CPF. Protótipo local — não substitui hashing no servidor. */
export async function hashPassword(cpf: string, password: string): Promise<string> {
  const digits = cpf.replace(/\D/g, '');
  return hashSecret(`vebook:${digits}:${password}`);
}

export async function verifyPassword(cpf: string, password: string, storedHash: string): Promise<boolean> {
  const next = await hashPassword(cpf, password);
  return next === storedHash;
}
