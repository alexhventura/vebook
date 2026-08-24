import { formatBRL } from '../lib/currency';
import { PlanModality } from '../types';

export const OFFICE_PLAN_ID = 'vebook-oficina';

/** Fonte única de verdade dos valores comerciais VEBOOK para oficinas. */
export const OFFICE_PRICING = {
  year1Monthly: 49.9,
  year1Annual: 499,
  year2Monthly: 99.9,
  year2Annual: 999,
} as const;

const year1MonthlyGross = Number((OFFICE_PRICING.year1Monthly * 12).toFixed(2));

export const OFFICE_ANNUAL = {
  /** Soma de 12 meses no plano mensal do primeiro ano (referência de comparação). */
  year1Gross: year1MonthlyGross,
  /** Valor fixo do plano anual no primeiro ano. */
  year1Amount: OFFICE_PRICING.year1Annual,
  /** Economia em relação a 12 × mensal no primeiro ano. */
  year1Savings: Number((year1MonthlyGross - OFFICE_PRICING.year1Annual).toFixed(2)),
  /** Equivalente mensal do plano anual no primeiro ano. */
  year1EquivalentMonthly: Number((OFFICE_PRICING.year1Annual / 12).toFixed(2)),
  /** Valor fixo da renovação anual. */
  year2Amount: OFFICE_PRICING.year2Annual,
};

export function contractedAmountFor(modality: PlanModality): number {
  return modality === 'annual' ? OFFICE_PRICING.year1Annual : OFFICE_PRICING.year1Monthly;
}

export function renewalAmountFor(modality: PlanModality): number {
  return modality === 'annual' ? OFFICE_PRICING.year2Annual : OFFICE_PRICING.year2Monthly;
}

export function currentAmountFor(modality: PlanModality): number {
  return contractedAmountFor(modality);
}

export function planLabel(modality: PlanModality): string {
  return modality === 'annual' ? 'Plano anual' : 'Plano mensal';
}

export function planSummaryLines(modality: PlanModality): string[] {
  if (modality === 'annual') {
    return [
      `${formatBRL(OFFICE_PRICING.year1Annual)} no primeiro ano — pagamento antecipado de 12 meses.`,
      `Economize ${formatBRL(OFFICE_ANNUAL.year1Savings)} em relação a 12 meses no plano mensal.`,
      `Equivale a aproximadamente ${formatBRL(OFFICE_ANNUAL.year1EquivalentMonthly)}/mês.`,
      `Renovação: ${formatBRL(OFFICE_PRICING.year2Annual)}/ano.`,
    ];
  }
  return [
    `${formatBRL(OFFICE_PRICING.year1Monthly)}/mês no primeiro ano. Cobrança mensal.`,
    `Renovação: ${formatBRL(OFFICE_PRICING.year2Monthly)}/mês.`,
    'Cobrança recorrente no cartão.',
  ];
}

export function planCardsExplainer(): string[] {
  return [
    `Escolha como deseja pagar. O plano mensal tem cobrança recorrente. No plano anual, você garante 12 meses de acesso antecipadamente por ${formatBRL(OFFICE_PRICING.year1Annual)} no primeiro ano.`,
    'Os valores de renovação são apresentados antes da contratação.',
  ];
}

export function planPricingFootnote(): string {
  return `Primeiro ano: ${formatBRL(OFFICE_PRICING.year1Monthly)}/mês ou ${formatBRL(OFFICE_PRICING.year1Annual)}/ano. Após o primeiro ano: ${formatBRL(OFFICE_PRICING.year2Monthly)}/mês ou ${formatBRL(OFFICE_PRICING.year2Annual)}/ano. Valores não são alterados pelo painel.`;
}
