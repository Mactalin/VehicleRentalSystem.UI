import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, CreateCoupon, ValidateCoupon, CouponValidationResult } from '../models/coupon';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly url = `${environment.apiUrl}/Coupons`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Coupon[]> { return this.http.get<Coupon[]>(this.url); }
  getActive(): Observable<Coupon[]> { return this.http.get<Coupon[]>(`${this.url}/active`); }
  getById(id: number): Observable<Coupon> { return this.http.get<Coupon>(`${this.url}/${id}`); }
  getByCode(code: string): Observable<Coupon> { return this.http.get<Coupon>(`${this.url}/code/${code}`); }
  create(dto: CreateCoupon): Observable<Coupon> { return this.http.post<Coupon>(this.url, dto); }
  update(id: number, dto: CreateCoupon): Observable<Coupon> { return this.http.put<Coupon>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  validate(dto: ValidateCoupon): Observable<CouponValidationResult> { return this.http.post<CouponValidationResult>(`${this.url}/validate`, dto); }
}
