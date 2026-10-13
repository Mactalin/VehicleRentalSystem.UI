import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponseDto, ChangePasswordDto, LoginDto, RegisterDto, UserDto } from '../models/auth.models';
import { RoleName } from '../models/enums';

const TOKEN_KEY = 'vr_token';
const USER_KEY = 'vr_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private base = `${environment.apiUrl}/auth`;

  private _user = signal<UserDto | null>(this.readUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user() && !!this.token);
  readonly role = computed(() => this._user()?.role ?? null);

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  login(dto: LoginDto) {
    return this.http.post<AuthResponseDto>(`${this.base}/login`, dto).pipe(tap(r => this.save(r)));
  }
  register(dto: RegisterDto) {
    return this.http.post<AuthResponseDto>(`${this.base}/register`, dto).pipe(tap(r => this.save(r)));
  }
  changePassword(dto: ChangePasswordDto) {
    return this.http.post<void>(`${this.base}/change-password`, dto);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  updateUser(user: UserDto) {
    if (this.isBrowser) localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  hasRole(...roles: RoleName[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  private save(res: AuthResponseDto) {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    this._user.set(res.user);
  }

  private readUser(): UserDto | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}