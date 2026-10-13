import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BranchDto, OperatingHourDto, SaveBranchDto } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/branches`;

  getAll(city?: string) {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    return this.http.get<BranchDto[]>(this.base, { params });
  }
  getById(id: number) { return this.http.get<BranchDto>(`${this.base}/${id}`); }
  create(dto: SaveBranchDto) { return this.http.post<BranchDto>(this.base, dto); }
  update(id: number, dto: SaveBranchDto) { return this.http.put<BranchDto>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }

  getOperatingHours(id: number) {
    return this.http.get<OperatingHourDto[]>(`${this.base}/${id}/operating-hours`);
  }

  // The API expects times as HH:mm:ss, so "08:00" from a time input is padded
  setOperatingHours(id: number, hours: OperatingHourDto[]) {
    const body = hours.map(h => ({
      ...h,
      openTime: this.toTimeSpan(h.openTime),
      closeTime: this.toTimeSpan(h.closeTime)
    }));
    return this.http.put<OperatingHourDto[]>(`${this.base}/${id}/operating-hours`, body);
  }

  private toTimeSpan(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }
}