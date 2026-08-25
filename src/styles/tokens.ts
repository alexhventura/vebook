/**
 * VEBOOK Design System — tokens canônicos (JS/TS)
 * Espelho dos tokens CSS em `src/index.css` (@theme).
 *
 * Hierarquia visual:
 * 1. Azul-marinho (marca / ações primárias)
 * 2. Branco / cinza-claro (estrutura)
 * 3. Azul-claro (informação secundária)
 * 4. Mostarda (acento estratégico — uso contido)
 */

export const vebookColors = {
  navy: '#0B1E36',
  navyDeep: '#071527',
  navyMid: '#132C4D',
  navySoft: '#E8EEF4',

  gray: '#F1F5F9',
  surface: '#F8FAFC',

  blue: '#6B9EC4',
  blueSoft: '#E8F2F8',
  blueMuted: '#8BB0CC',

  mustard: '#C4A35A',
  mustardSoft: '#F6F0E4',
  mustardDeep: '#A8863F',

  white: '#FFFFFF',
  ink: '#0F172A',
  text: '#1E293B',
  muted: '#64748B',
  subtle: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  /** Funcional — não faz parte da identidade */
  error: '#B42318',
  errorSoft: '#FEF3F2',
} as const;

export const vebookRadius = {
  sm: '0.375rem',
  DEFAULT: '0.625rem',
  md: '0.75rem',
  lg: '1rem',
} as const;

export const vebookShadow = {
  DEFAULT: '0 1px 2px rgb(15 23 42 / 0.04)',
  md: '0 1px 3px rgb(15 23 42 / 0.06)',
} as const;

export const vebookSpace = {
  section: '5rem',
  sectionLg: '7rem',
  /** Escala previsível (px) */
  scale: [4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96] as const,
} as const;

export type VebookButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'inverse';
export type VebookButtonSize = 'sm' | 'md' | 'lg';
