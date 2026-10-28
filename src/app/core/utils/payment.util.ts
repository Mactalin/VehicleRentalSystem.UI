import { PaymentMethod } from '../models/enums';
import { PaymentDto } from '../models/payment.models';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  Upi: 'UPI',
  Card: 'Card',
  NetBanking: 'Net banking',
  Cash: 'Cash'
};

export function methodLabel(method: PaymentMethod): string {
  return METHOD_LABELS[method] ?? method;
}

/** What can still be refunded on a payment. Only successful payments can be refunded. */
export function refundableAmount(payment: PaymentDto): number {
  if (payment.status !== 'Success') return 0;
  return Math.max(0, Math.round((payment.amount - payment.refundedAmount) * 100) / 100);
}

export class PaymentUtil {
  static methodLabel = methodLabel;
  static refundableAmount = refundableAmount;
}