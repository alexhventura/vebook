const RESERVED_SLUGS = new Set([
  'vebook',
  'www',
  'api',
  'app',
  'painel',
  'admin',
  'oficinas',
  'oficina',
  'diario',
  'certidao',
  'transparencia',
  'validacao',
  'login',
  'cadastro',
  'static',
  'assets',
  'mail',
  'ftp',
  'test',
  'staging',
  'prod',
  'suporte',
  'help',
  'status',
  'cdn',
  'blog',
  'docs',
  'home',
  'root',
  'smtp',
  'ns1',
  'ns2',
  'pagamento',
  'checkout',
  'webhook',
]);

export function normalizeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 32);
}

export function slugFromWorkshopName(name: string): string {
  const base = normalizeSlug(name);
  return base.length >= 3 ? base : 'oficina';
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(normalizeSlug(slug));
}

export function isValidSlugFormat(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  return /^[a-z][a-z0-9]{2,31}$/.test(normalized) && !isReservedSlug(normalized);
}

export function workshopHost(slug: string): string {
  return `${normalizeSlug(slug)}.vebook.com.br`;
}

export function suggestSlugAlternatives(desired: string, taken: Set<string>): string[] {
  const base = slugFromWorkshopName(desired) || 'oficina';
  const options: string[] = [];
  const candidates = [base, `${base}oficial`, `${base}auto`, `${base}2`, `${base}3`, `${base}oficina`];
  for (const candidate of candidates) {
    const slug = normalizeSlug(candidate);
    if (isValidSlugFormat(slug) && !taken.has(slug) && !options.includes(slug)) {
      options.push(slug);
    }
    if (options.length >= 3) break;
  }
  let suffix = 2;
  while (options.length < 3 && suffix < 50) {
    const slug = normalizeSlug(`${base}${suffix}`);
    if (isValidSlugFormat(slug) && !taken.has(slug)) options.push(slug);
    suffix += 1;
  }
  return options;
}
