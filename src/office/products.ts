import { GlobalProduct } from './types';
import { onlyDigits } from './validation';

export function normalizeProductText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function productNormalizedKey(name: string, brand: string, code: string): string {
  return [normalizeProductText(name), normalizeProductText(brand), normalizeProductText(code)].join('|');
}

export function productSearchHaystack(product: GlobalProduct): string {
  return normalizeProductText(
    [product.name, product.brand, product.code, product.category, product.application ?? ''].join(' ')
  );
}

/** Busca parcial no catálogo global (nome, marca, código, categoria, aplicação). */
export function searchGlobalProducts(products: GlobalProduct[], query: string, limit = 20): GlobalProduct[] {
  const q = normalizeProductText(query);
  if (!q) return products.slice(0, limit);
  const tokens = q.split(' ').filter(Boolean);
  return products
    .map((product) => {
      const hay = productSearchHaystack(product);
      const score = tokens.every((token) => hay.includes(token))
        ? tokens.reduce((acc, token) => acc + (hay.startsWith(token) ? 3 : hay.includes(token) ? 1 : 0), 0)
        : 0;
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((item) => item.product);
}

export function findDuplicateCandidates(
  products: GlobalProduct[],
  name: string,
  brand: string,
  code: string
): GlobalProduct[] {
  const key = productNormalizedKey(name, brand, code);
  const nameBrand = `${normalizeProductText(name)}|${normalizeProductText(brand)}`;
  const codeDigits = onlyDigits(code);
  return products.filter((product) => {
    if (product.normalizedKey === key) return true;
    if (`${normalizeProductText(product.name)}|${normalizeProductText(product.brand)}` === nameBrand) return true;
    if (codeDigits && onlyDigits(product.code) === codeDigits) return true;
    return false;
  });
}
