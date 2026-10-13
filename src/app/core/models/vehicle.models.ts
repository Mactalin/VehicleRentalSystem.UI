import { DocumentType, FuelType, TransmissionType, VehicleStatus } from './enums';

export interface VehicleDto {
  id: number; registrationNumber: string;
  categoryId: number; categoryName: string;
  branchId: number; branchName: string;
  make: string; model: string; year: number; color?: string;
  fuelType: FuelType; transmission: TransmissionType;
  seatingCapacity: number; odometerKm: number;
  status: VehicleStatus; isActive: boolean;
  primaryImageUrl?: string;
  images: VehicleImageDto[]; documents: VehicleDocumentDto[];
}
export type SaveVehicleDto = Omit<VehicleDto,
  'id' | 'categoryName' | 'branchName' | 'status' | 'isActive' |
  'primaryImageUrl' | 'images' | 'documents'>;

export interface VehicleImageDto { id: number; imageUrl: string; isPrimary: boolean; }
export interface VehicleDocumentDto {
  id: number; documentType: DocumentType; documentNumber: string;
  issueDate: string; expiryDate: string; fileUrl?: string;
  daysToExpiry: number; isExpired: boolean;
}
export interface SaveVehicleDocumentDto {
  documentType: DocumentType; documentNumber: string;
  issueDate: string; expiryDate: string; fileUrl?: string;
}
export interface ExpiringDocumentDto {
  documentId: number; vehicleId: number; registrationNumber: string;
  documentType: DocumentType; documentNumber: string;
  expiryDate: string; daysToExpiry: number;
}