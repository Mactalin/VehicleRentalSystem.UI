import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RevenueReport, BookingReport, VehicleUtilization, CustomerReport, PaymentReport, MaintenanceReport, BranchPerformance } from '../models/report';


@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly url = `${environment.apiUrl}/Reports`;
  constructor(private http: HttpClient) {}

  private range(from?: string, to?: string): HttpParams {
    let p = new HttpParams();
    if (from) p = p.set('from', from);
    if (to) p = p.set('to', to);
    return p;
  }

  getRevenue(from?: string, to?: string): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.url}/revenue`, { params: this.range(from, to) });
  }
  getBookings(from?: string, to?: string): Observable<BookingReport> {
    return this.http.get<BookingReport>(`${this.url}/bookings`, { params: this.range(from, to) });
  }
  getVehicleUtilization(): Observable<VehicleUtilization[]> {
    return this.http.get<VehicleUtilization[]>(`${this.url}/vehicle-utilization`);
  }
  getCustomers(): Observable<CustomerReport> {
    return this.http.get<CustomerReport>(`${this.url}/customers`);
  }
  getPayments(from?: string, to?: string): Observable<PaymentReport> {
    return this.http.get<PaymentReport>(`${this.url}/payments`, { params: this.range(from, to) });
  }
  getMaintenance(): Observable<MaintenanceReport> {
    return this.http.get<MaintenanceReport>(`${this.url}/maintenance`);
  }
  getBranchPerformance(): Observable<BranchPerformance[]> {
    return this.http.get<BranchPerformance[]>(`${this.url}/branch-performance`);
  }
}
