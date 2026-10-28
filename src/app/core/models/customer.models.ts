import { CustomerStatus, KycDocumentType, VerificationStatus } from './enums';

export interface MyCustomerStatusDto {
  hasProfile: boolean;
  customerId?: number;
  status?: CustomerStatus;
  verificationStatus?: VerificationStatus;
}

export interface CreateCustomerDto {
  fullName: string;
  phone: string;
  dateOfBirth: string;          // "yyyy-MM-dd"
  address: string;
  city: string;
  state: string;
  postalCode: string;
}
export type UpdateCustomerDto = CreateCustomerDto;

export interface CustomerFilter {
  page?: number;
  pageSize?: number;
  verification?: VerificationStatus;
  status?: CustomerStatus;
  search?: string;
}

export interface CustomerSummaryDto {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  city: string;
  status: CustomerStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface KycUploadDto {
  documentType: KycDocumentType;
  documentNumber: string;
  filePath: string;
}

export interface KycDocumentDto {
  id: number;
  documentType: KycDocumentType;
  documentNumber: string;
  filePath: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface LicenceUploadDto {
  licenceNumber: string;
  issuingAuthority: string;
  vehicleClasses: string;
  issueDate: string;            // "yyyy-MM-dd"
  expiryDate: string;           // "yyyy-MM-dd"
  filePath: string;
}

export interface DrivingLicenceDto {
  id: number;
  licenceNumber: string;
  issuingAuthority: string;
  vehicleClasses: string;
  issueDate: string;
  expiryDate: string;
  filePath: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface CustomerDto {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  status: CustomerStatus;
  verificationStatus: VerificationStatus;
  kycDocuments: KycDocumentDto[];
  drivingLicences: DrivingLicenceDto[];
}

export interface ReviewDocumentDto {
  approve: boolean;
  rejectionReason?: string;     // required by the API when approve is false
}

export interface UpdateCustomerStatusDto {
  status: CustomerStatus;
}