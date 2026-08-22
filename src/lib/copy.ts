/** Termos oficiais do produto — usar em toda a interface. */

export const TERMS = {
  consultarVeiculo: 'Consultar veículo',
  veiculo: 'Veículo',
  oficina: 'Oficina',
  oficinas: 'Oficinas',
  paraOficinas: 'Para oficinas',
  historico: 'Histórico',
  registro: 'Registro',
  certidao: 'Certidão',
  proprietario: 'Proprietário',
  cliente: 'Cliente',
  comoFunciona: 'Como funciona',
  entrar: 'Entrar',
  slogan: 'A oficina registra. O cliente valida. A VEBOOK preserva.',
  tagline: 'O histórico que acompanha o veículo.',
} as const;

export const PAGE_TITLES: Record<string, string> = {
  home: 'VEBOOK — Histórico de manutenção do veículo',
  diario: 'Consultar veículo — VEBOOK',
  'como-funciona': 'Como funciona — VEBOOK',
  certidao: 'Certidão de histórico — VEBOOK',
  oficinas: 'Para oficinas — VEBOOK',
  'site-oficina': 'Página da oficina — VEBOOK',
  validacao: 'Validar registro — VEBOOK',
  transparencia: 'Transparência — VEBOOK',
};

export const SAMPLE_PLATES = [
  { plate: 'BRA2E19', label: 'Corolla' },
  { plate: 'ABC1D23', label: 'Compass' },
  { plate: 'XYZ9K88', label: 'T-Cross' },
] as const;
