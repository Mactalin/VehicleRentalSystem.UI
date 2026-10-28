import { FuelType, TransmissionType } from './enums';
import { BookingQuoteDto } from './booking.models';

export interface VehicleSearchRequest {
  branchId?: number;
  city?: string;
  from?: string;                // UTC ISO; give both from and to, or neither
  to?: string;
  categoryId?: number;
  minPrice?: number;            // compared with the daily price
  maxPrice?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  minSeatingCapacity?: number;
  page?: number;
  pageSize?: number;
}

export interface VehicleSearchResultDto {
  vehicleId: number;
  name: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seatingCapacity: number;

  categoryId: number;
  categoryName: string;
  branchId: number;
  branchName: string;
  branchCity: string;
  imageUrl?: string;

  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  securityDeposit: number;

  seasonalMultiplier?: number;  // only when dates were searched
  quote?: BookingQuoteDto;      // only when dates were searched
}

export interface AvailabilityDto {
  vehicleId: number;
  from: string;
  to: string;
  isAvailable: boolean;
}