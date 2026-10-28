export type DriverStatus = 'Available' | 'OnDuty' | 'OffDuty' | 'Inactive';

export interface Driver {
  id: number;
  fullName: string;
  licenseNumber: string;
  phone: string;
  email?: string | null;
  licenseExpiryDate?: string | null;
  experienceYears: number;
  chargePerDay: number;
  chargePerHour?: number | null;
  status: DriverStatus;
  isActive: boolean;
  notes?: string | null;
}

export type CreateDriver = Omit<Driver, 'id' | 'status' | 'isActive'>;
export type UpdateDriver = Omit<Driver, 'id'>;
