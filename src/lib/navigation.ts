import { AppView, TransparenciaSection } from '../types';
import { formatPlate, isValidPlateFormat } from './utils';

export interface RouteState {
  view: AppView;
  workshopSlug?: string;
  panelSection?: PanelSection;
  panelTab?: string;
  transparenciaSection?: TransparenciaSection;
  certificateCode?: string;
  /** Página da Certidão quando o QR aponta para ?p=N */
  certificatePage?: number;
  /** Placa na consulta gratuita (#/diario/PLACA ou ?placa=) — ex.: QR no vidro */
  consultaPlate?: string;
}

export type PanelSection =
  | 'inicio'
  | 'atendimentos'
  | 'agenda'
  | 'clientes'
  | 'veiculos'
  | 'servicos'
  | 'produtos'
  | 'financeiro'
  | 'minha-oficina'
  | 'perfil'
  | 'configuracoes';

/** @deprecated Retornos integrados em Agenda — redireciona para agenda?tab=retornos */
export type LegacyPanelSection = 'retornos';

export function parseHash(hash = window.location.hash): RouteState {
  const raw = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart;
  const params = new URLSearchParams(queryPart || '');
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'diario') {
    const fromPath = parts[1] ? formatPlate(decodeURIComponent(parts[1])) : '';
    const fromQuery = params.get('placa') ? formatPlate(params.get('placa')!) : '';
    const plate = [fromPath, fromQuery].find((p) => p && isValidPlateFormat(p));
    return { view: 'diario', consultaPlate: plate || undefined };
  }
  if (parts[0] === 'como-funciona') return { view: 'como-funciona' };
  if (parts[0] === 'certidao') return { view: 'certidao' };
  if (parts[0] === 'validacao') return { view: 'validacao' };
  if (parts[0] === 'validar' && parts[1]) {
    const pageRaw = params.get('p');
    const pageNum = pageRaw ? Number(pageRaw) : undefined;
    return {
      view: 'validar-certidao',
      certificateCode: decodeURIComponent(parts[1]),
      certificatePage:
        pageNum && Number.isFinite(pageNum) && pageNum > 0 ? pageNum : undefined,
    };
  }
  if (parts[0] === 'validar') return { view: 'validar-certidao' };
  if (parts[0] === 'transparencia') {
    const section = parts[1] as TransparenciaSection | undefined;
    return { view: 'transparencia', transparenciaSection: section };
  }
  if (parts[0] === 'oficinas' && parts[1] === 'cadastro') {
    return { view: 'cadastro-oficina' };
  }
  if (parts[0] === 'oficinas') return { view: 'oficinas' };
  if (parts[0] === 'painel') {
    const sectionRaw = parts[1] || 'inicio';
    if (sectionRaw === 'retornos') {
      return { view: 'painel-oficina', panelSection: 'agenda', panelTab: 'retornos' };
    }
    return {
      view: 'painel-oficina',
      panelSection: (sectionRaw as PanelSection) || 'inicio',
      panelTab: params.get('tab') || undefined,
    };
  }
  if (parts[0] === 'o' && parts[1]) {
    if (parts[2] === 'painel') {
      const sectionRaw = parts[3] || 'inicio';
      if (sectionRaw === 'retornos') {
        return { view: 'painel-oficina', workshopSlug: parts[1], panelSection: 'agenda', panelTab: 'retornos' };
      }
      return {
        view: 'painel-oficina',
        workshopSlug: parts[1],
        panelSection: (sectionRaw as PanelSection) || 'inicio',
        panelTab: params.get('tab') || undefined,
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
      return state.consultaPlate
        ? `#/diario/${encodeURIComponent(state.consultaPlate)}`
        : '#/diario';
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
    case 'validar-certidao': {
      if (!state.certificateCode) return '#/validar';
      const page =
        state.certificatePage && state.certificatePage > 0
          ? `?p=${state.certificatePage}`
          : '';
      return `#/validar/${encodeURIComponent(state.certificateCode)}${page}`;
    }
    case 'transparencia':
      return state.transparenciaSection
        ? `#/transparencia/${state.transparenciaSection}`
        : '#/transparencia';
    case 'site-oficina':
      return state.workshopSlug ? `#/o/${state.workshopSlug}` : '#/o/prisma';
    case 'painel-oficina': {
      const section = state.panelSection && state.panelSection !== 'inicio' ? `/${state.panelSection}` : '';
      const tab = state.panelTab ? `?tab=${encodeURIComponent(state.panelTab)}` : '';
      return state.workshopSlug
        ? `#/o/${state.workshopSlug}/painel${section}${tab}`
        : `#/painel${section}${tab}`;
    }
    default:
      return '#/';
  }
}

export function buildConsultaVeicularUrl(plate: string): string {
  const clean = formatPlate(plate);
  if (!clean || !isValidPlateFormat(clean)) return '#/diario';
  return `#/diario/${encodeURIComponent(clean)}`;
}

export function applyHash(state: RouteState): void {
  const next = toHash(state);
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}
