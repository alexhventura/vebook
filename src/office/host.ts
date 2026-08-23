import { OFFICE_DOMAIN, RESERVED_HOSTNAMES } from './constants';
import { OfficeHostname } from './types';

export type TenantResolution =
  | { kind: 'portal' }
  | { kind: 'office'; hostname: string; redirectedFrom?: string }
  | { kind: 'unknown-host'; hostname: string };

const PORTAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  OFFICE_DOMAIN,
  `www.${OFFICE_DOMAIN}`,
]);

/**
 * Resolve o tenant a partir do hostname (preparado para wildcard *.vebook.com.br)
 * e, em demonstração local, a partir do caminho /oficina/:slug.
 */
export function resolveTenantFromHostname(hostname: string): TenantResolution {
  const host = hostname.toLowerCase().split(':')[0];
  if (PORTAL_HOSTS.has(host)) return { kind: 'portal' };

  const suffix = `.${OFFICE_DOMAIN}`;
  if (host.endsWith(suffix)) {
    const slug = host.slice(0, -suffix.length);
    if (!slug || slug.includes('.') || RESERVED_HOSTNAMES.includes(slug as (typeof RESERVED_HOSTNAMES)[number])) {
      return { kind: 'portal' };
    }
    return { kind: 'office', hostname: slug };
  }

  return { kind: 'portal' };
}

export function applyHostnameHistory(
  resolution: TenantResolution,
  history: OfficeHostname[]
): TenantResolution {
  if (resolution.kind !== 'office') return resolution;
  const records = history.filter((item) => item.hostname === resolution.hostname);
  const current = records.find((item) => item.isCurrent && item.status === 'active');
  if (current) return resolution;
  const retired = records.find((item) => item.status === 'retired' && item.redirectTo);
  if (retired?.redirectTo) {
    return { kind: 'office', hostname: retired.redirectTo, redirectedFrom: resolution.hostname };
  }
  const reserved = records.find((item) => item.status === 'reserved' || item.status === 'active');
  if (reserved) return { kind: 'office', hostname: reserved.hostname };
  return { kind: 'unknown-host', hostname: resolution.hostname };
}

export function slugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/oficina\/([^/]+)/);
  if (!match) return null;
  const slug = match[1];
  if (slug === 'cadastro' || slug === 'entrar') return null;
  return slug;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') || /\/oficina\/[^/]+\/admin/.test(pathname);
}
