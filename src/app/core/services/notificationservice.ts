import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification, CreateNotification, TriggerNotification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly url = `${environment.apiUrl}/Notifications`;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppNotification[]> { return this.http.get<AppNotification[]>(this.url); }
  getById(id: number): Observable<AppNotification> { return this.http.get<AppNotification>(`${this.url}/${id}`); }
  getByUser(userId: number): Observable<AppNotification[]> { return this.http.get<AppNotification[]>(`${this.url}/user/${userId}`); }
  getUnreadByUser(userId: number): Observable<AppNotification[]> { return this.http.get<AppNotification[]>(`${this.url}/user/${userId}/unread`); }
  getUnreadCount(userId: number): Observable<{ count: number }> { return this.http.get<{ count: number }>(`${this.url}/user/${userId}/unread/count`); }

  refreshUnreadCount(userId: number): Observable<number> {
    return this.getUnreadCount(userId).pipe(
      map(response => response.count),
      tap(count => this.setUnreadCount(count)),
      catchError(() => {
        this.setUnreadCount(0);
        return of(0);
      })
    );
  }

  setUnreadCount(count: number): void {
    this.unreadCountSubject.next(Math.max(0, count));
  }

  create(dto: CreateNotification): Observable<AppNotification> { return this.http.post<AppNotification>(this.url, dto); }
  trigger(dto: TriggerNotification): Observable<{ message: string }> { return this.http.post<{ message: string }>(`${this.url}/trigger`, dto); }
  markAsRead(id: number): Observable<void> { return this.http.put<void>(`${this.url}/${id}/read`, {}); }
  markAllAsRead(userId: number): Observable<void> { return this.http.put<void>(`${this.url}/user/${userId}/read-all`, {}); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
