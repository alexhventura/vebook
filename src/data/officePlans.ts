import { formatBRL } from '../lib/currency';
import { PlanModality } from '../types';

export const OFFICE_PLAN_ID = 'vebook-oficina';

/** Fonte única de verdade dos valores comerciais VEBOOK para oficinas. */
export const PLAN_OFFERS = {
  monthly: {
    firstYear: 49.9,
    renewal: 99.9,
  },
  annual: {
    firstYear: 499,
    renewal: 999,
    firstYearSavings: 99.8,
  },
} as const;

/** @deprecated Prefer PLAN_OFFERS — mantido para compatibilidade com store e assinaturas. */
export const OFFICE_PRICING = {
  year1Monthly: PLAN_OFFERS.monthly.firstYear,
  year1Annual: PLAN_OFFERS.annual.firstYear,
  year2Monthly: PLAN_OFFERS.monthly.renewal,
  year2Annual: PLAN_OFFERS.annual.renewal,
} as const;

const year1MonthlyGross = Number((PLAN_OFFERS.monthly.firstYear * 12).toFixed(2));

export const OFFICE_ANNUAL = {
  year1Gross: year1MonthlyGross,
  year1Amount: PLAN_OFFERS.annual.firstYear,
  year1Savings: PLAN_OFFERS.annual.firstYearSavings,
  year1EquivalentMonthly: Number((PLAN_OFFERS.annual.firstYear / 12).toFixed(2)),
  year2Amount: PLAN_OFFERS.annual.renewal,
};

export const PLAN_INCLUDED_ITEMS = [
  'Página pública da oficina',
  'Endereço público da oficina',
  'Painel de gestão',
  'Cadastro de clientes',
  'Cadastro de veículos',
  'Registro de atendimentos',
  'Histórico dos serviços realizados',
  'Agenda',
  'Controle interno de retornos',
  'Catálogo de serviços',
  'Catálogo de produtos',
  'Gestão financeira',
  'Personalização da página da oficina',
  'PWA instalável',
  'Presença na rede de oficinas VEBOOK',
] as const;

export function firstYearAmount(modality: PlanModality): number {
  return modality === 'annual' ? PLAN_OFFERS.annual.firstYear : PLAN_OFFERS.monthly.firstYear;
}

export function renewalAmountFor(modality: PlanModality): number {
  return modality === 'annual' ? PLAN_OFFERS.annual.renewal : PLAN_OFFERS.monthly.renewal;
}

export function contractedAmountFor(modality: PlanModality): number {
  return firstYearAmount(modality);
}

export function currentAmountFor(modality: PlanModality): number {
  return contractedAmountFor(modality);
}

export function planLabel(modality: PlanModality): string {
  return modality === 'annual' ? 'Plano anual' : 'Plano mensal';
}

export function planPeriodSuffix(modality: PlanModality): string {
  return modality === 'annual' ? '/ano' : '/mês';
}

export function planSummaryLines(modality: PlanModality): string[] {
  if (modality === 'annual') {
    return [
      `${formatBRL(PLAN_OFFERS.annual.firstYear)}/ano no primeiro ano — pagamento antecipado de 12 meses.`,
      `Economize ${formatBRL(PLAN_OFFERS.annual.firstYearSavings)} no primeiro ano em relação a 12 mensalidades.`,
      `Renovação: ${formatBRL(PLAN_OFFERS.annual.renewal)}/ano após o primeiro ano.`,
    ];
  }
  return [
    `${formatBRL(PLAN_OFFERS.monthly.firstYear)}/mês no primeiro ano. Cobrança mensal.`,
    `Renovação: ${formatBRL(PLAN_OFFERS.monthly.renewal)}/mês após o primeiro ano.`,
    'Cobrança recorrente no cartão.',
  ];
}

export function planCardsExplainer(): string[] {
  return [
    `Escolha como deseja pagar. O plano mensal tem cobrança recorrente. No plano anual, você garante 12 meses de acesso antecipadamente por ${formatBRL(PLAN_OFFERS.annual.firstYear)} no primeiro ano.`,
    'Os valores de renovação são apresentados antes da contratação.',
  ];
}

export function planPricingFootnote(): string {
  return `Primeiro ano: ${formatBRL(PLAN_OFFERS.monthly.firstYear)}/mês ou ${formatBRL(PLAN_OFFERS.annual.firstYear)}/ano. Após o primeiro ano: ${formatBRL(PLAN_OFFERS.monthly.renewal)}/mês ou ${formatBRL(PLAN_OFFERS.annual.renewal)}/ano. Valores não são alterados pelo painel.`;
}

export type ContractSummary = {
  modality: PlanModality;
  planTitle: string;
  firstYearLabel: string;
  firstYearAmount: string;
  renewalLabel: string;
  renewalAmount: string;
  savingsLabel?: string;
};

export function contractSummaryFor(modality: PlanModality): ContractSummary {
  const summary: ContractSummary = {
    modality,
    planTitle: planLabel(modality),
    firstYearLabel: 'Primeiro ano',
    firstYearAmount: `${formatBRL(firstYearAmount(modality))}${planPeriodSuffix(modality)}`,
    renewalLabel: 'Após o primeiro ano',
    renewalAmount: `${formatBRL(renewalAmountFor(modality))}${planPeriodSuffix(modality)}`,
  };
  if (modality === 'annual') {
    summary.savingsLabel = `Economia no primeiro ano: ${formatBRL(PLAN_OFFERS.annual.firstYearSavings)}`;
  }
  return summary;
}
