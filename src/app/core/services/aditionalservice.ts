import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdditionalService, ServiceType, CreateAdditionalService, UpdateAdditionalService } from '../models/additional-service';

@Injectable({ providedIn: 'root' })
export class AdditionalServiceApi {
  private readonly url = `${environment.apiUrl}/AdditionalServices`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<AdditionalService[]> { return this.http.get<AdditionalService[]>(this.url); }
  getActive(): Observable<AdditionalService[]> { return this.http.get<AdditionalService[]>(`${this.url}/active`); }
  getById(id: number): Observable<AdditionalService> { return this.http.get<AdditionalService>(`${this.url}/${id}`); }
  getByType(type: ServiceType): Observable<AdditionalService[]> { return this.http.get<AdditionalService[]>(`${this.url}/type/${type}`); }
  create(dto: CreateAdditionalService): Observable<AdditionalService> { return this.http.post<AdditionalService>(this.url, dto); }
  update(id: number, dto: UpdateAdditionalService): Observable<AdditionalService> { return this.http.put<AdditionalService>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
