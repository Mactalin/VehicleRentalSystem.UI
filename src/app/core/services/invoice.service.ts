import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { InvoiceDto } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);

  getByBooking(bookingId: number) {
    return this.http.get<InvoiceDto>(`${environment.apiUrl}/bookings/${bookingId}/invoice`);
  }
}