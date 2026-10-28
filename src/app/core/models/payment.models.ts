import { InvoiceStatus, PaymentMethod, PaymentStatus, PaymentType, RefundStatus } from './enums';

// The server decides the amount. The client never sends it.
export interface CreatePaymentDto {
  bookingId: number;
  type: PaymentType;
  method: PaymentMethod;
}

export interface RefundRequestDto {
  paymentId: number;
  amount: number;
  reason: string;
}

export interface RefundDto {
  id: number;
  paymentId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  processedAt?: string;
}

export interface PaymentDto {
  id: number;
  bookingId: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayReference?: string;
  failureReason?: string;
  paidAt?: string;
  createdAt: string;
  refundedAmount: number;
  refunds: RefundDto[];
}

export interface SettlementDto {
  bookingId: number;
  totalAmount: number;
  rentalPaid: number;
  rentalBalance: number;
  depositPaid: number;
  depositRefunded: number;
  lateFee: number;
  damageCharge: number;
  lateFeeDue: number;
  damageChargeDue: number;
  depositToRefund: number;
  totalDue: number;
  isSettled: boolean;
}

export interface InvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineAmount: number;
  taxAmount: number;
}

export interface InvoiceDto {
  id: number;
  invoiceNumber: string;
  bookingId: number;
  bookingNumber: string;
  customerId: number;
  customerName: string;
  issuedAt: string;
  status: InvoiceStatus;
  items: InvoiceItemDto[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
}