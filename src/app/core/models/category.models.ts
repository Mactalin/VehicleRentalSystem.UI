import { AdditionalChargeType } from './enums';

export interface PricingDto {
  hourlyPrice: number;
  dailyPrice: number;
  weeklyPrice: number;
  securityDeposit: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  pricing?: PricingDto;
}

export interface SaveCategoryDto {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface SeasonalPricingDto {
  id: number;
  categoryId: number;
  name: string;
  startDate: string;   // yyyy-MM-dd
  endDate: string;     // yyyy-MM-dd
  multiplier: number;  // 1.25 = 25% higher
  isActive: boolean;
}

export interface SaveSeasonalPricingDto {
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  isActive: boolean;
}

export interface AdditionalChargeDto {
  id: number;
  name: string;
  chargeType: AdditionalChargeType;
  amount: number;
  description?: string;
  isActive: boolean;
}

export interface SaveAdditionalChargeDto {
  name: string;
  chargeType: AdditionalChargeType;
  amount: number;
  description?: string;
  isActive: boolean;
}

export interface PriceQuoteDto {
  vehicleId: number;
  registrationNumber: string;
  categoryName: string;
  from: string;
  to: string;
  totalHours: number;
  weeks: number;
  days: number;
  hours: number;
  baseAmount: number;
  seasonalMultiplier: number;
  seasonalAdjustment: number;
  rentalAmount: number;
  securityDeposit: number;
  totalPayable: number;
}