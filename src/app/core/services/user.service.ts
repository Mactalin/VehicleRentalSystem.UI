import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserDto } from '../models/auth.models';
import { CreateUserDto, UpdateProfileDto, UpdateUserRoleDto } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  // Any logged-in user
  getProfile() { return this.http.get<UserDto>(`${this.base}/profile`); }
  updateProfile(dto: UpdateProfileDto) { return this.http.put<UserDto>(`${this.base}/profile`, dto); }

  // Admin / Manager
  getAll() { return this.http.get<UserDto[]>(this.base); }
  getById(id: number) { return this.http.get<UserDto>(`${this.base}/${id}`); }

  // Admin only
  getRoles() { return this.http.get<string[]>(`${this.base}/roles`); }
  create(dto: CreateUserDto) { return this.http.post<UserDto>(this.base, dto); }
  updateRole(id: number, dto: UpdateUserRoleDto) {
    return this.http.put<UserDto>(`${this.base}/${id}/role`, dto);
  }
  activate(id: number) { return this.http.patch<void>(`${this.base}/${id}/activate`, {}); }
  deactivate(id: number) { return this.http.patch<void>(`${this.base}/${id}/deactivate`, {}); }
}