import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BookingSummaryDto } from '../models/booking.models';
import {
  CreateCustomerDto, CustomerDto, CustomerFilter, CustomerSummaryDto, DrivingLicenceDto,
  KycDocumentDto, KycUploadDto, LicenceUploadDto, MyCustomerStatusDto, ReviewDocumentDto,
  UpdateCustomerDto, UpdateCustomerStatusDto
} from '../models/customer.models';
import { PagedResult } from '../models/paged-result.model';
import { toHttpParams } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/customers`;

  // Customer (the logged-in user)
  getMyStatus() { return this.http.get<MyCustomerStatusDto>(`${this.base}/me/status`); }
  getMine() { return this.http.get<CustomerDto>(`${this.base}/me`); }
  register(dto: CreateCustomerDto) { return this.http.post<CustomerDto>(this.base, dto); }
  update(id: number, dto: UpdateCustomerDto) { return this.http.put<CustomerDto>(`${this.base}/${id}`, dto); }

  addKyc(id: number, dto: KycUploadDto) {
    return this.http.post<KycDocumentDto>(`${this.base}/${id}/kyc`, dto);
  }
  addLicence(id: number, dto: LicenceUploadDto) {
    return this.http.post<DrivingLicenceDto>(`${this.base}/${id}/licences`, dto);
  }
  getRentalHistory(id: number) {
    return this.http.get<BookingSummaryDto[]>(`${this.base}/${id}/bookings`);
  }

  // Staff and above
  getAll(filter: CustomerFilter = {}) {
    return this.http.get<PagedResult<CustomerSummaryDto>>(this.base, { params: toHttpParams(filter) });
  }
  getById(id: number) { return this.http.get<CustomerDto>(`${this.base}/${id}`); }

  reviewKyc(customerId: number, documentId: number, dto: ReviewDocumentDto) {
    return this.http.patch<CustomerDto>(`${this.base}/${customerId}/kyc/${documentId}/review`, dto);
  }
  reviewLicence(customerId: number, licenceId: number, dto: ReviewDocumentDto) {
    return this.http.patch<CustomerDto>(`${this.base}/${customerId}/licences/${licenceId}/review`, dto);
  }

  // Admin only
  setStatus(id: number, dto: UpdateCustomerStatusDto) {
    return this.http.patch<CustomerDto>(`${this.base}/${id}/status`, dto);
  }
}