import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VehicleStatus } from '../models/enums';
import {
  ExpiringDocumentDto, SaveVehicleDocumentDto, SaveVehicleDto,
  VehicleDocumentDto, VehicleDto, VehicleImageDto
} from '../models/vehicle.models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vehicles`;

  getAll(filter: { status?: VehicleStatus; branchId?: number; categoryId?: number; includeInactive?: boolean } = {}) {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<VehicleDto[]>(this.base, { params });
  }
  getById(id: number) { return this.http.get<VehicleDto>(`${this.base}/${id}`); }
  create(dto: SaveVehicleDto) { return this.http.post<VehicleDto>(this.base, dto); }
  update(id: number, dto: SaveVehicleDto) { return this.http.put<VehicleDto>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
  updateStatus(id: number, status: VehicleStatus) {
    return this.http.patch<void>(`${this.base}/${id}/status`, { status });
  }

  addImage(id: number, imageUrl: string, isPrimary = false) {
    return this.http.post<VehicleImageDto>(`${this.base}/${id}/images`, { imageUrl, isPrimary });
  }
  setPrimaryImage(id: number, imageId: number) {
    return this.http.patch<void>(`${this.base}/${id}/images/${imageId}/primary`, {});
  }
  deleteImage(id: number, imageId: number) {
    return this.http.delete<void>(`${this.base}/${id}/images/${imageId}`);
  }

  getExpiringDocuments(withinDays = 30) {
    return this.http.get<ExpiringDocumentDto[]>(`${this.base}/documents/expiring`, { params: { withinDays } });
  }
  addDocument(id: number, dto: SaveVehicleDocumentDto) {
    return this.http.post<VehicleDocumentDto>(`${this.base}/${id}/documents`, dto);
  }
  updateDocument(id: number, docId: number, dto: SaveVehicleDocumentDto) {
    return this.http.put<VehicleDocumentDto>(`${this.base}/${id}/documents/${docId}`, dto);
  }
  deleteDocument(id: number, docId: number) {
    return this.http.delete<void>(`${this.base}/${id}/documents/${docId}`);
  }
}