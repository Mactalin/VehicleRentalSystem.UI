import type { BookingStatus } from './enums';

export interface BookingSummaryDto {
  id: number;
  bookingNumber: string;
  customerName?: string;        // filled on the staff list
  vehicleId: number;
  vehicleName: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  totalAmount: number;
}