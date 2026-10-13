export type DayOfWeekName =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'
  | 'Friday' | 'Saturday' | 'Sunday';

export interface OperatingHourDto {
  dayOfWeek: DayOfWeekName;
  openTime: string;    // "08:00:00"
  closeTime: string;   // "20:00:00"
  isClosed: boolean;
}

export interface BranchDto {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isActive: boolean;
  operatingHours: OperatingHourDto[];
}

export interface SaveBranchDto {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isActive: boolean;
}