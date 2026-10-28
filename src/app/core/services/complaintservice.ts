import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Complaint, ComplaintStatus, CreateComplaint, RespondToComplaint } from '../models/complaint';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly url = `${environment.apiUrl}/Complaints`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Complaint[]> { return this.http.get<Complaint[]>(this.url); }
  getById(id: number): Observable<Complaint> { return this.http.get<Complaint>(`${this.url}/${id}`); }
  getByStatus(status: ComplaintStatus): Observable<Complaint[]> { return this.http.get<Complaint[]>(`${this.url}/status/${status}`); }
  getByCustomer(customerId: number): Observable<Complaint[]> { return this.http.get<Complaint[]>(`${this.url}/customer/${customerId}`); }
  create(dto: CreateComplaint): Observable<Complaint> { return this.http.post<Complaint>(this.url, dto); }
  respond(id: number, dto: RespondToComplaint): Observable<Complaint> { return this.http.put<Complaint>(`${this.url}/${id}/respond`, dto); }
  resolve(id: number): Observable<Complaint> { return this.http.put<Complaint>(`${this.url}/${id}/resolve`, {}); }
  close(id: number): Observable<Complaint> { return this.http.put<Complaint>(`${this.url}/${id}/close`, {}); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
