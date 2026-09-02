/** Cor de tema da página pública da oficina (hex CSS). */

export const DEFAULT_THEME_COLOR = '#0B1E36';

const PRESET_HEX: Record<string, string> = {
  amber: '#F59E0B',
  blue: '#0EA5E9',
  emerald: '#059669',
  rose: '#E11D48',
  indigo: '#4F46E5',
};

/** Normaliza valor legado (preset) ou hex para `#RRGGBB`. */
export function normalizeThemeColor(value: string | undefined | null): string {
  if (!value) return DEFAULT_THEME_COLOR;
  const trimmed = value.trim();
  const preset = PRESET_HEX[trimmed.toLowerCase()];
  if (preset) return preset;
  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return DEFAULT_THEME_COLOR;
}

/** Texto legível sobre a cor de fundo (branco ou navy). */
export function contrastTextOn(hex: string): string {
  const normalized = normalizeThemeColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0B1E36' : '#FFFFFF';
}

/** Versão mais clara da cor (fundos suaves). */
export function themeTint(hex: string, alpha = 0.12): string {
  const normalized = normalizeThemeColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
