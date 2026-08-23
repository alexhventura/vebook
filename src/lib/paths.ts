import { AppView, TransparenciaSection } from '../types';

export const PATHS = {
  home: '/',
  consultar: '/consultar',
  historico: (placa: string) => `/historico/${placa}`,
  certidao: (placa?: string) => (placa ? `/certidao/${placa}` : '/certidao'),
  oficinas: '/oficinas',
  oficina: (slug: string) => `/oficina/${slug}`,
  oficinaAdmin: (slug: string) => `/oficina/${slug}/admin`,
  oficinaAdminModule: (slug: string, module: string) => `/oficina/${slug}/admin/${module}`,
  oficinaAdminLogin: (slug: string) => `/oficina/${slug}/admin/entrar`,
  cadastroOficina: '/oficina/cadastro',
  cadastroStep: (step: string) => `/oficina/cadastro/${step}`,
  entrarOficina: '/oficina/entrar',
  comoFunciona: '/como-funciona',
  sobre: '/sobre',
  faq: '/faq',
  termos: '/termos',
  privacidade: '/privacidade',
  cookies: '/cookies',
  seguranca: '/seguranca',
  contato: '/contato',
  validar: '/validar',
} as const;

export function pathForView(view: AppView): string {
  switch (view) {
    case 'home':
      return PATHS.home;
    case 'diario':
      return PATHS.consultar;
    case 'como-funciona':
      return PATHS.comoFunciona;
    case 'certidao':
      return PATHS.certidao();
    case 'oficinas':
      return PATHS.oficinas;
    case 'site-oficina':
      return PATHS.oficina('norte');
    case 'validacao':
      return PATHS.validar;
    case 'transparencia':
      return PATHS.faq;
    default:
      return PATHS.home;
  }
}

export function pathForSection(section: TransparenciaSection): string {
  switch (section) {
    case 'como-tratamos':
      return PATHS.sobre;
    case 'termos':
      return PATHS.termos;
    case 'privacidade':
      return PATHS.privacidade;
    case 'cookies':
      return PATHS.cookies;
    case 'seguranca':
      return PATHS.seguranca;
    case 'faq':
      return PATHS.faq;
    default:
      return `/transparencia/${section}`;
  }
}

export function sectionFromPath(pathname: string): TransparenciaSection | null {
  const map: Record<string, TransparenciaSection> = {
    '/sobre': 'como-tratamos',
    '/faq': 'faq',
    '/termos': 'termos',
    '/privacidade': 'privacidade',
    '/cookies': 'cookies',
    '/seguranca': 'seguranca',
  };
  if (map[pathname]) return map[pathname];
  const match = pathname.match(/^\/transparencia\/([^/]+)$/);
  return match ? (match[1] as TransparenciaSection) : null;
}

export const TITLE_BY_PATH: Record<string, string> = {
  '/': 'VEBOOK — Histórico de manutenção do veículo',
  '/consultar': 'Consultar veículo — VEBOOK',
  '/certidao': 'Certidão de histórico — VEBOOK',
  '/oficinas': 'Para oficinas — VEBOOK',
  '/oficina/cadastro': 'Cadastrar oficina — VEBOOK',
  '/oficina/entrar': 'Entrar na oficina — VEBOOK',
  '/como-funciona': 'Como funciona — VEBOOK',
  '/sobre': 'Como tratamos informações — VEBOOK',
  '/faq': 'FAQ — VEBOOK',
  '/termos': 'Termos de Uso — VEBOOK',
  '/privacidade': 'Privacidade — VEBOOK',
  '/cookies': 'Cookies — VEBOOK',
  '/seguranca': 'Segurança — VEBOOK',
  '/contato': 'Contato — VEBOOK',
  '/validar': 'Validar registro — VEBOOK',
};

export function titleForPath(pathname: string): string {
  if (pathname.startsWith('/historico/')) return 'Histórico do veículo — VEBOOK';
  if (pathname.startsWith('/certidao/')) return 'Certidão de histórico — VEBOOK';
  if (pathname.includes('/admin')) return 'Administração da oficina — VEBOOK';
  if (pathname.startsWith('/oficina/cadastro')) return 'Cadastrar oficina — VEBOOK';
  if (pathname.startsWith('/oficina/')) return 'Página da oficina — VEBOOK';
  if (pathname.startsWith('/transparencia/')) return 'Transparência — VEBOOK';
  return TITLE_BY_PATH[pathname] ?? 'VEBOOK';
}
