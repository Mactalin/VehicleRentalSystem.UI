import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer, CreateOffer, UpdateOffer } from '../models/offer';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly url = `${environment.apiUrl}/Offers`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Offer[]> { return this.http.get<Offer[]>(this.url); }
  getRunning(): Observable<Offer[]> { return this.http.get<Offer[]>(`${this.url}/running`); }
  getById(id: number): Observable<Offer> { return this.http.get<Offer>(`${this.url}/${id}`); }
  create(dto: CreateOffer): Observable<Offer> { return this.http.post<Offer>(this.url, dto); }
  update(id: number, dto: UpdateOffer): Observable<Offer> { return this.http.put<Offer>(`${this.url}/${id}`, dto); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
