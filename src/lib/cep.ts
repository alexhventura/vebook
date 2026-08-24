import { onlyDigits } from './cpf';

export interface CepAddress {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export async function lookupCep(value: string): Promise<CepAddress | null> {
  const cep = onlyDigits(value);
  if (cep.length !== 8) return null;
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) return null;
  const data = (await response.json()) as {
    erro?: boolean;
    cep?: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };
  if (data.erro) return null;
  return {
    zipCode: formatCep(cep),
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}
