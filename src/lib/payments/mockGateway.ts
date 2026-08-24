import { PaymentStatus } from '../../types';

export interface GatewayCheckoutInput {
  paymentId: string;
  officeId: string;
  amount: number;
  description: string;
}

export interface GatewayCheckoutResult {
  paymentId: string;
  status: PaymentStatus;
  gateway: 'mock';
  externalId: string;
  checkoutUrl?: string;
}

export interface GatewayWebhookPayload {
  externalId: string;
  event: 'payment.paid' | 'payment.failed' | 'payment.cancelled' | 'payment.expired' | 'payment.refunded';
  receivedAt: string;
}

const configuredGateway = (import.meta.env.VITE_PAYMENTS_GATEWAY ?? 'mock').toLowerCase();

export function isPaymentsConfigured(): boolean {
  return configuredGateway === 'mock';
}

export function isDemoPaymentsEnvironment(): boolean {
  return import.meta.env.DEV || configuredGateway === 'mock';
}

export function createMockCheckout(input: GatewayCheckoutInput): GatewayCheckoutResult {
  return {
    paymentId: input.paymentId,
    status: 'processing',
    gateway: 'mock',
    externalId: `mock_${input.paymentId}`,
  };
}

export function simulateGatewayEvent(
  externalId: string,
  event: GatewayWebhookPayload['event'],
): GatewayWebhookPayload {
  return {
    externalId,
    event,
    receivedAt: new Date().toISOString(),
  };
}

export function statusFromWebhook(event: GatewayWebhookPayload['event']): PaymentStatus {
  switch (event) {
    case 'payment.paid':
      return 'paid';
    case 'payment.failed':
      return 'failed';
    case 'payment.cancelled':
      return 'cancelled';
    case 'payment.expired':
      return 'expired';
    case 'payment.refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}
