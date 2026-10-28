import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  BookingDto, BookingQuoteDto, BookingQuoteRequestDto, BookingSummaryDto, CancelBookingDto,
  CancellationPreviewDto, CancellationResultDto, CreateBookingDto, ModifyBookingDto,
  PickupDto, ReturnDto, ReturnSummaryDto
} from '../models/booking.models';
import { BookingStatus } from '../models/enums';
import { toHttpParams } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/bookings`;

  // Customer
  getQuote(dto: BookingQuoteRequestDto) { return this.http.post<BookingQuoteDto>(`${this.base}/quote`, dto); }
  create(dto: CreateBookingDto) { return this.http.post<BookingDto>(this.base, dto); }
  getMine() { return this.http.get<BookingSummaryDto[]>(`${this.base}/my`); }
  getById(id: number) { return this.http.get<BookingDto>(`${this.base}/${id}`); }
  modify(id: number, dto: ModifyBookingDto) { return this.http.patch<BookingDto>(`${this.base}/${id}`, dto); }

  getCancelPreview(id: number) {
    return this.http.get<CancellationPreviewDto>(`${this.base}/${id}/cancel-preview`);
  }
  cancel(id: number, dto: CancelBookingDto) {
    return this.http.post<CancellationResultDto>(`${this.base}/${id}/cancel`, dto);
  }

  // Staff and above
  getByStatus(status: BookingStatus) {
    return this.http.get<BookingSummaryDto[]>(this.base, { params: toHttpParams({ status }) });
  }
  pickup(id: number, dto: PickupDto) { return this.http.post<BookingDto>(`${this.base}/${id}/pickup`, dto); }
  return(id: number, dto: ReturnDto) { return this.http.post<ReturnSummaryDto>(`${this.base}/${id}/return`, dto); }
  complete(id: number) { return this.http.post<BookingDto>(`${this.base}/${id}/complete`, {}); }
}