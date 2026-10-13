import { MaintenanceStatus, MaintenanceType } from './enums';

export interface MaintenanceDto {
  id: number;
  vehicleId: number;
  registrationNumber?: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;      // yyyy-MM-dd
  completedDate?: string;
  cost: number;
  vendorName?: string;
  status: MaintenanceStatus;
}

export interface SaveMaintenanceDto {
  vehicleId: number;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  cost: number;
  vendorName?: string;
}

export interface UpdateMaintenanceStatusDto {
  status: MaintenanceStatus;
}

export interface CompleteMaintenanceDto {
  completedDate?: string;
  cost: number;
}