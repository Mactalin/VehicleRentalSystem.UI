import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MaintenanceStatus } from '../models/enums';
import {
  CompleteMaintenanceDto, MaintenanceDto, SaveMaintenanceDto
} from '../models/maintenance.models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/maintenance`;

  getById(id: number) { return this.http.get<MaintenanceDto>(`${this.base}/${id}`); }
  getByVehicle(vehicleId: number) {
    return this.http.get<MaintenanceDto[]>(`${this.base}/vehicle/${vehicleId}`);
  }
  getByStatus(status: MaintenanceStatus) {
    return this.http.get<MaintenanceDto[]>(`${this.base}/status/${status}`);
  }
  getUpcoming(withinDays = 30) {
    const params = new HttpParams().set('withinDays', withinDays);
    return this.http.get<MaintenanceDto[]>(`${this.base}/upcoming`, { params });
  }
  getTotalCost(vehicleId: number) {
    return this.http.get<number>(`${this.base}/vehicle/${vehicleId}/total-cost`);
  }

  create(dto: SaveMaintenanceDto) { return this.http.post<MaintenanceDto>(this.base, dto); }
  update(id: number, dto: SaveMaintenanceDto) {
    return this.http.put<MaintenanceDto>(`${this.base}/${id}`, dto);
  }

  // Start (InProgress) or Cancel
  updateStatus(id: number, status: MaintenanceStatus) {
    return this.http.patch<MaintenanceDto>(`${this.base}/${id}/status`, { status });
  }

  // Finish the job and record the final cost
  complete(id: number, dto: CompleteMaintenanceDto) {
    return this.http.patch<MaintenanceDto>(`${this.base}/${id}/complete`, dto);
  }

  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}