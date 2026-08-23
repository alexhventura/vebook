/**
 * Inteligência de Mercado — apenas agregados anonimizados do ecossistema VEBOOK.
 * Nunca expõe oficina, cliente, CPF, preço individual, custo ou fornecedor.
 */

import { DateRange, inRange } from './period';
import { GlobalProduct, OfficeEcosystemState, OfficeVehicle, OfficeWorkOrder, RETURN_REASON_LABELS, SERVICE_CATEGORY_LABELS } from './types';

export const INTELLIGENCE_MIN_SAMPLE = 5;

export interface IntelligenceQuery {
  brand?: string;
  model?: string;
  year?: number;
  productQuery?: string;
  productBrand?: string;
  productCode?: string;
  category?: string;
  serviceCategory?: string;
  range?: DateRange;
}

export interface IntelligenceBucket {
  label: string;
  count: number;
  share: number;
}

export interface IntelligenceResult {
  sampleSize: number;
  sufficient: boolean;
  message: string;
  products: IntelligenceBucket[];
  productBrands: IntelligenceBucket[];
  vehicleBrands: IntelligenceBucket[];
  vehicleModels: IntelligenceBucket[];
  vehicleYears: IntelligenceBucket[];
  services: IntelligenceBucket[];
  serviceCategories: IntelligenceBucket[];
  returnWindows: IntelligenceBucket[];
  disclaimer: string;
}

function shareBuckets(map: Map<string, number>, total: number, limit = 8): IntelligenceBucket[] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: total ? count / total : 0,
    }));
}

function matchesVehicle(vehicle: OfficeVehicle, query: IntelligenceQuery): boolean {
  if (query.brand && !vehicle.brand.toLowerCase().includes(query.brand.toLowerCase())) return false;
  if (query.model && !vehicle.model.toLowerCase().includes(query.model.toLowerCase())) return false;
  if (query.year && vehicle.year !== query.year) return false;
  return true;
}

function matchesProduct(product: GlobalProduct | undefined, query: IntelligenceQuery): boolean {
  if (!product) return false;
  if (query.productBrand && !product.brand.toLowerCase().includes(query.productBrand.toLowerCase())) return false;
  if (query.productCode && !product.code.toLowerCase().includes(query.productCode.toLowerCase())) return false;
  if (query.category && !product.category.toLowerCase().includes(query.category.toLowerCase())) return false;
  if (query.productQuery) {
    const hay = `${product.name} ${product.brand} ${product.code} ${product.category} ${product.application ?? ''}`.toLowerCase();
    if (!query.productQuery.toLowerCase().split(/\s+/).every((token) => hay.includes(token))) return false;
  }
  return true;
}

function returnWindowLabel(lastService: string, due: string): string {
  const days = Math.round((new Date(due).getTime() - new Date(lastService).getTime()) / 86400000);
  if (days <= 45) return 'Até 1,5 mês';
  if (days <= 120) return 'Entre 1,5 e 4 meses';
  if (days <= 200) return 'Entre 4 e 7 meses';
  if (days <= 400) return 'Entre 6 e 12 meses';
  return 'Acima de 12 meses';
}

/**
 * Agrega registros do ecossistema sem metadados identificáveis.
 * O VEBOOK apenas apresenta os dados registrados — sem recomendação.
 */
export function buildMarketIntelligence(state: OfficeEcosystemState, query: IntelligenceQuery = {}): IntelligenceResult {
  const productById = new Map(state.globalProducts.map((p) => [p.id, p]));
  const vehicleById = new Map(state.vehicles.map((v) => [v.id, v]));

  const relevantOrders: OfficeWorkOrder[] = state.workOrders.filter((order) => {
    if (order.status === 'cancelado') return false;
    if (query.range && !inRange(order.date, query.range)) return false;
    const vehicle = vehicleById.get(order.vehicleId);
    if (!vehicle || !matchesVehicle(vehicle, query)) return false;
    if (query.serviceCategory) {
      if (!order.services.some((s) => s.category === query.serviceCategory)) return false;
    }
    if (query.productQuery || query.productBrand || query.productCode || query.category) {
      if (!order.products.some((line) => matchesProduct(productById.get(line.productId), query))) return false;
    }
    return true;
  });

  const productCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  const vehicleBrandCounts = new Map<string, number>();
  const vehicleModelCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();
  const serviceCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const returnCounts = new Map<string, number>();

  let productEvents = 0;
  let serviceEvents = 0;

  relevantOrders.forEach((order) => {
    const vehicle = vehicleById.get(order.vehicleId);
    if (vehicle) {
      vehicleBrandCounts.set(vehicle.brand, (vehicleBrandCounts.get(vehicle.brand) ?? 0) + 1);
      vehicleModelCounts.set(`${vehicle.brand} ${vehicle.model}`, (vehicleModelCounts.get(`${vehicle.brand} ${vehicle.model}`) ?? 0) + 1);
      yearCounts.set(String(vehicle.year), (yearCounts.get(String(vehicle.year)) ?? 0) + 1);
    }

    order.products.forEach((line) => {
      const product = productById.get(line.productId);
      if (!product) return;
      if (query.productQuery || query.productBrand || query.productCode || query.category) {
        if (!matchesProduct(product, query)) return;
      }
      productEvents += line.quantity;
      const label = `${product.name} · ${product.brand}`;
      productCounts.set(label, (productCounts.get(label) ?? 0) + line.quantity);
      brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + line.quantity);
    });

    order.services.forEach((line) => {
      serviceEvents += line.quantity;
      serviceCounts.set(line.description, (serviceCounts.get(line.description) ?? 0) + line.quantity);
      const cat = SERVICE_CATEGORY_LABELS[line.category];
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + line.quantity);
    });

    if (order.returnDueDate) {
      const window = returnWindowLabel(order.date, order.returnDueDate);
      returnCounts.set(window, (returnCounts.get(window) ?? 0) + 1);
      if (order.returnReason) {
        const reason = RETURN_REASON_LABELS[order.returnReason];
        returnCounts.set(`Motivo: ${reason}`, (returnCounts.get(`Motivo: ${reason}`) ?? 0) + 1);
      }
    }
  });

  const sampleSize = relevantOrders.length;
  const sufficient = sampleSize >= INTELLIGENCE_MIN_SAMPLE;

  return {
    sampleSize,
    sufficient,
    message: sufficient
      ? 'Dados registrados no VEBOOK (agregados e anonimizados).'
      : 'Dados insuficientes para exibição consolidada.',
    products: sufficient ? shareBuckets(productCounts, productEvents) : [],
    productBrands: sufficient ? shareBuckets(brandCounts, productEvents) : [],
    vehicleBrands: sufficient ? shareBuckets(vehicleBrandCounts, sampleSize) : [],
    vehicleModels: sufficient ? shareBuckets(vehicleModelCounts, sampleSize) : [],
    vehicleYears: sufficient ? shareBuckets(yearCounts, sampleSize) : [],
    services: sufficient ? shareBuckets(serviceCounts, serviceEvents) : [],
    serviceCategories: sufficient ? shareBuckets(categoryCounts, serviceEvents) : [],
    returnWindows: sufficient ? shareBuckets(returnCounts, sampleSize) : [],
    disclaimer:
      'O VEBOOK apenas apresenta os dados registrados em sua plataforma. Não recomenda, aprova, reprova nem certifica produtos, prazos ou práticas.',
  };
}
