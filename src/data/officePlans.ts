import { formatBRL } from '../lib/currency';
import { PlanModality } from '../types';

export const OFFICE_PLAN_ID = 'vebook-oficina';

export const OFFICE_PRICING = {
  year1Monthly: 49.9,
  year2Monthly: 99.9,
  annualDiscount: 0.1,
} as const;

const year1AnnualGross = OFFICE_PRICING.year1Monthly * 12;
const year2AnnualGross = OFFICE_PRICING.year2Monthly * 12;

export const OFFICE_ANNUAL = {
  year1Gross: Number(year1AnnualGross.toFixed(2)),
  year1Net: Number((year1AnnualGross * (1 - OFFICE_PRICING.annualDiscount)).toFixed(2)),
  year2Gross: Number(year2AnnualGross.toFixed(2)),
  year2Net: Number((year2AnnualGross * (1 - OFFICE_PRICING.annualDiscount)).toFixed(2)),
};

export function contractedAmountFor(modality: PlanModality): number {
  return modality === 'annual' ? OFFICE_ANNUAL.year1Net : OFFICE_PRICING.year1Monthly;
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
      `${formatBRL(OFFICE_ANNUAL.year1Net)} no primeiro ano (${formatBRL(OFFICE_PRICING.year1Monthly)} × 12, com 10% de desconto).`,
      `A partir do segundo ano: ${formatBRL(OFFICE_ANNUAL.year2Net)}/ano (${formatBRL(OFFICE_PRICING.year2Monthly)} × 12, com 10% de desconto).`,
      'Cobrança recorrente no cartão. 10% de desconto sobre o valor vigente.',
    ];
  }
  return [
    `${formatBRL(OFFICE_PRICING.year1Monthly)}/mês no primeiro ano.`,
    `A partir do segundo ano: ${formatBRL(OFFICE_PRICING.year2Monthly)}/mês.`,
    'Cobrança recorrente no cartão.',
  ];
}
