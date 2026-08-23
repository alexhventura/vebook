import { OfficeHours, OfficeHoursDay } from './types';

export const OFFICE_DOMAIN = 'vebook.com.br';

export const RESERVED_HOSTNAMES = [
  'www',
  'admin',
  'api',
  'app',
  'suporte',
  'ajuda',
  'conta',
  'login',
  'cadastro',
  'painel',
  'portal',
  'sistema',
  'seguranca',
  'certidao',
  'consultar',
  'oficinas',
  'contato',
  'vebook',
  'mail',
  'ftp',
  'static',
  'cdn',
  'status',
] as const;

export const SERVICE_CATALOG = [
  { key: 'oleo', name: 'Troca de óleo' },
  { key: 'freios', name: 'Freios' },
  { key: 'suspensao', name: 'Suspensão' },
  { key: 'alinhamento', name: 'Alinhamento' },
  { key: 'balanceamento', name: 'Balanceamento' },
  { key: 'injecao', name: 'Injeção eletrônica' },
  { key: 'eletrica', name: 'Elétrica' },
  { key: 'ar', name: 'Ar-condicionado' },
  { key: 'diagnostico', name: 'Diagnóstico' },
  { key: 'revisao', name: 'Revisão' },
  { key: 'motor', name: 'Motor' },
  { key: 'cambio', name: 'Câmbio' },
  { key: 'embreagem', name: 'Embreagem' },
  { key: 'pneus', name: 'Pneus' },
  { key: 'outros', name: 'Outros' },
] as const;

export const ONBOARDING_STEPS = [
  { id: 'identificacao', label: 'Identificação', number: 1 },
  { id: 'endereco', label: 'Endereço', number: 2 },
  { id: 'identidade', label: 'Identidade', number: 3 },
  { id: 'servicos', label: 'Serviços', number: 4 },
  { id: 'atendimento', label: 'Atendimento', number: 5 },
  { id: 'subdominio', label: 'Endereço digital', number: 6 },
  { id: 'acesso', label: 'Acesso', number: 7 },
  { id: 'revisao', label: 'Revisão', number: 8 },
  { id: 'concluido', label: 'Publicação', number: 9 },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

export const WEAK_PASSWORDS = [
  '123456',
  '12345678',
  '123456789',
  'password',
  'senha',
  'senha123',
  'qwerty',
  'abc123',
  '000000',
  '111111',
  'oficina',
  'vebook',
  'admin',
  'admin123',
];

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const WEEKDAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const WEEKDAY_LABELS: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function defaultHoursDay(enabled: boolean, open = '08:00', close = '18:00'): OfficeHoursDay {
  return { enabled, open, close };
}

export function defaultOfficeHours(): OfficeHours {
  return {
    monday: defaultHoursDay(true),
    tuesday: defaultHoursDay(true),
    wednesday: defaultHoursDay(true),
    thursday: defaultHoursDay(true),
    friday: defaultHoursDay(true),
    saturday: defaultHoursDay(true, '08:00', '13:00'),
    sunday: defaultHoursDay(false, '08:00', '12:00'),
  };
}

export function publicOfficeUrl(hostname: string): string {
  return `https://${hostname}.${OFFICE_DOMAIN}`;
}

export function displayOfficeHost(hostname: string): string {
  return `${hostname}.${OFFICE_DOMAIN}`;
}
