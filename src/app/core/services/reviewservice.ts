import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewSummary, CreateReview } from '../models/review';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly url = `${environment.apiUrl}/Reviews`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Review[]> { return this.http.get<Review[]>(this.url); }
  getById(id: number): Observable<Review> { return this.http.get<Review>(`${this.url}/${id}`); }
  getByVehicle(vehicleId: number): Observable<Review[]> { return this.http.get<Review[]>(`${this.url}/vehicle/${vehicleId}`); }
  getVehicleSummary(vehicleId: number): Observable<ReviewSummary> { return this.http.get<ReviewSummary>(`${this.url}/vehicle/${vehicleId}/summary`); }
  getByDriver(driverId: number): Observable<Review[]> { return this.http.get<Review[]>(`${this.url}/driver/${driverId}`); }
  getDriverSummary(driverId: number): Observable<ReviewSummary> { return this.http.get<ReviewSummary>(`${this.url}/driver/${driverId}/summary`); }
  getByCustomer(customerId: number): Observable<Review[]> { return this.http.get<Review[]>(`${this.url}/customer/${customerId}`); }
  create(dto: CreateReview): Observable<Review> { return this.http.post<Review>(this.url, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
