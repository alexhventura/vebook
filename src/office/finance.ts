import { DateRange, inRange } from './period';
import {
  GlobalProduct,
  isProductRevenue,
  OfficeAppointment,
  OfficeClient,
  OfficeId,
  OfficeReturn,
  OfficeVehicle,
  OfficeWorkOrder,
  PRODUCT_ORIGIN_LABELS,
} from './types';

export interface OfficeFinanceSummary {
  billed: number;
  received: number;
  receivable: number;
  labor: number;
  productsRevenue: number;
  productsCost: number;
  margin: number;
  ticketAverage: number;
  workOrderCount: number;
  byOrigin: Array<{ origin: string; quantity: number; revenue: number; cost: number }>;
  byService: Array<{ label: string; count: number; labor: number; revenue: number }>;
}

export function previousRange(range: DateRange): DateRange {
  const ms = range.to.getTime() - range.from.getTime();
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - ms);
  return { preset: 'custom', from, to };
}

export function workOrdersInRange(orders: OfficeWorkOrder[], range: DateRange): OfficeWorkOrder[] {
  return orders.filter((item) => item.status !== 'cancelado' && inRange(item.date, range));
}

export function summarizeFinance(orders: OfficeWorkOrder[], range: DateRange): OfficeFinanceSummary {
  const scoped = workOrdersInRange(orders, range);
  const billed = scoped.reduce((sum, item) => sum + item.amount, 0);
  const received = scoped.reduce((sum, item) => sum + item.amountReceived, 0);
  const receivable = Math.max(0, billed - received);
  const labor = scoped.reduce((sum, item) => sum + item.laborTotal, 0);
  const productsRevenue = scoped.reduce((sum, item) => sum + item.productsRevenue, 0);
  const productsCost = scoped.reduce((sum, item) => sum + item.productsCost, 0);
  const originMap = new Map<string, { quantity: number; revenue: number; cost: number }>();
  const serviceMap = new Map<string, { count: number; labor: number; revenue: number }>();

  scoped.forEach((order) => {
    order.products.forEach((line) => {
      const key = PRODUCT_ORIGIN_LABELS[line.origin];
      const current = originMap.get(key) ?? { quantity: 0, revenue: 0, cost: 0 };
      current.quantity += line.quantity;
      if (isProductRevenue(line)) current.revenue += line.unitPrice * line.quantity;
      if (line.origin !== 'cliente') current.cost += line.unitCost * line.quantity;
      originMap.set(key, current);
    });
    order.services.forEach((line) => {
      const key = line.description || line.category;
      const current = serviceMap.get(key) ?? { count: 0, labor: 0, revenue: 0 };
      current.count += line.quantity;
      current.labor += line.laborAmount * line.quantity;
      current.revenue += line.laborAmount * line.quantity;
      serviceMap.set(key, current);
    });
  });

  return {
    billed,
    received,
    receivable,
    labor,
    productsRevenue,
    productsCost,
    margin: billed - productsCost,
    ticketAverage: scoped.length ? billed / scoped.length : 0,
    workOrderCount: scoped.length,
    byOrigin: Array.from(originMap.entries()).map(([origin, stats]) => ({ origin, ...stats })),
    byService: Array.from(serviceMap.entries())
      .map(([label, stats]) => ({ label, ...stats }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}

export function dashboardMetrics(input: {
  orders: OfficeWorkOrder[];
  clients: OfficeClient[];
  vehicles: OfficeVehicle[];
  returns: OfficeReturn[];
  appointments: OfficeAppointment[];
  range: DateRange;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const orders = workOrdersInRange(input.orders, input.range);
  const prev = previousRange(input.range);
  const prevOrders = workOrdersInRange(input.orders, prev);
  const finance = summarizeFinance(input.orders, input.range);
  const prevFinance = summarizeFinance(input.orders, prev);

  const newClients = input.clients.filter((c) => inRange(c.createdAt, input.range));
  const servedClientIds = new Set(orders.map((o) => o.clientId));
  const servedVehicleIds = new Set(orders.map((o) => o.vehicleId));

  const returnsUpcoming = input.returns.filter((item) => {
    const due = new Date(item.dueDate);
    return due >= now && inRange(item.dueDate, { preset: 'custom', from: now, to: input.range.to });
  });

  const returnsDueSoon = {
    today: input.returns.filter((r) => new Date(r.dueDate).toDateString() === now.toDateString()),
    next7: input.returns.filter((r) => {
      const due = new Date(r.dueDate);
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return due >= now && due <= end;
    }),
    next30: input.returns.filter((r) => {
      const due = new Date(r.dueDate);
      const end = new Date(now);
      end.setDate(end.getDate() + 30);
      return due >= now && due <= end;
    }),
  };

  const returnsOverdue = input.returns.filter((r) => new Date(r.dueDate) < now);

  const todayAgenda = input.appointments
    .filter((a) => new Date(a.startsAt).toDateString() === now.toDateString())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const deltaPct = (current: number, previous: number) => {
    if (!previous) return current ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    orders,
    prevOrders,
    finance,
    prevFinance,
    newClients,
    servedClientIds,
    servedVehicleIds,
    returnsUpcoming,
    returnsDueSoon,
    returnsOverdue,
    todayAgenda,
    comparisons: {
      attendances: deltaPct(orders.length, prevOrders.length),
      billing: deltaPct(finance.billed, prevFinance.billed),
    },
  };
}

export function productUsageLabel(products: GlobalProduct[], productId: string): string {
  const product = products.find((p) => p.id === productId);
  return product ? `${product.name} · ${product.brand}` : productId;
}

export type { OfficeId };
