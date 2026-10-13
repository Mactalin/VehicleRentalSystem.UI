import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AdditionalChargeDto, CategoryDto, PricingDto, SaveAdditionalChargeDto,
  SaveCategoryDto, SaveSeasonalPricingDto, SeasonalPricingDto
} from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categories`;

  // Categories
  getAll() { return this.http.get<CategoryDto[]>(this.base); }
  getById(id: number) { return this.http.get<CategoryDto>(`${this.base}/${id}`); }
  create(dto: SaveCategoryDto) { return this.http.post<CategoryDto>(this.base, dto); }
  update(id: number, dto: SaveCategoryDto) { return this.http.put<CategoryDto>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }

  // Base pricing
  getPricing(id: number) { return this.http.get<PricingDto>(`${this.base}/${id}/pricing`); }
  savePricing(id: number, dto: PricingDto) {
    return this.http.put<PricingDto>(`${this.base}/${id}/pricing`, dto);
  }

  // Seasonal pricing
  getSeasonalPricings(id: number) {
    return this.http.get<SeasonalPricingDto[]>(`${this.base}/${id}/seasonal-pricing`);
  }
  addSeasonalPricing(id: number, dto: SaveSeasonalPricingDto) {
    return this.http.post<SeasonalPricingDto>(`${this.base}/${id}/seasonal-pricing`, dto);
  }
  updateSeasonalPricing(id: number, seasonId: number, dto: SaveSeasonalPricingDto) {
    return this.http.put<SeasonalPricingDto>(`${this.base}/${id}/seasonal-pricing/${seasonId}`, dto);
  }
  deleteSeasonalPricing(id: number, seasonId: number) {
    return this.http.delete<void>(`${this.base}/${id}/seasonal-pricing/${seasonId}`);
  }

  // Additional charges
  getAdditionalCharges() {
    return this.http.get<AdditionalChargeDto[]>(`${this.base}/additional-charges`);
  }
  addAdditionalCharge(dto: SaveAdditionalChargeDto) {
    return this.http.post<AdditionalChargeDto>(`${this.base}/additional-charges`, dto);
  }
  updateAdditionalCharge(chargeId: number, dto: SaveAdditionalChargeDto) {
    return this.http.put<AdditionalChargeDto>(`${this.base}/additional-charges/${chargeId}`, dto);
  }
  deleteAdditionalCharge(chargeId: number) {
    return this.http.delete<void>(`${this.base}/additional-charges/${chargeId}`);
  }
}