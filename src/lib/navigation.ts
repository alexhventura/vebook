import { AppView, TransparenciaSection } from '../types';

export interface RouteState {
  view: AppView;
  workshopSlug?: string;
  panelSection?: PanelSection;
  transparenciaSection?: TransparenciaSection;
}

export type PanelSection =
  | 'inicio'
  | 'minha-oficina'
  | 'clientes'
  | 'veiculos'
  | 'atendimentos'
  | 'retornos'
  | 'agenda';

export function parseHash(hash = window.location.hash): RouteState {
  const raw = hash.replace(/^#/, '') || '/';
  const path = raw.split('?')[0];
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'diario') return { view: 'diario' };
  if (parts[0] === 'como-funciona') return { view: 'como-funciona' };
  if (parts[0] === 'certidao') return { view: 'certidao' };
  if (parts[0] === 'validacao') return { view: 'validacao' };
  if (parts[0] === 'transparencia') {
    const section = parts[1] as TransparenciaSection | undefined;
    return { view: 'transparencia', transparenciaSection: section };
  }
  if (parts[0] === 'oficinas' && parts[1] === 'cadastro') {
    return { view: 'cadastro-oficina' };
  }
  if (parts[0] === 'oficinas') return { view: 'oficinas' };
  if (parts[0] === 'painel') {
    return { view: 'painel-oficina', panelSection: (parts[1] as PanelSection) || 'inicio' };
  }
  if (parts[0] === 'o' && parts[1]) {
    if (parts[2] === 'painel') {
      return {
        view: 'painel-oficina',
        workshopSlug: parts[1],
        panelSection: (parts[3] as PanelSection) || 'inicio',
      };
    }
    return { view: 'site-oficina', workshopSlug: parts[1] };
  }
  if (parts[0] === 'site-oficina') return { view: 'site-oficina' };
  return { view: 'home' };
}

export function toHash(state: RouteState): string {
  switch (state.view) {
    case 'home':
      return '#/';
    case 'diario':
      return '#/diario';
    case 'como-funciona':
      return '#/como-funciona';
    case 'certidao':
      return '#/certidao';
    case 'oficinas':
      return '#/oficinas';
    case 'cadastro-oficina':
      return '#/oficinas/cadastro';
    case 'validacao':
      return '#/validacao';
    case 'transparencia':
      return state.transparenciaSection
        ? `#/transparencia/${state.transparenciaSection}`
        : '#/transparencia';
    case 'site-oficina':
      return state.workshopSlug ? `#/o/${state.workshopSlug}` : '#/o/prisma';
    case 'painel-oficina': {
      const section = state.panelSection && state.panelSection !== 'inicio' ? `/${state.panelSection}` : '';
      return state.workshopSlug ? `#/o/${state.workshopSlug}/painel${section}` : `#/painel${section}`;
    }
    default:
      return '#/';
  }
}

export function applyHash(state: RouteState): void {
  const next = toHash(state);
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}
