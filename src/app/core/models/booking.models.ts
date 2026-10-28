import type { BookingStatus, PaymentStatus, PaymentType, RateType } from './enums';
import type { PaymentDto } from './payment.models';

export type { BookingStatus, RateType } from './enums';

export interface BookingSummaryDto {
  id: number;
  bookingNumber: string;
  customerName?: string;
  vehicleId: number;
  vehicleName: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  totalAmount: number;
}

export interface BookingQuoteRequestDto {
  vehicleId: number;
  startAt: string;
  endAt: string;
  rateType?: RateType;
}

export interface BookingQuoteDto {
  vehicleId: number;
  rateType: RateType;
  hourlyRate: number;
  dailyRate: number;
  rateApplied: number;
  units: number;
  baseAmount: number;
  addOnAmount: number;
  discountAmount: number;
  taxAmount: number;
  securityDeposit: number;
  advanceAmount: number;
  subtotal: number;
  fees: number;
  total?: number;
  totalAmount: number;
  currency?: string;
}

export interface CreateBookingDto {
  vehicleId: number;
  dropBranchId?: number;
  startAt: string;
  endAt: string;
  rateType?: RateType;
  notes?: string;
}

export interface ModifyBookingDto {
  startAt?: string;
  endAt?: string;
  newStartAt?: string;
  newEndAt?: string;
  notes?: string;
  reason?: string;
}

export interface CancelBookingDto {
  reason: string;
}

export interface BookingDto {
  id: number;
  bookingNumber: string;
  customerId?: number;
  customerName?: string;
  vehicleId: number;
  vehicleName?: string;
  vehicleRegistration?: string;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  pendingExpiresAt?: string;
  pickupBranchId?: number;
  dropBranchId?: number;
  actualPickupAt?: string;
  actualReturnAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rateType?: 'Hourly' | 'Daily';
  rateApplied: number;
  baseAmount: number;
  addOnAmount: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number;
  securityDeposit: number;
  advanceAmount: number;
  totalAmount: number;
  amountPaid: number;
  depositPaid: number;
  remainingBalance: number;
  lateFee: number;
  damageCharge: number;
  payments: PaymentDto[];
  inspections: InspectionDto[];
}

export interface InspectionDto {
  id?: number;
  type?: 'Pickup' | 'Return';
  inspectedAt?: string;
  odometerReading: number;
  fuelLevelPercent: number;
  damageNotes?: string;
  photoUrls?: string;
  damageCharge: number;
}

export interface PickupDto {
  odometerReading: number;
  fuelLevelPercent: number;
  damageNotes?: string;
  photoUrls?: string;
  damageCharge?: number;
}

export interface ReturnDto {
  odometerReading: number;
  fuelLevelPercent: number;
  damageNotes?: string;
  photoUrls?: string;
  damageCharge?: number;
}

export interface ReturnSummaryDto {
  bookingId: number;
  returnedAt?: string;
  totalAmount: number;
  dueAmount?: number;
  refundAmount?: number;
  lateFee: number;
  damageCharge: number;
  damageFee?: number;
  status: BookingStatus;
  settlement: {
    totalDue: number;
    depositToRefund: number;
  };
}

export interface CancellationPreviewDto {
  bookingId: number;
  canCancel: boolean;
  refundAmount: number;
}

export interface CancellationResultDto {
  bookingId: number;
  status: BookingStatus;
  refundAmount: number;
}
