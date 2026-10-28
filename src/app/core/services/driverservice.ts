import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateDriver, Driver, UpdateDriver } from '../models/driver';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly url = `${environment.apiUrl}/Drivers`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Driver[]> { return this.http.get<Driver[]>(this.url); }
  getAvailable(): Observable<Driver[]> { return this.http.get<Driver[]>(`${this.url}/available`); }
  getById(id: number): Observable<Driver> { return this.http.get<Driver>(`${this.url}/${id}`); }
  create(dto: CreateDriver): Observable<Driver> { return this.http.post<Driver>(this.url, dto); }
  update(id: number, dto: UpdateDriver): Observable<Driver> { return this.http.put<Driver>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
