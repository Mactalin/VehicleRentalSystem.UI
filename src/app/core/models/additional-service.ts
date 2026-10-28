export type ServiceType = 'GPS' | 'ChildSeat' | 'ExtraInsurance' | 'Accessory' | 'Other';

export interface AdditionalService {
  id: number;
  name: string;
  description?: string;
  price: number;
  type: ServiceType;
  isActive: boolean;
  maxQuantityPerBooking?: number;
}

export interface CreateAdditionalService {
  name: string;
  description?: string;
  price: number;
  type: ServiceType;
  maxQuantityPerBooking?: number;
}

export interface UpdateAdditionalService extends CreateAdditionalService {
  isActive: boolean;
}
