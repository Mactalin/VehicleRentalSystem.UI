import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PriceQuoteDto } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pricing`;

  // from / to: ISO date-time strings, e.g. "2026-10-15T09:00"
  getQuote(vehicleId: number, from: string, to: string) {
    const params = new HttpParams()
      .set('vehicleId', vehicleId)
      .set('from', from)
      .set('to', to);
    return this.http.get<PriceQuoteDto>(`${this.base}/quote`, { params });
  }
}