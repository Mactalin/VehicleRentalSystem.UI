import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateDriver, Driver, UpdateDriver } from '../models/driver';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly url = `${environment.apiUrl}/Drivers`;
  private readonly requestTimeoutMs = 3000;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Driver[]> { return this.withTimeout(this.http.get<Driver[]>(this.url)); }
  getAvailable(): Observable<Driver[]> { return this.withTimeout(this.http.get<Driver[]>(`${this.url}/available`)); }
  getById(id: number): Observable<Driver> { return this.withTimeout(this.http.get<Driver>(`${this.url}/${id}`)); }
  create(dto: CreateDriver): Observable<Driver> { return this.withTimeout(this.http.post<Driver>(this.url, dto)); }
  update(id: number, dto: UpdateDriver): Observable<Driver> {
    return this.withTimeout(this.http.put<Driver>(`${this.url}/${id}`, dto));
  }
  delete(id: number): Observable<void> { return this.withTimeout(this.http.delete<void>(`${this.url}/${id}`)); }

  private withTimeout<T>(request: Observable<T>): Observable<T> {
    return request.pipe(timeout({ first: this.requestTimeoutMs }));
  }
}
