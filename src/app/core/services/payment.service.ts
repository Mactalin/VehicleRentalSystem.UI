import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreatePaymentDto, PaymentDto, RefundDto, RefundRequestDto, SettlementDto } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  // The API answers 402 with the payment in the body when the gateway declines it
  create(dto: CreatePaymentDto) { return this.http.post<PaymentDto>(this.base, dto); }

  getByBooking(bookingId: number) { return this.http.get<PaymentDto[]>(`${this.base}/booking/${bookingId}`); }
  getSettlement(bookingId: number) {
    return this.http.get<SettlementDto>(`${this.base}/booking/${bookingId}/settlement`);
  }
  getByCustomer(customerId: number) {
    return this.http.get<PaymentDto[]>(`${environment.apiUrl}/customers/${customerId}/payments`);
  }

  // Admin and Manager
  refund(dto: RefundRequestDto) { return this.http.post<RefundDto>(`${this.base}/refund`, dto); }
}